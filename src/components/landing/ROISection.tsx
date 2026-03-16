import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";

export function ROISection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--primary)/0.04),transparent)] pointer-events-none" />

      <div className="container-tight relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            O CutFlow se paga sozinho.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Se você perder apenas 2 clientes por mês por falta de organização, já perde mais que o valor do sistema.
          </p>
        </motion.div>

        {/* Comparison card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Loss */}
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 mb-3">
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-[11px] font-semibold text-destructive uppercase tracking-wider">Prejuízo</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">2 clientes perdidos/mês</p>
                <p className="text-3xl font-bold text-destructive">-R$120</p>
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex justify-center">
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider font-medium">vs</span>
                </div>
              </div>

              {/* Investment */}
              <div className="text-center sm:text-right">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 mb-3">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Investimento</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Plano Pro completo</p>
                <p className="text-3xl font-bold text-primary">R$79</p>
              </div>
            </div>

            {/* Result */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <p className="text-sm sm:text-base font-semibold text-foreground">
                  Você já economiza dinheiro no primeiro mês.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
