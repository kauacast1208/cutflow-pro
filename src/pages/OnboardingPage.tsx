import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  Scissors, ArrowRight, Loader2, MapPin, Phone, Store, Building2,
  AlertCircle, CheckCircle2, Shield, Zap, Calendar, Sparkles, Users, Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { buildBarbershopInsert, getBarbershopErrorMessage, onboardingBarbershopSchema } from "@/lib/barbershop";
import { formatPhone } from "@/lib/format";
import { ensureCurrentUserSetup, isNoRowsError } from "@/lib/tenant";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const STEPS = [
  { label: "Criar conta", done: true },
  { label: "Configurar barbearia", done: false, active: true },
  { label: "Pronto para usar", done: false },
];

const TRUST_ITEMS = [
  { icon: Calendar, label: "Agendamento online 24h" },
  { icon: Users, label: "Gestão de clientes" },
  { icon: Zap, label: "Lembretes automáticos" },
  { icon: Shield, label: "Dados protegidos" },
];

export default function OnboardingPage() {
  const [barbershopName, setBarbershopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [technicalError, setTechnicalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "phone" | "address" | "addressComplement", string>>>({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh, setBarbershop } = useTenant();
  const { toast } = useToast();

  const isSubmitDisabled = useMemo(() => loading || !barbershopName.trim(), [loading, barbershopName]);
  const slug = useMemo(() => slugify(barbershopName), [barbershopName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormError(null);
    setTechnicalError(null);
    setFieldErrors({});

    const parsed = onboardingBarbershopSchema.safeParse({
      name: barbershopName,
      phone,
      address,
      addressComplement,
    });

    if (!parsed.success) {
      const nextErrors: Partial<Record<"name" | "phone" | "address" | "addressComplement", string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof typeof nextErrors;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      setFormError("Revise os campos destacados antes de continuar.");
      return;
    }

    setLoading(true);

    try {
      await ensureCurrentUserSetup(user.user_metadata?.full_name || user.email?.split("@")[0] || null);

      let finalSlug = slugify(parsed.data.name);
      if (!finalSlug) {
        finalSlug = `barbearia-${Math.random().toString(36).slice(2, 7)}`;
      }

      const { data: existing, error: existingError } = await supabase
        .from("barbershops")
        .select("id")
        .eq("slug", finalSlug)
        .limit(1)
        .maybeSingle();

      if (existingError && !isNoRowsError(existingError)) throw existingError;

      if (existing) {
        finalSlug = `${finalSlug}-${Math.random().toString(36).slice(2, 5)}`;
      }

      const payload = buildBarbershopInsert(parsed.data, user.id, finalSlug);
      const { data: createdBarbershop, error } = await supabase
        .from("barbershops")
        .insert(payload)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      if (createdBarbershop) {
        setBarbershop(createdBarbershop);
      }

      await refresh();
      setSuccess(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
    } catch (error) {
      const message = getBarbershopErrorMessage(error, "Não foi possível criar sua barbearia agora.");
      setFormError(message);
      toast({ title: "Erro ao criar barbearia", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative atmosphere">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/[0.04] blur-[120px]" />
        <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[hsl(265_45%_55%/0.03)] blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          /* ──── Success State ──── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md text-center relative z-10"
          >
            {/* Animated glow ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 180, damping: 14 }}
              className="mx-auto mb-8 relative"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 rounded-full bg-primary/20 blur-xl"
                />
              </div>
              <div className="relative flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                  <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3"
            >
              Tudo pronto!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm leading-relaxed mb-2"
            >
              <span className="font-semibold text-foreground">{barbershopName}</span> foi criada com sucesso.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground/60 text-sm mb-8"
            >
              Próximo passo: configurar seus serviços e profissionais.
            </motion.p>

            {/* Success checklist preview */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 mb-8 text-left max-w-xs mx-auto"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Próximos passos</p>
              <div className="space-y-2.5">
                {["Adicionar serviços", "Cadastrar profissionais", "Definir horários"].map((step, i) => (
                  <div key={step} className="flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border/60 text-muted-foreground/40">
                      <span className="text-[10px] font-medium">{i + 1}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground/50"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Preparando seu painel...
            </motion.div>
          </motion.div>
        ) : (
          /* ──── Form State ──── */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg relative z-10"
          >
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                      step.done
                        ? "bg-primary text-primary-foreground"
                        : step.active
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground/40"
                    }`}>
                      {step.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline ${
                      step.active ? "text-foreground" : step.done ? "text-muted-foreground" : "text-muted-foreground/40"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 sm:w-12 h-px ${step.done ? "bg-primary/40" : "bg-border/50"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/20">
                  <Scissors className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight">CutFlow</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                Configure sua barbearia
              </h1>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                Essas informações serão exibidas na sua página de agendamento. Você pode alterar tudo depois.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl shadow-black/5">
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Error banner */}
                <AnimatePresence>
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Section: Informações do negócio ── */}
                <fieldset className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary/60" />
                    <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Informações do negócio
                    </legend>
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nome da barbearia <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Barbearia Premium"
                      value={barbershopName}
                      onChange={(e) => {
                        setBarbershopName(e.target.value);
                        clearFieldError("name");
                      }}
                      required
                      autoFocus
                      autoComplete="organization"
                      aria-invalid={!!fieldErrors.name}
                      className={`h-11 transition-all focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] ${
                        fieldErrors.name ? "border-destructive/50" : ""
                      }`}
                    />
                    {fieldErrors.name ? (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {fieldErrors.name}
                      </p>
                    ) : barbershopName.trim() && slug ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[11px] text-muted-foreground/50 flex items-center gap-1"
                      >
                        <Globe className="h-3 w-3" />
                        cutflow.app/b/{slug}
                      </motion.p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/50">
                        Será exibido na sua página de agendamento
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Telefone de contato
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(11) 99999-0000"
                      value={phone}
                      onChange={(e) => {
                        setPhone(formatPhone(e.target.value));
                        clearFieldError("phone");
                      }}
                      autoComplete="tel"
                      aria-invalid={!!fieldErrors.phone}
                      className={`h-11 transition-all focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] ${
                        fieldErrors.phone ? "border-destructive/50" : ""
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </fieldset>

                {/* Divider */}
                <div className="border-t border-border/40" />

                {/* ── Section: Localização ── */}
                <fieldset className="space-y-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary/60" />
                    <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Localização
                    </legend>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Endereço
                    </Label>
                    <Input
                      id="address"
                      placeholder="Rua das Palmeiras, 123 — Centro, São Paulo"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        clearFieldError("address");
                      }}
                      autoComplete="street-address"
                      aria-invalid={!!fieldErrors.address}
                      className={`h-11 transition-all focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] ${
                        fieldErrors.address ? "border-destructive/50" : ""
                      }`}
                    />
                    {fieldErrors.address ? (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {fieldErrors.address}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/50">
                        Seus clientes verão isso ao agendar
                      </p>
                    )}
                  </div>

                  {/* Complement */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <Label htmlFor="complement" className="text-sm font-medium">
                        Complemento
                      </Label>
                      <span className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-wide rounded-full bg-muted/50 px-2 py-0.5">
                        opcional
                      </span>
                    </div>
                    <Input
                      id="complement"
                      placeholder="Sala 12, 2º andar, Bloco B"
                      value={addressComplement}
                      onChange={(e) => {
                        setAddressComplement(e.target.value);
                        clearFieldError("addressComplement");
                      }}
                      aria-invalid={!!fieldErrors.addressComplement}
                      className={`h-11 transition-all focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)] ${
                        fieldErrors.addressComplement ? "border-destructive/50" : ""
                      }`}
                    />
                    {fieldErrors.addressComplement && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {fieldErrors.addressComplement}
                      </p>
                    )}
                  </div>
                </fieldset>

                {/* Submit */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 text-sm font-semibold rounded-xl gap-2 shadow-md shadow-primary/10 transition-all hover:shadow-lg hover:shadow-primary/15"
                    disabled={isSubmitDisabled}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Criando sua barbearia...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Criar minha barbearia
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-muted-foreground/40 text-center mt-3">
                    Leva menos de 30 segundos. Você pode editar tudo depois.
                  </p>
                </div>
              </form>
            </div>

            {/* Trust bar */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRUST_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/40 backdrop-blur-sm px-3 py-2.5"
                >
                  <item.icon className="h-3.5 w-3.5 text-primary/50 shrink-0" />
                  <span className="text-[11px] font-medium text-muted-foreground/60 leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
