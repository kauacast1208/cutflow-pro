import { motion } from "framer-motion";
import {
  TrendingDown, ArrowRight, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const costSteps = [
  { label: "3 no-shows por semana", value: "R$ 90/semana", sub: "Ticket médio de R$ 30" },
  { label: "12 faltas por mês", value: "R$ 360/mês", sub: "Receita que simplesmente desaparece" },
  { label: "144 clientes perdidos/ano", value: "R$ 4.320/ano", sub: "Sem contar indicações perdidas" },
];

export function NoShowCostSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--destructive)/0.04),transparent)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/[0.06] px-4 py-1.5 text-xs font-semibold text-destructive uppercase tracking-wider mb-5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Impacto financeiro real
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-[-0.025em] leading-tight mb-4">
            Quanto você perde por mês{" "}
            <br className="hidden sm:block" />
            <span className="text-destructive">com desorganização?</span>
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            A maioria dos barbeiros não percebe — mas faltas, agenda manual e falta de lembretes custam caro. Veja a conta:
          </p>
        </motion.div>

        {/* Cost breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-10">
          {costSteps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-2xl border border-destructive/15 bg-card/50 backdrop-blur-sm p-6 text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4 text-destructive/60" />
                <span className="text-xs font-semibold text-destructive/70 uppercase tracking-wider">
                  Passo {i + 1}
                </span>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{step.label}</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-destructive mb-1">{step.value}</p>
              <p className="text-[11px] text-muted-foreground/60">{step.sub}</p>

              {i < costSteps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Solution comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-5">
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">Prejuízo mensal estimado</p>
                <p className="text-3xl font-extrabold text-destructive">-R$ 360</p>
              </div>
              <div className="hidden sm:block text-muted-foreground/30 text-2xl font-light">vs</div>
              <div className="text-center sm:text-right">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Plano CutFlow Pro</p>
                <p className="text-3xl font-extrabold text-primary">R$ 79/mês</p>
              </div>
            </div>

            <div className="border-t border-border/40 pt-5">
              <div className="flex items-center justify-center gap-2.5 mb-4">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <p className="text-base sm:text-lg font-bold text-foreground">
                  O sistema se paga com <span className="text-primary">1 cliente recuperado.</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground mb-6">
                {[
                  "Lembretes automáticos via WhatsApp",
                  "Confirmação de presença",
                  "Agenda online 24h",
                  "Zero caderno, zero esquecimento",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-primary/50" />
                    {item}
                  </span>
                ))}
              </div>

              <div className="text-center">
                <Link to="/signup">
                  <Button size="lg" className="rounded-xl h-12 px-8 font-bold text-sm gap-2">
                    Começar teste grátis — 7 dias
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-[11px] text-muted-foreground/50 mt-3">
                  Sem cartão · Sem compromisso · Cancele quando quiser
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
