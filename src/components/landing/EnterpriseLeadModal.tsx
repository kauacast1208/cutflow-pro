import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Building2,
  Crown,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EnterpriseLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planLabel: string;
  planSlug: string;
  whatsAppPhone: string;
}

const challenges = [
  { value: "agenda", label: "Organizar agenda" },
  { value: "faltas", label: "Reduzir faltas" },
  { value: "financeiro", label: "Controlar financeiro" },
  { value: "multiunidade", label: "Gestão multiunidade" },
  { value: "marketing", label: "Marketing e retenção" },
  { value: "integracoes", label: "Integrações e operação customizada" },
  { value: "outro", label: "Outro" },
];

interface FormData {
  name: string;
  whatsapp: string;
  city: string;
  barbers_count: string;
  units_count: string;
  monthly_revenue: string;
  main_challenge: string;
}

const initialForm: FormData = {
  name: "",
  whatsapp: "",
  city: "",
  barbers_count: "",
  units_count: "",
  monthly_revenue: "",
  main_challenge: "",
};

export function EnterpriseLeadModal({
  open,
  onOpenChange,
  planLabel,
  planSlug,
  whatsAppPhone,
}: EnterpriseLeadModalProps) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isFranquias = planSlug === "franquias";
  const Icon = isFranquias ? Building2 : Crown;

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValid =
    form.name.trim().length >= 2 &&
    form.whatsapp.trim().length >= 10 &&
    form.city.trim().length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("enterprise_leads").insert({
        plan_interest: planSlug,
        name: form.name.trim(),
        whatsapp: form.whatsapp.trim(),
        city: form.city.trim(),
        barbers_count: parseInt(form.barbers_count) || 1,
        units_count: parseInt(form.units_count) || 1,
        monthly_revenue: form.monthly_revenue || null,
        main_challenge: form.main_challenge || null,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou fale direto no WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const challengeLabel = challenges.find((c) => c.value === form.main_challenge)?.label || form.main_challenge;

  const whatsAppMessage = isFranquias
    ? `Olá! Tenho interesse no plano *Franquias* do CutFlow.

Nome: ${form.name}
Cidade: ${form.city}
Barbeiros: ${form.barbers_count || "—"}
Unidades: ${form.units_count || "—"}
${challengeLabel ? `Principal desafio: ${challengeLabel}` : ""}`
    : `Olá! Tenho interesse no plano *Enterprise* do CutFlow.

Nome: ${form.name}
Cidade: ${form.city}
Barbeiros: ${form.barbers_count || "—"}
Unidades: ${form.units_count || "—"}
${challengeLabel ? `Principal desafio: ${challengeLabel}` : ""}
Quero entender SLA, integrações e solução sob medida.`;

  const whatsAppUrl = `https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(whatsAppMessage)}`;

  const handleClose = (v: boolean) => {
    if (!v) {
      setTimeout(() => {
        setForm(initialForm);
        setSubmitted(false);
      }, 300);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden border-primary/10 bg-card">
        {/* Gradient accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-6 sm:p-8"
            >
              <DialogHeader className="mb-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Plano {planLabel}
                  </span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
                  Vamos montar a solução ideal para sua operação
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1.5">
                  Nos conte um pouco sobre sua barbearia para recomendarmos o melhor formato.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name + WhatsApp row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-name" className="text-xs font-medium">
                      Nome *
                    </Label>
                    <Input
                      id="lead-name"
                      placeholder="Seu nome"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="h-10 text-sm"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-whatsapp" className="text-xs font-medium">
                      WhatsApp *
                    </Label>
                    <Input
                      id="lead-whatsapp"
                      placeholder="(00) 00000-0000"
                      value={form.whatsapp}
                      onChange={(e) => handleChange("whatsapp", e.target.value)}
                      className="h-10 text-sm"
                      maxLength={20}
                      required
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <Label htmlFor="lead-city" className="text-xs font-medium">
                    Cidade *
                  </Label>
                  <Input
                    id="lead-city"
                    placeholder="Ex: São Paulo, SP"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="h-10 text-sm"
                    maxLength={100}
                    required
                  />
                </div>

                {/* Barbers + Units row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-barbers" className="text-xs font-medium">
                      Qtd. de barbeiros
                    </Label>
                    <Input
                      id="lead-barbers"
                      type="number"
                      min={1}
                      max={999}
                      placeholder="Ex: 8"
                      value={form.barbers_count}
                      onChange={(e) => handleChange("barbers_count", e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-units" className="text-xs font-medium">
                      Qtd. de unidades
                    </Label>
                    <Input
                      id="lead-units"
                      type="number"
                      min={1}
                      max={999}
                      placeholder="Ex: 3"
                      value={form.units_count}
                      onChange={(e) => handleChange("units_count", e.target.value)}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                {/* Revenue */}
                <div className="space-y-1.5">
                  <Label htmlFor="lead-revenue" className="text-xs font-medium">
                    Faturamento mensal estimado
                  </Label>
                  <Select
                    value={form.monthly_revenue}
                    onValueChange={(v) => handleChange("monthly_revenue", v)}
                  >
                    <SelectTrigger id="lead-revenue" className="h-10 text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ate-20k">Até R$ 20.000</SelectItem>
                      <SelectItem value="20k-50k">R$ 20.000 – R$ 50.000</SelectItem>
                      <SelectItem value="50k-100k">R$ 50.000 – R$ 100.000</SelectItem>
                      <SelectItem value="100k-plus">Acima de R$ 100.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Challenge */}
                <div className="space-y-1.5">
                  <Label htmlFor="lead-challenge" className="text-xs font-medium">
                    Qual seu maior desafio?
                  </Label>
                  <Select
                    value={form.main_challenge}
                    onValueChange={(v) => handleChange("main_challenge", v)}
                  >
                    <SelectTrigger id="lead-challenge" className="h-10 text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {challenges.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={!isValid || loading}
                  className="w-full h-12 rounded-xl text-sm font-semibold mt-2 btn-glow"
                  variant="hero"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Quero falar com especialista
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </>
                  )}
                </Button>

                <p className="text-center text-[10px] text-muted-foreground">
                  Seus dados estão seguros. Sem spam, prometemos.
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-8 sm:p-10 text-center flex flex-col items-center"
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-2">Obrigado!</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs">
                Nossa equipe entrará em contato pelo WhatsApp em até 24h.
              </p>

              <div className="w-full space-y-3">
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-xl h-11 gap-2 text-sm border-primary/20 hover:bg-primary/5"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Falar direto no WhatsApp
                  </Button>
                </a>

                <Button
                  variant="ghost"
                  className="w-full rounded-xl h-10 text-xs text-muted-foreground"
                  onClick={() => handleClose(false)}
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
