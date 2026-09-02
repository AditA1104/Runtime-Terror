import { describe, expect, it } from "vitest"
import { PASS_TYPE, parseScan } from "./scan"

const BOOKING_ID = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"

/** The pass exactly as P2 encodes it. */
const PASS = {
  type: PASS_TYPE,
  booking_id: BOOKING_ID,
  token_number: "NSK-0231",
  phone_number: "9876543210",
  center_id: "c1-nsk",
  slot_date: "2026-09-03",
}

const encode = (obj: unknown) => JSON.stringify(obj)

describe("parseScan — the confirmed pass", () => {
  it("reads every field off a real pass", () => {
    expect(parseScan(encode(PASS))).toEqual({
      bookingId: BOOKING_ID,
      token: "NSK-0231",
      phone: "9876543210",
      centerId: "c1-nsk",
      slotDate: "2026-09-03",
    })
  })

  it("upper-cases the token so the queue lookup is case-insensitive", () => {
    expect(parseScan(encode({ ...PASS, token_number: "nsk-0231" }))?.token).toBe("NSK-0231")
  })

  it("tolerates whitespace around the payload", () => {
    expect(parseScan(`  ${encode(PASS)}\n`)?.bookingId).toBe(BOOKING_ID)
  })

  it("keeps the optional fields null when the pass omits them", () => {
    expect(parseScan(encode({ type: PASS_TYPE, booking_id: BOOKING_ID }))).toEqual({
      bookingId: BOOKING_ID,
      token: null,
      phone: null,
      centerId: null,
      slotDate: null,
    })
  })

  it("accepts a pass carrying only a token", () => {
    expect(parseScan(encode({ type: PASS_TYPE, token_number: "NSK-0231" }))?.token).toBe("NSK-0231")
  })
})

describe("parseScan — rejects anything that is not a pass", () => {
  it("rejects a QR code from somewhere else", () => {
    expect(parseScan("https://example.com/promo")).toBeNull()
    expect(parseScan("upi://pay?pa=someone@bank")).toBeNull()
  })

  it("rejects a bare token or UUID — the pass is always JSON", () => {
    expect(parseScan("NSK-0231")).toBeNull()
    expect(parseScan(BOOKING_ID)).toBeNull()
  })

  it("rejects JSON without the discriminator", () => {
    expect(parseScan(encode({ booking_id: BOOKING_ID, token_number: "NSK-0231" }))).toBeNull()
  })

  it("rejects a different discriminator", () => {
    expect(parseScan(encode({ ...PASS, type: "AGRIQ_RECEIPT" }))).toBeNull()
  })

  it("rejects a pass with no identifier to look up", () => {
    expect(parseScan(encode({ type: PASS_TYPE, phone_number: "9876543210" }))).toBeNull()
  })

  it("does not throw on a half-decoded pass", () => {
    expect(parseScan('{"type":"AGRIQ_TOKEN","booking_id":"9b1de')).toBeNull()
  })

  it("rejects JSON that is not an object", () => {
    expect(parseScan("[1,2,3]")).toBeNull()
    expect(parseScan("null")).toBeNull()
    expect(parseScan('"AGRIQ_TOKEN"')).toBeNull()
  })

  it("ignores non-string field values rather than passing them on", () => {
    // A number token_number would otherwise reach the queue lookup as garbage.
    expect(parseScan(encode({ ...PASS, token_number: 231, booking_id: null }))).toBeNull()
  })

  it("treats a blank identifier as absent", () => {
    expect(parseScan(encode({ type: PASS_TYPE, booking_id: "   ", token_number: "" }))).toBeNull()
  })

  it("rejects empty input", () => {
    expect(parseScan("")).toBeNull()
  })
})
