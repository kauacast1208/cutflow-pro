import { differenceInCalendarDays, endOfMonth, endOfWeek, format, isWithinInterval, parseISO, startOfMonth, startOfWeek } from "date-fns";

export type ClientLifecycleStatus = "new" | "recurring" | "at_risk" | "inactive";

export interface ClientAggregate {
  key: string;
  name: string;
  appointmentCount: number;
  totalSpent: number;
  averageTicket: number;
  firstVisit: string | null;
  lastVisit: string | null;
  daysSinceLastVisit: number | null;
  preferredService: string | null;
  preferredProfessional: string | null;
  activeAppointments: any[];
  cancelledAppointments: any[];
}

export interface DashboardBusinessMetrics {
  monthlyRevenue: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  newClientsThisMonth: number;
  returningClientsCount: number;
  averageTicket: number;
  occupancyRate: number | null;
  cancellationCount: number;
  noShowCount: number;
  noShowTracked: boolean;
  topServices: Array<{ name: string; count: number; revenue: number }>;
}

const NO_SHOW_PATTERNS = ["nao compareceu", "não compareceu", "no show", "no-show", "faltou"];

export function normalizeClientKey(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

export function getClientKeyFromAppointment(appointment: any) {
  return normalizeClientKey(
    appointment?.client_email ||
      appointment?.client_phone ||
      appointment?.client_name
  );
}

export function getClientKeyFromClient(client: any) {
  return normalizeClientKey(client?.email || client?.phone || client?.name);
}

export function isVisitLikeAppointment(status?: string | null) {
  return status !== "cancelled" && status !== "rescheduled";
}

export function classifyClientLifecycle(aggregate?: Partial<ClientAggregate> | null): ClientLifecycleStatus {
  if (!aggregate || !aggregate.appointmentCount || !aggregate.lastVisit) return "new";

  const daysSinceLastVisit = aggregate.daysSinceLastVisit ?? differenceInCalendarDays(new Date(), parseISO(aggregate.lastVisit));

  if (daysSinceLastVisit >= 90) return "inactive";
  if (aggregate.appointmentCount >= 2 && daysSinceLastVisit >= 45) return "at_risk";
  if (aggregate.appointmentCount >= 3) return "recurring";
  if (aggregate.appointmentCount <= 1) return "new";

  return "recurring";
}

export function buildClientAggregates(appointments: any[]) {
  const aggregates = new Map<string, ClientAggregate>();

  appointments.forEach((appointment) => {
    const key = getClientKeyFromAppointment(appointment);
    if (!key) return;

    const active = isVisitLikeAppointment(appointment.status);
    const current = aggregates.get(key) || {
      key,
      name: appointment.client_name || "Cliente",
      appointmentCount: 0,
      totalSpent: 0,
      averageTicket: 0,
      firstVisit: null,
      lastVisit: null,
      daysSinceLastVisit: null,
      preferredService: null,
      preferredProfessional: null,
      activeAppointments: [],
      cancelledAppointments: [],
    };

    current.name = current.name || appointment.client_name || "Cliente";

    if (active) {
      current.appointmentCount += 1;
      current.totalSpent += Number(appointment.price || 0);
      current.activeAppointments.push(appointment);

      if (!current.firstVisit || appointment.date < current.firstVisit) {
        current.firstVisit = appointment.date;
      }

      if (!current.lastVisit || appointment.date > current.lastVisit) {
        current.lastVisit = appointment.date;
      }
    } else {
      current.cancelledAppointments.push(appointment);
    }

    aggregates.set(key, current);
  });

  aggregates.forEach((aggregate) => {
    aggregate.averageTicket = aggregate.appointmentCount > 0
      ? aggregate.totalSpent / aggregate.appointmentCount
      : 0;
    aggregate.daysSinceLastVisit = aggregate.lastVisit
      ? differenceInCalendarDays(new Date(), parseISO(aggregate.lastVisit))
      : null;

    const serviceCounts: Record<string, number> = {};
    const professionalCounts: Record<string, number> = {};

    aggregate.activeAppointments.forEach((appointment) => {
      const serviceName = appointment.services?.name;
      const professionalName = appointment.professionals?.name;

      if (serviceName) serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
      if (professionalName) professionalCounts[professionalName] = (professionalCounts[professionalName] || 0) + 1;
    });

    aggregate.preferredService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    aggregate.preferredProfessional = Object.entries(professionalCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  });

  return aggregates;
}

export function buildClientLifecycleMap(clients: any[], appointments: any[]) {
  const aggregates = buildClientAggregates(appointments);

  return new Map(
    clients.map((client) => {
      const key = getClientKeyFromClient(client);
      const aggregate = aggregates.get(key) || {
        key,
        name: client.name,
        appointmentCount: 0,
        totalSpent: 0,
        averageTicket: 0,
        firstVisit: null,
        lastVisit: null,
        daysSinceLastVisit: null,
        preferredService: null,
        preferredProfessional: null,
        activeAppointments: [],
        cancelledAppointments: [],
      };

      return [
        key,
        {
          ...aggregate,
          status: classifyClientLifecycle(aggregate),
        },
      ];
    })
  );
}

export function computeDashboardBusinessMetrics({
  appointments,
  clients,
  openingTime,
  closingTime,
}: {
  appointments: any[];
  clients: any[];
  openingTime?: string | null;
  closingTime?: string | null;
}): DashboardBusinessMetrics {
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const visitAppointments = appointments.filter((appointment) => isVisitLikeAppointment(appointment.status));
  const cancelledAppointments = appointments.filter((appointment) => appointment.status === "cancelled");
  const thisMonthAppointments = visitAppointments.filter((appointment) =>
    isWithinInterval(parseISO(appointment.date), { start: monthStart, end: monthEnd })
  );
  const thisWeekAppointments = visitAppointments.filter((appointment) =>
    isWithinInterval(parseISO(appointment.date), { start: weekStart, end: weekEnd })
  );
  const todayAppointments = visitAppointments.filter((appointment) => appointment.date === today);
  const lifecycleMap = buildClientLifecycleMap(clients, appointments);

  const newClientsThisMonth = Array.from(lifecycleMap.values()).filter((client) =>
    client.firstVisit &&
    isWithinInterval(parseISO(client.firstVisit), { start: monthStart, end: monthEnd })
  ).length;

  const returningClientsCount = Array.from(lifecycleMap.values()).filter((client) => client.appointmentCount >= 2).length;
  const monthlyRevenue = thisMonthAppointments.reduce((sum, appointment) => sum + Number(appointment.price || 0), 0);
  const averageTicket = thisMonthAppointments.length > 0 ? monthlyRevenue / thisMonthAppointments.length : 0;

  const startHour = Number((openingTime || "09:00").slice(0, 2));
  const endHour = Number((closingTime || "19:00").slice(0, 2));
  const workingHoursPerDay = Math.max(1, endHour - startHour);
  const workingDaysPerWeek = 6;
  const weeklyAvailableMinutes = workingHoursPerDay * 60 * workingDaysPerWeek;
  const occupiedMinutes = thisWeekAppointments.reduce((sum, appointment) => {
    const start = Number(appointment.start_time?.slice(0, 2) || 0) * 60 + Number(appointment.start_time?.slice(3, 5) || 0);
    const end = Number(appointment.end_time?.slice(0, 2) || 0) * 60 + Number(appointment.end_time?.slice(3, 5) || 0);
    return sum + Math.max(0, end - start);
  }, 0);
  const occupancyRate = weeklyAvailableMinutes > 0
    ? Math.min(100, Math.round((occupiedMinutes / weeklyAvailableMinutes) * 100))
    : null;

  const noShowCount = cancelledAppointments.filter((appointment) => {
    const reason = String(appointment.cancellation_reason || "").toLowerCase();
    return NO_SHOW_PATTERNS.some((pattern) => reason.includes(pattern));
  }).length;

  const topServicesMap: Record<string, { name: string; count: number; revenue: number }> = {};
  thisMonthAppointments.forEach((appointment) => {
    const name = appointment.services?.name || "Sem serviço";
    if (!topServicesMap[name]) {
      topServicesMap[name] = { name, count: 0, revenue: 0 };
    }
    topServicesMap[name].count += 1;
    topServicesMap[name].revenue += Number(appointment.price || 0);
  });

  return {
    monthlyRevenue,
    appointmentsToday: todayAppointments.length,
    appointmentsThisWeek: thisWeekAppointments.length,
    newClientsThisMonth,
    returningClientsCount,
    averageTicket,
    occupancyRate,
    cancellationCount: cancelledAppointments.filter((appointment) =>
      appointment.date >= format(monthStart, "yyyy-MM-dd") && appointment.date <= format(monthEnd, "yyyy-MM-dd")
    ).length,
    noShowCount,
    noShowTracked: cancelledAppointments.some((appointment) => String(appointment.cancellation_reason || "").trim().length > 0),
    topServices: Object.values(topServicesMap)
      .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
      .slice(0, 5),
  };
}
