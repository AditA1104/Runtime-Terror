import * as React from "react"
import { Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useOfficer } from "@/hooks/useOfficer"

/**
 * Deliberately not authentication — it only captures who is on the desk so
 * status_log.changed_by is attributable.
 *
 * Real officer auth is an open question for P1: `bookings` RLS currently only
 * admits the owning farmer, so an officer needs either a role claim or an
 * `officers` table before this dashboard can write to a live database.
 */
export function SignIn() {
  const { centers, signIn, loading } = useOfficer()
  const [name, setName] = React.useState("")
  const [centerId, setCenterId] = React.useState("")

  const ready = name.trim().length >= 2 && centerId !== ""

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div
            className="mb-2 grid size-10 place-items-center rounded-lg"
            style={{ backgroundColor: "color-mix(in oklch, var(--primary) 14%, transparent)" }}
          >
            <Sprout className="size-5" style={{ color: "var(--primary)" }} />
          </div>
          <CardTitle>AgriQ officer desk</CardTitle>
          <CardDescription>
            Enter your name and the centre you are staffing. Every checkpoint you clear is
            logged against this name.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="officer-name">Officer name</Label>
            <Input
              id="officer-name"
              autoFocus
              placeholder="e.g. S. Deshpande"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && ready) signIn({ officer_name: name.trim(), center_id: centerId })
              }}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="officer-center">Procurement centre</Label>
            <Select value={centerId} onValueChange={setCenterId} disabled={loading}>
              <SelectTrigger id="officer-center">
                <SelectValue placeholder={loading ? "Loading centres…" : "Select a centre"} />
              </SelectTrigger>
              <SelectContent>
                {centers.map((c) => (
                  <SelectItem key={c.center_id} value={c.center_id}>
                    {c.center_name} · {c.crop_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            disabled={!ready}
            onClick={() => signIn({ officer_name: name.trim(), center_id: centerId })}
          >
            Open the desk
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
