import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Crown, Loader2, Sparkles, Zap, Shield, CreditCard,
  ExternalLink, Star, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { STRIPE_PLANS, type StripePlanKey } from "@/lib/stripe";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const planIcons: Record<StripePlanKey, React.ReactNode> = {
  starter: <Zap className="h-6 w-6" />,
  pro: <Sparkles className="h-6 w-6" />,
  premium: <Crown className="h-6 w-6" />,
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trial: { label: "Período de teste", variant: "secondary" },
  active: { label: "Ativo", variant: "default" },
  past_due: { label: "Pagamento pendente", variant: "destructive" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  expired: { label: "Expirado", variant: "destructive" },
};

export default function BillingPage() {
  const { user } = useAuth();
  const { subscription, loading, isActive, isTrial, daysRemaining, refreshSubscription } = useSubscription();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<StripePlanKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

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
        window.location.href = data.url;
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

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Erro ao abrir portal",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const currentPlan = (subscription?.plan || "starter") as StripePlanKey;
  const hasStripeSubscription = !!subscription?.stripe_subscription_id;
  const statusInfo = statusLabels[subscription?.status || "trial"] || statusLabels.trial;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Assinatura</h1>
          <p className="text-muted-foreground text-lg">
            Gerencie seu plano e forma de pagamento.
          </p>
        </motion.div>

        {/* Current subscription card */}
        {subscription && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <Card className="border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      {planIcons[currentPlan]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">
                          Plano {STRIPE_PLANS[currentPlan].name}
                        </h3>
                        {isTrial ? (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                            Plano em teste
                          </Badge>
                        ) : (
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        R$ {STRIPE_PLANS[currentPlan].price}/mês
                      </p>
                    </div>
                  </div>

                  {hasStripeSubscription && (
                    <Button
                      variant="outline"
                      onClick={handleOpenPortal}
                      disabled={portalLoading}
                      className="shrink-0"
                    >
                      {portalLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <ExternalLink className="h-4 w-4 mr-2" />
                      )}
                      Gerenciar assinatura
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  {isTrial && daysRemaining !== null && (
                    <div className="rounded-lg bg-accent/50 p-3">
                      <p className="text-muted-foreground mb-0.5">Dias restantes do trial</p>
                      <p className="font-semibold text-lg">{daysRemaining} dias</p>
                    </div>
                  )}
                  {subscription.trial_ends_at && isTrial && (
                    <div className="rounded-lg bg-accent/50 p-3">
                      <p className="text-muted-foreground mb-0.5">Trial expira em</p>
                      <p className="font-semibold">
                        {format(new Date(subscription.trial_ends_at), "dd MMM yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  {subscription.current_period_end && subscription.status === "active" && (
                    <div className="rounded-lg bg-accent/50 p-3">
                      <p className="text-muted-foreground mb-0.5">Próxima cobrança</p>
                      <p className="font-semibold">
                        {format(new Date(subscription.current_period_end), "dd MMM yyyy", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Recursos do seu plano</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STRIPE_PLANS[currentPlan].features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Plans grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-6">
            {hasStripeSubscription ? "Alterar plano" : isTrial ? "Trocar plano do teste" : "Escolha seu plano"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(STRIPE_PLANS) as [StripePlanKey, typeof STRIPE_PLANS[StripePlanKey]][]).map(
              ([key, plan], i) => {
                const isCurrentTrialPlan = isTrial && currentPlan === key;
                const isCurrentActivePlan = !isTrial && isActive && currentPlan === key;
                const isRecommended = key === "pro";

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <Card
                      className={`relative h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
                        isRecommended
                          ? "border-primary shadow-md ring-2 ring-primary/20"
                          : "border-border"
                      } ${isCurrentTrialPlan || isCurrentActivePlan ? "ring-2 ring-primary/40" : ""}`}
                    >
                      {isRecommended && !isCurrentTrialPlan && !isCurrentActivePlan && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Mais popular
                          </span>
                        </div>
                      )}
                      {isCurrentTrialPlan && (
                        <div className="absolute -top-3 right-4">
                          <span className="bg-amber-500/10 text-amber-700 border border-amber-500/20 text-xs font-semibold px-3 py-1 rounded-full">
                            Plano em teste
                          </span>
                        </div>
                      )}
                      {isCurrentActivePlan && (
                        <div className="absolute -top-3 right-4">
                          <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-3 py-1 rounded-full">
                            Plano ativo
                          </span>
                        </div>
                      )}

                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            {planIcons[key]}
                          </div>
                          <div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">R${plan.price}</span>
                          <span className="text-muted-foreground text-sm">/mês</span>
                        </div>
                        {!hasStripeSubscription && !isTrial && (
                          <p className="text-xs text-primary mt-1 font-medium">7 dias grátis</p>
                        )}
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col">
                        <ul className="space-y-3 flex-1 mb-6">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2.5">
                              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {isCurrentActivePlan ? (
                          <Button className="w-full rounded-xl" variant="outline" size="lg" onClick={handleOpenPortal} disabled={portalLoading}>
                            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Gerenciar plano
                          </Button>
                        ) : isCurrentTrialPlan ? (
                          <Button className="w-full rounded-xl" variant="outline" size="lg" onClick={handleOpenPortal} disabled={portalLoading}>
                            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Gerenciar plano
                          </Button>
                        ) : hasStripeSubscription ? (
                          <Button
                            className="w-full rounded-xl"
                            variant={isRecommended ? "default" : "outline"}
                            size="lg"
                            onClick={handleOpenPortal}
                            disabled={portalLoading}
                          >
                            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {STRIPE_PLANS[key].price > STRIPE_PLANS[currentPlan].price
                              ? "Fazer upgrade"
                              : "Alterar plano"}
                          </Button>
                        ) : isTrial ? (
                          <Button
                            className="w-full rounded-xl"
                            variant={isRecommended ? "default" : "outline"}
                            size="lg"
                            disabled={loadingPlan !== null}
                            onClick={() => handleSubscribe(key)}
                          >
                            {loadingPlan === key ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Iniciar teste neste plano
                          </Button>
                        ) : (
                          <Button
                            className="w-full rounded-xl"
                            variant={isRecommended ? "default" : "outline"}
                            size="lg"
                            disabled={loadingPlan !== null}
                            onClick={() => handleSubscribe(key)}
                          >
                            {loadingPlan === key ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Começar teste gratuito
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              }
            )}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
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
        </motion.div>
      </div>
    </div>
  );
}
