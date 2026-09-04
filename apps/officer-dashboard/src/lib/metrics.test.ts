import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { computeMetrics } from "./metrics"
import type { BookingStatus, CreatedVia, MandiCenter, QueueEntry, StatusLogEntry } from "./types"

const NOW = "2026-09-01T12:00:00Z"

let seq = 0
const at = (hhmm: string) => `2026-09-01T${hhmm}:00Z`

function entry(over: Partial<QueueEntry> & { status: BookingStatus }): QueueEntry {
  seq++
  return {
    booking_id: `b${seq}`,
    farmer_id: `f${seq}`,
    slot_id: `s${seq}`,
    center_id: "centre-1",
    token_number: `LSG-${1000 + seq}`,
    crop_quantity_kg: null,
    quality_grade: null,
    payment_amount: null,
    queue_position: seq,
    predicted_wait_mins: null,
    actual_wait_mins: null,
    created_via: "web" as CreatedVia,
    checked_in_at: null,
    completed_at: null,
    created_at: at("10:00"),
    farmer: null,
    slot: null,
    live_position: null,
    ...over,
  }
}

function log(bookingId: string, to: BookingStatus, time: string): StatusLogEntry {
  return {
    log_id: `l-${bookingId}-${to}`,
    booking_id: bookingId,
    from_status: null,
    to_status: to,
    changed_by: "officer.test",
    created_at: at(time),
  }
}

const CENTRE: MandiCenter = {
  center_id: "centre-1",
  center_name: "Lasalgaon APMC",
  location: "Lasalgaon",
  district: "Nashik",
  state: "Maharashtra",
  crop_type: "Onion",
  daily_capacity_kg: 180000,
  hourly_intake_limit: 12,
  avg_processing_min: 14,
  operating_start: "08:00:00",
  operating_end: "18:00:00",
  created_at: at("08:00"),
}

/**
 * A representative mid-morning desk, built so each assertion below has a
 * hand-checked expected value rather than a snapshot.
 *
 * Shape: 2 not yet arrived, 5 just checked in (5 min ago), 2 stuck at the
 * weighbridge (40 min ago), 3 finished, 1 no-show, 1 cancelled.
 */
function desk() {
  seq = 0
  const booked = [entry({ status: "BOOKED" }), entry({ status: "BOOKED", created_via: "ussd" })]

  const checkedIn = Array.from({ length: 5 }, () =>
    entry({ status: "CHECKED_IN", checked_in_at: at("11:55") }),
  )

  const weighed = Array.from({ length: 2 }, () =>
    entry({ status: "WEIGHED", checked_in_at: at("11:00"), crop_quantity_kg: 1000 }),
  )

  const completed = [
    entry({
      status: "COMPLETED",
      checked_in_at: at("09:30"),
      completed_at: at("10:30"), // 60 min
      crop_quantity_kg: 500,
      created_via: "ussd",
    }),
    entry({
      status: "COMPLETED",
      checked_in_at: at("09:40"),
      completed_at: at("11:00"), // 80 min
      crop_quantity_kg: 500,
    }),
    entry({
      status: "COMPLETED",
      checked_in_at: at("09:00"),
      completed_at: at("11:10"), // 130 min
      crop_quantity_kg: 500,
    }),
  ]

  const closed = [entry({ status: "NO_SHOW" }), entry({ status: "CANCELLED" })]

  const entries = [...booked, ...checkedIn, ...weighed, ...completed, ...closed]

  const statusLog: StatusLogEntry[] = [
    ...checkedIn.map((e) => log(e.booking_id, "CHECKED_IN", "11:55")),
    ...weighed.map((e) => log(e.booking_id, "WEIGHED", "11:20")),
    log(completed[0].booking_id, "COMPLETED", "10:30"), // over an hour ago
    log(completed[1].booking_id, "COMPLETED", "11:00"),
    log(completed[2].booking_id, "COMPLETED", "11:10"),
  ]

  return { entries, statusLog }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(NOW))
})

afterEach(() => {
  vi.useRealTimers()
})

describe("computeMetrics — head counts", () => {
  it("splits the desk into the states the officer acts on", () => {
    const { entries, statusLog } = desk()
    const m = computeMetrics(entries, statusLog, CENTRE)

    expect(m.tokensIssued).toBe(14)
    expect(m.awaitingArrival).toBe(2)
    expect(m.inProgress).toBe(7) // 5 checked in + 2 weighed
    expect(m.completed).toBe(3)
    expect(m.noShow).toBe(1)
    expect(m.cancelled).toBe(1)
  })

  it("counts everyone who ever arrived as checked in, including the finished", () => {
    const { entries, statusLog } = desk()
    expect(computeMetrics(entries, statusLog, CENTRE).checkedIn).toBe(10)
  })

  it("does not count a no-show or a cancellation as having arrived", () => {
    seq = 0
    const m = computeMetrics(
      [entry({ status: "NO_SHOW" }), entry({ status: "CANCELLED" })],
      [],
      CENTRE,
    )
    expect(m.checkedIn).toBe(0)
    expect(m.inProgress).toBe(0)
  })
})

