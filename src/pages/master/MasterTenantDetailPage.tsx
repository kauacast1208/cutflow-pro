import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Users, Scissors, Calendar, ExternalLink } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const statusLabels: Record<string, string> = {
  active: "Ativo", trial: "Trial", expired: "Expirado", cancelled: "Cancelado", past_due: "Inadimplente",
};
const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  trial: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  past_due: "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

export default function MasterTenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [barbershop, setBarbershop] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({ professionals: 0, clients: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      const [shopRes, subRes, proRes, clientRes, apptRes] = await Promise.all([
        supabase.from("barbershops").select("*").eq("id", tenantId).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("barbershop_id", tenantId).maybeSingle(),
        supabase.from("professionals").select("id", { count: "exact", head: true }).eq("barbershop_id", tenantId).eq("is_active", true),
        supabase.from("clients").select("id", { count: "exact", head: true }).eq("barbershop_id", tenantId),
        supabase.from("appointments").select("id", { count: "exact", head: true }).eq("barbershop_id", tenantId),
      ]);
      setBarbershop(shopRes.data);
      setSubscription(subRes.data);
      setStats({ professionals: proRes.count || 0, clients: clientRes.count || 0, appointments: apptRes.count || 0 });
      setLoading(false);
    }
    load();
  }, [tenantId]);

  const updatePlan = async (newPlan: string) => {
    if (!subscription) return;
    const { error } = await supabase
      .from("subscriptions")
      .update({ plan: newPlan as any })
      .eq("id", subscription.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setSubscription({ ...subscription, plan: newPlan });
      toast({ title: "Plano atualizado", description: `Plano alterado para ${newPlan}.` });
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!subscription) return;
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: newStatus as any })
      .eq("id", subscription.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      setSubscription({ ...subscription, status: newStatus });
      toast({ title: "Status atualizado", description: `Status alterado para ${newStatus}.` });
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  if (!barbershop) return <div className="text-center py-12 text-muted-foreground">Tenant não encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/master/tenants")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{barbershop.name}</h1>
          <p className="text-muted-foreground text-sm font-mono">{barbershop.slug}</p>
        </div>
        <Badge variant="outline" className={`ml-auto ${statusColors[subscription?.status] || ""}`}>
          {statusLabels[subscription?.status] || subscription?.status || "—"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profissionais</CardTitle>
            <Scissors className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.professionals}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.clients}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.appointments}</div></CardContent>
        </Card>
      </div>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assinatura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Plano</label>
              <Select value={subscription?.plan || ""} onValueChange={updatePlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="franquias">Franquias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Select value={subscription?.status || ""} onValueChange={updateStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="past_due">Inadimplente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {subscription?.trial_ends_at && (
            <p className="text-xs text-muted-foreground">
              Trial expira em: {new Date(subscription.trial_ends_at).toLocaleDateString("pt-BR")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Telefone</span><span>{barbershop.phone || "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp</span><span>{barbershop.whatsapp || "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Endereço</span><span>{barbershop.address || "—"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Horário</span><span>{barbershop.opening_time} - {barbershop.closing_time}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Criado em</span><span>{new Date(barbershop.created_at).toLocaleDateString("pt-BR")}</span></div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Página de agendamento</span>
            <a href={`/b/${barbershop.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
              /b/{barbershop.slug} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
