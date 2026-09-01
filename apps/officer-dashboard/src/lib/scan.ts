/**
 * QR payload parsing, kept out of the scanner component so it can be tested
 * without a camera — and because every other pure rule in this module lives in
 * lib/.
 *
 * The payload contract is not locked yet: P2 generates the farmer's pass and
 * has not confirmed which shape it encodes, so this accepts the three it could
 * reasonably be. Once P2 confirms, delete the other two branches.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface ScanResult {
  token?: string
  bookingId?: string
}

export function parseScan(raw: string): ScanResult {
  const text = raw.trim()

  // Shape 1: JSON, e.g. {"token_number":"LSG-1004","booking_id":"..."}
  if (text.startsWith("{")) {
    try {
      const obj = JSON.parse(text) as Record<string, unknown>
      return {
        token: typeof obj.token_number === "string" ? obj.token_number : undefined,
        bookingId: typeof obj.booking_id === "string" ? obj.booking_id : undefined,
      }
    } catch {
      // fall through to the plain-text shapes
    }
  }

  // Shape 2: a bare UUID — the booking_id.
  if (UUID_RE.test(text)) {
    return { bookingId: text }
  }

  // Shape 3: a bare token, e.g. LSG-1004. Also tolerates a URL ending in one.
  const tail = text.split("/").pop() ?? text
  return { token: tail.toUpperCase() }
}
