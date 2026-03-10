import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
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
  starter: ["1 profissional", "Agenda online", "Gestao de clientes", "Relatorios basicos", "Agendamento online"],
  pro: ["Ate 5 profissionais", "Tudo do Starter", "Controle financeiro", "Campanhas simples", "Mala direta", "Relatorios avancados"],
  premium: ["Profissionais ilimitados", "Tudo do Pro", "Campanhas completas", "Automacoes de marketing", "Suporte prioritario", "Integracoes e API"],
};

const planDescriptions: Record<string, string> = {
  starter: "Para barbearias pequenas",
  pro: "Para barbearias em crescimento",
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
          setPlans(data.map((p) => ({
            id: p.id,
            slug: p.slug,
            label: p.label,
            price: p.price,
            max_professionals: p.max_professionals,
            features: p.features || [],
          })));
        }
      });
  }, []);

  return (
    <section id="pricing" className="section-padding bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-sm font-medium text-primary mb-3">Planos</span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Escolha o plano ideal</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Todos os planos incluem 7 dias grátis. Sem cartão de crédito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                className={`rounded-2xl border p-7 sm:p-8 flex flex-col relative transition-shadow ${
                  isPopular
                    ? "border-primary bg-card shadow-premium ring-2 ring-primary/20"
                    : "border-border bg-card shadow-card"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md">
                    <Star className="h-3 w-3 fill-current" />
                    Mais popular
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-xl font-bold">{plan.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {highlights.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${isPopular ? "text-primary" : "text-primary/70"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to={`/checkout?plan=${plan.slug}`}>
                  <Button variant={isPopular ? "hero" : "outline"} className="w-full h-11">
                    Começar agora
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
