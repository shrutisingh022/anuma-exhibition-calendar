import { cn } from "@/lib/utils"
import { STATUS_HINT, STATUS_LABEL, type ExpoStatus } from "@/data/types"

/** Solid = confirmed on the official site, hollow = directory only, dashed = dates not out yet. */
export function StatusDot({
  status,
  className,
}: {
  status: ExpoStatus
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full",
        status === "confirmed" && "bg-foreground",
        status === "listed" && "ring-1 ring-foreground ring-inset",
        status === "expected" && "border border-dashed border-foreground/70",
        className
      )}
    />
  )
}

export function StatusLabel({ status }: { status: ExpoStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs" title={STATUS_HINT[status]}>
      <StatusDot status={status} />
      {STATUS_LABEL[status]}
    </span>
  )
}

export function StatusLegend({ statuses }: { statuses: ExpoStatus[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] text-muted-foreground">
      {statuses.map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5" title={STATUS_HINT[s]}>
          <StatusDot status={s} />
          {STATUS_LABEL[s]}
          <span className="hidden text-muted-foreground/70 lg:inline">· {STATUS_HINT[s].toLowerCase()}</span>
        </span>
      ))}
    </div>
  )
}
