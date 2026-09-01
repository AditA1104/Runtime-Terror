import * as React from "react"
import { cn } from "@/lib/utils"

interface StatTileProps {
  label: string
  value: string
  /** Secondary line — a denominator, a share, or a qualifier. */
  detail?: string
  icon?: React.ReactNode
  /** Draws attention when a number needs acting on (e.g. a long wait). */
  tone?: "default" | "warning" | "danger"
  className?: string
}

/**
 * Stat tile per the dataviz contract: label in sentence case, value in
 * proportional figures (tabular-nums is for columns, not display numbers),
 * optional detail line. No sparkline — a mandi day is a single shift, so there
 * is no meaningful 12-point history to draw.
 */
export function StatTile({
  label,
  value,
  detail,
  icon,
  tone = "default",
  className,
}: StatTileProps) {
  const toneColor =
    tone === "warning" ? "var(--warning)" : tone === "danger" ? "var(--destructive)" : undefined

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-card p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>}
      </div>
      <div
        className="mt-1.5 text-2xl font-semibold leading-tight"
        style={toneColor ? { color: toneColor } : undefined}
      >
        {value}
      </div>
      {detail && <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>}
    </div>
  )
}

/**
 * The one number the desk leads with. Exactly one per view, per the hero-figure
 * rule — here it is the live count of farmers physically in the hall.
 */
export function HeroFigure({
  value,
  label,
  detail,
}: {
  value: number
  label: string
  detail?: string
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-card p-5 shadow-sm">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-5xl font-semibold leading-none">{value}</div>
      {detail && <div className="mt-2 text-sm text-muted-foreground">{detail}</div>}
    </div>
  )
}
