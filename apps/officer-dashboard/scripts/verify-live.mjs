/**
 * Runs P1's officer-access test plan against the live Supabase project.
 *
 *   node scripts/verify-live.mjs --email officer1@example.com --password secret
 *   node scripts/verify-live.mjs --phone 9111111111 --otp 123456
 *
 * Read-only by default. Test 3 writes a real status transition, so it only
 * runs when you pass --transition, and it advances exactly one booking by one
 * stage — the same thing clicking the button in the desk would do.
 *
 * Run it once per officer and compare the output: that is test 2. An officer
 * at another centre should see zero of the first officer's bookings.
 */
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
// The real parser the desk ships, not a copy — Node strips the types.
import { parseScan, PASS_TYPE } from "../src/lib/scan.ts"

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = resolve(HERE, "..")

// --- args -------------------------------------------------------------------
const args = {}
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i]
  if (a.startsWith("--")) args[a.slice(2)] = process.argv[i + 1]?.startsWith("--")
    ? true
    : process.argv[++i] ?? true
}

// --- env --------------------------------------------------------------------
function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const out = {}
      for (const line of readFileSync(resolve(APP, file), "utf8").split(/\r?\n/)) {
        const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line)
        if (m) out[m[1]] = m[2].trim()
      }
      if (out.VITE_SUPABASE_URL) return out
    } catch {
      /* try the next file */
    }
  }
  throw new Error("No .env.local with VITE_SUPABASE_URL found in " + APP)
}

const env = loadEnv()
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const ok = (m) => console.log("  PASS  " + m)
const bad = (m) => console.log("  FAIL  " + m)
const info = (m) => console.log("        " + m)
const head = (m) => console.log("\n" + m)

const toE164 = (p) => {
  const d = String(p).replace(/\D/g, "")
  return d.length === 10 ? `+91${d}` : `+${d}`
}

/**
 * Stops the run without process.exit(), which on Windows asserts inside libuv
 * when Supabase still holds an open socket.
 */
class Stop extends Error {}
const finish = () => {
  throw new Stop()
}

let failures = 0
const fail = (m) => {
  failures++
  bad(m)
}

