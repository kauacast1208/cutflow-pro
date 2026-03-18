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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, startOfWeek, addDays, parseISO, differenceInDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { WelcomeModal } from "@/components/dashboard/WelcomeModal";
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
  scheduled: { label: "Agendado", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  confirmed: { label: "Confirmado", className: "bg-primary/10 text-primary" },
  completed: { label: "Concluído", className: "bg-muted text-muted-foreground" },
};

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: 12,
  color: "hsl(var(--foreground))",
  boxShadow: "0 8px 32px -4px rgba(0,0,0,0.3)",
};

/* ── Section Card wrapper ── */
function SectionCard({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-border/60 bg-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:border-border/80 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children, action }: { icon: React.ElementType; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        {children}
      </h3>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">{description}</p>}
    </div>
  );
}

export default function DashboardHome() {
  const { barbershop } = useBarbershop();
  const { user } = useAuth();
  const { daysRemaining, subscription, isTrial } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [period, setPeriod] = useState<number>(30);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
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
      setLoading(false);
    });
  }, [barbershop, period]);

  const bookingUrl = barbershop ? `${window.location.origin}/b/${barbershop.slug}` : "";
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

  const { returningClients, newClients } = useMemo(() => {
    const clientAppts: Record<string, number> = {};
    completed.forEach(a => {
      const key = a.client_name?.toLowerCase().trim();
      if (key) clientAppts[key] = (clientAppts[key] || 0) + 1;
    });
    let returning = 0;
    let newC = 0;
    Object.values(clientAppts).forEach(count => {
      if (count >= 2) returning++;
      else newC++;
    });
    return { returningClients: returning, newClients: newC };
  }, [completed]);

  const upcomingToday = useMemo(() => {
    const now = format(new Date(), "HH:mm");
    return todayAppts.filter(a => a.start_time?.slice(0, 5) >= now && a.status !== "completed").slice(0, 5);
  }, [todayAppts]);

  const revenueChartData = useMemo(() => {
    const map: Record<string, { date: string; revenue: number; count: number }> = {};
    const days = Math.min(period, 30);
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

  const idleHours = useMemo(() => {
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
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

  const insights = useMemo(() => {
    const items: { text: string; icon: React.ElementType; color: string }[] = [];
    const hourCounts: Record<string, number> = {};
    completed.forEach(a => {
      const h = a.start_time?.slice(0, 2) + "h";
      if (h) hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const topHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    if (topHour) items.push({ text: `Seu horário mais movimentado é ${topHour[0]}`, icon: Clock, color: "text-primary" });
    if (servicePieData[0]) items.push({ text: `Serviço mais vendido: ${servicePieData[0].name} (${servicePieData[0].value}x)`, icon: Target, color: "text-primary" });
    if (cancelled.length > 0) items.push({ text: `${cancelled.length} cancelamento${cancelled.length > 1 ? "s" : ""} nos últimos ${period} dias`, icon: AlertTriangle, color: "text-destructive" });
    const totalInactive = inactiveClients.d30 + inactiveClients.d60 + inactiveClients.d90;
    if (totalInactive > 0) items.push({ text: `${totalInactive} cliente${totalInactive > 1 ? "s" : ""} inativo${totalInactive > 1 ? "s" : ""} há mais de 30 dias`, icon: UserX, color: "text-amber-600 dark:text-amber-400" });
    if (idleHours.length > 0) {
      const h = idleHours[0];
      items.push({ text: `${h.dayName} às ${h.hour}h tem poucos agendamentos`, icon: BarChart3, color: "text-muted-foreground" });
    }
    const todayOpenSlots = 10 - todayAppts.length;
    if (todayOpenSlots > 3) items.push({ text: `Ainda existem ~${todayOpenSlots} horários disponíveis hoje`, icon: Calendar, color: "text-primary" });
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
    <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-1">
      {periodOptions.map(opt => (
        <button key={opt.value} onClick={() => setPeriod(opt.value)}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
            period === opt.value
              ? "bg-card text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >{opt.label}</button>
      ))}
    </div>
  );

  /* ── KPI Card ── */
  const MetricCard = ({ label, value, change, changePositive, icon: Icon, sub, idx, accent }: {
    label: string; value: string; change?: string | null; changePositive?: boolean; icon: React.ElementType; sub?: string; idx: number; accent?: string;
  }) => (
    <motion.div {...fadeUp(idx)}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 sm:p-5 transition-all duration-300 hover:border-border/80 hover:shadow-md"
    >
      {/* Subtle top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${accent || "bg-primary/40"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative flex items-start justify-between gap-2 sm:gap-3">
        <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</p>
          <p className="text-xl sm:text-[28px] font-extrabold tracking-tight text-foreground leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {loading ? <Skeleton className="h-6 sm:h-7 w-20 sm:w-24" /> : value}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {change && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                changePositive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              }`}>
                {changePositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {change}
              </span>
            )}
            {sub && <p className="text-[10px] sm:text-[11px] text-muted-foreground/60">{sub}</p>}
          </div>
        </div>
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-primary/70" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 sm:pb-6">
      <WelcomeModal />

      {/* Trial Banner - urgent */}
      {isTrial && daysRemaining !== null && daysRemaining <= 3 && (
        <motion.div {...fadeUp(0)} className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {daysRemaining === 0 ? "Seu teste gratuito expira hoje!" : `Seu teste gratuito expira em ${daysRemaining} dia${daysRemaining > 1 ? "s" : ""}.`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Escolha um plano para continuar usando o CutFlow.</p>
          </div>
          <Button size="sm" variant="default" onClick={() => navigate("/billing")} className="rounded-xl shrink-0">Ver planos</Button>
        </motion.div>
      )}

      <OnboardingChecklist />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-[28px] font-extrabold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {greeting}, {userName}
            </h2>
            {isTrial && daysRemaining !== null && daysRemaining > 3 && (
              <Badge variant="secondary" className="bg-primary/8 text-primary border-primary/15 text-[10px] font-semibold px-2 py-0.5 gap-1 rounded-lg">
                <Clock className="h-3 w-3" />
                Trial: {daysRemaining}d
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">{format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodFilter />
          <Button variant="outline" size="sm" onClick={copyLink} className="hidden sm:flex rounded-xl text-xs h-8 border-border/60">
            <Copy className="h-3 w-3 mr-1.5" /> Copiar link
          </Button>
          <Button size="sm" onClick={() => navigate("/dashboard/agenda")} className="rounded-xl text-xs h-8">
            <Plus className="h-3 w-3 mr-1.5" /> Novo agendamento
          </Button>
        </div>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <motion.div {...fadeUp(1)} className="flex items-center gap-3 rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-foreground flex-1">
            <span className="font-semibold">{pendingCount} agendamento{pendingCount > 1 ? "s" : ""}</span>{" "}
            <span className="text-muted-foreground">aguardando confirmação</span>
          </p>
          <Button size="sm" variant="outline" className="rounded-lg text-xs h-8 border-border/60" onClick={() => navigate("/dashboard/agenda")}>Ver agenda</Button>
        </motion.div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <MetricCard
          idx={0} label="Atendimentos hoje" icon={Calendar}
          value={String(todayAppts.length)}
          sub={`R$ ${todayRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })} faturado`}
        />
        <MetricCard
          idx={1} label="Atendimentos no mês" icon={BarChart3}
          value={String(monthAppts.filter(a => a.status !== "cancelled").length)}
          sub={`${monthAppts.filter(a => a.status === "cancelled").length} cancelamento${monthAppts.filter(a => a.status === "cancelled").length !== 1 ? "s" : ""}`}
        />
        <MetricCard
          idx={2} label="Faturamento mensal" icon={DollarSign}
          value={`R$ ${monthRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
          change={monthRevenueChange ? `${Number(monthRevenueChange) >= 0 ? "+" : ""}${monthRevenueChange}%` : null}
          changePositive={monthRevenueChange ? Number(monthRevenueChange) >= 0 : true}
        />
        <MetricCard
          idx={3} label="Novos clientes" icon={Users}
          value={String(newClients)}
          sub="no período"
        />
        <MetricCard
          idx={4} label="Clientes recorrentes" icon={Heart}
          value={String(returningClients)}
          sub="2+ visitas"
          accent="bg-rose-400/40"
        />
        <MetricCard
          idx={5} label="Ticket médio" icon={TrendingUp}
          value={`R$ ${ticket.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          sub="por atendimento"
        />
      </div>

      {/* ── TODAY SUMMARY + UPCOMING ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div {...fadeUp(4)}>
          <SectionCard>
            <SectionTitle icon={ArrowUpRight}>Próximos</SectionTitle>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            ) : upcomingToday.length === 0 ? (
              <EmptyState icon={Calendar} title="Nenhum atendimento pendente" description="Seus próximos agendamentos aparecerão aqui" />
            ) : (
              <div className="space-y-2">
                {upcomingToday.map((a, i) => (
                  <div key={a.id} onClick={() => navigate("/dashboard/agenda")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                      i === 0
                        ? "bg-primary/5 border border-primary/15 shadow-sm"
                        : "hover:bg-accent/40 border border-transparent"
                    }`}
                  >
                    <span className="text-sm font-mono font-bold text-primary shrink-0 w-12 tabular-nums">{a.start_time?.slice(0, 5)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{a.client_name}</p>
                      <p className="text-[11px] text-muted-foreground/60 truncate">{a.services?.name}</p>
                    </div>
                    {i === 0 && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md shrink-0">
                        Próximo
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </motion.div>

        <motion.div {...fadeUp(5)} className="lg:col-span-2">
          <SectionCard>
            <SectionTitle icon={Clock} action={
              <span className="text-[11px] font-semibold text-primary tabular-nums">{upcomingToday.length} restantes</span>
            }>
              Agenda de hoje
            </SectionTitle>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
              </div>
            ) : todayAppts.length === 0 ? (
              <EmptyState icon={Calendar} title="Nenhum agendamento hoje" description="Novos agendamentos aparecerão automaticamente aqui" />
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {todayAppts.map(a => {
                  const st = statusLabels[a.status] || statusLabels.scheduled;
                  return (
                    <div key={a.id} onClick={() => navigate("/dashboard/agenda")}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:border-primary/20 hover:bg-accent/30 transition-all cursor-pointer group"
                    >
                      <span className="text-sm font-mono font-bold text-primary shrink-0 w-12 tabular-nums">{a.start_time?.slice(0, 5)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">{a.client_name}</p>
                        <p className="text-xs text-muted-foreground/60 truncate">{a.services?.name} · {a.professionals?.name}</p>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] rounded-full border-0 font-semibold ${st.className}`}>{st.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </motion.div>
      </div>

      {/* ── ACTIVITY TIMELINE ── */}
      <motion.div {...fadeUp(5.5)}>
        <SectionCard>
          <SectionTitle icon={Clock}>Atividade recente</SectionTitle>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : (() => {
            const recentEvents = periodAppts
              .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
              .slice(0, 8)
              .map(a => {
                const statusMap: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
                  scheduled: { label: "Novo agendamento", icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
                  confirmed: { label: "Confirmado", icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
                  completed: { label: "Concluído", icon: Trophy, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
                  cancelled: { label: "Cancelamento", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
                  rescheduled: { label: "Remarcação", icon: Clock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
                };
                const cfg = statusMap[a.status] || statusMap.scheduled;
                const ts = a.updated_at || a.created_at;
                let timeLabel = "";
                try {
                  const d = new Date(ts);
                  const now = new Date();
                  const diffMs = now.getTime() - d.getTime();
                  const diffMin = Math.floor(diffMs / 60000);
                  if (diffMin < 1) timeLabel = "agora";
                  else if (diffMin < 60) timeLabel = `${diffMin}min atrás`;
                  else if (diffMin < 1440) timeLabel = `${Math.floor(diffMin / 60)}h atrás`;
                  else timeLabel = `${Math.floor(diffMin / 1440)}d atrás`;
                } catch { timeLabel = ""; }
                return { ...a, cfg, timeLabel };
              });

            return recentEvents.length === 0 ? (
              <EmptyState icon={Clock} title="Sem atividade recente" description="Novos agendamentos e eventos aparecerão aqui" />
            ) : (
              <div className="space-y-1.5 max-h-[320px] overflow-y-auto">
                {recentEvents.map((ev) => {
                  const EvIcon = ev.cfg.icon;
                  return (
                    <div key={`${ev.id}-${ev.status}`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate("/dashboard/agenda")}
                    >
                      <div className={`h-7 w-7 rounded-lg ${ev.cfg.bg} flex items-center justify-center shrink-0`}>
                        <EvIcon className={`h-3.5 w-3.5 ${ev.cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {ev.cfg.label} · {ev.client_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 truncate">
                          {ev.services?.name}{ev.professionals?.name ? ` · ${ev.professionals.name}` : ""}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/40 font-medium shrink-0 tabular-nums">
                        {ev.timeLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </SectionCard>
      </motion.div>


      <motion.div {...fadeUp(6)}>
        <SectionCard>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Faturamento diário
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground/60 font-medium">Últimos {Math.min(period, 30)} dias</span>
          </div>
          {loading ? (
            <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
          ) : (
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground) / 0.3)" interval="preserveStartEnd" tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground) / 0.3)" width={40} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$ ${v}`, "Receita"]} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))", stroke: "hsl(var(--primary))" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </motion.div>

      {/* ── INSIGHTS + INACTIVE CLIENTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div {...fadeUp(7)}>
          <SectionCard className="h-full">
            <SectionTitle icon={Lightbulb}>Insights do negócio</SectionTitle>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : insights.length === 0 ? (
              <EmptyState icon={Lightbulb} title="Sem insights disponíveis" description="Agende mais atendimentos para gerar análises" />
            ) : (
              <div className="space-y-2">
                {insights.map((ins, i) => {
                  const IIcon = ins.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/40 hover:border-border/60 transition-colors">
                      <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 mt-0.5">
                        <IIcon className={`h-3.5 w-3.5 ${ins.color}`} />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{ins.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </motion.div>

        <motion.div {...fadeUp(8)}>
          <SectionCard className="h-full">
            <SectionTitle icon={UserX} action={
              <span className="text-[11px] font-semibold text-muted-foreground/50">
                {inactiveClients.d30 + inactiveClients.d60 + inactiveClients.d90} total
              </span>
            }>
              Clientes inativos
            </SectionTitle>
            <div className="space-y-2">
              {[
                { label: "Inativos há 30+ dias", value: inactiveClients.d30, severity: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
                { label: "Inativos há 60+ dias", value: inactiveClients.d60, severity: "bg-destructive/10 text-destructive" },
                { label: "Inativos há 90+ dias", value: inactiveClients.d90, severity: "bg-destructive/15 text-destructive" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-border/40">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <Badge variant="secondary" className={`text-[11px] font-bold rounded-lg border-0 min-w-[28px] justify-center ${item.severity}`}>{item.value}</Badge>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="rounded-xl text-xs flex-1 h-9 border-border/60" onClick={() => navigate("/dashboard/retention")}>
                <Heart className="h-3 w-3 mr-1.5" /> Retenção
              </Button>
              <Button size="sm" className="rounded-xl text-xs flex-1 h-9" onClick={() => navigate("/dashboard/automations")}>
                <Bell className="h-3 w-3 mr-1.5" /> Campanha
              </Button>
            </div>
          </SectionCard>
        </motion.div>
      </div>

      {/* ── IDLE HOURS ── */}
      {idleHours.length > 0 && (
        <motion.div {...fadeUp(9)}>
          <SectionCard>
            <SectionTitle icon={BarChart3}>Horários ociosos</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {idleHours.map((h, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/40 bg-muted/20">
                  <p className="text-sm font-semibold text-foreground">{h.dayName} às {h.hour}h</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Média de {h.avg.toFixed(1)} agendamentos/semana</p>
                  <p className="text-xs text-primary mt-2.5 font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Criar promoção para este horário
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </motion.div>
      )}

      {/* ── CHARTS: Services + Day of Week ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div {...fadeUp(10)}>
          <SectionCard>
            <SectionTitle icon={Target}>Serviços mais vendidos</SectionTitle>
            {loading ? (
              <Skeleton className="h-[240px] w-full rounded-xl" />
            ) : servicePieData.length === 0 ? (
              <EmptyState icon={Target} title="Sem dados de serviços" description="Cadastre serviços e agende atendimentos" />
            ) : (
              <div className="h-[240px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={servicePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" nameKey="name"
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
          </SectionCard>
        </motion.div>

        <motion.div {...fadeUp(11)}>
          <SectionCard>
            <SectionTitle icon={BarChart3}>Faturamento por dia da semana</SectionTitle>
            {loading ? (
              <Skeleton className="h-[240px] w-full rounded-xl" />
            ) : (
              <div className="h-[240px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekdayChartData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground) / 0.3)" tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground) / 0.3)" width={35} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [name === "revenue" ? `R$ ${v}` : v, name === "revenue" ? "Receita" : "Atendimentos"]} />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>
        </motion.div>
      </div>

      {/* Professional Performance */}
      {proPerfData.length > 0 && (
        <motion.div {...fadeUp(12)}>
          <SectionCard>
            <SectionTitle icon={Trophy} action={
              <span className="text-[11px] text-muted-foreground/50 font-medium">Últimos {period} dias</span>
            }>
              Ranking de profissionais
            </SectionTitle>
            <div className="h-[200px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={proPerfData} layout="vertical" margin={{ left: 0, right: 10, top: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground) / 0.3)" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground) / 0.3)" width={80} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [name === "revenue" ? `R$ ${v}` : v, name === "revenue" ? "Receita" : "Atendimentos"]} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} name="Atendimentos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </motion.div>
      )}

      <WeeklySchedule appointments={weeklyAppointments} onSlotClick={() => navigate("/dashboard/agenda")} />

      {/* Retention + Loyalty shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <motion.div {...fadeUp(13)}
          className="rounded-2xl border border-border/60 bg-card p-5 hover:border-border/80 hover:shadow-md transition-all duration-300 cursor-pointer group"
          onClick={() => navigate("/dashboard/retention")}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Retenção Inteligente</h3>
          </div>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">Análise preditiva de retorno de clientes baseada no histórico de visitas</p>
          <p className="text-xs text-primary mt-3 font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all">
            Ver análise <ArrowUpRight className="h-3 w-3" />
          </p>
        </motion.div>
        <motion.div {...fadeUp(14)}
          className="rounded-2xl border border-border/60 bg-card p-5 hover:border-border/80 hover:shadow-md transition-all duration-300 cursor-pointer group"
          onClick={() => navigate("/dashboard/loyalty")}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Programa de Fidelidade</h3>
          </div>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">Recompense clientes fiéis e incentive o retorno frequente</p>
          <p className="text-xs text-primary mt-3 font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all">
            Gerenciar <ArrowUpRight className="h-3 w-3" />
          </p>
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div {...fadeUp(15)}>
        <SectionCard>
          <SectionTitle icon={Zap}>Ações rápidas</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Novo agendamento", icon: Plus, bg: "bg-primary/10", color: "text-primary", action: () => navigate("/dashboard/agenda") },
              { label: "Cadastrar cliente", icon: Users, bg: "bg-blue-500/10", color: "text-blue-600 dark:text-blue-400", action: () => navigate("/dashboard/clients") },
              { label: "Adicionar serviço", icon: Target, bg: "bg-amber-500/10", color: "text-amber-600 dark:text-amber-400", action: () => navigate("/dashboard/services") },
              { label: "Compartilhar link", icon: ExternalLink, bg: "bg-muted/60", color: "text-muted-foreground", action: copyLink },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/25 hover:shadow-md active:scale-[0.97] transition-all duration-200 cursor-pointer group"
              >
                <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon className={`h-[18px] w-[18px] ${item.color}`} />
                </div>
                <span className="text-xs font-semibold text-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </SectionCard>
      </motion.div>
    </div>
  );
}
