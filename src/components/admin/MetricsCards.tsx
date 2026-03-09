import { motion } from "framer-motion";
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";

interface MetricCard {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ElementType;
}

interface MetricsCardsProps {
  metrics?: MetricCard[];
}

const defaultMetrics: MetricCard[] = [
  { label: "Agendamentos hoje", value: "0", change: "+0%", changeType: "neutral", icon: Calendar },
  { label: "Clientes ativos", value: "0", change: "+0%", changeType: "neutral", icon: Users },
  { label: "Receita do mês", value: "R$ 0", change: "+0%", changeType: "neutral", icon: DollarSign },
  { label: "Taxa de retorno", value: "0%", change: "+0%", changeType: "neutral", icon: TrendingUp },
];

export default function MetricsCards({ metrics = defaultMetrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, i) => {
        const Icon = metric.icon;
        const isPositive = metric.changeType === "positive";
        const isNegative = metric.changeType === "negative";

        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow duration-300"
          >
            {/* Subtle gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="relative flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-muted-foreground">{metric.label}</p>
                <p
                  className="text-2xl font-bold tracking-tight text-foreground"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {metric.value}
                </p>
                {metric.change && (
                  <span
                    className={`inline-flex items-center text-xs font-medium ${
                      isPositive
                        ? "text-primary"
                        : isNegative
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {metric.change} vs mês anterior
                  </span>
                )}
              </div>
              <div className="h-10 w-10 rounded-xl bg-accent/60 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
