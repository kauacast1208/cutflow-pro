import { useMemo } from "react";
import {
  buildClientAggregates,
  classifyClientLifecycle,
  getClientKeyFromClient,
  type ClientLifecycleStatus,
} from "@/lib/clientAnalytics";

export interface ClientStat {
  count: number;
  lastDate: string;
  firstDate: string;
  totalSpent: number;
  averageTicket: number;
  preferredService: string | null;
  preferredProfessional: string | null;
  appointments: any[];
}

export interface ClientStatus {
  type: ClientLifecycleStatus;
  count: number;
  lastDate: string;
  firstDate: string;
  daysSinceLast?: number;
  totalSpent: number;
  averageTicket: number;
  preferredService: string | null;
  preferredProfessional: string | null;
  appointments: any[];
}

export function useClientStats(allAppointments: any[]) {
  const clientStats = useMemo(() => {
    const aggregates = buildClientAggregates(allAppointments);

    return new Map(
      Array.from(aggregates.entries()).map(([key, aggregate]) => [
        key,
        {
          count: aggregate.appointmentCount,
          lastDate: aggregate.lastVisit || "",
          firstDate: aggregate.firstVisit || "",
          totalSpent: aggregate.totalSpent,
          averageTicket: aggregate.averageTicket,
          preferredService: aggregate.preferredService,
          preferredProfessional: aggregate.preferredProfessional,
          appointments: aggregate.activeAppointments,
        },
      ])
    );
  }, [allAppointments]);

  const getClientStatus = (client: any): ClientStatus => {
    const key = getClientKeyFromClient(client);
    const stat = clientStats.get(key);

    if (!stat) {
      return {
        type: "new",
        count: 0,
        lastDate: "",
        firstDate: "",
        totalSpent: 0,
        averageTicket: 0,
        preferredService: null,
        preferredProfessional: null,
        appointments: [],
      };
    }

    return {
      type: classifyClientLifecycle({
        appointmentCount: stat.count,
        lastVisit: stat.lastDate || null,
        daysSinceLastVisit: stat.lastDate
          ? Math.floor((Date.now() - new Date(stat.lastDate).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      }),
      count: stat.count,
      lastDate: stat.lastDate,
      firstDate: stat.firstDate,
      daysSinceLast: stat.lastDate
        ? Math.floor((Date.now() - new Date(stat.lastDate).getTime()) / (1000 * 60 * 60 * 24))
        : undefined,
      totalSpent: stat.totalSpent,
      averageTicket: stat.averageTicket,
      preferredService: stat.preferredService,
      preferredProfessional: stat.preferredProfessional,
      appointments: stat.appointments,
    };
  };

  return { clientStats, getClientStatus };
}
