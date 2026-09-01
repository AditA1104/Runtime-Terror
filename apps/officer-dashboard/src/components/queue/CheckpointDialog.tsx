import * as React from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import type { QueueEntry } from "@/lib/types"
import { QUALITY_GRADES, type Checkpoint } from "@/lib/status"
import type { AdvanceInput } from "@/data/repository"
import { formatPhone } from "@/lib/format"

interface Props {
  entry: QueueEntry | null
  checkpoint: Checkpoint | null
  officerName: string
  onClose: () => void
  onConfirm: (input: AdvanceInput) => Promise<void>
}

/**
 * One dialog serves every checkpoint. Which measurement it asks for comes from
 * the checkpoint definition in lib/status.ts, so adding a desk means adding an
 * entry there — not another dialog component.
 */
export function CheckpointDialog({
  entry,
  checkpoint,
  officerName,
  onClose,
  onConfirm,
}: Props) {
  const [value, setValue] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const field = checkpoint?.field
  const open = entry !== null && checkpoint !== null

  React.useEffect(() => {
    if (!open || !field) {
      setValue("")
      return
    }
    // Pre-fill from the booking so a re-open shows what was already recorded.
    const existing = entry?.[field.column]
    setValue(existing === null || existing === undefined ? "" : String(existing))
  }, [open, field, entry])

  if (!entry || !checkpoint) return null

  const numeric = field?.kind === "number"
  const parsed = numeric ? Number(value) : value
  const invalid =
    field?.required &&
    (value.trim() === "" || (numeric && (!Number.isFinite(parsed as number) || (parsed as number) <= 0)))

  async function submit() {
    if (invalid || !entry || !checkpoint) return
    setSubmitting(true)
    try {
      await onConfirm({
        bookingId: entry.booking_id,
        from: entry.status,
        to: checkpoint.to,
        changedBy: officerName,
        field: field ? { column: field.column, value: numeric ? Number(value) : value } : undefined,
      })
      toast.success(`${entry.token_number} → ${checkpoint.action.toLowerCase()} done`, {
        description: entry.farmer?.full_name ?? undefined,
      })
      onClose()
    } catch (err) {
      // Surfaces the Postgres function's own rejection text, which is the most
      // useful thing to show when two officers act on the same token at once.
      toast.error("Could not advance this token", {
        description: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !submitting && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{checkpoint.action}</DialogTitle>
          <DialogDescription>
            {checkpoint.desk} desk · token{" "}
            <span className="tabular font-medium text-foreground">{entry.token_number}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-[var(--border)] bg-muted/40 px-3 py-2.5 text-sm">
          <div className="font-medium">{entry.farmer?.full_name ?? "Unknown farmer"}</div>
          <div className="text-muted-foreground tabular">
            {formatPhone(entry.farmer?.phone_number ?? null)}
            {entry.farmer?.village ? ` · ${entry.farmer.village}` : ""}
          </div>
        </div>

        {field && (
          <div className="grid gap-2">
            <Label htmlFor="checkpoint-field">
              {field.label}
              {field.unit ? ` (${field.unit})` : ""}
            </Label>
            {field.kind === "grade" ? (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger id="checkpoint-field">
                  <SelectValue placeholder="Select a grade" />
                </SelectTrigger>
                <SelectContent>
                  {QUALITY_GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="checkpoint-field"
                type="number"
                inputMode="decimal"
                min={0}
                autoFocus
                className="tabular"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void submit()}
                placeholder={field.column === "crop_quantity_kg" ? "e.g. 1250" : "e.g. 34000"}
              />
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={!!invalid || submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            {checkpoint.action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
