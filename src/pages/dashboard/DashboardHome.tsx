import { useState, useEffect, useMemo } from "react";
import { Calendar, DollarSign, Users, TrendingUp, Copy, ExternalLink, Plus, AlertTriangle, Trophy, Clock, Zap, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfWeek, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { ProfessionalRanking } from "@/components/dashboard/ProfessionalRanking";
import { useNavigate } from "react-router-dom";
import MetricsCards from "@/components/admin/MetricsCards";
import WeeklySchedule from "@/components/admin/WeeklySchedule";
import { motion } from "framer-motion";

const periodOptions = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
] as const;

const statusLabels: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Agendado", className: "bg-amber-500/10 text-amber-600" },
  confirmed: { label: "Confirmado", className: "bg-primary/10 text-primary" },
  completed: { label: "Concluído", className: "bg-muted text-muted-foreground" },
};

export default function DashboardHome() {
  const { barbershop } = useBarbershop();
  const { user } = useAuth();
  const { daysRemaining, subscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [period, setPeriod] = useState<number>(30);
  const [todayAppts, setTodayAppts] = useState<any[]>([]);
  const [periodAppts, setPeriodAppts] = useState<any[]>([]);
  const [prevPeriodAppts, setPrevPeriodAppts] = useState<any[]>([]);
  const [weekAppts, setWeekAppts] = useState<any[]>([]);
  const [clientCount, setClientCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Admin";

  useEffect(() => {
    if (!barbershop) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const periodStart = format(subDays(new Date(), period), "yyyy-MM-dd");
    const prevPeriodStart = format(subDays(new Date(), period * 2), "yyyy-MM-dd");

    const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekStart = format(ws, "yyyy-MM-dd");
    const weekEnd = format(addDays(ws, 6), "yyyy-MM-dd");

    Promise.all([
      supabase.from("appointments").select("*, services(name), professionals(name)")
        .eq("barbershop_id", barbershop.id).eq("date", today)
        .not("status", "eq", "cancelled").order("start_time"),
      supabase.from("appointments").select("*, services(name, price), professionals(name)")
        .eq("barbershop_id", barbershop.id).gte("date", periodStart),
      supabase.from("appointments").select("*, services(name, price), professionals(name)")
        .eq("barbershop_id", barbershop.id).gte("date", prevPeriodStart).lt("date", periodStart),
      supabase.from("clients").select("id", { count: "exact" })
        .eq("barbershop_id", barbershop.id),
      supabase.from("appointments").select("id, client_name, date, start_time, end_time, status, services(name), professionals(name)")
        .eq("barbershop_id", barbershop.id).gte("date", weekStart).lte("date", weekEnd),
    ]).then(([apptRes, periodRes, prevRes, clientRes, weekRes]) => {
      setTodayAppts(apptRes.data || []);
      setPeriodAppts(periodRes.data || []);
      setPrevPeriodAppts(prevRes.data || []);
      setClientCount(clientRes.count || 0);
      setWeekAppts(weekRes.data || []);
      setPendingCount((apptRes.data || []).filter(a => a.status === "scheduled").length);
    });
  }, [barbershop, period]);

  const bookingUrl = barbershop ? `${window.location.origin}/agendar/${barbershop.slug}` : "";
  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast({ title: "Link copiado!" });
  };

  const completed = useMemo(() => periodAppts.filter(a => a.status !== "cancelled"), [periodAppts]);
  const prevCompleted = useMemo(() => prevPeriodAppts.filter(a => a.status !== "cancelled"), [prevPeriodAppts]);

  const revenue = useMemo(() => completed.reduce((s, a) => s + Number(a.price || 0), 0), [completed]);
  const prevRevenue = useMemo(() => prevCompleted.reduce((s, a) => s + Number(a.price || 0), 0), [prevCompleted]);

  const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(1) : null;
  const ticket = completed.length > 0 ? revenue / completed.length : 0;
  const todayRevenue = todayAppts.reduce((s, a) => s + Number(a.price || 0), 0);

  const metricsData = [
    {
      label: "Agendamentos hoje",
      value: String(todayAppts.length),
      icon: Calendar,
    },
    {
      label: `Faturamento (${period}d)`,
      value: `R$ ${revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      change: revenueChange ? `${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}%` : undefined,
      changeType: revenueChange ? (Number(revenueChange) >= 0 ? "positive" as const : "negative" as const) : undefined,
      icon: DollarSign,
    },
    {
      label: "Total de clientes",
      value: String(clientCount),
      icon: Users,
    },
    {
      label: `Ticket médio (${period}d)`,
      value: `R$ ${ticket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
    },
  ];

  const weeklyAppointments = useMemo(() => {
    return (weekAppts || []).map((a: any) => ({
      id: a.id,
      clientName: a.client_name,
      serviceName: a.services?.name || "",
      professionalName: a.professionals?.name || "",
      startTime: a.start_time?.slice(0, 5) || "",
      endTime: a.end_time?.slice(0, 5) || "",
      date: a.date,
      status: a.status as "scheduled" | "confirmed" | "completed" | "cancelled",
    }));
  }, [weekAppts]);

  const chartData = useMemo(() => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    completed.forEach((a: any) => {
      const d = parseISO(a.date);
      totals[d.getDay()] += Number(a.price || 0);
    });
    const weeks = Math.max(1, Math.ceil(period / 7));
    return days.map((day, i) => ({ day, value: Math.round(totals[i] / weeks) }));
  }, [completed, period]);

  // Next upcoming appointments (not completed)
  const upcomingToday = useMemo(() => {
    const now = format(new Date(), "HH:mm");
    return todayAppts
      .filter(a => a.start_time?.slice(0, 5) >= now && a.status !== "completed")
      .slice(0, 5);
  }, [todayAppts]);

  // Top professional today
  const topProToday = useMemo(() => {
    const counts: Record<string, { name: string; count: number; revenue: number }> = {};
    todayAppts.forEach(a => {
      const name = a.professionals?.name || "—";
      if (!counts[name]) counts[name] = { name, count: 0, revenue: 0 };
      counts[name].count++;
      counts[name].revenue += Number(a.price || 0);
    });
    return Object.values(counts).sort((a, b) => b.revenue - a.revenue)[0] || null;
  }, [todayAppts]);

  const PeriodFilter = () => (
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
  );

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      {subscription?.status === "trial" && daysRemaining !== null && daysRemaining <= 3 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4"
        >
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {daysRemaining === 0
                ? "Seu teste gratuito expira hoje!"
                : `Seu teste gratuito expira em ${daysRemaining} dia${daysRemaining > 1 ? "s" : ""}.`}
            </p>
            <p className="text-xs text-muted-foreground">Escolha um plano para continuar usando o CutFlow.</p>
          </div>
          <Button size="sm" variant="default" onClick={() => navigate("/billing")}>
            Ver planos
          </Button>
        </motion.div>
      )}

      <OnboardingChecklist />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {greeting}, {userName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodFilter />
          <Button variant="outline" size="sm" onClick={copyLink} className="hidden sm:flex rounded-xl">
            <Copy className="h-3.5 w-3.5 mr-1" /> Copiar link
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard/agenda")} className="rounded-xl">
            <Plus className="h-3.5 w-3.5 mr-1" /> Novo agendamento
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {pendingCount > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"
        >
          <Bell className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-foreground flex-1">
            <span className="font-medium">{pendingCount} agendamento{pendingCount > 1 ? "s" : ""}</span>{" "}
            aguardando confirmação hoje.
          </p>
          <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => navigate("/dashboard/agenda")}>
            Ver agenda
          </Button>
        </motion.div>
      )}

      <MetricsCards metrics={metricsData} />

      {/* Today summary + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today summary card */}
        <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Zap className="h-4 w-4 text-primary" />
            Resumo de hoje
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Agendamentos</span>
              <span className="text-sm font-bold text-foreground">{todayAppts.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Faturamento</span>
              <span className="text-sm font-bold text-foreground">R$ {todayRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Confirmados</span>
              <span className="text-sm font-bold text-foreground">{todayAppts.filter(a => a.status === "confirmed").length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendentes</span>
              <span className="text-sm font-bold text-amber-600">{pendingCount}</span>
            </div>
            {topProToday && (
              <div className="border-t border-border/40 pt-3 mt-3">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Barbeiro destaque</span>
                <p className="text-sm font-medium text-foreground mt-0.5">{topProToday.name}</p>
                <p className="text-xs text-muted-foreground">{topProToday.count} atend. · R$ {topProToday.revenue.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <Clock className="h-4 w-4 text-primary" />
              Próximos atendimentos
            </h3>
            <span className="text-xs font-medium text-primary">{upcomingToday.length} restantes</span>
          </div>
          {upcomingToday.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Sem atendimentos restantes</p>
              <p className="text-xs mt-1">Sua agenda está livre pelo resto do dia.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingToday.map(a => {
                const st = statusLabels[a.status] || statusLabels.scheduled;
                return (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
                    <span className="text-sm font-mono font-bold text-primary shrink-0 w-12">
                      {a.start_time?.slice(0, 5)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{a.client_name}</p>
                      <p className="text-xs text-muted-foreground">{a.services?.name} · {a.professionals?.name}</p>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] rounded-full border-0 ${st.className}`}>
                      {st.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <WeeklySchedule
        appointments={weeklyAppointments}
        onSlotClick={() => navigate("/dashboard/agenda")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Faturamento médio por dia da semana
            </h3>
            <span className="text-xs text-muted-foreground">Últimos {period} dias</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: 12 }}
                  formatter={(value: number) => [`R$ ${value}`, "Média"]}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's full agenda */}
        <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Agenda completa
            </h3>
            <span className="text-xs font-medium text-primary">{todayAppts.length} hoje</span>
          </div>
          {todayAppts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Nenhum agendamento</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {todayAppts.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/20 transition-colors">
                  <span className="text-xs font-mono font-medium text-primary mt-0.5 shrink-0 w-10">
                    {a.start_time?.slice(0, 5)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{a.client_name}</p>
                    <p className="text-xs text-muted-foreground">{a.services?.name} · {a.professionals?.name}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    (statusLabels[a.status] || statusLabels.scheduled).className
                  }`}>
                    {(statusLabels[a.status] || statusLabels.scheduled).label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Professional Ranking */}
      <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ranking de Barbeiros
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">Últimos {period} dias</span>
        </div>
        <ProfessionalRanking appointments={periodAppts} />
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-base font-semibold text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Ações rápidas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl" onClick={() => navigate("/dashboard/agenda")}>
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-xs">Ver agenda</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl" onClick={() => navigate("/dashboard/clients")}>
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs">Clientes</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl" onClick={() => navigate("/dashboard/finance")}>
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-xs">Financeiro</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl" onClick={copyLink}>
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs">Copiar link</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
