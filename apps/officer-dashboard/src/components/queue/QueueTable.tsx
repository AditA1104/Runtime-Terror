import { Ban, Radio, Smartphone, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StageTrack, StatusBadge } from "./StatusBadge"
import type { QueueEntry } from "@/lib/types"
import { isTerminal, nextCheckpoint, type Checkpoint } from "@/lib/status"
import {
  formatDuration,
  formatKgExact,
  formatPhone,
  formatRupees,
  formatSlot,
  minutesSince,
} from "@/lib/format"
import { cn } from "@/lib/utils"

interface Props {
  entries: QueueEntry[]
  onAdvance: (entry: QueueEntry, checkpoint: Checkpoint) => void
  onException: (entry: QueueEntry, status: "CANCELLED" | "NO_SHOW") => void
  highlightToken?: string | null
}

/** The measurement worth showing for a row, given how far it has progressed. */
function keyFigure(entry: QueueEntry): string {
  if (entry.payment_amount != null) return formatRupees(entry.payment_amount)
  if (entry.quality_grade) return `Grade ${entry.quality_grade}`
  if (entry.crop_quantity_kg != null) return formatKgExact(entry.crop_quantity_kg)
  return "—"
}

const HEAD =
  "px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"

export function QueueTable({ entries, onAdvance, onException, highlightToken }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] px-6 py-14 text-center">
        <p className="font-medium">No tokens match</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Clear the search or pick a different status filter.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-card">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="border-b border-[var(--border)] bg-muted/40">
          <tr>
            <th className={cn(HEAD, "w-12 text-center")}>#</th>
            <th className={HEAD}>Farmer</th>
            <th className={HEAD}>Slot</th>
            <th className={HEAD}>Stage</th>
            <th className={cn(HEAD, "text-right")}>Recorded</th>
            <th className={cn(HEAD, "text-right")}>On floor</th>
            <th className={cn(HEAD, "text-right")}>Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const checkpoint = nextCheckpoint(entry.status)
            const done = isTerminal(entry.status)
            const onFloor = minutesSince(entry.checked_in_at)
            const stale = onFloor !== null && onFloor > 90 && !done
            const highlighted = highlightToken === entry.token_number

            return (
              <tr
                key={entry.booking_id}
                className={cn(
                  "border-b border-[var(--border)] last:border-0 transition-colors",
                  done ? "opacity-55" : "hover:bg-accent/40",
                  highlighted && "bg-[color-mix(in_oklch,var(--primary)_10%,transparent)]",
                )}
              >
                <td className="px-3 py-2.5 text-center tabular text-muted-foreground">
                  {entry.live_position ?? "—"}
                </td>

                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{entry.farmer?.full_name ?? "—"}</span>
                    {entry.created_via === "ussd" && (
                      <span
                        title="Booked over USSD (feature phone) — no QR pass to scan"
                        className="inline-flex items-center rounded px-1 py-0.5 text-[10px] font-medium"
                        style={{
                          color: "var(--stage-payment)",
                          backgroundColor:
                            "color-mix(in oklch, var(--stage-payment) 16%, transparent)",
                        }}
                      >
                        <Smartphone className="size-3" />
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground tabular">
                    {formatPhone(entry.farmer?.phone_number ?? null)}
                    {entry.farmer?.village ? ` · ${entry.farmer.village}` : ""}
                  </div>
                </td>

                <td className="px-3 py-2.5 whitespace-nowrap tabular text-muted-foreground">
                  {formatSlot(entry.slot?.slot_start_time ?? null, entry.slot?.slot_end_time ?? null)}
                </td>

                <td className="px-3 py-2.5">
                  <div className="flex flex-col gap-1.5">
                    <StatusBadge status={entry.status} />
                    <StageTrack status={entry.status} />
                  </div>
                </td>

                <td className="px-3 py-2.5 text-right tabular whitespace-nowrap">
                  {keyFigure(entry)}
                </td>

                <td
                  className={cn(
                    "px-3 py-2.5 text-right tabular whitespace-nowrap",
                    stale ? "font-semibold text-[var(--warning)]" : "text-muted-foreground",
                  )}
                  title={stale ? "Waiting over 90 minutes" : undefined}
                >
                  {formatDuration(onFloor)}
                </td>

                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    {checkpoint ? (
                      <Button size="sm" onClick={() => onAdvance(entry, checkpoint)}>
                        {checkpoint.action}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                    {!done && (
                      <>
                        {entry.status === "BOOKED" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            title="Mark as no-show"
                            onClick={() => onException(entry, "NO_SHOW")}
                          >
                            <UserX className="text-muted-foreground" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Cancel this token"
                          onClick={() => onException(entry, "CANCELLED")}
                        >
                          <Ban className="text-muted-foreground" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/** Small live-connection indicator shown beside the desk heading. */
export function LiveDot({ live }: { live: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs"
      style={{ color: live ? "var(--success)" : "var(--muted-foreground)" }}
      title={live ? "Subscribed to live updates" : "Not connected — polling every 30s"}
    >
      <Radio className={cn("size-3.5", live && "animate-pulse")} />
      {live ? "Live" : "Polling"}
    </span>
  )
}