describe("computeMetrics — procurement", () => {
  it("counts weight only once the weighbridge has recorded it", () => {
    const { entries, statusLog } = desk()
    // 2 x 1000 still on the floor + 3 x 500 finished.
    expect(computeMetrics(entries, statusLog, CENTRE).procuredKg).toBe(3500)
  })

  it("ignores a weight on a row that has not reached the weighbridge", () => {
    seq = 0
    const m = computeMetrics(
      [entry({ status: "CHECKED_IN", crop_quantity_kg: 9999 })],
      [],
      CENTRE,
    )
    expect(m.procuredKg).toBe(0)
  })

  it("clamps the target percentage at 100 rather than overflowing the meter", () => {
    seq = 0
    const m = computeMetrics(
      [entry({ status: "COMPLETED", crop_quantity_kg: 500000 })],
      [],
      CENTRE,
    )
    expect(m.targetPct).toBe(100)
  })

  it("reports 0% rather than dividing by zero when no target is set", () => {
    seq = 0
    const m = computeMetrics([entry({ status: "COMPLETED", crop_quantity_kg: 100 })], [], null)
    expect(m.targetKg).toBe(0)
    expect(m.targetPct).toBe(0)
  })
})

describe("computeMetrics — turnaround", () => {
  it("averages and medians check-in to payout", () => {
    const { entries, statusLog } = desk()
    const m = computeMetrics(entries, statusLog, CENTRE)
    expect(m.avgTurnaroundMins).toBe(90) // (60 + 80 + 130) / 3
    expect(m.medianTurnaroundMins).toBe(80)
  })

  it("returns null rather than 0 when nothing has completed yet", () => {
    seq = 0
    const m = computeMetrics([entry({ status: "CHECKED_IN" })], [], CENTRE)
    expect(m.avgTurnaroundMins).toBeNull()
    expect(m.medianTurnaroundMins).toBeNull()
  })

  it("counts only completions inside the last hour", () => {
    const { entries, statusLog } = desk()
    // Three completed today, but one cleared at 10:30 — outside the window.
    expect(computeMetrics(entries, statusLog, CENTRE).completedLastHour).toBe(2)
  })
})

describe("computeMetrics — bottleneck", () => {
  it("picks the stage costing the most farmer-minutes, not the longest queue", () => {
    const { entries, statusLog } = desk()
    const m = computeMetrics(entries, statusLog, CENTRE)

    const checkedIn = m.stages.find((s) => s.status === "CHECKED_IN")!
    const weighed = m.stages.find((s) => s.status === "WEIGHED")!

    // 5 farmers waiting 5 minutes = 25 farmer-minutes...
    expect(checkedIn.waiting).toBe(5)
    expect(checkedIn.avgDwellMins).toBe(5)
    // ...loses to 2 farmers waiting 40 = 80, despite the shorter queue.
    expect(weighed.waiting).toBe(2)
    expect(weighed.avgDwellMins).toBe(40)

    expect(m.bottleneck?.status).toBe("WEIGHED")
    expect(m.bottleneck?.desk).toBe("Quality Assayer")
  })

  it("never blames BOOKED — nobody is standing in the hall yet", () => {
    seq = 0
    // 50 bookings created hours ago would dominate on farmer-minutes alone.
    const entries = Array.from({ length: 50 }, () =>
      entry({ status: "BOOKED", created_at: at("08:00") }),
    )
    entries.push(entry({ status: "CHECKED_IN", checked_in_at: at("11:50") }))

    const m = computeMetrics(entries, [], CENTRE)
    expect(m.stages.find((s) => s.status === "BOOKED")!.waiting).toBe(50)
    expect(m.bottleneck?.status).toBe("CHECKED_IN")
  })

  it("is null on an empty desk", () => {
    expect(computeMetrics([], [], CENTRE).bottleneck).toBeNull()
  })

  it("reports a stage per checkpoint desk, excluding COMPLETED", () => {
    const m = computeMetrics([], [], CENTRE)
    expect(m.stages.map((s) => s.status)).toEqual([
      "BOOKED",
      "CHECKED_IN",
      "WEIGHED",
      "QUALITY_APPROVED",
      "PAYMENT_INITIATED",
    ])
  })

  it("measures dwell from the last status change, not from check-in", () => {
    seq = 0
    const row = entry({ status: "WEIGHED", checked_in_at: at("08:00") })
    // Checked in 4 hours ago but only reached the weighbridge 10 minutes ago.
    const m = computeMetrics([row], [log(row.booking_id, "WEIGHED", "11:50")], CENTRE)
    expect(m.stages.find((s) => s.status === "WEIGHED")!.maxDwellMins).toBe(10)
  })
})

describe("computeMetrics — channel mix", () => {
  it("reports the USSD share of today's tokens", () => {
    seq = 0
    const entries = [
      entry({ status: "BOOKED", created_via: "ussd" }),
      entry({ status: "BOOKED", created_via: "web" }),
      entry({ status: "BOOKED", created_via: "web" }),
      entry({ status: "BOOKED", created_via: "web" }),
    ]
    expect(computeMetrics(entries, [], CENTRE).ussdShare).toBe(25)
  })

  it("is 0 rather than NaN on an empty desk", () => {
    expect(computeMetrics([], [], CENTRE).ussdShare).toBe(0)
  })
})
