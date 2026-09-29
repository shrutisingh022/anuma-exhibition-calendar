import { Badge } from "@/components/ui/badge"

export function SectorBadges({ sectors, max }: { sectors: string[]; max?: number }) {
  const shown = max ? sectors.slice(0, max) : sectors
  const rest = sectors.length - shown.length
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((s) => (
        <Badge key={s} variant="outline">
          {s}
        </Badge>
      ))}
      {rest > 0 && (
        <Badge variant="outline" title={sectors.slice(shown.length).join(", ")}>
          +{rest}
        </Badge>
      )}
    </div>
  )
}
