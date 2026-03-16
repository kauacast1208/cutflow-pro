import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  Scissors, ArrowRight, Loader2, MapPin, Phone, Store, Building2,
  AlertCircle, CheckCircle2, Shield, Zap, Calendar,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { buildBarbershopInsert, getBarbershopErrorMessage, onboardingBarbershopSchema } from "@/lib/barbershop";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const VALUE_PROPS = [
  { icon: Calendar, text: "Agendamento online 24h" },
  { icon: Zap, text: "Lembretes automáticos" },
  { icon: Shield, text: "Dados protegidos" },
];

export default function OnboardingPage() {
  const [barbershopName, setBarbershopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "phone" | "address" | "addressComplement", string>>>({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh } = useTenant();
  const { toast } = useToast();

  const isSubmitDisabled = useMemo(() => loading || !barbershopName.trim(), [loading, barbershopName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormError(null);
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
      let slug = slugify(parsed.data.name);
      if (!slug) {
        slug = `barbearia-${Math.random().toString(36).slice(2, 7)}`;
      }

      const { data: existing, error: existingError } = await supabase
        .from("barbershops")
        .select("id")
        .eq("slug", slug)
        .limit(1)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
      }

      const payload = buildBarbershopInsert(parsed.data, user.id, slug);
      const { error } = await supabase.from("barbershops").insert(payload);

      if (error) throw error;

      await refresh();
      setSuccess(true);

      // Navigate after showing success briefly
      setTimeout(() => {
        navigate("/dashboard");
      }, 2200);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          /* ──── Success State ──── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
                <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2"
            >
              Tudo pronto!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm mb-6"
            >
              <span className="font-semibold text-foreground">{barbershopName}</span> foi criada com sucesso.
              <br />
              Agora vamos configurar seus serviços e profissionais.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
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
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
                  <Scissors className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold tracking-tight">CutFlow</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                Configure sua barbearia
              </h1>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                Preencha as informações básicas para começar a receber agendamentos online.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-lg)]">
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
                <fieldset className="space-y-4">
                  <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Informações do negócio
                  </legend>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nome da barbearia <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
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
                        className="pl-9 h-11 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                      />
                    </div>
                    {fieldErrors.name ? (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {fieldErrors.name}
                      </p>
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
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                      <Input
                        id="phone"
                        placeholder="(11) 99999-0000"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          clearFieldError("phone");
                        }}
                        autoComplete="tel"
                        aria-invalid={!!fieldErrors.phone}
                        className="pl-9 h-11 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                </fieldset>

                {/* Divider */}
                <div className="border-t border-border/50" />

                {/* ── Section: Localização ── */}
                <fieldset className="space-y-4">
                  <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Localização
                  </legend>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Endereço
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
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
                        className="pl-9 h-11 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                      />
                    </div>
                    {fieldErrors.address ? (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {fieldErrors.address}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground/50">
                        Seus clientes verão essa informação ao agendar
                      </p>
                    )}
                  </div>

                  {/* Complement */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <Label htmlFor="complement" className="text-sm font-medium">
                        Complemento
                      </Label>
                      <span className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-wide">
                        opcional
                      </span>
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                      <Input
                        id="complement"
                        placeholder="Sala 12, 2º andar"
                        value={addressComplement}
                        onChange={(e) => {
                          setAddressComplement(e.target.value);
                          clearFieldError("addressComplement");
                        }}
                        aria-invalid={!!fieldErrors.addressComplement}
                        className="pl-9 h-11 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                      />
                    </div>
                    {fieldErrors.addressComplement && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {fieldErrors.addressComplement}
                      </p>
                    )}
                  </div>
                </fieldset>

                {/* Submit */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="pt-1"
                >
                  <Button
                    type="submit"
                    className="w-full h-12 text-sm font-semibold rounded-xl gap-2 shadow-sm"
                    disabled={isSubmitDisabled}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Criando sua barbearia...
                      </>
                    ) : (
                      <>
                        Criar minha barbearia
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>

            {/* Value props */}
            <div className="mt-6 flex items-center justify-center gap-5 sm:gap-6">
              {VALUE_PROPS.map((prop) => (
                <div key={prop.text} className="flex items-center gap-1.5 text-muted-foreground/50">
                  <prop.icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-medium">{prop.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
