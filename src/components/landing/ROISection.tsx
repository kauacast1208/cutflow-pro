import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, TrendingUp, ArrowRight, CheckCircle2, Calculator, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PLAN_PRICE = 79;

export function ROISection() {
  const [weeklyNoShows, setWeeklyNoShows] = useState(3);
  const [ticketMedio, setTicketMedio] = useState(30);

  const calc = useMemo(() => {
    const monthlyNoShows = weeklyNoShows * 4;
    const monthlyLoss = monthlyNoShows * ticketMedio;
    const savings = monthlyLoss - PLAN_PRICE;
    const roi = monthlyLoss > 0 ? Math.round(((monthlyLoss - PLAN_PRICE) / PLAN_PRICE) * 100) : 0;
    return { monthlyNoShows, monthlyLoss, savings, roi };
  }, [weeklyNoShows, ticketMedio]);

  const isPositiveROI = calc.savings > 0;

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06),transparent_70%)]" />
      </div>

      <div className="container-tight relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-xs text-primary font-medium mb-4">
            <Calculator className="h-3.5 w-3.5" />
            Calculadora de ROI
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight mb-3">
            O CutFlow se paga sozinho.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Calcule quanto você perde com faltas e veja como o sistema se paga no primeiro mês.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card relative overflow-hidden">
            {/* Subtle top accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="space-y-8">
              {/* Weekly no-shows */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Faltas por semana</label>
                    <p className="text-xs text-muted-foreground mt-0.5">Quantos clientes faltam por semana?</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted rounded-lg px-3 py-1.5">
                    <span className="text-lg font-bold text-foreground tabular-nums">{weeklyNoShows}</span>
                    <span className="text-xs text-muted-foreground">/sem</span>
                  </div>
                </div>
                <Slider
                  value={[weeklyNoShows]}
                  onValueChange={([v]) => setWeeklyNoShows(v)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground/50 px-1">
                  <span>1</span><span>5</span><span>10</span>
                </div>
              </div>

              {/* Average ticket */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-semibold text-foreground">Ticket médio</label>
                    <p className="text-xs text-muted-foreground mt-0.5">Valor médio de cada atendimento</p>
                  </div>
                  <div className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1.5">
                    <span className="text-xs text-muted-foreground">R$</span>
                    <span className="text-lg font-bold text-foreground tabular-nums">{ticketMedio}</span>
                  </div>
                </div>
                <Slider
                  value={[ticketMedio]}
                  onValueChange={([v]) => setTicketMedio(v)}
                  min={15}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground/50 px-1">
                  <span>R$15</span><span>R$100</span><span>R$200</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Results */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
                {/* Monthly loss */}
                <div className="rounded-xl bg-destructive/[0.06] border border-destructive/10 p-4 text-center">
                  <div className="inline-flex items-center gap-1.5 mb-2">
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-[10px] font-semibold text-destructive uppercase tracking-wider">Prejuízo mensal</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    {calc.monthlyNoShows} faltas × R${ticketMedio}
                  </p>
                  <motion.p
                    key={calc.monthlyLoss}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="text-2xl sm:text-3xl font-extrabold text-destructive tabular-nums"
                  >
                    -R${calc.monthlyLoss}
                  </motion.p>
                </div>

                {/* Arrow */}
                <div className="hidden sm:flex flex-col items-center justify-center gap-1">
                  <ArrowRight className="h-5 w-5 text-muted-foreground/30" />
                  <span className="text-[9px] text-muted-foreground/30 uppercase tracking-widest font-medium">vs</span>
                </div>

                {/* CutFlow price */}
                <div className="rounded-xl bg-primary/[0.06] border border-primary/10 p-4 text-center">
                  <div className="inline-flex items-center gap-1.5 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Plano Pro</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">Investimento mensal</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-primary tabular-nums">R${PLAN_PRICE}</p>
                </div>
              </div>

              {/* Savings result */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPositiveROI ? "positive" : "neutral"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`rounded-xl p-5 text-center ${
                    isPositiveROI
                      ? "bg-primary/[0.06] border border-primary/15"
                      : "bg-muted/50 border border-border"
                  }`}
                >
                  {isPositiveROI ? (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        <p className="text-base sm:text-lg font-bold text-foreground">
                          Economia de R${calc.savings}/mês
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ROI de {calc.roi}% — o sistema se paga e ainda sobra.
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Calculator className="h-5 w-5 text-muted-foreground shrink-0" />
                      <p className="text-sm font-medium text-muted-foreground">
                        Ajuste os valores — na maioria dos casos o CutFlow já se paga.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* CTA */}
              {isPositiveROI && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <Link to="/signup">
                    <Button size="lg" className="h-12 px-8 rounded-xl text-sm font-semibold gap-2 shadow-glow btn-glow">
                      <Sparkles className="h-4 w-4" />
                      Começar teste grátis
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <p className="text-[11px] text-muted-foreground/50 mt-3">
                    15 dias grátis • Sem cartão • Cancele quando quiser
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Social proof below calculator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-xs text-muted-foreground/50"
        >
          Barbearias em crescimento usam CutFlow para transformar agenda em receita previsível.
        </motion.div>
      </div>
    </section>
  );
}
