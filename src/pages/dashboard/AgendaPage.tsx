import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft, ChevronRight, CalendarDays, MessageCircle,
  Clock, User, Scissors, DollarSign, XCircle, CheckCircle2, Star,
  CalendarRange, Users, AlertCircle, Phone, FileText,
  Plus, Ban, CalendarOff, TrendingUp, UserX, Search,
} from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfWeek, addWeeks, subWeeks, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { motion } from "framer-motion";
import NewAppointmentDialog from "@/components/agenda/NewAppointmentDialog";
import { computeAgendaMetrics, formatRelativeVisitDay, getBlockedTimeDate, normalizeAgendaAppointment } from "@/lib/agenda";
import { ProfessionalAvatar } from "@/components/shared/ProfessionalAvatar";
import { buildClientAggregates, getClientKeyFromAppointment } from "@/lib/clientAnalytics";

type ViewMode = "day" | "week" | "professional";

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  scheduled: { label: "Pendente", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/25", dot: "bg-amber-400" },
  confirmed: { label: "Confirmado", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  completed: { label: "Concluído", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", dot: "bg-primary" },
  rescheduled: { label: "Remarcado", color: "text-sky-700 dark:text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/25", dot: "bg-sky-400" },
  cancelled: { label: "Cancelado", color: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/20", dot: "bg-destructive" },
  no_show: { label: "Risco de no-show", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/25", dot: "bg-rose-400" },
};

const getBlockTone = (reason?: string) => {
  const lowerReason = String(reason || "").toLowerCase();

  if (lowerReason.includes("almoço")) {
    return {
      cellBg: "bg-amber-500/[0.05]",
      chipClass: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      icon: "🍽️",
    };
  }

  if (lowerReason.includes("pausa")) {
    return {
      cellBg: "bg-sky-500/[0.05]",
      chipClass: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
      icon: "☕",
    };
  }

  return {
    cellBg: "bg-muted/[0.06]",
    chipClass: "border-border/60 bg-muted/35 text-muted-foreground",
    icon: "🚫",
  };
};

const isVipAppointment = (event: any) => {
  const vipSignals = [
    event.clientName,
    event.client_name,
    event.serviceName,
    event.services?.name,
    event.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return vipSignals.includes("vip") || vipSignals.includes("premium") || vipSignals.includes("signature") || Number(event.price || 0) >= 140;
};
export default function AgendaPage() {
  const { barbershop } = useBarbershop();
  const { user } = useAuth();
  const { isProfessional, canViewFullAgenda } = useUserRole();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [appointments, setAppointments] = useState<any[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [myProfessionalId, setMyProfessionalId] = useState<string | null>(null);
  const [selectedPro, setSelectedPro] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockForm, setBlockForm] = useState<{ date: string; start_time: string; end_time: string; reason: string; professional_id: string; all_day: boolean; recurring: boolean; recurring_days: number[] }>({ date: "", start_time: "", end_time: "", reason: "", professional_id: "all", all_day: false, recurring: false, recurring_days: [] });
  const [showNewAppt, setShowNewAppt] = useState(false);
  const [newApptDefaults, setNewApptDefaults] = useState<{ date?: Date; time?: string; proId?: string }>({});
  const [currentMinute, setCurrentMinute] = useState(new Date().getHours() * 60 + new Date().getMinutes());

  // Update current time indicator every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentMinute(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const hours = useMemo(() => {
    const open = barbershop?.opening_time ? parseInt(barbershop.opening_time) : 8;
    const close = barbershop?.closing_time ? parseInt(barbershop.closing_time) : 20;
    return Array.from({ length: close - open }, (_, i) => `${String(i + open).padStart(2, "0")}:00`);
  }, [barbershop]);

  const days = useMemo(() => {
    if (viewMode === "day") return [selectedDate];
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [viewMode, selectedDate, weekStart]);

  const today = format(new Date(), "yyyy-MM-dd");

  // Get my professional ID if role is professional
  useEffect(() => {
    if (!isProfessional || !user || !barbershop) return;
    supabase.from("professionals").select("id").eq("barbershop_id", barbershop.id).eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMyProfessionalId(data.id);
          setSelectedPro(data.id);
        }
      });
  }, [isProfessional, user, barbershop]);

  const fetchData = useCallback(async () => {
    if (!barbershop) return;
    if (isProfessional && !myProfessionalId) return;
    setIsLoading(true);
    const start = format(days[0], "yyyy-MM-dd");
    const end = format(days[days.length - 1], "yyyy-MM-dd");

    let apptQuery = supabase.from("appointments")
      .select("*, services(name, duration_minutes, price), professionals(name, avatar_url)")
      .eq("barbershop_id", barbershop.id).gte("date", start).lte("date", end)
      .order("start_time", { ascending: true });

    if (isProfessional && myProfessionalId) {
      apptQuery = apptQuery.eq("professional_id", myProfessionalId);
    }

    const [appRes, blockRes, recurringBlockRes, proRes, svcRes] = await Promise.all([
      apptQuery,
      supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).eq("recurring", false),
      supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).eq("recurring", true),
      supabase.from("professionals").select("*").eq("barbershop_id", barbershop.id).eq("active", true),
      supabase.from("services").select("*").eq("barbershop_id", barbershop.id).eq("active", true),
    ]);
    const datedBlocks = (blockRes.data || []).filter((block: any) => {
      const blockDate = getBlockedTimeDate(block);
      return blockDate && blockDate >= start && blockDate <= end;
    });
    setAppointments(appRes.data || []);
    setBlockedTimes([...datedBlocks, ...(recurringBlockRes.data || [])]);
    setProfessionals(proRes.data || []);
    setServices(svcRes.data || []);
    setIsLoading(false);
  }, [barbershop, days, isProfessional, myProfessionalId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!barbershop) return;
    const channel = supabase
      .channel("agenda-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `barbershop_id=eq.${barbershop.id}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "blocked_times", filter: `barbershop_id=eq.${barbershop.id}` }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [barbershop, fetchData]);

  const handleAction = async (id: string, status: string, message: string, extra?: Record<string, unknown>) => {
    await supabase.from("appointments").update({ status: status as any, ...(extra || {}) }).eq("id", id);
    toast({ title: message });
    setSelectedAppt(null);
    setCancelReason("");
    await fetchData();
  };

  const handleCancel = async () => {
    if (!selectedAppt) return;
    await supabase.from("appointments").update({ status: "cancelled" as const, cancellation_reason: cancelReason || null }).eq("id", selectedAppt.id);
    toast({ title: "Agendamento cancelado." });
    setSelectedAppt(null);
    setCancelReason("");
    await fetchData();
  };

  const handleNoShow = async () => {
    if (!selectedAppt) return;
    // no-show é um status próprio, semanticamente diferente de cancelamento
    await supabase.from("appointments").update({
      status: "no_show" as const,
      cancellation_reason: cancelReason || "No-show",
    }).eq("id", selectedAppt.id);
    toast({
      title: "No-show registrado",
      description: `${selectedAppt.client_name} marcado como não compareceu.`,
    });
    setSelectedAppt(null);
    setCancelReason("");
    await fetchData();
  };

  const handleBlockTime = async () => {
    if (!barbershop) return;
    const { error } = await supabase.from("blocked_times").insert({
      barbershop_id: barbershop.id,
      date: blockForm.date,
      start_time: blockForm.all_day ? null : blockForm.start_time,
      end_time: blockForm.all_day ? null : blockForm.end_time,
      reason: blockForm.reason || null,
      professional_id: blockForm.professional_id === "all" ? null : blockForm.professional_id,
      all_day: blockForm.all_day,
      recurring: blockForm.recurring,
      recurring_days: blockForm.recurring ? blockForm.recurring_days : null,
    });
    if (error) {
      toast({ title: "Erro ao bloquear horário", description: error.message, variant: "destructive" });
    } else {
      toast({ title: blockForm.recurring ? "Bloqueio recorrente criado" : "Horário bloqueado com sucesso" });
      setShowBlockDialog(false);
      setBlockForm({ date: "", start_time: "", end_time: "", reason: "", professional_id: "all", all_day: false, recurring: false, recurring_days: [] });
      await fetchData();
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    await supabase.from("blocked_times").delete().eq("id", blockId);
    toast({ title: "Bloqueio removido" });
    await fetchData();
  };

  const normalizedAppts = useMemo(
    () => appointments.map((appointment) => normalizeAgendaAppointment(appointment)),
    [appointments]
  );

  // Agregados de cliente para enriquecer os cards com visit count e histórico
  const clientAggregates = useMemo(() => buildClientAggregates(appointments), [appointments]);

  const filteredAppts = useMemo(() => {
    return normalizedAppts.filter((appointment) => {
      if (selectedPro !== "all" && appointment.professionalId !== selectedPro) return false;
      if (selectedStatus !== "all" && appointment.displayStatus !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!appointment.clientName?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [normalizedAppts, selectedPro, selectedStatus, searchQuery]);

  const scopedProfessionals = useMemo(() => {
    if (isProfessional && myProfessionalId) {
      return professionals.filter((professional) => professional.id === myProfessionalId);
    }
    if (selectedPro === "all") return professionals;
    return professionals.filter((professional) => professional.id === selectedPro);
  }, [isProfessional, myProfessionalId, professionals, selectedPro]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const agendaMetrics = useMemo(() => computeAgendaMetrics({
    appointments: filteredAppts,
    blockedTimes,
    selectedDate: selectedDateStr,
    hours,
    professionals: scopedProfessionals,
  }), [filteredAppts, blockedTimes, selectedDateStr, hours, scopedProfessionals]);

  const dayAppts = useMemo(
    () => filteredAppts.filter((appointment) => appointment.date === selectedDateStr),
    [filteredAppts, selectedDateStr]
  );

  const dayStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { scheduled: 0, confirmed: 0, completed: 0, cancelled: 0, no_show: 0 };
    dayAppts.forEach((appointment) => {
      counts[appointment.displayStatus] = (counts[appointment.displayStatus] || 0) + 1;
    });
    return counts;
  }, [dayAppts]);

  const topPro = useMemo(() => {
    if (professionals.length === 0) return null;
    const counts: Record<string, number> = {};
    dayAppts.forEach((appointment) => {
      if (["cancelled", "no_show", "rescheduled"].includes(appointment.displayStatus)) return;
      if (!appointment.professionalId) return;
      counts[appointment.professionalId] = (counts[appointment.professionalId] || 0) + 1;
    });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!topId) return null;
    const professional = professionals.find((item) => item.id === topId[0]);
    return professional ? { name: professional.name, count: topId[1] } : null;
  }, [dayAppts, professionals]);

  // Navigate
  const goToday = () => {
    setSelectedDate(new Date());
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };
  const goPrev = () => {
    if (viewMode === "day" || viewMode === "professional") setSelectedDate(d => subDays(d, 1));
    else setWeekStart(w => subWeeks(w, 1));
  };
  const goNext = () => {
    if (viewMode === "day" || viewMode === "professional") setSelectedDate(d => addDays(d, 1));
    else setWeekStart(w => addWeeks(w, 1));
  };

  // Professional view columns
  const proColumns = viewMode === "professional"
    ? (selectedPro === "all" ? professionals : professionals.filter(p => p.id === selectedPro))
    : [];

  const getApptsForSlot = (dateStr: string, hour: number, proId?: string) => {
    return filteredAppts.filter(a => {
      if (a.date !== dateStr) return false;
      if (["cancelled", "no_show", "rescheduled"].includes(a.displayStatus)) return false;
      const slotStart = hour * 60;
      const slotEnd = slotStart + 60;
      if (a.startMinutes >= slotEnd || a.endMinutes <= slotStart) return false;
      if (proId && a.professionalId !== proId) return false;
      return true;
    });
  };

  const getBlocksForSlot = (dateStr: string, hour: number, proId?: string) => {
    const dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
    return blockedTimes.filter(b => {
      // Check professional match
      if (proId && b.professional_id && b.professional_id !== proId) return false;
      // Check date match: exact date or recurring weekday
      const dateMatch = b.recurring
        ? (b.recurring_days || []).includes(dayOfWeek)
        : getBlockedTimeDate(b) === dateStr;
      if (!dateMatch) return false;
      if (b.all_day) return true;
      if (!b.start_time || !b.end_time) return false;
      const bStart = parseInt(b.start_time);
      const bEnd = parseInt(b.end_time);
      return hour >= bStart && hour < bEnd;
    });
  };

  // Card renderer
  const AppointmentCard = ({ event, compact = false }: { event: any; compact?: boolean }) => {
    const sc = statusConfig[event.displayStatus] || statusConfig.scheduled;
    const timeBucketLabel = event.isCurrent ? "Agora" : formatRelativeVisitDay(event.date);
    const isVip = isVipAppointment(event);
    const duration = `${event.durationMinutes || event.services?.duration_minutes || 30} min`;

    // Revenue intelligence: enriquecer o card com dados do cliente
    const clientKey = getClientKeyFromAppointment(event);
    const aggregate = clientAggregates.get(clientKey);
    const visitCount = aggregate?.appointmentCount ?? null;
    const totalSpent = aggregate?.totalSpent ?? null;
    const hadNoShow = aggregate?.cancelledAppointments?.some(
      (a: any) => String(a.cancellation_reason || "").toLowerCase().includes("no-show") ||
                  String(a.cancellation_reason || "").toLowerCase().includes("não compareceu") ||
                  a.status === "no_show"
    ) ?? false;
    const price = Number(event.price || event.services?.price || 0);

    return (
      <div
        onClick={(e) => { e.stopPropagation(); setSelectedAppt(event); }}
        className={`group relative overflow-hidden rounded-xl border ${sc.border} ${sc.bg} cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(10,14,18,0.16)] hover:border-primary/25 active:scale-[0.99]`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-60" />
        <div className="flex items-start gap-2.5 p-2.5 sm:p-3">
          <div className={`mt-0.5 h-10 w-1 rounded-full ${isVip ? "bg-sky-400" : sc.dot} shadow-[0_0_14px_rgba(34,197,94,0.2)]`} />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                  {event.serviceName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {event.clientName}
                  </p>
                  {hadNoShow && (
                    <span title="Cliente teve no-show anteriormente" className="shrink-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/15">
                      <UserX className="h-2.5 w-2.5 text-rose-500" />
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary" className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${isVip ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300" : `${sc.border} ${sc.bg} ${sc.color}`}`}>
                  <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${isVip ? "bg-sky-400" : sc.dot}`} />
                  {isVip ? "VIP" : sc.label}
                </Badge>
                <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground/75">{timeBucketLabel}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/55 px-2 py-1 text-[10px] font-medium text-foreground/85 backdrop-blur-sm">
                <Clock className="h-3 w-3 text-primary/80" />
                <span className="tabular-nums">{event.start_time?.slice(0, 5)}-{event.end_time?.slice(0, 5)}</span>
              </span>
              {price > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <DollarSign className="h-3 w-3" />
                  R$ {price.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                </span>
              )}
              {!compact && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/45 px-2 py-1 text-[10px] font-medium text-muted-foreground/85">
                  <User className="h-3 w-3" />
                  {event.professionalName?.split(" ")[0]}
                </span>
              )}
            </div>

            {/* Revenue intelligence row */}
            {!compact && (visitCount !== null || totalSpent !== null) && (
              <div className="flex items-center gap-2 pt-0.5">
                {visitCount !== null && visitCount > 0 && (
                  <span className="text-[10px] text-muted-foreground/55 font-medium">
                    #{visitCount}ª visita
                  </span>
                )}
                {totalSpent !== null && totalSpent > 0 && (
                  <span className="text-[10px] text-muted-foreground/45">
                    · LTV R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                  </span>
                )}
              </div>
            )}

            {!compact && event.notes && (
              <p className="truncate text-[10px] text-muted-foreground/72">{event.notes}</p>
            )}

            {compact && (
              <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground/72">
                <span className="truncate">{event.professionalName?.split(" ")[0]}</span>
                {price > 0 ? (
                  <span className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">R$ {price.toLocaleString("pt-BR")}</span>
                ) : (
                  <span className="tabular-nums">{duration}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const statsCards = [
    { label: selectedDateStr === today ? "Agendamentos hoje" : "Agendamentos no dia", value: String(agendaMetrics.appointmentsToday), sub: `${agendaMetrics.appointmentsThisWeek} na semana`, icon: CalendarDays },
    { label: "Receita estimada", value: `R$${agendaMetrics.estimatedRevenueToday.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, sub: selectedDateStr === today ? "considera agenda de hoje" : "considera data selecionada", icon: DollarSign },
    { label: "HorÃ¡rios livres", value: String(agendaMetrics.freeSlots), sub: "janela estimada disponÃ­vel", icon: Clock },
    { label: "Cancelamentos", value: String(agendaMetrics.cancellationsToday), sub: agendaMetrics.noShowToday > 0 ? `${agendaMetrics.noShowToday} no-show` : topPro ? `${topPro.count} atend.` : "sem dados", icon: TrendingUp },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-28 sm:pb-8 px-0.5 sm:px-0">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:gap-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Agenda
                </h2>
                {isProfessional && <Badge variant="secondary" className="text-[10px] rounded-full">Minha agenda</Badge>}
              </div>
              <p className="text-[11px] sm:text-sm text-muted-foreground">
                {viewMode === "day"
                  ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
                  : `${format(days[0], "dd MMM", { locale: ptBR })} - ${format(days[days.length - 1], "dd MMM yyyy", { locale: ptBR })}`
                }
              </p>
            </div>
          </div>

          {/* Action buttons */}
          {canViewFullAgenda && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="gap-1.5 rounded-xl text-xs hidden sm:flex"
                onClick={() => {
                  setNewApptDefaults({ date: selectedDate });
                  setShowNewAppt(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Novo agendamento
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-xl text-xs hidden sm:flex"
                onClick={() => {
                  setBlockForm(f => ({ ...f, date: format(selectedDate, "yyyy-MM-dd") }));
                  setShowBlockDialog(true);
                }}
              >
                <Ban className="h-3.5 w-3.5" /> Bloquear
              </Button>
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto rounded-2xl border border-border/50 bg-card/80 p-2 shadow-sm backdrop-blur-sm sm:gap-2.5">
          {/* View mode toggle */}
          <div className="flex items-center rounded-xl border border-border/50 bg-muted/35 p-0.5">
            {([
              { key: "day" as const, icon: CalendarDays, label: "Dia" },
              { key: "week" as const, icon: CalendarRange, label: "Semana" },
              { key: "professional" as const, icon: Users, label: "Por barbeiro" },
            ]).map(v => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-2 text-[11px] sm:text-xs font-medium rounded-lg transition-all min-h-[40px] sm:min-h-[36px] ${
                  viewMode === v.key
                    ? "border border-border/60 bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                <v.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          {/* Professional filter */}
          {!isProfessional && (
            <Select value={selectedPro} onValueChange={setSelectedPro}>
              <SelectTrigger className="h-9 w-auto min-w-[160px] rounded-xl text-xs bg-card">
                <SelectValue placeholder="Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {professionals.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-9 w-auto min-w-[148px] rounded-xl text-xs bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
              <SelectItem value="no_show">No-show</SelectItem>
            </SelectContent>
          </Select>

          {/* Busca por nome de cliente */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-auto min-w-[160px] pl-8 rounded-xl text-xs bg-card"
            />
          </div>

          <Input
            type="date"
            value={selectedDateStr}
            onChange={(e) => {
              const nextDate = new Date(`${e.target.value}T12:00:00`);
              setSelectedDate(nextDate);
              setWeekStart(startOfWeek(nextDate, { weekStartsOn: 1 }));
            }}
            className="h-9 w-auto min-w-[160px] rounded-xl text-xs bg-card"
          />

          {/* Date navigation */}
          <div className="ml-auto flex items-center rounded-xl border border-border/50 bg-muted/35 p-0.5">
            <Button variant="ghost" size="sm" className="rounded-lg h-9 w-9 p-0" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-lg text-xs px-3 h-9 font-medium" onClick={goToday}>
              Hoje
            </Button>
            <Button variant="ghost" size="sm" className="rounded-lg h-9 w-9 p-0" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile action buttons */}
          {canViewFullAgenda && (
            <div className="flex items-center gap-1.5 sm:hidden">
              <Button
                size="sm"
                className="gap-1.5 rounded-xl text-xs h-10 px-3"
                onClick={() => {
                  setNewApptDefaults({ date: selectedDate });
                  setShowNewAppt(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-xl text-xs h-10 px-3"
                onClick={() => {
                  setBlockForm(f => ({ ...f, date: format(selectedDate, "yyyy-MM-dd") }));
                  setShowBlockDialog(true);
                }}
              >
                <Ban className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {isLoading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="rounded-2xl border border-border/50 bg-card/92 p-3 sm:p-4 shadow-[0_10px_30px_rgba(2,8,23,0.06)]">
              <Skeleton className="h-3 w-24 rounded-full" />
              <Skeleton className="mt-3 h-7 w-20 rounded-xl" />
              <Skeleton className="mt-2 h-3 w-28 rounded-full" />
            </div>
          ))}
        </motion.div>
      )}

      {/* Quick stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
        className={`${isLoading ? "hidden" : "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3"}`}
      >
        {[
          { label: selectedDateStr === today ? "Agendamentos hoje" : "Agendamentos no dia", value: String(agendaMetrics.appointmentsToday), sub: `${agendaMetrics.appointmentsThisWeek} na semana`, icon: CalendarDays },
          { label: "Receita estimada", value: `R$${agendaMetrics.estimatedRevenueToday.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, sub: selectedDateStr === today ? "considera agenda de hoje" : "considera data selecionada", icon: DollarSign },
          { label: "Horários livres", value: String(agendaMetrics.freeSlots), sub: "janela estimada disponível", icon: Clock },
          { label: "Cancelamentos", value: String(agendaMetrics.cancellationsToday), sub: agendaMetrics.noShowToday > 0 ? `${agendaMetrics.noShowToday} no-show` : topPro ? `${topPro.count} atend.` : "sem dados", icon: TrendingUp },
        ].map((s, i) => (
          <div key={i} className="group rounded-2xl border border-border/50 bg-card/92 p-3 sm:p-4 shadow-[0_10px_30px_rgba(2,8,23,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_16px_40px_rgba(2,8,23,0.12)] active:scale-[0.99]">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold leading-tight">{s.label}</p>
              <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors">
                <s.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/60" />
              </div>
            </div>
            <p className="text-base sm:text-xl font-extrabold text-foreground tracking-tight leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.value}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground/50 mt-1 sm:mt-0.5 font-medium">{s.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Status legend (mobile) */}
      <div className="flex flex-wrap gap-2 sm:hidden">
        {Object.entries(statusConfig).filter(([k]) => k !== "rescheduled").map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${cfg.dot}`} />
            <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { key: "scheduled", label: "Agendados", value: dayStatusCounts.scheduled },
          { key: "confirmed", label: "Confirmados", value: dayStatusCounts.confirmed },
          { key: "completed", label: "Concluídos", value: dayStatusCounts.completed },
          { key: "cancelled", label: "Cancelados", value: dayStatusCounts.cancelled },
          { key: "no_show", label: "No-show", value: dayStatusCounts.no_show },
        ].map((item) => {
          const cfg = statusConfig[item.key];
          return (
            <div key={item.key} className={`rounded-2xl border ${cfg.border} ${cfg.bg} px-3 py-2.5 shadow-sm`}>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</p>
              <p className={`text-lg font-bold ${cfg.color}`}>{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: "Passados", value: agendaMetrics.pastCount },
          { label: "Em andamento", value: agendaMetrics.currentCount },
          { label: "Futuros", value: agendaMetrics.futureCount },
          { label: "Concluídos na semana", value: agendaMetrics.completedThisWeek },
        ].map((item) => (
          <Badge key={item.label} variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
            {item.label}: {item.value}
          </Badge>
        ))}
      </div>

      {/* Calendar Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="overflow-hidden rounded-[1.4rem] border border-border/50 bg-card/95 shadow-[0_28px_80px_rgba(2,8,23,0.16)]"
      >
        {isLoading && (
          <div className="space-y-0">
            <div className="border-b border-border/40 bg-muted/20 p-4">
              <Skeleton className="h-5 w-48 rounded-full" />
            </div>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="grid border-b border-border/30 last:border-b-0" style={{ gridTemplateColumns: `84px minmax(0, 1fr)` }}>
                <div className="border-r border-border/35 bg-muted/15 p-3">
                  <Skeleton className="ml-auto h-4 w-12 rounded-full" />
                </div>
                <div className="p-2">
                  <Skeleton className="h-[58px] w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile day list (for day view on small screens) */}
        {!isLoading && viewMode === "day" && (
          <div className="block sm:hidden">
            {/* Day header */}
            <div className="p-4 border-b border-border/40 bg-muted/20">
              <p className="text-sm font-semibold text-foreground capitalize">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{dayAppts.length} agendamentos</p>
            </div>

            {/* Mobile card list */}
            <div className="divide-y divide-border/30">
              {hours.map(hour => {
                const h = parseInt(hour);
                const dateStr = format(selectedDate, "yyyy-MM-dd");
                const slotAppts = getApptsForSlot(dateStr, h);
                const slotBlocks = getBlocksForSlot(dateStr, h);

                return (
                  <div key={hour} className="flex group/row hover:bg-accent/10 transition-colors">
                    <div className="w-[60px] shrink-0 border-r border-border/40 bg-muted/20 py-3.5 pr-3 text-right">
                      <span className="text-[11px] font-semibold text-muted-foreground/80 tabular-nums">{hour}</span>
                    </div>
                    <div className={`flex-1 min-h-[72px] px-3 py-2.5 ${
                      slotBlocks.length > 0 && slotAppts.length === 0
                        ? (slotBlocks[0]?.reason || "").toLowerCase().includes("almoço") ? "bg-amber-500/5" :
                          (slotBlocks[0]?.reason || "").toLowerCase().includes("pausa") ? "bg-blue-500/5" :
                          "bg-muted/20"
                        : ""
                    }`}>
                      {slotAppts.length > 0 ? (
                        <div className="space-y-2">
                          {slotAppts.map(event => (
                            <AppointmentCard key={event.id} event={event} />
                          ))}
                        </div>
                      ) : slotBlocks.length > 0 ? (
                        <div className="flex min-h-[52px] items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5">
                          <span className="text-xs">
                            {(slotBlocks[0]?.reason || "").toLowerCase().includes("almoço") ? "🍽️" :
                             (slotBlocks[0]?.reason || "").toLowerCase().includes("pausa") ? "☕" : "🚫"}
                          </span>
                          <span className="text-[11px] text-muted-foreground/60">
                            {slotBlocks[0]?.reason || "Bloqueado"}
                            {slotBlocks[0]?.recurring && " · Recorrente"}
                          </span>
                          {canViewFullAgenda && (
                            <button onClick={() => handleDeleteBlock(slotBlocks[0].id)} className="text-[11px] text-destructive/60 hover:text-destructive ml-auto min-h-[44px] min-w-[48px] flex items-center justify-end active:text-destructive">
                              Remover
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {dayAppts.length === 0 && (
              <div className="p-8 text-center">
                <CalendarOff className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum agendamento</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Não há agendamentos para este dia
                </p>
              </div>
            )}
          </div>
        )}

        {/* Desktop grid (day, week, professional views) */}
        {!isLoading && (
          <div className={`${viewMode === "day" ? "hidden sm:block" : ""} overflow-x-auto`}>
          <div className="min-w-[720px]">
            {viewMode === "professional" ? (
              <>
                {/* Professional columns header */}
                <div className="border-b border-border/50 bg-muted/30"
                  style={{ display: "grid", gridTemplateColumns: `84px repeat(${proColumns.length}, minmax(220px, 1fr))` }}
                >
                  <div className="border-r border-border/40 bg-muted/20 p-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/60">Hora</div>
                  {proColumns.map(p => (
                    <div key={p.id} className="p-3 text-center border-l border-border/30">
                      <div className="flex items-center justify-center gap-2">
                        <ProfessionalAvatar
                          name={p.name}
                          avatarUrl={p.avatar_url}
                          className="h-8 w-8 rounded-xl border border-border/60"
                          fallbackClassName="rounded-xl text-xs"
                          imageClassName="object-cover"
                        />
                        <div className="text-left">
                          <span className="text-sm font-medium text-foreground block">{p.name}</span>
                          <span className="text-[10px] text-muted-foreground">{p.role || "Barbeiro"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Professional rows */}
                {hours.map(hour => {
                  const h = parseInt(hour);
                  return (
                    <div key={hour} className="border-b border-border/30 last:border-b-0 hover:bg-accent/8 transition-colors"
                      style={{ display: "grid", gridTemplateColumns: `84px repeat(${proColumns.length}, minmax(220px, 1fr))` }}
                    >
                      <div className="border-r border-border/35 bg-muted/15 p-3 text-right text-xs font-semibold tabular-nums text-muted-foreground/75">{hour}</div>
                      {proColumns.map(pro => {
                        const dateStr = format(selectedDate, "yyyy-MM-dd");
                        const proAppts = getApptsForSlot(dateStr, h, pro.id);
                        return (
                          <div key={pro.id} className="min-h-[76px] border-l border-border/30 p-2 transition-colors hover:bg-accent/10">
                            {proAppts.map(event => (
                              <AppointmentCard key={event.id} event={event} compact />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {proColumns.length === 0 && (
                  <div className="p-12 text-center">
                    <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">Nenhum profissional cadastrado</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Day/Week headers */}
                <div style={{ display: "grid", gridTemplateColumns: `84px repeat(${days.length}, minmax(190px, 1fr))` }}
                  className="border-b border-border/50 bg-muted/30"
                >
                  <div className="border-r border-border/35 bg-muted/15 p-3" />
                  {days.map((d, i) => {
                    const isToday = format(d, "yyyy-MM-dd") === today;
                    const dayApptCount = filteredAppts.filter(a => a.date === format(d, "yyyy-MM-dd") && !["cancelled", "no_show", "rescheduled"].includes(a.displayStatus)).length;
                    return (
                      <div
                        key={i}
                        className={`p-3 text-center border-l border-border/40 cursor-pointer hover:bg-accent/30 transition-colors ${isToday ? "bg-primary/5" : ""}`}
                        onClick={() => { setSelectedDate(d); setViewMode("day"); }}
                      >
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">
                          {format(d, "EEE", { locale: ptBR })}
                        </span>
                        <p className={`text-sm font-bold mt-0.5 ${isToday ? "text-primary" : "text-foreground"}`}>
                          {isToday ? (
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm">{format(d, "dd")}</span>
                          ) : format(d, "dd")}
                        </p>
                        {dayApptCount > 0 && (
                          <p className="text-[9px] text-muted-foreground mt-0.5">{dayApptCount} agend.</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                {hours.map(hour => {
                  const h = parseInt(hour);
                  return (
                    <div key={hour} className={`border-b border-border/30 last:border-b-0 ${parseInt(hour) % 2 === 0 ? '' : 'bg-muted/[0.03]'}`}
                      style={{ display: "grid", gridTemplateColumns: `84px repeat(${days.length}, minmax(190px, 1fr))` }}
                    >
                      <div className="select-none border-r border-border/35 bg-muted/15 p-3 pr-4 text-right text-xs font-semibold tabular-nums text-muted-foreground/75">
                        {hour}
                      </div>
                      {days.map((day, dayIdx) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const slotAppts = getApptsForSlot(dateStr, h);
                        const slotBlocks = getBlocksForSlot(dateStr, h);
                        const isToday = dateStr === today;

                        // Conflict detection
                        const proIds = slotAppts.map(a => a.professionalId);
                        const hasConflict = proIds.length !== new Set(proIds).size;

                        const showTimeLine = isToday && currentMinute >= h * 60 && currentMinute < (h + 1) * 60;
                        const timeLineTop = showTimeLine ? ((currentMinute - h * 60) / 60) * 100 : 0;

                        return (
                          <div key={dayIdx}
                            className={`group/cell relative min-h-[78px] border-l border-border/30 px-2 py-2 transition-all duration-150 cursor-pointer ${
                              slotAppts.length === 0 && slotBlocks.length === 0 ? 'hover:bg-primary/[0.04]' : 'hover:bg-accent/10'
                            } ${
                              slotBlocks.length > 0
                                ? (slotBlocks[0]?.reason || "").toLowerCase().includes("almoço") ? "bg-amber-500/[0.04]" :
                                  (slotBlocks[0]?.reason || "").toLowerCase().includes("pausa") ? "bg-blue-500/[0.04]" :
                                  "bg-muted/[0.06]"
                                : ""
                            } ${isToday ? "bg-primary/[0.025]" : ""}`}
                            onClick={() => {
                              if (slotAppts.length === 0 && slotBlocks.length === 0 && canViewFullAgenda) {
                                setNewApptDefaults({ date: day, time: `${String(h).padStart(2, "0")}:00` });
                                setShowNewAppt(true);
                              }
                            }}
                          >
                            {/* Current time indicator */}
                            {showTimeLine && (
                              <div
                                className="absolute left-0 right-0 z-20 pointer-events-none"
                                style={{ top: `${timeLineTop}%` }}
                              >
                                <div className="flex items-center">
                                  <div className="h-3 w-3 rounded-full bg-primary border-2 border-card -ml-1.5 shrink-0 shadow-sm" />
                                  <div className="h-[2px] flex-1 bg-primary/70 shadow-[0_0_6px_hsl(var(--primary)/0.3)]" />
                                </div>
                              </div>
                            )}
                            {hasConflict && (
                              <div className="absolute top-0.5 right-0.5 z-10" title="Conflito de horário">
                                <AlertCircle className="h-3 w-3 text-destructive" />
                              </div>
                            )}
                            <div className="space-y-1">
                              {slotAppts.map(event => (
                                <AppointmentCard key={event.id} event={event} compact={viewMode === "week"} />
                              ))}
                            </div>
                            {slotBlocks.length > 0 && slotAppts.length === 0 && (
                              <div className={`flex h-full items-center justify-center rounded-xl border px-3 py-2 text-center ${getBlockTone(slotBlocks[0]?.reason).chipClass}`}>
                                <span className="text-xs mr-1">
                                  {(slotBlocks[0]?.reason || "").toLowerCase().includes("almoço") ? "🍽️" :
                                   (slotBlocks[0]?.reason || "").toLowerCase().includes("pausa") ? "☕" : "🚫"}
                                </span>
                                <span className="text-[9px] text-muted-foreground">
                                  {slotBlocks[0]?.reason || "Bloqueado"}
                                </span>
                              </div>
                            )}
                            {/* Quick add hint on empty slots */}
                            {slotAppts.length === 0 && slotBlocks.length === 0 && canViewFullAgenda && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity cursor-pointer">
                                <Plus className="h-4 w-4 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </div>
          </div>
        )}
      </motion.div>

      {/* Blocked times summary for the day */}
      {!isLoading && viewMode === "day" && (() => {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const dayOfWeek = selectedDate.getDay();
        const dayBlocks = blockedTimes.filter(b =>
          b.recurring
            ? (b.recurring_days || []).includes(dayOfWeek)
            : getBlockedTimeDate(b) === dateStr
        );
        if (dayBlocks.length === 0) return null;
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden sm:block">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground/70">Horários bloqueados</p>
            <div className="flex flex-wrap gap-2">
              {dayBlocks.map(b => {
                const isLunch = (b.reason || "").toLowerCase().includes("almoço");
                const isPause = (b.reason || "").toLowerCase().includes("pausa");
                return (
                  <div key={b.id} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
                    isLunch ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400" :
                    isPause ? "border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-400" :
                    "border-border/50 bg-muted/30 text-muted-foreground"
                  }`}>
                    <span>{isLunch ? "🍽️" : isPause ? "☕" : "🚫"}</span>
                    <span>{b.all_day ? "Dia inteiro" : `${b.start_time?.slice(0, 5)} - ${b.end_time?.slice(0, 5)}`}</span>
                    {b.reason && <span className="opacity-60">· {b.reason}</span>}
                    {b.recurring && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded-full">Recorrente</Badge>
                    )}
                    {b.professional_id && professionals.find(p => p.id === b.professional_id) && (
                      <span className="opacity-60">· {professionals.find(p => p.id === b.professional_id)?.name?.split(" ")[0]}</span>
                    )}
                    {canViewFullAgenda && (
                      <button onClick={() => handleDeleteBlock(b.id)} className="text-destructive/60 hover:text-destructive ml-1">
                        <XCircle className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })()}

      {/* Appointment detail dialog */}
      <Dialog open={!!selectedAppt} onOpenChange={o => !o && setSelectedAppt(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              Detalhes do agendamento
              {selectedAppt && (
                <Badge className={`${statusConfig[selectedAppt.displayStatus]?.bg} ${statusConfig[selectedAppt.displayStatus]?.color} border-0 text-[10px]`}>
                  {statusConfig[selectedAppt.displayStatus]?.label}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: User, label: "Cliente", value: selectedAppt.client_name },
                  { icon: Scissors, label: "Serviço", value: selectedAppt.services?.name },
                  { icon: Star, label: "Profissional", value: selectedAppt.professionals?.name },
                  { icon: Clock, label: "Horário", value: `${selectedAppt.start_time?.slice(0, 5)} - ${selectedAppt.end_time?.slice(0, 5)}` },
                  { icon: CalendarDays, label: "Data", value: selectedAppt.date ? format(new Date(selectedAppt.date + "T12:00:00"), "dd/MM/yyyy") : "" },
                  { icon: DollarSign, label: "Valor", value: `R$ ${Number(selectedAppt.price || 0).toFixed(2)}` },
                  { icon: Phone, label: "Telefone", value: selectedAppt.client_phone || "Não informado" },
                  { icon: Clock, label: "Duração", value: `${selectedAppt.services?.duration_minutes || 30} min` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</span>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedAppt.notes && (
                <div className="rounded-xl bg-muted/30 border border-border/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Observações</span>
                  </div>
                  <p className="text-sm text-foreground">{selectedAppt.notes}</p>
                </div>
              )}

              {/* Action buttons */}
              {(canViewFullAgenda || !isProfessional) && !["cancelled", "completed", "no_show"].includes(selectedAppt.displayStatus) && (
                <div className="flex flex-wrap gap-2">
                  {selectedAppt.displayStatus === "scheduled" && (
                    <>
                      <Button size="sm" className="gap-1.5 rounded-xl flex-1" onClick={() => handleAction(selectedAppt.id, "confirmed", "Agendamento confirmado!")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={() => handleAction(selectedAppt.id, "completed", "Atendimento concluído!")}>
                        Concluir
                      </Button>
                    </>
                  )}
                  {selectedAppt.displayStatus === "confirmed" && (
                    <>
                      <Button size="sm" className="gap-1.5 rounded-xl flex-1" onClick={() => handleAction(selectedAppt.id, "completed", "Atendimento concluído!")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-xl border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                        onClick={handleNoShow}
                      >
                        <UserX className="h-3.5 w-3.5" /> No-show
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* WhatsApp */}
              {selectedAppt.client_phone && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 rounded-xl border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                  onClick={() => {
                    const url = buildWhatsAppUrl({ clientName: selectedAppt.client_name, clientPhone: selectedAppt.client_phone, barbershopName: barbershop?.name || "", serviceName: selectedAppt.services?.name || "", date: selectedAppt.date, startTime: selectedAppt.start_time?.slice(0, 5), endTime: selectedAppt.end_time?.slice(0, 5), price: Number(selectedAppt.price || 0), professionalName: selectedAppt.professionals?.name, type: "confirmed" });
                    if (url) window.open(url, "_blank", "noopener,noreferrer");
                  }}
                >
                  <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
                </Button>
              )}

              {/* Cancel */}
              {canViewFullAgenda && !["cancelled", "completed", "no_show"].includes(selectedAppt.displayStatus) && (
                <div className="border-t border-border/40 pt-4 space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cancelar agendamento</Label>
                  <Input placeholder="Motivo (opcional)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="bg-card rounded-xl" />
                  <Button size="sm" variant="destructive" className="gap-1.5 rounded-xl w-full" onClick={handleCancel}>
                    <XCircle className="h-3.5 w-3.5" /> Cancelar agendamento
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Block time dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Ban className="h-5 w-5 text-muted-foreground" />
              Bloquear horário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Quick presets */}
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {[
                  { label: "Almoço", icon: "🍽️", start: "12:00", end: "13:00", reason: "Almoço" },
                  { label: "Pausa", icon: "☕", start: "", end: "", reason: "Pausa" },
                  { label: "Folga", icon: "🏖️", start: "", end: "", reason: "Folga", allDay: true },
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBlockForm(f => ({
                      ...f,
                      start_time: preset.start,
                      end_time: preset.end,
                      reason: preset.reason,
                      all_day: preset.allDay || false,
                    }))}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all hover:border-primary/40 hover:bg-accent/50 ${
                      blockForm.reason === preset.reason ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <span className="text-base">{preset.icon}</span>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Profissional</Label>
              <Select value={blockForm.professional_id} onValueChange={v => setBlockForm(f => ({ ...f, professional_id: v }))}>
                <SelectTrigger className="rounded-xl mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {professionals.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Data</Label>
              <Input
                type="date"
                value={blockForm.date}
                onChange={e => setBlockForm(f => ({ ...f, date: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="all-day"
                checked={blockForm.all_day}
                onChange={e => setBlockForm(f => ({ ...f, all_day: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="all-day" className="text-xs cursor-pointer">Dia inteiro</Label>
            </div>

            {!blockForm.all_day && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Início</Label>
                  <Input
                    type="time"
                    value={blockForm.start_time}
                    onChange={e => setBlockForm(f => ({ ...f, start_time: e.target.value }))}
                    className="rounded-xl mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Fim</Label>
                  <Input
                    type="time"
                    value={blockForm.end_time}
                    onChange={e => setBlockForm(f => ({ ...f, end_time: e.target.value }))}
                    className="rounded-xl mt-1"
                  />
                </div>
              </div>
            )}

            {/* Recurring toggle */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">Recorrente</p>
                  <p className="text-[10px] text-muted-foreground">Repetir toda semana nos dias selecionados</p>
                </div>
                <Switch
                  checked={blockForm.recurring}
                  onCheckedChange={v => setBlockForm(f => ({ ...f, recurring: v, recurring_days: v ? [new Date(f.date || Date.now()).getDay()] : [] }))}
                />
              </div>
              {blockForm.recurring && (
                <div className="flex gap-1.5">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBlockForm(f => ({
                        ...f,
                        recurring_days: (f.recurring_days || []).includes(i)
                          ? (f.recurring_days || []).filter(x => x !== i)
                          : [...(f.recurring_days || []), i].sort()
                      }))}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-medium transition-all ${
                        (blockForm.recurring_days || []).includes(i)
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-card text-muted-foreground hover:bg-accent/50 border border-border/40"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs">Motivo</Label>
              <Input
                placeholder="Ex: Almoço, Folga, Reunião"
                value={blockForm.reason}
                onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))}
                className="rounded-xl mt-1"
              />
            </div>

            <Button className="w-full rounded-xl gap-2" onClick={handleBlockTime} disabled={!blockForm.date || (!blockForm.all_day && (!blockForm.start_time || !blockForm.end_time))}>
              <Ban className="h-4 w-4" /> Bloquear
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <NewAppointmentDialog
        open={showNewAppt}
        onOpenChange={setShowNewAppt}
        professionals={professionals}
        services={services}
        defaultDate={newApptDefaults.date}
        defaultTime={newApptDefaults.time}
        defaultProfessionalId={newApptDefaults.proId}
        onCreated={fetchData}
      />
    </div>
  );
}


