import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, addMinutes, parse, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { CalendarDays, Check, Loader2, AlertCircle, Clock, Scissors } from "lucide-react";
import { generateTimeSlots, groupSlotsByPeriod, type SlotConfig } from "@/lib/booking";

export default function ReschedulePage() {
  const { token } = useParams<{ token: string }>();
  const [appointment, setAppointment] = useState<any>(null);
  const [barbershop, setBarbershop] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [professional, setProfessional] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [expired, setExpired] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return; }

    (async () => {
      // reschedule_token is a new column not yet in types.ts, use raw query
      const { data: appt } = (await (supabase as any)
        .from("appointments")
        .select("*")
        .eq("reschedule_token", token)
        .in("status", ["scheduled", "confirmed"])
        .maybeSingle());

      if (!appt) { setNotFound(true); setLoading(false); return; }

      const apptDate = new Date(`${appt.date}T${appt.start_time}`);
      if (isBefore(apptDate, new Date())) { setExpired(true); setLoading(false); return; }

      setAppointment(appt);

      const [{ data: shop }, { data: svc }, { data: pro }, { data: avail }] = await Promise.all([
        supabase.from("barbershops").select("*").eq("id", appt.barbershop_id).single(),
        supabase.from("services").select("*").eq("id", appt.service_id).single(),
        supabase.from("professionals").select("*").eq("id", appt.professional_id).single(),
        supabase.from("professional_availability").select("*").eq("professional_id", appt.professional_id),
      ]);

      setBarbershop(shop);
      setService(svc);
      setProfessional(pro);
      setAvailability(avail || []);
      setSelectedDate(new Date());
      setLoading(false);
    })();
  }, [token]);

  // Load booked slots and blocked times when date changes
  useEffect(() => {
    if (!selectedDate || !barbershop || !appointment) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    Promise.all([
      supabase.rpc("get_booked_slots", {
        _barbershop_id: barbershop.id,
        _date: dateStr,
        _professional_id: appointment.professional_id,
      }),
      supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).eq("date", dateStr),
    ]).then(([{ data: booked }, { data: blocked }]) => {
      setAppointments((booked || []).map((s: any) => ({
        professional_id: s.professional_id,
        start_time: s.start_time,
        end_time: s.end_time,
      })));
      setBlockedTimes((blocked || []).map((b: any) => ({
        professional_id: b.professional_id,
        all_day: b.all_day,
        start_time: b.start_time,
        end_time: b.end_time,
      })));
    });
  }, [selectedDate, barbershop, appointment]);

  const timeSlots = useMemo(() => {
    if (!selectedDate || !barbershop || !service || !appointment) return [];

    const config: SlotConfig = {
      openingTime: barbershop.opening_time?.slice(0, 5) || "09:00",
      closingTime: barbershop.closing_time?.slice(0, 5) || "19:00",
      intervalMinutes: barbershop.slot_interval_minutes || 30,
      durationMinutes: service.duration_minutes,
      bufferMinutes: barbershop.buffer_minutes || 0,
      minAdvanceHours: barbershop.min_advance_hours || 1,
    };

    return generateTimeSlots(
      selectedDate,
      appointment.professional_id,
      config,
      appointments,
      blockedTimes,
      availability
    );
  }, [selectedDate, barbershop, service, appointment, appointments, blockedTimes, availability]);

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime || !appointment || !service) return;
    setSubmitting(true);

    const endTime = format(
      addMinutes(parse(selectedTime, "HH:mm", selectedDate), service.duration_minutes),
      "HH:mm"
    );

    // Mark old appointment as rescheduled
    await supabase
      .from("appointments")
      .update({ status: "rescheduled" as any })
      .eq("id", appointment.id);

    // Create new appointment via edge function
    const { error } = await supabase.functions.invoke("public-booking", {
      body: {
        barbershop_id: appointment.barbershop_id,
        service_id: appointment.service_id,
        professional_id: appointment.professional_id,
        date: format(selectedDate, "yyyy-MM-dd"),
        start_time: selectedTime,
        end_time: endTime,
        client_name: appointment.client_name,
        client_phone: appointment.client_phone,
        client_email: appointment.client_email,
      },
    });

    if (!error) setConfirmed(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold mb-2">
            {expired ? "Link expirado" : "Link inválido"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {expired
              ? "Este agendamento já passou e não pode ser remarcado."
              : "Este link de reagendamento não é válido ou já foi utilizado."}
          </p>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">Remarcado com sucesso!</h1>
          <p className="text-muted-foreground text-sm">
            Seu novo horário é <strong>{selectedTime}</strong> em{" "}
            <strong>{selectedDate && format(selectedDate, "dd/MM/yyyy")}</strong>.
          </p>
          <p className="text-xs text-muted-foreground mt-6">
            Agendamento realizado via{" "}
            <a href="https://cutflow.app" className="text-primary font-semibold hover:underline">
              CutFlow
            </a>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="max-w-lg mx-auto flex h-14 items-center px-4 gap-3">
          {barbershop?.logo_url ? (
            <img src={barbershop.logo_url} className="h-10 w-10 rounded-xl object-cover border border-border" alt="" />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary" />
            </div>
          )}
          <div>
            <span className="font-bold text-sm">{barbershop?.name}</span>
            <p className="text-xs text-muted-foreground">Remarcar agendamento</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Current appointment info */}
        <div className="rounded-2xl border border-border bg-card p-5 mb-6">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Agendamento atual</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Serviço</span>
              <span className="font-semibold">{service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profissional</span>
              <span className="font-semibold">{professional?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data atual</span>
              <span className="font-semibold">{appointment && format(new Date(appointment.date), "dd/MM/yyyy")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Horário atual</span>
              <span className="font-semibold">{appointment?.start_time?.slice(0, 5)}</span>
            </div>
          </div>
        </div>

        {/* New date/time selection */}
        <h2 className="font-bold text-base mb-4 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Escolha o novo horário
        </h2>

        <div className="rounded-2xl border border-border bg-card p-4 mb-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
            locale={ptBR}
            disabled={(date) => date < new Date()}
            className="mx-auto"
          />
        </div>

        {selectedDate && timeSlots.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6">
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`rounded-xl py-2.5 text-sm font-medium transition-all border ${
                  selectedTime === slot
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        )}

        {selectedDate && timeSlots.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum horário disponível nesta data.
          </p>
        )}

        <Button
          size="lg"
          className="w-full rounded-xl h-12 font-semibold"
          disabled={!selectedTime || submitting}
          onClick={handleReschedule}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
          Confirmar novo horário
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Agendamento via{" "}
          <a href="https://cutflow.app" className="text-primary font-semibold hover:underline">CutFlow</a>
        </p>
      </div>
    </div>
  );
}
