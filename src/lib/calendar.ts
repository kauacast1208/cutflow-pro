/**
 * Calendar integration helpers (Google Calendar, etc.)
 */
import { parse, addMinutes, format } from "date-fns";

interface CalendarEventParams {
  title: string;
  date: Date;
  startTime: string;    // "HH:mm"
  durationMinutes: number;
  description?: string;
  location?: string;
}

/** Generate a Google Calendar "Add Event" URL */
export function buildGoogleCalendarUrl(params: CalendarEventParams): string {
  const startDt = parse(params.startTime, "HH:mm", params.date);
  const endDt = addMinutes(startDt, params.durationMinutes);
  const fmt = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", params.title);
  url.searchParams.set("dates", `${fmt(startDt)}/${fmt(endDt)}`);
  if (params.description) url.searchParams.set("details", params.description);
  if (params.location) url.searchParams.set("location", params.location);

  return url.toString();
}
