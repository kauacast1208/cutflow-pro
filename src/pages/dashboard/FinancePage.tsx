import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Receipt, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { UpgradeBanner } from "@/components/dashboard/UpgradePrompt";

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.07 },
});

export default function FinancePage() {
  const { barbershop } = useBarbershop();
  const { can, plan } = usePlanPermissions();
  const [monthTotal, setMonthTotal] = useState(0);
  const [prevMonthTotal, setPrevMonthTotal] = useState(0);
  const [apptCount, setApptCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barbershop || !can("finance")) return;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const startOfMonth = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const endOfMonth = `${y}-${String(m + 1).padStart(2, "0")}-31`;

    const pm = m === 0 ? 11 : m - 1;
    const py = m === 0 ? y - 1 : y;
    const prevStart = `${py}-${String(pm + 1).padStart(2, "0")}-01`;
    const prevEnd = `${py}-${String(pm + 1).padStart(2, "0")}-31`;

    Promise.all([
      supabase
        .from("appointments")
        .select("price")
        .eq("barbershop_id", barbershop.id)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth)
        .not("status", "eq", "cancelled"),
      supabase
        .from("appointments")
        .select("price")
        .eq("barbershop_id", barbershop.id)
        .gte("date", prevStart)
        .lte("date", prevEnd)
        .not("status", "eq", "cancelled"),
    ]).then(([curr, prev]) => {
      const total = (curr.data || []).reduce((s, a) => s + Number(a.price || 0), 0);
      const prevTotal = (prev.data || []).reduce((s, a) => s + Number(a.price || 0), 0);
      setMonthTotal(total);
      setPrevMonthTotal(prevTotal);
      setApptCount(curr.data?.length || 0);
      setLoading(false);
    });
  }, [barbershop, can]);

  if (!can("finance")) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Financeiro
        </h2>
        <UpgradeBanner feature="finance" currentPlan={plan} />
      </div>
    );
  }

  const ticket = apptCount > 0 ? monthTotal / apptCount : 0;
  const revenueChange = prevMonthTotal > 0 ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;
  const isPositive = revenueChange >= 0;

  const cards = [
    {
      label: "Faturamento do mês",
      value: `R$ ${monthTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: prevMonthTotal > 0 ? `${isPositive ? "+" : ""}${revenueChange.toFixed(1)}%` : null,
      positive: isPositive,
    },
    {
      label: "Ticket médio",
      value: `R$ ${ticket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      change: null,
      positive: true,
    },
    {
      label: "Atendimentos",
      value: String(apptCount),
      icon: Receipt,
      change: null,
      positive: true,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)}>
        <h2
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Financeiro
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe o desempenho financeiro da sua barbearia.</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  {...fadeUp(i + 1)}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[13px] font-medium text-muted-foreground">{card.label}</p>
                      <div className="h-10 w-10 rounded-xl bg-accent/60 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-accent-foreground" />
                      </div>
                    </div>
                    <p
                      className="text-2xl font-bold tracking-tight text-foreground"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {card.value}
                    </p>
                    {card.change && (
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-medium mt-2 ${
                          card.positive ? "text-primary" : "text-destructive"
                        }`}
                      >
                        {card.positive ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {card.change} vs mês anterior
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            {...fadeUp(4)}
            className="rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-shadow duration-300"
          >
            <h3
              className="text-base font-semibold text-foreground mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Evolução mensal
            </h3>
            <div className="h-64 flex items-center justify-center rounded-xl bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground">
                Os dados do gráfico serão populados conforme agendamentos forem realizados.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
