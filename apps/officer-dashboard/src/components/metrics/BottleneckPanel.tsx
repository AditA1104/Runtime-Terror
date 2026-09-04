import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { STATUS_COLOR_VAR, STATUS_LABEL } from "@/lib/status"
import { formatDuration } from "@/lib/format"
import type { DeskMetrics } from "@/lib/metrics"

/**
 * Where the hall is backing up. Horizontal bars: length is farmers waiting,
 * the ramp step is how far along the pipeline that stage sits.
 *
 * Bars are direct-labelled with their count, so identity and value never depend
 * on colour alone, and the axis is dropped — five labelled rows do not need one.
 */
export function BottleneckPanel({ metrics }: { metrics: DeskMetrics }) {
  const stages = metrics.stages
  const max = Math.max(1, ...stages.map((s) => s.waiting))
  const bottleneck = metrics.bottleneck

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Where the queue is sitting</CardTitle>
        <CardDescription>
          Farmers currently at each stage, and how long they have been there.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage) => {
          const color = `var(${STATUS_COLOR_VAR[stage.status]})`
          const isBottleneck = bottleneck?.status === stage.status
          const widthPct = (stage.waiting / max) * 100

          return (
            <div key={stage.status} className="grid grid-cols-[9.5rem_1fr] items-center gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{STATUS_LABEL[stage.status]}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {stage.desk} desk
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Track is a lighter step of the same ramp, so an empty stage
                    still reads as part of the scale. */}
                <div
                  className="h-4 min-w-0 flex-1 rounded-sm"
                  style={{ backgroundColor: "var(--stage-track)" }}
                >
                  <div
                    className="h-full rounded-r-[4px] transition-[width] duration-500"
                    style={{
                      width: `${Math.max(widthPct, stage.waiting > 0 ? 3 : 0)}%`,
                      backgroundColor: color,
                    }}
                    title={`${stage.waiting} waiting · avg ${formatDuration(stage.avgDwellMins)}`}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-sm font-medium tabular">
                  {stage.waiting}
                </span>
                <span className="w-24 shrink-0 text-right text-xs text-muted-foreground tabular">
                  {stage.waiting > 0 ? `avg ${formatDuration(stage.avgDwellMins)}` : "—"}
                </span>
                {isBottleneck && (
                  <AlertTriangle
                    className="size-4 shrink-0"
                    style={{ color: "var(--warning)" }}
                    aria-label="Busiest stage"
                  />
                )}
              </div>
            </div>
          )
        })}

        {bottleneck ? (
          <div
            className="mt-4 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm"
            style={{
              backgroundColor: "color-mix(in oklch, var(--warning) 12%, transparent)",
            }}
          >
            <AlertTriangle
              className="mt-0.5 size-4 shrink-0"
              style={{ color: "var(--warning)" }}
            />
            <span>
              <strong>{bottleneck.desk}</strong> is the bottleneck — {bottleneck.waiting} waiting,
              longest {formatDuration(bottleneck.maxDwellMins)}. Consider opening a second
              counter here.
            </span>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
            No stage is backed up — every farmer on the floor is moving.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
