import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Crown, Loader2, Sparkles, Zap, Shield, CreditCard,
  ExternalLink, Star, CheckCircle2, AlertTriangle, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { STRIPE_PLANS, type StripePlanKey } from "@/lib/stripe";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const planIcons: Record<StripePlanKey, React.ReactNode> = {
  starter: <Zap className="h-5 w-5" />,
  pro: <Sparkles className="h-5 w-5" />,
  premium: <Crown className="h-5 w-5" />,
  franquias: <Shield className="h-5 w-5" />,
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
  const { subscription, loading, isActive, isTrial, daysRemaining } = useSubscription();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<StripePlanKey | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleSubscribe = async (planKey: StripePlanKey) => {
    if (!user) {
      toast({ title: "Faça login primeiro", variant: "destructive" });
      return;
    }
    if (loadingPlan) return; // Prevent double-clicks
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: STRIPE_PLANS[planKey].priceId },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("Não foi possível iniciar o checkout.");
    } catch (err: any) {
      toast({
        title: "Erro ao criar checkout",
        description: "Não foi possível iniciar o pagamento. Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleOpenPortal = async () => {
    if (portalLoading) return;
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      
      if (data?.error === "trial_no_customer" || data?.error === "no_subscription") {
        toast({
          title: "Plano em teste",
          description: "Ative sua assinatura primeiro para gerenciar cobrança e pagamento.",
        });
        setPortalLoading(false);
        return;
      }
      
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({
        title: "Portal indisponível",
        description: "Não foi possível abrir o portal de pagamento. Tente novamente.",
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando seu plano...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">Assinatura</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gerencie seu plano e forma de pagamento.</p>
        </motion.div>

        {/* Current subscription card */}
        {subscription && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <Card className="border-primary/15 shadow-card">
              <CardContent className="p-5 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-primary/[0.08] text-primary flex items-center justify-center">
                      {planIcons[currentPlan]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">Plano {STRIPE_PLANS[currentPlan].name}</h3>
                        {isTrial ? (
                          <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[11px]">
                            Em teste
                          </Badge>
                        ) : (
                          <Badge variant={statusInfo.variant} className="text-[11px]">{statusInfo.label}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">R$ {STRIPE_PLANS[currentPlan].price}/mês</p>
                    </div>
                  </div>

                  {hasStripeSubscription && (
                    <Button variant="outline" onClick={handleOpenPortal} disabled={portalLoading} className="shrink-0 rounded-xl h-11 sm:h-10">
                      {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                      Gerenciar assinatura
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  {isTrial && daysRemaining !== null && (
                    <div className="rounded-xl bg-accent/40 p-3.5">
                      <p className="text-muted-foreground text-xs mb-0.5">Dias restantes</p>
                      <p className="font-bold text-lg">{daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}</p>
                    </div>
                  )}
                  {subscription.trial_ends_at && isTrial && (
                    <div className="rounded-xl bg-accent/40 p-3.5">
                      <p className="text-muted-foreground text-xs mb-0.5">Teste expira em</p>
                      <p className="font-semibold">{format(new Date(subscription.trial_ends_at), "dd MMM yyyy", { locale: ptBR })}</p>
                    </div>
                  )}
                  {subscription.current_period_end && subscription.status === "active" && (
                    <div className="rounded-xl bg-accent/40 p-3.5">
                      <p className="text-muted-foreground text-xs mb-0.5">Próxima cobrança</p>
                      <p className="font-semibold">{format(new Date(subscription.current_period_end), "dd MMM yyyy", { locale: ptBR })}</p>
                    </div>
                  )}
                </div>

                {/* Trial guidance banner */}
                {isTrial && !hasStripeSubscription && (
                  <div className="mt-4 rounded-xl bg-primary/[0.03] border border-primary/10 p-4 flex items-start gap-3">
                    <CreditCard className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Você está no período de teste gratuito</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Sem cobrança durante o teste. Escolha um plano abaixo para garantir a continuidade após os {daysRemaining} dias restantes. Você pode trocar de plano a qualquer momento.
                      </p>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2.5">Recursos do seu plano</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {STRIPE_PLANS[currentPlan].features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Plans grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">
              {hasStripeSubscription ? "Alterar plano" : isTrial ? "Ativar assinatura" : "Escolha seu plano"}
            </h2>
            {isTrial && (
              <span className="text-xs text-muted-foreground hidden sm:block">Você pode trocar de plano durante o teste</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {(Object.entries(STRIPE_PLANS) as [StripePlanKey, typeof STRIPE_PLANS[StripePlanKey]][]).map(
              ([key, plan], i) => {
                const isCurrentTrialPlan = isTrial && currentPlan === key;
                const isCurrentActivePlan = !isTrial && isActive && currentPlan === key;
                const isRecommended = key === "pro";
                const isLoadingThis = loadingPlan === key;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <Card
                      className={`relative h-full flex flex-col transition-all duration-300 ${
                        isCurrentTrialPlan
                          ? "border-primary/40 bg-primary/[0.02] ring-2 ring-primary/20 shadow-md"
                          : isCurrentActivePlan
                          ? "border-primary ring-2 ring-primary/30 shadow-md"
                          : isRecommended
                          ? "border-primary shadow-md ring-2 ring-primary/15"
                          : "border-border/70"
                      }`}
                    >
                      {isRecommended && !isCurrentTrialPlan && !isCurrentActivePlan && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-primary text-primary-foreground text-[11px] font-semibold px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Mais popular
                          </span>
                        </div>
                      )}
                      {isCurrentTrialPlan && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-primary text-primary-foreground text-[11px] font-semibold px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Seu plano atual
                          </span>
                        </div>
                      )}
                      {isCurrentActivePlan && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-primary text-primary-foreground text-[11px] font-semibold px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Plano ativo
                          </span>
                        </div>
                      )}

                      <div className="p-5 sm:p-6 pb-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                            isCurrentTrialPlan || isCurrentActivePlan
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary/[0.08] text-primary"
                          }`}>
                            {planIcons[key]}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{plan.name}</h3>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{plan.description}</p>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-0.5 mb-1">
                          <span className="text-3xl sm:text-4xl font-bold">R${plan.price}</span>
                          <span className="text-muted-foreground text-sm">/mês</span>
                        </div>
                        {!isCurrentActivePlan && (
                          <p className="text-[11px] text-primary font-medium"><p className="text-[11px] text-primary font-medium">15 dias grátis · Sem cobrança hoje</p></p>
                        )}
                      </div>

                      <CardContent className="flex-1 flex flex-col pt-0 px-5 sm:px-6 pb-5 sm:pb-6">
                        <ul className="space-y-2.5 flex-1 mb-5">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {isCurrentActivePlan ? (
                          <Button className="w-full rounded-xl h-12 sm:h-11 text-sm font-semibold" variant="outline" onClick={handleOpenPortal} disabled={portalLoading}>
                            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Gerenciar plano
                          </Button>
                        ) : isCurrentTrialPlan ? (
                          <Button
                            className="w-full rounded-xl h-12 sm:h-11 text-sm font-semibold"
                            disabled={loadingPlan !== null}
                            onClick={() => handleSubscribe(key)}
                          >
                            {isLoadingThis ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <ArrowRight className="h-4 w-4 mr-1.5" />
                            )}
                            {isLoadingThis ? "Abrindo checkout..." : "Ativar este plano"}
                          </Button>
                        ) : hasStripeSubscription ? (
                          <Button className="w-full rounded-xl h-12 sm:h-11 text-sm font-semibold" variant="outline" onClick={handleOpenPortal} disabled={portalLoading}>
                            {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Trocar para este plano
                          </Button>
                        ) : isTrial ? (
                          <Button
                            className="w-full rounded-xl h-12 sm:h-11 text-sm font-semibold"
                            variant={isRecommended ? "default" : "outline"}
                            disabled={loadingPlan !== null}
                            onClick={() => handleSubscribe(key)}
                          >
                            {isLoadingThis ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {isLoadingThis ? "Abrindo checkout..." : "Trocar para este plano"}
                          </Button>
                        ) : (
                          <Button
                            className="w-full rounded-xl h-12 sm:h-11 text-sm font-semibold"
                            variant={isRecommended ? "default" : "outline"}
                            disabled={loadingPlan !== null}
                            onClick={() => handleSubscribe(key)}
                          >
                            {isLoadingThis ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {isLoadingThis ? "Abrindo checkout..." : "Começar teste gratuito"}
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
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 text-xs sm:text-[13px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary/60" />
              <span>Pagamento seguro via Stripe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary/60" />
              <span>15 dias grátis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary/60" />
              <span>Sem fidelidade</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary/60" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
