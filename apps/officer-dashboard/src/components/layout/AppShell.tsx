import * as React from "react"
import { LogOut, Moon, Sprout, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useOfficer } from "@/hooks/useOfficer"
import { repository } from "@/data/repository"

function useTheme() {
  const [dark, setDark] = React.useState(() => {
    try {
      const stored = localStorage.getItem("agriq.theme")
      if (stored) return stored === "dark"
    } catch {
      /* private window — fall through to the OS preference */
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem("agriq.theme", dark ? "dark" : "light")
    } catch {
      /* non-fatal */
    }
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, center, centers, setCenter, signOut } = useOfficer()
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2">
            <div
              className="grid size-8 place-items-center rounded-lg"
              style={{
                backgroundColor: "color-mix(in oklch, var(--primary) 14%, transparent)",
              }}
            >
              <Sprout className="size-4" style={{ color: "var(--primary)" }} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">AgriQ</div>
              <div className="text-xs text-muted-foreground">Officer desk</div>
            </div>
          </div>

          {repository.mode === "mock" && (
            <Badge
              variant="outline"
              title="No Supabase credentials found — running on seeded local data"
            >
              Demo data
            </Badge>
          )}

          <div className="ml-auto flex items-center gap-2">
            {centers.length > 1 && (
              <Select value={session?.center_id ?? ""} onValueChange={setCenter}>
                <SelectTrigger className="w-[15rem]">
                  <SelectValue placeholder="Select a centre" />
                </SelectTrigger>
                <SelectContent>
                  {centers.map((c) => (
                    <SelectItem key={c.center_id} value={c.center_id}>
                      {c.center_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-medium">{session?.officer_name || "Officer"}</div>
              <div className="text-xs text-muted-foreground">
                {center?.crop_type ?? "—"}
              </div>
            </div>

            <Button size="icon" variant="ghost" onClick={toggle} title="Toggle theme">
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Button size="icon" variant="ghost" onClick={signOut} title="End shift">
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">{children}</main>
    </div>
  )
}
