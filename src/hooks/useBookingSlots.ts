import { useMemo } from "react";
import {
  generateTimeSlots,
  groupSlotsByPeriod,
  computeDayStatus,
  type Appointment,
  type BlockedTime,
  type ProfessionalAvailability,
  type DayStatus,
} from "@/lib/booking";

interface UseBookingSlotsParams {
  barbershop: any;
  selectedDate: Date | undefined;
  selectedPro: string | null;
  serviceDuration: number | undefined;
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  availability: ProfessionalAvailability[];
  weekDays?: Date[];
}

export function useBookingSlots({
  barbershop,
  selectedDate,
  selectedPro,
  serviceDuration,
  appointments,
  blockedTimes,
  availability,
  weekDays = [],
}: UseBookingSlotsParams) {
  const config = useMemo(() => {
    if (!barbershop || !serviceDuration) return null;
    return {
      openingTime: barbershop.opening_time || "09:00",
      closingTime: barbershop.closing_time || "19:00",
      intervalMinutes: barbershop.slot_interval_minutes || 30,
      durationMinutes: serviceDuration,
      bufferMinutes: barbershop.buffer_minutes || 0,
      minAdvanceHours: barbershop.min_advance_hours || 1,
    };
  }, [barbershop, serviceDuration]);

  const timeSlots = useMemo(() => {
    if (!config || !selectedDate || !selectedPro) return [];
    return generateTimeSlots(selectedDate, selectedPro, config, appointments, blockedTimes, availability);
  }, [config, selectedDate, selectedPro, appointments, blockedTimes, availability]);

  const groupedSlots = useMemo(() => groupSlotsByPeriod(timeSlots), [timeSlots]);

  // Day status map for calendar indicators
  const dayStatusMap = useMemo(() => {
    if (!config || !selectedPro || weekDays.length === 0) return new Map<string, DayStatus>();
    const map = new Map<string, DayStatus>();
    const closedDays = barbershop?.closed_days || [];

    weekDays.forEach((day) => {
      const key = day.toISOString().split("T")[0];
      map.set(key, computeDayStatus(day, selectedPro, config, appointments, blockedTimes, availability, closedDays));
    });

    return map;
  }, [config, selectedPro, weekDays, appointments, blockedTimes, availability, barbershop]);

  return { timeSlots, groupedSlots, dayStatusMap };
}
