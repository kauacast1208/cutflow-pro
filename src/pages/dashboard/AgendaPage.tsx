import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft, ChevronRight, CalendarDays, MessageCircle, Loader2,
  Clock, User, Scissors, DollarSign, XCircle, CheckCircle2, Star,
  LayoutGrid, CalendarRange, Users, AlertCircle, Phone, FileText,
} from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfWeek, addWeeks, subWeeks, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { motion } from "framer-motion";

type ViewMode = "day" | "week" | "professional";

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  scheduled: { label: "Agendado", color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  confirmed: { label: "Confirmado", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  completed: { label: "Concluído", color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  rescheduled: { label: "Remarcado", color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  cancelled: { label: "Cancelado", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
};

export default function AgendaPage() {
  const { barbershop } = useBarbershop();
  const { user } = useAuth();
  const { isProfessional, canViewFullAgenda } = useUserRole();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>("week");
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

  // Fetch data
  useEffect(() => {
    if (!barbershop) return;
    if (isProfessional && !myProfessionalId) return;
    const start = format(days[0], "yyyy-MM-dd");
    const end = format(days[days.length - 1], "yyyy-MM-dd");

    let apptQuery = supabase.from("appointments")
      .select("*, services(name, duration_minutes, price), professionals(name)")
      .eq("barbershop_id", barbershop.id).gte("date", start).lte("date", end);

    if (isProfessional && myProfessionalId) {
      apptQuery = apptQuery.eq("professional_id", myProfessionalId);
    }

    Promise.all([
      apptQuery,
      supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).gte("date", start).lte("date", end),
      supabase.from("professionals").select("*").eq("barbershop_id", barbershop.id).eq("active", true),
      supabase.from("services").select("*").eq("barbershop_id", barbershop.id).eq("active", true),
    ]).then(([appRes, blockRes, proRes, svcRes]) => {
      setAppointments(appRes.data || []);
      setBlockedTimes(blockRes.data || []);
      setProfessionals(proRes.data || []);
      setServices(svcRes.data || []);
    });
  }, [barbershop, weekStart, selectedDate, myProfessionalId, isProfessional, viewMode]);

  const refreshAppointments = async () => {
    if (!barbershop) return;
    const start = format(days[0], "yyyy-MM-dd");
    const end = format(days[days.length - 1], "yyyy-MM-dd");
    let query = supabase.from("appointments")
      .select("*, services(name, duration_minutes, price), professionals(name)")
      .eq("barbershop_id", barbershop.id).gte("date", start).lte("date", end);
    if (isProfessional && myProfessionalId) query = query.eq("professional_id", myProfessionalId);
    const { data } = await query;
    setAppointments(data || []);
  };

  const handleAction = async (id: string, status: string, message: string) => {
    await supabase.from("appointments").update({ status: status as any }).eq("id", id);
    toast({ title: message });
    setSelectedAppt(null);
    await refreshAppointments();
  };

  const handleCancel = async () => {
    if (!selectedAppt) return;
    await supabase.from("appointments").update({ status: "cancelled" as const, cancellation_reason: cancelReason || null }).eq("id", selectedAppt.id);
    toast({ title: "Agendamento cancelado." });
    setSelectedAppt(null);
    setCancelReason("");
    await refreshAppointments();
  };

  // Filtered appointments
  const filteredAppts = useMemo(() => {
    if (selectedPro === "all") return appointments;
    return appointments.filter(a => a.professional_id === selectedPro);
  }, [appointments, selectedPro]);

  // Stats
  const todayAppts = useMemo(() => filteredAppts.filter(a => a.date === today && a.status !== "cancelled"), [filteredAppts, today]);
  const totalRevenue = useMemo(() => filteredAppts.filter(a => a.status !== "cancelled").reduce((s, a) => s + Number(a.price || 0), 0), [filteredAppts]);

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
  const proColumns = viewMode === "professional" ? (selectedPro === "all" ? professionals : professionals.filter(p => p.id === selectedPro)) : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Agenda</h2>
              {isProfessional && <Badge variant="secondary" className="text-[10px] rounded-full">Minha agenda</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {viewMode === "day"
                ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
                : `${format(days[0], "dd MMM", { locale: ptBR })} – ${format(days[days.length - 1], "dd MMM yyyy", { locale: ptBR })}`
              }
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
            {([
              { key: "day" as const, icon: CalendarDays, label: "Dia" },
              { key: "week" as const, icon: CalendarRange, label: "Semana" },
              { key: "professional" as const, icon: Users, label: "Profissional" },
            ]).map(v => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === v.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <v.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          {/* Professional filter */}
          {!isProfessional && viewMode !== "professional" && (
            <select
              value={selectedPro}
              onChange={e => setSelectedPro(e.target.value)}
              className="h-8 text-xs rounded-lg border border-border bg-card px-2 text-foreground"
            >
              <option value="all">Todos os profissionais</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          {/* Navigation */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
            <Button variant="ghost" size="sm" className="rounded-md h-8 w-8 p-0" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-md text-xs px-3 h-8 font-medium" onClick={goToday}>
              Hoje
            </Button>
            <Button variant="ghost" size="sm" className="rounded-md h-8 w-8 p-0" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: "Hoje", value: String(todayAppts.length), sub: "agendamentos" },
          { label: "Confirmados", value: String(todayAppts.filter(a => a.status === "confirmed").length), sub: "hoje" },
          { label: "Pendentes", value: String(todayAppts.filter(a => a.status === "scheduled").length), sub: "aguardando" },
          { label: "Faturamento", value: `R$${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`, sub: "período" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
            <p className="text-lg font-bold text-foreground mt-0.5">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Calendar Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
        className="rounded-2xl border border-border/60 bg-card overflow-auto"
      >
        {viewMode === "professional" ? (
          /* Professional view */
          <div className="min-w-[700px]">
            <div className={`grid border-b border-border/40 bg-muted/20`}
              style={{ gridTemplateColumns: `60px repeat(${proColumns.length}, 1fr)` }}
            >
              <div className="p-3 text-[10px] text-muted-foreground font-medium">Hora</div>
              {proColumns.map(p => (
                <div key={p.id} className="p-3 text-center border-l border-border/30">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {p.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{p.name}</span>
                  </div>
                </div>
              ))}
            </div>
            {hours.map(hour => {
              const h = parseInt(hour);
              return (
                <div key={hour} className="border-b border-border/20 last:border-b-0"
                  style={{ display: "grid", gridTemplateColumns: `60px repeat(${proColumns.length}, 1fr)` }}
                >
                  <div className="p-2 text-[11px] text-muted-foreground/60 text-right pr-3 pt-1.5 font-medium">{hour}</div>
                  {proColumns.map(pro => {
                    const dateStr = format(selectedDate, "yyyy-MM-dd");
                    const proAppts = filteredAppts.filter(a => a.date === dateStr && parseInt(a.start_time) === h && a.professional_id === pro.id && a.status !== "cancelled");
                    return (
                      <div key={pro.id} className="border-l border-border/20 p-1 h-16 relative">
                        {proAppts.map(event => {
                          const sc = statusConfig[event.status] || statusConfig.scheduled;
                          return (
                            <div key={event.id} onClick={() => setSelectedAppt(event)}
                              className={`absolute inset-x-1 top-1 rounded-lg border ${sc.border} ${sc.bg} p-1.5 cursor-pointer transition-all hover:shadow-sm overflow-hidden`}
                              style={{ height: "56px" }}
                            >
                              <p className={`text-xs font-semibold truncate ${sc.color}`}>{event.client_name}</p>
                              <p className="text-[10px] truncate text-muted-foreground mt-0.5">{event.services?.name}</p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          /* Day / Week view */
          <div className="min-w-[700px]">
            <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}
              className="border-b border-border/40 bg-muted/20"
            >
              <div className="p-3" />
              {days.map((d, i) => {
                const isToday = format(d, "yyyy-MM-dd") === today;
                return (
                  <div key={i} className={`p-3 text-center border-l border-border/30 ${isToday ? "bg-primary/5" : ""}`}>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      {format(d, "EEE", { locale: ptBR })}
                    </span>
                    <p className={`text-sm font-bold mt-0.5 ${isToday ? "text-primary" : "text-foreground"}`}>
                      {isToday ? (
                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm">{format(d, "dd")}</span>
                      ) : format(d, "dd")}
                    </p>
                  </div>
                );
              })}
            </div>

            {hours.map(hour => {
              const h = parseInt(hour);
              return (
                <div key={hour} className="border-b border-border/20 last:border-b-0"
                  style={{ display: "grid", gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}
                >
                  <div className="p-2 text-[11px] text-muted-foreground/60 text-right pr-3 pt-1.5 font-medium">{hour}</div>
                  {days.map((day, dayIdx) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const dayAppts = filteredAppts.filter(a => a.date === dateStr && parseInt(a.start_time) === h && a.status !== "cancelled");
                    const dayBlocks = blockedTimes.filter(b => b.date === dateStr && (b.all_day || (b.start_time && parseInt(b.start_time) <= h && parseInt(b.end_time) > h)));
                    const isToday = dateStr === today;

                    // Conflict: multiple appointments at same time for same professional
                    const proIds = dayAppts.map(a => a.professional_id);
                    const hasConflict = proIds.length !== new Set(proIds).size;

                    return (
                      <div key={dayIdx}
                        className={`border-l border-border/20 p-1 h-16 relative ${dayBlocks.length > 0 ? "bg-destructive/5" : ""} ${isToday ? "bg-primary/[0.02]" : ""}`}
                      >
                        {hasConflict && (
                          <div className="absolute top-0.5 right-0.5 z-10">
                            <AlertCircle className="h-3 w-3 text-destructive" />
                          </div>
                        )}
                        {dayAppts.map(event => {
                          const sc = statusConfig[event.status] || statusConfig.scheduled;
                          const durationMin = event.services?.duration_minutes || 30;
                          return (
                            <div key={event.id} onClick={() => setSelectedAppt(event)}
                              className={`absolute inset-x-1 top-1 rounded-lg border ${sc.border} ${sc.bg} p-1.5 cursor-pointer transition-all hover:shadow-md overflow-hidden`}
                              style={{ height: `${Math.min(56, Math.max(28, (durationMin / 60) * 64))}px`, zIndex: 5 }}
                            >
                              <p className={`text-[11px] font-semibold truncate ${sc.color}`}>{event.client_name}</p>
                              <p className="text-[9px] truncate text-muted-foreground mt-0.5">
                                {event.services?.name} · {event.professionals?.name}
                              </p>
                            </div>
                          );
                        })}
                        {dayBlocks.length > 0 && dayAppts.length === 0 && (
                          <div className="absolute inset-x-1 top-1 rounded-lg bg-muted/40 border border-dashed border-border/50 p-1.5 h-[56px] flex items-center justify-center">
                            <p className="text-[10px] text-muted-foreground/60">Bloqueado</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Appointment detail dialog */}
      <Dialog open={!!selectedAppt} onOpenChange={o => !o && setSelectedAppt(null)}>
        <DialogContent className="max-w-md">
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
                    <div className="h-8 w-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
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
                <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Observações</span>
                  </div>
                  <p className="text-sm text-foreground">{selectedAppt.notes}</p>
                </div>
              )}

              {/* Action buttons */}
              {(canViewFullAgenda || !isProfessional) && (
                <div className="flex flex-wrap gap-2">
                  {selectedAppt.status === "scheduled" && (
                    <>
                      <Button size="sm" className="gap-1.5 rounded-lg" onClick={() => handleAction(selectedAppt.id, "confirmed", "Agendamento confirmado!")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" onClick={() => handleAction(selectedAppt.id, "completed", "Atendimento concluído!")}>
                        Concluir
                      </Button>
                    </>
                  )}
                  {selectedAppt.status === "confirmed" && (
                    <Button size="sm" className="gap-1.5 rounded-lg" onClick={() => handleAction(selectedAppt.id, "completed", "Atendimento concluído!")}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Concluir
                    </Button>
                  )}
                </div>
              )}

              {/* WhatsApp */}
              {selectedAppt.client_phone && (
                <a
                  href={buildWhatsAppUrl({ clientName: selectedAppt.client_name, clientPhone: selectedAppt.client_phone, barbershopName: barbershop?.name || "", serviceName: selectedAppt.services?.name || "", date: selectedAppt.date, startTime: selectedAppt.start_time?.slice(0, 5), endTime: selectedAppt.end_time?.slice(0, 5), price: Number(selectedAppt.price || 0), professionalName: selectedAppt.professionals?.name, type: "confirmed" }) || "#"}
                  target="_blank" rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="w-full gap-2 rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
                    <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
                  </Button>
                </a>
              )}

              {/* Cancel */}
              {canViewFullAgenda && selectedAppt.status !== "cancelled" && selectedAppt.status !== "completed" && (
                <div className="border-t border-border/40 pt-4 space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cancelar agendamento</Label>
                  <Input placeholder="Motivo (opcional)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="bg-card" />
                  <Button size="sm" variant="destructive" className="gap-1.5 rounded-lg" onClick={handleCancel}>
                    <XCircle className="h-3.5 w-3.5" /> Cancelar agendamento
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
