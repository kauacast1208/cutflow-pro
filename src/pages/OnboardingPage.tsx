import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Scissors, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { getAuthenticatedUser, resolveUserFullName, upsertProfileForUser } from "@/lib/profile";
import { formatSupabaseError } from "@/lib/supabaseErrors";
import { bootstrapCurrentUserProfile } from "@/lib/tenant";
import OnboardingLogoUpload from "@/components/onboarding/OnboardingLogoUpload";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputClassName =
  "h-12 rounded-xl border-border/60 bg-background/80 text-base transition-[border-color,box-shadow,background-color] duration-200 focus-visible:ring-4 focus-visible:ring-primary/10 placeholder:text-muted-foreground/50";

type OnboardingStep = "bootstrap_user" | "create_barbershop" | "resolve_tenant" | "next_step";

const STEP_LABELS: Record<OnboardingStep, string> = {
  bootstrap_user: "Preparando perfil",
  create_barbershop: "Criando barbearia",
  resolve_tenant: "Ativando conta",
  next_step: "Abrindo dashboard",
};

export default function OnboardingPage() {
  const [barbershopName, setBarbershopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<OnboardingStep | null>(null);
  const [failedStep, setFailedStep] = useState<OnboardingStep | null>(null);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh } = useTenant();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setActiveStep(null);
    setFailedStep(null);
    setSubmitError("");

    const slug = `${slugify(barbershopName)}-${Math.random().toString(36).slice(2, 6)}`;

    const failStep = (step: OnboardingStep, message: string, error?: unknown) => {
      setActiveStep(step);
      setFailedStep(step);
      setSubmitError(message);
      console.error(`[Onboarding] step=${step} failed`, { userId: user.id, error, message });
      toast({ title: `Falha em ${STEP_LABELS[step]}`, description: message, variant: "destructive" });
      setLoading(false);
    };

    // Step 1: Bootstrap user profile
    try {
      setActiveStep("bootstrap_user");
      const authenticatedUser = await getAuthenticatedUser();
      const fullName = resolveUserFullName(authenticatedUser);
      await upsertProfileForUser(authenticatedUser, fullName);
    } catch (error) {
      failStep("bootstrap_user", error instanceof Error ? error.message : "Não foi possível preparar o perfil.", error);
      return;
    }

    // Step 2: Create barbershop
    setActiveStep("create_barbershop");
    const { data, error } = await supabase
      .from("barbershops")
      .insert({
        name: barbershopName,
        slug,
        owner_id: user.id,
        phone: phone || null,
        address: address || null,
        address_complement: addressComplement || null,
        logo_url: null,
      })
      .select("id, slug")
      .single();

    if (error) {
      failStep("create_barbershop", formatSupabaseError(error), error);
      return;
    }

    // Upload logo if we have a preview (data URL)
    if (logoPreview && data?.id && logoPreview.startsWith("data:")) {
      try {
        const blob = await fetch(logoPreview).then(r => r.blob());
        const ext = blob.type.split("/")[1] || "png";
        const path = `${data.id}/logo.${ext}`;
        await supabase.storage.from("logos").upload(path, blob, { upsert: true, contentType: blob.type });
        const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
        await supabase.from("barbershops").update({ logo_url: `${urlData.publicUrl}?t=${Date.now()}` }).eq("id", data.id);
      } catch (logoErr) {
        console.warn("[Onboarding] Logo upload skipped", logoErr);
      }
    }

    // Bootstrap role
    try {
      await bootstrapCurrentUserProfile(user.user_metadata?.full_name || user.email || null);
    } catch (setupErr) {
      console.warn("[Onboarding] bootstrapCurrentUserProfile warning:", setupErr);
    }

    // Step 3: Refresh tenant context and navigate
    setActiveStep("resolve_tenant");
    try {
      await refresh();
      setActiveStep("next_step");
      toast({ title: "Barbearia criada!", description: "Vamos configurar o restante." });
      navigate("/dashboard?setup=1", { replace: true });
    } catch (tenantError) {
      console.warn("[Onboarding] Tenant refresh failed, navigating anyway", tenantError);
      navigate("/dashboard?setup=1", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15">
            <Scissors className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>CutFlow</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Configure sua barbearia
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Preencha os dados básicos para começar. Você poderá ajustar tudo depois.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo Upload */}
            <OnboardingLogoUpload
              barbershopId={null}
              logoUrl={logoPreview}
              onLogoChange={setLogoPreview}
            />

            {/* Barbershop Name */}
            <div className="space-y-1.5">
              <Label htmlFor="barbershop-name" className="text-sm font-medium">
                Nome da barbearia <span className="text-destructive">*</span>
              </Label>
              <Input
                id="barbershop-name"
                name="organization"
                placeholder="Ex: Barbearia Premium"
                value={barbershopName}
                onChange={(e) => setBarbershopName(e.target.value)}
                required
                autoComplete="organization"
                autoCapitalize="words"
                className={inputClassName}
              />
              <p className="text-xs text-muted-foreground/70">Aparecerá no agendamento e no painel.</p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">Telefone / WhatsApp</Label>
              <Input
                id="phone"
                name="tel"
                placeholder="(11) 99999-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                inputMode="tel"
                className={inputClassName}
              />
              <p className="text-xs text-muted-foreground/70">Opcional. Editável nas configurações.</p>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium">Endereço</Label>
              <Input
                id="address"
                name="street-address"
                placeholder="Rua, número — Cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
                autoCapitalize="words"
                className={inputClassName}
              />
              <p className="text-xs text-muted-foreground/70">Ajuda clientes a encontrarem sua unidade.</p>
            </div>

            {/* Complement */}
            <div className="space-y-1.5">
              <Label htmlFor="complement" className="text-sm font-medium">Complemento</Label>
              <Input
                id="complement"
                name="address-line2"
                placeholder="Sala, bloco ou referência"
                value={addressComplement}
                onChange={(e) => setAddressComplement(e.target.value)}
                autoComplete="address-line2"
                autoCapitalize="words"
                className={inputClassName}
              />
            </div>

            {/* Status / Error */}
            <div className="min-h-[2.5rem] flex items-center text-sm">
              {failedStep ? (
                <p className="text-destructive">
                  Falha: {submitError}
                </p>
              ) : loading && activeStep ? (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {STEP_LABELS[activeStep]}...
                </p>
              ) : null}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-sm font-semibold"
              disabled={loading || !barbershopName.trim()}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-2" />
              )}
              Criar minha barbearia
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-4">
          Ao criar, você inicia um período de teste gratuito de 15 dias.
        </p>
      </div>
    </div>
  );
}