// --- sign in ----------------------------------------------------------------
try {
  head("Signing in")
  let auth
  if (args.email) {
    auth = await supabase.auth.signInWithPassword({
      email: args.email,
      password: args.password,
    })
  } else if (args.phone) {
    if (!args.otp) {
      const { error } = await supabase.auth.signInWithOtp({ phone: toE164(args.phone) })
      console.log(error ? "  send failed: " + error.message : "  code sent — rerun with --otp <code>")
      process.exitCode = error ? 1 : 0
      finish()
    }
    auth = await supabase.auth.verifyOtp({
      phone: toE164(args.phone),
      token: String(args.otp),
      type: "sms",
    })
  } else {
    console.log("Pass --email/--password or --phone/--otp")
    process.exitCode = 1
    finish()
  }

  if (auth.error) {
    bad("could not sign in: " + auth.error.message)
    process.exitCode = 1
    finish()
  }
  const uid = auth.data.user.id
  ok(`signed in as ${uid}`)

  // --- officer row ------------------------------------------------------------
  head("Officer identity")
  const { data: officer, error: offErr } = await supabase
    .from("officers")
    .select("officer_id, full_name, center_id")
    .eq("officer_id", uid)
    .maybeSingle()

  if (offErr) fail("officers lookup errored: " + offErr.message)
  else if (!officer) fail("no officers row for this user — RLS will return an empty queue")
  else {
    ok(`officer row found: ${officer.full_name}`)
    info(`centre ${officer.center_id}`)
    if (officer.officer_id !== uid) fail("officer_id does not equal the auth UID")
    else ok("officer_id matches the auth UID — no separate lookup needed")
  }

  // --- test 1: can this officer see their own centre's queue? -----------------
  head("Test 1 — can this officer read bookings at their centre?")
  const today = new Date().toISOString().slice(0, 10)
  const { data: rows, error: qErr } = await supabase
    .from("bookings")
    .select("booking_id, token_number, status, center_id, slots!inner(slot_date)")
    .eq("slots.slot_date", today)

  if (qErr) fail("bookings query errored: " + qErr.message)
  else {
    const mine = rows.filter((r) => r.center_id === officer?.center_id)
    const others = rows.filter((r) => r.center_id !== officer?.center_id)
    ok(`${rows.length} booking(s) visible for ${today}`)
    info(`${mine.length} at this officer's centre, ${others.length} elsewhere`)
    if (others.length > 0) {
      fail("this officer can see bookings at OTHER centres — RLS is not scoping by centre")
      info("centres leaked: " + [...new Set(others.map((r) => r.center_id))].join(", "))
    } else {
      ok("no cross-centre rows leaked (this is half of test 2)")
    }
    if (rows.length === 0) {
      info("nothing to act on — either RLS is blocking, or no bookings exist for today")
    }
  }

  // --- test 3: transition writes the real UID --------------------------------
  head("Test 3 — does a transition log the officer's real UID?")
  const candidate = (rows ?? []).find(
    (r) => r.center_id === officer?.center_id && r.status === "BOOKED",
  )

  if (!args.transition) {
    info("skipped — pass --transition to actually advance a booking")
    if (candidate) info(`would advance ${candidate.token_number} BOOKED -> CHECKED_IN`)
  } else if (!candidate) {
    fail("no BOOKED booking at this centre today to advance")
  } else {
    const { error: rpcErr } = await supabase.rpc("transition_booking_status", {
      p_booking_id: candidate.booking_id,
      p_new_status: "CHECKED_IN",
      p_changed_by: uid,
    })
    if (rpcErr) fail("transition_booking_status failed: " + rpcErr.message)
    else {
      ok(`${candidate.token_number} advanced to CHECKED_IN`)
      const { data: log, error: logErr } = await supabase
        .from("status_log")
        .select("to_status, changed_by, created_at")
        .eq("booking_id", candidate.booking_id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (logErr) fail("could not read status_log back: " + logErr.message)
      else if (!log?.length) fail("no status_log row was written")
      else if (log[0].changed_by === uid) ok(`status_log.changed_by is the real UID (${uid})`)
      else fail(`status_log.changed_by is "${log[0].changed_by}", expected ${uid}`)
    }
  }

  // --- test 4: does a P2 pass resolve against the live queue? ----------------
  head("Test 4 — does P2's QR pass resolve to a live booking?")
  const target = (rows ?? [])[0]
  if (!target) {
    info("no bookings today to build a pass from — skipped")
  } else {
    // Exactly what P2's farmer app encodes, built from a real live booking.
    const payload = JSON.stringify({
      type: PASS_TYPE,
      token: target.token_number,
      booking_id: target.booking_id,
      farmer_id: "f8888888-8888-8888-8888-888888888888",
      center_id: target.center_id,
    })

    const scan = parseScan(payload)
    if (!scan) fail("parseScan rejected a well-formed pass")
    else {
      ok(`parsed pass for ${scan.token}`)

      // The rule the desk uses: booking_id first, token as the fallback.
      const match = rows.find(
        (r) =>
          (scan.bookingId && r.booking_id === scan.bookingId) ||
          (scan.token && r.token_number.toUpperCase() === scan.token),
      )
      if (!match) fail("a pass built from a live booking did not match the queue")
      else if (match.booking_id !== target.booking_id) fail("the pass matched the WRONG booking")
      else ok(`resolves to ${match.token_number} (${match.status})`)

      // A stranger's QR code must be refused outright, not searched for.
      if (parseScan("https://example.com/promo") !== null) {
        fail("a non-AgriQ QR code was not rejected")
      } else ok("a non-AgriQ QR code is rejected rather than searched for")
    }
  }

  head(failures === 0 ? "All checks passed." : `${failures} check(s) failed.`)
  await supabase.auth.signOut()
  process.exitCode = failures === 0 ? 0 : 1
} catch (err) {
  if (!(err instanceof Stop)) throw err
}
