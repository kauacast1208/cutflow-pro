import { differenceInCalendarDays, endOfWeek, format, isWithinInterval, parseISO, startOfWeek } from "date-fns";

export type AgendaDisplayStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

export type AgendaTimeBucket = "past" | "current" | "future";

export interface NormalizedAgendaAppointment {
  id: string;
  clientName: string;
  client_name: string;
  serviceName: string;
  professionalName: string;
  professionalId: string | null;
  professional_id: string | null;
  date: string;
  startTime: string;
  start_time: string;
  endTime: string;
  end_time: string;
  startMinutes: number;
  endMinutes: number;
  durationMinutes: number;
  price: number;
  notes: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  rawStatus: string;
  status: AgendaDisplayStatus;
  displayStatus: AgendaDisplayStatus;
  timeBucket: AgendaTimeBucket;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  cancellationReason: string | null;
  services?: any;
  professionals?: any;
  original: any;
}

const NO_SHOW_PATTERNS = ["nao compareceu", "não compareceu", "no show", "no-show", "faltou"];

function timeToMinutes(value?: string | null) {
  const [hours = "0", minutes = "0"] = String(value || "00:00").split(":");
  return Number(hours) * 60 + Number(minutes);
}

export function inferNoShow(reason?: string | null) {
  const lower = String(reason || "").trim().toLowerCase();
  return NO_SHOW_PATTERNS.some((pattern) => lower.includes(pattern));
}

export function getBlockedTimeDate(block: any) {
  return block?.date || block?.blocked_date || block?.block_date || block?.start_date || null;
}

export function getAgendaDisplayStatus(appointment: any): AgendaDisplayStatus {
  if (appointment.status === "cancelled" && inferNoShow(appointment.cancellation_reason)) {
    return "no_show";
  }

  return (appointment.status || "scheduled") as AgendaDisplayStatus;
}

export function getAgendaTimeBucket(appointment: any): AgendaTimeBucket {
  const appointmentDate = String(appointment.date || "");
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(appointment.start_time);
  const endMinutes = timeToMinutes(appointment.end_time);

  if (appointmentDate < today) return "past";
  if (appointmentDate > today) return "future";
  if (currentMinutes >= startMinutes && currentMinutes < endMinutes) return "current";
  if (currentMinutes < startMinutes) return "future";
  return "past";
}

export function normalizeAgendaAppointment(appointment: any): NormalizedAgendaAppointment {
  const startMinutes = timeToMinutes(appointment.start_time);
  const endMinutes = timeToMinutes(appointment.end_time);
  const timeBucket = getAgendaTimeBucket(appointment);
  const displayStatus = getAgendaDisplayStatus(appointment);

  return {
    id: appointment.id,
    clientName: appointment.client_name || "Cliente",
    client_name: appointment.client_name || "Cliente",
    serviceName: appointment.services?.name || "Sem serviço",
    professionalName: appointment.professionals?.name || "Sem profissional",
    professionalId: appointment.professional_id || null,
    professional_id: appointment.professional_id || null,
    date: appointment.date,
    startTime: appointment.start_time,
    start_time: appointment.start_time,
    endTime: appointment.end_time,
    end_time: appointment.end_time,
    startMinutes,
    endMinutes,
    durationMinutes: appointment.services?.duration_minutes || Math.max(0, endMinutes - startMinutes),
    price: Number(appointment.price || appointment.services?.price || 0),
    notes: appointment.notes || null,
    clientPhone: appointment.client_phone || null,
    clientEmail: appointment.client_email || null,
    rawStatus: appointment.status || "scheduled",
    status: displayStatus,
    displayStatus,
    timeBucket,
    isPast: timeBucket === "past",
    isCurrent: timeBucket === "current",
    isFuture: timeBucket === "future",
    cancellationReason: appointment.cancellation_reason || null,
    services: appointment.services,
    professionals: appointment.professionals,
    original: appointment,
  };
}

