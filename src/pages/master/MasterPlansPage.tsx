import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface Plan {
  id: string;
  slug: string;
  label: string;
  price: number;
  max_professionals: number;
  features: string[];
}

const featureLabels: Record<string, string> = {
  agenda: "Agenda online",
  clients: "Gestão de clientes",
  services: "Gestão de serviços",
  basic_reports: "Relatórios básicos",
  advanced_reports: "Relatórios avançados",
  finance: "Controle financeiro",
  blocked_times: "Bloqueio de horários",
  simple_campaigns: "Campanhas simples",
  advanced_campaigns: "Campanhas avançadas",
  basic_mailing: "Mala direta básica",
  mailing: "Mala direta completa",
  marketing_automation: "Automação de marketing",
  priority_support: "Suporte prioritário",
  chat_support: "Suporte por chat",
  integrations: "Integrações",
};

export default function MasterPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("plans").select("*").order("price").then(({ data }) => {
      setPlans((data as Plan[]) || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planos</h1>
        <p className="text-muted-foreground text-sm">Estrutura de planos da plataforma CutFlow.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.label}</CardTitle>
                <Badge variant="secondary" className="text-[10px] uppercase font-mono">{plan.slug}</Badge>
              </div>
              <div className="text-2xl font-bold text-primary">
                R$ {plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                <span className="text-sm font-normal text-muted-foreground">/mês</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {plan.max_professionals >= 999 ? "Profissionais ilimitados" : `Até ${plan.max_professionals} profissional(is)`}
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {featureLabels[f] || f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
