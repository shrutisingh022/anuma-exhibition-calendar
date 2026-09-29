import * as React from "react"
import { format, startOfMonth } from "date-fns"

import { formatRange, outreachFrom, outreachOpen, start } from "@/lib/dates"
import type { Expo } from "@/data/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SectorBadges } from "./sector-badges"
import { StatusLabel } from "./status"

export function ListView({
  expos,
  onSelect,
}: {
  expos: Expo[]
  onSelect: (e: Expo) => void
}) {
  const groups = React.useMemo(() => {
    const byMonth = new Map<string, Expo[]>()
    for (const e of [...expos].sort((a, b) => start(a).getTime() - start(b).getTime())) {
      const key = startOfMonth(start(e)).toISOString()
      byMonth.set(key, [...(byMonth.get(key) ?? []), e])
    }
    return [...byMonth.entries()]
  }, [expos])

  if (expos.length === 0) {
    return (
      <div className="rounded-lg py-16 text-center text-xs text-muted-foreground ring-1 ring-foreground/10">
        No exhibitions match these filters
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[34%] pl-4">Exhibition</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead className="hidden lg:table-cell">Sectors</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="hidden pr-4 md:table-cell">Reach out from</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map(([key, rows]) => (
            <React.Fragment key={key}>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableCell colSpan={6} className="py-1.5 pl-4 font-medium">
                  {format(new Date(key), "MMMM yyyy")}
                  <span className="ml-2 font-normal text-muted-foreground tabular-nums">
                    {rows.length}
                  </span>
                </TableCell>
              </TableRow>
              {rows.map((e) => (
                <TableRow
                  key={e.id}
                  className="cursor-pointer"
                  onClick={() => onSelect(e)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault()
                      onSelect(e)
                    }
                  }}
                  tabIndex={0}
                >
                  <TableCell className="max-w-0 pl-4">
                    <span className="block truncate font-medium">{e.name}</span>
                    <span className="block truncate text-muted-foreground">
                      {e.organiser}
                      <span className="md:hidden"> · {e.city}</span>
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums whitespace-nowrap">
                    {formatRange(e)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="block">{e.city}</span>
                    <span className="block text-muted-foreground">{e.state}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <SectorBadges sectors={e.sectors} max={2} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusLabel status={e.status} />
                  </TableCell>
                  <TableCell className="hidden pr-4 tabular-nums whitespace-nowrap md:table-cell">
                    {outreachOpen(e) ? (
                      <span className="font-medium">Now</span>
                    ) : (
                      format(outreachFrom(e), "d MMM yyyy")
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
