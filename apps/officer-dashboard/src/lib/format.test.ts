import { afterEach, describe, expect, it, vi } from "vitest"
import {
  formatDuration,
  formatKg,
  formatKgExact,
  formatPhone,
  formatRupees,
  formatSlot,
  formatTime,
  minutesBetween,
  minutesSince,
  todayISO,
} from "./format"

afterEach(() => {
  vi.useRealTimers()
})

describe("formatTime", () => {
  it("converts a Postgres TIME to 12-hour", () => {
    expect(formatTime("08:00:00")).toBe("8:00 AM")
    expect(formatTime("13:30:00")).toBe("1:30 PM")
  })

  it("handles both ends of the clock", () => {
    expect(formatTime("00:00:00")).toBe("12:00 AM")
    expect(formatTime("12:00:00")).toBe("12:00 PM")
  })

  it("returns a dash for null", () => {
    expect(formatTime(null)).toBe("—")
  })
})

describe("formatSlot", () => {
  it("renders a range", () => {
    expect(formatSlot("08:00:00", "09:00:00")).toBe("8:00 AM – 9:00 AM")
  })

  it("falls back to the start alone when there is no end", () => {
    expect(formatSlot("08:00:00", null)).toBe("8:00 AM")
  })

  it("returns a dash with no start", () => {
    expect(formatSlot(null, "09:00:00")).toBe("—")
  })
})

describe("formatDuration", () => {
  it("shows bare minutes under an hour", () => {
    expect(formatDuration(42)).toBe("42m")
    expect(formatDuration(0)).toBe("0m")
  })

  it("splits hours and minutes", () => {
    expect(formatDuration(95)).toBe("1h 35m")
  })

  it("drops the minutes on a whole hour", () => {
    expect(formatDuration(120)).toBe("2h")
  })

  it("returns a dash for null", () => {
    expect(formatDuration(null)).toBe("—")
  })
})

describe("formatKg", () => {
  it("uses kg below a tonne", () => {
    expect(formatKg(950)).toBe("950 kg")
  })

  it("switches to tonnes with one decimal in the low thousands", () => {
    expect(formatKg(1250)).toBe("1.3 t")
  })

  it("drops the decimal past ten tonnes", () => {
    expect(formatKg(180000)).toBe("180 t")
  })

  it("returns a dash for null", () => {
    expect(formatKg(null)).toBe("—")
  })
})

describe("formatKgExact", () => {
  it("uses Indian digit grouping", () => {
    expect(formatKgExact(180000)).toBe("1,80,000 kg")
  })

  it("returns a dash for null", () => {
    expect(formatKgExact(null)).toBe("—")
  })
})

describe("formatRupees", () => {
  it("formats as INR with no paise", () => {
    expect(formatRupees(34000)).toBe("₹34,000")
  })

  it("keeps a real zero rather than showing a dash", () => {
    expect(formatRupees(0)).toBe("₹0")
  })

  it("returns a dash for null", () => {
    expect(formatRupees(null)).toBe("—")
  })
})

describe("formatPhone", () => {
  // The desk screen faces a queue of people, so only the last 4 digits show.
  it("masks all but the last four digits", () => {
    expect(formatPhone("9876543210")).toBe("•••••• 3210")
  })

  it("strips punctuation before masking", () => {
    expect(formatPhone("+91 98765-43210")).toBe("•••••• 3210")
  })

  it("returns anything too short untouched rather than mangling it", () => {
    expect(formatPhone("12")).toBe("12")
  })

  it("returns a dash for null", () => {
    expect(formatPhone(null)).toBe("—")
  })
})

describe("minutesSince / minutesBetween", () => {
  it("counts minutes back from now", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-01T10:00:00Z"))
    expect(minutesSince("2026-09-01T09:15:00Z")).toBe(45)
  })

  it("clamps a future timestamp to zero instead of going negative", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-01T10:00:00Z"))
    expect(minutesSince("2026-09-01T10:30:00Z")).toBe(0)
  })

  it("measures between two timestamps", () => {
    expect(minutesBetween("2026-09-01T09:00:00Z", "2026-09-01T10:35:00Z")).toBe(95)
  })

  it("returns null when either end is missing or unparseable", () => {
    expect(minutesSince(null)).toBeNull()
    expect(minutesSince("not a date")).toBeNull()
    expect(minutesBetween(null, "2026-09-01T10:00:00Z")).toBeNull()
    expect(minutesBetween("2026-09-01T10:00:00Z", null)).toBeNull()
  })
})

describe("todayISO", () => {
  it("returns the local date, zero-padded", () => {
    vi.useFakeTimers()
    // Deliberately a local-midday time so the local date is unambiguous.
    vi.setSystemTime(new Date(2026, 8, 5, 12, 0, 0))
    expect(todayISO()).toBe("2026-09-05")
  })
})
