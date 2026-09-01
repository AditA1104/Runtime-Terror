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

# ⚠️ Blocking ask for P1 — officer access is closed by RLS

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
- **QR payload shape (P2)** — `parseScan()` in `src/components/scan/QrScanner.tsx`
  currently accepts a bare token, a bare `booking_id` UUID, or a JSON object
  with either. Tell me which one the pass actually encodes and I'll narrow it.
- **Officer name on `status_log.changed_by`** — currently free text typed at
  sign-in. Once `officers` exists this should be the officer's UUID or username.
