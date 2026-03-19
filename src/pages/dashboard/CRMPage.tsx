import { useState, useEffect, useMemo } from "react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users, UserCheck, UserX, Cake, TrendingUp, ArrowRight,
  AlertTriangle, Heart, Star, Clock, Send, Sparkles,
  Target, Lightbulb, MessageSquare, Zap, ShieldCheck, Gift, BarChart3,
} from "lucide-react";
import { format, subDays, isSameWeek, isSameMonth } from "date-fns";
import { motion } from "framer-motion";

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
      supabase.from("appointments").select("client_name, client_email, client_phone, date, status, price, service_id")
        .eq("barbershop_id", barbershop.id).neq("status", "cancelled"),
      supabase.from("campaigns").select("id, status, sent_at, recipient_count").eq("barbershop_id", barbershop.id),
      supabase.from("notifications").select("id, status, type, channel").eq("barbershop_id", barbershop.id),
    ]).then(([cRes, aRes, campRes, notRes]) => {
      setClients(cRes.data || []);
      setAppointments(aRes.data || []);
      setCampaigns(campRes.data || []);
      setNotifications(notRes.data || []);
      setLoading(false);
    });
  }, [barbershop]);

  // ── Segmentation ──
  const segments = useMemo(() => {
    const now = new Date();
    const clientLastVisit = new Map<string, { lastDate: string; count: number; totalSpent: number }>();

    appointments.forEach((a) => {
      const key = (a.client_email || a.client_phone || a.client_name).toLowerCase();
      const existing = clientLastVisit.get(key);
      const price = Number(a.price || 0);
      if (!existing) {
        clientLastVisit.set(key, { lastDate: a.date, count: 1, totalSpent: price });
      } else {
        existing.count++;
        existing.totalSpent += price;
        if (a.date > existing.lastDate) existing.lastDate = a.date;
      }
    });

    let active = 0, inactive = 0, vip = 0, newClients = 0, noReturn30 = 0, noReturn60 = 0, missed = 0;
    const birthdaysThisWeek: any[] = [];
    const birthdaysThisMonth: any[] = [];

    clients.forEach((c) => {
      const key = (c.email || c.phone || c.name).toLowerCase();
      const stat = clientLastVisit.get(key);

      if (!stat) { newClients++; return; }

      const daysSince = Math.floor((now.getTime() - new Date(stat.lastDate).getTime()) / (1000 * 60 * 60 * 24));

      if (stat.count >= 10) vip++;
      if (daysSince <= 30) active++;
      else inactive++;
      if (daysSince >= 30) noReturn30++;
      if (daysSince >= 60) noReturn60++;

      if (c.birth_date) {
        const bday = new Date(c.birth_date);
        const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
        if (isSameWeek(thisYearBday, now, { weekStartsOn: 1 })) birthdaysThisWeek.push(c);
        if (isSameMonth(thisYearBday, now)) birthdaysThisMonth.push(c);
      }
    });

    missed = appointments.filter((a) => a.status === "no_show").length;

    return { active, inactive, vip, newClients, noReturn30, noReturn60, missed, birthdaysThisWeek, birthdaysThisMonth, total: clients.length };
  }, [clients, appointments]);

  const campaignsSent = campaigns.filter((c) => c.status === "sent").length;
  const totalRecipients = campaigns.filter((c) => c.status === "sent").reduce((s, c) => s + (c.recipient_count || 0), 0);
  const msgSent = notifications.filter((n) => n.status === "sent").length;

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

  const insights = useMemo(() => {
    const list: { icon: any; text: string; action?: string; route?: string; severity: "info" | "warning" | "success" }[] = [];
    if (segments.noReturn30 > 0) list.push({ icon: AlertTriangle, text: `${segments.noReturn30} cliente${segments.noReturn30 > 1 ? "s" : ""} sem retorno há mais de 30 dias`, action: "Ver inativos", route: "/dashboard/inactive-clients", severity: "warning" });
    if (segments.birthdaysThisWeek.length > 0) list.push({ icon: Cake, text: `${segments.birthdaysThisWeek.length} aniversariante${segments.birthdaysThisWeek.length > 1 ? "s" : ""} esta semana`, action: "Enviar parabéns", route: "/dashboard/birthdays", severity: "info" });
    if (segments.vip > 0) list.push({ icon: Star, text: `${segments.vip} clientes VIP com alta frequência`, action: "Ver clientes", route: "/dashboard/clients", severity: "success" });
    if (returnRate > 0 && returnRate < 40) list.push({ icon: TrendingUp, text: `Taxa de retorno de ${returnRate}% — envie incentivos para aumentar`, action: "Ver retenção", route: "/dashboard/retention", severity: "warning" });
    if (segments.noReturn60 > 0) list.push({ icon: UserX, text: `${segments.noReturn60} clientes podem estar perdidos (60+ dias sem visita)`, action: "Reativar", route: "/dashboard/inactive-clients", severity: "warning" });
    if (segments.newClients > 0) list.push({ icon: Sparkles, text: `${segments.newClients} clientes novos ainda sem agendamento registrado`, severity: "info" });
    return list;
  }, [segments, returnRate]);

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
    { label: "Clientes Ativos", value: segments.active, icon: UserCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", trend: "Últimos 30 dias" },
    { label: "Inativos", value: segments.inactive, icon: UserX, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", trend: "30+ dias sem visita" },
    { label: "VIP", value: segments.vip, icon: Star, color: "text-primary", bg: "bg-primary/10", trend: "10+ visitas" },
    { label: "Novos", value: segments.newClients, icon: Sparkles, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10", trend: "Sem agendamento" },
    { label: "Aniversariantes", value: segments.birthdaysThisMonth.length, icon: Cake, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-500/10", trend: "Este mês" },
    { label: "Retorno", value: `${returnRate}%`, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", trend: "Taxa de fidelização" },
  ];

  const quickActions = [
    { label: "Reativar inativos", desc: "Enviar campanha para clientes que não voltam há 30+ dias", icon: Send, route: "/dashboard/inactive-clients", accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { label: "Aniversariantes", desc: "Enviar mensagem personalizada de aniversário", icon: Gift, route: "/dashboard/birthdays", accent: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
    { label: "Nova campanha", desc: "Criar campanha de incentivo para clientes recorrentes", icon: MessageSquare, route: "/dashboard/campaigns", accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "Análise de retenção", desc: "Ver previsão de retorno e clientes em risco", icon: BarChart3, route: "/dashboard/retention", accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  ];

  const isEmpty = segments.total === 0;

  return (
    <div className="space-y-7 sm:space-y-9 max-w-full pb-24 sm:pb-8">
      {/* Header */}
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
                  ? "Gerencie o relacionamento com seus clientes"
                  : `${segments.total} clientes · ${segments.active} ativos`}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="hidden sm:flex rounded-xl border-border/50" onClick={() => navigate("/dashboard/clients")}>
            <Users className="h-4 w-4 mr-1.5" /> Ver todos
          </Button>
        </div>
      </motion.div>

      {/* Segment Cards */}
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

      {/* Premium Empty State */}
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
                Cadastre seus clientes e registre agendamentos para visualizar segmentações inteligentes, insights e oportunidades de retenção automaticamente.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-10 w-full max-w-lg">
                {[
                  { icon: Users, label: "Cadastrar clientes", desc: "Adicione seus primeiros clientes", route: "/dashboard/clients" },
                  { icon: ShieldCheck, label: "Agendar serviço", desc: "Registre um agendamento", route: "/dashboard/agenda" },
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

      {/* Smart Insights */}
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
        {/* Quick Actions */}
        <motion.div {...fadeUp(0.18)}>
          <div className="h-full rounded-2xl border border-border/50 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
            <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shadow-[0_0_0_1px_hsl(var(--primary)/0.08)]">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                Ações rápidas
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

        {/* Campaign Performance */}
        <motion.div {...fadeUp(0.22)}>
          <div className="h-full rounded-2xl border border-border/50 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
            <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center shadow-[0_0_0_1px_hsl(var(--primary)/0.08)]">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  Performance
                </h3>
                <Button variant="ghost" size="sm" className="text-xs h-8 font-semibold rounded-lg" onClick={() => navigate("/dashboard/campaigns")}>
                  Ver todas <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            <div className="space-y-5 px-5 sm:px-7 pb-5 sm:pb-7">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: campaignsSent, label: "Campanhas", color: "text-primary" },
                  { value: totalRecipients, label: "Destinatários", color: "text-foreground" },
                  { value: msgSent, label: "Mensagens", color: "text-foreground" },
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

              {/* Retention health */}
              <div className="p-5 rounded-xl bg-muted/20 border border-border/40 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">Saúde do relacionamento</span>
                  <span className="text-lg font-extrabold text-foreground tabular-nums" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {returnRate}%
                  </span>
                </div>
                <Progress value={returnRate} className="h-2.5" />
                <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                  {returnRate >= 60
                    ? "🟢 Excelente! Seus clientes estão retornando com frequência."
                    : returnRate >= 40
                    ? "🟡 Bom progresso, mas há espaço para melhorar a retenção."
                    : returnRate > 0
                    ? "🟠 Atenção: considere ativar campanhas de reativação."
                    : "Registre agendamentos para calcular a taxa de retorno."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Birthdays this week */}
      {segments.birthdaysThisWeek.length > 0 && (
        <motion.div {...fadeUp(0.28)}>
          <div className="rounded-2xl border border-border/50 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
            <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <div className="h-8 w-8 rounded-xl bg-pink-500/10 flex items-center justify-center">
                    <Cake className="h-4 w-4 text-pink-500" />
                  </div>
                  Aniversariantes da semana
                </h3>
                <Button variant="ghost" size="sm" className="text-xs h-8 font-semibold rounded-lg" onClick={() => navigate("/dashboard/birthdays")}>
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            <div className="px-5 sm:px-7 pb-5 sm:pb-7">
              <div className="flex flex-wrap gap-2.5">
                {segments.birthdaysThisWeek.map((c) => (
                  <Badge key={c.id} variant="secondary" className="text-xs px-4 py-2.5 bg-pink-500/[0.06] text-pink-700 dark:text-pink-400 border border-pink-500/15 rounded-xl font-semibold">
                    🎂 {c.name}
                    {c.birth_date && (
                      <span className="ml-1.5 opacity-40 text-[10px] tabular-nums">
                        {format(new Date(new Date(c.birth_date).getFullYear(), new Date(c.birth_date).getMonth(), new Date(c.birth_date).getDate()), "dd/MM")}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
