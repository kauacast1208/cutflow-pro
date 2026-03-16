import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Receipt, Loader2, ArrowUpRight, ArrowDownRight,
  Calendar, Users, Target, BarChart3,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { UpgradeBanner } from "@/components/dashboard/UpgradePrompt";
import { format, subDays, startOfWeek, addDays, eachDayOfInterval } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay: i * 0.06 },
});

const periodOptions = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
] as const;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-md px-4 py-3 shadow-xl">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">{label}</p>
      <div className="space-y-1.5">
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.stroke || p.color }} />
              <span className="text-muted-foreground">{p.name}</span>
            </div>
            <span className="font-bold text-foreground tabular-nums">
              {p.name === "Receita" ? `R$ ${p.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm transition-all duration-300 hover:border-border/80 ${className}`}>
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

export default function FinancePage() {
  const { barbershop } = useBarbershop();
  const { can, plan } = usePlanPermissions();
  const [period, setPeriod] = useState(30);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prevAppointments, setPrevAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barbershop || !can("finance")) return;
    setLoading(true);
    const today = new Date();
    const periodStart = format(subDays(today, period), "yyyy-MM-dd");
    const prevPeriodStart = format(subDays(today, period * 2), "yyyy-MM-dd");

    Promise.all([
      supabase.from("appointments").select("*, services(name, price), professionals(name)")
        .eq("barbershop_id", barbershop.id).gte("date", periodStart),
      supabase.from("appointments").select("*, services(name, price), professionals(name)")
        .eq("barbershop_id", barbershop.id).gte("date", prevPeriodStart).lt("date", periodStart),
    ]).then(([curr, prev]) => {
      setAppointments(curr.data || []);
      setPrevAppointments(prev.data || []);
      setLoading(false);
    });
  }, [barbershop, can, period]);

  const completed = useMemo(() => appointments.filter(a => a.status !== "cancelled"), [appointments]);
  const prevCompleted = useMemo(() => prevAppointments.filter(a => a.status !== "cancelled"), [prevAppointments]);

  const proRevenue = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; count: number }> = {};
    completed.forEach(a => {
      const name = a.professionals?.name || "Sem profissional";
      if (!map[name]) map[name] = { name, revenue: 0, count: 0 };
      map[name].revenue += Number(a.price || 0);
      map[name].count++;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [completed]);

  const timeSeriesData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), Math.min(period, 30)),
      end: new Date(),
    });
    return days.map(d => {
      const dateStr = format(d, "yyyy-MM-dd");
      const dayAppts = completed.filter(a => a.date === dateStr);
      return {
        date: format(d, "dd/MM"),
        Receita: dayAppts.reduce((s, a) => s + Number(a.price || 0), 0),
        Atendimentos: dayAppts.length,
      };
    });
  }, [completed, period]);

  if (!can("finance")) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Financeiro</h2>
        <UpgradeBanner feature="finance" currentPlan={plan} />
      </div>
    );
  }

  const totalRevenue = completed.reduce((s, a) => s + Number(a.price || 0), 0);
  const prevRevenue = prevCompleted.reduce((s, a) => s + Number(a.price || 0), 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEndStr = format(addDays(ws, 6), "yyyy-MM-dd");
  const weekStartStr = format(ws, "yyyy-MM-dd");
  const monthStr = format(new Date(), "yyyy-MM");

  const todayRevenue = completed.filter(a => a.date === todayStr).reduce((s, a) => s + Number(a.price || 0), 0);
  const weekRevenue = completed.filter(a => a.date >= weekStartStr && a.date <= weekEndStr).reduce((s, a) => s + Number(a.price || 0), 0);
  const monthRevenue = completed.filter(a => a.date.startsWith(monthStr)).reduce((s, a) => s + Number(a.price || 0), 0);

  const ticket = completed.length > 0 ? totalRevenue / completed.length : 0;
  const totalAtendimentos = completed.length;

  const daysInPeriod = Math.min(period, Math.ceil((Date.now() - new Date(format(subDays(new Date(), period), "yyyy-MM-dd")).getTime()) / (1000 * 60 * 60 * 24)));
  const dailyAvg = daysInPeriod > 0 ? totalRevenue / daysInPeriod : 0;
  const monthProjection = dailyAvg * 30;

  const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  const cards = [
    { label: "Hoje", value: fmt(todayRevenue), icon: Calendar, change: null, positive: true },
    { label: "Semana", value: fmt(weekRevenue), icon: BarChart3, change: null, positive: true },
    { label: "Mês", value: fmt(monthRevenue), icon: DollarSign, change: null, positive: true },
    {
      label: `Período (${period}d)`,
      value: fmt(totalRevenue),
      icon: TrendingUp,
      change: prevRevenue > 0 ? `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}%` : null,
      positive: revenueChange >= 0,
    },
    { label: "Ticket médio", value: fmt(ticket), icon: Receipt, change: null, positive: true },
    { label: "Projeção mensal", value: fmt(monthProjection), icon: Target, change: null, positive: true },
  ];

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Financeiro
            </h2>
            <p className="text-sm text-muted-foreground/70">Desempenho financeiro da sua barbearia</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 rounded-xl border border-border/60 bg-muted/30 p-1">
          {periodOptions.map(opt => (
            <button key={opt.value} onClick={() => setPeriod(opt.value)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                period === opt.value
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.label} {...fadeUp(i + 1)}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-border/80 hover:shadow-md"
                >
                  {/* Hover accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{card.label}</p>
                    <div className="h-7 w-7 rounded-lg bg-primary/8 flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-primary/60" />
                    </div>
                  </div>
                  <p className="text-lg font-extrabold tracking-tight text-foreground leading-none tabular-nums" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {card.value}
                  </p>
                  {card.change && (
                    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold mt-2 px-1.5 py-0.5 rounded-md ${
                      card.positive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                    }`}>
                      {card.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {card.change}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* ── Revenue & Appointments Chart ── */}
          <motion.div {...fadeUp(7)}>
            <SectionCard>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Receita & Atendimentos
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-6 rounded-full bg-primary" />
                    <span className="text-[10px] text-muted-foreground/60 font-medium">Receita</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-6 rounded-full bg-violet-500/60" />
                    <span className="text-[10px] text-muted-foreground/60 font-medium">Atendimentos</span>
                  </div>
                </div>
              </div>
              <div className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData} margin={{ left: -10, right: 5, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="finRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="finAptGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-4, 270 60% 60%))" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="hsl(var(--chart-4, 270 60% 60%))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground) / 0.4)" }}
                      stroke="none"
                      interval="preserveStartEnd"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground) / 0.4)" }}
                      stroke="none"
                      width={45}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground) / 0.4)" }}
                      stroke="none"
                      width={30}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(var(--primary) / 0.15)", strokeWidth: 1 }} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="Receita"
                      name="Receita"
                      stroke="hsl(var(--primary))"
                      fill="url(#finRevGrad)"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                        fill: "hsl(var(--primary))",
                        stroke: "hsl(var(--card))",
                        strokeWidth: 3,
                      }}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="Atendimentos"
                      name="Atendimentos"
                      stroke="hsl(var(--chart-4, 270 60% 60%))"
                      fill="url(#finAptGrad)"
                      strokeWidth={1.5}
                      strokeDasharray="6 3"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: "hsl(var(--chart-4, 270 60% 60%))",
                        stroke: "hsl(var(--card))",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Summary strip */}
              <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-border/30">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground/50 font-medium mb-0.5">Total no período</p>
                  <p className="text-lg font-extrabold text-foreground tabular-nums" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {fmt(totalRevenue)}
                  </p>
                </div>
                <div className="w-px h-10 bg-border/30" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground/50 font-medium mb-0.5">Atendimentos</p>
                  <p className="text-lg font-extrabold text-foreground tabular-nums" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {totalAtendimentos}
                  </p>
                </div>
                <div className="w-px h-10 bg-border/30" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground/50 font-medium mb-0.5">Média diária</p>
                  <p className="text-lg font-extrabold text-foreground tabular-nums" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {fmt(dailyAvg)}
                  </p>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          {/* ── Professional Ranking ── */}
          <motion.div {...fadeUp(8)}>
            <SectionCard>
              <SectionTitle icon={Users} action={
                <span className="text-[11px] text-muted-foreground/50 font-medium">Últimos {period} dias</span>
              }>
                Ranking de profissionais
              </SectionTitle>

              {proRevenue.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                    <Users className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Nenhum dado disponível</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Agende atendimentos para ver o ranking</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {proRevenue.map((pro, i) => {
                    const pct = totalRevenue > 0 ? (pro.revenue / totalRevenue * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/30 transition-colors">
                        <span className="text-[11px] font-bold text-muted-foreground/50 w-5 shrink-0 tabular-nums">{i + 1}º</span>
                        <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                          {pro.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-foreground truncate">{pro.name}</span>
                            <span className="text-sm font-bold text-foreground shrink-0 ml-2 tabular-nums">{fmt(pro.revenue)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="h-full rounded-full bg-primary/70"
                              />
                            </div>
                            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 shrink-0 rounded-md font-semibold">
                              {pro.count} atend.
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* Commission placeholder */}
          <motion.div {...fadeUp(9)}>
            <div className="rounded-2xl border border-dashed border-border/40 bg-muted/10 p-8 text-center">
              <div className="h-12 w-12 rounded-xl bg-muted/40 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">Controle de comissões</h3>
              <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto leading-relaxed">
                O módulo de comissões por profissional está em desenvolvimento.
                Configure porcentagens por serviço e gere relatórios de pagamento.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
