import { describe, expect, it } from "vitest"
import { mockDb, MOCK_CENTERS } from "./mock"
import type { Booking } from "@/lib/types"
import { parseScan } from "@/lib/scan"
import { nextCheckpoint } from "@/lib/status"

/**
 * The seam between P2's farmer app and this desk.
 *
 * P2 generates the pass; P3 reads it. Nothing but agreement holds the two
 * together, so this pins that agreement: their real payload, their real centre
 * ids, and the demo booking they render in offline mode. If either side drifts,
 * this file fails rather than the demo.
 *
 * Sources on P2's branch (commit 7020180):
 *   farmer-app/src/components/token/QRCodeDisplay.tsx  — the payload
 *   farmer-app/src/lib/mockData.ts                     — centres and the pass
 */

/** Verbatim from P2's farmer app. */
const P2_PASS = JSON.stringify({
  type: "AGRIQ_TOKEN",
  booking_id: "b1111111-1111-1111-1111-111111111101",
  token_number: "BLR-0231",
  token: "BLR-0231",
  phone_number: "9845012345",
  center_id: "c0000000-0000-0000-0000-000000000001",
  slot_date: "2026-09-04",
  farmer_id: "f1111111-1111-1111-1111-111111111111",
})

/** The lookup QueueDesk.handleScan performs: booking id first, token second. */
function resolve(scan: NonNullable<ReturnType<typeof parseScan>>) {
  return mockDb.bookings.find(
    (b) =>
      (scan.bookingId && b.booking_id === scan.bookingId) ||
      (scan.token && b.token_number.toUpperCase() === scan.token),
  )
}

describe("centre ids agree with P2's farmer app", () => {
  it("uses the same six APMC yards", () => {
    expect(MOCK_CENTERS.map((c) => c.center_id)).toEqual([
      "c0000000-0000-0000-0000-000000000001",
      "c0000000-0000-0000-0000-000000000002",
      "c0000000-0000-0000-0000-000000000003",
      "c0000000-0000-0000-0000-000000000004",
      "c0000000-0000-0000-0000-000000000005",
      "c0000000-0000-0000-0000-000000000006",
    ])
  })

  it("names them as P2 and P4 do — all Karnataka", () => {
    expect(MOCK_CENTERS[0].center_name).toContain("Bengaluru APMC")
    expect(MOCK_CENTERS.every((c) => c.state === "Karnataka")).toBe(true)
  })

  it("issues tokens with P2's prefix convention", () => {
    const blr = mockDb.bookings.filter((b) => b.center_id === MOCK_CENTERS[0].center_id)
    expect(blr.length).toBeGreaterThan(0)
    expect(blr.every((b) => b.token_number.startsWith("BLR-"))).toBe(true)
  })
})

describe("P2's demo pass resolves on this desk", () => {
  it("parses every field", () => {
    const scan = parseScan(P2_PASS)
    expect(scan).not.toBeNull()
    expect(scan!.token).toBe("BLR-0231")
    expect(scan!.centerId).toBe("c0000000-0000-0000-0000-000000000001")
    expect(scan!.slotDate).toBe("2026-09-04")
  })

  it("names a centre this desk actually staffs", () => {
    const scan = parseScan(P2_PASS)!
    // Without this, a scan that missed would wrongly say "booked at another
    // centre" — the failure mode that made the earlier "c1-nsk" id a bug.
    expect(mockDb.centers.some((c) => c.center_id === scan.centerId)).toBe(true)
  })

  it("finds the booking, so an offline joint demo works", () => {
    const match = resolve(parseScan(P2_PASS)!)
    expect(match).toBeDefined()
    expect(match!.token_number).toBe("BLR-0231")
    expect(match!.center_id).toBe(MOCK_CENTERS[0].center_id)
  })

  it("offers check-in as the next action, which is what a gate scan means", () => {
    const match = resolve(parseScan(P2_PASS)!)!
    expect(match.status).toBe("BOOKED")
    expect(nextCheckpoint(match.status)?.to).toBe("CHECKED_IN")
  })

  it("matches on booking_id even if the token were renumbered", () => {
    const renumbered = JSON.parse(P2_PASS)
    renumbered.token = "XXX-9999"
    renumbered.token_number = "XXX-9999"
    const match = resolve(parseScan(JSON.stringify(renumbered))!)
    expect(match?.booking_id).toBe("b1111111-1111-1111-1111-111111111101")
  })
})

/**
 * P4's USSD simulator books on a farmer's behalf and stamps
 * `created_via: 'ussd'`. Nothing else about such a row differs, so the desk
 * must treat it as an ordinary booking and simply mark how it arrived — a
 * feature-phone farmer is not a second-class one at the gate.
 */
describe("USSD bookings from P4", () => {
  const ussd = mockDb.bookings.filter((b) => b.created_via === "ussd")

  it("are present in the seeded dataset", () => {
    expect(ussd.length).toBeGreaterThan(0)
  })

  it("carry the same shape as a web booking", () => {
    const keys = (b: Booking) => Object.keys(b).sort().join(",")
    const web = mockDb.bookings.find((b) => b.created_via === "web")!
    expect(keys(ussd[0])).toBe(keys(web))
  })

  it("move through the same checkpoints as any other booking", () => {
    // The desk resolves the next action from status alone, never from the
    // channel, so a USSD row is actionable exactly like a web one.
    const bookedUssd = ussd.find((b) => b.status === "BOOKED")
    expect(bookedUssd).toBeDefined()
    expect(nextCheckpoint(bookedUssd!.status)?.to).toBe("CHECKED_IN")
  })

  it("are findable by token, which is all a USSD farmer is told", () => {
    const found = mockDb.bookings.find((b) => b.token_number === ussd[0].token_number)
    expect(found?.booking_id).toBe(ussd[0].booking_id)
  })
})
