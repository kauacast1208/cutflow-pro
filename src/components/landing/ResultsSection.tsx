import { motion } from "framer-motion";
import { TrendingDown, LayoutDashboard, Gauge, Clock } from "lucide-react";

const metrics = [
  { icon: TrendingDown, value: "+37%", label: "menos faltas", color: "text-emerald-500" },
  { icon: LayoutDashboard, value: "+52%", label: "mais organização", color: "text-blue-500" },
  { icon: Gauge, value: "+28%", label: "mais controle", color: "text-amber-500" },
  { icon: Clock, value: "3h", label: "economizadas / semana", color: "text-primary" },
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{m.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