function intersectsHourSlot(startMinutes: number, endMinutes: number, hour: number) {
  const slotStart = hour * 60;
  const slotEnd = slotStart + 60;
  return !(startMinutes >= slotEnd || endMinutes <= slotStart);
}

export function computeFreeSlotsForDate({
  appointments,
  blockedTimes,
  date,
  hours,
  professionals,
}: {
  appointments: NormalizedAgendaAppointment[];
  blockedTimes: any[];
  date: string;
  hours: string[];
  professionals: any[];
}) {
  const scopedProfessionals = professionals.length > 0 ? professionals : [{ id: "all" }];
  let freeSlots = 0;

  scopedProfessionals.forEach((professional) => {
    hours.forEach((hourLabel) => {
      const hour = Number(hourLabel.slice(0, 2));
      const hasAppointment = appointments.some((appointment) =>
        appointment.date === date &&
        appointment.professionalId === professional.id &&
        appointment.displayStatus !== "cancelled" &&
        appointment.displayStatus !== "no_show" &&
        appointment.displayStatus !== "rescheduled" &&
        intersectsHourSlot(appointment.startMinutes, appointment.endMinutes, hour)
      );

      const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
      const hasBlock = blockedTimes.some((block) => {
        if (block.professional_id && block.professional_id !== professional.id) return false;
        const dateMatch = block.recurring
          ? (block.recurring_days || []).includes(dayOfWeek)
          : getBlockedTimeDate(block) === date;

        if (!dateMatch) return false;
        if (block.all_day) return true;

        return intersectsHourSlot(timeToMinutes(block.start_time), timeToMinutes(block.end_time), hour);
      });

      if (!hasAppointment && !hasBlock) freeSlots += 1;
    });
  });

  return freeSlots;
}

export function computeAgendaMetrics({
  appointments,
  blockedTimes,
  selectedDate,
  hours,
  professionals,
}: {
  appointments: NormalizedAgendaAppointment[];
  blockedTimes: any[];
  selectedDate: string;
  hours: string[];
  professionals: any[];
}) {
  const todayAppointments = appointments.filter((appointment) => appointment.date === selectedDate);
  const activeToday = todayAppointments.filter((appointment) =>
    !["cancelled", "no_show", "rescheduled"].includes(appointment.displayStatus)
  );
  const cancellationsToday = todayAppointments.filter((appointment) =>
    appointment.displayStatus === "cancelled" || appointment.displayStatus === "no_show"
  );
  const estimatedRevenueToday = activeToday.reduce((sum, appointment) => sum + appointment.price, 0);
  const freeSlots = computeFreeSlotsForDate({
    appointments,
    blockedTimes,
    date: selectedDate,
    hours,
    professionals,
  });

  const dateObj = parseISO(selectedDate);
  const weekStart = startOfWeek(dateObj, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(dateObj, { weekStartsOn: 1 });
  const weekAppointments = appointments.filter((appointment) =>
    isWithinInterval(parseISO(appointment.date), { start: weekStart, end: weekEnd })
  );
  const completedThisWeek = weekAppointments.filter((appointment) => appointment.displayStatus === "completed").length;

  const pastCount = appointments.filter((appointment) => appointment.isPast).length;
  const currentCount = appointments.filter((appointment) => appointment.isCurrent).length;
  const futureCount = appointments.filter((appointment) => appointment.isFuture).length;

  return {
    appointmentsToday: todayAppointments.length,
    freeSlots,
    estimatedRevenueToday,
    cancellationsToday: cancellationsToday.length,
    noShowToday: cancellationsToday.filter((appointment) => appointment.displayStatus === "no_show").length,
    appointmentsThisWeek: weekAppointments.length,
    completedThisWeek,
    pastCount,
    currentCount,
    futureCount,
  };
}

export function formatRelativeVisitDay(date: string) {
  const diff = differenceInCalendarDays(parseISO(date), new Date());
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  if (diff > 1) return `Em ${diff} dias`;
  return `${Math.abs(diff)} dias atrás`;
}


