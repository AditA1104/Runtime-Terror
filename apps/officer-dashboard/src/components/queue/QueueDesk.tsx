import * as React from "react"
import { toast } from "sonner"
import { QrCode, RefreshCw, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { QueueTable, LiveDot } from "./QueueTable"
import { CheckpointDialog } from "./CheckpointDialog"
import type { QueueEntry } from "@/lib/types"
import { ACTIVE_STATUSES, isTerminal, nextCheckpoint, type Checkpoint } from "@/lib/status"
import type { useQueue } from "@/hooks/useQueue"
import { cn } from "@/lib/utils"

/**
 * html5-qrcode is ~400kB and only matters once someone opens the scanner, so it
 * loads on demand rather than in the first paint of the desk.
 */
const QrScanner = React.lazy(() =>
  import("@/components/scan/QrScanner").then((m) => ({ default: m.QrScanner })),
)

type Filter = "all" | "expected" | "floor" | "done"

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "expected", label: "Expected" },
  { key: "floor", label: "On the floor" },
  { key: "done", label: "Finished" },
]

interface Props {
  queue: ReturnType<typeof useQueue>
  officerName: string
}

export function QueueDesk({ queue, officerName }: Props) {
  const { entries, loading, error, live, refresh, advance, markException } = queue

  const [search, setSearch] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("all")
  const [scannerOpen, setScannerOpen] = React.useState(false)
  const [highlight, setHighlight] = React.useState<string | null>(null)
  const [pending, setPending] = React.useState<{
    entry: QueueEntry
    checkpoint: Checkpoint
  } | null>(null)

  const counts = React.useMemo(
    () => ({
      all: entries.length,
      expected: entries.filter((e) => e.status === "BOOKED").length,
      floor: entries.filter((e) => ACTIVE_STATUSES.includes(e.status)).length,
      done: entries.filter((e) => isTerminal(e.status)).length,
    }),
    [entries],
  )

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries.filter((e) => {
      if (filter === "expected" && e.status !== "BOOKED") return false
      if (filter === "floor" && !ACTIVE_STATUSES.includes(e.status)) return false
      if (filter === "done" && !isTerminal(e.status)) return false
      if (!q) return true
      return (
        e.token_number.toLowerCase().includes(q) ||
        (e.farmer?.full_name ?? "").toLowerCase().includes(q) ||
        (e.farmer?.phone_number ?? "").includes(q) ||
        (e.farmer?.village ?? "").toLowerCase().includes(q)
      )
    })
  }, [entries, search, filter])

  function handleScan(result: { token?: string; bookingId?: string }, raw: string) {
    const match = entries.find(
      (e) =>
        (result.bookingId && e.booking_id === result.bookingId) ||
        (result.token && e.token_number.toUpperCase() === result.token.toUpperCase()),
    )
    setScannerOpen(false)

    if (!match) {
      toast.error("Token not on today's list", {
        description: `Scanned "${raw}". Check the farmer is at the right centre and date.`,
      })
      return
    }

    setHighlight(match.token_number)
    setSearch(match.token_number)
    setFilter("all")

    // A scan at the gate almost always means "check this farmer in", so go
    // straight to the checkpoint instead of making the officer find the row.
    const checkpoint = nextCheckpoint(match.status)
    if (checkpoint) {
      setPending({ entry: match, checkpoint })
    } else {
      toast.info(`${match.token_number} is already finished`, {
        description: match.farmer?.full_name ?? undefined,
      })
    }
  }

  async function handleException(entry: QueueEntry, status: "CANCELLED" | "NO_SHOW") {
    const verb = status === "NO_SHOW" ? "mark as a no-show" : "cancel"
    if (!window.confirm(`Really ${verb} token ${entry.token_number}? This cannot be undone.`)) {
      return
    }
    try {
      await markException(entry.booking_id, status, officerName)
      toast.success(`${entry.token_number} marked ${status === "NO_SHOW" ? "no-show" : "cancelled"}`)
    } catch (err) {
      toast.error("Could not update this token", {
        description: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8 pr-8"
            placeholder="Search token, name, phone or village…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setHighlight(null)
            }}
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearch("")
                setHighlight(null)
              }}
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="ml-1.5 tabular text-xs text-muted-foreground">
                {counts[f.key]}
              </span>
            </button>
          ))}
        </div>

        <Button variant="outline" onClick={() => setScannerOpen(true)}>
          <QrCode />
          Scan pass
        </Button>
        <Button variant="ghost" size="icon" onClick={() => void refresh()} title="Refresh">
          <RefreshCw />
        </Button>
        <LiveDot live={live} />
      </div>

      {error && (
        <div
          className="rounded-lg px-3 py-2.5 text-sm"
          style={{
            backgroundColor: "color-mix(in oklch, var(--destructive) 12%, transparent)",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <QueueTable
          entries={visible}
          onAdvance={(entry, checkpoint) => setPending({ entry, checkpoint })}
          onException={(entry, status) => void handleException(entry, status)}
          highlightToken={highlight}
        />
      )}

      <CheckpointDialog
        entry={pending?.entry ?? null}
        checkpoint={pending?.checkpoint ?? null}
        officerName={officerName}
        onClose={() => setPending(null)}
        onConfirm={advance}
      />

      {scannerOpen && (
        <React.Suspense fallback={null}>
          <QrScanner open onClose={() => setScannerOpen(false)} onScan={handleScan} />
        </React.Suspense>
      )}
    </div>
  )
}
