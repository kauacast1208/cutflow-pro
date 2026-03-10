import { useState, useEffect, useMemo } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  UserX, Cake, Megaphone, Send, TrendingUp, ArrowRight,
  Zap, Gift, Loader2, MessageSquare, CheckCircle2,
  Clock, XCircle, BarChart3, Users,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { motion } from "framer-motion";

export default function MarketingOverviewPage() {
  const { barbershop } = useBarbershop();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);

  useEffect(() => {
    if (!barbershop) return;
    Promise.all([
      supabase.from("clients").select("*").eq("barbershop_id", barbershop.id),
      supabase.from("appointments").select("client_name, client_email, client_phone, date, status")
        .eq("barbershop_id", barbershop.id).neq("status", "cancelled"),
      supabase.from("campaigns").select("*").eq("barbershop_id", barbershop.id),
      supabase.from("notifications").select("id, status, type, channel, created_at")
        .eq("barbershop_id", barbershop.id),
      supabase.from("automations").select("type, enabled").eq("barbershop_id", barbershop.id),
    ]).then(([cRes, aRes, campRes, notRes, autoRes]) => {
      setClients(cRes.data || []);
      setAppointments(aRes.data || []);
      setCampaigns(campRes.data || []);
      setNotifications(notRes.data || []);
      setAutomations(autoRes.data || []);
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
    const month = new Date().getMonth() + 1;
    return clients.filter((c) => c.birth_date && new Date(c.birth_date).getMonth() + 1 === month).length;
  }, [clients]);

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

  const messagesSent = notifications.filter((n) => n.status === "sent").length;
  const messagesPending = notifications.filter((n) => n.status === "pending").length;
  const messagesFailed = notifications.filter((n) => n.status === "failed").length;
  const whatsappSent = notifications.filter((n) => n.channel === "whatsapp" && n.status === "sent").length;
  const activeAutomations = automations.filter((a) => a.enabled).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando marketing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Marketing & Retenção
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Visão geral de engajamento, automações e campanhas
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => navigate("/dashboard/automations")}>
              <Zap className="h-3.5 w-3.5" /> Automações
            </Button>
            <Button size="sm" className="text-xs gap-1.5" onClick={() => navigate("/dashboard/campaigns")}>
              <Megaphone className="h-3.5 w-3.5" /> Campanhas
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {[
          { label: "Taxa de retorno", value: `${returnRate}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Mensagens enviadas", value: String(messagesSent), icon: Send, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Via WhatsApp", value: String(whatsappSent), icon: MessageSquare, color: "text-green-600", bg: "bg-green-500/10" },
          { label: "Automações ativas", value: String(activeAutomations), icon: Zap, color: "text-primary", bg: "bg-primary/10" },
          { label: "Inativos (30d+)", value: String(inactiveCount), icon: UserX, color: "text-amber-600", bg: "bg-amber-500/10" },
          { label: "Aniversariantes", value: String(birthdayCount), icon: Cake, color: "text-pink-600", bg: "bg-pink-500/10" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.03 }}
            className="rounded-xl border border-border/60 bg-card p-4"
          >
            <div className={`h-8 w-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Notification Pipeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border/60 bg-card p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Send className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Pipeline de envios</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Status das notificações automáticas</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Enviadas", value: messagesSent, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/10", barColor: "bg-emerald-500" },
            { label: "Pendentes", value: messagesPending, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10", barColor: "bg-amber-500" },
            { label: "Falhas", value: messagesFailed, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", barColor: "bg-destructive" },
          ].map((s) => {
            const total = messagesSent + messagesPending + messagesFailed;
            const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
            return (
              <div key={s.label} className="rounded-xl border border-border/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full ${s.barColor} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{pct}% do total</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">Ações rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: "Automações", desc: `${activeAutomations} ativas — Configure WhatsApp automático`, icon: Zap, url: "/dashboard/automations", accent: "from-primary/10 to-primary/5" },
            { title: "Clientes Inativos", desc: `${inactiveCount} clientes sem visita há 30+ dias`, icon: UserX, url: "/dashboard/inactive-clients", accent: "from-amber-500/10 to-amber-500/5" },
            { title: "Aniversariantes", desc: `${birthdayCount} neste mês — Envie parabéns`, icon: Cake, url: "/dashboard/birthdays", accent: "from-pink-500/10 to-pink-500/5" },
            { title: "Campanhas", desc: `${campaigns.length} criadas — Envie mensagens em massa`, icon: Megaphone, url: "/dashboard/campaigns", accent: "from-blue-500/10 to-blue-500/5" },
            { title: "Mala Direta", desc: "Envie comunicados para toda a base", icon: Send, url: "/dashboard/direct-mail", accent: "from-indigo-500/10 to-indigo-500/5" },
            { title: "Indicações", desc: "Programa de indicação de amigos", icon: Gift, url: "/dashboard/referrals", accent: "from-emerald-500/10 to-emerald-500/5" },
          ].map((a) => (
            <button
              key={a.title}
              onClick={() => navigate(a.url)}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 hover:bg-accent/30 hover:border-border transition-all text-left group"
            >
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${a.accent} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <a.icon className="h-5 w-5 text-foreground/70" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{a.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recent Campaigns */}
      {campaigns.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border/60 bg-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Megaphone className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Campanhas recentes</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{campaigns.length} campanhas criadas</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/campaigns")} className="text-xs gap-1">
              Ver todas <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {campaigns.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 hover:border-border/60 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.channel === "whatsapp" ? "WhatsApp" : "E-mail"} · {c.audience === "all_clients" ? "Todos" : c.audience === "inactive" ? "Inativos" : c.audience}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  c.status === "sent" ? "bg-emerald-500/10 text-emerald-600" :
                  c.status === "scheduled" ? "bg-blue-500/10 text-blue-600" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {c.status === "sent" ? "Enviada" : c.status === "scheduled" ? "Agendada" : "Rascunho"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
