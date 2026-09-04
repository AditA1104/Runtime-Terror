import * as React from "react"
import { repository } from "@/data/repository"
import { DEFAULT_CENTER_ID, isLiveMode } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import type { MandiCenter, OfficerSession } from "@/lib/types"

const STORAGE_KEY = "agriq.officer.session"

interface OfficerContextValue {
  session: OfficerSession | null
  center: MandiCenter | null
  centers: MandiCenter[]
  loading: boolean
  signIn: (session: OfficerSession) => void
  signOut: () => void
  /**
   * What goes into status_log.changed_by. Live mode writes the officer's real
   * auth UID; mock mode has no auth server, so it writes the typed name.
   */
  changedBy: string
  setCenter: (centerId: string) => void
  /** Applied after a capacity edit so the header figures stay in step. */
  replaceCenter: (center: MandiCenter) => void
}

const OfficerContext = React.createContext<OfficerContextValue | null>(null)

function readStored(): OfficerSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as OfficerSession
    return parsed.officer_name && parsed.center_id ? parsed : null
  } catch {
    // Private windows and cleared site data both land here; treat as signed out.
    return null
  }
}

export function OfficerProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  // A live officer's identity comes from their `officers` row, never from a
  // text box, so the stored session is only the fallback for mock mode.
  const [session, setSession] = React.useState<OfficerSession | null>(
    isLiveMode ? null : readStored,
  )
  const [centers, setCenters] = React.useState<MandiCenter[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    repository
      .listCenters()
      .then((rows) => {
        if (cancelled) return
        setCenters(rows)
        // An env-pinned center wins on first run, so a deployed desk terminal
        // opens straight onto its own queue.
        setSession((prev) => {
          if (prev) return prev
          if (DEFAULT_CENTER_ID && rows.some((c) => c.center_id === DEFAULT_CENTER_ID)) {
            return { officer_name: "", center_id: DEFAULT_CENTER_ID }
          }
          return prev
        })
      })
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  // Adopt the officer row as the session once auth resolves it.
  React.useEffect(() => {
    if (!isLiveMode) return
    if (auth.officer) {
      setSession({
        officer_name: auth.officer.full_name,
        center_id: auth.officer.center_id ?? "",
      })
    } else {
      setSession(null)
    }
  }, [auth.officer])

  const persist = React.useCallback((next: OfficerSession | null) => {
    setSession(next)
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Non-fatal — the session just won't survive a reload.
    }
  }, [])

  const value = React.useMemo<OfficerContextValue>(
    () => ({
      session,
      centers,
      loading,
      center: session ? (centers.find((c) => c.center_id === session.center_id) ?? null) : null,
      signIn: persist,
      signOut: () => {
        if (isLiveMode) void auth.signOut()
        persist(null)
      },
      changedBy: isLiveMode ? (auth.user?.id ?? "") : (session?.officer_name ?? ""),
      setCenter: (centerId) =>
        persist(session ? { ...session, center_id: centerId } : null),
      replaceCenter: (updated) =>
        setCenters((prev) =>
          prev.map((c) => (c.center_id === updated.center_id ? updated : c)),
        ),
    }),
    [session, centers, loading, persist, auth],
  )

  return <OfficerContext.Provider value={value}>{children}</OfficerContext.Provider>
}

export function useOfficer(): OfficerContextValue {
  const ctx = React.useContext(OfficerContext)
  if (!ctx) throw new Error("useOfficer must be used inside <OfficerProvider>")
  return ctx
}
