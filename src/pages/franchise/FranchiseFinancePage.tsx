import { useState, useEffect, useMemo } from "react";
import { useFranchise } from "@/hooks/useFranchise";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { Badge } from "@/components/ui/badge";
import { eachDayOfInterval, parseISO } from "date-fns";

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.06 },
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-2.5 shadow-lg backdrop-blur-sm">
      <p className="text-[10px] font-medium text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.stroke || p.fill || p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {p.name === "Faturamento" ? `R$ ${p.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function FranchiseFinancePage() {
  const { units, selectedUnit, isConsolidatedView } = useFranchise();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prevAppointments, setPrevAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const activeUnits = selectedUnit ? [selectedUnit] : units;

  useEffect(() => {
    if (activeUnits.length === 0) {
      setAppointments([]);
      setPrevAppointments([]);
      setLoading(false);
      return;
    }

    const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
    const prev = subMonths(new Date(), 1);
    const prevStart = format(startOfMonth(prev), "yyyy-MM-dd");
    const prevEnd = format(endOfMonth(prev), "yyyy-MM-dd");
    const ids = activeUnits.map(u => u.id);

    Promise.all([
      supabase.from("appointments").select("id, price, status, date, barbershop_id")
        .in("barbershop_id", ids).gte("date", monthStart).lte("date", monthEnd).not("status", "eq", "cancelled"),
      supabase.from("appointments").select("id, price, status, date, barbershop_id")
        .in("barbershop_id", ids).gte("date", prevStart).lte("date", prevEnd).not("status", "eq", "cancelled"),
    ]).then(([curr, prev]) => {
      setAppointments(curr.data || []);
      setPrevAppointments(prev.data || []);
      setLoading(false);
    });
  }, [activeUnits]);

  const revenue = useMemo(() => appointments.reduce((s, a) => s + Number(a.price || 0), 0), [appointments]);
  const prevRevenue = useMemo(() => prevAppointments.reduce((s, a) => s + Number(a.price || 0), 0), [prevAppointments]);
  const change = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(1) : null;
  const ticket = appointments.length > 0 ? revenue / appointments.length : 0;

  const unitRevenue = useMemo(() => {
    const map: Record<string, { revenue: number; count: number }> = {};
    appointments.forEach(a => {
      if (!map[a.barbershop_id]) map[a.barbershop_id] = { revenue: 0, count: 0 };
      map[a.barbershop_id].revenue += Number(a.price || 0);
      map[a.barbershop_id].count++;
    });
    return units.map(u => ({
      name: u.name.length > 15 ? u.name.slice(0, 15) + "…" : u.name,
      Faturamento: map[u.id]?.revenue || 0,
      Atendimentos: map[u.id]?.count || 0,
    })).sort((a, b) => b.Faturamento - a.Faturamento);
  }, [appointments, units]);

  // Daily time series for area chart
  const dailyData = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = new Date() > endOfMonth(new Date()) ? endOfMonth(new Date()) : new Date();
    const days = eachDayOfInterval({ start, end });
    return days.map(d => {
      const dateStr = format(d, "yyyy-MM-dd");
      const dayAppts = appointments.filter(a => a.date === dateStr);
      return {
        date: format(d, "dd/MM"),
        Faturamento: dayAppts.reduce((s, a) => s + Number(a.price || 0), 0),
        Atendimentos: dayAppts.length,
      };
    });
  }, [appointments]);

  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Financeiro
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{currentMonth}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div {...fadeUp(0)} className="rounded-2xl border border-border/80 bg-card p-5">
          <p className="text-sm text-muted-foreground">Faturamento total</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            R$ {revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          {change && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium mt-1 ${Number(change) >= 0 ? "text-primary" : "text-destructive"}`}>
              {Number(change) >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {change}% vs mês anterior
            </span>
          )}
        </motion.div>
        <motion.div {...fadeUp(1)} className="rounded-2xl border border-border/80 bg-card p-5">
          <p className="text-sm text-muted-foreground">Atendimentos</p>
          <p className="text-2xl font-bold text-foreground mt-1">{appointments.length}</p>
          <Badge variant="secondary" className="text-[10px] mt-1">{appointments.length} atendimentos</Badge>
        </motion.div>
        <motion.div {...fadeUp(2)} className="rounded-2xl border border-border/80 bg-card p-5">
          <p className="text-sm text-muted-foreground">Ticket médio</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            R$ {ticket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </motion.div>
      </div>

      {/* Stripe-style area chart */}
      <motion.div {...fadeUp(3)} className="rounded-2xl border border-border/80 bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Evolução diária</h3>
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
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ left: -10, right: 5, top: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="frnRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="frnAptGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={45} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="Faturamento" name="Faturamento" stroke="hsl(var(--primary))" fill="url(#frnRevGrad)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }} />
              <Area yAxisId="right" type="monotone" dataKey="Atendimentos" name="Atendimentos" stroke="#a855f7" fill="url(#frnAptGrad)" strokeWidth={2} strokeDasharray="4 2" dot={false} activeDot={{ r: 4, fill: "#a855f7", stroke: "hsl(var(--background))", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Unit comparison bar chart */}
      {isConsolidatedView && unitRevenue.length > 1 && (
        <motion.div {...fadeUp(4)} className="rounded-2xl border border-border/80 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Faturamento por unidade</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitRevenue} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Faturamento" name="Faturamento" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Unit ranking with appointment counts */}
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
            {unitRevenue.map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}º</span>
                <span className="text-sm font-medium text-foreground flex-1 truncate">{u.name}</span>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{u.Atendimentos} atendimentos</Badge>
                <span className="text-sm font-bold text-primary">R$ {u.Faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
