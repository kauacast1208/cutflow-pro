import { useState, useEffect, useMemo } from "react";
import { useFranchise } from "@/hooks/useFranchise";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Building2, Calendar, DollarSign, Users, TrendingUp, Trophy,
  ArrowUpRight, ArrowDownRight, BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

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

interface UnitStats {
  unitId: string;
  unitName: string;
  appointments: number;
  revenue: number;
  clients: number;
  professionals: number;
}

export default function FranchiseDashboard() {
  const { units, selectedUnit, isConsolidatedView, group } = useFranchise();
  const [unitStats, setUnitStats] = useState<UnitStats[]>([]);
  const [loading, setLoading] = useState(true);

  const activeUnits = useMemo(() => {
    if (selectedUnit) return [selectedUnit];
    return units;
  }, [selectedUnit, units]);

  useEffect(() => {
    if (activeUnits.length === 0) {
      setUnitStats([]);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
      const today = format(new Date(), "yyyy-MM-dd");

      const stats: UnitStats[] = [];

      for (const unit of activeUnits) {
        const [apptRes, clientRes, proRes] = await Promise.all([
          supabase
            .from("appointments")
            .select("id, price, status")
            .eq("barbershop_id", unit.id)
            .gte("date", monthStart)
            .lte("date", monthEnd)
            .not("status", "eq", "cancelled"),
          supabase
            .from("clients")
            .select("id", { count: "exact", head: true })
            .eq("barbershop_id", unit.id),
          supabase
            .from("professionals")
            .select("id", { count: "exact", head: true })
            .eq("barbershop_id", unit.id)
            .eq("is_active", true),
        ]);

        const appts = apptRes.data || [];
        stats.push({
          unitId: unit.id,
          unitName: unit.name,
          appointments: appts.length,
          revenue: appts.reduce((s, a) => s + Number(a.price || 0), 0),
          clients: clientRes.count || 0,
          professionals: proRes.count || 0,
        });
      }

      setUnitStats(stats);
      setLoading(false);
    };

    fetchStats();
  }, [activeUnits]);

  const totals = useMemo(() => ({
    appointments: unitStats.reduce((s, u) => s + u.appointments, 0),
    revenue: unitStats.reduce((s, u) => s + u.revenue, 0),
    clients: unitStats.reduce((s, u) => s + u.clients, 0),
    professionals: unitStats.reduce((s, u) => s + u.professionals, 0),
    units: unitStats.length,
  }), [unitStats]);

  const topUnit = useMemo(() => {
    if (unitStats.length === 0) return null;
    return [...unitStats].sort((a, b) => b.revenue - a.revenue)[0];
  }, [unitStats]);

  const chartData = useMemo(() =>
    unitStats.map(u => ({
      name: u.unitName.length > 15 ? u.unitName.slice(0, 15) + "…" : u.unitName,
      Faturamento: u.revenue,
      Atendimentos: u.appointments,
    })),
  [unitStats]);

  const MetricCard = ({ label, value, icon: Icon, sub, idx }: {
    label: string; value: string; icon: React.ElementType; sub?: string; idx: number;
  }) => (
    <motion.div {...fadeUp(idx)}
      className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
        </div>
        <div className="h-10 w-10 rounded-xl bg-accent/60 flex items-center justify-center shrink-0 ml-2">
          <Icon className="h-5 w-5 text-accent-foreground" />
        </div>
      </div>
    </motion.div>
  );

  const currentMonth = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {isConsolidatedView ? "Visão Consolidada" : selectedUnit?.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isConsolidatedView
            ? `${units.length} unidade${units.length !== 1 ? "s" : ""} • ${currentMonth}`
            : currentMonth
          }
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard idx={0} label="Unidades" value={String(totals.units)} icon={Building2} />
        <MetricCard idx={1} label="Atendimentos" value={String(totals.appointments)} icon={Calendar} sub="Este mês" />
        <MetricCard idx={2} label="Faturamento" value={`R$ ${totals.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} icon={DollarSign} sub="Este mês" />
        <MetricCard idx={3} label="Clientes" value={String(totals.clients)} icon={Users} sub="Total cadastrados" />
        <MetricCard idx={4} label="Profissionais" value={String(totals.professionals)} icon={Users} sub="Ativos" />
      </div>

      {/* Top performing unit */}
      {isConsolidatedView && topUnit && unitStats.length > 1 && (
        <motion.div {...fadeUp(5)}
          className="rounded-2xl border border-border/80 bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unidade com maior faturamento</p>
              <p className="text-lg font-bold text-foreground">{topUnit.unitName}</p>
              <p className="text-xs text-muted-foreground">
                R$ {topUnit.revenue.toLocaleString("pt-BR")} • {topUnit.appointments} atendimentos
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chart: Revenue per unit */}
      {isConsolidatedView && chartData.length > 1 && (
        <motion.div {...fadeUp(6)}
          className="rounded-2xl border border-border/80 bg-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Faturamento por unidade</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="Faturamento" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Unit cards list */}
      {isConsolidatedView && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Desempenho por unidade</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unitStats.map((u, i) => (
              <motion.div key={u.unitId} {...fadeUp(i + 7)}
                className="rounded-2xl border border-border/80 bg-card p-4 hover:shadow-card-hover transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-bold text-foreground truncate">{u.unitName}</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Atendimentos</p>
                    <p className="text-sm font-semibold text-foreground">{u.appointments}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Faturamento</p>
                    <p className="text-sm font-semibold text-foreground">R$ {u.revenue.toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clientes</p>
                    <p className="text-sm font-semibold text-foreground">{u.clients}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Profissionais</p>
                    <p className="text-sm font-semibold text-foreground">{u.professionals}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {loading && unitStats.length === 0 && (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          Carregando métricas...
        </div>
      )}
    </div>
  );
}
