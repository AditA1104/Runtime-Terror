import type { BookingStatus, MandiCenter, QueueEntry, StatusLogEntry } from "./types"
import { CHECKPOINTS, STAGE_ORDER, stageIndex } from "./status"
import { minutesBetween, minutesSince } from "./format"

export interface StageLoad {
  status: BookingStatus
  /** Desk that clears this stage, e.g. WEIGHED is cleared by Quality Assayer. */
  desk: string
  /** Farmers currently sitting at this stage. */
  waiting: number
  /** Longest any one of them has been sitting here, in minutes. */
  maxDwellMins: number | null
  /** Mean dwell across those waiting. */
  avgDwellMins: number | null
}

export interface DeskMetrics {
  tokensIssued: number
  checkedIn: number
  inProgress: number
  completed: number
  noShow: number
  cancelled: number
  awaitingArrival: number

  /** Sum of crop_quantity_kg once the weighbridge has recorded it. */
  procuredKg: number
  targetKg: number
  targetPct: number

  /** check-in to completion, averaged over today's completed tokens. */
  avgTurnaroundMins: number | null
  medianTurnaroundMins: number | null
  /** How long those still in the hall have been waiting since check-in. */
  avgWaitOnFloorMins: number | null

  /** Throughput over the last 60 minutes, from the status log. */
  completedLastHour: number

  stages: StageLoad[]
  bottleneck: StageLoad | null

  ussdShare: number
}

function mean(xs: number[]): number | null {
  if (xs.length === 0) return null
  return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length)
}

function median(xs: number[]): number | null {
  if (xs.length === 0) return null
  const sorted = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid]
}

/**
 * When each booking last entered its current stage. Used for dwell time — the
 * bookings table only timestamps CHECKED_IN and COMPLETED, so everything in
 * between has to come from status_log.
 */
function stageEntryTimes(log: StatusLogEntry[]): Map<string, string> {
  const latest = new Map<string, string>()
  for (const entry of log) {
    const seen = latest.get(entry.booking_id)
    if (!seen || entry.created_at > seen) latest.set(entry.booking_id, entry.created_at)
  }
  return latest
}

export function computeMetrics(
  entries: QueueEntry[],
  log: StatusLogEntry[],
  center: MandiCenter | null,
): DeskMetrics {
  const entryTimes = stageEntryTimes(log)

  const completedRows = entries.filter((e) => e.status === "COMPLETED")
  const activeRows = entries.filter(
    (e) => stageIndex(e.status) >= 1 && e.status !== "COMPLETED",
  )

  const turnarounds = completedRows
    .map((e) => minutesBetween(e.checked_in_at, e.completed_at))
    .filter((m): m is number => m !== null)

  const floorWaits = activeRows
    .map((e) => minutesSince(e.checked_in_at))
    .filter((m): m is number => m !== null)

  // Stages that still have someone standing in them. COMPLETED is excluded —
  // nobody waits there — so this maps 1:1 onto the checkpoint desks.
  const stages: StageLoad[] = STAGE_ORDER.slice(0, -1).map((status) => {
    const rows = entries.filter((e) => e.status === status)
    const dwells = rows
      .map((e) => minutesSince(entryTimes.get(e.booking_id) ?? e.checked_in_at ?? e.created_at))
      .filter((m): m is number => m !== null)
    return {
      status,
      desk: CHECKPOINTS.find((c) => c.from === status)?.desk ?? "—",
      waiting: rows.length,
      maxDwellMins: dwells.length ? Math.max(...dwells) : null,
      avgDwellMins: mean(dwells),
    }
  })

  // The bottleneck is the stage costing the most farmer-minutes, not simply the
  // longest queue — three farmers stuck 40 minutes beats ten who just arrived.
  const bottleneck =
    stages
      .filter((s) => s.waiting > 0 && s.status !== "BOOKED")
      .sort((a, b) => (b.waiting * (b.avgDwellMins ?? 0)) - (a.waiting * (a.avgDwellMins ?? 0)))[0] ??
    null

  const hourAgo = Date.now() - 3600_000
  const completedLastHour = log.filter(
    (l) => l.to_status === "COMPLETED" && new Date(l.created_at).getTime() >= hourAgo,
  ).length

  const procuredKg = entries
    .filter((e) => stageIndex(e.status) >= 2)
    .reduce((sum, e) => sum + (e.crop_quantity_kg ?? 0), 0)

  const targetKg = center?.daily_capacity_kg ?? 0
  const ussdCount = entries.filter((e) => e.created_via === "ussd").length

  return {
    tokensIssued: entries.length,
    checkedIn: entries.filter((e) => stageIndex(e.status) >= 1).length,
    inProgress: activeRows.length,
    completed: completedRows.length,
    noShow: entries.filter((e) => e.status === "NO_SHOW").length,
    cancelled: entries.filter((e) => e.status === "CANCELLED").length,
    awaitingArrival: entries.filter((e) => e.status === "BOOKED").length,

    procuredKg,
    targetKg,
    targetPct: targetKg > 0 ? Math.min(100, (procuredKg / targetKg) * 100) : 0,

    avgTurnaroundMins: mean(turnarounds),
    medianTurnaroundMins: median(turnarounds),
    avgWaitOnFloorMins: mean(floorWaits),

    completedLastHour,
    stages,
    bottleneck,
    ussdShare: entries.length > 0 ? (ussdCount / entries.length) * 100 : 0,
  }
}
