/** Today as a Postgres DATE string in the browser's local timezone. */
export function todayISO(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** '08:00:00' -> '8:00 AM'. Postgres TIME columns arrive with seconds. */
export function formatTime(time: string | null): string {
  if (!time) return "—"
  const [h, m] = time.split(":").map(Number)
  if (Number.isNaN(h)) return time
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m ?? 0).padStart(2, "0")} ${period}`
}

export function formatSlot(start: string | null, end: string | null): string {
  if (!start) return "—"
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start)
}

/** Minutes elapsed since an ISO timestamp, or null if the timestamp is absent. */
export function minutesSince(iso: string | null): number | null {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return null
  return Math.max(0, Math.round((Date.now() - then) / 60000))
}

export function minutesBetween(from: string | null, to: string | null): number | null {
  if (!from || !to) return null
  const a = new Date(from).getTime()
  const b = new Date(to).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.max(0, Math.round((b - a) / 60000))
}

/** 95 -> '1h 35m', 42 -> '42m'. */
export function formatDuration(mins: number | null): string {
  if (mins === null || Number.isNaN(mins)) return "—"
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

const kgFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 })

export function formatKg(kg: number | null): string {
  if (kg === null || kg === undefined) return "—"
  if (kg >= 1000) return `${(kg / 1000).toFixed(kg >= 10000 ? 0 : 1)} t`
  return `${kgFormat.format(kg)} kg`
}

export function formatKgExact(kg: number | null): string {
  if (kg === null || kg === undefined) return "—"
  return `${kgFormat.format(kg)} kg`
}

const rupeeFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

export function formatRupees(amount: number | null): string {
  if (amount === null || amount === undefined) return "—"
  return rupeeFormat.format(amount)
}

/** Masks all but the last 4 digits — the desk screen is visible to the queue. */
export function formatPhone(phone: string | null): string {
  if (!phone) return "—"
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 4) return phone
  return `•••••• ${digits.slice(-4)}`
}
