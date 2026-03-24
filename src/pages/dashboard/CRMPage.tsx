import { useState, useEffect, useMemo } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users, UserCheck, UserX, Cake, TrendingUp, ArrowRight,
  AlertTriangle, Heart, Clock, Send, Sparkles,
  Target, Lightbulb, MessageSquare, Zap, ShieldCheck, Gift, BarChart3, Repeat,
} from "lucide-react";
import { format, isSameMonth } from "date-fns";
import { motion } from "framer-motion";
import { buildClientLifecycleMap, getClientKeyFromClient } from "@/lib/clientAnalytics";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

export default function CRMPage() {
  const { barbershop } = useBarbershop();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!barbershop) return;

    Promise.all([
      supabase.from("clients").select("*").eq("barbershop_id", barbershop.id),
      supabase.from("appointments").select("client_name, client_email, client_phone, date, status, price, start_time, end_time, cancellation_reason, services(name)")
        .eq("barbershop_id", barbershop.id),
      supabase.from("campaigns").select("id, status, sent_at, recipient_count").eq("barbershop_id", barbershop.id),
      supabase.from("notifications").select("id, status, type, channel").eq("barbershop_id", barbershop.id),
    ]).then(([clientRes, appointmentRes, campaignRes, notificationRes]) => {
      setClients(clientRes.data || []);
      setAppointments(appointmentRes.data || []);
      setCampaigns(campaignRes.data || []);
      setNotifications(notificationRes.data || []);
      setLoading(false);
    });
  }, [barbershop]);

  const lifecycleMap = useMemo(() => buildClientLifecycleMap(clients, appointments), [clients, appointments]);

  const crmMetrics = useMemo(() => {
    const now = new Date();
    const lifecycleClients = clients.map((client) => {
      const insight = lifecycleMap.get(getClientKeyFromClient(client));
      return {
        ...client,
        insight,
      };
    });

    const activeClients = lifecycleClients.filter((client) =>
      client.insight &&
      client.insight.appointmentCount > 0 &&
      client.insight.status !== "inactive"
    ).length;
    const newClients = lifecycleClients.filter((client) => client.insight?.status === "new").length;
    const recurringClients = lifecycleClients.filter((client) => client.insight?.status === "recurring").length;
    const atRiskClients = lifecycleClients.filter((client) => client.insight?.status === "at_risk").length;
    const inactiveClients = lifecycleClients.filter((client) => client.insight?.status === "inactive").length;
    const birthdaysThisMonth = lifecycleClients.filter((client) => {
      if (!client.birth_date) return false;
      return isSameMonth(new Date(client.birth_date + "T12:00:00"), now);
    });

    const clientsWithVisits = lifecycleClients.filter((client) => (client.insight?.appointmentCount || 0) > 0).length;
    const retentionRate = clientsWithVisits > 0
      ? Math.round(((recurringClients + Math.max(0, activeClients - newClients)) / clientsWithVisits) * 100)
      : 0;

    const averageRecency = lifecycleClients
      .map((client) => client.insight?.daysSinceLastVisit)
      .filter((value): value is number => typeof value === "number");
    const averageDaysSinceVisit = averageRecency.length > 0
      ? Math.round(averageRecency.reduce((sum, value) => sum + value, 0) / averageRecency.length)
      : null;

    const serviceSegments: Record<string, number> = {};
    lifecycleClients.forEach((client) => {
      const serviceName = client.insight?.preferredService;
      if (serviceName) serviceSegments[serviceName] = (serviceSegments[serviceName] || 0) + 1;
    });

    const topSegments = Object.entries(serviceSegments)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return {
      activeClients,
      newClients,
      recurringClients,
      atRiskClients,
      inactiveClients,
      birthdaysThisMonth,
      retentionRate,
      averageDaysSinceVisit,
      clientsWithVisits,
      topSegments,
    };
  }, [clients, lifecycleMap]);

  const campaignsSent = campaigns.filter((campaign) => campaign.status === "sent").length;
  const totalRecipients = campaigns
    .filter((campaign) => campaign.status === "sent")
    .reduce((sum, campaign) => sum + (campaign.recipient_count || 0), 0);
  const messagesSent = notifications.filter((notification) => notification.status === "sent").length;

  const insights = useMemo(() => {
    const list: { icon: any; text: string; action?: string; route?: string; severity: "info" | "warning" | "success" }[] = [];

    if (crmMetrics.atRiskClients > 0) {
      list.push({
        icon: AlertTriangle,
        text: `${crmMetrics.atRiskClients} cliente${crmMetrics.atRiskClients > 1 ? "s" : ""} em risco de nao retornar em breve`,
        action: "Ver clientes",
        route: "/dashboard/clients",
        severity: "warning",
      });
    }

    if (crmMetrics.inactiveClients > 0) {
      list.push({
        icon: UserX,
        text: `${crmMetrics.inactiveClients} cliente${crmMetrics.inactiveClients > 1 ? "s" : ""} sem retorno ha 90+ dias`,
        action: "Reativar",
        route: "/dashboard/inactive-clients",
        severity: "warning",
      });
    }

    if (crmMetrics.birthdaysThisMonth.length > 0) {
      list.push({
        icon: Cake,
        text: `${crmMetrics.birthdaysThisMonth.length} aniversariante${crmMetrics.birthdaysThisMonth.length > 1 ? "s" : ""} neste mes`,
        action: "Enviar parabens",
        route: "/dashboard/birthdays",
        severity: "info",
      });
    }

    if (crmMetrics.recurringClients > 0) {
      list.push({
        icon: Repeat,
        text: `${crmMetrics.recurringClients} clientes recorrentes sustentam sua base ativa`,
        action: "Ver clientes",
        route: "/dashboard/clients",
        severity: "success",
      });
    }

    if (crmMetrics.retentionRate > 0 && crmMetrics.retentionRate < 45) {
      list.push({
        icon: TrendingUp,
        text: `Retencao em ${crmMetrics.retentionRate}%: vale ativar campanhas para clientes em risco`,
        action: "Ver retencao",
        route: "/dashboard/retention",
        severity: "warning",
      });
    }

    if (crmMetrics.topSegments.length > 0) {
      list.push({
        icon: Target,
        text: `Maior segmento atual: ${crmMetrics.topSegments[0].name} com ${crmMetrics.topSegments[0].count} clientes`,
        action: "Ver clientes",
        route: "/dashboard/clients",
        severity: "info",
      });
    }

    return list;
  }, [crmMetrics]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
          <Heart className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Carregando CRM...</p>
      </div>
    );
  }

  const segmentCards = [
    { label: "Clientes ativos", value: crmMetrics.activeClients, icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", trend: "Base com visita recente" },
    { label: "Novos", value: crmMetrics.newClients, icon: Sparkles, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", trend: "0-1 visita registrada" },
    { label: "Recorrentes", value: crmMetrics.recurringClients, icon: Repeat, color: "text-primary", bg: "bg-primary/10", trend: "3+ visitas e ritmo saudavel" },
    { label: "Em risco", value: crmMetrics.atRiskClients, icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", trend: "45+ dias sem retorno" },
    { label: "Inativos", value: crmMetrics.inactiveClients, icon: UserX, color: "text-destructive", bg: "bg-destructive/10", trend: "90+ dias sem visita" },
    { label: "Aniversarios", value: crmMetrics.birthdaysThisMonth.length, icon: Cake, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10", trend: "Este mes" },
  ];

  const quickActions = [
    { label: "Reativar inativos", desc: "Enviar campanha para clientes inativos e em risco", icon: Send, route: "/dashboard/inactive-clients", accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Aniversariantes", desc: "Ativar mensagens de aniversario quando houver data cadastrada", icon: Gift, route: "/dashboard/birthdays", accent: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
    { label: "Nova campanha", desc: "Criar campanha para um segmento especifico", icon: MessageSquare, route: "/dashboard/campaigns", accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Analise de retencao", desc: "Acompanhar retorno medio e clientes em risco", icon: BarChart3, route: "/dashboard/retention", accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  ];

  const isEmpty = clients.length === 0;

  return (
    <div className="space-y-7 sm:space-y-9 max-w-full pb-24 sm:pb-8">
      <motion.div {...fadeUp(0)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-[0_0_0_1px_hsl(var(--primary)/0.08)]">
              <Heart className="h-5.5 w-5.5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-[26px] font-extrabold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                CRM Inteligente
              </h1>
              <p className="text-muted-foreground/60 text-xs sm:text-sm mt-0.5">
                {isEmpty
                  ? "Gerencie relacionamento e retencao dos seus clientes"
                  : `${clients.length} clientes · ${crmMetrics.activeClients} ativos · retencao ${crmMetrics.retentionRate}%`}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="hidden sm:flex rounded-xl border-border/50" onClick={() => navigate("/dashboard/clients")}>
            <Users className="h-4 w-4 mr-1.5" /> Ver clientes
          </Button>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.06)} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {segmentCards.map((card) => (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.12)] hover:border-border/70 hover:shadow-[0_2px_6px_rgba(0,0,0,0.1),0_12px_32px_-8px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-default"
          >
            <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl ${card.bg} flex items-center justify-center mb-3.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]`}>
              <card.icon className={`h-[18px] w-[18px] sm:h-5 sm:w-5 ${card.color}`} />
            </div>
            <div className="text-2xl sm:text-[32px] font-extrabold tracking-tight leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {card.value}
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground/60 font-bold mt-2 uppercase tracking-[0.1em]">
              {card.label}
            </p>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5 hidden sm:block">
              {card.trend}
            </p>
          </div>
        ))}
      </motion.div>

      {isEmpty && insights.length === 0 && (
        <motion.div {...fadeUp(0.15)}>
          <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
            <div className="relative py-14 sm:py-20 flex flex-col items-center text-center px-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-[0_0_0_1px_hsl(var(--primary)/0.08),0_4px_12px_-2px_hsl(var(--primary)/0.1)]">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold mb-2.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Comece a construir seu CRM
              </h3>
              <p className="text-sm text-muted-foreground/60 max-w-md leading-relaxed">
                Cadastre clientes e registre agendamentos para acompanhar recorrencia, risco de churn, aniversariantes e oportunidades de campanha.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-10 w-full max-w-lg">
                {[
                  { icon: Users, label: "Cadastrar clientes", desc: "Adicione seus primeiros clientes", route: "/dashboard/clients" },
                  { icon: ShieldCheck, label: "Agendar servico", desc: "Registre um agendamento", route: "/dashboard/agenda" },
                  { icon: MessageSquare, label: "Criar campanha", desc: "Envie sua primeira mensagem", route: "/dashboard/campaigns" },
                ].map((step) => (
                  <button
                    key={step.label}
                    onClick={() => navigate(step.route)}
                    className="flex flex-col items-center gap-2.5 p-5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-primary/20 hover:shadow-md transition-all text-center group active:scale-[0.97]"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 group-hover:scale-110 transition-all">
                      <step.icon className="h-[18px] w-[18px] text-primary" />
                    </div>
                    <p className="text-xs font-bold">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground/50 leading-relaxed">{step.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {insights.length > 0 && (
        <motion.div {...fadeUp(0.12)}>
          <div className="rounded-2xl border border-border/50 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
            <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center shadow-[0_0_0_1px_hsl(45_100%_50%/0.08)]">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                </div>
                Insights inteligentes
              </h3>
            </div>
            <div className="space-y-2 px-5 sm:px-7 pb-5 sm:pb-7">
              {insights.map((insight, i) => {
                const severityStyles = {
                  warning: "bg-amber-500/[0.04] border-amber-500/10",
                  success: "bg-emerald-500/[0.04] border-emerald-500/10",
                  info: "bg-muted/30 border-border/40",
                };
                const iconColors = {
                  warning: "text-amber-600 dark:text-amber-400",
                  success: "text-emerald-600 dark:text-emerald-400",
                  info: "text-primary",
                };
                const iconBgs = {
                  warning: "bg-amber-500/10",
                  success: "bg-emerald-500/10",
                  info: "bg-primary/10",
                };

                return (
                  <div
                    key={i}
                    className={`flex items-start sm:items-center gap-3.5 rounded-xl p-4 border transition-colors ${severityStyles[insight.severity]}`}
                  >
                    <div className={`h-8 w-8 rounded-lg ${iconBgs[insight.severity]} flex items-center justify-center shrink-0`}>
                      <insight.icon className={`h-4 w-4 ${iconColors[insight.severity]}`} />
                    </div>
                    <span className="text-xs sm:text-sm flex-1 leading-relaxed">{insight.text}</span>
                    {insight.action && insight.route && (
                      <Button variant="ghost" size="sm" className="text-xs h-9 sm:h-8 shrink-0 px-3 font-semibold rounded-lg" onClick={() => navigate(insight.route!)}>
                        {insight.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-7">
        <motion.div {...fadeUp(0.18)}>
          <div className="h-full rounded-2xl border border-border/50 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
            <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shadow-[0_0_0_1px_hsl(var(--primary)/0.08)]">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                Acoes rapidas
              </h3>
            </div>
            <div className="space-y-2.5 px-5 sm:px-7 pb-5 sm:pb-7">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.route)}
                  className="w-full flex items-center gap-4 rounded-xl p-4 hover:bg-muted/30 border border-border/40 hover:border-border/60 transition-all text-left group active:scale-[0.98]"
                >
                  <div className={`h-11 w-11 rounded-xl ${action.accent.split(" ")[0]} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]`}>
                    <action.icon className={`h-5 w-5 ${action.accent.split(" ").slice(1).join(" ")}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{action.label}</p>
                    <p className="text-[11px] text-muted-foreground/50 truncate mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-foreground/50 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.22)}>
          <div className="h-full rounded-2xl border border-border/50 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
            <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shadow-[0_0_0_1px_hsl(var(--primary)/0.08)]">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  Performance do CRM
                </h3>
                <Button variant="ghost" size="sm" className="text-xs h-8 font-semibold rounded-lg" onClick={() => navigate("/dashboard/campaigns")}>
                  Ver campanhas <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            <div className="space-y-5 px-5 sm:px-7 pb-5 sm:pb-7">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: campaignsSent, label: "Campanhas", color: "text-primary" },
                  { value: totalRecipients, label: "Destinatarios", color: "text-foreground" },
                  { value: messagesSent, label: "Mensagens", color: "text-foreground" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-4 sm:p-5 rounded-xl bg-muted/30 border border-border/40">
                    <div className={`text-xl sm:text-[28px] font-extrabold ${stat.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {stat.value}
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 font-bold uppercase tracking-[0.1em] mt-1.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-xl bg-muted/20 border border-border/40 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">Saude do relacionamento</span>
                  <span className="text-lg font-extrabold text-foreground tabular-nums" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {crmMetrics.retentionRate}%
                  </span>
                </div>
                <Progress value={crmMetrics.retentionRate} className="h-2.5" />
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                  {crmMetrics.retentionRate >= 60
                    ? "Sua base recorrente esta forte e com boa frequencia de retorno."
                    : crmMetrics.retentionRate >= 40
                    ? "A retencao esta razoavel, mas clientes em risco merecem campanhas dedicadas."
                    : crmMetrics.clientsWithVisits > 0
                    ? "A retencao esta baixa para quem ja visitou. Priorize reativacao e follow-up."
                    : "Registre visitas para liberar indicadores de retencao."}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground/60">
                  <span>Media desde a ultima visita</span>
                  <span>{crmMetrics.averageDaysSinceVisit !== null ? `${crmMetrics.averageDaysSinceVisit} dias` : "Sem dados"}</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-muted/20 border border-border/40 space-y-2">
                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">Segmentacao simples</p>
                {crmMetrics.topSegments.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground/50">Nenhum segmento identificado ainda. Registre servicos em agendamentos para ativar essa leitura.</p>
                ) : (
                  crmMetrics.topSegments.map((segment) => (
                    <div key={segment.name} className="flex items-center justify-between text-sm">
                      <span>{segment.name}</span>
                      <span className="text-muted-foreground">{segment.count} cliente{segment.count > 1 ? "s" : ""}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {crmMetrics.birthdaysThisMonth.length > 0 && (
        <motion.div {...fadeUp(0.28)}>
          <div className="rounded-2xl border border-border/50 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
            <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <div className="h-8 w-8 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    <Cake className="h-4 w-4 text-pink-500" />
                  </div>
                  Aniversariantes do mes
                </h3>
                <Button variant="ghost" size="sm" className="text-xs h-8 font-semibold rounded-lg" onClick={() => navigate("/dashboard/birthdays")}>
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            <div className="px-5 sm:px-7 pb-5 sm:pb-7">
              <div className="flex flex-wrap gap-2.5">
                {crmMetrics.birthdaysThisMonth.map((client) => (
                  <div
                    key={client.id}
                    className="rounded-xl border border-pink-500/15 bg-pink-500/[0.06] px-4 py-2.5 text-xs font-semibold text-pink-700 dark:text-pink-400"
                  >
                    {client.name}
                    {client.birth_date && (
                      <span className="ml-1.5 opacity-40 text-[10px] tabular-nums">
                        {format(new Date(client.birth_date + "T12:00:00"), "dd/MM")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
