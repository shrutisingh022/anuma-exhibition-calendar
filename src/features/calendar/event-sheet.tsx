import { format } from "date-fns"
import { CalendarPlusIcon, ExternalLinkIcon } from "lucide-react"

import {
  durationDays,
  formatRange,
  OUTREACH_LEAD_WEEKS,
  outreachFrom,
  outreachOpen,
  toIcs,
} from "@/lib/dates"
import { STATUS_HINT, type Expo } from "@/data/types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SectorBadges } from "./sector-badges"
import { StatusLabel } from "./status"

const FREQUENCY: Record<Expo["frequency"], string> = {
  annual: "Every year",
  biennial: "Every two years",
  other: "Irregular",
}

function downloadIcs(e: Expo) {
  const blob = new Blob([toIcs(e)], { type: "text/calendar" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${e.name.replace(/[^\w]+/g, "-").toLowerCase()}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 text-xs">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

export function EventSheet({
  expo,
  onOpenChange,
}: {
  expo: Expo | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={expo !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {expo && (
          <>
            <SheetHeader className="gap-1.5 pr-10">
              <SheetTitle className="text-base">{expo.name}</SheetTitle>
              <SheetDescription>
                {formatRange(expo)} · {expo.city}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-5 px-4 pb-6">
              <div className="rounded-lg bg-muted/60 p-3">
                <p className="text-[0.6875rem] text-muted-foreground">Reach out from</p>
                <p className="text-sm font-medium tabular-nums">
                  {outreachOpen(expo) ? "Now" : format(outreachFrom(expo), "EEEE, d MMM yyyy")}
                </p>
                <p className="text-[0.6875rem] text-muted-foreground">
                  {outreachOpen(expo)
                    ? `The ${OUTREACH_LEAD_WEEKS}-week window before opening day has started`
                    : `${OUTREACH_LEAD_WEEKS} weeks before the opening day`}
                </p>
              </div>

              <dl className="flex flex-col gap-2.5">
                <Row label="Dates">
                  {formatRange(expo)}
                  <span className="text-muted-foreground">
                    {" "}
                    · {durationDays(expo)} {durationDays(expo) === 1 ? "day" : "days"}
                  </span>
                </Row>
                <Row label="Venue">{expo.venue || "—"}</Row>
                <Row label="City">
                  {expo.city}, {expo.state}
                </Row>
                <Row label="Organiser">{expo.organiser}</Row>
                <Row label="Runs">{FREQUENCY[expo.frequency]}</Row>
                <Row label="Exhibitors">
                  {expo.exhibitors ? `About ${expo.exhibitors.toLocaleString("en-IN")}` : "Not published"}
                </Row>
                <Row label="Sectors">
                  <SectorBadges sectors={expo.sectors} />
                </Row>
              </dl>

              <Separator />

              <dl className="flex flex-col gap-2.5">
                <Row label="Date status">
                  <StatusLabel status={expo.status} />
                  <p className="mt-0.5 text-muted-foreground">{STATUS_HINT[expo.status]}</p>
                </Row>
                {expo.notes && <Row label="Notes">{expo.notes}</Row>}
                <Row label="Source">
                  <a
                    href={expo.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all underline underline-offset-4 hover:text-muted-foreground"
                  >
                    {expo.sourceUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                  </a>
                </Row>
              </dl>

              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <a href={expo.website} target="_blank" rel="noreferrer">
                    Official site
                    <ExternalLinkIcon data-icon="inline-end" />
                  </a>
                </Button>
                <Button size="sm" variant="outline" onClick={() => downloadIcs(expo)}>
                  <CalendarPlusIcon data-icon="inline-start" />
                  Add to calendar
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
