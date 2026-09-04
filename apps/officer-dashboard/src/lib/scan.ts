/**
 * QR payload parsing for the farmer's token pass.
 *
 * Current shape from P2's farmer app:
 *
 *   {
 *     "type": "AGRIQ_TOKEN",
 *     "token": "NSK-0231",
 *     "booking_id": "b9999999-9999-9999-9999-999999999999",
 *     "farmer_id":  "f8888888-8888-8888-8888-888888888888",
 *     "center_id":  "c1111111-1111-1111-1111-111111111111"
 *   }
 *
 * An earlier revision used `token_number` for the token and also carried
 * `phone_number` and `slot_date`. Both key names are accepted: two conflicting
 * contracts arrived from P2 two days apart and it is not confirmed which build
 * is actually on farmers' phones. This is not open-ended guessing — the `type`
 * discriminator still gates everything, and a pass without it is rejected.
 *
 * `slot_date` stays optional rather than deleted: the desk uses it to say
 * "that pass is for tomorrow" instead of a bare "not found", and P2 has been
 * asked to put it back.
 *
 * Lives here rather than in the scanner component so it can be tested without
 * a camera, and because every other pure rule in this module is in lib/.
 */

/** Discriminator P2 stamps on every pass. Anything else is not our QR code. */
export const PASS_TYPE = "AGRIQ_TOKEN"

export interface ScanResult {
  /** What the queue matches on. */
  bookingId: string | null
  /** Upper-cased, so a lookup against the queue is case-insensitive. */
  token: string | null
  farmerId: string | null
  /**
   * The centre and date the pass was issued for. Never used to match — they
   * are how the desk explains a miss ("that is tomorrow's slot") instead of a
   * bare "not found". `slotDate` is absent on the current pass.
   */
  centerId: string | null
  slotDate: string | null
  /** Dropped from the current pass; still read if an older one turns up. */
  phone: string | null
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
  // `token` is the current key; `token_number` was the earlier one.
  const token = str(obj.token) ?? str(obj.token_number)
  // With neither identifier there is nothing to look the farmer up by, so this
  // is a malformed pass rather than a miss.
  if (!bookingId && !token) return null

  return {
    bookingId,
    token: token?.toUpperCase() ?? null,
    farmerId: str(obj.farmer_id),
    centerId: str(obj.center_id),
    slotDate: str(obj.slot_date),
    phone: str(obj.phone_number),
  }
}
