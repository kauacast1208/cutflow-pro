import { useMemo } from "react";
import {
  generateTimeSlots,
  groupSlotsByPeriod,
  computeDayStatus,
  type Appointment,
  type BlockedTime,
  type ProfessionalAvailability,
  type ProfessionalSchedule,
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
  professionals?: ProfessionalSchedule[];
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
  professionals = [],
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
    const selectedProfessional = professionals.find((professional) => professional.id === selectedPro || professional.professional_id === selectedPro);
    return generateTimeSlots(selectedDate, selectedPro, config, appointments, blockedTimes, availability, selectedProfessional);
  }, [config, selectedDate, selectedPro, appointments, blockedTimes, availability, professionals]);

  const groupedSlots = useMemo(() => groupSlotsByPeriod(timeSlots), [timeSlots]);

  // Day status map for calendar indicators
  const dayStatusMap = useMemo(() => {
    if (!config || !selectedPro || weekDays.length === 0) return new Map<string, DayStatus>();
    const map = new Map<string, DayStatus>();
    const closedDays = barbershop?.closed_days || [];

    weekDays.forEach((day) => {
      const key = day.toISOString().split("T")[0];
      const selectedProfessional = professionals.find((professional) => professional.id === selectedPro || professional.professional_id === selectedPro);
      map.set(key, computeDayStatus(day, selectedPro, config, appointments, blockedTimes, availability, closedDays, selectedProfessional));
    });

    return map;
  }, [config, selectedPro, weekDays, appointments, blockedTimes, availability, professionals, barbershop]);

  return { timeSlots, groupedSlots, dayStatusMap };
}
