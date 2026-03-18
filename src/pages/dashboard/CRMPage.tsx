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
  Target, Lightbulb, MessageSquare, Zap,
} from "lucide-react";
import { format, subDays, isSameWeek, isSameMonth, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const anim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

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

      if (!stat) {
        newClients++;
        return;
      }

      const daysSince = Math.floor((now.getTime() - new Date(stat.lastDate).getTime()) / (1000 * 60 * 60 * 24));

      if (stat.count >= 10) vip++;
      if (daysSince <= 30) active++;
      else inactive++;
      if (daysSince >= 30) noReturn30++;
      if (daysSince >= 60) noReturn60++;

      // Birthday check
      if (c.birth_date) {
        const bday = new Date(c.birth_date);
        const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
        if (isSameWeek(thisYearBday, now, { weekStartsOn: 1 })) birthdaysThisWeek.push(c);
        if (isSameMonth(thisYearBday, now)) birthdaysThisMonth.push(c);
      }
    });

    // Missed (no-shows)
    missed = appointments.filter((a) => a.status === "no_show").length;

    return { active, inactive, vip, newClients, noReturn30, noReturn60, missed, birthdaysThisWeek, birthdaysThisMonth, total: clients.length };
  }, [clients, appointments]);

  // ── Campaign stats ──
  const campaignsSent = campaigns.filter((c) => c.status === "sent").length;
  const totalRecipients = campaigns.filter((c) => c.status === "sent").reduce((s, c) => s + (c.recipient_count || 0), 0);
  const msgSent = notifications.filter((n) => n.status === "sent").length;

  // ── Return rate ──
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

  // ── Insights ──
  const insights = useMemo(() => {
    const list: { icon: any; text: string; action?: string; route?: string; severity: "info" | "warning" | "success" }[] = [];

    if (segments.noReturn30 > 0) {
      list.push({
        icon: AlertTriangle,
        text: `Você tem ${segments.noReturn30} cliente${segments.noReturn30 > 1 ? "s" : ""} sem retorno há mais de 30 dias`,
        action: "Ver inativos",
        route: "/dashboard/inactive-clients",
        severity: "warning",
      });
    }
    if (segments.birthdaysThisWeek.length > 0) {
      list.push({
        icon: Cake,
        text: `${segments.birthdaysThisWeek.length} aniversariante${segments.birthdaysThisWeek.length > 1 ? "s" : ""} esta semana`,
        action: "Enviar parabéns",
        route: "/dashboard/birthdays",
        severity: "info",
      });
    }
    if (segments.vip > 0) {
      list.push({
        icon: Star,
        text: `${segments.vip} clientes VIP com alta frequência`,
        action: "Ver clientes",
        route: "/dashboard/clients",
        severity: "success",
      });
    }
    if (returnRate > 0 && returnRate < 40) {
      list.push({
        icon: TrendingUp,
        text: `Taxa de retorno de ${returnRate}% — envie incentivos para aumentar`,
        action: "Ver retenção",
        route: "/dashboard/retention",
        severity: "warning",
      });
    }
    if (segments.noReturn60 > 0) {
      list.push({
        icon: UserX,
        text: `${segments.noReturn60} clientes podem estar perdidos (60+ dias sem visita)`,
        action: "Reativar",
        route: "/dashboard/inactive-clients",
        severity: "warning",
      });
    }
    if (segments.newClients > 0) {
      list.push({
        icon: Sparkles,
        text: `${segments.newClients} clientes novos ainda sem agendamento registrado`,
        severity: "info",
      });
    }

    return list;
  }, [segments, returnRate]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando CRM...</div>;
  }

  const segmentCards = [
    { label: "Clientes Ativos", value: segments.active, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Inativos (30d+)", value: segments.inactive, icon: UserX, color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "VIP", value: segments.vip, icon: Star, color: "text-primary", bg: "bg-primary/10" },
    { label: "Novos", value: segments.newClients, icon: Sparkles, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Aniversariantes (mês)", value: segments.birthdaysThisMonth.length, icon: Cake, color: "text-pink-600", bg: "bg-pink-500/10" },
    { label: "Taxa de retorno", value: `${returnRate}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  ];

  const quickActions = [
    { label: "Reativação de inativos", desc: "Enviar campanha para clientes que não voltam há 30+ dias", icon: Send, route: "/dashboard/inactive-clients" },
    { label: "Parabéns aniversariantes", desc: "Enviar mensagem personalizada de aniversário", icon: Cake, route: "/dashboard/birthdays" },
    { label: "Campanha de retorno", desc: "Criar campanha de incentivo para clientes recorrentes", icon: MessageSquare, route: "/dashboard/campaigns" },
    { label: "Análise de retenção", desc: "Ver previsão de retorno e clientes em risco", icon: Heart, route: "/dashboard/retention" },
  ];

  const isEmpty = segments.total === 0;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-full pb-20 sm:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          CRM
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          {isEmpty
            ? "Gerencie o relacionamento com seus clientes de forma inteligente"
            : `Relacionamento inteligente com seus clientes · ${segments.total} clientes cadastrados`}
        </p>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {segmentCards.map((card, i) => (
          <motion.div key={card.label} {...anim} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/60 bg-card hover:border-border transition-colors">
              <CardContent className="pt-3 sm:pt-4 pb-2.5 sm:pb-3 px-3 sm:px-4">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${card.color}`} />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-bold tracking-tight">{card.value}</div>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium mt-0.5 sm:mt-1">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty state for new users */}
      {isEmpty && insights.length === 0 && (
        <motion.div {...anim} transition={{ delay: 0.2 }}>
          <Card className="border-border/60">
            <CardContent className="py-10 sm:py-12 flex flex-col items-center text-center px-5">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold mb-1.5">Comece a construir seu CRM</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
                Cadastre seus clientes e registre agendamentos para visualizar segmentações, insights e oportunidades de retenção automaticamente.
              </p>
              <Button className="mt-4 sm:mt-5 h-11 sm:h-10 min-w-[180px]" onClick={() => navigate("/dashboard/clients")}>
                <Users className="h-4 w-4 mr-2" />
                Cadastrar clientes
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Smart Insights */}
      {insights.length > 0 && (
        <motion.div {...anim} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Insights inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`flex items-start sm:items-center gap-3 rounded-xl p-3 sm:p-3 transition-colors ${
                    insight.severity === "warning"
                      ? "bg-amber-500/5 border border-amber-500/10"
                      : insight.severity === "success"
                      ? "bg-emerald-500/5 border border-emerald-500/10"
                      : "bg-muted/50 border border-border/50"
                  }`}
                >
                  <insight.icon className={`h-4 w-4 shrink-0 mt-0.5 sm:mt-0 ${
                    insight.severity === "warning" ? "text-amber-600" : insight.severity === "success" ? "text-emerald-600" : "text-primary"
                  }`} />
                  <span className="text-xs sm:text-sm flex-1">{insight.text}</span>
                  {insight.action && insight.route && (
                    <Button variant="ghost" size="sm" className="text-xs h-9 sm:h-7 shrink-0 px-2 sm:px-3" onClick={() => navigate(insight.route!)}>
                      {insight.action}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Quick Actions */}
        <motion.div {...anim} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Ações rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.route)}
                  className="w-full flex items-center gap-3 rounded-xl p-3 hover:bg-muted/50 border border-border/50 transition-all text-left group min-h-[56px] sm:min-h-0 active:scale-[0.98]"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium">{action.label}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors shrink-0" />
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Campaign Performance */}
        <motion.div {...anim} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Performance de campanhas
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/dashboard/campaigns")}>
                  Ver todas <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="text-center p-2.5 sm:p-3 rounded-xl bg-muted/50">
                  <div className="text-lg sm:text-xl font-bold">{campaignsSent}</div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Campanhas</p>
                </div>
                <div className="text-center p-2.5 sm:p-3 rounded-xl bg-muted/50">
                  <div className="text-lg sm:text-xl font-bold">{totalRecipients}</div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Destinatários</p>
                </div>
                <div className="text-center p-2.5 sm:p-3 rounded-xl bg-muted/50">
                  <div className="text-lg sm:text-xl font-bold">{msgSent}</div>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Mensagens</p>
                </div>
              </div>

              {/* Retention health bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Saúde do relacionamento</span>
                  <span className="font-semibold">{returnRate}%</span>
                </div>
                <Progress value={returnRate} className="h-2" />
                <p className="text-[11px] text-muted-foreground">
                  {returnRate >= 60
                    ? "Excelente! Seus clientes estão retornando."
                    : returnRate >= 40
                    ? "Bom, mas há espaço para melhorar a retenção."
                    : "Atenção: considere ativar campanhas de reativação."}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Birthdays this week */}
      {segments.birthdaysThisWeek.length > 0 && (
        <motion.div {...anim} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cake className="h-4 w-4 text-pink-500" />
                  Aniversariantes desta semana
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate("/dashboard/birthdays")}>
                  Ver todos <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {segments.birthdaysThisWeek.map((c) => (
                  <Badge key={c.id} variant="secondary" className="text-xs px-3 py-1.5 bg-pink-500/5 text-pink-700 border-pink-500/15">
                    🎂 {c.name}
                    {c.birth_date && (
                      <span className="ml-1 opacity-60">
                        {format(new Date(new Date(c.birth_date).getFullYear(), new Date(c.birth_date).getMonth(), new Date(c.birth_date).getDate()), "dd/MM")}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
