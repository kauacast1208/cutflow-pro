import { useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import {
  Scissors, ArrowRight, ArrowLeft, Loader2, MapPin, Phone, Store,
  AlertCircle, CheckCircle2, Sparkles, Globe, DollarSign, Clock,
  UserPlus, Rocket, PartyPopper, Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { buildBarbershopInsert, getBarbershopErrorMessage, onboardingBarbershopSchema } from "@/lib/barbershop";
import { formatPhone } from "@/lib/format";
import { ensureCurrentUserSetup, isNoRowsError } from "@/lib/tenant";
import { Progress } from "@/components/ui/progress";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const STEPS = [
  { id: "account", label: "Conta criada", icon: CheckCircle2 },
  { id: "barbershop", label: "Sua barbearia", icon: Store },
  { id: "service", label: "Primeiro serviço", icon: Scissors },
  { id: "client", label: "Primeiro cliente", icon: UserPlus },
  { id: "ready", label: "Pronto!", icon: Rocket },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1); // 0=account(done), 1=barbershop, 2=service, 3=client, 4=ready
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Step 1: Barbershop
  const [barbershopName, setBarbershopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [createdBarbershopId, setCreatedBarbershopId] = useState<string | null>(null);

  // Step 2: Service
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("30");

  // Step 3: Client
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh, setBarbershop } = useTenant();
  const { toast } = useToast();

  const slug = useMemo(() => slugify(barbershopName), [barbershopName]);
  const progress = Math.round((currentStep / (STEPS.length - 1)) * 100);

  const clearError = useCallback(() => setFormError(null), []);

  // ── Step 1: Create barbershop ──
  const handleCreateBarbershop = async () => {
    if (!user) return;
    clearError();

    const parsed = onboardingBarbershopSchema.safeParse({
      name: barbershopName,
      phone,
      address,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || "Revise os campos.");
      return;
    }

    setLoading(true);
    try {
      await ensureCurrentUserSetup(user.user_metadata?.full_name || user.email?.split("@")[0] || null);

      let finalSlug = slugify(parsed.data.name) || `barbearia-${Math.random().toString(36).slice(2, 7)}`;
      const { data: existing } = await supabase
        .from("barbershops").select("id").eq("slug", finalSlug).limit(1).maybeSingle();
      if (existing) finalSlug = `${finalSlug}-${Math.random().toString(36).slice(2, 5)}`;

      const payload = buildBarbershopInsert(parsed.data, user.id, finalSlug);
      const { data: created, error } = await supabase
        .from("barbershops").insert(payload).select("*").maybeSingle();

      if (error) throw error;
      if (created) {
        setBarbershop(created);
        setCreatedBarbershopId(created.id);
      }
      await refresh();
      setCurrentStep(2);
    } catch (error) {
      const message = getBarbershopErrorMessage(error, "Não foi possível criar sua barbearia.");
      setFormError(message);
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Create first service ──
  const handleCreateService = async () => {
    if (!createdBarbershopId) return;
    if (!serviceName.trim()) {
      setFormError("Informe o nome do serviço.");
      return;
    }
    clearError();
    setLoading(true);
    try {
      const { error } = await supabase.from("services").insert({
        barbershop_id: createdBarbershopId,
        name: serviceName.trim(),
        price: parseFloat(servicePrice) || 0,
        duration_minutes: parseInt(serviceDuration) || 30,
        active: true,
      });
      if (error) throw error;
      setCurrentStep(3);
    } catch (error) {
      setFormError("Não foi possível criar o serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Create first client ──
  const handleCreateClient = async () => {
    if (!createdBarbershopId) return;
    if (!clientName.trim()) {
      setFormError("Informe o nome do cliente.");
      return;
    }
    clearError();
    setLoading(true);
    try {
      const { error } = await supabase.from("clients").insert({
        barbershop_id: createdBarbershopId,
        name: clientName.trim(),
        phone: clientPhone.trim() || null,
      });
      if (error) throw error;
      setCurrentStep(4);
    } catch (error) {
      setFormError("Não foi possível cadastrar o cliente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Skip handlers ──
  const skipToNext = () => {
    clearError();
    setCurrentStep((s) => Math.min(s + 1, 4));
  };

  const goToDashboard = () => navigate("/dashboard");

  // ── Step indicator component ──
  const StepIndicator = () => (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1 : 0.85,
                  backgroundColor: isDone
                    ? "hsl(var(--primary))"
                    : isActive
                      ? "hsl(var(--primary) / 0.15)"
                      : "hsl(var(--muted))",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                  isActive ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""
                }`}
              >
                {isDone ? (
                  <Check className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground/40"}`} />
                )}
              </motion.div>
              <span className={`text-[10px] font-medium mt-1.5 text-center leading-tight max-w-[60px] ${
                isDone ? "text-primary" : isActive ? "text-foreground" : "text-muted-foreground/40"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  );

  // ── Error banner ──
  const ErrorBanner = () =>
    formError ? (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-start gap-3 mb-6"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{formError}</span>
      </motion.div>
    ) : null;

  // ── Card wrapper ──
  const StepCard = ({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) => (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1.5">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl shadow-black/5">
        <AnimatePresence>
          <ErrorBanner />
        </AnimatePresence>
        {children}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.03] blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm shadow-primary/20">
            <Scissors className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">CutFlow</span>
        </div>

        <StepIndicator />

        <AnimatePresence mode="wait">
          {/* ─────────── STEP 1: Barbershop ─────────── */}
          {currentStep === 1 && (
            <StepCard title="Configure sua barbearia" subtitle="Informações básicas da sua página de agendamento">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nome da barbearia <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Barbearia Premium"
                    value={barbershopName}
                    onChange={(e) => { setBarbershopName(e.target.value); clearError(); }}
                    autoFocus
                    className="h-11"
                  />
                  {barbershopName.trim() && slug && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-muted-foreground/50 flex items-center gap-1">
                      <Globe className="h-3 w-3" /> cutflow.app/b/{slug}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-0000"
                    value={phone}
                    onChange={(e) => { setPhone(formatPhone(e.target.value)); clearError(); }}
                    className="h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-medium">Endereço</Label>
                  <Input
                    id="address"
                    placeholder="Rua das Palmeiras, 123 — Centro"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); clearError(); }}
                    className="h-11"
                  />
                </div>

                <Button
                  onClick={handleCreateBarbershop}
                  disabled={loading || !barbershopName.trim()}
                  className="w-full h-12 text-sm font-semibold rounded-xl gap-2 shadow-md shadow-primary/10"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Criando...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Criar minha barbearia <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </StepCard>
          )}

          {/* ─────────── STEP 2: Service ─────────── */}
          {currentStep === 2 && (
            <StepCard title="Adicione seu primeiro serviço" subtitle="Seus clientes verão isso ao agendar">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="svc-name" className="text-sm font-medium">
                    Nome do serviço <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="svc-name"
                    placeholder="Ex: Corte masculino"
                    value={serviceName}
                    onChange={(e) => { setServiceName(e.target.value); clearError(); }}
                    autoFocus
                    className="h-11"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="svc-price" className="text-sm font-medium flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> Preço (R$)
                    </Label>
                    <Input
                      id="svc-price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="45.00"
                      value={servicePrice}
                      onChange={(e) => setServicePrice(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="svc-dur" className="text-sm font-medium flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Duração (min)
                    </Label>
                    <Input
                      id="svc-dur"
                      type="number"
                      min="5"
                      step="5"
                      placeholder="30"
                      value={serviceDuration}
                      onChange={(e) => setServiceDuration(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={skipToNext}
                    className="flex-1 h-12 rounded-xl text-sm font-medium"
                  >
                    Pular por agora
                  </Button>
                  <Button
                    onClick={handleCreateService}
                    disabled={loading || !serviceName.trim()}
                    className="flex-1 h-12 rounded-xl text-sm font-semibold gap-2 shadow-md shadow-primary/10"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Salvar</>}
                  </Button>
                </div>
              </div>
            </StepCard>
          )}

          {/* ─────────── STEP 3: Client ─────────── */}
          {currentStep === 3 && (
            <StepCard title="Cadastre seu primeiro cliente" subtitle="Você pode importar mais clientes depois">
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="cli-name" className="text-sm font-medium">
                    Nome do cliente <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cli-name"
                    placeholder="Ex: João Silva"
                    value={clientName}
                    onChange={(e) => { setClientName(e.target.value); clearError(); }}
                    autoFocus
                    className="h-11"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cli-phone" className="text-sm font-medium">Telefone do cliente</Label>
                  <Input
                    id="cli-phone"
                    placeholder="(11) 99999-0000"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(formatPhone(e.target.value))}
                    className="h-11"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={skipToNext}
                    className="flex-1 h-12 rounded-xl text-sm font-medium"
                  >
                    Pular por agora
                  </Button>
                  <Button
                    onClick={handleCreateClient}
                    disabled={loading || !clientName.trim()}
                    className="flex-1 h-12 rounded-xl text-sm font-semibold gap-2 shadow-md shadow-primary/10"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Salvar</>}
                  </Button>
                </div>
              </div>
            </StepCard>
          )}

          {/* ─────────── STEP 4: Ready ─────────── */}
          {currentStep === 4 && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.15, stiffness: 180, damping: 14 }}
                className="mx-auto mb-6 relative"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.08, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-28 h-28 rounded-full bg-primary/20 blur-xl"
                  />
                </div>
                <div className="relative flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                    <PartyPopper className="h-7 w-7 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2"
              >
                Tudo pronto! 🎉
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-sm mb-8"
              >
                <span className="font-semibold text-foreground">{barbershopName}</span> está configurada e pronta para receber agendamentos.
              </motion.p>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 mb-8 text-left max-w-xs mx-auto space-y-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resumo da configuração</p>
                {[
                  { label: "Conta criada", done: true },
                  { label: "Barbearia configurada", done: true },
                  { label: "Serviço cadastrado", done: !!serviceName },
                  { label: "Cliente cadastrado", done: !!clientName },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border/60 shrink-0" />
                    )}
                    <span className={`text-sm ${item.done ? "text-foreground" : "text-muted-foreground/60"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  size="lg"
                  onClick={goToDashboard}
                  className="w-full max-w-xs h-12 text-sm font-semibold rounded-xl gap-2 shadow-md shadow-primary/10"
                >
                  Acessar meu painel <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
