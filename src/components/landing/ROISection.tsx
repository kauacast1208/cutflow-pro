import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, ArrowRight, CheckCircle2, Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const PLAN_PRICE = 79;

export function ROISection() {
  const [ticketMedio, setTicketMedio] = useState(60);
  const [clientesPerdidos, setClientesPerdidos] = useState(2);

  const calc = useMemo(() => {
    const loss = ticketMedio * clientesPerdidos;
    const savings = loss - PLAN_PRICE;
    return { loss, savings };
  }, [ticketMedio, clientesPerdidos]);

  return (
    <section className="section-padding bg-background relative overflow-hidden">
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

        {/* Interactive ROI Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Calculadora de ROI</p>
                <p className="text-[11px] text-muted-foreground">Ajuste os valores e veja sua economia</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Ticket médio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Ticket médio por cliente</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">R$</span>
                    <Input
                      type="number"
                      min={20}
                      max={300}
                      value={ticketMedio}
                      onChange={(e) => setTicketMedio(Math.max(1, Number(e.target.value)))}
                      className="w-20 h-8 text-center text-sm font-semibold"
                    />
                  </div>
                </div>
                <Slider
                  value={[ticketMedio]}
                  onValueChange={([v]) => setTicketMedio(v)}
                  min={20}
                  max={300}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Clientes perdidos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Clientes perdidos por mês</label>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={clientesPerdidos}
                      onChange={(e) => setClientesPerdidos(Math.max(1, Number(e.target.value)))}
                      className="w-16 h-8 text-center text-sm font-semibold"
                    />
                  </div>
                </div>
                <Slider
                  value={[clientesPerdidos]}
                  onValueChange={([v]) => setClientesPerdidos(v)}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Results */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                {/* Loss */}
                <div className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 mb-2">
                    <TrendingDown className="h-3 w-3 text-destructive" />
                    <span className="text-[10px] font-semibold text-destructive uppercase tracking-wider">Prejuízo</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">{clientesPerdidos} clientes × R${ticketMedio}</p>
                  <p className="text-2xl font-bold text-destructive">-R${calc.loss}</p>
                </div>

                {/* Arrow */}
                <div className="hidden sm:flex justify-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                    <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider font-medium">vs</span>
                  </div>
                </div>

                {/* Investment */}
                <div className="text-center sm:text-right">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 mb-2">
                    <TrendingUp className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Plano Pro</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">Investimento mensal</p>
                  <p className="text-2xl font-bold text-primary">R${PLAN_PRICE}</p>
                </div>
              </div>

              {/* Savings result */}
              <motion.div
                key={calc.savings}
                initial={{ scale: 0.97, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`mt-5 rounded-xl p-4 text-center ${
                  calc.savings > 0
                    ? "bg-primary/5 border border-primary/10"
                    : "bg-muted border border-border"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className={`h-5 w-5 shrink-0 ${calc.savings > 0 ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    {calc.savings > 0
                      ? `Você economiza R$${calc.savings}/mês com o CutFlow.`
                      : "Ajuste os valores — na maioria dos casos o CutFlow já se paga."
                    }
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
