import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, Shield, CreditCard, X, CheckCircle2 } from "lucide-react";
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
  starter: "Ideal para barbeiros autônomos",
  pro: "Ideal para barbearias em crescimento",
  premium: "Para barbearias profissionais",
};

const fallbackPlans: PlanRow[] = [
  { id: "1", slug: "starter", label: "Starter", price: 79, max_professionals: 1, features: [] },
  { id: "2", slug: "pro", label: "Pro", price: 129, max_professionals: 5, features: [] },
  { id: "3", slug: "premium", label: "Premium", price: 189, max_professionals: 999, features: [] },
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
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5">
            Planos e preços
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.02em] mb-3 sm:mb-4">
            Escolha o plano ideal para sua barbearia
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Todos os planos incluem 7 dias grátis. Cancele quando quiser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isPopular = plan.slug === "pro";
            const highlights = planHighlights[plan.slug] || [];
            const desc = planDescriptions[plan.slug] || "";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border flex flex-col relative transition-all duration-300 ${
                  isPopular
                    ? "border-primary bg-card shadow-lg ring-2 ring-primary/15 md:scale-105 z-10 p-6 sm:p-8 lg:p-9"
                    : "border-border/80 bg-card shadow-card hover:shadow-card-hover p-5 sm:p-7 lg:p-8"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-4 sm:px-5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-primary-foreground shadow-md whitespace-nowrap">
                    <Star className="h-3 w-3 fill-current" />
                    Mais popular
                  </div>
                )}

                <div className="mb-4 sm:mb-5">
                  <h3 className={`font-bold ${isPopular ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"}`}>
                    {plan.label}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{desc}</p>
                </div>

                <div className="mb-5 sm:mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">R$</span>
                    <span className={`font-extrabold tracking-tight ${isPopular ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}>
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm">/mês</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-primary mt-1.5 font-medium">
                    7 dias grátis para testar
                  </p>
                </div>

                <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                  {highlights.map((f) => (
                    <li key={f} className="flex items-start gap-2 sm:gap-2.5 text-xs sm:text-sm">
                      <Check
                        className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 shrink-0 ${
                          isPopular ? "text-primary" : "text-primary/70"
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link to={`/checkout?plan=${plan.slug}`} className="block">
                  <Button
                    variant={isPopular ? "hero" : "outline"}
                    className={`w-full rounded-xl ${isPopular ? "h-14 sm:h-12 text-base sm:text-base" : "h-12 sm:h-11 text-base sm:text-sm"}`}
                  >
                    Começar teste gratuito
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Trust signals */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Pagamento seguro via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Teste gratuito de 7 dias</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Sem fidelidade</span>
          </div>
        </div>
      </div>
    </section>
  );
}
