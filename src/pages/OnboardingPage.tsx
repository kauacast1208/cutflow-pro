import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Scissors, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getAuthenticatedUser, resolveUserFullName, upsertProfileForUser } from "@/lib/profile";
import { formatSupabaseError } from "@/lib/supabaseErrors";
import { resolveTenantContextDirect } from "@/lib/tenant";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputClassName =
  "h-12 rounded-xl border-border/70 bg-background/80 transition-[border-color,box-shadow,background-color] duration-200 focus-visible:ring-4 focus-visible:ring-primary/10";

const TENANT_RESOLUTION_RETRIES = 6;
const TENANT_RESOLUTION_DELAY_MS = 400;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

type OnboardingStep = "bootstrap_user" | "create_barbershop" | "resolve_tenant" | "next_step";

const STEP_LABELS: Record<OnboardingStep, string> = {
  bootstrap_user: "Preparando perfil",
  create_barbershop: "Criando barbearia",
  resolve_tenant: "Ativando tenant",
  next_step: "Abrindo dashboard",
};

export default function OnboardingPage() {
  const [barbershopName, setBarbershopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<OnboardingStep | null>(null);
  const [failedStep, setFailedStep] = useState<OnboardingStep | null>(null);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    setLoading(true);
    setActiveStep(null);
    setFailedStep(null);
    setSubmitError("");

    const slug = `${slugify(barbershopName)}-${Math.random().toString(36).slice(2, 6)}`;
    const failStep = (step: OnboardingStep, message: string, error?: unknown) => {
      setActiveStep(step);
      setFailedStep(step);
      setSubmitError(message);
      console.error(`[Onboarding] step=${step} failed`, {
        userId: user.id,
        error,
        message,
      });
      toast({
        title: `Falha em ${STEP_LABELS[step]}`,
        description: message,
        variant: "destructive",
      });
      setLoading(false);
    };

    console.info("[Onboarding] Starting first-tenant creation", {
      userId: user.id,
      slug,
      hasPhone: Boolean(phone),
      hasAddress: Boolean(address),
    });

    try {
      setActiveStep("bootstrap_user");
      console.info("[Onboarding] step=bootstrap_user start", {
        userId: user.id,
      });

      const authenticatedUser = await getAuthenticatedUser();
      const fullName = resolveUserFullName(authenticatedUser);

      await upsertProfileForUser(authenticatedUser, fullName);

      console.info("[Onboarding] step=bootstrap_user complete", {
        userId: authenticatedUser.id,
        hasFullName: Boolean(fullName),
      });
    } catch (error) {
      failStep("bootstrap_user", error instanceof Error ? error.message : "Nao foi possivel preparar o perfil do usuario.", error);
      return;
    }

    setActiveStep("create_barbershop");
    console.info("[Onboarding] step=create_barbershop start", {
      userId: user.id,
      slug,
    });

    const { data, error } = await supabase.rpc("create_initial_barbershop", {
      _address: address || null,
      _address_complement: addressComplement || null,
      _name: barbershopName,
      _phone: phone || null,
      _slug: slug,
    });

    if (error) {
      const description = formatSupabaseError(error);
      failStep("create_barbershop", description, error);
      return;
    }

    console.info("[Onboarding] step=create_barbershop complete", {
      userId: user.id,
      barbershopId: data?.id ?? null,
      returnedSlug: data?.slug ?? slug,
    });

    for (let attempt = 1; attempt <= TENANT_RESOLUTION_RETRIES; attempt += 1) {
      setActiveStep("resolve_tenant");
      console.info("[Onboarding] step=resolve_tenant start", {
        userId: user.id,
        attempt,
      });

      try {
        const tenant = await resolveTenantContextDirect(user.id);

        if (tenant.barbershopId && !tenant.onboardingRequired) {
          console.info("[Onboarding] step=resolve_tenant complete", {
            userId: user.id,
            barbershopId: tenant.barbershopId,
            subscriptionStatus: tenant.subscription?.status ?? null,
          });

          setActiveStep("next_step");
          console.info("[Onboarding] step=next_step complete", {
            userId: user.id,
            destination: "/dashboard?setup=1",
            barbershopId: tenant.barbershopId,
          });
          toast({ title: "Barbearia criada!", description: "Agora vamos concluir a configuracao inicial." });
          navigate("/dashboard?setup=1");
          return;
        }
      } catch (tenantError) {
        console.error("[Onboarding] step=resolve_tenant retry_error", {
          userId: user.id,
          attempt,
          error: tenantError,
        });
      }

      if (attempt < TENANT_RESOLUTION_RETRIES) {
        await wait(TENANT_RESOLUTION_DELAY_MS);
      }
    }

    const verificationMessage =
      "A barbearia foi criada, mas o tenant nao ficou ativo para este usuario apos a criacao inicial.";

    failStep("resolve_tenant", verificationMessage, {
      createdBarbershopId: data?.id ?? null,
    });
    return;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scissors className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold">CutFlow</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Bem-vindo ao CutFlow!</h1>
          <p className="text-muted-foreground">
            Crie sua barbearia primeiro. O restante pode ser configurado em seguida.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-card min-h-[580px]">
          <div className="min-h-[68px] mb-6">
            <h2 className="text-lg font-semibold">Dados da sua barbearia</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Este passo cria seu tenant, ativa o contexto da conta e inicia seu periodo de trial.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="barbershop-name">Nome da barbearia *</Label>
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
              <div className="min-h-5 text-xs text-muted-foreground">
                Esse nome aparecera no agendamento e no dashboard.
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
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
              <div className="min-h-5 text-xs text-muted-foreground">
                Opcional agora. Voce pode editar depois nas configuracoes.
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereco</Label>
              <Input
                id="address"
                name="street-address"
                placeholder="Rua, numero - Cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoComplete="street-address"
                autoCapitalize="words"
                className={inputClassName}
              />
              <div className="min-h-5 text-xs text-muted-foreground">
                Ajuda seus clientes a encontrarem sua unidade.
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complement">Complemento (opcional)</Label>
              <Input
                id="complement"
                name="address-line2"
                placeholder="Apartamento, sala, bloco ou referencia"
                value={addressComplement}
                onChange={(e) => setAddressComplement(e.target.value)}
                autoComplete="address-line2"
                autoCapitalize="words"
                className={inputClassName}
              />
              <div className="min-h-5 text-xs text-muted-foreground">
                Campo opcional para detalhes de localizacao.
              </div>
            </div>

            <div className="min-h-12 rounded-xl border border-transparent px-1 py-2 text-sm">
              {failedStep ? (
                <p className="text-destructive">
                  Falha em {STEP_LABELS[failedStep]}: {submitError}
                </p>
              ) : loading && activeStep ? (
                <p className="text-muted-foreground">Etapa atual: {STEP_LABELS[activeStep]}.</p>
              ) : submitError ? (
                <p className="text-destructive">{submitError}</p>
              ) : (
                <p className="text-muted-foreground">
                  Depois da criacao, voce podera adicionar seu primeiro barbeiro e seu primeiro servico.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading || !barbershopName.trim()}>
              <span className="inline-flex min-w-0 items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>Criar minha barbearia</span>
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
