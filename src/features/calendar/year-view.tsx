import * as React from "react"
import {

  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns"

import { cn } from "@/lib/utils"
import { outreachFrom, overlaps, start } from "@/lib/dates"
import type { Expo } from "@/data/types"
import { StatusDot } from "./status"

const WEEK = { weekStartsOn: 1 } as const
const SHOWN = 4

export function YearView({
  months,
  expos,
  onOpenMonth,
  onSelect,
}: {
  months: Date[]
  expos: Expo[]
  onOpenMonth: (m: Date) => void
  onSelect: (e: Expo) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {months.map((m) => (
        <MonthCard
          key={m.toISOString()}
          month={m}
          expos={expos}
          onOpen={() => onOpenMonth(m)}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

function MonthCard({
  month,
  expos,
  onOpen,
  onSelect,
}: {
  month: Date
  expos: Expo[]
  onOpen: () => void
  onSelect: (e: Expo) => void
}) {
  const from = startOfMonth(month)
  const to = endOfMonth(month)

  const inMonth = React.useMemo(
    () =>
      expos
        .filter((e) => overlaps(e, from, to))
        .sort((a, b) => start(a).getTime() - start(b).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expos, month]
  )
  const outreachDue = React.useMemo(
    () =>
      expos.filter((e) => isWithinInterval(outreachFrom(e), { start: from, end: to }))
        .length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expos, month]
  )

  const days = eachDayOfInterval({
    start: startOfWeek(from, WEEK),
    end: endOfWeek(to, WEEK),
  })
  const perDay = (d: Date) => inMonth.filter((e) => overlaps(e, d, d)).length

  return (
    <div className="flex flex-col gap-3 rounded-lg p-4 ring-1 ring-foreground/10">
      <div className="flex items-baseline justify-between gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="text-sm font-medium hover:underline hover:underline-offset-4"
        >
          {format(month, "MMMM yyyy")}
        </button>
        <span className="text-xs text-muted-foreground tabular-nums">
          {inMonth.length} {inMonth.length === 1 ? "event" : "events"}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${format(month, "MMMM yyyy")}`}
        className="grid grid-cols-7 gap-0.5"
      >
        {days.map((d) => {
          const n = isSameMonth(d, month) ? perDay(d) : 0
          return (
            <span
              key={d.toISOString()}
              className={cn(
                "flex h-5 items-center justify-center rounded-[3px] text-[0.5625rem] tabular-nums",
                !isSameMonth(d, month) && "invisible",
                n === 0 && "text-muted-foreground",
                n === 1 && "bg-foreground/10",
                n === 2 && "bg-foreground/25",
                n >= 3 && "bg-foreground/45 text-background",
                isToday(d) && "ring-1 ring-foreground"
              )}
            >
              {format(d, "d")}
            </span>
          )
        })}
      </button>

      <div className="flex flex-1 flex-col gap-0.5">
        {inMonth.length === 0 && (
          <p className="text-xs text-muted-foreground">No exhibitions</p>
        )}
        {inMonth.slice(0, SHOWN).map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => onSelect(e)}
            className="-mx-1.5 flex items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-muted"
          >
            <StatusDot status={e.status} />
            <span className="min-w-0 flex-1 truncate text-xs">{e.name}</span>
            <span className="shrink-0 text-[0.6875rem] text-muted-foreground tabular-nums">
              {format(start(e), "d MMM")}
            </span>
          </button>
        ))}
        {inMonth.length > SHOWN && (
          <button
            type="button"
            onClick={onOpen}
            className="-mx-1.5 rounded-md px-1.5 py-1 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            +{inMonth.length - SHOWN} more
          </button>
        )}
      </div>

      <p className="border-t pt-2.5 text-[0.6875rem] text-muted-foreground">
        {outreachDue > 0
          ? `Start outreach for ${outreachDue} ${outreachDue === 1 ? "event" : "events"}`
          : "No outreach due"}
      </p>
    </div>
  )
}

