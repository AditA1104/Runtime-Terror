import type {
  Booking,
  BookingStatus,
  CreatedVia,
  Farmer,
  MandiCenter,
  Slot,
  StatusLogEntry,
} from "@/lib/types"
import { STAGE_ORDER } from "@/lib/status"
import { todayISO } from "@/lib/format"

/**
 * Deterministic in-memory stand-in for Supabase, used until P1/P6 hand over
 * credentials. Shapes match agriq_schema.sql exactly so swapping to the live
 * repository is a change of data source, not a change of component code.
 */

// Seeded PRNG so a reload shows the same desk — a demo that reshuffles every
// refresh is impossible to rehearse against.
function makeRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0x100000000
  }
}

const rng = makeRng(26032)
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]
const between = (lo: number, hi: number) => lo + rng() * (hi - lo)

function uuid(prefix: string, n: number): string {
  const hex = (n + 1).toString(16).padStart(12, "0")
  return `${prefix}0000-0000-4000-8000-${hex}`
}

const FIRST_NAMES = [
  "Ramesh", "Sunita", "Vikram", "Anjali", "Mahesh", "Kavita", "Suresh", "Lakshmi",
  "Ganesh", "Pooja", "Dattatray", "Shalini", "Balu", "Manisha", "Prakash", "Rekha",
  "Sandeep", "Vaishali", "Nitin", "Archana", "Bhaskar", "Jyoti", "Kailas", "Meena",
  "Ravindra", "Sarika", "Tukaram", "Ujwala", "Ashok", "Nanda",
]
const LAST_NAMES = [
  "Patil", "Shinde", "Jadhav", "More", "Pawar", "Deshmukh", "Kulkarni", "Gaikwad",
  "Bhosale", "Chavan", "Sawant", "Kadam", "Thorat", "Salunkhe",
]
const VILLAGES = [
  "Ozar", "Pimpalgaon", "Dindori", "Lasalgaon", "Chandwad", "Niphad", "Yeola",
  "Satana", "Kalwan", "Sinnar", "Vani", "Manmad",
]

export const MOCK_CENTERS: MandiCenter[] = [
  {
    center_id: uuid("c1a20000", 1),
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
    created_at: new Date().toISOString(),
  },
  {
    center_id: uuid("c1a20000", 2),
    center_name: "Pimpalgaon Baswant APMC",
    location: "Pimpalgaon",
    district: "Nashik",
    state: "Maharashtra",
    crop_type: "Onion",
    daily_capacity_kg: 140000,
    hourly_intake_limit: 10,
    avg_processing_min: 16,
    operating_start: "08:00:00",
    operating_end: "17:00:00",
    created_at: new Date().toISOString(),
  },
  {
    center_id: uuid("c1a20000", 3),
    center_name: "Yeola Procurement Centre",
    location: "Yeola",
    district: "Nashik",
    state: "Maharashtra",
    crop_type: "Soybean",
    daily_capacity_kg: 95000,
    hourly_intake_limit: 8,
    avg_processing_min: 18,
    operating_start: "09:00:00",
    operating_end: "17:00:00",
    created_at: new Date().toISOString(),
  },
  {
    center_id: uuid("c1a20000", 4),
    center_name: "Chandwad Kharedi Kendra",
    location: "Chandwad",
    district: "Nashik",
    state: "Maharashtra",
    crop_type: "Wheat",
    daily_capacity_kg: 120000,
    hourly_intake_limit: 9,
    avg_processing_min: 15,
    operating_start: "08:30:00",
    operating_end: "17:30:00",
    created_at: new Date().toISOString(),
  },
  {
    center_id: uuid("c1a20000", 5),
    center_name: "Sinnar Taluka Centre",
    location: "Sinnar",
    district: "Nashik",
    state: "Maharashtra",
    crop_type: "Tur (Arhar)",
    daily_capacity_kg: 70000,
    hourly_intake_limit: 6,
    avg_processing_min: 20,
    operating_start: "09:00:00",
    operating_end: "16:00:00",
    created_at: new Date().toISOString(),
  },
]

const TOKEN_PREFIX: Record<string, string> = {
  [MOCK_CENTERS[0].center_id]: "LSG",
  [MOCK_CENTERS[1].center_id]: "PMP",
  [MOCK_CENTERS[2].center_id]: "YLA",
  [MOCK_CENTERS[3].center_id]: "CHD",
  [MOCK_CENTERS[4].center_id]: "SNR",
}

/** Distribution of statuses across a mandi mid-morning. Weighted, not uniform. */
const STATUS_MIX: BookingStatus[] = [
  ...Array<BookingStatus>(9).fill("BOOKED"),
  ...Array<BookingStatus>(5).fill("CHECKED_IN"),
  ...Array<BookingStatus>(4).fill("WEIGHED"),
  ...Array<BookingStatus>(3).fill("QUALITY_APPROVED"),
  ...Array<BookingStatus>(2).fill("PAYMENT_INITIATED"),
  ...Array<BookingStatus>(7).fill("COMPLETED"),
  "NO_SHOW",
  "CANCELLED",
]

