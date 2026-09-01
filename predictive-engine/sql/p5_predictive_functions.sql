-- =========================================================
-- AgriQ (Runtime-Terror) — SIH 2026 — PS 26032
-- P5 Predictive Engine & Smart Dispatch Functions
-- Target: PostgreSQL / Supabase
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


-- 2. Query function for Farmer App (P2) and USSD (P4):
-- Returns ranked best selling days combining cached price trends with live booking load
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
            drc.price_trend_score,
            COALESCE(dbl.load_ratio, 0.0) AS load_ratio,
            COALESCE(dbl.bookings_count, 0) AS bookings_count,
            compute_smart_dispatch_score(
                drc.price_trend_score,
                COALESCE(dbl.load_ratio, 0.0),
                25.0
            ) AS live_best_score,
            drc.reason_text AS base_reason
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
        r.price_trend_score,
        r.load_ratio,
        r.bookings_count,
        r.live_best_score AS best_day_score,
        CASE
            WHEN r.live_best_score >= 70.0 THEN 'GREEN'
            WHEN r.live_best_score >= 45.0 THEN 'YELLOW'
            ELSE 'RED'
        END AS traffic_light,
        CASE
            WHEN r.load_ratio >= 0.85 THEN
                '⚠️ Heavy Mandi Congestion (' || ROUND(r.load_ratio * 100) || '% booked). Expected delay. Choose an alternative slot.'
            WHEN r.score_rank = 1 THEN
                '🌟 Best Day to Sell: Favorable price trend with optimal mandi intake capacity.'
            ELSE
                COALESCE(r.base_reason, 'Standard slot with normal wait estimate.')
        END AS reason_text,
        (r.score_rank = 1) AS is_best_day
    FROM ranked r
    ORDER BY r.forecast_date ASC;
END;
$$ LANGUAGE plpgsql STABLE;


-- 3. Batch Maintenance Procedure:
-- Periodically re-syncs best_day_score and reason_text in daily_rates_cache
-- using current load from daily_booking_load
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
