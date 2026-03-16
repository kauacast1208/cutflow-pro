import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Scissors, ArrowRight, Loader2, Sparkles, MapPin, Phone, Store, Building2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { buildBarbershopInsert, getBarbershopErrorMessage, onboardingBarbershopSchema } from "@/lib/barbershop";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function OnboardingPage() {
  const [barbershopName, setBarbershopName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [loading, setLoading] = useState(false);
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

      if (existingError) {
        throw existingError;
      }

      if (existing) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;
      }

      const payload = buildBarbershopInsert(parsed.data, user.id, slug);
      const { error } = await supabase.from("barbershops").insert(payload);

      if (error) {
        throw error;
      }

      await refresh();
      toast({ title: "Barbearia criada!", description: "Sua barbearia está pronta para uso." });
      navigate("/dashboard");
    } catch (error) {
      const message = getBarbershopErrorMessage(error, "Não foi possível criar sua barbearia agora.");
      setFormError(message);
      toast({ title: "Erro ao criar barbearia", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg"
      >
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
            Vamos configurar sua barbearia em poucos segundos.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {formError && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da barbearia *</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  placeholder="Ex: Barbearia Premium"
                  value={barbershopName}
                  onChange={(e) => {
                    setBarbershopName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  required
                  aria-invalid={!!fieldErrors.name}
                  className="pl-9 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                />
              </div>
              {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  placeholder="(11) 99999-0000"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  autoComplete="tel"
                  aria-invalid={!!fieldErrors.phone}
                  className="pl-9 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                />
              </div>
              {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="address"
                  placeholder="Rua, número - Cidade"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }));
                  }}
                  autoComplete="street-address"
                  aria-invalid={!!fieldErrors.address}
                  className="pl-9 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                />
              </div>
              <p className="text-[11px] text-muted-foreground/60 leading-tight">
                Seu endereço aparece na página de agendamento.
              </p>
              {fieldErrors.address && <p className="text-xs text-destructive">{fieldErrors.address}</p>}
            </div>

            {/* Complement */}
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento (opcional)</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="complement"
                  placeholder="Apartamento, sala, bloco ou referência"
                  value={addressComplement}
                  onChange={(e) => {
                    setAddressComplement(e.target.value);
                    if (fieldErrors.addressComplement) setFieldErrors((prev) => ({ ...prev, addressComplement: undefined }));
                  }}
                  aria-invalid={!!fieldErrors.addressComplement}
                  className="pl-9 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                />
              </div>
              {fieldErrors.addressComplement && <p className="text-xs text-destructive">{fieldErrors.addressComplement}</p>}
            </div>

            <motion.div
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Button
                type="submit"
                className="w-full mt-2 h-11 text-sm font-semibold btn-glow"
                disabled={isSubmitDisabled}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  <>
                    Criar minha barbearia
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}