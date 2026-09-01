import * as React from "react"
import { repository, type AdvanceInput } from "@/data/repository"
import type { QueueEntry, StatusLogEntry } from "@/lib/types"
import { todayISO } from "@/lib/format"

interface UseQueueResult {
  entries: QueueEntry[]
  log: StatusLogEntry[]
  loading: boolean
  error: string | null
  /** True while a realtime channel (or the mock emitter) is attached. */
  live: boolean
  refresh: () => Promise<void>
  advance: (input: AdvanceInput) => Promise<void>
  markException: (
    bookingId: string,
    status: "CANCELLED" | "NO_SHOW",
    changedBy: string,
  ) => Promise<void>
}

/**
 * Today's desk for one center, kept in step with the database.
 *
 * Realtime is the primary signal; the interval below is a safety net for a
 * dropped socket, which on venue wifi is a when, not an if.
 */
export function useQueue(centerId: string | null, date = todayISO()): UseQueueResult {
  const [entries, setEntries] = React.useState<QueueEntry[]>([])
  const [log, setLog] = React.useState<StatusLogEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [live, setLive] = React.useState(false)

  // Held in a ref so the realtime callback and the poller share one identity
  // and never capture a stale centerId.
  const load = React.useRef(async (_silent: boolean) => {})

  load.current = async (silent: boolean) => {
    if (!centerId) {
      setEntries([])
      setLog([])
      setLoading(false)
      return
    }
    if (!silent) setLoading(true)
    try {
      const [rows, logRows] = await Promise.all([
        repository.listQueue(centerId, date),
        repository.listStatusLog(centerId, date),
      ])
      setEntries(rows)
      setLog(logRows)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the queue")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    void load.current(false)
  }, [centerId, date])

  React.useEffect(() => {
    if (!centerId) return
    const unsubscribe = repository.subscribe(centerId, () => {
      void load.current(true)
    })
    setLive(true)
    const poll = window.setInterval(() => void load.current(true), 30_000)
    return () => {
      unsubscribe()
      window.clearInterval(poll)
      setLive(false)
    }
  }, [centerId, date])

  const refresh = React.useCallback(() => load.current(true), [])

  const advance = React.useCallback(async (input: AdvanceInput) => {
    await repository.advance(input)
    // Mock mode has no server push for the acting client, and a live realtime
    // event can lag the response, so reload rather than wait for the echo.
    await load.current(true)
  }, [])

  const markException = React.useCallback(
    async (bookingId: string, status: "CANCELLED" | "NO_SHOW", changedBy: string) => {
      await repository.markException(bookingId, status, changedBy)
      await load.current(true)
    },
    [],
  )

  return { entries, log, loading, error, live, refresh, advance, markException }
}
