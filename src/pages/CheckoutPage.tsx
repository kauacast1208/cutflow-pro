import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Scissors, ArrowLeft, Check, Shield, Loader2,
  Crown, Sparkles, Zap, CreditCard,
  Calendar, Bell, DollarSign, Users, BarChart3, CheckCircle2,
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
  franquias: <Shield className="h-5 w-5" />,
};

const benefits = [
  { icon: Calendar, text: "Agendamentos online automáticos" },
  { icon: Bell, text: "Lembretes automáticos para clientes" },
  { icon: DollarSign, text: "Controle financeiro completo" },
  { icon: Users, text: "Gestão de profissionais" },
  { icon: BarChart3, text: "Relatórios da barbearia" },
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
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: plan.priceId },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
      else throw new Error("URL not returned");
    } catch (err: any) {
      toast({
        title: "Erro ao iniciar checkout",
        description: "Não foi possível redirecionar para o pagamento. Tente novamente.",
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
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-base">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            CutFlow
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-14">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Teste gratuito de 7 dias</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Você não será cobrado hoje. O pagamento será iniciado apenas após o período de teste.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Plan selector */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 order-2 lg:order-1">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card sticky top-20">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3.5">Escolha seu plano</h3>

              <div className="space-y-2 mb-5">
                {(Object.entries(STRIPE_PLANS) as [StripePlanKey, typeof STRIPE_PLANS[StripePlanKey]][]).map(
                  ([key, p]) => {
                    const isSelected = selectedPlan === key;
                    const isRecommended = key === "pro";
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedPlan(key)}
                        className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-primary bg-primary/[0.04] ring-2 ring-primary/15"
                            : "border-border hover:border-primary/20 hover:bg-accent/20"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {planIcons[key]}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-sm">{p.name}</p>
                              {isRecommended && (
                                <span className="text-[9px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                  Recomendado
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{p.description}</p>
                          </div>
                        </div>
                        <span className="font-bold text-sm whitespace-nowrap">
                          R${p.price}<span className="text-[11px] font-normal text-muted-foreground">/mês</span>
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              {/* Price summary */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plano {plan.name}</span>
                  <span>R$ {plan.price}/mês</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Teste gratuito (7 dias)</span>
                  <span className="text-primary font-medium">- R$ {plan.price}</span>
                </div>
                <div className="border-t border-dashed border-border pt-3 flex justify-between font-bold">
                  <span>Total hoje</span>
                  <span className="text-xl text-primary">R$ 0,00</span>
                </div>
                <p className="text-[11px] text-muted-foreground text-center pt-1">
                  Sem fidelidade · Cancele quando quiser
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA section */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3 order-1 lg:order-2">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-card">
              <h3 className="font-semibold text-base sm:text-lg mb-1">O que está incluso no {plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">Acesso completo durante o período de teste.</p>

              <div className="rounded-xl bg-accent/30 border border-border/40 p-4 mb-5">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <div className="h-4.5 w-4.5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-primary" />
                      </div>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <h4 className="text-xs font-semibold mb-2.5 text-muted-foreground">Benefícios inclusos em todos os planos</h4>
              <div className="space-y-2 mb-7">
                {benefits.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm">
                    <Icon className="h-4 w-4 text-primary/70 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* CTA button */}
              <Button
                variant="hero"
                size="lg"
                className="w-full h-13 rounded-xl text-[15px] font-semibold"
                onClick={handleCheckout}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Redirecionando para o pagamento...
                  </>
                ) : (
                  "Começar teste gratuito"
                )}
              </Button>

              {/* Trust signals */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                  <span>Pagamento seguro via Stripe</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <CreditCard className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                  <span>Nenhuma cobrança hoje</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>

              <p className="text-center text-[11px] text-muted-foreground mt-4">
                Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
