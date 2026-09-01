import { describe, expect, it } from "vitest"
import { parseScan } from "./scan"

const UUID = "b0000000-0000-4000-8000-00000000000a"

/**
 * These pin all three payload shapes P2 might encode. When P2 confirms which
 * one the pass actually uses, the other two branches go — and these tests are
 * what says it is safe to delete them.
 */
describe("parseScan", () => {
  describe("shape 1 — JSON", () => {
    it("reads both fields", () => {
      expect(parseScan(`{"token_number":"LSG-1004","booking_id":"${UUID}"}`)).toEqual({
        token: "LSG-1004",
        bookingId: UUID,
      })
    })

    it("tolerates either field being absent", () => {
      expect(parseScan('{"token_number":"LSG-1004"}')).toEqual({
        token: "LSG-1004",
        bookingId: undefined,
      })
      expect(parseScan(`{"booking_id":"${UUID}"}`)).toEqual({
        token: undefined,
        bookingId: UUID,
      })
    })

    it("ignores non-string values rather than passing them on", () => {
      expect(parseScan('{"token_number":1004,"booking_id":null}')).toEqual({
        token: undefined,
        bookingId: undefined,
      })
    })

    it("falls through to the plain-text shapes on malformed JSON", () => {
      // A truncated scan should still be treated as a token, not throw.
      expect(parseScan('{"token_number":"LSG-1004"')).toEqual({ token: '{"TOKEN_NUMBER":"LSG-1004"' })
    })
  })

  describe("shape 2 — bare UUID", () => {
    it("is read as a booking id, not a token", () => {
      expect(parseScan(UUID)).toEqual({ bookingId: UUID })
    })

    it("accepts uppercase", () => {
      const upper = UUID.toUpperCase()
      expect(parseScan(upper)).toEqual({ bookingId: upper })
    })

    it("rejects a near-miss so it is treated as a token instead", () => {
      // One character short — must not be mistaken for a booking id.
      expect(parseScan("b0000000-0000-4000-8000-0000000000")).toEqual({
        token: "B0000000-0000-4000-8000-0000000000",
      })
    })
  })

  describe("shape 3 — bare token", () => {
    it("upper-cases so a lowercase scan still matches the queue", () => {
      expect(parseScan("lsg-1004")).toEqual({ token: "LSG-1004" })
    })

    it("takes the last segment of a URL", () => {
      expect(parseScan("https://agriq.example/pass/LSG-1004")).toEqual({ token: "LSG-1004" })
    })
  })

  it("trims surrounding whitespace from any shape", () => {
    expect(parseScan("  LSG-1004\n")).toEqual({ token: "LSG-1004" })
    expect(parseScan(`  ${UUID}  `)).toEqual({ bookingId: UUID })
  })
})
