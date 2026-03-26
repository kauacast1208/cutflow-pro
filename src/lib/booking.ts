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
  date?: string | null;
  blocked_date?: string | null;
  block_date?: string | null;
  start_date?: string | null;
  recurring?: boolean;
  recurring_days?: number[] | null;
}

export interface ProfessionalAvailability {
  professional_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface ProfessionalSchedule {
  id?: string;
  professional_id?: string;
  work_days?: number[] | null;
  work_start?: string | null;
  work_end?: string | null;
  break_start_time?: string | null;
  break_end_time?: string | null;
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
  const dateKey = date ? format(date, "yyyy-MM-dd") : null;
  return blockedTimes.some((b) => {
    if (b.professional_id && b.professional_id !== professionalId) return false;

    if (b.recurring) {
      if (dayOfWeek === undefined || !Array.isArray(b.recurring_days) || !b.recurring_days.includes(dayOfWeek)) {
        return false;
      }
    } else if (dateKey) {
      const blockedDate = b.date || b.blocked_date || b.block_date || b.start_date || null;
      if (blockedDate && blockedDate !== dateKey) return false;
    }

    if (b.all_day) return true;
    if (!b.start_time || !b.end_time) return false;
    return timeStr < b.end_time && endTime > b.start_time;
  });
}

function normalizeTimeValue(value: string | null | undefined) {
  return value?.slice(0, 5) || null;
}

function isWithinProfessionalWorkDays(date: Date, professional?: ProfessionalSchedule | null) {
  const workDays = professional?.work_days;
  if (!workDays || workDays.length === 0) {
    return true;
  }

  return workDays.includes(getDay(date));
}

function hasProfessionalBreakConflict(
  timeStr: string,
  endTime: string,
  professional?: ProfessionalSchedule | null
) {
  const breakStart = normalizeTimeValue(professional?.break_start_time);
  const breakEnd = normalizeTimeValue(professional?.break_end_time);

  if (!breakStart || !breakEnd) {
    return false;
  }

  return timeStr < breakEnd && endTime > breakStart;
}

/** Get the availability window for a professional on a given date */
export function getAvailabilityForDate(
  date: Date,
  professionalId: string,
  availability: ProfessionalAvailability[],
  fallbackOpen: string,
  fallbackClose: string,
  professional?: ProfessionalSchedule | null
): { start: string; end: string } | null {
  const weekday = getDay(date); // 0=Sun, 1=Mon...
  const match = availability.find(
    (a) => a.professional_id === professionalId && a.weekday === weekday
  );
  if (match) {
    return { start: match.start_time.slice(0, 5), end: match.end_time.slice(0, 5) };
  }

  if (!isWithinProfessionalWorkDays(date, professional)) {
    return null;
  }

  const start = normalizeTimeValue(professional?.work_start) || fallbackOpen;
  const end = normalizeTimeValue(professional?.work_end) || fallbackClose;

  return { start, end };
}

/** Generate available time slots for a given date, professional, and config */
export function generateTimeSlots(
  date: Date,
  professionalId: string,
  config: SlotConfig,
  appointments: Appointment[],
  blockedTimes: BlockedTime[],
  availability: ProfessionalAvailability[] = [],
  professional?: ProfessionalSchedule | null
): string[] {
  // Determine the working window
  const avail = availability.length > 0
    ? getAvailabilityForDate(date, professionalId, availability, config.openingTime, config.closingTime, professional)
    : getAvailabilityForDate(date, professionalId, [], config.openingTime, config.closingTime, professional);

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
      const blocked = isTimeBlocked(timeStr, endTime, professionalId, blockedTimes, date);
      const onBreak = hasProfessionalBreakConflict(timeStr, endTime, professional);

      if (!conflict && !blocked && !onBreak) {
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
  closedDays: number[],
  professional?: ProfessionalSchedule | null
): DayStatus {
  const weekday = getDay(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today || closedDays.includes(weekday)) return "closed";

  const slots = generateTimeSlots(date, professionalId, config, appointments, blockedTimes, availability, professional);

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
