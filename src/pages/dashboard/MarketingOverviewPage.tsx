import { useState, useEffect, useMemo } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserX, Cake, Megaphone, Send, TrendingUp, ArrowRight,
  Zap, Gift, BarChart3, Loader2,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export default function MarketingOverviewPage() {
  const { barbershop } = useBarbershop();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!barbershop) return;
    const now = new Date();
    const thirtyDaysAgo = format(subDays(now, 30), "yyyy-MM-dd");

    Promise.all([
      supabase.from("clients").select("*").eq("barbershop_id", barbershop.id),
      supabase.from("appointments").select("client_name, client_email, client_phone, date, status")
        .eq("barbershop_id", barbershop.id).neq("status", "cancelled"),
      supabase.from("campaigns").select("*").eq("barbershop_id", barbershop.id),
      supabase.from("notifications").select("id, status, type, created_at")
        .eq("barbershop_id", barbershop.id),
    ]).then(([cRes, aRes, campRes, notRes]) => {
      setClients(cRes.data || []);
      setAppointments(aRes.data || []);
      setCampaigns(campRes.data || []);
      setNotifications(notRes.data || []);
      setLoading(false);
    });
  }, [barbershop]);

  const inactiveCount = useMemo(() => {
    const clientLastVisit = new Map<string, string>();
    appointments.forEach((a) => {
      const key = (a.client_email || a.client_phone || a.client_name).toLowerCase();
      const existing = clientLastVisit.get(key);
      if (!existing || a.date > existing) clientLastVisit.set(key, a.date);
    });
    return clients.filter((c) => {
      const key = (c.email || c.phone || c.name).toLowerCase();
      const lastDate = clientLastVisit.get(key);
      if (!lastDate) return true;
      const days = Math.floor((Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 30;
    }).length;
  }, [clients, appointments]);

  const birthdayCount = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    return clients.filter((c) => {
      if (!c.birth_date) return false;
      const d = new Date(c.birth_date);
      return d.getMonth() + 1 === month;
    }).length;
  }, [clients]);

  const activeCampaigns = campaigns.filter((c) => c.status === "scheduled" || c.status === "sent").length;
  const messagesSent = notifications.filter((n) => n.status === "sent").length;
  const messagesPending = notifications.filter((n) => n.status === "pending").length;

  // Return rate: clients with 2+ appointments / total clients
  const returnRate = useMemo(() => {
    if (clients.length === 0) return 0;
    const visitCount = new Map<string, number>();
    appointments.forEach((a) => {
      const key = (a.client_email || a.client_phone || a.client_name).toLowerCase();
      visitCount.set(key, (visitCount.get(key) || 0) + 1);
    });
    const returning = Array.from(visitCount.values()).filter((v) => v >= 2).length;
    return Math.round((returning / clients.length) * 100);
  }, [clients, appointments]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const cards = [
    {
      title: "Clientes inativos",
      value: String(inactiveCount),
      subtitle: "Sem visita há 30+ dias",
      icon: UserX,
      color: "text-warning",
      bg: "bg-warning/10",
      action: () => navigate("/dashboard/inactive-clients"),
    },
    {
      title: "Aniversariantes do mês",
      value: String(birthdayCount),
      subtitle: "Com data de nascimento cadastrada",
      icon: Cake,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      action: () => navigate("/dashboard/birthdays"),
    },
    {
      title: "Campanhas ativas",
      value: String(activeCampaigns),
      subtitle: `${campaigns.length} total criadas`,
      icon: Megaphone,
      color: "text-primary",
      bg: "bg-primary/10",
      action: () => navigate("/dashboard/campaigns"),
    },
    {
      title: "Mensagens enviadas",
      value: String(messagesSent),
      subtitle: `${messagesPending} pendentes`,
      icon: Send,
      color: "text-info",
      bg: "bg-info/10",
      action: undefined,
    },
    {
      title: "Taxa de retorno",
      value: `${returnRate}%`,
      subtitle: "Clientes que voltam",
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
      action: undefined,
    },
  ];

  const quickActions = [
    { title: "Campanhas", desc: "Crie e gerencie campanhas", icon: Megaphone, url: "/dashboard/campaigns" },
    { title: "Automações", desc: "Configure mensagens automáticas", icon: Zap, url: "/dashboard/automations" },
    { title: "Clientes Inativos", desc: "Reative clientes ausentes", icon: UserX, url: "/dashboard/inactive-clients" },
    { title: "Aniversariantes", desc: "Parabenize seus clientes", icon: Cake, url: "/dashboard/birthdays" },
    { title: "Indicações", desc: "Programa de indicação", icon: Gift, url: "/dashboard/referrals" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Marketing</h2>
        <p className="text-muted-foreground text-sm">
          Visão geral das suas ações de marketing e engajamento de clientes.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Card
            key={c.title}
            className={`${c.action ? "cursor-pointer hover:shadow-elevated" : ""} transition-shadow`}
            onClick={c.action}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-9 w-9 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <c.icon className={`h-4 w-4 ${c.color}`} />
                </div>
                {c.action && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
              </div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.title}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">{c.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold mb-3">Ações rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {quickActions.map((a) => (
            <button
              key={a.title}
              onClick={() => navigate(a.url)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent/50 transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <a.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Campaigns */}
      {campaigns.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Campanhas recentes</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/campaigns")} className="text-xs">
              Ver todas <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-2">
            {campaigns.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.channel === "whatsapp" ? "WhatsApp" : "E-mail"} · {c.audience === "all_clients" ? "Todos" : c.audience === "inactive" ? "Inativos" : c.audience}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  c.status === "sent" ? "bg-success/10 text-success" :
                  c.status === "scheduled" ? "bg-info/10 text-info" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {c.status === "sent" ? "Enviada" : c.status === "scheduled" ? "Agendada" : "Rascunho"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
