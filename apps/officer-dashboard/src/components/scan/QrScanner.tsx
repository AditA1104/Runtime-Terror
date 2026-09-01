import * as React from "react"
import { Html5Qrcode } from "html5-qrcode"
import { CameraOff, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const REGION_ID = "agriq-qr-region"

/**
 * Scan-to-check-in. P2 generates the farmer's pass QR with qrcode.react; this
 * reads it back at the gate.
 *
 * The payload contract is not locked yet, so `parseScan` accepts the three
 * shapes it could reasonably be. Once P2 confirms, narrow it.
 */
export function parseScan(raw: string): { token?: string; bookingId?: string } {
  const text = raw.trim()

  // Shape 1: JSON, e.g. {"token_number":"LSG-1004","booking_id":"..."}
  if (text.startsWith("{")) {
    try {
      const obj = JSON.parse(text) as Record<string, unknown>
      return {
        token: typeof obj.token_number === "string" ? obj.token_number : undefined,
        bookingId: typeof obj.booking_id === "string" ? obj.booking_id : undefined,
      }
    } catch {
      // fall through to the plain-text shapes
    }
  }

  // Shape 2: a bare UUID — the booking_id.
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(text)) {
    return { bookingId: text }
  }

  // Shape 3: a bare token, e.g. LSG-1004. Also tolerates a URL ending in one.
  const tail = text.split("/").pop() ?? text
  return { token: tail.toUpperCase() }
}

interface Props {
  open: boolean
  onClose: () => void
  onScan: (result: { token?: string; bookingId?: string }, raw: string) => void
}

export function QrScanner({ open, onClose, onScan }: Props) {
  const [error, setError] = React.useState<string | null>(null)
  const [starting, setStarting] = React.useState(true)
  const scannerRef = React.useRef<Html5Qrcode | null>(null)

  // Kept in a ref so the running scanner never restarts because the parent
  // re-rendered with a new callback identity.
  const onScanRef = React.useRef(onScan)
  onScanRef.current = onScan

  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    let scanner: Html5Qrcode | null = null

    // The dialog content mounts in a portal, so wait a frame for the region.
    const timer = window.setTimeout(async () => {
      if (cancelled) return
      try {
        scanner = new Html5Qrcode(REGION_ID)
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            onScanRef.current(parseScan(decoded), decoded)
          },
          // Per-frame decode misses are normal; swallow them.
          () => {},
        )
        if (!cancelled) setStarting(false)
      } catch (err) {
        if (cancelled) return
        setStarting(false)
        setError(
          err instanceof Error
            ? `${err.message}. Camera access needs HTTPS or localhost.`
            : "Could not start the camera.",
        )
      }
    }, 60)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      const active = scannerRef.current
      scannerRef.current = null
      if (active) {
        // stop() rejects if the camera never started; that is not worth surfacing.
        active
          .stop()
          .then(() => active.clear())
          .catch(() => {})
      }
    }
  }, [open])

  React.useEffect(() => {
    if (open) {
      setError(null)
      setStarting(true)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan token pass</DialogTitle>
          <DialogDescription>
            Point the camera at the QR code on the farmer's digital token.
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-lg border border-[var(--border)] bg-black/90">
          <div id={REGION_ID} className="min-h-[260px] w-full [&_video]:w-full" />
          {starting && !error && (
            <div className="absolute inset-0 grid place-items-center text-sm text-white/80">
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Starting camera…
              </span>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 grid place-items-center px-6 text-center">
              <div className="space-y-2 text-white/85">
                <CameraOff className="mx-auto size-6" />
                <p className="text-sm">{error}</p>
                <p className="text-xs text-white/60">
                  Type the token into the search box instead.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
