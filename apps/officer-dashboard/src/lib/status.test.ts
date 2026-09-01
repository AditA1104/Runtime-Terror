import { describe, expect, it } from "vitest"
import {
  ACTIVE_STATUSES,
  CHECKPOINTS,
  STAGE_ORDER,
  TERMINAL_STATUSES,
  isTerminal,
  nextCheckpoint,
  stageIndex,
  stageProgress,
} from "./status"
import type { BookingStatus } from "./types"

const ALL_STATUSES: BookingStatus[] = [
  "BOOKED",
  "CHECKED_IN",
  "WEIGHED",
  "QUALITY_APPROVED",
  "PAYMENT_INITIATED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]

/**
 * This file mirrors transition_booking_status() in the schema. The Postgres
 * function is the enforcer — these tests exist so the UI never greys out the
 * wrong button, and so a schema change that reaches STAGE_ORDER breaks loudly
 * here rather than quietly at the desk.
 */
describe("the checkpoint chain", () => {
  it("walks the full pipeline one stage at a time", () => {
    let status: BookingStatus = "BOOKED"
    const walked: BookingStatus[] = [status]

    for (let i = 0; i < 10; i++) {
      const next = nextCheckpoint(status)
      if (!next) break
      expect(next.from).toBe(status)
      status = next.to
      walked.push(status)
    }

    expect(walked).toEqual(STAGE_ORDER)
  })

  it("never skips a stage", () => {
    for (const checkpoint of CHECKPOINTS) {
      expect(stageIndex(checkpoint.to) - stageIndex(checkpoint.from)).toBe(1)
    }
  })

  it("covers every non-terminal stage exactly once", () => {
    const froms = CHECKPOINTS.map((c) => c.from)
    expect(froms).toEqual(STAGE_ORDER.slice(0, -1))
    expect(new Set(froms).size).toBe(froms.length)
  })

  it("offers nothing past the end of the pipeline", () => {
    expect(nextCheckpoint("COMPLETED")).toBeNull()
    expect(nextCheckpoint("CANCELLED")).toBeNull()
    expect(nextCheckpoint("NO_SHOW")).toBeNull()
  })

  it("asks for a measurement at exactly the desks that record one", () => {
    const withField = CHECKPOINTS.filter((c) => c.field).map((c) => c.field!.column)
    expect(withField).toEqual(["crop_quantity_kg", "quality_grade", "payment_amount"])
    // Gate check-in and final completion capture nothing.
    expect(nextCheckpoint("BOOKED")!.field).toBeUndefined()
    expect(nextCheckpoint("PAYMENT_INITIATED")!.field).toBeUndefined()
  })

  it("marks every captured measurement required", () => {
    for (const c of CHECKPOINTS) {
      if (c.field) expect(c.field.required).toBe(true)
    }
  })
})

describe("isTerminal", () => {
  it("is true for exactly the three end states", () => {
    const terminal = ALL_STATUSES.filter(isTerminal)
    expect(terminal).toEqual(TERMINAL_STATUSES)
  })

  it("never overlaps with the active statuses", () => {
    for (const status of ACTIVE_STATUSES) {
      expect(isTerminal(status)).toBe(false)
    }
  })

  it("does not count BOOKED as active — the farmer has not arrived", () => {
    expect(ACTIVE_STATUSES).not.toContain("BOOKED")
  })
})

describe("stageProgress", () => {
  it("runs 0 to 1 across the pipeline", () => {
    expect(stageProgress("BOOKED")).toBe(0)
    expect(stageProgress("COMPLETED")).toBe(1)
  })

  it("increases monotonically through the stages", () => {
    const values = STAGE_ORDER.map(stageProgress)
    const sorted = [...values].sort((a, b) => a - b)
    expect(values).toEqual(sorted)
  })

  it("treats an abandoned booking as no progress", () => {
    // CANCELLED/NO_SHOW are not on STAGE_ORDER, so the bar must not fill.
    expect(stageProgress("CANCELLED")).toBe(0)
    expect(stageProgress("NO_SHOW")).toBe(0)
  })
})
