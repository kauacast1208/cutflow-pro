import { useMemo } from "react";

export interface ClientStat {
  count: number;
  lastDate: string;
  totalSpent: number;
  appointments: any[];
}

export interface ClientStatus {
  type: "vip" | "recurring" | "inactive" | "regular" | "new";
  count: number;
  lastDate: string;
  daysSinceLast?: number;
  totalSpent: number;
  appointments: any[];
}

export function useClientStats(allAppointments: any[]) {
  const clientStats = useMemo(() => {
    const stats = new Map<string, ClientStat>();
    allAppointments.forEach((a) => {
      if (a.status === "cancelled") return;
      const key = (a.client_email || a.client_phone || a.client_name).toLowerCase();
      const existing = stats.get(key);
      const price = Number(a.price || 0);
      if (!existing) {
        stats.set(key, { count: 1, lastDate: a.date, totalSpent: price, appointments: [a] });
      } else {
        existing.count++;
        existing.totalSpent += price;
        existing.appointments.push(a);
        if (a.date > existing.lastDate) existing.lastDate = a.date;
      }
    });
    return stats;
  }, [allAppointments]);

  const getClientStatus = (client: any): ClientStatus => {
    const key = (client.email || client.phone || client.name).toLowerCase();
    const stat = clientStats.get(key);
    if (!stat) return { type: "new", count: 0, lastDate: "", totalSpent: 0, appointments: [] };
    const daysSinceLast = Math.floor((Date.now() - new Date(stat.lastDate).getTime()) / (1000 * 60 * 60 * 24));
    const type = stat.count >= 10 ? "vip" : stat.count >= 3 ? "recurring" : daysSinceLast > 30 ? "inactive" : stat.count > 0 ? "regular" : "new";
    return { type, count: stat.count, lastDate: stat.lastDate, daysSinceLast, totalSpent: stat.totalSpent, appointments: stat.appointments };
  };

  return { clientStats, getClientStatus };
}