function buildSlots(center: MandiCenter, date: string, startIdx: number): Slot[] {
  const startHour = Number((center.operating_start ?? "08:00:00").slice(0, 2))
  const endHour = Number((center.operating_end ?? "18:00:00").slice(0, 2))
  const slots: Slot[] = []
  for (let h = startHour, i = 0; h < endHour; h++, i++) {
    slots.push({
      slot_id: uuid("50700000", startIdx + i),
      center_id: center.center_id,
      slot_date: date,
      slot_start_time: `${String(h).padStart(2, "0")}:00:00`,
      slot_end_time: `${String(h + 1).padStart(2, "0")}:00:00`,
      max_farmers: center.hourly_intake_limit ?? 10,
      booked_count: 0,
    })
  }
  return slots
}

export interface MockDb {
  farmers: Farmer[]
  centers: MandiCenter[]
  slots: Slot[]
  bookings: Booking[]
  status_log: StatusLogEntry[]
}

function seed(): MockDb {
  const today = todayISO()
  const farmers: Farmer[] = []
  const slots: Slot[] = []
  const bookings: Booking[] = []
  const status_log: StatusLogEntry[] = []

  let slotCursor = 0
  for (const center of MOCK_CENTERS) {
    const centerSlots = buildSlots(center, today, slotCursor)
    slotCursor += centerSlots.length
    slots.push(...centerSlots)
  }

  let farmerIdx = 0
  let bookingIdx = 0
  let logIdx = 0
  const dayStart = new Date()
  dayStart.setHours(8, 0, 0, 0)

  for (const center of MOCK_CENTERS) {
    const centerSlots = slots.filter((s) => s.center_id === center.center_id)
    // Busiest center gets the fullest desk so the demo has something to show.
    const count = center.center_id === MOCK_CENTERS[0].center_id ? 34 : Math.round(between(9, 18))

    for (let i = 0; i < count; i++) {
      const farmer: Farmer = {
        farmer_id: uuid("fa120000", farmerIdx),
        full_name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        phone_number: `9${Math.floor(between(100000000, 999999999))}`,
        village: pick(VILLAGES),
        district: center.district,
        state: center.state,
        preferred_lang: rng() > 0.65 ? "mr" : "en",
        created_at: new Date(dayStart.getTime() - 86400000 * 30).toISOString(),
      }
      farmers.push(farmer)
      farmerIdx++

      const slot = centerSlots[Math.min(centerSlots.length - 1, Math.floor(rng() * centerSlots.length))]
      slot.booked_count++

      const status = pick(STATUS_MIX)
      const idx = STAGE_ORDER.indexOf(status)
      const createdVia: CreatedVia = rng() > 0.72 ? "ussd" : "web"

      // Timestamps walk backwards from now so elapsed-time columns look real.
      const checkedInAt =
        idx >= 1 ? new Date(dayStart.getTime() + between(0, 3.5) * 3600000).toISOString() : null
      const completedAt =
        status === "COMPLETED" && checkedInAt
          ? new Date(new Date(checkedInAt).getTime() + between(28, 95) * 60000).toISOString()
          : null

      const weight = idx >= 2 ? Math.round(between(400, 3200) / 10) * 10 : null
      const grade = idx >= 3 ? pick(["FAQ", "A", "A", "B", "B", "C"]) : null
      const amount = idx >= 4 && weight ? Math.round((weight * between(18, 34)) / 10) * 10 : null

      const booking: Booking = {
        booking_id: uuid("b0000000", bookingIdx),
        farmer_id: farmer.farmer_id,
        slot_id: slot.slot_id,
        center_id: center.center_id,
        token_number: `${TOKEN_PREFIX[center.center_id]}-${String(1001 + i).padStart(4, "0")}`,
        crop_quantity_kg: weight,
        quality_grade: grade,
        payment_amount: amount,
        status,
        queue_position: i + 1,
        predicted_wait_mins: Math.round(between(15, 120)),
        actual_wait_mins: completedAt
          ? Math.round((new Date(completedAt).getTime() - new Date(checkedInAt!).getTime()) / 60000)
          : null,
        created_via: createdVia,
        checked_in_at: checkedInAt,
        completed_at: completedAt,
        created_at: new Date(dayStart.getTime() - between(1, 96) * 3600000).toISOString(),
      }
      bookings.push(booking)
      bookingIdx++

      // Replay the transitions this booking must have gone through, so the
      // bottleneck panel has real dwell times to chew on.
      let prev: BookingStatus = "BOOKED"
      let t = checkedInAt ? new Date(checkedInAt).getTime() : new Date(booking.created_at).getTime()
      const walked = idx > 0 ? STAGE_ORDER.slice(1, idx + 1) : []
      for (const to of walked) {
        status_log.push({
          log_id: uuid("10600000", logIdx++),
          booking_id: booking.booking_id,
          from_status: prev,
          to_status: to,
          changed_by: pick(["officer.rane", "officer.deshpande", "officer.kale"]),
          created_at: new Date(t).toISOString(),
        })
        prev = to
        t += between(8, 34) * 60000
      }
      if (status === "CANCELLED" || status === "NO_SHOW") {
        status_log.push({
          log_id: uuid("10600000", logIdx++),
          booking_id: booking.booking_id,
          from_status: "BOOKED",
          to_status: status,
          changed_by: "officer.rane",
          created_at: new Date(dayStart.getTime() + between(1, 4) * 3600000).toISOString(),
        })
      }
    }
  }

  return { farmers, centers: [...MOCK_CENTERS], slots, bookings, status_log }
}

export const mockDb: MockDb = seed()
