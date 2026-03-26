import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export type ClientProfileSegment = "new" | "recurring" | "vip" | "at_risk" | "inactive";
export type ClientRetentionLevel = "healthy" | "watch" | "at_risk" | "inactive";

export interface ClientProfileSummary {
  firstSeenDate: string | null;
  totalVisits: number;
  totalSpent: number;
  averageTicket: number;
  lifetimeValue: number;
  lastVisit: string | null;
  daysSinceLastVisit: number | null;
  averageReturnDays: number | null;
  preferredWeekday: string | null;
  preferredTime: string | null;
  favoriteService: string | null;
  favoriteProfessional: string | null;
  retentionLevel: ClientRetentionLevel;
  segment: ClientProfileSegment;
  segmentLabel: string;
  retentionLabel: string;
  estimatedSegment: string;
  topServices: Array<{ name: string; count: number }>;
  nextRecommendedAction: string;
  suggestedCampaign: string;
  suggestedFollowUp: string;
  insights: string[];
}

function formatWeekday(date: string) {
  return format(parseISO(date), "EEEE", { locale: ptBR });
}

function formatTimeLabel(time?: string | null) {
  return time ? `Por volta de ${time.slice(0, 5)}` : null;
}

function pickTopEntry(source: Record<string, number>) {
  return Object.entries(source).sort((a, b) => b[1] - a[1])[0] || null;
}

function inferSuggestedCampaign(favoriteService: string | null) {
  const value = favoriteService?.toLowerCase() || "";
  if (value.includes("barba")) return "Oferta de barba como add-on";
  if (value.includes("corte")) return "Lembrete de manutencao do corte";
  if (value.includes("pigment")) return "Retorno com acabamento premium";
  return "Campanha de retorno com horario favorito";
}

function inferSuggestedFollowUp(segment: ClientProfileSegment, daysSinceLastVisit: number | null) {
  if (segment === "inactive") return "Reativar com mensagem pessoal e oferta objetiva";
  if (segment === "at_risk") return `Enviar lembrete de retorno${typeof daysSinceLastVisit === "number" ? ` apos ${daysSinceLastVisit} dias sem visita` : ""}`;
  if (segment === "new") return "Incentivar a segunda visita nas proximas semanas";
  if (segment === "vip") return "Manter relacionamento com beneficio VIP";
  return "Acompanhar o proximo ciclo de retorno";
}

function getSegment({
  totalVisits,
  totalSpent,
  daysSinceLastVisit,
  averageReturnDays,
}: {
  totalVisits: number;
  totalSpent: number;
  daysSinceLastVisit: number | null;
  averageReturnDays: number | null;
}): ClientProfileSegment {
  if (totalVisits === 0) return "new";
  if (typeof daysSinceLastVisit === "number" && daysSinceLastVisit >= 90) return "inactive";

  const cadenceLimit = averageReturnDays ? averageReturnDays + 10 : 45;
  if (typeof daysSinceLastVisit === "number" && totalVisits >= 2 && daysSinceLastVisit >= cadenceLimit) {
    return "at_risk";
  }

  if (totalVisits >= 6 || totalSpent >= 800) return "vip";
  if (totalVisits >= 3) return "recurring";
  return "new";
}

function getRetentionLevel(segment: ClientProfileSegment): ClientRetentionLevel {
  if (segment === "inactive") return "inactive";
  if (segment === "at_risk") return "at_risk";
  if (segment === "new") return "watch";
  return "healthy";
}

const SEGMENT_LABELS: Record<ClientProfileSegment, string> = {
  new: "New",
  recurring: "Recurring",
  vip: "VIP",
  at_risk: "At Risk",
  inactive: "Inactive",
};

const RETENTION_LABELS: Record<ClientRetentionLevel, string> = {
  healthy: "Saudavel",
  watch: "Monitorar",
  at_risk: "Em risco",
  inactive: "Inativo",
};

