import { formatKgExact } from "@/lib/format"

/**
 * Procurement against the centre's daily capacity — a single ratio against a
 * limit, so a meter, not a two-slice pie.
 *
 * The fill carries severity and the unfilled track is a lighter step of the
 * same ramp, so state reads across the whole bar rather than only where it
 * stops. Severity is inverted from the usual: for a procurement target, *low*
 * is the problem and full is success.
 */
export function CapacityMeter({
  procuredKg,
  targetKg,
  pct,
}: {
  procuredKg: number
  targetKg: number
  pct: number
}) {
  const fill =
    pct >= 90 ? "var(--destructive)" : pct >= 75 ? "var(--warning)" : "var(--stage-quality)"
  const nearCapacity = pct >= 90

  return (
    <div className="rounded-xl border border-[var(--border)] bg-card p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          Capacity used today
        </span>
        <span className="text-xs text-muted-foreground tabular">
          {formatKgExact(procuredKg)} / {formatKgExact(targetKg)}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold leading-none" style={{ color: fill }}>
          {pct.toFixed(1)}%
        </span>
        {nearCapacity && (
          <span className="text-xs font-medium" style={{ color: "var(--destructive)" }}>
            Near capacity — stop issuing tokens
          </span>
        )}
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--stage-track)" }}
        role="meter"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Share of daily procurement capacity used"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(pct, pct > 0 ? 1.5 : 0)}%`, backgroundColor: fill }}
        />
      </div>
    </div>
  )
}
