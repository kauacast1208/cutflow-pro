import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Users, Clock, Scissors, Calendar, Loader2, Download, FileText, Printer } from "lucide-react";
import { exportMetricsCsv, exportAppointmentsCsv, exportReportPdf } from "@/lib/exportReports";
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { UpgradeBanner } from "@/components/dashboard/UpgradePrompt";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(142 71% 45%)",
  "hsl(280 65% 60%)",
  "hsl(25 95% 53%)",
];

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.07 },
});

const iconBg: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-accent text-accent-foreground",
  success: "bg-primary/15 text-primary",
  warning: "bg-destructive/10 text-destructive",
};

const periodOptions = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
] as const;

export default function ReportsPage() {
  const { barbershop } = useBarbershop();
  const { can, plan } = usePlanPermissions();
  const [period, setPeriod] = useState<number>(30);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barbershop) return;
    setLoading(true);
    const periodStart = format(subDays(new Date(), period), "yyyy-MM-dd");

    Promise.all([
      supabase
        .from("appointments")
        .select("*, services(name), professionals(name)")
        .eq("barbershop_id", barbershop.id)
        .gte("date", periodStart),
      supabase
        .from("clients")
        .select("*")
        .eq("barbershop_id", barbershop.id),
    ]).then(([appRes, clientRes]) => {
      setAppointments(appRes.data || []);
      setClients(clientRes.data || []);
      setLoading(false);
    });
  }, [barbershop, period]);

  const metrics = useMemo(() => {
    const completed = appointments.filter((a) => a.status !== "cancelled");
    const cancelled = appointments.filter((a) => a.status === "cancelled");

    const serviceCounts: Record<string, number> = {};
    completed.forEach((a) => {
      const name = a.services?.name || "-";
      serviceCounts[name] = (serviceCounts[name] || 0) + 1;
    });
    const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];

    const hourCounts: Record<string, number> = {};
    completed.forEach((a) => {
      const hour = a.start_time?.slice(0, 2) + ":00";
      if (hour) hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];

    const proCounts: Record<string, number> = {};
    completed.forEach((a) => {
      const name = a.professionals?.name || "-";
      proCounts[name] = (proCounts[name] || 0) + 1;
    });
    const topPro = Object.entries(proCounts).sort((a, b) => b[1] - a[1])[0];

    const cancelRate =
      appointments.length > 0
        ? ((cancelled.length / appointments.length) * 100).toFixed(1)
        : "0";

    const totalRevenue = completed.reduce((sum, a) => sum + Number(a.price || 0), 0);
    const avgTicket = completed.length > 0 ? (totalRevenue / completed.length).toFixed(0) : "0";

    const serviceDistribution = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, value: count }));

    return { cards: [
      {
        label: "Servico mais popular",
        value: topService ? topService[0] : "-",
        sub: topService ? `${topService[1]} agendamentos nos ultimos ${period} dias` : "Sem dados",
        icon: Scissors,
        colorKey: "primary",
      },
      {
        label: "Horario mais movimentado",
        value: topHour ? topHour[0] : "-",
        sub: topHour ? `${topHour[1]} atendimentos nesse horario` : "Sem dados",
        icon: Clock,
        colorKey: "info",
      },
      {
        label: "Profissional destaque",
        value: topPro ? topPro[0] : "-",
        sub: topPro ? `${topPro[1]} atendimentos` : "Sem dados",
        icon: Users,
        colorKey: "success",
      },
      {
        label: "Taxa de cancelamento",
        value: `${cancelRate}%`,
        sub: `${cancelled.length} de ${appointments.length} agendamentos`,
        icon: Calendar,
        colorKey: "warning",
      },
      {
        label: "Ticket medio",
        value: `R$ ${avgTicket}`,
        sub: `Baseado em ${completed.length} atendimentos`,
        icon: TrendingUp,
        colorKey: "primary",
      },
      {
        label: "Total de clientes",
        value: String(clients.length),
        sub: "Clientes unicos cadastrados",
        icon: Users,
        colorKey: "info",
      },
    ], serviceDistribution };
  }, [appointments, clients, period]);

  if (!barbershop) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Relatorios
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Desempenho dos ultimos {period} dias</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                period === opt.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportMetricsCsv(
                metrics.map((m) => ({ label: m.label, value: m.value, sub: m.sub })),
                period
              )
            }
            disabled={loading}
            className="gap-1.5"
          >
            <FileText className="h-4 w-4" />
            CSV Metricas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportAppointmentsCsv(appointments, period)}
            disabled={loading}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            CSV Agendamentos
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportReportPdf}
            disabled={loading}
            className="gap-1.5"
          >
            <Printer className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.cards.map((m, i) => {
              const Icon = m.icon;
              const colors = iconBg[m.colorKey] || iconBg.primary;
              return (
                <motion.div
                  key={m.label}
                  {...fadeUp(i + 1)}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-[13px] text-muted-foreground font-medium">{m.label}</p>
                    </div>
                    <p
                      className="text-xl font-bold tracking-tight text-foreground mb-1"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {m.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pie Chart — Services Distribution */}
          {metrics.serviceDistribution.length > 0 && (
            <motion.div
              {...fadeUp(8)}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Distribuição de serviços
              </h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.serviceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {metrics.serviceDistribution.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(value: number) => [`${value} agendamentos`, "Qtd"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
