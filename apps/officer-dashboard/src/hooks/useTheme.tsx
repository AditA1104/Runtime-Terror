import * as React from "react"

/**
 * Theme state, hoisted above the sign-in gate.
 *
 * This used to live inside AppShell, which only mounts once an officer is
 * signed in — so the first screen anyone saw was always light, even on a
 * device set to dark. The provider goes outside that branch so the stored (or
 * OS) preference applies to the login card too.
 */

const STORAGE_KEY = "agriq.theme"

interface ThemeContextValue {
  dark: boolean
  toggle: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function initial(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return stored === "dark"
  } catch {
    /* private window — fall through to the OS preference */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = React.useState(initial)

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light")
    } catch {
      /* non-fatal — the choice just won't survive a reload */
    }
  }, [dark])

  // Follow the OS while the officer has not made an explicit choice. A desk
  // terminal that flips to dark at dusk should not need someone to press it.
  React.useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    if (stored) return

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const value = React.useMemo(
    () => ({ dark, toggle: () => setDark((d) => !d) }),
    [dark],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>")
  return ctx
}
