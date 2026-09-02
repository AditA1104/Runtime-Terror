# AgriQ — Mandi Officer Dashboard (P3)

The desk an APMC officer works from: live queue, one-click checkpoints, QR
check-in, quota config, and today's throughput numbers.

```bash
npm install
npm run dev      # http://localhost:5174
```

With no `.env.local`, the app runs on a **seeded local dataset** — 5 centres,
~90 bookings spread across every stage. Nothing to install, nothing to connect.
A "Demo data" badge in the header tells you which mode you're in.

## Tests

```bash
npm test                          # unit — the pure logic in src/lib
npx playwright install chromium   # once
npm run test:e2e                  # end-to-end — or test:e2e:ui to watch
```

**Unit (Vitest, 72 tests).** `src/lib/*.test.ts` — the state machine, the
metric derivations, the formatters, and QR payload parsing. The bottleneck rule
("most farmer-minutes, not the longest queue") and the check that BOOKED is
never blamed both live in `metrics.test.ts`.

**End-to-end (Playwright, 7 specs).** The desk in mock mode: sign-in gate, queue
table, filters, search, the three tabs, advancing a farmer through a checkpoint,
and the cross-tab BroadcastChannel sync. They start their own dev server on port
5175, so they don't collide with a hand-run `npm run dev`. The seeded dataset is
deterministic (fixed-seed PRNG in `src/data/mock.ts`), so they assert on real
token numbers rather than shapes.

Both run in CI on any PR touching this app —
`.github/workflows/officer-dashboard.yml`.

> The Supabase branch of `repository.ts` has **no coverage** — it cannot run
> until the RLS ask below lands. That is the module's main untested surface.

## The QR token pass

P2 encodes the farmer's pass as JSON with a `type` discriminator:

```json
{
  "type": "AGRIQ_TOKEN",
  "booking_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "token_number": "NSK-0231",
  "phone_number": "9876543210",
  "center_id": "c1-nsk",
  "slot_date": "2026-09-03"
}
```

`parseScan()` in `src/lib/scan.ts` returns `null` for anything else — another
app's QR code, a bare token, a half-decoded pass — so the desk says "not an
AgriQ token pass" instead of hunting for a token the payload never held.

`booking_id` is what the queue matches on, with `token_number` as the fallback.
`center_id` and `slot_date` are **never** used to match; they only let the desk
name what is wrong when a scan finds nothing — "booked for 2026-09-03" or
"booked at another centre" rather than a bare "not found".

## Going live

```bash
cp .env.example .env.local   # then fill in the two values from P1/P6
```

The moment `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set,
`src/data/repository.ts` swaps the mock implementation for the Supabase one.
No component changes — that seam is the whole point of the file.

## Layout

| Path | What lives there |
|---|---|
| `src/lib/types.ts` | Row shapes, hand-mirrored from `agriq_schema.sql` |
| `src/lib/status.ts` | The state machine + checkpoint definitions |
| `src/lib/metrics.ts` | Pure derivations — turnaround, bottleneck, capacity |
| `src/lib/scan.ts` | QR pass payload (camera-free, so it's unit-tested) |
| `src/data/repository.ts` | **The only file that talks to Supabase** |
| `src/data/mock.ts` | Seeded stand-in dataset |
| `src/components/queue/` | Queue desk, checkpoint dialog, status badges |
| `src/components/metrics/` | Stat tiles, capacity meter, bottleneck panel |

## Rules this module follows

- **Never writes `bookings.status` directly.** Every stage change goes through
  `supabase.rpc('transition_booking_status', ...)`, which enforces the order and
  writes `status_log`. See `repository.advance()`.
- **No new table or column names.** `types.ts` mirrors the locked schema; if
  something is missing it gets raised with P1, not invented here.
- **Never the `service_role` key.** The schema comment suggests it for the
  officer dashboard, but this is a Vite app — everything in the bundle ships to
  the browser, and that key bypasses RLS for every table. See below.

## Live queue position is computed, not read

`bookings.queue_position` is stamped once when the booking is created and never
decrements, so it does not answer "how many are ahead of me right now". The
dashboard ranks the still-waiting rows on each load instead
(`withLivePositions()` in `repository.ts`). Worth P2 knowing — the farmer's
token pass has the same problem.

---

# Status — 2 Sept 2026

P1 has delivered a live project, an `officers` table, and 3 test officer
logins. Verified against it directly with the anon key (credentials are in
`.env.local`, which is gitignored — ask P1 if you need them):

**Working.** All six tables exist and respond. `officers` is there, so the
proposal below was implemented. RLS scopes correctly for an unauthenticated
caller — `mandi_centers` and `slots` read, while `bookings`, `farmers` and
`status_log` all return `[]`.

**One gotcha:** P1 circulated the URL as
`https://<ref>.supabase.co/rest/v1/`. `createClient()` needs the bare origin —
supabase-js appends its own paths, so the REST suffix breaks every call.

## Four things still block the handover test plan

