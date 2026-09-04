import { supabase, isLiveMode } from "@/lib/supabase"
import type {
  Booking,
  BookingStatus,
  MandiCenter,
  QueueEntry,
  StatusLogEntry,
} from "@/lib/types"
import { ACTIVE_STATUSES, isTerminal } from "@/lib/status"
import { mockDb } from "./mock"

/**
 * The single seam between the dashboard UI and its data source.
 *
 * Every component talks to `repository`, never to `supabase` directly. That is
 * what lets Stage 0 (mock) and Stage 1 (live Supabase) share identical UI code:
 * the moment VITE_SUPABASE_URL is set, the live implementation takes over.
 */

export interface AdvanceInput {
  bookingId: string
  /** Current status, sent so the UI's optimistic guard matches the DB's. */
  from: BookingStatus
  to: BookingStatus
  changedBy: string
  /** Measurement captured at this desk, written before the status moves. */
  field?: {
    column: "crop_quantity_kg" | "quality_grade" | "payment_amount"
    value: number | string
  }
}

export interface CapacityPatch {
  daily_capacity_kg?: number
  hourly_intake_limit?: number
  avg_processing_min?: number
  operating_start?: string
  operating_end?: string
}

export interface Repository {
  readonly mode: "mock" | "supabase"
  listCenters(): Promise<MandiCenter[]>
  listQueue(centerId: string, date: string): Promise<QueueEntry[]>
  listStatusLog(centerId: string, date: string): Promise<StatusLogEntry[]>
  advance(input: AdvanceInput): Promise<void>
  markException(bookingId: string, status: "CANCELLED" | "NO_SHOW", changedBy: string): Promise<void>
  updateCapacity(centerId: string, patch: CapacityPatch): Promise<MandiCenter>
  /** Returns an unsubscribe function. Fires whenever this center's queue changes. */
  subscribe(centerId: string, onChange: () => void): () => void
}

/**
 * Live queue position: rank among bookings still waiting, oldest slot first.
 * `bookings.queue_position` is stamped once at booking time and never
 * decrements, so it is not usable as the number the officer reads out.
 */
function withLivePositions(rows: QueueEntry[]): QueueEntry[] {
  let rank = 0
  return rows.map((row) => {
    const waiting = row.status === "BOOKED" || ACTIVE_STATUSES.includes(row.status)
    return { ...row, live_position: waiting ? ++rank : null }
  })
}

function sortQueue(a: QueueEntry, b: QueueEntry): number {
  // Terminal rows sink; among the rest, earliest slot then token order.
  const at = isTerminal(a.status) ? 1 : 0
  const bt = isTerminal(b.status) ? 1 : 0
  if (at !== bt) return at - bt
  const as = a.slot?.slot_start_time ?? "99:99"
  const bs = b.slot?.slot_start_time ?? "99:99"
  if (as !== bs) return as < bs ? -1 : 1
  return a.token_number.localeCompare(b.token_number)
}

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

const mockListeners = new Map<string, Set<() => void>>()

function notifyMock(centerId: string) {
  mockListeners.get(centerId)?.forEach((fn) => fn())
}

/**
 * Mock mode keeps its data in each tab's own memory, so a second tab would
 * normally never see the first tab's checkpoint. BroadcastChannel carries the
 * mutation across, and each tab applies it to its own copy.
 *
 * This is what makes the demo's headline claim — "the officer clears a
 * checkpoint and the other screen updates instantly, no refresh" — showable
 * from two browser tabs before Supabase Realtime is reachable. The live
 * repository gets the same behaviour from postgres_changes.
 */
type MockEvent =
  | {
      kind: "advance"
      bookingId: string
      to: BookingStatus
      changedBy: string
      field?: { column: string; value: number | string }
    }
  | { kind: "exception"; bookingId: string; status: "CANCELLED" | "NO_SHOW"; changedBy: string }
  | { kind: "capacity"; centerId: string; patch: CapacityPatch }

const mockChannel: BroadcastChannel | null =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("agriq.mock.db") : null

