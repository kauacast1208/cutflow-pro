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

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.07 },
});

const periodOptions = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
] as const;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-2.5 shadow-lg backdrop-blur-sm">
      <p className="text-[10px] font-medium text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke || p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {p.name === "Receita" ? `R$ ${p.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function FinancePage() {
  const { barbershop } = useBarbershop();
  const { can, plan } = usePlanPermissions();
  const [period, setPeriod] = useState(30);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prevAppointments, setPrevAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barbershop || !can("finance")) return;
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
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Financeiro
            </h2>
            <p className="text-sm text-muted-foreground">Desempenho financeiro da sua barbearia</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
          {periodOptions.map(opt => (
            <button key={opt.value} onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                period === opt.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.label} {...fadeUp(i + 1)}
                  className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-4 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-medium text-muted-foreground">{card.label}</p>
                    <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {card.value}
                  </p>
                  {card.change && (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-medium mt-1 ${card.positive ? "text-primary" : "text-destructive"}`}>
                      {card.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {card.change}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Dual-axis Stripe-style area chart */}
          <motion.div {...fadeUp(7)} className="rounded-2xl border border-border/80 bg-card p-4 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Receita & Atendimentos
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-4 rounded-full bg-primary" />
                  <span className="text-[10px] text-muted-foreground">Receita</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-4 rounded-full bg-purple-500/60" />
                  <span className="text-[10px] text-muted-foreground">Atendimentos</span>
                </div>
              </div>
            </div>
            <div className="h-56 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="finRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="finAptGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={45} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="Receita"
                    name="Receita"
                    stroke="hsl(var(--primary))"
                    fill="url(#finRevGrad)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="Atendimentos"
                    name="Atendimentos"
                    stroke="#a855f7"
                    fill="url(#finAptGrad)"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={false}
                    activeDot={{ r: 4, fill: "#a855f7", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Revenue by professional — with real appointment counts */}
          <motion.div {...fadeUp(8)} className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Users className="h-4 w-4 text-primary" />
                Ranking de profissionais
              </h3>
              <span className="text-xs text-muted-foreground">Últimos {period} dias</span>
            </div>

            {proRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível.</p>
            ) : (
              <div className="space-y-3">
                {proRevenue.map((pro, i) => {
                  const pct = totalRevenue > 0 ? (pro.revenue / totalRevenue * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">{i + 1}º</span>
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {pro.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground truncate">{pro.name}</span>
                          <span className="text-sm font-bold text-foreground shrink-0 ml-2">{fmt(pro.revenue)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 shrink-0">
                            {pro.count} atendimentos
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary */}
            {proRevenue.length > 0 && (
              <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-border/50">
                <div className="text-center">
                  <p className="text-lg font-extrabold text-foreground">{fmt(totalRevenue)}</p>
                  <p className="text-[10px] text-muted-foreground">Receita total</p>
                </div>
                <div className="w-px h-8 bg-border/50" />
                <div className="text-center">
                  <p className="text-lg font-extrabold text-foreground">{totalAtendimentos}</p>
                  <p className="text-[10px] text-muted-foreground">Atendimentos</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Commission placeholder */}
          <motion.div {...fadeUp(9)} className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <DollarSign className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">Controle de comissões</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              O módulo de comissões por profissional está em desenvolvimento.
              Configure porcentagens por serviço e gere relatórios de pagamento.
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}
