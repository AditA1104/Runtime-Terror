import { describe, expect, it } from "vitest"
import { PASS_TYPE, parseScan } from "./scan"

/** The pass exactly as P2's farmer app encodes it today. */
const PASS = {
  type: PASS_TYPE,
  token: "NSK-0231",
  booking_id: "b9999999-9999-9999-9999-999999999999",
  farmer_id: "f8888888-8888-8888-8888-888888888888",
  center_id: "c1111111-1111-1111-1111-111111111111",
}

/** P2's earlier revision — different token key, plus two fields since dropped. */
const LEGACY_PASS = {
  type: PASS_TYPE,
  token_number: "NSK-0231",
  booking_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  phone_number: "9876543210",
  center_id: "c1-nsk",
  slot_date: "2026-09-03",
}

const encode = (obj: unknown) => JSON.stringify(obj)

describe("parseScan — the current pass", () => {
  it("reads every field off a real pass", () => {
    expect(parseScan(encode(PASS))).toEqual({
      bookingId: "b9999999-9999-9999-9999-999999999999",
      token: "NSK-0231",
      farmerId: "f8888888-8888-8888-8888-888888888888",
      centerId: "c1111111-1111-1111-1111-111111111111",
      slotDate: null, // not on the current pass
      phone: null,
    })
  })

  it("upper-cases the token so the queue lookup is case-insensitive", () => {
    expect(parseScan(encode({ ...PASS, token: "nsk-0231" }))?.token).toBe("NSK-0231")
  })

  it("tolerates whitespace around the payload", () => {
    expect(parseScan(`  ${encode(PASS)}\n`)?.bookingId).toBe(PASS.booking_id)
  })

  it("accepts a pass carrying only a booking id", () => {
    expect(parseScan(encode({ type: PASS_TYPE, booking_id: PASS.booking_id }))).toEqual({
      bookingId: PASS.booking_id,
      token: null,
      farmerId: null,
      centerId: null,
      slotDate: null,
      phone: null,
    })
  })

  it("accepts a pass carrying only a token", () => {
    expect(parseScan(encode({ type: PASS_TYPE, token: "NSK-0231" }))?.token).toBe("NSK-0231")
  })
})

/**
 * Pinned from farmer-app/src/components/token/QRCodeDisplay.tsx on P2's branch
 * (commit 7020180). They emit both token keys for backward compatibility and
 * restored slot_date, so this is a superset of every revision so far. If P2
 * changes the pass again, this test is what notices.
 */
describe("parseScan — P2's shipped pass", () => {
  const SHIPPED = {
    type: PASS_TYPE,
    booking_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    token_number: "NSK-0231",
    token: "NSK-0231", // P2 sends both keys
    farmer_id: "f8888888-8888-8888-8888-888888888888",
    center_id: "affc5449-8ea1-4da3-b1f4-0246eee93595",
    phone_number: "9876543210",
    slot_date: "2026-09-04",
  }

  it("reads every field the farmer app sends", () => {
    expect(parseScan(encode(SHIPPED))).toEqual({
      bookingId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      token: "NSK-0231",
      farmerId: "f8888888-8888-8888-8888-888888888888",
      centerId: "affc5449-8ea1-4da3-b1f4-0246eee93595",
      slotDate: "2026-09-04",
      phone: "9876543210",
    })
  })

  it("carries slot_date, so the wrong-day message works again", () => {
    expect(parseScan(encode(SHIPPED))?.slotDate).toBe("2026-09-04")
  })

  it("has a UUID centre id, so the wrong-centre check is meaningful", () => {
    const id = parseScan(encode(SHIPPED))?.centerId
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it("is unambiguous even though both token keys are present", () => {
    // Both hold the same value, so preferring `token` cannot pick the wrong one.
    expect(SHIPPED.token).toBe(SHIPPED.token_number)
    expect(parseScan(encode(SHIPPED))?.token).toBe("NSK-0231")
  })
})

describe("parseScan — P2's earlier revision", () => {
  // Two contracts arrived two days apart and it is not confirmed which build
  // is on farmers' phones, so both token keys are read.
  it("still reads a pass using token_number", () => {
    const r = parseScan(encode(LEGACY_PASS))
    expect(r?.token).toBe("NSK-0231")
    expect(r?.bookingId).toBe(LEGACY_PASS.booking_id)
  })

  it("keeps slot_date when the pass carries it", () => {
    expect(parseScan(encode(LEGACY_PASS))?.slotDate).toBe("2026-09-03")
  })

  it("keeps phone_number when the pass carries it", () => {
    expect(parseScan(encode(LEGACY_PASS))?.phone).toBe("9876543210")
  })

  it("prefers the current key when a pass somehow carries both", () => {
    const r = parseScan(encode({ ...PASS, token_number: "OLD-0001" }))
    expect(r?.token).toBe("NSK-0231")
  })
})

describe("parseScan — rejects anything that is not a pass", () => {
  it("rejects a QR code from somewhere else", () => {
    expect(parseScan("https://example.com/promo")).toBeNull()
    expect(parseScan("upi://pay?pa=someone@bank")).toBeNull()
  })

  it("rejects a bare token or UUID — the pass is always JSON", () => {
    expect(parseScan("NSK-0231")).toBeNull()
    expect(parseScan(PASS.booking_id)).toBeNull()
  })

  it("rejects JSON without the discriminator", () => {
    expect(parseScan(encode({ token: "NSK-0231", booking_id: PASS.booking_id }))).toBeNull()
  })

  it("rejects a different discriminator", () => {
    expect(parseScan(encode({ ...PASS, type: "AGRIQ_RECEIPT" }))).toBeNull()
  })

  it("rejects a pass with no identifier to look up", () => {
    expect(parseScan(encode({ type: PASS_TYPE, farmer_id: PASS.farmer_id }))).toBeNull()
  })

  it("does not throw on a half-decoded pass", () => {
    expect(parseScan('{"type":"AGRIQ_TOKEN","booking_id":"b99999')).toBeNull()
  })

  it("rejects JSON that is not an object", () => {
    expect(parseScan("[1,2,3]")).toBeNull()
    expect(parseScan("null")).toBeNull()
    expect(parseScan('"AGRIQ_TOKEN"')).toBeNull()
  })

  it("ignores non-string field values rather than passing them on", () => {
    // A numeric token would otherwise reach the queue lookup as garbage.
    expect(parseScan(encode({ ...PASS, token: 231, booking_id: null }))).toBeNull()
  })

  it("treats a blank identifier as absent", () => {
    expect(parseScan(encode({ type: PASS_TYPE, booking_id: "   ", token: "" }))).toBeNull()
  })

  it("rejects empty input", () => {
    expect(parseScan("")).toBeNull()
  })
})
