import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { STRIPE_PLANS, type StripePlanKey } from "@/lib/stripe";

const planIcons: Record<StripePlanKey, React.ReactNode> = {
  starter: <Zap className="h-6 w-6" />,
  pro: <Sparkles className="h-6 w-6" />,
  premium: <Crown className="h-6 w-6" />,
};

export default function BillingPage() {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<StripePlanKey | null>(null);

  const handleSubscribe = async (planKey: StripePlanKey) => {
    if (!user) {
      toast({ title: "Faça login primeiro", variant: "destructive" });
      return;
    }

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: STRIPE_PLANS[planKey].priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Erro ao criar checkout",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = subscription?.plan || "starter";
  const isActive = subscription?.status === "active";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1
            className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Escolha seu plano
          </h1>
          <p className="text-muted-foreground mt-3 text-lg max-w-xl mx-auto">
            Escale sua barbearia com o plano ideal. Todos incluem 7 dias de teste grátis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.entries(STRIPE_PLANS) as [StripePlanKey, typeof STRIPE_PLANS[StripePlanKey]][]).map(
            ([key, plan], i) => {
              const isCurrent = isActive && currentPlan === key;
              const isRecommended = "recommended" in plan && plan.recommended;

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className={`relative h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
                      isRecommended
                        ? "border-primary shadow-md ring-2 ring-primary/20"
                        : "border-border"
                    } ${isCurrent ? "ring-2 ring-primary/40" : ""}`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full shadow-sm">
                          Recomendado
                        </span>
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 right-4">
                        <span className="bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full border">
                          Plano atual
                        </span>
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          {planIcons[key]}
                        </div>
                        <CardTitle className="text-xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {plan.name}
                        </CardTitle>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">
                          R${plan.price}
                        </span>
                        <span className="text-muted-foreground text-sm">/mês</span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 flex-1 mb-6">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5">
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-sm text-foreground/80">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full rounded-xl"
                        variant={isRecommended ? "default" : "outline"}
                        size="lg"
                        disabled={isCurrent || loadingPlan !== null}
                        onClick={() => handleSubscribe(key)}
                      >
                        {loadingPlan === key ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {isCurrent ? "Plano atual" : "Assinar plano"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            }
          )}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Pagamento seguro via Stripe. Cancele a qualquer momento.
        </motion.p>
      </div>
    </div>
  );
}
