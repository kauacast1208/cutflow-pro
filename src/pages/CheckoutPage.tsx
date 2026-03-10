import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Scissors, ArrowLeft, Check, Shield, Loader2,
  Crown, Sparkles, Zap, CreditCard, X,
  Calendar, Bell, DollarSign, Users, BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { STRIPE_PLANS, type StripePlanKey } from "@/lib/stripe";
import { motion } from "framer-motion";

const planIcons: Record<StripePlanKey, React.ReactNode> = {
  starter: <Zap className="h-5 w-5" />,
  pro: <Sparkles className="h-5 w-5" />,
  premium: <Crown className="h-5 w-5" />,
};

const benefits = [
  { icon: Calendar, text: "Agendamentos online automaticos" },
  { icon: Bell, text: "Lembretes automaticos para clientes" },
  { icon: DollarSign, text: "Controle financeiro completo" },
  { icon: Users, text: "Gestao de profissionais" },
  { icon: BarChart3, text: "Relatorios da barbearia" },
];

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const planParam = (params.get("plan") || "pro") as StripePlanKey;
  const [selectedPlan, setSelectedPlan] = useState<StripePlanKey>(planParam);
  const [submitting, setSubmitting] = useState(false);

  const plan = STRIPE_PLANS[selectedPlan];

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login?redirect=/checkout?plan=" + selectedPlan);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: plan.priceId },
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
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            CutFlow
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Comece a organizar sua barbearia hoje
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Teste gratis por 7 dias. Sem cobranca ate decidir continuar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Plan selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 order-2 lg:order-1"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sticky top-24">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Escolha seu plano
              </h3>

              <div className="space-y-2.5 mb-6">
                {(Object.entries(STRIPE_PLANS) as [StripePlanKey, typeof STRIPE_PLANS[StripePlanKey]][]).map(
                  ([key, p]) => {
                    const isSelected = selectedPlan === key;
                    const isRecommended = key === "pro";

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedPlan(key)}
                        className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                            : "border-border hover:border-primary/30 hover:bg-accent/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {planIcons[key]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm">{p.name}</p>
                              {isRecommended && (
                                <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  Recomendado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {p.features[0]}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-sm whitespace-nowrap">
                          R${p.price}
                          <span className="text-xs font-normal text-muted-foreground">/mes</span>
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              {/* Price summary */}
              <div className="border-t border-border pt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plano {plan.name}</span>
                  <span>R$ {plan.price}/mes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trial (7 dias gratis)</span>
                  <span className="text-primary font-medium">- R$ {plan.price}</span>
                </div>
                <div className="border-t border-dashed border-border pt-3 flex justify-between font-bold">
                  <span>Total hoje</span>
                  <span className="text-2xl text-primary">R$ 0,00</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 order-1 lg:order-2"
          >
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
              {/* Plan features */}
              <h3 className="font-semibold text-lg mb-1">
                O que esta incluso no {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                Acesso completo durante o periodo de teste.
              </p>

              <div className="rounded-xl bg-accent/40 border border-border/50 p-5 mb-6">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                Beneficios inclusos em todos os planos
              </h4>
              <div className="space-y-2.5 mb-8">
                {benefits.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <Button
                variant="hero"
                size="lg"
                className="w-full h-14 rounded-xl text-base font-semibold"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                Iniciar 7 dias gratis
              </Button>

              {/* Trust signals */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary shrink-0" />
                  <span>Pagamento seguro via Stripe</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-primary shrink-0" />
                  <span>Nenhuma cobranca hoje</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <X className="h-4 w-4 text-primary shrink-0" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground mt-5">
                Ao continuar, voce concorda com os Termos de Uso e Politica de Privacidade.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
