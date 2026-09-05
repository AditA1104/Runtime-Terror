-- =============================================================================
-- Applied 5 Sept 2026: put `bookings` into the realtime publication
--
-- THE PROBLEM
--   The officer desk subscribes to postgres_changes on `bookings` so a farmer
--   booking anywhere appears at the desk without a refresh. The subscription
--   reached SUBSCRIBED, the desk showed "Live", and no event ever arrived.
--
--   `bookings` was never added to the supabase_realtime publication. Supabase
--   accepts a subscription to a table that publishes nothing, so this fails in
--   the worst possible way: everything reports success and nothing happens.
--   The 30-second poll in useQueue masked it — updates arrived eventually, so
--   it looked like lag rather than a missing feature.
--
--   Worth noting how weak the earlier check was. Confirming the channel
--   reached SUBSCRIBED was taken as proof realtime worked. Connecting and
--   receiving are different things; only the second is worth asserting.
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- Postgres sends only the primary key on UPDATE unless told otherwise. The
-- desk's subscription filters on center_id, and that filter is matched against
-- what Postgres sends — so without this, INSERTs would arrive and UPDATEs
-- would be silently dropped. A farmer appearing but never advancing is harder
-- to diagnose than nothing working at all.
ALTER TABLE bookings REPLICA IDENTITY FULL;

-- =============================================================================
-- VERIFIED afterwards, subscribing as an officer and writing from a separate
-- client, which is what the farmer app and the USSD gateway are:
--
--   INSERT KHA-0008 BOOKED
--   UPDATE KHA-0008 CHECKED_IN
--
-- Both delivered in under a second.
-- =============================================================================
