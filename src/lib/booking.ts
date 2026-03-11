/**
 * Booking business logic: time slot generation, conflict detection, and day status.
 */
import { addMinutes, parse, isBefore, isToday, addHours, format, getDay } from "date-fns";

export interface SlotConfig {
  openingTime: string;   // fallback "HH:mm"
  closingTime: string;   // fallback "HH:mm"
  intervalMinutes: number;
  durationMinutes: number;
  bufferMinutes: number;
  minAdvanceHours: number;
}

export interface Appointment {
  professional_id: string;
  start_time: string;
  end_time: string;
}

export interface BlockedTime {
  professional_id: string | null;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  recurring?: boolean;
  recurring_days?: number[] | null;
}

export interface ProfessionalAvailability {
  professional_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}

export type DayStatus = "available" | "few" | "full" | "closed";

/** Check if a time slot conflicts with existing appointments (including buffer) */
export function hasAppointmentConflict(
  timeStr: string,
  endTimeWithBuffer: string,
  professionalId: string,
  appointments: Appointment[]
): boolean {
  return appointments.some((a) => {
    if (a.professional_id !== professionalId) return false;
    return timeStr < a.end_time && endTimeWithBuffer > a.start_time;
  });
}

/** Check if a time slot is blocked (including recurring blocks) */
export function isTimeBlocked(
  timeStr: string,
  endTime: string,
  professionalId: string,
  blockedTimes: BlockedTime[],
  date?: Date
): boolean {
  const dayOfWeek = date ? getDay(date) : undefined;
  return blockedTimes.some((b) => {
    if (b.professional_id && b.professional_id !== professionalId) return false;
    // For recurring blocks, check if the day of week matches
    if (b.recurring && b.recurring_days && dayOfWeek !== undefined) {
      if (!b.recurring_days.includes(dayOfWeek)) return false;
    }
    if (b.all_day) return true;
    return timeStr < (b.end_time || "") && endTime > (b.start_time || "");
  });
}

/** Get the availability window for a professional on a given date */
export function getAvailabilityForDate(
  date: Date,
  professionalId: string,
  availability: ProfessionalAvailability[],
  fallbackOpen: string,
  fallbackClose: string
): { start: string; end: string } | null {
  const weekday = getDay(date); // 0=Sun, 1=Mon...
  const match = availability.find(
    (a) => a.professional_id === professionalId && a.weekday === weekday
  );
  if (match) {
    return { start: match.start_time.slice(0, 5), end: match.end_time.slice(0, 5) };
  }
  // No availability record = professional doesn't work this day
  return null;
}

/** Generate available time slots for a given date, professional, and config */
export function generateTimeSlots(
  date: Date,
  professionalId: string,
  config: SlotConfig,
  appointments: Appointment[],
  blockedTimes: BlockedTime[],
  availability: ProfessionalAvailability[] = []
): string[] {
  // Determine the working window
  const avail = availability.length > 0
    ? getAvailabilityForDate(date, professionalId, availability, config.openingTime, config.closingTime)
    : { start: config.openingTime.slice(0, 5), end: config.closingTime.slice(0, 5) };

  if (!avail) return []; // Professional doesn't work this day

  const slots: string[] = [];
  let current = parse(avail.start, "HH:mm", date);
  const close = parse(avail.end, "HH:mm", date);
  const now = new Date();
  const minTime = isToday(date) ? addHours(now, config.minAdvanceHours) : current;

  while (
    isBefore(addMinutes(current, config.durationMinutes), close) ||
    addMinutes(current, config.durationMinutes).getTime() === close.getTime()
  ) {
    const timeStr = format(current, "HH:mm");
    const endTime = format(addMinutes(current, config.durationMinutes), "HH:mm");
    const endTimeWithBuffer = format(
      addMinutes(current, config.durationMinutes + config.bufferMinutes),
      "HH:mm"
    );

    if (!isBefore(current, minTime)) {
      const conflict = hasAppointmentConflict(timeStr, endTimeWithBuffer, professionalId, appointments);
      const blocked = isTimeBlocked(timeStr, endTime, professionalId, blockedTimes);

      if (!conflict && !blocked) {
        slots.push(timeStr);
      }
    }

    current = addMinutes(current, config.intervalMinutes);
  }

  return slots;
}

/** Compute day status for calendar indicators */
export function computeDayStatus(
  date: Date,
  professionalId: string,
  config: SlotConfig,
  appointments: Appointment[],
  blockedTimes: BlockedTime[],
  availability: ProfessionalAvailability[],
  closedDays: number[]
): DayStatus {
  const weekday = getDay(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today || closedDays.includes(weekday)) return "closed";

  const slots = generateTimeSlots(date, professionalId, config, appointments, blockedTimes, availability);

  if (slots.length === 0) return "full";
  if (slots.length <= 3) return "few";
  return "available";
}

/** Group time slots by period (morning/afternoon/evening) */
export function groupSlotsByPeriod(slots: string[]) {
  const morning: string[] = [];
  const afternoon: string[] = [];
  const evening: string[] = [];

  slots.forEach((t) => {
    const hour = parseInt(t.split(":")[0]);
    if (hour < 12) morning.push(t);
    else if (hour < 18) afternoon.push(t);
    else evening.push(t);
  });

  return { morning, afternoon, evening };
}