| # | Blocker | Owner |
|---|---|---|
| 1 | **Phone auth is off.** `/auth/v1/settings` reports `"phone": false` (`"email": true`). The "sign in via phone OTP" path cannot work for anyone, farmers included. Needs the provider enabled, or email + temp password for the 3 test accounts — **temp password, not magic link**, since a link needs an inbox to click it from. | P1 |
| 2 | **Only one centre exists.** `mandi_centers` holds a single row, `Test Mandi`. The plan's test 2 ("Officer 3 on a different center → confirm they cannot see Officer 1/2's bookings") has no second centre to scope against, so it cannot prove anything yet. | P1 |
| 3 | **No data for today.** The only `slots` row is dated `2026-08-31`. The desk queries today's slots by design (`useQueue` → `listQueue(centerId, todayISO())`), so the queue renders empty even fully authenticated. Needs slots + bookings seeded for the current date. | P1 |
| 4 | **This app has no auth code.** `SignIn.tsx` is a name box and a dropdown — deliberately, because officer auth was the thing blocked. There is no `supabase.auth` call in the module yet. All three tests need this built first, and it is also what turns `status_log.changed_by` from typed free text into the officer's real UID. | P3 (next task) |

Settled on the way: `mandi_centers.center_id` really is a UUID here
(`affc5449-8ea1-4da3-b1f4-0246eee93595`), which confirms the QR pass's
`"center_id": "c1-nsk"` is not a real centre id — that one is P2's to fix.

---

# ⚠️ Blocking ask for P1 — officer access is closed by RLS

> **Mostly delivered as of 2 Sept** — kept for the reasoning and the SQL. The
> `officers` table and the policies below now exist; what remains is in the
> table above.

As the schema stands, this dashboard **cannot read or write anything** against a
live Supabase project. Four separate things block it:

| # | Table | Problem |
|---|---|---|
| 1 | `bookings` | Only policy is `auth.uid() = farmer_id`. An officer is not the farmer → `SELECT` returns 0 rows, `UPDATE` is denied. |
| 2 | `farmers` | Same farmer-only policy → the queue's name/phone join comes back empty. |
| 3 | `status_log` | RLS on, **no policy at all**. `transition_booking_status()` is not `SECURITY DEFINER`, so it runs as the caller and its `INSERT INTO status_log` is denied — every transition fails. |
| 4 | `mandi_centers` | Only a `SELECT` policy. The quota panel's `UPDATE` is denied. |

Point 3 bites *everyone*, not just me — P2's booking flow and P4's USSD writes
hit the same wall the moment they call the function without `service_role`.

## Suggested fix

```sql
-- 1. Let the state machine run with the privileges it needs, so every caller
--    (web, USSD, officer desk) can transition without a service_role key.
--    The function already validates the transition, so this stays safe.
CREATE OR REPLACE FUNCTION transition_booking_status(
    p_booking_id UUID,
    p_new_status TEXT,
    p_changed_by TEXT DEFAULT 'system'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
-- ...body unchanged...
$$;

-- 2. An officer identity. Rows here are created by hand for the demo.
CREATE TABLE officers (
    officer_id  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT NOT NULL,
    center_id   UUID REFERENCES mandi_centers(center_id),
    created_at  TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
CREATE POLICY officer_self_read ON officers FOR SELECT USING (auth.uid() = officer_id);

CREATE OR REPLACE FUNCTION is_officer() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
    SELECT EXISTS (SELECT 1 FROM officers WHERE officer_id = auth.uid());
$$;

-- 3. Officers can see the queue and record measurements.
CREATE POLICY officer_read_bookings   ON bookings      FOR SELECT USING (is_officer());
CREATE POLICY officer_write_bookings  ON bookings      FOR UPDATE USING (is_officer());
CREATE POLICY officer_read_farmers    ON farmers       FOR SELECT USING (is_officer());
CREATE POLICY officer_read_log        ON status_log    FOR SELECT USING (is_officer());
CREATE POLICY officer_write_centers   ON mandi_centers FOR UPDATE USING (is_officer());
```

Then create one Supabase auth user per demo officer and insert a matching
`officers` row.

**If that's too much before 4 Sept**, the smaller version is: keep point 1
(`SECURITY DEFINER` — that one is needed regardless), and replace `is_officer()`
with `auth.role() = 'authenticated'` in the four policies. The officer desk then
just needs any signed-in user. Less correct, unblocks the demo, one line to
tighten later.

Until either lands, this module stays on its seeded dataset — which is why that
mode exists and is demo-quality rather than a throwaway.

## Also worth confirming

- **Realtime on `bookings`** — P6's checklist item. Without it the desk falls
  back to a 30-second poll (there's a Live/Polling indicator in the toolbar).
- **`center_id` on the QR pass (P2 / P1)** — the confirmed pass carries
  `"center_id": "c1-nsk"`, but `mandi_centers.center_id` is a **UUID** in the
  locked schema. Either the pass is carrying a human-readable slug that does
  not exist as a column, or it is sample data. Nothing breaks today — the desk
  only uses this field to explain a scan that missed, and never to match — but
  it should line up before the two are wired together.
- **Officer name on `status_log.changed_by`** — currently free text typed at
  sign-in. Once `officers` exists this should be the officer's UUID or username.
