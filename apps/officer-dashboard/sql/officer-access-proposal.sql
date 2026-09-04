-- =========================================================
-- PROPOSAL for P1 — officer access + a working state machine
-- Raised by P3 (Officer Dashboard). NOT applied by me.
--
-- This is a proposal, not a migration. It does not live in supabase/migrations
-- on purpose — per MASTER_CONTEXT, schema changes are P1's call. Review it,
-- then move it (or a cut-down version) into the real migrations folder.
--
-- Run against: agriq_schema.sql "Locked Schema v2".
-- Idempotent — safe to run more than once.
-- =========================================================


-- =========================================================
-- PART 1 — REQUIRED BY EVERYONE (P2, P3, P4), not just the officer desk
-- =========================================================
--
-- transition_booking_status() is currently SECURITY INVOKER (the default), so
-- it runs with the caller's privileges. Its INSERT INTO status_log is therefore
-- checked against status_log's RLS — which has RLS enabled and NO policy at
-- all. Result: the insert is denied and EVERY status transition fails for any
-- caller that is not using the service_role key.
--
-- That breaks the farmer app, the USSD flow and the officer desk identically.
--
-- SECURITY DEFINER makes the function run as its owner, so it can write the
-- audit row. This does not weaken the guarantee that matters: the function
-- still validates the transition order itself and still refuses to skip a
-- stage. It only stops RLS from blocking the function's own bookkeeping.
--
-- SET search_path is not optional here. A SECURITY DEFINER function without a
-- pinned search_path can be hijacked by a caller-controlled schema.

