import type { BookingStatus } from "./types"

/**
 * The state machine, mirrored from transition_booking_status() in the schema.
 *
 * The Postgres function is the enforcer — it rejects any hop that is not
 * exactly one step forward. This file exists so the UI can grey out the wrong
 * buttons *before* the round trip, not to re-implement the rule.
 */
export const STAGE_ORDER: BookingStatus[] = [
  "BOOKED",
  "CHECKED_IN",
  "WEIGHED",
  "QUALITY_APPROVED",
  "PAYMENT_INITIATED",
  "COMPLETED",
]

export const TERMINAL_STATUSES: BookingStatus[] = ["COMPLETED", "CANCELLED", "NO_SHOW"]

/** Statuses that mean the farmer is physically present and mid-processing. */
export const ACTIVE_STATUSES: BookingStatus[] = [
  "CHECKED_IN",
  "WEIGHED",
  "QUALITY_APPROVED",
  "PAYMENT_INITIATED",
]

export const STATUS_LABEL: Record<BookingStatus, string> = {
  BOOKED: "Booked",
  CHECKED_IN: "Checked in",
  WEIGHED: "Weighed",
  QUALITY_APPROVED: "Quality approved",
  PAYMENT_INITIATED: "Payment initiated",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No show",
}

/** CSS custom property holding this stage's colour (defined in index.css). */
export const STATUS_COLOR_VAR: Record<BookingStatus, string> = {
  BOOKED: "--stage-booked",
  CHECKED_IN: "--stage-checked-in",
  WEIGHED: "--stage-weighed",
  QUALITY_APPROVED: "--stage-quality",
  PAYMENT_INITIATED: "--stage-payment",
  COMPLETED: "--stage-completed",
  CANCELLED: "--stage-cancelled",
  NO_SHOW: "--stage-no-show",
}

/**
 * The checkpoint desks an officer physically staffs. Each one advances a
 * booking by exactly one stage, and some also capture a measurement.
 *
 * `field` is the bookings column the desk writes. The schema's
 * transition_booking_status() only moves `status`, so the repository writes the
 * field first and then calls the RPC.
 */
export interface Checkpoint {
  from: BookingStatus
  to: BookingStatus
  /** Button text on the queue row. */
  action: string
  /** Desk name, used in the bottleneck panel. */
  desk: string
  field?: {
    column: "crop_quantity_kg" | "quality_grade" | "payment_amount"
    label: string
    kind: "number" | "grade"
    unit?: string
    required: boolean
  }
}

export const CHECKPOINTS: Checkpoint[] = [
  {
    from: "BOOKED",
    to: "CHECKED_IN",
    action: "Check in",
    desk: "Gate",
  },
  {
    from: "CHECKED_IN",
    to: "WEIGHED",
    action: "Record weight",
    desk: "Weighbridge",
    field: {
      column: "crop_quantity_kg",
      label: "Net weight",
      kind: "number",
      unit: "kg",
      required: true,
    },
  },
  {
    from: "WEIGHED",
    to: "QUALITY_APPROVED",
    action: "Approve quality",
    desk: "Quality Assayer",
    field: {
      column: "quality_grade",
      label: "Quality grade",
      kind: "grade",
      required: true,
    },
  },
  {
    from: "QUALITY_APPROVED",
    to: "PAYMENT_INITIATED",
    action: "Initiate payment",
    desk: "Accounts",
    field: {
      column: "payment_amount",
      label: "Payment amount",
      kind: "number",
      unit: "₹",
      required: true,
    },
  },
  {
    from: "PAYMENT_INITIATED",
    to: "COMPLETED",
    action: "Complete",
    desk: "Accounts",
  },
]

/** Grades offered at the Quality Assayer desk. */
export const QUALITY_GRADES = ["FAQ", "A", "B", "C", "REJECTED"] as const

export function nextCheckpoint(status: BookingStatus): Checkpoint | null {
  return CHECKPOINTS.find((c) => c.from === status) ?? null
}

export function stageIndex(status: BookingStatus): number {
  return STAGE_ORDER.indexOf(status)
}

export function isTerminal(status: BookingStatus): boolean {
  return TERMINAL_STATUSES.includes(status)
}

/** Progress through the six-stage pipeline, 0–1. Terminal-but-not-COMPLETED is 0. */
export function stageProgress(status: BookingStatus): number {
  const idx = stageIndex(status)
  if (idx < 0) return 0
  return idx / (STAGE_ORDER.length - 1)
}
