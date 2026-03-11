import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, CalendarDays, MessageCircle,
  Clock, User, Scissors, DollarSign, XCircle, CheckCircle2, Star,
  LayoutGrid, CalendarRange, Users, AlertCircle, Phone, FileText,
  Plus, Ban, CalendarOff, TrendingUp, UserX,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { motion, AnimatePresence } from "framer-motion";
import NewAppointmentDialog from "@/components/agenda/NewAppointmentDialog";

type ViewMode = "day" | "week" | "professional";

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  scheduled: { label: "Agendado", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20", dot: "bg-amber-500" },
  confirmed: { label: "Confirmado", color: "text-primary", bg: "bg-primary/5", border: "border-primary/20", dot: "bg-primary" },
  completed: { label: "Concluído", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500" },
  rescheduled: { label: "Remarcado", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", dot: "bg-blue-500" },
  cancelled: { label: "Cancelado", color: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/20", dot: "bg-destructive" },
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
      .then(({ data }) => { if (data) setMyProfessionalId(data.id); });
  }, [isProfessional, user, barbershop]);

  const fetchData = useCallback(async () => {
    if (!barbershop) return;
    if (isProfessional && !myProfessionalId) return;
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
      supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).eq("recurring", false).gte("date", start).lte("date", end),
      supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).eq("recurring", true),
      supabase.from("professionals").select("*").eq("barbershop_id", barbershop.id).eq("active", true),
      supabase.from("services").select("*").eq("barbershop_id", barbershop.id).eq("active", true),
    ]);
    setAppointments(appRes.data || []);
    setBlockedTimes([...(blockRes.data || []), ...(recurringBlockRes.data || [])]);
    setProfessionals(proRes.data || []);
    setServices(svcRes.data || []);
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

  const handleAction = async (id: string, status: string, message: string) => {
    await supabase.from("appointments").update({ status: status as any }).eq("id", id);
    toast({ title: message });
    setSelectedAppt(null);
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

  // Filtered appointments
  const filteredAppts = useMemo(() => {
    if (selectedPro === "all") return appointments;
    return appointments.filter(a => a.professional_id === selectedPro);
  }, [appointments, selectedPro]);

  // Stats for today
  const todayAppts = useMemo(() => filteredAppts.filter(a => a.date === today && a.status !== "cancelled"), [filteredAppts, today]);
  const totalRevenue = useMemo(() => todayAppts.reduce((s, a) => s + Number(a.price || 0), 0), [todayAppts]);
  const freeSlots = useMemo(() => {
    const booked = todayAppts.length;
    return Math.max(0, hours.length - booked);
  }, [todayAppts, hours]);

  const topPro = useMemo(() => {
    if (professionals.length === 0) return null;
    const counts: Record<string, number> = {};
    todayAppts.forEach(a => { counts[a.professional_id] = (counts[a.professional_id] || 0) + 1; });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!topId) return null;
    const pro = professionals.find(p => p.id === topId[0]);
    return pro ? { name: pro.name, count: topId[1] } : null;
  }, [todayAppts, professionals]);

  // Navigate
  const goToday = () => {
    setSelectedDate(new Date());
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };
  const goPrev = () => {
    if (viewMode === "day") setSelectedDate(d => subDays(d, 1));
    else setWeekStart(w => subWeeks(w, 1));
  };
  const goNext = () => {
    if (viewMode === "day") setSelectedDate(d => addDays(d, 1));
    else setWeekStart(w => addWeeks(w, 1));
  };

  // Professional view columns
  const proColumns = viewMode === "professional"
    ? (selectedPro === "all" ? professionals : professionals.filter(p => p.id === selectedPro))
    : [];

  const getApptsForSlot = (dateStr: string, hour: number, proId?: string) => {
    return filteredAppts.filter(a => {
      if (a.date !== dateStr) return false;
      if (a.status === "cancelled") return false;
      const startH = parseInt(a.start_time);
      const startM = parseInt(a.start_time?.split(":")[1] || "0");
      const endH = parseInt(a.end_time);
      const endM = parseInt(a.end_time?.split(":")[1] || "0");
      const slotStart = hour * 60;
      const slotEnd = slotStart + 60;
      const apptStart = startH * 60 + startM;
      const apptEnd = endH * 60 + endM;
      if (apptStart >= slotEnd || apptEnd <= slotStart) return false;
      if (proId && a.professional_id !== proId) return false;
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
        : b.date === dateStr;
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
    const sc = statusConfig[event.status] || statusConfig.scheduled;
    return (
      <div
        onClick={() => setSelectedAppt(event)}
        className={`rounded-xl border ${sc.border} ${sc.bg} p-2 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99] overflow-hidden group`}
      >
        <div className="flex items-start gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${sc.dot} mt-1.5 shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold truncate ${sc.color}`}>{event.client_name}</p>
            {!compact && (
              <>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {event.services?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground/70 flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {event.start_time?.slice(0, 5)}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 flex items-center gap-0.5">
                    <User className="h-2.5 w-2.5" />
                    {event.professionals?.name?.split(" ")[0]}
                  </span>
                  {event.client_phone && (
                    <span className="text-[10px] text-muted-foreground/70 flex items-center gap-0.5">
                      <Phone className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-24 sm:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Agenda
                </h2>
                {isProfessional && <Badge variant="secondary" className="text-[10px] rounded-full">Minha agenda</Badge>}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {viewMode === "day"
                  ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
                  : `${format(days[0], "dd MMM", { locale: ptBR })} – ${format(days[days.length - 1], "dd MMM yyyy", { locale: ptBR })}`
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
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-muted/50 rounded-xl p-0.5">
            {([
              { key: "day" as const, icon: CalendarDays, label: "Dia" },
              { key: "week" as const, icon: CalendarRange, label: "Semana" },
              { key: "professional" as const, icon: Users, label: "Por barbeiro" },
            ]).map(v => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  viewMode === v.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <v.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          {/* Professional filter */}
          {!isProfessional && viewMode !== "professional" && (
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

          {/* Date navigation */}
          <div className="flex items-center bg-muted/50 rounded-xl p-0.5 ml-auto">
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
                className="gap-1.5 rounded-xl text-xs h-9"
                onClick={() => {
                  setNewApptDefaults({ date: selectedDate });
                  setShowNewAppt(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-xl text-xs h-9"
                onClick={() => {
                  setBlockForm(f => ({ ...f, date: format(selectedDate, "yyyy-MM-dd") }));
                  setShowBlockDialog(true);
                }}
              >
                <Ban className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "Agendamentos", value: String(todayAppts.length), sub: "hoje", icon: CalendarDays },
          { label: "Faturamento", value: `R$${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, sub: "previsto hoje", icon: DollarSign },
          { label: "Horários livres", value: String(freeSlots), sub: "disponíveis", icon: Clock },
          { label: "Destaque", value: topPro?.name?.split(" ")[0] || "--", sub: topPro ? `${topPro.count} atend.` : "sem dados", icon: TrendingUp },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-3.5 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
              <s.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
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

      {/* Calendar Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="rounded-2xl border border-border/60 bg-card overflow-hidden"
      >
        {/* Mobile day list (for day view on small screens) */}
        {viewMode === "day" && (
          <div className="block sm:hidden">
            {/* Day header */}
            <div className="p-4 border-b border-border/40 bg-muted/20">
              <p className="text-sm font-semibold text-foreground capitalize">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{todayAppts.length} agendamentos</p>
            </div>

            {/* Mobile card list */}
            <div className="divide-y divide-border/30">
              {hours.map(hour => {
                const h = parseInt(hour);
                const dateStr = format(selectedDate, "yyyy-MM-dd");
                const slotAppts = getApptsForSlot(dateStr, h);
                const slotBlocks = getBlocksForSlot(dateStr, h);

                return (
                  <div key={hour} className="flex">
                    <div className="w-14 shrink-0 py-3 pr-2 text-right">
                      <span className="text-[11px] font-medium text-muted-foreground/60">{hour}</span>
                    </div>
                    <div className={`flex-1 py-2 px-2 min-h-[56px] border-l border-border/30 ${
                      slotBlocks.length > 0 && slotAppts.length === 0
                        ? (slotBlocks[0]?.reason || "").toLowerCase().includes("almoço") ? "bg-amber-500/5" :
                          (slotBlocks[0]?.reason || "").toLowerCase().includes("pausa") ? "bg-blue-500/5" :
                          "bg-muted/20"
                        : ""
                    }`}>
                      {slotAppts.length > 0 ? (
                        <div className="space-y-1.5">
                          {slotAppts.map(event => (
                            <AppointmentCard key={event.id} event={event} />
                          ))}
                        </div>
                      ) : slotBlocks.length > 0 ? (
                        <div className="flex items-center gap-2 py-2">
                          <span className="text-xs">
                            {(slotBlocks[0]?.reason || "").toLowerCase().includes("almoço") ? "🍽️" :
                             (slotBlocks[0]?.reason || "").toLowerCase().includes("pausa") ? "☕" : "🚫"}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">
                            {slotBlocks[0]?.reason || "Bloqueado"}
                            {slotBlocks[0]?.recurring && " · Recorrente"}
                          </span>
                          {canViewFullAgenda && (
                            <button onClick={() => handleDeleteBlock(slotBlocks[0].id)} className="text-[10px] text-destructive/60 hover:text-destructive ml-auto">
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
            {todayAppts.length === 0 && (
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
        <div className={`${viewMode === "day" ? "hidden sm:block" : ""} overflow-x-auto`}>
          <div className="min-w-[700px]">
            {viewMode === "professional" ? (
              <>
                {/* Professional columns header */}
                <div className="border-b border-border/40 bg-muted/20"
                  style={{ display: "grid", gridTemplateColumns: `60px repeat(${proColumns.length}, 1fr)` }}
                >
                  <div className="p-3 text-[10px] text-muted-foreground font-medium">Hora</div>
                  {proColumns.map(p => (
                    <div key={p.id} className="p-3 text-center border-l border-border/30">
                      <div className="flex items-center justify-center gap-2">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.name} className="h-8 w-8 rounded-xl object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {p.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </div>
                        )}
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
                    <div key={hour} className="border-b border-border/20 last:border-b-0"
                      style={{ display: "grid", gridTemplateColumns: `60px repeat(${proColumns.length}, 1fr)` }}
                    >
                      <div className="p-2 text-[11px] text-muted-foreground/60 text-right pr-3 pt-3 font-medium">{hour}</div>
                      {proColumns.map(pro => {
                        const dateStr = format(selectedDate, "yyyy-MM-dd");
                        const proAppts = getApptsForSlot(dateStr, h, pro.id);
                        return (
                          <div key={pro.id} className="border-l border-border/20 p-1 min-h-[64px]">
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
                <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}
                  className="border-b border-border/40 bg-muted/20"
                >
                  <div className="p-3" />
                  {days.map((d, i) => {
                    const isToday = format(d, "yyyy-MM-dd") === today;
                    const dayApptCount = filteredAppts.filter(a => a.date === format(d, "yyyy-MM-dd") && a.status !== "cancelled").length;
                    return (
                      <div
                        key={i}
                        className={`p-3 text-center border-l border-border/30 cursor-pointer hover:bg-accent/30 transition-colors ${isToday ? "bg-primary/5" : ""}`}
                        onClick={() => { setSelectedDate(d); setViewMode("day"); }}
                      >
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
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
                    <div key={hour} className="border-b border-border/20 last:border-b-0"
                      style={{ display: "grid", gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}
                    >
                      <div className="p-2 text-[11px] text-muted-foreground/60 text-right pr-3 pt-3 font-medium">{hour}</div>
                      {days.map((day, dayIdx) => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const slotAppts = getApptsForSlot(dateStr, h);
                        const slotBlocks = getBlocksForSlot(dateStr, h);
                        const isToday = dateStr === today;

                        // Conflict detection
                        const proIds = slotAppts.map(a => a.professional_id);
                        const hasConflict = proIds.length !== new Set(proIds).size;

                        const showTimeLine = isToday && currentMinute >= h * 60 && currentMinute < (h + 1) * 60;
                        const timeLineTop = showTimeLine ? ((currentMinute - h * 60) / 60) * 100 : 0;

                        return (
                          <div key={dayIdx}
                            className={`border-l border-border/20 p-1 min-h-[64px] relative transition-colors group/cell ${
                              slotBlocks.length > 0 ? "bg-muted/10" : ""
                            } ${isToday ? "bg-primary/[0.02]" : ""}`}
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
                                  <div className="h-2 w-2 rounded-full bg-destructive -ml-1 shrink-0" />
                                  <div className="h-[2px] flex-1 bg-destructive/60" />
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
                              <div className="flex items-center justify-center h-full opacity-40">
                                <Ban className="h-3 w-3 text-muted-foreground mr-1" />
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
      </motion.div>

      {/* Blocked times summary for the day */}
      {viewMode === "day" && (() => {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const dayOfWeek = selectedDate.getDay();
        const dayBlocks = blockedTimes.filter(b =>
          b.recurring
            ? (b.recurring_days || []).includes(dayOfWeek)
            : b.date === dateStr
        );
        if (dayBlocks.length === 0) return null;
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden sm:block">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Horários bloqueados</p>
            <div className="flex flex-wrap gap-2">
              {dayBlocks.map(b => {
                const isLunch = (b.reason || "").toLowerCase().includes("almoço");
                const isPause = (b.reason || "").toLowerCase().includes("pausa");
                return (
                  <div key={b.id} className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs ${
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
                <Badge className={`${statusConfig[selectedAppt.status]?.bg} ${statusConfig[selectedAppt.status]?.color} border-0 text-[10px]`}>
                  {statusConfig[selectedAppt.status]?.label}
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
              {(canViewFullAgenda || !isProfessional) && selectedAppt.status !== "cancelled" && selectedAppt.status !== "completed" && (
                <div className="flex flex-wrap gap-2">
                  {selectedAppt.status === "scheduled" && (
                    <>
                      <Button size="sm" className="gap-1.5 rounded-xl flex-1" onClick={() => handleAction(selectedAppt.id, "confirmed", "Agendamento confirmado!")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={() => handleAction(selectedAppt.id, "completed", "Atendimento concluído!")}>
                        Concluir
                      </Button>
                    </>
                  )}
                  {selectedAppt.status === "confirmed" && (
                    <>
                      <Button size="sm" className="gap-1.5 rounded-xl flex-1" onClick={() => handleAction(selectedAppt.id, "completed", "Atendimento concluído!")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-xl border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                        onClick={() => handleAction(selectedAppt.id, "cancelled", "Marcado como não compareceu")}
                      >
                        <UserX className="h-3.5 w-3.5" /> No-show
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* WhatsApp */}
              {selectedAppt.client_phone && (
                <a
                  href={buildWhatsAppUrl({ clientName: selectedAppt.client_name, clientPhone: selectedAppt.client_phone, barbershopName: barbershop?.name || "", serviceName: selectedAppt.services?.name || "", date: selectedAppt.date, startTime: selectedAppt.start_time?.slice(0, 5), endTime: selectedAppt.end_time?.slice(0, 5), price: Number(selectedAppt.price || 0), professionalName: selectedAppt.professionals?.name, type: "confirmed" }) || "#"}
                  target="_blank" rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="w-full gap-2 rounded-xl border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
                    <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
                  </Button>
                </a>
              )}

              {/* Cancel */}
              {canViewFullAgenda && selectedAppt.status !== "cancelled" && selectedAppt.status !== "completed" && (
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
