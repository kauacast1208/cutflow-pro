import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays, MessageCircle, Loader2, Clock, User, Scissors, DollarSign, XCircle, CheckCircle2, Star } from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const hours = Array.from({ length: 12 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  scheduled: { label: "Agendado", color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  confirmed: { label: "Confirmado", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  completed: { label: "Concluído", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  rescheduled: { label: "Remarcado", color: "text-info", bg: "bg-info/10", border: "border-info/20" },
};

export default function AgendaPage() {
  const { barbershop } = useBarbershop();
  const { user } = useAuth();
  const { role, isProfessional, canViewFullAgenda } = useUserRole();
  const { toast } = useToast();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [appointments, setAppointments] = useState<any[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [myProfessionalId, setMyProfessionalId] = useState<string | null>(null);

  const days = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!isProfessional || !user || !barbershop) return;
    supabase.from("professionals").select("id").eq("barbershop_id", barbershop.id).eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setMyProfessionalId(data.id); });
  }, [isProfessional, user, barbershop]);

  useEffect(() => {
    if (!barbershop) return;
    if (isProfessional && !myProfessionalId) return;
    const start = format(days[0], "yyyy-MM-dd");
    const end = format(days[5], "yyyy-MM-dd");
    let apptQuery = supabase.from("appointments").select("*, services(name), professionals(name)")
      .eq("barbershop_id", barbershop.id).gte("date", start).lte("date", end).not("status", "eq", "cancelled");
    if (isProfessional && myProfessionalId) apptQuery = apptQuery.eq("professional_id", myProfessionalId);
    Promise.all([
      apptQuery,
      supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).gte("date", start).lte("date", end),
      supabase.from("professionals").select("*").eq("barbershop_id", barbershop.id),
    ]).then(([appRes, blockRes, proRes]) => {
      setAppointments(appRes.data || []);
      setBlockedTimes(blockRes.data || []);
      setProfessionals(proRes.data || []);
    });
  }, [barbershop, weekStart, myProfessionalId, isProfessional]);

  const refreshAppointments = async () => {
    if (!barbershop) return;
    const start = format(days[0], "yyyy-MM-dd");
    const end = format(days[5], "yyyy-MM-dd");
    let query = supabase.from("appointments").select("*, services(name), professionals(name)")
      .eq("barbershop_id", barbershop.id).gte("date", start).lte("date", end).not("status", "eq", "cancelled");
    if (isProfessional && myProfessionalId) query = query.eq("professional_id", myProfessionalId);
    const { data } = await query;
    setAppointments(data || []);
  };

  const handleCancel = async () => {
    if (!selectedAppt) return;
    await supabase.from("appointments").update({ status: "cancelled" as const, cancellation_reason: cancelReason || null }).eq("id", selectedAppt.id);
    toast({ title: "Agendamento cancelado." });
    setSelectedAppt(null); setCancelReason("");
    await refreshAppointments();
  };

  const handleConfirm = async (id: string) => {
    await supabase.from("appointments").update({ status: "confirmed" as const }).eq("id", id);
    toast({ title: "Agendamento confirmado!" });
    await refreshAppointments();
  };

  const handleComplete = async (id: string) => {
    await supabase.from("appointments").update({ status: "completed" as const }).eq("id", id);
    toast({ title: "Atendimento concluído!" });
    await refreshAppointments();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Agenda</h2>
              {isProfessional && <Badge variant="secondary" className="text-[10px] rounded-full">Minha agenda</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {format(days[0], "dd MMM", { locale: ptBR })} – {format(days[5], "dd MMM yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-secondary/50 rounded-lg p-0.5">
            <Button variant="ghost" size="sm" className="rounded-md h-8 w-8 p-0" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="rounded-md text-xs px-3 h-8 font-medium" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
              Hoje
            </Button>
            <Button variant="ghost" size="sm" className="rounded-md h-8 w-8 p-0" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border border-border/60 bg-card overflow-auto"
      >
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-border/40 bg-secondary/20">
            <div className="p-3" />
            {days.map((d, i) => {
              const isToday = format(d, "yyyy-MM-dd") === today;
              return (
                <div key={i} className={`p-3 text-center border-l border-border/30 ${isToday ? "bg-primary/5" : ""}`}>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{format(d, "EEE", { locale: ptBR })}</span>
                  <p className={`text-sm font-bold mt-0.5 ${isToday ? "text-primary" : "text-foreground"}`}>
                    {isToday ? (
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm">{format(d, "dd")}</span>
                    ) : format(d, "dd")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          {hours.map((hour) => {
            const h = parseInt(hour);
            return (
              <div key={hour} className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-border/20 last:border-b-0">
                <div className="p-2 text-[11px] text-muted-foreground/60 text-right pr-3 pt-1.5 font-medium">{hour}</div>
                {days.map((day, dayIdx) => {
                  const dateStr = format(day, "yyyy-MM-dd");
                  const dayAppts = appointments.filter((a) => a.date === dateStr && parseInt(a.start_time) === h);
                  const dayBlocks = blockedTimes.filter((b) => b.date === dateStr && (b.all_day || (b.start_time && parseInt(b.start_time) <= h && parseInt(b.end_time) > h)));
                  const isToday = dateStr === today;

                  return (
                    <div key={dayIdx} className={`border-l border-border/20 p-1 h-16 relative ${dayBlocks.length > 0 ? "bg-destructive/5" : ""} ${isToday ? "bg-primary/[0.02]" : ""}`}>
                      {dayAppts.map((event) => {
                        const sc = statusConfig[event.status] || statusConfig.scheduled;
                        return (
                          <div
                            key={event.id}
                            onClick={() => setSelectedAppt(event)}
                            className={`absolute inset-x-1 top-1 rounded-lg border ${sc.border} ${sc.bg} p-1.5 cursor-pointer transition-all hover:shadow-sm overflow-hidden`}
                            style={{ height: "56px" }}
                          >
                            <p className={`text-xs font-semibold truncate ${sc.color}`}>{event.client_name}</p>
                            <p className="text-[10px] truncate text-muted-foreground mt-0.5">{event.services?.name}</p>
                          </div>
                        );
                      })}
                      {dayBlocks.length > 0 && dayAppts.length === 0 && (
                        <div className="absolute inset-x-1 top-1 rounded-lg bg-muted/30 border border-border/30 p-1.5 h-[56px]">
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
      </motion.div>

      {/* Appointment detail dialog */}
      <Dialog open={!!selectedAppt} onOpenChange={(o) => !o && setSelectedAppt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Detalhes do agendamento</DialogTitle>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: User, label: "Cliente", value: selectedAppt.client_name },
                  { icon: Scissors, label: "Serviço", value: selectedAppt.services?.name },
                  { icon: Star, label: "Profissional", value: selectedAppt.professionals?.name },
                  { icon: Clock, label: "Horário", value: `${selectedAppt.start_time?.slice(0,5)} - ${selectedAppt.end_time?.slice(0,5)}` },
                  { icon: CalendarDays, label: "Status", value: statusConfig[selectedAppt.status]?.label || selectedAppt.status },
                  { icon: DollarSign, label: "Valor", value: `R$ ${Number(selectedAppt.price || 0).toFixed(2)}` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-secondary/60 flex items-center justify-center shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</span>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              {(canViewFullAgenda || !isProfessional) && selectedAppt.status === "scheduled" && (
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1.5 rounded-lg" onClick={() => handleConfirm(selectedAppt.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Confirmar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" onClick={() => handleComplete(selectedAppt.id)}>
                    Concluir
                  </Button>
                </div>
              )}
              {(canViewFullAgenda || !isProfessional) && selectedAppt.status === "confirmed" && (
                <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" onClick={() => handleComplete(selectedAppt.id)}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Marcar como concluído
                </Button>
              )}

              {/* WhatsApp */}
              {selectedAppt.client_phone ? (
                <a
                  href={buildWhatsAppUrl({ clientName: selectedAppt.client_name, clientPhone: selectedAppt.client_phone, barbershopName: barbershop?.name || "", serviceName: selectedAppt.services?.name || "", date: selectedAppt.date, startTime: selectedAppt.start_time?.slice(0, 5), endTime: selectedAppt.end_time?.slice(0, 5), price: Number(selectedAppt.price || 0), professionalName: selectedAppt.professionals?.name, type: "confirmed" }) || "#"}
                  target="_blank" rel="noopener noreferrer"
                >
                  <Button size="sm" variant="outline" className="w-full gap-2 rounded-lg border-success/30 text-success hover:bg-success/10">
                    <MessageCircle className="h-4 w-4" /> Enviar WhatsApp
                  </Button>
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">Telefone não informado</p>
              )}

              {/* Cancel */}
              {canViewFullAgenda && (
                <div className="border-t border-border/40 pt-4 space-y-3">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cancelar agendamento</Label>
                  <Input placeholder="Motivo (opcional)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="bg-card" />
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
