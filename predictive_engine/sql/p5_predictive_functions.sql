-- =========================================================
-- AgriQ (Runtime-Terror) — SIH 2026 — PS 26032
-- P5 Predictive Engine & Smart Dispatch Functions
-- Target: PostgreSQL / Supabase
--
-- SINGLE SOURCE OF TRUTH: PostgreSQL OWNS "LIVE" RE-SCORING.
-- get_best_selling_days() recomputes the congestion penalty
-- from the daily_booking_load view dynamically at query time
-- and generates matching, canonical reason text.
-- =========================================================

-- 1. Helper function: Compute single adjusted score
CREATE OR REPLACE FUNCTION compute_smart_dispatch_score(
    p_price_trend_score NUMERIC,
    p_load_ratio NUMERIC,
    p_penalty_weight NUMERIC DEFAULT 25.0
) RETURNS NUMERIC AS $$
DECLARE
    v_penalty NUMERIC;
    v_adjusted NUMERIC;
BEGIN
    v_penalty := LEAST(50.0, GREATEST(0.0, COALESCE(p_load_ratio, 0.0) * p_penalty_weight));
    v_adjusted := COALESCE(p_price_trend_score, 50.0) - v_penalty;
    RETURN GREATEST(5.0, LEAST(100.0, ROUND(v_adjusted, 1)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 2. Helper function: Canonical Reason Text Generator in SQL
-- Unifies text generation across live RPCs and batch table refreshes.
-- Thresholds strictly align with traffic light bands:
--   Score >= 70.0 -> GREEN  ("⭐ Recommended: ")
--   Score >= 45.0 -> YELLOW ("✓ Moderate / Fair: ")
--   Score < 45.0  -> RED    ("⚠️ Avoid / Busy: ")
CREATE OR REPLACE FUNCTION generate_smart_reason_text(
    p_price_trend_score NUMERIC,
    p_load_ratio NUMERIC,
    p_best_day_score NUMERIC
) RETURNS TEXT AS $$
DECLARE
    v_badge TEXT;
    v_price_text TEXT;
    v_crowd_text TEXT;
    v_load_pct INT;
BEGIN
    -- 1. Badge (Strictly aligned with traffic light bands)
    IF p_best_day_score >= 70.0 THEN
        v_badge := '⭐ Recommended: ';
    ELSIF p_best_day_score >= 45.0 THEN
        v_badge := '✓ Moderate / Fair: ';
    ELSE
        v_badge := '⚠️ Avoid / Busy: ';
    END IF;

    -- 2. Price Trend component
    IF p_price_trend_score >= 70.0 THEN
        v_price_text := '📈 Rising price trend';
    ELSIF p_price_trend_score >= 50.0 THEN
        v_price_text := '↗️ Favorable price';
    ELSIF p_price_trend_score >= 35.0 THEN
        v_price_text := '➡️ Stable rate';
    ELSE
        v_price_text := '📉 Softening prices';
    END IF;

    -- 3. Crowd / Load component
    v_load_pct := ROUND(COALESCE(p_load_ratio, 0.0) * 100)::INT;
    IF p_load_ratio <= 0.30 THEN
        v_crowd_text := '🟢 Low crowd (' || v_load_pct || '% booked, minimal wait)';
    ELSIF p_load_ratio <= 0.65 THEN
        v_crowd_text := '🟡 Normal rush (' || v_load_pct || '% booked)';
    ELSIF p_load_ratio <= 0.85 THEN
        v_crowd_text := '🟠 Heavy booking (' || v_load_pct || '% filled, wait ~45-60m)';
    ELSE
        v_crowd_text := '🔴 High congestion (' || v_load_pct || '% capacity booked)';
    END IF;

    RETURN v_badge || v_price_text || ' • ' || v_crowd_text;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- 3. Query function for Farmer App (P2) and USSD (P4):
-- LIVE RECOMPUTATION: Joins daily_rates_cache.price_trend_score (from P5 batch ML)
-- with live daily_booking_load.load_ratio at query time.
CREATE OR REPLACE FUNCTION get_best_selling_days(
    p_crop_type TEXT,
    p_center_id UUID DEFAULT NULL,
    p_days_ahead INT DEFAULT 7
)
RETURNS TABLE (
    forecast_date     DATE,
    day_name          TEXT,
    crop_type         TEXT,
    center_id         UUID,
    predicted_price   NUMERIC,
    price_trend_score NUMERIC,
    load_ratio        NUMERIC,
    bookings_count    BIGINT,
    best_day_score    NUMERIC,
    traffic_light     TEXT,
    reason_text       TEXT,
    is_best_day       BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH base_forecasts AS (
        SELECT
            drc.forecast_date,
            TO_CHAR(drc.forecast_date, 'Dy') AS day_name,
            drc.crop_type,
            drc.center_id,
            drc.predicted_price,
            drc.price_trend_score,
            COALESCE(dbl.load_ratio, 0.0) AS load_ratio,
            COALESCE(dbl.bookings_count, 0) AS bookings_count,
            -- LIVE RECOMPUTATION OF PENALTY TERM FROM daily_booking_load
            compute_smart_dispatch_score(
                drc.price_trend_score,
                COALESCE(dbl.load_ratio, 0.0),
                25.0
            ) AS live_best_score
        FROM daily_rates_cache drc
        LEFT JOIN daily_booking_load dbl
            ON drc.center_id = dbl.center_id
            AND drc.forecast_date = dbl.slot_date
        WHERE LOWER(drc.crop_type) = LOWER(p_crop_type)
          AND (p_center_id IS NULL OR drc.center_id = p_center_id)
          AND drc.forecast_date >= CURRENT_DATE
          AND drc.forecast_date <= CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL
    ),
    ranked AS (
        SELECT
            bf.*,
            RANK() OVER (ORDER BY bf.live_best_score DESC, bf.forecast_date ASC) as score_rank
        FROM base_forecasts bf
    )
    SELECT
        r.forecast_date,
        r.day_name,
        r.crop_type,
        r.center_id,
        r.predicted_price,
        r.price_trend_score,
        r.load_ratio,
        r.bookings_count,
        r.live_best_score AS best_day_score,
        CASE
            WHEN r.live_best_score >= 70.0 THEN 'GREEN'
            WHEN r.live_best_score >= 45.0 THEN 'YELLOW'
            ELSE 'RED'
        END AS traffic_light,
        generate_smart_reason_text(r.price_trend_score, r.load_ratio, r.live_best_score) AS reason_text,
        (r.score_rank = 1) AS is_best_day
    FROM ranked r
    ORDER BY r.forecast_date ASC;
END;
$$ LANGUAGE plpgsql STABLE;


-- 4. Maintenance Procedure:
-- Updates BOTH best_day_score AND reason_text in daily_rates_cache
-- for static reads (e.g. USSD direct SELECT queries)
CREATE OR REPLACE FUNCTION refresh_daily_rates_scores(
    p_penalty_weight NUMERIC DEFAULT 25.0
) RETURNS INTEGER AS $$
DECLARE
    v_updated_rows INTEGER;
BEGIN
    UPDATE daily_rates_cache drc
    SET
        best_day_score = compute_smart_dispatch_score(
            drc.price_trend_score,
            COALESCE(dbl.load_ratio, 0.0),
            p_penalty_weight
        ),
        reason_text = generate_smart_reason_text(
            drc.price_trend_score,
            COALESCE(dbl.load_ratio, 0.0),
            compute_smart_dispatch_score(
                drc.price_trend_score,
                COALESCE(dbl.load_ratio, 0.0),
                p_penalty_weight
            )
        ),
        updated_at = now()
    FROM (
        SELECT center_id, slot_date, load_ratio
        FROM daily_booking_load
    ) dbl
    WHERE drc.center_id = dbl.center_id
      AND drc.forecast_date = dbl.slot_date;

    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    RETURN v_updated_rows;
END;
$$ LANGUAGE plpgsql;