import { motion } from "framer-motion";
import { TrendingDown, LayoutDashboard, Gauge, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const metrics = [
  { icon: TrendingDown, value: "37%", label: "menos faltas", sublabel: "com lembretes automáticos", color: "text-primary" },
  { icon: LayoutDashboard, value: "52%", label: "mais organização", sublabel: "na gestão da agenda", color: "text-primary" },
  { icon: Gauge, value: "28%", label: "mais controle", sublabel: "sobre o financeiro", color: "text-primary" },
  { icon: Clock, value: "3h", label: "economizadas / semana", sublabel: "em tarefas manuais", color: "text-primary" },
];

const professionals = [
  { name: "Carlos", appointments: 72, revenue: "R$ 7.2k" },
  { name: "Rafael", appointments: 58, revenue: "R$ 5.8k" },
  { name: "André", appointments: 55, revenue: "R$ 5.5k" },
];

export function ResultsSection() {
  return (
    <section className="py-14 sm:py-20 bg-muted/30 border-y border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4">
            Resultados reais
          </span>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Resultados que o CutFlow ajuda a destravar
          </h3>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 text-center shadow-card hover:shadow-card-hover transition-all card-lift"
            >
              <m.icon className={`h-5 w-5 mx-auto mb-3 ${m.color}`} />
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">+{m.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{m.label}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{m.sublabel}</p>
            </motion.div>
          ))}
        </div>

        {/* Professional ranking with real numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-card max-w-2xl mx-auto"
        >
          <p className="text-sm font-semibold text-foreground mb-4 text-center">Ranking semanal — Profissionais</p>
          <div className="space-y-3">
            {professionals.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}º</span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {p.name[0]}
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{p.name}</span>
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5">{p.appointments} atendimentos</Badge>
                <span className="text-sm font-bold text-primary">{p.revenue}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="text-lg font-extrabold text-foreground">R$ 4.820</p>
              <p className="text-[10px] text-muted-foreground">Receita semanal</p>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="text-center">
              <p className="text-lg font-extrabold text-foreground">87</p>
              <p className="text-[10px] text-muted-foreground">Atendimentos</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