export function buildClientProfileSummary({
  client,
  appointments,
  visitCount,
  totalSpent,
  averageTicket,
  firstVisit,
  lastVisit,
  preferredPro,
  topService,
}: {
  client: any;
  appointments: any[];
  visitCount: number;
  totalSpent: number;
  averageTicket: number;
  firstVisit: string | null;
  lastVisit: string | null;
  preferredPro: string | null;
  topService: string | null;
}): ClientProfileSummary {
  const visitAppointments = appointments
    .filter((appointment) => appointment.status !== "cancelled" && appointment.status !== "rescheduled")
    .slice()
    .sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`));

  const daysSinceLastVisit = lastVisit ? differenceInCalendarDays(new Date(), parseISO(lastVisit)) : null;
  const firstSeenDate = firstVisit || client?.created_at?.slice(0, 10) || null;

  const gaps: number[] = [];
  for (let i = 1; i < visitAppointments.length; i += 1) {
    gaps.push(
      Math.max(
        0,
        differenceInCalendarDays(parseISO(visitAppointments[i].date), parseISO(visitAppointments[i - 1].date))
      )
    );
  }

  const averageReturnDays = gaps.length > 0
    ? Math.round(gaps.reduce((sum, value) => sum + value, 0) / gaps.length)
    : null;

  const weekdayCounts: Record<string, number> = {};
  const timeCounts: Record<string, number> = {};
  const serviceCounts: Record<string, number> = {};
  const professionalCounts: Record<string, number> = {};

  visitAppointments.forEach((appointment) => {
    const weekday = formatWeekday(appointment.date);
    weekdayCounts[weekday] = (weekdayCounts[weekday] || 0) + 1;

    const time = appointment.start_time?.slice(0, 5);
    if (time) timeCounts[time] = (timeCounts[time] || 0) + 1;

    const serviceName = appointment.services?.name;
    if (serviceName) serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;

    const professionalName = appointment.professionals?.name;
    if (professionalName) professionalCounts[professionalName] = (professionalCounts[professionalName] || 0) + 1;
  });

  const topWeekday = pickTopEntry(weekdayCounts)?.[0] || null;
  const topTime = pickTopEntry(timeCounts)?.[0] || null;
  const favoriteService = topService || pickTopEntry(serviceCounts)?.[0] || null;
  const favoriteProfessional = preferredPro || pickTopEntry(professionalCounts)?.[0] || null;
  const segment = getSegment({ totalVisits: visitCount, totalSpent, daysSinceLastVisit, averageReturnDays });
  const retentionLevel = getRetentionLevel(segment);

  const insights: string[] = [];
  if (favoriteService) insights.push(`Geralmente agenda ${favoriteService.toLowerCase()}.`);
  if (averageReturnDays) insights.push(`Costuma retornar a cada ${averageReturnDays} dias.`);
  if (typeof daysSinceLastVisit === "number" && daysSinceLastVisit > 0) insights.push(`Esta ha ${daysSinceLastVisit} dias sem visitar.`);
  if (favoriteProfessional) insights.push(`Tem mais afinidade com ${favoriteProfessional}.`);
  if (topWeekday && topTime) insights.push(`Prefere ${topWeekday.toLowerCase()} ${topTime.slice(0, 5)}.`);

  let estimatedSegment = "Cliente em acompanhamento";
  if (segment === "vip") estimatedSegment = "Cliente de alto valor recorrente";
  if (segment === "recurring") estimatedSegment = "Cliente recorrente com ritmo saudavel";
  if (segment === "at_risk") estimatedSegment = "Cliente valioso com risco de nao retornar";
  if (segment === "inactive") estimatedSegment = "Cliente inativo que precisa de reativacao";
  if (segment === "new") estimatedSegment = "Cliente novo com potencial de recorrencia";

  let nextRecommendedAction = "Acompanhar proxima visita";
  if (segment === "new") nextRecommendedAction = "Incentivar a segunda reserva";
  if (segment === "at_risk") nextRecommendedAction = "Enviar lembrete de retorno";
  if (segment === "inactive") nextRecommendedAction = "Rodar campanha de reativacao";
  if (segment === "vip") nextRecommendedAction = "Oferecer tratamento VIP ou bonus";

  return {
    firstSeenDate,
    totalVisits: visitCount,
    totalSpent,
    averageTicket,
    lifetimeValue: totalSpent,
    lastVisit,
    daysSinceLastVisit,
    averageReturnDays,
    preferredWeekday: topWeekday,
    preferredTime: formatTimeLabel(topTime),
    favoriteService,
    favoriteProfessional,
    retentionLevel,
    segment,
    segmentLabel: SEGMENT_LABELS[segment],
    retentionLabel: RETENTION_LABELS[retentionLevel],
    estimatedSegment,
    topServices: Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count })),
    nextRecommendedAction,
    suggestedCampaign: inferSuggestedCampaign(favoriteService),
    suggestedFollowUp: inferSuggestedFollowUp(segment, daysSinceLastVisit),
    insights,
  };
}
