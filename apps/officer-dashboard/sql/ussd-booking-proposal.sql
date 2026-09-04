-- =============================================================================
-- Proposal: let P4's USSD simulator create bookings
--
-- Raised by P3 while integrating the officer desk with the USSD flow. It is a
-- shared-schema change, so it wants P1's eyes before it becomes permanent.
--
-- THE PROBLEM
--   A farmer dialling *99# is not signed in, so `auth.uid()` is null and the
--   RLS policy on `bookings` refuses the insert:
--       POST /rest/v1/bookings -> 42501 new row violates row-level security
--   P4 currently calls an edge function `create-booking` that was never
--   deployed (404). Their code catches that and falls back to mock data, so a
--   USSD booking looks successful, is never written, and never reaches the
--   officer desk.
--
-- WHY A FUNCTION AND NOT A POLICY
--   An INSERT policy for `anon` would let anyone holding the public key forge
--   bookings against any centre and any slot. This mirrors what the schema
--   already does for status changes: a SECURITY DEFINER function that does its
--   own validation, so the privilege lives in one auditable place instead of
--   being handed to every anonymous caller.
--
-- P2 NEEDS THIS TOO. Their farmer app has the same problem, verified against
-- the live project: it invokes the same missing edge function (404), falls back
-- to a direct INSERT that RLS refuses (42501), then falls back again to local
-- browser state — catching each failure with console.warn. So a farmer books
-- "successfully", gets a token and a QR, and nothing was ever written. The
-- officer desk shows an empty queue and nobody sees an error.
--
-- Hence p_created_via: one booking-creation path for both channels rather than
-- two functions that drift.
--
-- AFTER THIS LANDS, P4 changes one call:
--     - await client.functions.invoke('create-booking', { body: {...} })
--     + await client.rpc('create_ussd_booking', {
--     +     p_phone_number: phone,
--     +     p_center_id: centerId,        -- must be a real UUID, not 'c1-blr'
--     +     p_slot_id: slotId,            -- must be a real UUID, not 's2'
--     +     p_crop_quantity_kg: cropQuantityKg,
--     +   })
-- =============================================================================

-- Adding a parameter changes the signature, so the old one is dropped rather
-- than overloaded — two functions differing only by a defaulted argument make
-- every call ambiguous.
DROP FUNCTION IF EXISTS create_ussd_booking(TEXT, UUID, UUID, NUMERIC, TEXT);

