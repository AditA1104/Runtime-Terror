/**
 * QR payload parsing for the farmer's token pass.
 *
 * Shape confirmed by P2 — a JSON object tagged with a discriminator:
 *
 *   {
 *     "type": "AGRIQ_TOKEN",
 *     "booking_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
 *     "token_number": "NSK-0231",
 *     "phone_number": "9876543210",
 *     "center_id": "c1-nsk",
 *     "slot_date": "2026-09-03"
 *   }
 *
 * Lives here rather than in the scanner component so it can be tested without
 * a camera, and because every other pure rule in this module is in lib/.
 */

/** Discriminator P2 stamps on every pass. Anything else is not our QR code. */
export const PASS_TYPE = "AGRIQ_TOKEN"

export interface ScanResult {
  bookingId: string | null
  /** Upper-cased, so a lookup against the queue is case-insensitive. */
  token: string | null
  phone: string | null
  /**
   * The centre and date the pass was issued for. Not used to match — they are
   * how the desk explains a miss ("that is tomorrow's slot") instead of a bare
   * "not found".
   */
  centerId: string | null
  slotDate: string | null
}

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : null

/**
 * Returns null for anything that is not an AgriQ pass — a shop's QR code, a
 * URL, a torn or half-decoded pass. The desk tells the officer that outright
 * rather than searching for a token the payload never contained.
 */
export function parseScan(raw: string): ScanResult | null {
  let obj: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(raw.trim())
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null
    obj = parsed as Record<string, unknown>
  } catch {
    return null
  }

  if (obj.type !== PASS_TYPE) return null

  const bookingId = str(obj.booking_id)
  const token = str(obj.token_number)
  // With neither identifier there is nothing to look the farmer up by, so this
  // is a malformed pass rather than a miss.
  if (!bookingId && !token) return null

  return {
    bookingId,
    token: token?.toUpperCase() ?? null,
    phone: str(obj.phone_number),
    centerId: str(obj.center_id),
    slotDate: str(obj.slot_date),
  }
}
