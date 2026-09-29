import * as React from "react"
import {
  addDays,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  max as maxDate,
  min as minDate,
  startOfMonth,
  startOfWeek,
} from "date-fns"

import { cn } from "@/lib/utils"
import { end, formatRange, overlaps, start } from "@/lib/dates"
import type { Expo } from "@/data/types"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { StatusDot } from "./status"

const WEEK = { weekStartsOn: 1 } as const
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MAX_LANES = 3

interface Segment {
  expo: Expo
  col: number // 0–6
  span: number
  lane: number
  startsHere: boolean
  endsHere: boolean
}

/** Places each event's slice of the week into the first lane that is free for its columns. */
function layoutWeek(weekStart: Date, expos: Expo[]): Segment[] {
  const weekEnd = addDays(weekStart, 6)
  const inWeek = expos
    .filter((e) => overlaps(e, weekStart, weekEnd))
    .sort(
      (a, b) =>
        start(a).getTime() - start(b).getTime() ||
        end(b).getTime() - end(a).getTime() ||
        a.name.localeCompare(b.name)
    )

  const laneEnds: number[] = []
  return inWeek.map((expo) => {
    const from = maxDate([start(expo), weekStart])
    const to = minDate([end(expo), weekEnd])
    const col = differenceInCalendarDays(from, weekStart)
    const span = differenceInCalendarDays(to, from) + 1
    let lane = laneEnds.findIndex((last) => last < col)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = col + span - 1
    return {
      expo,
      col,
      span,
      lane,
      startsHere: from.getTime() === start(expo).getTime(),
      endsHere: to.getTime() === end(expo).getTime(),
    }
  })
}

export function MonthView({
  month,
  expos,
  onSelect,
}: {
  month: Date
  expos: Expo[]
  onSelect: (e: Expo) => void
}) {
  const weeks = React.useMemo(() => {
    const first = startOfWeek(startOfMonth(month), WEEK)
    const last = endOfWeek(endOfMonth(month), WEEK)
    const out: Date[] = []
    for (let d = first; d <= last; d = addDays(d, 7)) out.push(d)
    return out
  }, [month])

  const inMonth = React.useMemo(
    () =>
      expos
        .filter((e) => overlaps(e, startOfMonth(month), endOfMonth(month)))
        .sort((a, b) => start(a).getTime() - start(b).getTime()),
    [expos, month]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="px-2 py-1.5 text-[0.625rem] font-medium text-muted-foreground"
            >
              <span className="sm:hidden">{d[0]}</span>
              <span className="hidden sm:inline">{d}</span>
            </div>
          ))}
        </div>
        {weeks.map((w) => (
          <WeekRow
            key={w.toISOString()}
            weekStart={w}
            month={month}
            expos={inMonth}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Phones get the month as a list under the grid; bars don't fit at that width. */}
      <div className="flex flex-col gap-1 sm:hidden">
        {inMonth.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No exhibitions this month
          </p>
        ) : (
          inMonth.map((e) => (
            <AgendaRow key={e.id} expo={e} onSelect={onSelect} />
          ))
        )}
      </div>
    </div>
  )
}

function WeekRow({
  weekStart,
  month,
  expos,
  onSelect,
}: {
  weekStart: Date
  month: Date
  expos: Expo[]
  onSelect: (e: Expo) => void
}) {
  const segments = React.useMemo(
    () => layoutWeek(weekStart, expos),
    [weekStart, expos]
  )
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const onDay = (i: number) =>
    segments.filter((s) => s.col <= i && s.col + s.span - 1 >= i)
  const hiddenOn = (i: number) =>
    onDay(i).filter((s) => s.lane >= MAX_LANES).length

  return (
    <div className="relative grid grid-cols-7 border-b last:border-b-0">
      {days.map((d, i) => {
        const outside = !isSameMonth(d, month)
        const count = onDay(i).length
        return (
          <div
            key={i}
            className={cn(
              "min-h-14 border-r px-1.5 pt-1 last:border-r-0 sm:min-h-[7.25rem]",
              outside && "bg-muted/30"
            )}
          >
            <span
              className={cn(
                "inline-flex size-5 items-center justify-center rounded-full text-[0.6875rem] tabular-nums",
                outside && "text-muted-foreground/60",
                isToday(d) && "bg-primary font-medium text-primary-foreground"
              )}
            >
              {format(d, "d")}
            </span>
            {/* Phone: one dot per event on the day, up to three. */}
            {count > 0 && (
              <div className="mt-1 flex gap-0.5 sm:hidden">
                {Array.from({ length: Math.min(count, 3) }, (_, k) => (
                  <span key={k} className="size-1 rounded-full bg-foreground/70" />
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div
        className="pointer-events-none absolute inset-x-0 top-7 hidden grid-cols-7 gap-y-0.5 px-0.5 sm:grid"
        style={{ gridAutoRows: "1.25rem" }}
      >
        {segments
          .filter((s) => s.lane < MAX_LANES)
          .map((s) => (
            <button
              key={s.expo.id}
              type="button"
              onClick={() => onSelect(s.expo)}
              title={`${s.expo.name} · ${formatRange(s.expo)} · ${s.expo.city}`}
              style={{
                gridColumn: `${s.col + 1} / span ${s.span}`,
                gridRow: s.lane + 1,
              }}
              className={cn(
                "pointer-events-auto mx-0.5 flex min-w-0 items-center gap-1 px-1.5 text-left text-[0.6875rem] font-medium transition-colors",
                "bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.11] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                s.expo.status === "expected" &&
                  "border border-dashed border-foreground/25 bg-transparent",
                s.startsHere ? "rounded-l-md" : "-ml-0.5 rounded-l-none",
                s.endsHere ? "rounded-r-md" : "-mr-0.5 rounded-r-none"
              )}
            >
              {s.startsHere && <StatusDot status={s.expo.status} />}
              <span className="truncate">
                {!s.startsHere && "… "}
                {s.expo.name}
              </span>
            </button>
          ))}

        {days.map((d, i) => {
          const hidden = hiddenOn(i)
          if (!hidden) return null
          return (
            <Popover key={`more-${i}`}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  style={{ gridColumn: i + 1, gridRow: MAX_LANES + 1 }}
                  className="pointer-events-auto mx-0.5 rounded-md px-1.5 text-left text-[0.6875rem] text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  +{hidden} more
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-2">
                <p className="px-1 pb-1.5 text-xs font-medium">
                  {format(d, "EEEE, d MMM")}
                </p>
                <div className="flex flex-col gap-0.5">
                  {onDay(i).map((s) => (
                    <AgendaRow key={s.expo.id} expo={s.expo} onSelect={onSelect} />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )
        })}
      </div>
    </div>
  )
}

export function AgendaRow({
  expo,
  onSelect,
}: {
  expo: Expo
  onSelect: (e: Expo) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(expo)}
      className="flex w-full items-start gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-muted"
    >
      <StatusDot status={expo.status} className="mt-1" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-medium">{expo.name}</span>
        <span className="block truncate text-[0.6875rem] text-muted-foreground">
          {formatRange(expo)} · {expo.city}
        </span>
      </span>
    </button>
  )
}
