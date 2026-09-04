import * as React from "react"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { repository, type CapacityPatch } from "@/data/repository"
import { useOfficer } from "@/hooks/useOfficer"
import { formatKgExact } from "@/lib/format"

/** '08:00:00' from Postgres -> '08:00' for <input type="time">, and back. */
const toInputTime = (t: string | null) => (t ? t.slice(0, 5) : "")
const toPgTime = (t: string) => (t.length === 5 ? `${t}:00` : t)

export function CapacityPanel() {
  const { center, replaceCenter } = useOfficer()
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState({
    daily_capacity_kg: "",
    hourly_intake_limit: "",
    avg_processing_min: "",
    operating_start: "",
    operating_end: "",
  })

  React.useEffect(() => {
    if (!center) return
    setForm({
      daily_capacity_kg: String(center.daily_capacity_kg ?? ""),
      hourly_intake_limit: String(center.hourly_intake_limit ?? ""),
      avg_processing_min: String(center.avg_processing_min ?? ""),
      operating_start: toInputTime(center.operating_start),
      operating_end: toInputTime(center.operating_end),
    })
  }, [center])

  if (!center) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Pick a centre to configure its quota.
        </CardContent>
      </Card>
    )
  }

  const dailySlots =
    Number(form.hourly_intake_limit) > 0 && form.operating_start && form.operating_end
      ? Number(form.hourly_intake_limit) *
        Math.max(
          0,
          Number(form.operating_end.slice(0, 2)) - Number(form.operating_start.slice(0, 2)),
        )
      : null

  async function save() {
    if (!center) return
    const patch: CapacityPatch = {
      daily_capacity_kg: Number(form.daily_capacity_kg),
      hourly_intake_limit: Number(form.hourly_intake_limit),
      avg_processing_min: Number(form.avg_processing_min),
      operating_start: toPgTime(form.operating_start),
      operating_end: toPgTime(form.operating_end),
    }
    if (!Number.isFinite(patch.daily_capacity_kg!) || patch.daily_capacity_kg! <= 0) {
      toast.error("Daily capacity must be a positive number")
      return
    }
    setSaving(true)
    try {
      const updated = await repository.updateCapacity(center.center_id, patch)
      replaceCenter(updated)
      toast.success("Quota updated", {
        description: "New bookings will be capped against these limits.",
      })
    } catch (err) {
      toast.error("Could not save the quota", {
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setSaving(false)
    }
  }

  const field = (
    key: keyof typeof form,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div className="grid gap-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        className="tabular"
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        {...props}
      />
    </div>
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quota &amp; capacity</CardTitle>
          <CardDescription>
            These limits drive how many tokens the booking wizard will issue, and feed
            the predictive engine's crowd penalty.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {field("daily_capacity_kg", "Daily capacity (kg)", { type: "number", min: 0 })}
          {field("hourly_intake_limit", "Farmers per hour", { type: "number", min: 0 })}
          {field("avg_processing_min", "Average processing time (min)", {
            type: "number",
            min: 0,
          })}
          <div />
          {field("operating_start", "Opens", { type: "time" })}
          {field("operating_end", "Closes", { type: "time" })}

          <div className="sm:col-span-2">
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              Save quota
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{center.center_name}</CardTitle>
          <CardDescription>
            {center.location}
            {center.district ? `, ${center.district}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Crop procured here" value={center.crop_type} />
          <Row label="Current daily target" value={formatKgExact(center.daily_capacity_kg)} />
          <Row
            label="Bookable slots per day"
            value={dailySlots !== null ? `${dailySlots} farmers` : "—"}
          />
          <p className="pt-1 text-xs text-muted-foreground">
            One centre procures one crop in this prototype, so changing the crop needs a
            schema change — flag it to P1 rather than editing it here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular">{value}</span>
    </div>
  )
}
