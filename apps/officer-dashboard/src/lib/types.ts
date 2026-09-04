/**
 * Row shapes mirroring agriq_schema.sql (Locked Schema v2).
 *
 * These are hand-written against the SQL rather than generated, so if P1 changes
 * the schema this file is the one place to update. Do NOT invent fields here —
 * per MASTER_CONTEXT, new columns get agreed with P1 first.
 */

export type BookingStatus =
  | "BOOKED"
  | "CHECKED_IN"
  | "WEIGHED"
  | "QUALITY_APPROVED"
  | "PAYMENT_INITIATED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"

export type CreatedVia = "web" | "ussd"

export interface Farmer {
  farmer_id: string
  full_name: string
  phone_number: string
  village: string | null
  district: string | null
  state: string | null
  preferred_lang: string | null
  created_at: string
}

export interface MandiCenter {
  center_id: string
  center_name: string
  location: string | null
  district: string | null
  state: string | null
  crop_type: string
  daily_capacity_kg: number
  hourly_intake_limit: number | null
  avg_processing_min: number | null
  /** TIME column, serialised as 'HH:MM:SS'. */
  operating_start: string | null
  operating_end: string | null
  created_at: string
}

export interface Slot {
  slot_id: string
  center_id: string
  slot_date: string
  slot_start_time: string
  slot_end_time: string
  max_farmers: number
  booked_count: number
}

export interface Booking {
  booking_id: string
  farmer_id: string
  slot_id: string | null
  center_id: string
  token_number: string
  crop_quantity_kg: number | null
  quality_grade: string | null
  payment_amount: number | null
  status: BookingStatus
  queue_position: number | null
  predicted_wait_mins: number | null
  actual_wait_mins: number | null
  created_via: CreatedVia
  checked_in_at: string | null
  completed_at: string | null
  created_at: string
}

export interface StatusLogEntry {
  log_id: string
  booking_id: string
  from_status: BookingStatus | null
  to_status: BookingStatus
  changed_by: string | null
  created_at: string
}

/**
 * A booking joined to its farmer and slot — what the queue desk actually
 * renders. Built by the repository layer so components never join by hand.
 */
export interface QueueEntry extends Booking {
  farmer: Pick<Farmer, "farmer_id" | "full_name" | "phone_number" | "village"> | null
  slot: Pick<Slot, "slot_id" | "slot_date" | "slot_start_time" | "slot_end_time"> | null
  /**
   * Position among bookings still waiting at this center today, recomputed on
   * every render. `bookings.queue_position` is written once at booking time and
   * never decrements, so it is NOT what the officer sees.
   */
  live_position: number | null
}

/**
 * A row in `officers`. `officer_id` IS the Supabase Auth UID — there is no
 * separate lookup — which is what makes it safe to write straight into
 * status_log.changed_by.
 */
export interface Officer {
  officer_id: string
  full_name: string
  center_id: string | null
}

/** Identity of whoever is staffing this dashboard. Written to status_log.changed_by. */
export interface OfficerSession {
  officer_name: string
  center_id: string
}
