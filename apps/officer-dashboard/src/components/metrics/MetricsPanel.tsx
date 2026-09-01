import { CheckCircle2, Clock, Radio, Ticket, TrendingUp, UserX } from "lucide-react"
import { HeroFigure, StatTile } from "./StatTile"
import { CapacityMeter } from "./CapacityMeter"
import { BottleneckPanel } from "./BottleneckPanel"
import { formatDuration, formatKgExact } from "@/lib/format"
import type { DeskMetrics } from "@/lib/metrics"
import type { MandiCenter } from "@/lib/types"

export function MetricsPanel({
  metrics,
  center,
}: {
  metrics: DeskMetrics
  center: MandiCenter | null
}) {
  const avgTurnaround = metrics.avgTurnaroundMins
  const target = center?.avg_processing_min ?? null
  // A turnaround more than double the centre's own baseline is the signal an
  // officer should act on, so the tile changes tone rather than staying inert.
  const turnaroundTone =
    avgTurnaround !== null && target !== null && avgTurnaround > target * 4
      ? "danger"
      : avgTurnaround !== null && target !== null && avgTurnaround > target * 2.5
        ? "warning"
        : "default"

  const noShowPct =
    metrics.tokensIssued > 0 ? (metrics.noShow / metrics.tokensIssued) * 100 : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <HeroFigure
          value={metrics.inProgress}
          label="Farmers on the floor right now"
          detail={`${metrics.awaitingArrival} booked but not yet arrived`}
        />
        <CapacityMeter
          procuredKg={metrics.procuredKg}
          targetKg={metrics.targetKg}
          pct={metrics.targetPct}
        />
        <StatTile
          label="Average turnaround"
          value={formatDuration(avgTurnaround)}
          detail={
            metrics.medianTurnaroundMins !== null
              ? `Median ${formatDuration(metrics.medianTurnaroundMins)} · check-in to payout`
              : "No tokens completed yet today"
          }
          icon={<Clock />}
          tone={turnaroundTone}
        />
        <StatTile
          label="Cleared in the last hour"
          value={String(metrics.completedLastHour)}
          detail={`${metrics.completed} completed since opening`}
          icon={<TrendingUp />}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Tokens issued today"
          value={String(metrics.tokensIssued)}
          detail={`${metrics.ussdShare.toFixed(0)}% booked over USSD`}
          icon={<Ticket />}
        />
        <StatTile
          label="Checked in"
          value={String(metrics.checkedIn)}
          detail={`${metrics.awaitingArrival} still expected`}
          icon={<CheckCircle2 />}
        />
        <StatTile
          label="No-shows"
          value={String(metrics.noShow)}
          detail={`${noShowPct.toFixed(0)}% of today's tokens · ${metrics.cancelled} cancelled`}
          icon={<UserX />}
          tone={noShowPct > 15 ? "warning" : "default"}
        />
        <StatTile
          label="Procured so far"
          value={formatKgExact(metrics.procuredKg)}
          detail={
            center ? `${center.crop_type} · target ${formatKgExact(metrics.targetKg)}` : undefined
          }
          icon={<Radio />}
        />
      </div>

      <BottleneckPanel metrics={metrics} />
    </div>
  )
}
