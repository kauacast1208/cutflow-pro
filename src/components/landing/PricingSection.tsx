import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, CheckCircle2, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PlanRow {
  id: string;
  slug: string;
  label: string;
  price: number;
  max_professionals: number;
  features: string[];
}

const planHighlights: Record<string, string[]> = {
  starter: [
    "1 profissional",
    "Agenda online",
    "Gestão de clientes",
    "Histórico de atendimentos",
    "Relatórios básicos",
    "Página pública de agendamento",
  ],
  pro: [
    "Até 5 profissionais",
    "Tudo do Starter",
    "Controle financeiro",
    "Campanhas simples",
    "Mala direta para clientes",
    "Relatórios avançados",
    "Métricas de faturamento",
  ],
  premium: [
    "Profissionais ilimitados",
    "Tudo do Pro",
    "Campanhas completas",
    "Automações de marketing",
    "Integrações e API",
    "Suporte prioritário",
    "Relatórios estratégicos",
  ],
};

const planDescriptions: Record<string, string> = {
  starter: "Ideal para barbeiros autônomos que querem organizar a agenda e reduzir faltas.",
  pro: "Perfeito para barbearias em crescimento que precisam de mais controle e profissionalismo.",
  premium: "Para operações profissionais que precisam de gestão completa e escala.",
};

const planLabels: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  premium: "Business",
};

const originalPrices: Record<string, number> = {
  starter: 59,
  pro: 97,
  premium: 147,
};

const promoPrices: Record<string, number> = {
  starter: 29,
  pro: 49,
  premium: 79,
};

const fallbackPlans: PlanRow[] = [
  { id: "1", slug: "starter", label: "Starter", price: 29, max_professionals: 1, features: [] },
  { id: "2", slug: "pro", label: "Pro", price: 49, max_professionals: 5, features: [] },
  { id: "3", slug: "premium", label: "Business", price: 79, max_professionals: 999, features: [] },
];

export function PricingSection() {
  const [plans, setPlans] = useState<PlanRow[]>(fallbackPlans);

  useEffect(() => {
    supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPlans(
            data.map((p) => ({
              id: p.id,
              slug: p.slug,
              label: p.label,
              price: p.price,
              max_professionals: p.max_professionals,
              features: p.features || [],
            }))
          );
        }
      });
  }, []);

  return (
    <section id="pricing" className="section-padding bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            <Zap className="h-3.5 w-3.5" />
            Preço de lançamento
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl font-extrabold tracking-[-0.025em] mb-3 sm:mb-4"
          >
            Hoje por apenas uma fração do valor
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-muted-foreground text-[15px] sm:text-lg max-w-lg mx-auto"
          >
            Aproveite o preço especial de lançamento. Sem fidelidade, sem taxa escondida.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => {
            const isPopular = plan.slug === "pro";
            const highlights = planHighlights[plan.slug] || [];
            const desc = planDescriptions[plan.slug] || "";
            const displayLabel = planLabels[plan.slug] || plan.label;
            const original = originalPrices[plan.slug] || plan.price * 2;
            const promo = promoPrices[plan.slug] || plan.price;
            const discount = Math.round(((original - promo) / original) * 100);

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border flex flex-col relative transition-all duration-300 ${
                  isPopular
                    ? "border-primary bg-card shadow-lg ring-2 ring-primary/15 md:scale-[1.03] z-10 p-6 sm:p-8"
                    : "border-border/70 bg-card shadow-card hover:shadow-card-hover p-5 sm:p-7"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm whitespace-nowrap">
                    <Star className="h-3 w-3 fill-current" />
                    Mais escolhido
                  </div>
                )}

                {/* Discount badge */}
                <div className="absolute -top-2.5 right-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    -{discount}%
                  </span>
                </div>

                <div className="mb-4 sm:mb-5">
                  <h3 className={`font-bold ${isPopular ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"}`}>
                    {displayLabel}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                </div>

                <div className="mb-5 sm:mb-6">
                  {/* Original price strikethrough */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs sm:text-sm text-muted-foreground/60 line-through">
                      De R$ {original}/mês
                    </span>
                  </div>
                  {/* Promo price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">por R$</span>
                    <span className={`font-extrabold tracking-tight ${isPopular ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}>
                      {promo}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm">/mês</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-primary mt-1.5 font-medium">
                    7 dias grátis · Sem cobrança hoje
                  </p>
                </div>

                <ul className="space-y-2.5 mb-6 sm:mb-7 flex-1">
                  {highlights.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <Check
                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 shrink-0 ${
                          isPopular ? "text-primary" : "text-primary/60"
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to={`/checkout?plan=${plan.slug}`} className="block mt-auto">
                  <Button
                    variant={isPopular ? "hero" : "outline"}
                    className={`w-full rounded-xl ${isPopular ? "h-12 sm:h-13 text-[15px]" : "h-11 sm:h-12 text-sm"}`}
                  >
                    Começar teste gratuito
                  </Button>
                </Link>

                <p className="text-center text-[10px] sm:text-[11px] text-muted-foreground mt-3">
                  Cancele quando quiser · Sem fidelidade
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 text-xs sm:text-[13px] text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary/60" />
            <span>Pagamento seguro via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary/60" />
            <span>7 dias grátis</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary/60" />
            <span>Sem taxa escondida</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary/60" />
            <span>Sem fidelidade</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary/60" />
            <span>Cancele quando quiser</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