CREATE OR REPLACE FUNCTION create_ussd_booking(
    p_phone_number     TEXT,
    p_center_id        UUID,
    p_slot_id          UUID,
    p_crop_quantity_kg NUMERIC DEFAULT NULL,
    p_full_name        TEXT    DEFAULT NULL,
    p_created_via      TEXT    DEFAULT 'ussd'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_centre    mandi_centers%ROWTYPE;
    v_slot      slots%ROWTYPE;
    v_booking   bookings%ROWTYPE;
    v_farmer_id UUID;
    v_phone     TEXT;
    v_prefix    TEXT;
    v_token     TEXT;
    v_seq       INT;
    v_position  INT;
BEGIN
    -- A USSD caller types ten digits. Accept +91 or 91 in front of them.
    v_phone := regexp_replace(COALESCE(p_phone_number, ''), '\D', '', 'g');
    IF length(v_phone) = 12 AND left(v_phone, 2) = '91' THEN
        v_phone := right(v_phone, 10);
    END IF;
    IF length(v_phone) <> 10 THEN
        RAISE EXCEPTION 'A 10-digit mobile number is required'
            USING ERRCODE = '22023';
    END IF;

    SELECT * INTO v_centre FROM mandi_centers WHERE center_id = p_center_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No such procurement centre' USING ERRCODE = '23503';
    END IF;

    SELECT * INTO v_slot FROM slots WHERE slot_id = p_slot_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No such slot' USING ERRCODE = '23503';
    END IF;

    -- Guards, because this function is callable by anon and is therefore the
    -- only thing standing between the public key and the bookings table.
    IF v_slot.center_id <> p_center_id THEN
        RAISE EXCEPTION 'That slot belongs to a different centre' USING ERRCODE = '22023';
    END IF;
    IF v_slot.slot_date < current_date THEN
        RAISE EXCEPTION 'That slot is in the past' USING ERRCODE = '22023';
    END IF;
    IF v_slot.booked_count >= v_slot.max_farmers THEN
        RAISE EXCEPTION 'That slot is full' USING ERRCODE = '23514';
    END IF;
    IF p_crop_quantity_kg IS NOT NULL
       AND (p_crop_quantity_kg <= 0 OR p_crop_quantity_kg > 100000) THEN
        RAISE EXCEPTION 'Crop quantity is out of range' USING ERRCODE = '22023';
    END IF;
    IF p_created_via NOT IN ('web', 'ussd') THEN
        RAISE EXCEPTION 'created_via must be web or ussd' USING ERRCODE = '22023';
    END IF;

    -- A feature-phone farmer has no account, so identity is the phone number.
    SELECT farmer_id INTO v_farmer_id
      FROM farmers WHERE phone_number = v_phone LIMIT 1;

    IF v_farmer_id IS NULL THEN
        INSERT INTO farmers (farmer_id, full_name, phone_number, district, state, preferred_lang)
        VALUES (
            gen_random_uuid(),
            COALESCE(NULLIF(btrim(p_full_name), ''), 'USSD caller ' || right(v_phone, 4)),
            v_phone,
            v_centre.district,
            v_centre.state,
            'kn'
        )
        RETURNING farmer_id INTO v_farmer_id;
    END IF;

    -- Re-dialling *99# should not silently issue a second token for the same slot.
    IF EXISTS (
        SELECT 1 FROM bookings
         WHERE farmer_id = v_farmer_id
           AND slot_id = p_slot_id
           AND status NOT IN ('CANCELLED', 'NO_SHOW', 'COMPLETED')
    ) THEN
        RAISE EXCEPTION 'This number already holds a token for that slot'
            USING ERRCODE = '23505';
    END IF;

    -- Token: three letters of the centre, then the next free number that day.
    -- The loop matters — two callers can reach this at the same moment.
    v_prefix := upper(substring(regexp_replace(v_centre.center_name, '[^A-Za-z]', '', 'g') FROM 1 FOR 3));

    SELECT count(*) INTO v_seq
      FROM bookings b JOIN slots s ON s.slot_id = b.slot_id
     WHERE b.center_id = p_center_id AND s.slot_date = v_slot.slot_date;

    LOOP
        v_seq := v_seq + 1;
        v_token := v_prefix || '-' || lpad(v_seq::TEXT, 4, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM bookings WHERE token_number = v_token);
    END LOOP;

    -- Rank among today's still-waiting tokens at this centre. The officer desk
    -- recomputes this on every load anyway, so it is a starting figure only.
    SELECT count(*) + 1 INTO v_position
      FROM bookings b JOIN slots s ON s.slot_id = b.slot_id
     WHERE b.center_id = p_center_id
       AND s.slot_date = v_slot.slot_date
       AND b.status = 'BOOKED';

    INSERT INTO bookings (
        booking_id, farmer_id, slot_id, center_id, token_number,
        crop_quantity_kg, status, queue_position, predicted_wait_mins, created_via
    ) VALUES (
        gen_random_uuid(), v_farmer_id, p_slot_id, p_center_id, v_token,
        p_crop_quantity_kg, 'BOOKED', v_position,
        COALESCE(v_centre.avg_processing_min, 15) * greatest(v_position - 1, 0),
        p_created_via
    )
    RETURNING * INTO v_booking;

    UPDATE slots SET booked_count = booked_count + 1 WHERE slot_id = p_slot_id;

    -- USSD reads the token and centre name back to the caller over SMS.
    RETURN to_jsonb(v_booking) || jsonb_build_object(
        'phone_number', v_phone,
        'center_name',  v_centre.center_name,
        'slot_date',    v_slot.slot_date,
        'slot_start_time', v_slot.slot_start_time
    );
END;
$$;

-- Grant to the anonymous role only through this function; the bookings table
-- itself stays closed.
REVOKE ALL ON FUNCTION create_ussd_booking(TEXT, UUID, UUID, NUMERIC, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_ussd_booking(TEXT, UUID, UUID, NUMERIC, TEXT, TEXT) TO anon, authenticated;

-- =============================================================================
-- WORTH SAYING OUT LOUD
--
-- Anything anon can call that writes rows is a spam surface: someone with the
-- public key could fill a slot with junk tokens. The guards above cap the
-- damage (real centre, real slot, not in the past, not full, one token per
-- number per slot) and that is proportionate for a demo. For anything real,
-- put an OTP in front of it or rate-limit by phone.
--
-- P4 also needs to stop using slugs. Their client has center_id 'c1-blr' and
-- slot_id 's2'; both columns are UUIDs with foreign keys, so those values
-- cannot be stored whatever this function does. P2 already standardised on
-- c0000000-0000-0000-0000-00000000000N — Bengaluru is ...0001.
--
-- Token prefixes here are derived from the centre name (Bengaluru -> BEN),
-- whereas P2 hand-picks airport-style codes (BLR). Cosmetic: the officer desk
-- matches on booking_id first and the exact token second, so the two coexist.
-- Worth agreeing one convention before the demo if the tokens are read aloud.
-- =============================================================================