/** Applies a mutation to this tab's store. `echo` false means it arrived from another tab. */
function applyMockEvent(event: MockEvent, echo: boolean) {
  if (event.kind === "capacity") {
    const center = mockDb.centers.find((c) => c.center_id === event.centerId)
    if (center) Object.assign(center, event.patch)
    notifyMock(event.centerId)
  } else {
    const booking = mockDb.bookings.find((b) => b.booking_id === event.bookingId)
    if (!booking) return
    const from = booking.status

    if (event.kind === "advance") {
      if (event.field) {
        // @ts-expect-error narrow union assignment, validated by the caller
        booking[event.field.column] = event.field.value
      }
      booking.status = event.to
      if (event.to === "CHECKED_IN") booking.checked_in_at = new Date().toISOString()
      if (event.to === "COMPLETED") {
        booking.completed_at = new Date().toISOString()
        if (booking.checked_in_at) {
          booking.actual_wait_mins = Math.round(
            (Date.now() - new Date(booking.checked_in_at).getTime()) / 60000,
          )
        }
      }
    } else {
      booking.status = event.status
    }

    mockDb.status_log.push({
      log_id: crypto.randomUUID(),
      booking_id: event.bookingId,
      from_status: from,
      to_status: event.kind === "advance" ? event.to : event.status,
      changed_by: event.changedBy,
      created_at: new Date().toISOString(),
    })
    notifyMock(booking.center_id)
  }

  if (echo) mockChannel?.postMessage(event)
}

mockChannel?.addEventListener("message", (e) => {
  applyMockEvent(e.data as MockEvent, false)
})

const latency = () => new Promise((r) => setTimeout(r, 120 + Math.random() * 180))

const mockRepository: Repository = {
  mode: "mock",

  async listCenters() {
    await latency()
    return [...mockDb.centers]
  },

  async listQueue(centerId, date) {
    await latency()
    const rows = mockDb.bookings
      .filter((b) => b.center_id === centerId)
      .map<QueueEntry>((b) => {
        const farmer = mockDb.farmers.find((f) => f.farmer_id === b.farmer_id) ?? null
        const slot = mockDb.slots.find((s) => s.slot_id === b.slot_id) ?? null
        return {
          ...b,
          farmer: farmer
            ? {
                farmer_id: farmer.farmer_id,
                full_name: farmer.full_name,
                phone_number: farmer.phone_number,
                village: farmer.village,
              }
            : null,
          slot: slot
            ? {
                slot_id: slot.slot_id,
                slot_date: slot.slot_date,
                slot_start_time: slot.slot_start_time,
                slot_end_time: slot.slot_end_time,
              }
            : null,
          live_position: null,
        }
      })
      .filter((r) => !r.slot || r.slot.slot_date === date)
      .sort(sortQueue)
    return withLivePositions(rows)
  },

  async listStatusLog(centerId, date) {
    await latency()
    const bookingIds = new Set(
      mockDb.bookings.filter((b) => b.center_id === centerId).map((b) => b.booking_id),
    )
    return mockDb.status_log
      .filter((l) => bookingIds.has(l.booking_id) && l.created_at.slice(0, 10) === date)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1))
  },

  async advance({ bookingId, from, to, changedBy, field }) {
    await latency()
    const booking = mockDb.bookings.find((b) => b.booking_id === bookingId)
    if (!booking) throw new Error("Booking not found")
    // Mirror the Postgres function's guard so mock mode fails the same way —
    // including when a second tab got to this token first.
    if (booking.status !== from) {
      throw new Error(`Booking already moved to ${booking.status}`)
    }
    applyMockEvent({ kind: "advance", bookingId, to, changedBy, field }, true)
  },

  async markException(bookingId, status, changedBy) {
    await latency()
    const booking = mockDb.bookings.find((b) => b.booking_id === bookingId)
    if (!booking) throw new Error("Booking not found")
    applyMockEvent({ kind: "exception", bookingId, status, changedBy }, true)
  },

  async updateCapacity(centerId, patch) {
    await latency()
    const center = mockDb.centers.find((c) => c.center_id === centerId)
    if (!center) throw new Error("Center not found")
    applyMockEvent({ kind: "capacity", centerId, patch }, true)
    return { ...center }
  },

  subscribe(centerId, onChange) {
    if (!mockListeners.has(centerId)) mockListeners.set(centerId, new Set())
    mockListeners.get(centerId)!.add(onChange)
    return () => {
      mockListeners.get(centerId)?.delete(onChange)
    }
  },
}

