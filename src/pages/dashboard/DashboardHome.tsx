import { useState, useEffect, useMemo } from "react";
import {
  Calendar, DollarSign, Users, TrendingUp, Copy, ExternalLink, Plus,
  AlertTriangle, Trophy, Clock, Zap, Bell, Heart, Lightbulb, UserX,
  ArrowUpRight, ArrowDownRight, Target, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfWeek, addDays, parseISO, differenceInDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { ProfessionalRanking } from "@/components/dashboard/ProfessionalRanking";
import { useNavigate } from "react-router-dom";
import WeeklySchedule from "@/components/admin/WeeklySchedule";
import { motion } from "framer-motion";

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 173 58% 39%))",
  "hsl(var(--chart-3, 197 37% 24%))",
  "hsl(var(--chart-4, 43 74% 66%))",
  "hsl(var(--chart-5, 27 87% 67%))",
  "hsl(280 65% 60%)",
  "hsl(340 75% 55%)",
  "hsl(210 70% 50%)",
];

const periodOptions = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
] as const;

const statusLabels: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Agendado", className: "bg-amber-500/10 text-amber-600" },
  confirmed: { label: "Confirmado", className: "bg-primary/10 text-primary" },
  completed: { label: "Concluido", className: "bg-muted text-muted-foreground" },
};

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.06 },
});

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: 12,
  color: "hsl(var(--foreground))",
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
  const [clients, setClients] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [monthAppts, setMonthAppts] = useState<any[]>([]);
  const [prevMonthAppts, setPrevMonthAppts] = useState<any[]>([]);

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
    const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
    const prevMonth = subMonths(new Date(), 1);
    const prevMonthStart = format(startOfMonth(prevMonth), "yyyy-MM-dd");
    const prevMonthEnd = format(endOfMonth(prevMonth), "yyyy-MM-dd");

    Promise.all([
      supabase.from("appointments").select("*, services(name, price), professionals(name)")
        .eq("barbershop_id", barbershop.id).eq("date", today)
        .not("status", "eq", "cancelled").order("start_time"),
      supabase.from("appointments").select("*, services(name, price), professionals(name)")
        .eq("barbershop_id", barbershop.id).gte("date", periodStart),
      supabase.from("appointments").select("*, services(name, price), professionals(name)")
        .eq("barbershop_id", barbershop.id).gte("date", prevPeriodStart).lt("date", periodStart),
      supabase.from("clients").select("*")
        .eq("barbershop_id", barbershop.id),
      supabase.from("appointments").select("id, client_name, date, start_time, end_time, status, services(name), professionals(name)")
        .eq("barbershop_id", barbershop.id).gte("date", weekStart).lte("date", weekEnd),
      supabase.from("appointments").select("*, services(name, price)")
        .eq("barbershop_id", barbershop.id).gte("date", monthStart).lte("date", monthEnd),
      supabase.from("appointments").select("*, services(name, price)")
        .eq("barbershop_id", barbershop.id).gte("date", prevMonthStart).lte("date", prevMonthEnd),
    ]).then(([apptRes, periodRes, prevRes, clientRes, weekRes, monthRes, prevMonthRes]) => {
      setTodayAppts(apptRes.data || []);
      setPeriodAppts(periodRes.data || []);
      setPrevPeriodAppts(prevRes.data || []);
      setClients(clientRes.data || []);
      setClientCount(clientRes.data?.length || 0);
      setWeekAppts(weekRes.data || []);
      setMonthAppts(monthRes.data || []);
      setPrevMonthAppts(prevMonthRes.data || []);
      setPendingCount((apptRes.data || []).filter(a => a.status === "scheduled").length);
    });
  }, [barbershop, period]);

  const bookingUrl = barbershop ? `${window.location.origin}/agendar/${barbershop.slug}` : "";
  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast({ title: "Link copiado!" });
  };

  // ── Computed data ──
  const completed = useMemo(() => periodAppts.filter(a => a.status !== "cancelled"), [periodAppts]);
  const cancelled = useMemo(() => periodAppts.filter(a => a.status === "cancelled"), [periodAppts]);
  const prevCompleted = useMemo(() => prevPeriodAppts.filter(a => a.status !== "cancelled"), [prevPeriodAppts]);

  const revenue = useMemo(() => completed.reduce((s, a) => s + Number(a.price || 0), 0), [completed]);
  const prevRevenue = useMemo(() => prevCompleted.reduce((s, a) => s + Number(a.price || 0), 0), [prevCompleted]);
  const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(1) : null;

  const monthRevenue = useMemo(() => monthAppts.filter(a => a.status !== "cancelled").reduce((s, a) => s + Number(a.price || 0), 0), [monthAppts]);
  const prevMonthRevenue = useMemo(() => prevMonthAppts.filter(a => a.status !== "cancelled").reduce((s, a) => s + Number(a.price || 0), 0), [prevMonthAppts]);
  const monthRevenueChange = prevMonthRevenue > 0 ? ((monthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1) : null;

  const ticket = completed.length > 0 ? revenue / completed.length : 0;
  const todayRevenue = todayAppts.reduce((s, a) => s + Number(a.price || 0), 0);

  // Next appointment
  const nextAppt = useMemo(() => {
    const now = format(new Date(), "HH:mm");
    return todayAppts.find(a => a.start_time?.slice(0, 5) >= now && a.status !== "completed") || null;
  }, [todayAppts]);

  const upcomingToday = useMemo(() => {
    const now = format(new Date(), "HH:mm");
    return todayAppts.filter(a => a.start_time?.slice(0, 5) >= now && a.status !== "completed").slice(0, 5);
  }, [todayAppts]);

  // ── Revenue chart (daily over period) ──
  const revenueChartData = useMemo(() => {
    const map: Record<string, { date: string; revenue: number; count: number }> = {};
    const days = Math.min(period, 30); // show max 30 data points
    for (let i = days - 1; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "yyyy-MM-dd");
      map[d] = { date: format(subDays(new Date(), i), "dd/MM"), revenue: 0, count: 0 };
    }
    completed.forEach(a => {
      if (map[a.date]) {
        map[a.date].revenue += Number(a.price || 0);
        map[a.date].count++;
      }
    });
    return Object.values(map);
  }, [completed, period]);

  // ── Day-of-week chart ──
  const weekdayChartData = useMemo(() => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    completed.forEach(a => {
      const d = parseISO(a.date);
      totals[d.getDay()] += Number(a.price || 0);
      counts[d.getDay()]++;
    });
    const weeks = Math.max(1, Math.ceil(period / 7));
    return days.map((day, i) => ({
      day,
      revenue: Math.round(totals[i] / weeks),
      atendimentos: Math.round(counts[i] / weeks),
    }));
  }, [completed, period]);

  // ── Top services pie ──
  const servicePieData = useMemo(() => {
    const counts: Record<string, number> = {};
    completed.forEach(a => {
      const name = a.services?.name || "-";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [completed]);

  // ── Top professionals bar ──
  const proPerfData = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; count: number }> = {};
    completed.forEach(a => {
      const name = a.professionals?.name || "-";
      if (!map[name]) map[name] = { name, revenue: 0, count: 0 };
      map[name].revenue += Number(a.price || 0);
      map[name].count++;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [completed]);

  // ── Inactive clients ──
  const inactiveClients = useMemo(() => {
    if (!clients.length || !periodAppts.length) return { d30: 0, d60: 0, d90: 0 };
    const lastVisit: Record<string, string> = {};
    periodAppts.concat(prevPeriodAppts).forEach(a => {
      if (a.status === "cancelled") return;
      const key = a.client_name?.toLowerCase().trim();
      if (!key) return;
      if (!lastVisit[key] || a.date > lastVisit[key]) lastVisit[key] = a.date;
    });
    const now = new Date();
    let d30 = 0, d60 = 0, d90 = 0;
    clients.forEach(c => {
      const key = c.name?.toLowerCase().trim();
      const last = lastVisit[key];
      if (!last) { d90++; return; }
      const diff = differenceInDays(now, parseISO(last));
      if (diff >= 90) d90++;
      else if (diff >= 60) d60++;
      else if (diff >= 30) d30++;
    });
    return { d30, d60, d90 };
  }, [clients, periodAppts, prevPeriodAppts]);

  // ── Idle hours analysis ──
  const idleHours = useMemo(() => {
    const dayNames = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];
    const grid: Record<string, number> = {};
    for (let d = 0; d < 7; d++) {
      for (let h = 8; h <= 20; h++) {
        grid[`${d}-${h}`] = 0;
      }
    }
    completed.forEach(a => {
      const day = parseISO(a.date).getDay();
      const hour = parseInt(a.start_time?.slice(0, 2) || "0");
      const key = `${day}-${hour}`;
      if (grid[key] !== undefined) grid[key]++;
    });
    const weeks = Math.max(1, Math.ceil(period / 7));
    const entries = Object.entries(grid)
      .map(([key, count]) => {
        const [d, h] = key.split("-").map(Number);
        return { day: d, dayName: dayNames[d], hour: h, avg: count / weeks };
      })
      .filter(e => e.day >= 1 && e.day <= 6 && e.hour >= 9 && e.hour <= 19)
      .sort((a, b) => a.avg - b.avg);
    return entries.slice(0, 3).filter(e => e.avg < 1);
  }, [completed, period]);

  // ── Smart Insights ──
  const insights = useMemo(() => {
    const items: { text: string; icon: React.ElementType; color: string }[] = [];

    // Busiest hour
    const hourCounts: Record<string, number> = {};
    completed.forEach(a => {
      const h = a.start_time?.slice(0, 2) + "h";
      if (h) hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (topHour) items.push({ text: `Seu horario mais movimentado e ${topHour[0]}`, icon: Clock, color: "text-primary" });

    // Top service
    if (servicePieData[0]) items.push({ text: `Servico mais vendido: ${servicePieData[0].name} (${servicePieData[0].value}x)`, icon: Target, color: "text-primary" });

    // Cancellation count
    if (cancelled.length > 0) items.push({ text: `${cancelled.length} cancelamento${cancelled.length > 1 ? "s" : ""} nos ultimos ${period} dias`, icon: AlertTriangle, color: "text-destructive" });

    // Inactive clients
    const totalInactive = inactiveClients.d30 + inactiveClients.d60 + inactiveClients.d90;
    if (totalInactive > 0) items.push({ text: `${totalInactive} cliente${totalInactive > 1 ? "s" : ""} inativos ha mais de 30 dias`, icon: UserX, color: "text-amber-600" });

    // Idle hours
    if (idleHours.length > 0) {
      const h = idleHours[0];
      items.push({ text: `${h.dayName} ${h.hour}h tem poucos agendamentos`, icon: BarChart3, color: "text-muted-foreground" });
    }

    // Today availability
    const todayOpenSlots = 10 - todayAppts.length;
    if (todayOpenSlots > 3) items.push({ text: `Ainda existem ~${todayOpenSlots} horarios disponiveis hoje`, icon: Calendar, color: "text-primary" });

    return items.slice(0, 5);
  }, [completed, cancelled, servicePieData, inactiveClients, idleHours, todayAppts, period]);

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

  const PeriodFilter = () => (
    <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
      {periodOptions.map(opt => (
        <button key={opt.value} onClick={() => setPeriod(opt.value)}
          className={`px-4 py-2 text-sm sm:text-xs font-medium rounded-lg transition-all duration-200 ${
            period === opt.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >{opt.label}</button>
      ))}
    </div>
  );

  const MetricCard = ({ label, value, change, changePositive, icon: Icon, sub, idx }: {
    label: string; value: string; change?: string | null; changePositive?: boolean; icon: React.ElementType; sub?: string; idx: number;
  }) => (
    <motion.div {...fadeUp(idx)}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-5 hover:shadow-md transition-shadow duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="text-sm sm:text-[13px] font-medium text-muted-foreground truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {value}
          </p>
          {change && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${changePositive ? "text-primary" : "text-destructive"}`}>
              {changePositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {change} vs periodo anterior
            </span>
          )}
          {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
        </div>
        <div className="h-10 w-10 rounded-xl bg-accent/60 flex items-center justify-center shrink-0 ml-2">
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      {/* Trial Banner */}
      {subscription?.status === "trial" && daysRemaining !== null && daysRemaining <= 3 && (
        <motion.div {...fadeUp(0)} className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {daysRemaining === 0 ? "Seu teste gratuito expira hoje!" : `Seu teste gratuito expira em ${daysRemaining} dia${daysRemaining > 1 ? "s" : ""}.`}
            </p>
            <p className="text-xs text-muted-foreground">Escolha um plano para continuar usando o CutFlow.</p>
          </div>
          <Button size="sm" variant="default" onClick={() => navigate("/billing")}>Ver planos</Button>
        </motion.div>
      )}

      <OnboardingChecklist />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {greeting}, {userName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodFilter />
          <Button variant="outline" size="sm" onClick={copyLink} className="hidden sm:flex rounded-xl">
            <Copy className="h-3.5 w-3.5 mr-1" /> Copiar link
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard/agenda")} className="rounded-xl">
            <Plus className="h-3.5 w-3.5 mr-1" /> Novo agendamento
          </Button>
        </div>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <motion.div {...fadeUp(1)} className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <Bell className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-foreground flex-1">
            <span className="font-medium">{pendingCount} agendamento{pendingCount > 1 ? "s" : ""}</span> aguardando confirmacao hoje.
          </p>
          <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={() => navigate("/dashboard/agenda")}>Ver agenda</Button>
        </motion.div>
      )}

      {/* ── METRICS CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard idx={0} label="Faturamento do mes" value={`R$ ${monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
          change={monthRevenueChange ? `${Number(monthRevenueChange) >= 0 ? "+" : ""}${monthRevenueChange}%` : null}
          changePositive={monthRevenueChange ? Number(monthRevenueChange) >= 0 : true}
          icon={DollarSign} />
        <MetricCard idx={1} label="Atendimentos hoje" value={String(todayAppts.length)}
          sub={`R$ ${todayRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} faturados`}
          icon={Calendar} />
        <MetricCard idx={2} label="Proximo atendimento"
          value={nextAppt ? nextAppt.start_time?.slice(0, 5) : "--:--"}
          sub={nextAppt ? `${nextAppt.client_name} - ${nextAppt.services?.name}` : "Sem atendimentos"}
          icon={Clock} />
        <MetricCard idx={3} label={`Ticket medio (${period}d)`}
          value={`R$ ${ticket.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
          sub={`${completed.length} atendimentos`}
          icon={TrendingUp} />
      </div>

      {/* ── TODAY SUMMARY + UPCOMING ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div {...fadeUp(4)} className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Zap className="h-4 w-4 text-primary" /> Resumo de hoje
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Agendamentos</span><span className="text-sm font-bold text-foreground">{todayAppts.length}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Faturamento</span><span className="text-sm font-bold text-foreground">R$ {todayRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Confirmados</span><span className="text-sm font-bold text-foreground">{todayAppts.filter(a => a.status === "confirmed").length}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Pendentes</span><span className="text-sm font-bold text-amber-600">{pendingCount}</span></div>
          </div>
        </motion.div>

        <motion.div {...fadeUp(5)} className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <Clock className="h-4 w-4 text-primary" /> Agenda de hoje
            </h3>
            <span className="text-xs font-medium text-primary">{upcomingToday.length} restantes</span>
          </div>
          {todayAppts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Nenhum agendamento hoje</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {todayAppts.map(a => {
                const st = statusLabels[a.status] || statusLabels.scheduled;
                return (
                  <div key={a.id} onClick={() => navigate("/dashboard/agenda")}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/20 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-mono font-bold text-primary shrink-0 w-12">{a.start_time?.slice(0, 5)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{a.client_name}</p>
                      <p className="text-xs text-muted-foreground">{a.services?.name} · {a.professionals?.name}</p>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] rounded-full border-0 ${st.className}`}>{st.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── REVENUE AREA CHART ── */}
      <motion.div {...fadeUp(6)} className="rounded-2xl border border-border bg-card p-4 sm:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Faturamento diario
          </h3>
          <span className="text-xs text-muted-foreground">Ultimos {Math.min(period, 30)} dias</span>
        </div>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueChartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={40} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$ ${v}`, "Receita"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── INSIGHTS + INACTIVE CLIENTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Insights */}
        <motion.div {...fadeUp(7)} className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Lightbulb className="h-4 w-4 text-primary" /> Insights do negocio
          </h3>
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Sem insights disponiveis. Agende mais atendimentos para gerar analises.</p>
          ) : (
            <div className="space-y-3">
              {insights.map((ins, i) => {
                const IIcon = ins.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/50">
                    <IIcon className={`h-4 w-4 mt-0.5 shrink-0 ${ins.color}`} />
                    <p className="text-sm text-foreground">{ins.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Inactive Clients */}
        <motion.div {...fadeUp(8)} className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <UserX className="h-4 w-4 text-amber-600" /> Clientes inativos
          </h3>
          <div className="space-y-3">
            {[
              { label: "Inativos ha 30+ dias", value: inactiveClients.d30, color: "bg-amber-500/10 text-amber-600" },
              { label: "Inativos ha 60+ dias", value: inactiveClients.d60, color: "bg-destructive/10 text-destructive" },
              { label: "Inativos ha 90+ dias (perdidos)", value: inactiveClients.d90, color: "bg-destructive/15 text-destructive" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-border/50">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <Badge variant="secondary" className={`text-xs rounded-full border-0 ${item.color}`}>{item.value}</Badge>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="rounded-xl text-xs flex-1" onClick={() => navigate("/dashboard/retention")}>
              <Heart className="h-3.5 w-3.5 mr-1" /> Ver retencao
            </Button>
            <Button size="sm" className="rounded-xl text-xs flex-1" onClick={() => navigate("/dashboard/automations")}>
              <Bell className="h-3.5 w-3.5 mr-1" /> Campanha de retorno
            </Button>
          </div>
        </motion.div>
      </div>

      {/* ── IDLE HOURS ── */}
      {idleHours.length > 0 && (
        <motion.div {...fadeUp(9)} className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <BarChart3 className="h-4 w-4 text-muted-foreground" /> Horarios ociosos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {idleHours.map((h, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-muted/30">
                <p className="text-sm font-medium text-foreground">{h.dayName} as {h.hour}h</p>
                <p className="text-xs text-muted-foreground mt-1">Media de {h.avg.toFixed(1)} agendamentos/semana</p>
                <p className="text-xs text-primary mt-2 font-medium">Sugestao: Criar promocao para este horario</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── CHARTS: Services Pie + Day of Week Bar + Pro Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Services Pie */}
        <motion.div {...fadeUp(10)} className="rounded-2xl border border-border bg-card p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm sm:text-base font-semibold text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Servicos mais vendidos
          </h3>
          {servicePieData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sem dados</p>
          ) : (
            <div className="h-[240px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={servicePieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="name"
                    label={({ name, percent }) => window.innerWidth > 640 ? `${name} (${(percent * 100).toFixed(0)}%)` : `${(percent * 100).toFixed(0)}%`}
                    labelLine={window.innerWidth > 640}
                  >
                    {servicePieData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} agendamentos`, "Qtd"]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Day of week */}
        <motion.div {...fadeUp(11)} className="rounded-2xl border border-border bg-card p-4 sm:p-6 hover:shadow-md transition-shadow">
          <h3 className="text-sm sm:text-base font-semibold text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Faturamento por dia da semana
          </h3>
          <div className="h-[240px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayChartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={35} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [name === "revenue" ? `R$ ${v}` : v, name === "revenue" ? "Receita" : "Atendimentos"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Professional Performance */}
      {proPerfData.length > 0 && (
        <motion.div {...fadeUp(12)} className="rounded-2xl border border-border bg-card p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <Trophy className="h-4 w-4 text-primary" /> Profissionais com mais atendimentos
            </h3>
            <span className="text-xs text-muted-foreground">Ultimos {period} dias</span>
          </div>
          <div className="h-[200px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={proPerfData} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [name === "revenue" ? `R$ ${v}` : v, name === "revenue" ? "Receita" : "Atendimentos"]} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} name="Atendimentos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <WeeklySchedule appointments={weeklyAppointments} onSlotClick={() => navigate("/dashboard/agenda")} />

      {/* Retention + Loyalty shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/dashboard/retention")}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center"><Heart className="h-4 w-4 text-primary" /></div>
            <h3 className="text-sm font-semibold text-foreground">Retencao Inteligente</h3>
          </div>
          <p className="text-xs text-muted-foreground">Analise preditiva de retorno de clientes baseada no historico de visitas</p>
          <p className="text-xs text-primary mt-2 font-medium">Ver analise →</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/dashboard/loyalty")}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center"><Trophy className="h-4 w-4 text-primary" /></div>
            <h3 className="text-sm font-semibold text-foreground">Programa de Fidelidade</h3>
          </div>
          <p className="text-xs text-muted-foreground">Recompense clientes fieis e incentive o retorno frequente</p>
          <p className="text-xs text-primary mt-2 font-medium">Gerenciar →</p>
        </div>
      </div>

      {/* Quick actions */}
      <motion.div {...fadeUp(13)} className="rounded-2xl border border-border bg-card p-4 sm:p-6 hover:shadow-md transition-shadow">
        <h3 className="text-sm sm:text-base font-semibold text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Acoes rapidas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-5 sm:py-4 flex-col gap-2 rounded-xl text-sm" onClick={() => navigate("/dashboard/agenda")}><Calendar className="h-5 w-5 text-primary" /><span className="text-xs">Ver agenda</span></Button>
          <Button variant="outline" className="h-auto py-5 sm:py-4 flex-col gap-2 rounded-xl text-sm" onClick={() => navigate("/dashboard/clients")}><Users className="h-5 w-5 text-muted-foreground" /><span className="text-xs">Clientes</span></Button>
          <Button variant="outline" className="h-auto py-5 sm:py-4 flex-col gap-2 rounded-xl text-sm" onClick={() => navigate("/dashboard/finance")}><DollarSign className="h-5 w-5 text-primary" /><span className="text-xs">Financeiro</span></Button>
          <Button variant="outline" className="h-auto py-5 sm:py-4 flex-col gap-2 rounded-xl text-sm" onClick={copyLink}><ExternalLink className="h-5 w-5 text-muted-foreground" /><span className="text-xs">Copiar link</span></Button>
        </div>
      </motion.div>
    </div>
  );
}