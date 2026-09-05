-- =============================================================================
-- Seed bookable slots for every centre
--
-- Only Test Mandi has slots; the other four have none. That is not cosmetic —
-- P2's farmer app queries `slots_available` for the chosen centre, gets an
-- empty list, and falls back to generating slots client-side with synthetic
-- ids like 'slot-f4d7-2026-09-04-0'. The booking then fails on a UUID cast:
--
--   invalid input syntax for type uuid: "slot-f4d7-2026-09-04-0"
--
-- So four of the five centres are unbookable, and before the error logging was
-- fixed that failure was swallowed and shown to the farmer as success.
--
-- Idempotent: ON CONFLICT against the (center_id, slot_date, slot_start_time)
-- unique key, so running it twice adds nothing and existing bookings are
-- untouched.
-- =============================================================================

INSERT INTO slots (slot_id, center_id, slot_date, slot_start_time, slot_end_time, max_farmers, booked_count)
SELECT
    gen_random_uuid(),
    c.center_id,
    d::date,
    make_time(h, 0, 0),
    make_time(h + 1, 0, 0),
    COALESCE(c.hourly_intake_limit, 10),
    0
FROM mandi_centers c
CROSS JOIN generate_series(current_date, current_date + 13, interval '1 day') AS d
CROSS JOIN generate_series(
    EXTRACT(hour FROM COALESCE(c.operating_start, TIME '08:00'))::int,
    EXTRACT(hour FROM COALESCE(c.operating_end,   TIME '18:00'))::int - 1
) AS h
ON CONFLICT (center_id, slot_date, slot_start_time) DO NOTHING;

-- What each centre now offers.
SELECT c.center_name, count(s.slot_id) AS slots, min(s.slot_date) AS from_date, max(s.slot_date) AS to_date
  FROM mandi_centers c
  LEFT JOIN slots s ON s.center_id = c.center_id
 GROUP BY c.center_name
 ORDER BY c.center_name;