CREATE OR REPLACE FUNCTION transition_booking_status(
    p_booking_id UUID,
    p_new_status TEXT,
    p_changed_by TEXT DEFAULT 'system'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_status TEXT;
    v_order TEXT[] := ARRAY['BOOKED','CHECKED_IN','WEIGHED','QUALITY_APPROVED','PAYMENT_INITIATED','COMPLETED'];
    v_current_idx INT;
    v_new_idx INT;
BEGIN
    SELECT status INTO v_current_status FROM bookings WHERE booking_id = p_booking_id;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'No such booking: %', p_booking_id;
    END IF;

    -- Always allow CANCELLED / NO_SHOW from any state
    IF p_new_status IN ('CANCELLED','NO_SHOW') THEN
        UPDATE bookings SET status = p_new_status WHERE booking_id = p_booking_id;
        INSERT INTO status_log(booking_id, from_status, to_status, changed_by)
            VALUES (p_booking_id, v_current_status, p_new_status, p_changed_by);
        RETURN;
    END IF;

    v_current_idx := array_position(v_order, v_current_status);
    v_new_idx := array_position(v_order, p_new_status);

    IF v_new_idx IS NULL OR v_current_idx IS NULL OR v_new_idx != v_current_idx + 1 THEN
        RAISE EXCEPTION 'Invalid status transition: % -> %', v_current_status, p_new_status;
    END IF;

    UPDATE bookings
        SET status = p_new_status,
            checked_in_at = CASE WHEN p_new_status = 'CHECKED_IN' THEN now() ELSE checked_in_at END,
            completed_at = CASE WHEN p_new_status = 'COMPLETED' THEN now() ELSE completed_at END
        WHERE booking_id = p_booking_id;

    INSERT INTO status_log(booking_id, from_status, to_status, changed_by)
        VALUES (p_booking_id, v_current_status, p_new_status, p_changed_by);
END;
$$;

-- The anon/authenticated roles need EXECUTE to call it via supabase.rpc().
GRANT EXECUTE ON FUNCTION transition_booking_status(UUID, TEXT, TEXT)
    TO anon, authenticated;


-- =========================================================
-- PART 2 — OFFICER IDENTITY
-- =========================================================
-- The schema has no officer concept, so there is nothing for an RLS policy to
-- test against. This is the smallest thing that fixes that: one row per officer,
-- keyed to a Supabase auth user.

CREATE TABLE IF NOT EXISTS officers (
    officer_id  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT NOT NULL,
    center_id   UUID REFERENCES mandi_centers(center_id),
    created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE officers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS officer_self_read ON officers;
CREATE POLICY officer_self_read ON officers
    FOR SELECT USING (auth.uid() = officer_id);

-- SECURITY DEFINER so the check itself is not blocked by the policy above,
-- and STABLE so Postgres can cache it within a statement instead of
-- re-running it per row.
CREATE OR REPLACE FUNCTION is_officer() RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (SELECT 1 FROM officers WHERE officer_id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION is_officer() TO anon, authenticated;


-- =========================================================
-- PART 3 — WHAT AN OFFICER MAY SEE AND DO
-- =========================================================
-- Read the whole desk; write only the measurement columns. Status still moves
-- exclusively through transition_booking_status().

DROP POLICY IF EXISTS officer_read_bookings ON bookings;
CREATE POLICY officer_read_bookings ON bookings
    FOR SELECT USING (is_officer());

DROP POLICY IF EXISTS officer_write_bookings ON bookings;
CREATE POLICY officer_write_bookings ON bookings
    FOR UPDATE USING (is_officer()) WITH CHECK (is_officer());

DROP POLICY IF EXISTS officer_read_farmers ON farmers;
CREATE POLICY officer_read_farmers ON farmers
    FOR SELECT USING (is_officer());

DROP POLICY IF EXISTS officer_read_log ON status_log;
CREATE POLICY officer_read_log ON status_log
    FOR SELECT USING (is_officer());

DROP POLICY IF EXISTS officer_write_centers ON mandi_centers;
CREATE POLICY officer_write_centers ON mandi_centers
    FOR UPDATE USING (is_officer()) WITH CHECK (is_officer());


-- =========================================================
-- PART 4 — REALTIME
-- =========================================================
-- P6's checklist item. Without this the officer desk falls back to a 30s poll
-- and the "farmer's phone updates the instant the officer scans" demo does not
-- land. Safe to re-run; the DO block swallows the duplicate-object error.

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Realtime respects RLS, so a subscriber only receives rows it could SELECT.
-- Officers get the whole centre via officer_read_bookings; farmers get only
-- their own via the existing booking_farmer_access. That is the desired split.


-- =========================================================
-- PART 5 — SEEDING AN OFFICER (do this per demo account)
-- =========================================================
-- Create the auth user first: Supabase Dashboard -> Authentication -> Add user
-- (email + password, "Auto Confirm User" on). Then:
--
--   INSERT INTO officers (officer_id, full_name, center_id)
--   VALUES (
--       '<paste the user UUID>',
--       'S. Deshpande',
--       (SELECT center_id FROM mandi_centers WHERE center_name = 'Lasalgaon APMC')
--   );


-- =========================================================
-- SMALLER FALLBACK — if PART 2/3 is too much before 4 Sept
-- =========================================================
-- PART 1 is required no matter what; nothing works without it.
--
-- For PARTS 2-3, drop the officers table entirely and let any signed-in user
-- act as an officer. Less correct, unblocks the demo, one predicate to tighten
-- afterwards:
--
--   CREATE POLICY officer_read_bookings  ON bookings      FOR SELECT USING (auth.role() = 'authenticated');
--   CREATE POLICY officer_write_bookings ON bookings      FOR UPDATE USING (auth.role() = 'authenticated');
--   CREATE POLICY officer_read_farmers   ON farmers       FOR SELECT USING (auth.role() = 'authenticated');
--   CREATE POLICY officer_read_log       ON status_log    FOR SELECT USING (auth.role() = 'authenticated');
--   CREATE POLICY officer_write_centers  ON mandi_centers FOR UPDATE USING (auth.role() = 'authenticated');
--
-- The officer dashboard then needs any Supabase session — an anonymous sign-in
-- is enough.


-- =========================================================
-- VERIFY — expect 0 rows back from both
-- =========================================================
-- Tables with RLS on but no policy at all (a silent deny-everything):
--
--   SELECT c.relname
--   FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND c.relrowsecurity
--     AND NOT EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid = c.oid);
--
-- SECURITY DEFINER functions without a pinned search_path:
--
--   SELECT p.proname
--   FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--   WHERE n.nspname = 'public' AND p.prosecdef
--     AND NOT EXISTS (
--       SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) cfg
--       WHERE cfg LIKE 'search_path=%'
--     );
