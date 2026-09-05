# Integration status

Written 5 Sept 2026 by P3, after running the modules together against the live
Supabase project for the first time. Everything below was verified by calling
the real project, not by reading code.

> **The pattern worth knowing before anything else.** Every module wraps its
> Supabase calls in `try/catch` and falls back to local data on failure. That is
> reasonable design, but three modules were failing *every* live call and
> falling back silently — a farmer booked, saw a token and a QR pass, and
> nothing was stored. Nothing errors. Nothing looks wrong. The only symptom is
> an officer's queue that stays empty. If you change a data call, verify it
> against the live project rather than trusting that the UI still works.

## Where each seam stands

| Seam | State |
|---|---|
| Officer desk ↔ database | Working. All seven repository methods verified live. |
| Farmer app → database | Working. Was writing nothing at all until 5 Sept. |
| USSD → database | Backend ready; P4's client still needs three changes. |
| Farmer QR → officer scanner | Working. P2's payload pinned in `scan.test.ts`. |
| Predictive engine → farmer app | Working. Congestion was invisible to farmers until 5 Sept. |

## What was broken, and why it was invisible

**1. Nobody could write a booking.** A farmer is not signed in, so `auth.uid()`
is null and the RLS policy on `bookings` refuses an insert (42501). Both the
farmer app and the USSD simulator worked around this by calling an edge
function `create-booking` that was never deployed (404), then falling back to
local state.

Fixed with `create_ussd_booking`, a `SECURITY DEFINER` RPC that anon can call
and that validates centre, slot, capacity and duplicates itself. It takes
`p_created_via` so `'web'` and `'ussd'` share one path.
See `apps/officer-dashboard/sql/ussd-booking-proposal.sql`.

The farmer app now calls it (PR #5). That version re-fetches the booking with
its joined relations afterwards, so the returned shape still matches the
`Booking` type the rest of the app expects — worth keeping if this is ever
refactored.

**2. Four of five centres were unbookable.** Only Test Mandi had slots. The
farmer app asks `slots_available` for the chosen centre, gets nothing, and
generates slots client-side with ids like `slot-f4d7-2026-09-04-0` — which then
fail a UUID cast. Fixed by `apps/officer-dashboard/sql/seed-slots.sql`.

**3. Farmers never saw congestion.** Fixed 5 Sept. `get_best_selling_days` is not
`SECURITY DEFINER`, so it runs as the caller. It reads `daily_booking_load`, a
view over `bookings`, which anon cannot read — so a farmer always gets
`load_ratio: 0` and "🟢 Low crowd" on every day, including one that is 9%
booked. Measured side by side:

    as anon     daily_booking_load: 0 rows   load_ratio: 0, 0, 0, 0
    as officer  daily_booking_load: 5 rows   load_ratio: 0.09, 0.02, 0, 0

The price half of smart dispatch worked; the crowd-steering half was invisible
to exactly the people it exists to steer. Fixed by marking the function
`SECURITY DEFINER` with a pinned `search_path`, which is narrower than granting
anon access to the view — see
`apps/officer-dashboard/sql/predictive-visibility-proposal.sql` for why.
Verified afterwards that farmers see real load ratios and that `bookings`
itself stays closed to anon.

## Still open

**P4 — the USSD simulator writes nothing.** Three changes in
`ussd-simulator/supabase-client.js`:

1. `functions.invoke('create-booking')` → `rpc('create_ussd_booking')`
2. Centre and slot ids are slugs (`'c1-blr'`, `'s2'`). Both columns are UUIDs
   with foreign keys, so those values can never be stored. P2 standardised on
   `c0000000-0000-0000-0000-00000000000N`; Bengaluru is `…0001`.
3. `getBookingStatus` filters on `bookings.phone_number`, which does not exist.
   It is on `farmers` — join, or match on `token_number`.

**P4 is the only module still not writing to the database.**

**P5 — the SQL in the repo is stale.** The deployed `get_best_selling_days`
returns a `predicted_price` column that `predictive_engine/sql/` does not have,
so running that file fails with `42P13: cannot change return type`. The
database is ahead of the repo; the file should be updated to match, not the
other way round.

## Conventions worth not rediscovering

- **The project URL is the bare origin.** `https://<ref>.supabase.co`, no
  `/rest/v1/` — `createClient()` appends its own paths.
- **Phone auth is off** and needs paid Twilio. Officers sign in by email and
  password.
- **`officers.phone_number` is NOT NULL** and absent from the original schema
  proposal.
- **`slots` is unique on `(center_id, slot_date, slot_start_time)`**, one slot
  per centre per hour. Re-dating slots collides; re-point the bookings instead.
- **Dates are local, not UTC.** The desk queries `todayISO()`. In IST a
  `toISOString()` date is a day behind for five and a half hours every night.

## Re-running the checks

    cd apps/officer-dashboard
    node scripts/verify-live.mjs --email officer1@agriq.test --password '...'

Signs in, confirms `officers.officer_id` is the auth UID, asserts no other
centre's bookings leak, resolves a QR pass against the live queue, and with
`--transition` advances one booking and checks `status_log.changed_by`.
