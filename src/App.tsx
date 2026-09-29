import * as React from "react"
import {
  addMonths,
  differenceInCalendarMonths,
  format,
  isAfter,
  isBefore,
  startOfMonth,
} from "date-fns"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import rawExpos from "@/data/events.json"
import type { Expo } from "@/data/types"
import { overlaps } from "@/lib/dates"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { EventSheet } from "@/features/calendar/event-sheet"
import {
  EMPTY_FILTERS,
  Filters,
  isFiltered,
  type FilterState,
} from "@/features/calendar/filters"
import { ListView } from "@/features/calendar/list-view"
import { MonthView } from "@/features/calendar/month-view"
import { StatusLegend } from "@/features/calendar/status"
import { YearView } from "@/features/calendar/year-view"

const RANGE_START = new Date(2026, 9, 1) // 1 Oct 2026
const RANGE_END = new Date(2027, 11, 31) // 31 Dec 2027
const MONTHS = Array.from(
  { length: differenceInCalendarMonths(RANGE_END, RANGE_START) + 1 },
  (_, i) => addMonths(RANGE_START, i)
)

const ALL: Expo[] = (rawExpos as Expo[]).filter((e) =>
  overlaps(e, RANGE_START, RANGE_END)
)

type View = "month" | "year" | "list"

function matches(e: Expo, f: FilterState) {
  if (f.status !== "all" && e.status !== f.status) return false
  if (f.state !== "all" && e.state !== f.state) return false
  if (f.sectors.length && !e.sectors.some((s) => f.sectors.includes(s))) return false
  if (f.query) {
    const q = f.query.toLowerCase()
    const hay = `${e.name} ${e.organiser} ${e.city} ${e.state} ${e.venue}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}

function initialMonth() {
  const now = startOfMonth(new Date())
  if (isBefore(now, RANGE_START)) return RANGE_START
  if (isAfter(now, RANGE_END)) return startOfMonth(RANGE_END)
  return now
}

export function App() {
  const [view, setView] = React.useState<View>("month")
  const [month, setMonth] = React.useState(initialMonth)
  const [filters, setFilters] = React.useState<FilterState>(EMPTY_FILTERS)
  const [selected, setSelected] = React.useState<Expo | null>(null)

  const expos = React.useMemo(() => ALL.filter((e) => matches(e, filters)), [filters])

  const sectorCounts = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of ALL) for (const s of e.sectors) counts.set(s, (counts.get(s) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [])
  const states = React.useMemo(
    () => [...new Set(ALL.map((e) => e.state))].sort(),
    []
  )
  const statuses = (["confirmed", "listed", "expected"] as const).filter((s) =>
    ALL.some((e) => e.status === s)
  )
  const confirmed = ALL.filter((e) => e.status === "confirmed").length

  const first = MONTHS[0]
  const last = MONTHS[MONTHS.length - 1]
  const canPrev = isAfter(month, first)
  const canNext = isBefore(month, last)

  return (
    <TooltipProvider>
      <div className="min-h-svh bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:py-8">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold tracking-tight">Exhibition calendar</h1>
              <p className="text-xs text-muted-foreground">
                Manufacturing trade fairs across India, Oct 2026 to Dec 2027
              </p>
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">
              {ALL.length} exhibitions · {confirmed} confirmed
            </p>
          </header>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Tabs value={view} onValueChange={(v) => setView(v as View)}>
              <TabsList>
                <TabsTrigger value="month" className="px-3">Month</TabsTrigger>
                <TabsTrigger value="year" className="px-3">Year</TabsTrigger>
                <TabsTrigger value="list" className="px-3">List</TabsTrigger>
              </TabsList>
            </Tabs>

            {view === "month" && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  onClick={() => setMonth(initialMonth())}
                  className="mr-1"
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous month"
                  disabled={!canPrev}
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                >
                  <ChevronLeftIcon />
                </Button>
                <span className="w-28 text-center text-sm font-medium tabular-nums">
                  {format(month, "MMMM yyyy")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next month"
                  disabled={!canNext}
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                >
                  <ChevronRightIcon />
                </Button>
              </div>
            )}
          </div>

          <Filters
            value={filters}
            onChange={setFilters}
            sectorCounts={sectorCounts}
            states={states}
            statuses={[...statuses]}
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusLegend statuses={[...statuses]} />
            {isFiltered(filters) && (
              <p className="text-[0.6875rem] text-muted-foreground tabular-nums">
                Showing {expos.length} of {ALL.length}
              </p>
            )}
          </div>

          {view === "month" && (
            <MonthView month={month} expos={expos} onSelect={setSelected} />
          )}
          {view === "year" && (
            <YearView
              months={MONTHS}
              expos={expos}
              onSelect={setSelected}
              onOpenMonth={(m) => {
                setMonth(m)
                setView("month")
              }}
            />
          )}
          {view === "list" && <ListView expos={expos} onSelect={setSelected} />}

          <footer className="border-t pt-4 text-[0.6875rem] leading-relaxed text-muted-foreground">
            Dates are checked against each organiser's official site where possible. Always
            confirm on the official site before booking travel or a stand.
          </footer>
        </div>

        <EventSheet expo={selected} onOpenChange={(o) => !o && setSelected(null)} />
      </div>
    </TooltipProvider>
  )
}

export default App
