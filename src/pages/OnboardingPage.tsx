import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Scissors, ArrowRight, Loader2, Sparkles, MapPin, Phone, Store, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh } = useTenant();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = barbershopName.trim();
    if (!user || !trimmedName) return;
    setLoading(true);

    try {
      let slug = slugify(trimmedName);
      if (!slug) {
        slug = "barbearia-" + Math.random().toString(36).slice(2, 7);
      }

      const { data: existing } = await supabase
        .from("barbershops")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (existing) {
        slug = slug + "-" + Math.random().toString(36).slice(2, 5);
      }

      const { error } = await supabase.from("barbershops").insert({
        owner_id: user.id,
        name: trimmedName,
        slug,
        phone: phone.trim() || null,
        address: address.trim() || null,
        address_complement: addressComplement.trim() || null,
      });

      if (error) {
        toast({ title: "Erro ao criar barbearia", description: error.message, variant: "destructive" });
        return;
      }

      await refresh();
      toast({ title: "Barbearia criada!", description: "Sua barbearia está pronta para uso." });
      navigate("/dashboard");
    } catch (err) {
      toast({ title: "Erro inesperado", description: "Tente novamente em instantes.", variant: "destructive" });
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome da barbearia *</Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  placeholder="Ex: Barbearia Premium"
                  value={barbershopName}
                  onChange={(e) => setBarbershopName(e.target.value)}
                  required
                  className="pl-9 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                />
              </div>
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
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  className="pl-9 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                />
              </div>
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
                  onChange={(e) => setAddress(e.target.value)}
                  autoComplete="street-address"
                  className="pl-9 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                />
              </div>
              <p className="text-[11px] text-muted-foreground/60 leading-tight">
                Seu endereço aparece na página de agendamento.
              </p>
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
                  onChange={(e) => setAddressComplement(e.target.value)}
                  className="pl-9 transition-shadow focus-visible:ring-primary/40 focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)]"
                />
              </div>
            </div>

            <motion.div
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Button
                type="submit"
                className="w-full mt-2 h-11 text-sm font-semibold btn-glow"
                disabled={loading || !barbershopName.trim()}
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