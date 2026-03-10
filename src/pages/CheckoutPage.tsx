import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Scissors, ArrowLeft, Check, Shield, Loader2, Crown, Sparkles, Zap } from "lucide-react";
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
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Scissors className="h-5 w-5 text-primary" />
            CutFlow
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Iniciar teste gratuito</h1>
          <p className="text-muted-foreground">7 dias gratis, sem compromisso. Cancele quando quiser.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Plan summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 order-2 lg:order-1"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sticky top-24">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Escolha seu plano</h3>

              <div className="space-y-2 mb-6">
                {(Object.entries(STRIPE_PLANS) as [StripePlanKey, typeof STRIPE_PLANS[StripePlanKey]][]).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      selectedPlan === key
                        ? "border-primary bg-accent ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        selectedPlan === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {planIcons[key]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.features[0]}</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm">R${p.price}<span className="text-xs font-normal text-muted-foreground">/mes</span></span>
                  </button>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plano {plan.name}</span>
                  <span>R$ {plan.price}/mes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trial (7 dias gratis)</span>
                  <span className="text-primary font-medium">- R$ {plan.price}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span>Total hoje</span>
                  <span className="text-xl text-primary">R$ 0,00</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0 text-primary" />
                <span>Pagamento seguro via Stripe. Cancele a qualquer momento.</span>
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
              <h3 className="font-semibold text-lg mb-2">Comece agora</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Ao clicar no botao abaixo, voce sera redirecionado para o checkout seguro do Stripe.
                Seus 7 dias gratuitos comecam imediatamente.
              </p>

              <div className="rounded-xl bg-accent/50 border border-border p-4 mb-6">
                <h4 className="text-sm font-semibold mb-3">O que esta incluso no {plan.name}:</h4>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full h-13 rounded-xl text-base"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Começar teste gratuito
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Ao continuar, voce concorda com os Termos de Uso e Politica de Privacidade.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
