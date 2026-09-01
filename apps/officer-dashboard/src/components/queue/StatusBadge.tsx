import type { BookingStatus } from "@/lib/types"
import { STATUS_COLOR_VAR, STATUS_LABEL } from "@/lib/status"
import { cn } from "@/lib/utils"

export function StatusBadge({
  status,
  className,
}: {
  status: BookingStatus
  className?: string
}) {
  const color = `var(${STATUS_COLOR_VAR[status]})`
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
      style={{ backgroundColor: `color-mix(in oklch, ${color} 16%, transparent)` }}
    >
      {/* The dot carries stage identity; the label stays in ink. Colouring the
          text too would put a light ramp step on the surface as type, which is
          where contrast fails first. */}
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-foreground">{STATUS_LABEL[status]}</span>
    </span>
  )
}

/** Six dots showing where a booking sits in the pipeline. */
export function StageTrack({ status }: { status: BookingStatus }) {
  const order: BookingStatus[] = [
    "BOOKED",
    "CHECKED_IN",
    "WEIGHED",
    "QUALITY_APPROVED",
    "PAYMENT_INITIATED",
    "COMPLETED",
  ]
  const idx = order.indexOf(status)
  const dead = status === "CANCELLED" || status === "NO_SHOW"

  return (
    <div className="flex items-center gap-1" aria-hidden>
      {order.map((stage, i) => (
        <span
          key={stage}
          className="h-1 w-4 rounded-full transition-colors"
          style={{
            backgroundColor: dead
              ? "color-mix(in oklch, var(--stage-cancelled) 30%, transparent)"
              : i <= idx
                ? `var(${STATUS_COLOR_VAR[stage]})`
                : "var(--border)",
          }}
        />
      ))}
    </div>
  )
}
