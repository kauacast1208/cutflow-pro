import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle, ArrowUpRight, Calendar, CalendarPlus, Clock, Crown, DollarSign, History, Mail,
  MessageSquare, Phone, Repeat, Sparkles, Star, TrendingUp, User2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, getInitials } from "@/lib/format";
import { openWhatsApp } from "@/lib/whatsappCTA";
import { buildClientProfileSummary } from "@/lib/clientProfile";
import { ClientStatusBadge } from "./ClientStatusBadge";

export interface ClientDetailData {
  client: any;
  appointments: any[];
  totalSpent: number;
  visitCount: number;
  averageTicket: number;
  firstVisit: string | null;
  lastVisit: string | null;
  nextAppointment: any | null;
  preferredPro: string | null;
  topService: string | null;
  status: { type: string; count: number; lastDate: string; daysSinceLast?: number };
}

interface Props {
  detail: ClientDetailData;
  onClose: () => void;
  onEdit: (client: any) => void;
  onUpdated?: (client: any) => void;
}

const retentionStyles: Record<string, string> = {
  healthy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  watch: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  at_risk: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  inactive: "bg-destructive/10 text-destructive border-destructive/20",
};

const appointmentStatusStyles: Record<string, string> = {
  scheduled: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  rescheduled: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  no_show: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export function ClientDetailPanel({ detail, onClose, onEdit, onUpdated }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState(detail.client.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const historyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setNotes(detail.client.notes || "");
  }, [detail.client.id, detail.client.notes]);

  const profile = useMemo(() => buildClientProfileSummary({
    client: detail.client,
    appointments: detail.appointments,
    visitCount: detail.visitCount,
    totalSpent: detail.totalSpent,
    averageTicket: detail.averageTicket,
    firstVisit: detail.firstVisit,
    lastVisit: detail.lastVisit,
    preferredPro: detail.preferredPro,
    topService: detail.topService,
  }), [detail]);

  const sortedHistory = useMemo(
    () => detail.appointments
      .slice()
      .sort((a, b) => `${b.date} ${b.start_time || ""}`.localeCompare(`${a.date} ${a.start_time || ""}`)),
    [detail.appointments]
  );

  const statCards = [
    { label: "Total visits", value: String(profile.totalVisits), hint: "Atendimentos concluidos ou validos", icon: Repeat },
    { label: "Total spent", value: formatCurrency(profile.totalSpent), hint: "Receita gerada pelo cliente", icon: DollarSign },
    { label: "Average ticket", value: profile.totalVisits > 0 ? formatCurrency(profile.averageTicket) : "-", hint: "Valor medio por visita", icon: TrendingUp },
    { label: "Last visit", value: profile.lastVisit ? format(new Date(`${profile.lastVisit}T12:00:00`), "dd/MM/yyyy") : "-", hint: "Ultimo comparecimento", icon: Calendar },
    { label: "Days since last visit", value: typeof profile.daysSinceLastVisit === "number" ? String(profile.daysSinceLastVisit) : "-", hint: "Recencia da relacao", icon: Clock },
    { label: "Lifetime value", value: formatCurrency(profile.lifetimeValue), hint: "Valor acumulado do cliente", icon: Crown },
  ];

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    const payload = { ...detail.client, notes: notes.trim() || null };

    const { error } = await supabase
      .from("clients")
      .update({ notes: notes.trim() || null })
      .eq("id", detail.client.id);

    setSavingNotes(false);

    if (error) {
      toast({ title: "Erro ao salvar nota", description: error.message, variant: "destructive" });
      return;
    }

    onUpdated?.(payload);
    toast({ title: "Nota interna salva" });
  };

  const handleOpenWhatsApp = () => {
    if (!detail.client.phone) return;
    const message = `Ola, ${detail.client.name.split(" ")[0]}! Aqui e da equipe da barbearia.`;
    openWhatsApp(detail.client.phone, message);
  };

  const handleCreateBooking = () => {
    navigate("/dashboard/agenda", {
      state: {
        clientId: detail.client.id,
        clientName: detail.client.name,
        clientPhone: detail.client.phone,
        clientEmail: detail.client.email,
      },
    });
    onClose();
  };

  const handleMarkVip = () => {
    toast({
      title: "VIP manual preparado",
      description: "O botao esta pronto, mas a persistencia depende de um campo dedicado no backend. Hoje o segmento VIP continua sendo calculado automaticamente.",
    });
  };

  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const firstSeenLabel = profile.firstSeenDate
    ? format(new Date(`${profile.firstSeenDate}T12:00:00`), "dd 'de' MMM yyyy", { locale: ptBR })
    : "-";

  const lastVisitLabel = profile.lastVisit
    ? format(new Date(`${profile.lastVisit}T12:00:00`), "dd 'de' MMM", { locale: ptBR })
    : "Sem visita";

  const lastContactLabel = detail.nextAppointment?.date
    ? format(new Date(`${detail.nextAppointment.date}T12:00:00`), "dd 'de' MMM", { locale: ptBR })
    : profile.lastVisit
      ? format(new Date(`${profile.lastVisit}T12:00:00`), "dd 'de' MMM", { locale: ptBR })
      : "Sem contato";

  const returnProbability = profile.retentionLevel === "healthy"
    ? 88
    : profile.retentionLevel === "watch"
      ? 69
      : profile.retentionLevel === "at_risk"
        ? 37
        : 14;

  const birthdayLabel = detail.client.birth_date
    ? format(new Date(`${detail.client.birth_date}T12:00:00`), "dd/MM", { locale: ptBR })
    : null;

  const communicationSuggestions = [
    {
      id: "last-contact",
      title: "Último contato",
      body: detail.nextAppointment
        ? `Última interação registrada em ${lastContactLabel}. Cliente já possui um próximo horário agendado.`
        : `Última visita em ${lastVisitLabel}. Vale manter o relacionamento ativo com uma mensagem leve.`,
      tone: "border-border/50 bg-background/60",
      align: "left",
    },
    {
      id: "reminder",
      title: "Sugestão de lembrete",
      body: detail.nextAppointment
        ? `Enviar lembrete de confirmação para ${detail.nextAppointment.start_time?.slice(0, 5)} e reforçar ${detail.nextAppointment.services?.name || "o serviço agendado"}.`
        : "Sem agendamento futuro. Sugerir retorno com base na preferência de horário e no serviço favorito.",
      tone: "border-primary/15 bg-primary/8",
      align: "right",
    },
    {
      id: "reactivation",
      title: "Sugestão de reativação",
      body: profile.retentionLevel === "healthy"
        ? "Cliente com boa recorrência. Trabalhe fidelização e upgrade de ticket, não desconto agressivo."
        : `Probabilidade de retorno em ${returnProbability}%. Priorize uma mensagem pessoal com benefício simples para reduzir fricção.`,
      tone: profile.retentionLevel === "healthy"
        ? "border-emerald-500/20 bg-emerald-500/8"
        : "border-amber-500/20 bg-amber-500/10",
      align: "left",
    },
    {
      id: "birthday",
      title: "Lembrete de aniversário",
      body: birthdayLabel
        ? `Aniversário cadastrado para ${birthdayLabel}. Ideal para mensagem de parabéns com convite de retorno via WhatsApp.`
        : "Sem data de aniversário cadastrada. Vale enriquecer o cadastro para futuras campanhas sazonais.",
      tone: birthdayLabel ? "border-pink-500/20 bg-pink-500/10" : "border-border/50 bg-background/60",
      align: "right",
    },
  ];

  const marketingActions = [
    {
      label: "Send promotion",
      helper: "Oferta curta para ticket ou retorno",
      icon: Sparkles,
      action: () => navigate("/dashboard/campaigns"),
      tone: "border-primary/20 bg-primary/10 text-primary",
    },
    {
      label: "Send reminder",
      helper: detail.nextAppointment ? "Confirmação do próximo horário" : "Convite para novo agendamento",
      icon: MessageSquare,
      action: handleOpenWhatsApp,
      tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Reactivate client",
      helper: profile.retentionLevel === "healthy" ? "Manter frequência atual" : "Recuperar cliente com risco de churn",
      icon: TrendingUp,
      action: () => navigate("/dashboard/inactive-clients"),
      tone: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="relative flex h-full w-full max-w-[1120px] flex-col border-l border-border/60 bg-background shadow-[0_18px_70px_rgba(0,0,0,0.18)]"
      >
        <div className="border-b border-border/50 bg-card/95 px-5 py-4 backdrop-blur-xl sm:px-7 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-lg font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                {getInitials(detail.client.name)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-extrabold tracking-tight text-foreground">{detail.client.name}</h3>
                  <ClientStatusBadge type={profile.segment} />
                  <Badge variant="outline" className={`rounded-full border text-[10px] font-medium ${retentionStyles[profile.retentionLevel]}`}>
                    {profile.retentionLabel}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{detail.client.phone || "Sem telefone"}</span>
                  <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{detail.client.email || "Sem email"}</span>
                  <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Primeiro registro: {firstSeenLabel}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{profile.estimatedSegment}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-full border border-border/60 bg-background/70 text-[10px] font-medium text-foreground">
                    <Clock className="mr-1 h-3 w-3 text-primary/75" /> Última visita: {lastVisitLabel}
                  </Badge>
                  <Badge variant="outline" className="rounded-full border border-primary/20 bg-primary/10 text-[10px] font-medium text-primary">
                    <TrendingUp className="mr-1 h-3 w-3" /> Probabilidade de retorno: {returnProbability}%
                  </Badge>
                  {profile.segment === "vip" && (
                    <Badge variant="outline" className="rounded-full border border-sky-500/25 bg-sky-500/10 text-[10px] font-medium text-sky-700 dark:text-sky-300">
                      <Crown className="mr-1 h-3 w-3" /> VIP
                    </Badge>
                  )}
                  <Badge variant="outline" className={`rounded-full border text-[10px] font-medium ${profile.retentionLevel === "healthy" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : profile.retentionLevel === "watch" ? "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400" : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"}`}>
                    <AlertTriangle className="mr-1 h-3 w-3" /> {profile.retentionLabel}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => onEdit(detail.client)}>Editar</Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" className="rounded-xl" onClick={handleCreateBooking}>
              <CalendarPlus className="mr-1.5 h-4 w-4" /> Criar booking
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl" onClick={handleOpenWhatsApp} disabled={!detail.client.phone}>
              <MessageSquare className="mr-1.5 h-4 w-4" /> WhatsApp
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl" onClick={handleMarkVip}>
              <Crown className="mr-1.5 h-4 w-4" /> Marcar VIP
            </Button>
            <Button size="sm" variant="outline" className="rounded-xl" onClick={scrollToHistory}>
              <History className="mr-1.5 h-4 w-4" /> Ver historico
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-6">
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {statCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{card.label}</p>
                    <card.icon className="h-4 w-4 text-primary/70" />
                  </div>
                  <p className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">{card.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
                </div>
              ))}
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
              <div className="space-y-6">
                <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.18)]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold tracking-tight text-foreground">Client insights</h4>
                  </div>

                  {profile.totalVisits === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-5 py-8 text-center">
                      <p className="text-sm font-semibold text-foreground">Ainda sem historico de atendimento</p>
                      <p className="mt-1 text-sm text-muted-foreground">Assim que este cliente tiver visitas, o painel vai mostrar recorrencia, preferencia de servico, ticket medio e risco de retencao.</p>
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Preferences</p>
                        <div className="mt-3 space-y-3 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground">Favorite service</span>
                            <span className="font-medium text-foreground text-right">{profile.favoriteService || "-"}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground">Favorite professional</span>
                            <span className="font-medium text-foreground text-right">{profile.favoriteProfessional || "-"}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground">Best weekday</span>
                            <span className="font-medium text-foreground text-right">{profile.preferredWeekday || "-"}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground">Preferred booking time</span>
                            <span className="font-medium text-foreground text-right">{profile.preferredTime || "-"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/50 bg-muted/20 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Behavior</p>
                        <div className="mt-3 space-y-3 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground">Return frequency</span>
                            <span className="font-medium text-foreground text-right">
                              {profile.averageReturnDays ? `${profile.averageReturnDays} dias` : "Ainda insuficiente"}
                            </span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground">Retention risk</span>
                            <span className="font-medium text-foreground text-right">{profile.retentionLabel}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground">Estimated segment</span>
                            <span className="font-medium text-foreground text-right">{profile.segmentLabel}</span>
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-muted-foreground">Top services</span>
                            <span className="font-medium text-foreground text-right">
                              {profile.topServices.length > 0 ? profile.topServices.map((item) => item.name).join(", ") : "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 rounded-2xl border border-border/50 bg-background p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">What this client tells you</p>
                        <div className="mt-3 grid gap-2">
                          {profile.insights.length > 0 ? profile.insights.map((insight) => (
                            <div key={insight} className="flex items-start gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5 text-sm text-foreground">
                              <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 text-primary" />
                              <span>{insight}</span>
                            </div>
                          )) : (
                            <p className="text-sm text-muted-foreground">Ainda nao ha sinais suficientes para gerar insights.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section ref={historyRef} className="rounded-3xl border border-border/60 bg-card p-5 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.18)]">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold tracking-tight text-foreground">Timeline / history</h4>
                  </div>

                  {sortedHistory.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-border/60 bg-muted/20 px-5 py-8 text-center">
                      <p className="text-sm font-semibold text-foreground">Nenhum agendamento registrado</p>
                      <p className="mt-1 text-sm text-muted-foreground">Quando este cliente agendar pela primeira vez, o historico aparecera aqui em ordem cronologica.</p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {sortedHistory.map((appointment) => (
                        <div key={appointment.id} className="rounded-2xl border border-border/50 bg-background px-4 py-3.5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{appointment.services?.name || "Servico nao informado"}</p>
                                <Badge variant="outline" className={`rounded-full border text-[10px] ${appointmentStatusStyles[appointment.status] || "bg-muted text-muted-foreground border-border/40"}`}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>{format(new Date(`${appointment.date}T12:00:00`), "dd MMM yyyy", { locale: ptBR })}</span>
                                <span>{appointment.start_time?.slice(0, 5) || "--:--"}</span>
                                <span>{appointment.professionals?.name || "Sem profissional"}</span>
                              </div>
                              {appointment.notes ? <p className="text-xs text-muted-foreground">Nota do atendimento: {appointment.notes}</p> : null}
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">{formatCurrency(Number(appointment.price || 0))}</p>
                              {appointment.cancellation_reason ? (
                                <p className="mt-1 max-w-[220px] text-[11px] text-muted-foreground">{appointment.cancellation_reason}</p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-3xl border border-primary/15 bg-[linear-gradient(180deg,hsl(var(--primary)/0.08),hsl(var(--background)))] p-5 shadow-[0_18px_40px_-24px_hsl(var(--primary)/0.35)]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold tracking-tight text-foreground">Retention block</h4>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-primary/10 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Risk</p>
                      <p className="mt-2 text-lg font-bold tracking-tight text-foreground">{profile.segmentLabel}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {typeof profile.daysSinceLastVisit === "number"
                          ? `Cliente sem booking ha ${profile.daysSinceLastVisit} dias.`
                          : "Ainda sem historico suficiente para risco de retencao."}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Next recommended action</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{profile.nextRecommendedAction}</p>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Suggested campaign</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{profile.suggestedCampaign}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{profile.suggestedFollowUp}</p>
                    </div>
                    {detail.nextAppointment ? (
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">Upcoming appointment</p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {format(new Date(`${detail.nextAppointment.date}T12:00:00`), "dd MMM yyyy", { locale: ptBR })} as {detail.nextAppointment.start_time?.slice(0, 5)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{detail.nextAppointment.services?.name || "Servico"} com {detail.nextAppointment.professionals?.name || "profissional"}</p>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-3xl border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(34,197,94,0.08),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_40px_-24px_rgba(34,197,94,0.32)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-emerald-500" />
                      <div>
                        <h4 className="text-sm font-bold tracking-tight text-foreground">WhatsApp relationship panel</h4>
                        <p className="text-xs text-muted-foreground">Contexto de contato, sugestões e próximas mensagens.</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                      Último contato: {lastContactLabel}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-3">
                    {communicationSuggestions.map((item) => (
                      <div key={item.id} className={`flex ${item.align === "right" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] rounded-[22px] border px-4 py-3 shadow-sm ${item.tone}`}>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.title}</p>
                          <p className="mt-1.5 text-sm leading-relaxed text-foreground">{item.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-2">
                    {marketingActions.map((action) => (
                      <button
                        key={action.label}
                        type="button"
                        onClick={action.action}
                        className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/72 px-4 py-3 text-left transition-all hover:border-primary/25 hover:bg-background"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.helper}</p>
                        </div>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${action.tone}`}>
                          <action.icon className="h-4 w-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.18)]">
                  <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold tracking-tight text-foreground">Notes / internal notes</h4>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Preferencias, restricoes, comportamento e contexto do relacionamento.</p>
                  <Textarea
                    className="mt-4 min-h-[150px] rounded-2xl bg-muted/20"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Ex.: prefere low fade, costuma vir no fim da tarde, sensivel a determinados produtos, cliente VIP..."
                  />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Salvo em `clients.notes`.</span>
                    <Button size="sm" className="rounded-xl" onClick={handleSaveNotes} disabled={savingNotes}>
                      {savingNotes ? "Salvando..." : "Salvar nota"}
                    </Button>
                  </div>
                </section>

                <section className="rounded-3xl border border-border/60 bg-card p-5 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.18)]">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold tracking-tight text-foreground">Business snapshot</h4>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">First seen</span>
                      <span className="font-medium text-foreground text-right">{firstSeenLabel}</span>
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Favorite service</span>
                      <span className="font-medium text-foreground text-right">{profile.favoriteService || "-"}</span>
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Favorite professional</span>
                      <span className="font-medium text-foreground text-right">{profile.favoriteProfessional || "-"}</span>
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Return cadence</span>
                      <span className="font-medium text-foreground text-right">{profile.averageReturnDays ? `${profile.averageReturnDays} dias` : "Ainda sem padrao"}</span>
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Segment</span>
                      <span className="font-medium text-foreground text-right">{profile.estimatedSegment}</span>
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Birthday</span>
                      <span className="font-medium text-foreground text-right">
                        {detail.client.birth_date ? format(new Date(`${detail.client.birth_date}T12:00:00`), "dd/MM", { locale: ptBR }) : "-"}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Last contact</span>
                      <span className="font-medium text-foreground text-right">{lastContactLabel}</span>
                    </div>
                    <Separator />
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">Return probability</span>
                      <span className="font-medium text-foreground text-right">{returnProbability}%</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
