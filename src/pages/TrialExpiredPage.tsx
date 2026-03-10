import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Scissors, Check, AlertTriangle, ArrowRight, Shield, Users, Calendar, BarChart3, Megaphone, Mail, Zap, HeadphonesIcon, Loader2, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { STRIPE_PLANS, type StripePlanKey } from "@/lib/stripe";
import { motion } from "framer-motion";

interface PlanData {
  id: string;
  slug: string;
  label: string;
  price: number;
  max_professionals: number;
  features: string[];
}

const featureIcons: Record<string, any> = {
  agenda: Calendar,
  clients: Users,
  services: Scissors,
  basic_reports: BarChart3,
  advanced_reports: BarChart3,
  finance: BarChart3,
  simple_campaigns: Megaphone,
  advanced_campaigns: Megaphone,
  basic_mailing: Mail,
  mailing: Mail,
  marketing_automation: Zap,
  priority_support: HeadphonesIcon,
  chat_support: HeadphonesIcon,
  integrations: Zap,
};

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

const planHighlights: Record<string, string[]> = {
  starter: ["1 profissional", "Agenda online", "Gestão de clientes", "Relatórios básicos"],
  pro: ["Até 5 profissionais", "Campanhas simples", "Mala direta", "Relatórios avançados", "Controle financeiro"],
  premium: ["Profissionais ilimitados", "Campanhas completas", "Automações de marketing", "Suporte prioritário", "Integrações"],
};

const planDescriptions: Record<string, string> = {
  starter: "Ideal para barbearias iniciando",
  pro: "Para barbearias em crescimento",
  premium: "Para operações profissionais",
};

export default function TrialExpiredPage() {
  const { signOut } = useAuth();
  const { daysRemaining, isCancelled, isTrialExpired } = useSubscription();
  const { toast } = useToast();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });

      if (data) {
        setPlans(data.map((p) => ({
          id: p.id,
          slug: p.slug,
          label: p.label,
          price: p.price,
          max_professionals: p.max_professionals,
          features: p.features || [],
        })));
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const handleDirectCheckout = async (planSlug: string) => {
    const stripePlan = STRIPE_PLANS[planSlug as StripePlanKey];
    if (!stripePlan) return;

    setCheckoutLoading(planSlug);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: stripePlan.priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({
        title: "Erro ao iniciar checkout",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Fallback plans if DB is empty
  const displayPlans = plans.length > 0 ? plans : [
    { id: "1", slug: "starter", label: "Starter", price: 79, max_professionals: 1, features: ["agenda", "clients", "services", "basic_reports"] },
    { id: "2", slug: "pro", label: "Pro", price: 129, max_professionals: 5, features: ["agenda", "clients", "services", "basic_reports", "advanced_reports", "finance", "simple_campaigns", "basic_mailing", "chat_support"] },
    { id: "3", slug: "premium", label: "Premium", price: 189, max_professionals: 999, features: ["agenda", "clients", "services", "basic_reports", "advanced_reports", "finance", "simple_campaigns", "advanced_campaigns", "basic_mailing", "mailing", "marketing_automation", "priority_support", "chat_support", "integrations"] },
  ];

  const recommendedSlug = "pro";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            CutFlow
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sair
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 py-10 sm:py-16">
        <div className="max-w-5xl w-full">
          {/* Hero message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
              Seu teste gratuito terminou
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
              Escolha um plano para continuar usando a CutFlow e manter sua agenda funcionando.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground">
              <Shield className="h-4 w-4" />
              Seu sistema continua salvo, basta escolher um plano para continuar.
            </div>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {displayPlans.map((plan, i) => {
                const isRecommended = plan.slug === recommendedSlug;
                const highlights = planHighlights[plan.slug] || plan.features.slice(0, 4).map((f) => featureLabels[f] || f);
                const desc = planDescriptions[plan.slug] || "";

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className={`rounded-2xl border p-6 sm:p-7 flex flex-col relative transition-shadow hover:shadow-lg ${
                      isRecommended
                        ? "border-primary bg-card shadow-xl ring-2 ring-primary/20 scale-[1.02]"
                        : "border-border bg-card shadow-sm"
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md">
                        <Star className="h-3 w-3 fill-current" />
                        Recomendado
                      </div>
                    )}

                    <div className="mb-5">
                      <h3 className="text-xl font-bold">{plan.label}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">R$</span>
                        <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">/mês</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {plan.max_professionals >= 999
                          ? "Profissionais ilimitados"
                          : `Até ${plan.max_professionals} profissional${plan.max_professionals > 1 ? "is" : ""}`}
                      </p>
                    </div>

                    <ul className="space-y-2.5 mb-7 flex-1">
                      {highlights.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                            isRecommended ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            <Check className="h-3 w-3" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Link to="/billing" className="mt-auto">
                      <Button
                        variant={isRecommended ? "default" : "outline"}
                        size="lg"
                        className={`w-full h-12 rounded-xl font-semibold text-base ${
                          isRecommended ? "shadow-md" : ""
                        }`}
                      >
                        Escolher {plan.label}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Trust footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-muted-foreground mt-10"
          >
            Pagamento seguro • Cancele a qualquer momento • Sem surpresas
          </motion.p>
        </div>
      </div>
    </div>
  );
}
