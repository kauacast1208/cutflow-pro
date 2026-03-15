import { useState, useEffect, useMemo } from "react";
import { useFranchise } from "@/hooks/useFranchise";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, TrendingUp, Building2, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
    const map: Record<string, number> = {};
    appointments.forEach(a => {
      map[a.barbershop_id] = (map[a.barbershop_id] || 0) + Number(a.price || 0);
    });
    return units.map(u => ({
      name: u.name.length > 15 ? u.name.slice(0, 15) + "…" : u.name,
      Faturamento: map[u.id] || 0,
    })).sort((a, b) => b.Faturamento - a.Faturamento);
  }, [appointments, units]);

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
        </motion.div>
        <motion.div {...fadeUp(2)} className="rounded-2xl border border-border/80 bg-card p-5">
          <p className="text-sm text-muted-foreground">Ticket médio</p>
          <p className="text-2xl font-bold text-foreground mt-1">
            R$ {ticket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </motion.div>
      </div>

      {isConsolidatedView && unitRevenue.length > 1 && (
        <motion.div {...fadeUp(3)} className="rounded-2xl border border-border/80 bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Faturamento por unidade</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unitRevenue} barSize={32}>
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
    </div>
  );
}
