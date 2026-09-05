-- =============================================================================
-- Proposal: let farmers see mandi congestion
--
-- Raised by P3 while checking the predictive engine against the live project.
-- It is P5's function, so it wants their agreement before it becomes permanent.
--
-- THE PROBLEM
--   get_best_selling_days() is declared without SECURITY DEFINER, so it runs
--   with the privileges of whoever calls it. It reads daily_booking_load, a
--   view over `bookings`, and RLS does not admit anon to `bookings`.
--
--   A farmer is anon. Measured on the live project, same arguments, same
--   moment, only the caller differing:
--
--     as anon     daily_booking_load: 0 rows   load_ratio: 0, 0, 0, 0
--     as officer  daily_booking_load: 5 rows   load_ratio: 0.09, 0.02, 0, 0
--
--   So every day comes back "🟢 Low crowd (0% booked, minimal wait)" — including
--   a day that is 9% booked. The price half of smart dispatch works. The
--   crowd-steering half is invisible to precisely the people it exists to
--   steer, and it fails silently: the farmer gets a confident, wrong answer.
--
-- WHY DEFINER RATHER THAN OPENING THE VIEW
--   Granting anon SELECT on daily_booking_load would work too, but it opens the
--   view to arbitrary querying. Marking the function DEFINER exposes the same
--   information through one controlled interface that already shapes and
--   aggregates it.
--
-- WHAT THIS DISCLOSES
--   Per centre and date: a booking count and a load ratio. No farmer, no phone
--   number, no token, no individual booking. Crowd level at a public market is
--   what the feature exists to publish — a farmer deciding which day to travel
--   is the intended reader.
--
--   search_path is pinned, so the function cannot be redirected at a shadowed
--   table. Its arguments are used as query parameters, never concatenated.
--
-- REVERSIBLE
--   ALTER FUNCTION get_best_selling_days(text, uuid, integer) SECURITY INVOKER;
-- =============================================================================

ALTER FUNCTION get_best_selling_days(text, uuid, integer)
  SECURITY DEFINER
  SET search_path = public;

-- Check it from the farmer's side. load_ratio should no longer be all zeros
-- where bookings exist.
SELECT forecast_date, bookings_count, load_ratio, traffic_light, reason_text
  FROM get_best_selling_days('onion', 'affc5449-8ea1-4da3-b1f4-0246eee93595', 3);