// ---------------------------------------------------------------------------
// Supabase implementation
// ---------------------------------------------------------------------------

/** Shape returned by the queue select below, before flattening. */
type JoinedBookingRow = Booking & {
  farmers: QueueEntry["farmer"]
  slots: QueueEntry["slot"]
}

const supabaseRepository: Repository = {
  mode: "supabase",

  async listCenters() {
    const { data, error } = await supabase!
      .from("mandi_centers")
      .select("*")
      .order("center_name")
    if (error) throw error
    return data as MandiCenter[]
  },

  async listQueue(centerId, date) {
    // Filter on the joined slot's date so we only pull today's desk. `!inner`
    // makes slots a required join, which is what the date filter needs.
    const { data, error } = await supabase!
      .from("bookings")
      .select(
        `*,
         farmers!inner ( farmer_id, full_name, phone_number, village ),
         slots!inner ( slot_id, slot_date, slot_start_time, slot_end_time )`,
      )
      .eq("center_id", centerId)
      .eq("slots.slot_date", date)
    if (error) throw error

    const rows = (data as unknown as JoinedBookingRow[])
      .map<QueueEntry>(({ farmers, slots, ...booking }) => ({
        ...booking,
        farmer: farmers,
        slot: slots,
        live_position: null,
      }))
      .sort(sortQueue)
    return withLivePositions(rows)
  },

  async listStatusLog(centerId, date) {
    const { data: bookingRows, error: bookingErr } = await supabase!
      .from("bookings")
      .select("booking_id")
      .eq("center_id", centerId)
    if (bookingErr) throw bookingErr
    const ids = (bookingRows ?? []).map((b) => b.booking_id)
    if (ids.length === 0) return []

    const { data, error } = await supabase!
      .from("status_log")
      .select("*")
      .in("booking_id", ids)
      .gte("created_at", `${date}T00:00:00`)
      .lte("created_at", `${date}T23:59:59`)
      .order("created_at")
    if (error) throw error
    return data as StatusLogEntry[]
  },

  async advance({ bookingId, to, changedBy, field }) {
    // Two writes, in this order. The desk's measurement lands first so that a
    // farmer is never shown as WEIGHED with a null weight. There is no
    // transaction spanning both — if P1 later wraps this in an Edge Function
    // or extends transition_booking_status() to take the value, collapse this.
    if (field) {
      const { error } = await supabase!
        .from("bookings")
        .update({ [field.column]: field.value })
        .eq("booking_id", bookingId)
      if (error) throw error
    }

    // THE ONE RULE: never write bookings.status directly.
    const { error } = await supabase!.rpc("transition_booking_status", {
      p_booking_id: bookingId,
      p_new_status: to,
      p_changed_by: changedBy,
    })
    if (error) throw error
  },

  async markException(bookingId, status, changedBy) {
    const { error } = await supabase!.rpc("transition_booking_status", {
      p_booking_id: bookingId,
      p_new_status: status,
      p_changed_by: changedBy,
    })
    if (error) throw error
  },

  async updateCapacity(centerId, patch) {
    const { data, error } = await supabase!
      .from("mandi_centers")
      .update(patch)
      .eq("center_id", centerId)
      .select()
      .single()
    if (error) throw error
    return data as MandiCenter
  },

  subscribe(centerId, onChange) {
    const channel = supabase!
      .channel(`officer-desk:${centerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `center_id=eq.${centerId}` },
        onChange,
      )
      .subscribe()
    return () => {
      void supabase!.removeChannel(channel)
    }
  },
}

export const repository: Repository = isLiveMode ? supabaseRepository : mockRepository
