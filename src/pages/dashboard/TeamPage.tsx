import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Loader2, Mail, Shield, Clock } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  professional: "Barbeiro",
  receptionist: "Recepção",
};

const roleColors: Record<string, string> = {
  owner: "bg-primary/10 text-primary",
  admin: "bg-warning/10 text-warning",
  professional: "bg-accent text-accent-foreground",
  receptionist: "bg-secondary text-secondary-foreground",
};

export default function TeamPage() {
  const { barbershop } = useBarbershop();
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  const [invites, setInvites] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("professional");
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!barbershop) return;
    setLoading(true);

    const [invRes, proRes] = await Promise.all([
      supabase.from("team_invites").select("*").eq("barbershop_id", barbershop.id).order("created_at", { ascending: false }),
      supabase.from("professionals").select("*").eq("barbershop_id", barbershop.id).order("name"),
    ]);

    setInvites(invRes.data || []);
    setProfessionals(proRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [barbershop]);

  const handleInvite = async () => {
    if (!barbershop || !user || !email) return;
    setSending(true);

    const { error } = await supabase.from("team_invites").insert({
      barbershop_id: barbershop.id,
      email: email.toLowerCase().trim(),
      role: inviteRole as any,
      invited_by: user.id,
    });

    if (error) {
      toast({
        title: "Erro ao convidar",
        description: error.message.includes("duplicate") ? "Este e-mail já foi convidado." : error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Convite enviado!", description: `${email} foi convidado como ${roleLabels[inviteRole]}.` });
      setEmail("");
      setDialogOpen(false);
      await load();
    }
    setSending(false);
  };

  const handleDeleteInvite = async (id: string) => {
    await supabase.from("team_invites").delete().eq("id", id);
    toast({ title: "Convite removido." });
    await load();
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold text-lg mb-1">Acesso restrito</h3>
          <p className="text-sm text-muted-foreground">Apenas administradores podem gerenciar a equipe.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Equipe</h2>
          <p className="text-muted-foreground text-sm">Gerencie os membros da sua barbearia</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Convidar membro
        </Button>
      </div>

      {/* Current professionals with linked accounts */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <h3 className="font-medium text-sm">Profissionais ativos</h3>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : professionals.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhum profissional cadastrado.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {professionals.map((pro) => (
              <div key={pro.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {pro.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{pro.name}</p>
                    <p className="text-xs text-muted-foreground">{pro.role || "Barbeiro"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pro.user_id ? (
                    <Badge variant="secondary" className="text-xs">Conta vinculada</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Sem conta</Badge>
                  )}
                  <Badge className={`text-xs ${pro.active ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                    {pro.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending invites */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <h3 className="font-medium text-sm">Convites pendentes</h3>
        </div>
        {invites.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Nenhum convite pendente.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{inv.email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">{roleLabels[inv.role] || inv.role}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {inv.status === "pending" ? "Pendente" : inv.status === "accepted" ? "Aceito" : inv.status}
                      </span>
                    </div>
                  </div>
                </div>
                {inv.status === "pending" && (
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteInvite(inv.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar membro da equipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="barbeiro@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Barbeiro — vê apenas sua agenda</SelectItem>
                  <SelectItem value="receptionist">Recepção — vê agenda completa, cria agendamentos</SelectItem>
                  <SelectItem value="admin">Administrador — acesso total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleInvite} disabled={!email || sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
