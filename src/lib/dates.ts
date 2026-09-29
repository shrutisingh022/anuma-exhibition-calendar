import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameMonth,
  isSameYear,
  parseISO,
  subWeeks,
} from "date-fns"

import type { Expo } from "@/data/types"

/** Weeks before an exhibition that outreach should start. Exhibitor lists usually go up around then. */
export const OUTREACH_LEAD_WEEKS = 6

export const start = (e: Expo) => parseISO(e.startDate)
export const end = (e: Expo) => parseISO(e.endDate)

export function outreachFrom(e: Expo) {
  return subWeeks(start(e), OUTREACH_LEAD_WEEKS)
}

/** True once the suggested outreach date has passed. */
export function outreachOpen(e: Expo, today = new Date()) {
  return outreachFrom(e) <= today
}

export function durationDays(e: Expo) {
  return differenceInCalendarDays(end(e), start(e)) + 1
}

/** "8–12 Dec 2026", "28 Nov – 2 Dec 2026", "30 Dec 2026 – 2 Jan 2027" */
export function formatRange(e: Expo) {
  const a = start(e)
  const b = end(e)
  if (e.startDate === e.endDate) return format(a, "d MMM yyyy")
  if (isSameMonth(a, b)) return `${format(a, "d")}–${format(b, "d MMM yyyy")}`
  if (isSameYear(a, b)) return `${format(a, "d MMM")} – ${format(b, "d MMM yyyy")}`
  return `${format(a, "d MMM yyyy")} – ${format(b, "d MMM yyyy")}`
}

export function overlaps(e: Expo, from: Date, to: Date) {
  return start(e) <= to && end(e) >= from
}

/** All-day .ics entry so the team can drop an event into their own calendar. */
export function toIcs(e: Expo) {
  const d = (x: Date) => format(x, "yyyyMMdd")
  const esc = (s: string) => s.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n")
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Anuma//Exhibition calendar//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@anuma`,
    `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`,
    `DTSTART;VALUE=DATE:${d(start(e))}`,
    `DTEND;VALUE=DATE:${d(addDays(end(e), 1))}`,
    `SUMMARY:${esc(e.name)}`,
    `LOCATION:${esc([e.venue, e.city, e.state].filter(Boolean).join(", "))}`,
    `DESCRIPTION:${esc(`${e.organiser}. ${e.website}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")
}
