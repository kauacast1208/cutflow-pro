import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Scissors, ArrowLeft, Check, CreditCard, QrCode, Shield, Loader2 } from "lucide-react";

const plans = [
  { id: "starter", name: "Starter", price: "79", desc: "Para barbearias pequenas" },
  { id: "pro", name: "Pro", price: "149", desc: "Para barbearias em crescimento" },
  { id: "premium", name: "Premium", price: "249", desc: "Para barbearias profissionais" },
];

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const planParam = params.get("plan") || "pro";
  const selectedPlan = plans.find((p) => p.id === planParam) || plans[1];

  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [barbershopName, setBarbershopName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate processing
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    navigate("/signup");
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
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Iniciar teste grátis</h1>
          <p className="text-muted-foreground">7 dias grátis, sem compromisso. Cancele quando quiser.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Plan summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card sticky top-24">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Resumo do plano</h3>

              <div className="space-y-2 mb-6">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/checkout?plan=${p.id}`, { replace: true })}
                    className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      selectedPlan.id === p.id
                        ? "border-primary bg-accent ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <span className="font-bold text-sm">R${p.price}<span className="text-xs font-normal text-muted-foreground">/mês</span></span>
                  </button>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plano {selectedPlan.name}</span>
                  <span>R$ {selectedPlan.price}/mês</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto (7 dias grátis)</span>
                  <span className="text-primary font-medium">- R$ {selectedPlan.price}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between font-bold">
                  <span>Total hoje</span>
                  <span className="text-xl text-primary">R$ 0,00</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4 shrink-0 text-primary" />
                <span>Pagamento seguro • Cancele a qualquer momento</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
                <h3 className="font-semibold text-lg">Seus dados</h3>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barbershop">Nome da barbearia</Label>
                  <Input id="barbershop" placeholder="Nome da sua barbearia" value={barbershopName} onChange={(e) => setBarbershopName(e.target.value)} className="h-12 rounded-xl" required />
                </div>
              </div>

              {/* Payment method */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
                <h3 className="font-semibold text-lg">Método de pagamento</h3>
                <p className="text-xs text-muted-foreground -mt-3">Cobrança inicia apenas após os 7 dias de teste.</p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                      paymentMethod === "card"
                        ? "border-primary bg-accent ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-sm">Cartão</p>
                      <p className="text-xs text-muted-foreground">Crédito ou débito</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                      paymentMethod === "pix"
                        ? "border-primary bg-accent ring-2 ring-primary/20"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <QrCode className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-sm">PIX</p>
                      <p className="text-xs text-muted-foreground">Pagamento instantâneo</p>
                    </div>
                  </button>
                </div>

                {paymentMethod === "card" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Número do cartão</Label>
                      <Input placeholder="0000 0000 0000 0000" className="h-12 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Validade</Label>
                        <Input placeholder="MM/AA" className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>CVV</Label>
                        <Input placeholder="123" className="h-12 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nome no cartão</Label>
                      <Input placeholder="Como está no cartão" className="h-12 rounded-xl" />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-secondary/50 p-8 text-center">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
                    <p className="text-sm font-medium mb-1">QR Code PIX</p>
                    <p className="text-xs text-muted-foreground">O código PIX será gerado após confirmar o teste gratuito.</p>
                  </div>
                )}
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full h-13 rounded-xl text-base" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Iniciar teste grátis
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Ao continuar, você concorda com os{" "}
                <a href="#" className="underline">Termos de Uso</a> e{" "}
                <a href="#" className="underline">Política de Privacidade</a>.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
