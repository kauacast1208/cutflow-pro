import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Scissors, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const slug = slugify(barbershopName) + "-" + Math.random().toString(36).slice(2, 6);

    const { error } = await supabase.from("barbershops").insert({
      owner_id: user.id,
      name: barbershopName,
      slug,
      phone,
      address,
      address_complement: addressComplement || null,
    });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Barbearia criada!", description: "Sua barbearia está pronta para uso." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da barbearia *</Label>
              <Input
                id="name"
                placeholder="Ex: Barbearia Premium"
                value={barbershopName}
                onChange={(e) => setBarbershopName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Rua, número - Cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complement">Complemento (opcional)</Label>
              <Input
                id="complement"
                placeholder="Apartamento, sala, bloco ou referência"
                value={addressComplement}
                onChange={(e) => setAddressComplement(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading || !barbershopName.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Criar minha barbearia
              {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
