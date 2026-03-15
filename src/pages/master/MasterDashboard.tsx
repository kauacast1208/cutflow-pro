import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, TrendingUp, AlertTriangle, DollarSign, Calendar } from "lucide-react";

interface Stats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  expiredTenants: number;
  totalProfessionals: number;
  totalClients: number;
  totalUsers: number;
  totalAppointments: number;
  estimatedMRR: number;
}

export default function MasterDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [barbershops, subscriptions, professionals, clients, profiles, appointments] = await Promise.all([
        supabase.from("barbershops").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("status, plan"),
        supabase.from("professionals").select("id", { count: "exact", head: true }),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }),
      ]);

      const subs = subscriptions.data || [];
      const activeSubs = subs.filter((s) => s.status === "active");

      // Estimate MRR from active subscriptions
      const planPrices: Record<string, number> = { starter: 79, pro: 129, premium: 189, franquias: 349 };
      const mrr = activeSubs.reduce((sum, s) => sum + (planPrices[s.plan] || 0), 0);

      setStats({
        totalTenants: barbershops.count || 0,
        activeTenants: activeSubs.length,
        trialTenants: subs.filter((s) => s.status === "trial").length,
        expiredTenants: subs.filter((s) => s.status === "expired" || s.status === "cancelled").length,
        totalProfessionals: professionals.count || 0,
        totalClients: clients.count || 0,
        totalUsers: profiles.count || 0,
        totalAppointments: appointments.count || 0,
        estimatedMRR: mrr,
      });
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;
  }

  const cards = [
    { title: "Total de Clientes", value: stats?.totalTenants, icon: Building2, color: "text-primary" },
    { title: "Contas Ativas", value: stats?.activeTenants, icon: TrendingUp, color: "text-emerald-600" },
    { title: "Em Trial", value: stats?.trialTenants, icon: AlertTriangle, color: "text-amber-600" },
    { title: "Expirados / Cancelados", value: stats?.expiredTenants, icon: AlertTriangle, color: "text-destructive" },
    { title: "MRR Estimado", value: `R$ ${(stats?.estimatedMRR || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-emerald-600", isString: true },
    { title: "Total Usuários", value: stats?.totalUsers, icon: Users, color: "text-primary" },
    { title: "Total Profissionais", value: stats?.totalProfessionals, icon: Users, color: "text-muted-foreground" },
    { title: "Total Agendamentos", value: stats?.totalAppointments, icon: Calendar, color: "text-primary" },
    { title: "Total Clientes (finais)", value: stats?.totalClients, icon: Users, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel Master</h1>
        <p className="text-muted-foreground text-sm">Visão global da plataforma CutFlow.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(card as any).isString ? card.value : (card.value ?? 0)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
