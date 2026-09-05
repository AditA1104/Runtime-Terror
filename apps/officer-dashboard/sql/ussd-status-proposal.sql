-- =============================================================================
-- Proposal: let a USSD caller check their own booking
--
-- Companion to create_ussd_booking. Same reasoning, same shape.
--
-- THE PROBLEM
--   P4's getBookingStatus() cannot work, for two separate reasons:
--
--   1. The query is invalid. Filtering an embedded table's column inside a
--      top-level .or() is not something PostgREST accepts:
--
--        .or(`token_number.eq.${x},farmers.phone_number.eq.${x}`)
--        -> failed to parse logic tree ((token_number.eq.X,farmers.phone_number.eq.X))
--
--   2. Even with valid syntax it would return nothing. A USSD caller is anon,
--      and RLS does not admit anon to `bookings`. Verified: reading the table
--      directly as anon returns zero rows.
--
--   So "check my booking status" fails every time, for tokens and phones alike.
--
-- WHY A FUNCTION
--   The same argument as create_ussd_booking: opening `bookings` to anon would
--   let anyone holding the public key read every farmer's phone number and
--   movements. A SECURITY DEFINER function can answer one caller's question
--   without opening the table to anyone.
--
-- WHAT IT DISCLOSES
--   One booking, to someone who already knows either its token or the phone
--   number it was booked against. The phone comes back masked to its last four
--   digits — a USSD session is read aloud on a shared handset often enough that
--   printing the whole number is worse than useless.
--
--   Knowing a token is not proof of ownership, so this is not an authorisation
--   boundary; it is the same disclosure a printed gate pass already makes. If
--   USSD ever needs to be authoritative, put an OTP in front of it.
--
-- AFTER THIS LANDS, P4 replaces the broken query with:
--     const { data, error } = await this.client
--       .rpc('get_ussd_booking_status', { p_token_or_phone: tokenOrPhone });
--     if (!error && data) return data;
-- =============================================================================

CREATE OR REPLACE FUNCTION get_ussd_booking_status(
    p_token_or_phone TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    v_input   TEXT;
    v_digits  TEXT;
    v_row     RECORD;
BEGIN
    v_input := btrim(COALESCE(p_token_or_phone, ''));
    IF v_input = '' THEN
        RAISE EXCEPTION 'A token number or mobile number is required'
            USING ERRCODE = '22023';
    END IF;

    -- Same normalisation as create_ussd_booking, so a caller who booked with
    -- +91 prefixed can look up with or without it.
    v_digits := regexp_replace(v_input, '\D', '', 'g');
    IF length(v_digits) = 12 AND left(v_digits, 2) = '91' THEN
        v_digits := right(v_digits, 10);
    END IF;

    SELECT b.booking_id, b.token_number, b.status, b.queue_position,
           b.predicted_wait_mins, b.crop_quantity_kg, b.quality_grade,
           b.payment_amount, b.created_via, b.checked_in_at, b.completed_at,
           f.full_name, f.phone_number,
           c.center_name, c.crop_type,
           s.slot_date, s.slot_start_time, s.slot_end_time
      INTO v_row
      FROM bookings b
      JOIN farmers f       ON f.farmer_id = b.farmer_id
      JOIN mandi_centers c ON c.center_id = b.center_id
      LEFT JOIN slots s    ON s.slot_id = b.slot_id
     WHERE upper(b.token_number) = upper(v_input)
        OR (length(v_digits) = 10 AND f.phone_number = v_digits)
     ORDER BY b.created_at DESC
     LIMIT 1;

    IF NOT FOUND THEN
        RETURN NULL;
    END IF;

    -- Live position: rank among today's still-waiting tokens at that centre.
    -- bookings.queue_position is stamped once at booking time and never
    -- decrements, so it is not the number to read out to a caller.
    RETURN jsonb_build_object(
        'booking_id',       v_row.booking_id,
        'token_number',     v_row.token_number,
        'status',           v_row.status,
        'farmer_name',      v_row.full_name,
        'phone_last4',      right(v_row.phone_number, 4),
        'center_name',      v_row.center_name,
        'crop_type',        v_row.crop_type,
        'slot_date',        v_row.slot_date,
        'slot_start_time',  v_row.slot_start_time,
        'slot_end_time',    v_row.slot_end_time,
        'crop_quantity_kg', v_row.crop_quantity_kg,
        'quality_grade',    v_row.quality_grade,
        'payment_amount',   v_row.payment_amount,
        'created_via',      v_row.created_via,
        'checked_in_at',    v_row.checked_in_at,
        'completed_at',     v_row.completed_at,
        'predicted_wait_mins', v_row.predicted_wait_mins,
        'live_position', (
            SELECT count(*) + 1
              FROM bookings b2
              JOIN slots s2 ON s2.slot_id = b2.slot_id
             WHERE b2.center_id = (SELECT center_id FROM bookings WHERE booking_id = v_row.booking_id)
               AND s2.slot_date = v_row.slot_date
               AND b2.status = 'BOOKED'
               AND b2.created_at < (SELECT created_at FROM bookings WHERE booking_id = v_row.booking_id)
        )
    );
END;
$$;

REVOKE ALL ON FUNCTION get_ussd_booking_status(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_ussd_booking_status(TEXT) TO anon, authenticated;
