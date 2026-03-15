import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star, CheckCircle2, Shield, Zap, Crown, MessageSquare } from "lucide-react";
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

const planPrices: Record<string, number> = {
  starter: 59,
  pro: 89,
  premium: 119,
};

const fallbackPlans: PlanRow[] = [
  { id: "1", slug: "starter", label: "Starter", price: 59, max_professionals: 1, features: [] },
  { id: "2", slug: "pro", label: "Pro", price: 89, max_professionals: 5, features: [] },
  { id: "3", slug: "premium", label: "Business", price: 119, max_professionals: 999, features: [] },
];

const enterpriseHighlights = [
  "Tudo do Business incluso",
  "Múltiplas unidades e franquias",
  "Limites personalizados",
  "Módulos avançados sob medida",
  "Onboarding e implementação dedicados",
  "Suporte prioritário com SLA",
  "Integrações customizadas",
  "Gerente de conta exclusivo",
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
            data
              .filter((p) => p.slug !== "enterprise" && p.slug !== "franquias")
              .map((p) => ({
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

        {/* Standard plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => {
            const isPopular = plan.slug === "pro";
            const highlights = planHighlights[plan.slug] || [];
            const desc = planDescriptions[plan.slug] || "";
            const displayLabel = planLabels[plan.slug] || plan.label;
            const price = planPrices[plan.slug] || plan.price;

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

                <div className="mb-4 sm:mb-5">
                  <h3 className={`font-bold ${isPopular ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"}`}>
                    {displayLabel}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                </div>

                <div className="mb-5 sm:mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">R$</span>
                    <span className={`font-extrabold tracking-tight ${isPopular ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}>
                      {price}
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

        {/* Enterprise card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto mt-6 sm:mt-8"
        >
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-card to-accent/[0.06] p-6 sm:p-8 lg:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold">Enterprise</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Para operações de grande porte com necessidades personalizadas
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {enterpriseHighlights.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-3 lg:min-w-[200px]">
                <div className="text-center lg:text-right">
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">Sob medida</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Plano personalizado para sua operação</p>
                </div>
                <a
                  href="https://wa.me/5511999999999?text=Olá! Tenho interesse no plano Enterprise do CutFlow."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full lg:w-auto"
                >
                  <Button variant="hero" className="w-full lg:w-auto rounded-xl h-12 text-[15px] gap-2 px-8">
                    <MessageSquare className="h-4 w-4" />
                    Falar com vendas
                  </Button>
                </a>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                  Implementação e onboarding inclusos
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
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