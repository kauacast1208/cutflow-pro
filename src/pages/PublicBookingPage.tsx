import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Check, ArrowRight, ArrowLeft, Scissors,
  Loader2, AlertCircle, MapPin, ChevronLeft, User, CalendarDays, Phone, Clock, Globe
} from "lucide-react";
import { format, addMinutes, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import SupportBot from "@/components/booking/SupportBot";
import { ServiceStep } from "@/components/booking/ServiceStep";
import { ProfessionalStep, ANY_PRO_ID } from "@/components/booking/ProfessionalStep";
import { DateTimeStep } from "@/components/booking/DateTimeStep";
import { ClientInfoStep } from "@/components/booking/ClientInfoStep";
import { ConfirmStep } from "@/components/booking/ConfirmStep";
import { BookingSuccess } from "@/components/booking/BookingSuccess";
import { useBookingSlots } from "@/hooks/useBookingSlots";
import { sendBookingEmail } from "@/lib/email";
import { generateTimeSlots } from "@/lib/booking";

type Step = 0 | 1 | 2 | 3 | 4;

const stepsMeta = [
  { label: "Servico", icon: Scissors },
  { label: "Profissional", icon: User },
  { label: "Data e hora", icon: CalendarDays },
  { label: "Seus dados", icon: Phone },
  { label: "Confirmar", icon: Check },
];

const stepTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.25, ease: "easeInOut" },
};

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [barbershop, setBarbershop] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPro, setSelectedPro] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [resolvedProId, setResolvedProId] = useState<string | null>(null);

  const selectedServiceObjects = services.filter((s) => selectedServices.includes(s.id));
  const totalDuration = selectedServiceObjects.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice = selectedServiceObjects.reduce((sum, s) => sum + Number(s.price), 0);
  const firstService = selectedServiceObjects[0] || null;
  const isAnyPro = selectedPro === ANY_PRO_ID;
  const effectiveProId = isAnyPro ? resolvedProId : selectedPro;
  const professional = professionals.find((p) => p.id === effectiveProId);

  const handleToggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      const { data: shop } = await supabase
        .from("barbershops")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!shop) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setBarbershop(shop);

      const [servRes, proRes, availRes] = await Promise.all([
        supabase.from("services").select("*").eq("barbershop_id", shop.id).eq("active", true).order("sort_order"),
        supabase.from("professionals").select("*").eq("barbershop_id", shop.id).eq("active", true),
        supabase.from("professional_availability").select("*").in("professional_id",
          (await supabase.from("professionals").select("id").eq("barbershop_id", shop.id).eq("active", true)).data?.map((p: any) => p.id) || []
        ),
      ]);

      setServices(servRes.data || []);
      setProfessionals(proRes.data || []);
      setAvailability(availRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (!selectedDate || !barbershop) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const dayOfWeek = selectedDate.getDay();
    Promise.all([
      supabase.rpc("get_booked_slots", {
        _barbershop_id: barbershop.id,
        _date: dateStr,
      }),
      supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).eq("recurring", false).eq("date", dateStr),
      supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).eq("recurring", true).contains("recurring_days", [dayOfWeek]),
    ]).then(([appRes, blockRes, recurringBlockRes]) => {
      // Map RPC results to match Appointment interface expected by booking logic
      const slots = (appRes.data || []).map((s: any) => ({
        professional_id: s.professional_id,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status,
        date: dateStr,
        barbershop_id: barbershop.id,
      }));
      setAppointments(slots);
      setBlockedTimes([...(blockRes.data || []), ...(recurringBlockRes.data || [])]);
    });
  }, [selectedDate, barbershop]);

  // For "any professional": compute slots across all pros
  const anyProSlots = useMemo(() => {
    if (!isAnyPro || !selectedDate || !barbershop || selectedServices.length === 0) return [];
    const config = {
      openingTime: barbershop.opening_time || "09:00",
      closingTime: barbershop.closing_time || "19:00",
      intervalMinutes: barbershop.slot_interval_minutes || 30,
      durationMinutes: totalDuration,
      bufferMinutes: barbershop.buffer_minutes || 0,
      minAdvanceHours: barbershop.min_advance_hours || 1,
    };

    const slotMap = new Map<string, string>();
    professionals.forEach((pro) => {
      const slots = generateTimeSlots(selectedDate, pro.id, config, appointments, blockedTimes, availability);
      slots.forEach((t) => {
        if (!slotMap.has(t)) slotMap.set(t, pro.id);
      });
    });

    return Array.from(slotMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [isAnyPro, selectedDate, barbershop, selectedServices, totalDuration, professionals, appointments, blockedTimes, availability]);

  const { timeSlots, groupedSlots, dayStatusMap } = useBookingSlots({
    barbershop,
    selectedDate,
    selectedPro: isAnyPro ? null : selectedPro,
    serviceDuration: totalDuration || 30,
    appointments,
    blockedTimes,
    availability,
  });

  const finalTimeSlots = isAnyPro ? anyProSlots.map(([t]) => t) : timeSlots;
  const finalGroupedSlots = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];
    finalTimeSlots.forEach((t) => {
      const hour = parseInt(t.split(":")[0]);
      if (hour < 12) morning.push(t);
      else if (hour < 18) afternoon.push(t);
      else evening.push(t);
    });
    return { morning, afternoon, evening };
  }, [finalTimeSlots]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (isAnyPro) {
      const entry = anyProSlots.find(([t]) => t === time);
      if (entry) setResolvedProId(entry[1]);
    }
  };

  // Validation
  const isValidPhone = clientPhone.replace(/\D/g, "").length >= 10;
  const isValidName = clientName.trim().length >= 2 && clientName.trim().length <= 100;
  const isValidEmail = !clientEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail);

  const canNext =
    (step === 0 && selectedServices.length > 0) ||
    (step === 1 && selectedPro !== null) ||
    (step === 2 && selectedDate !== undefined && selectedTime !== null) ||
    (step === 3 && isValidName && isValidPhone && isValidEmail) ||
    step === 4;

  const goNext = () => {
    if (!canNext || step >= 4) return;
    setDirection(1);
    setStep((step + 1) as Step);
  };

  const goBack = () => {
    if (step <= 0) return;
    setDirection(-1);
    setStep((step - 1) as Step);
  };

  const handleConfirm = async () => {
    if (!barbershop || selectedServices.length === 0 || !professional || !selectedDate || !selectedTime) return;
    if (!isValidName || !isValidPhone) return;
    setSubmitting(true);

    const sanitizedName = clientName.trim().slice(0, 100);
    const sanitizedPhone = clientPhone.trim().slice(0, 20);
    const sanitizedEmail = clientEmail.trim().slice(0, 255);
    const sanitizedNotes = clientNotes.trim().slice(0, 500);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("public-booking", {
        body: {
          barbershop_id: barbershop.id,
          services: selectedServiceObjects.map((svc) => ({ id: svc.id })),
          professional_id: professional.id,
          client_name: sanitizedName,
          client_phone: sanitizedPhone,
          client_email: sanitizedEmail,
          client_notes: sanitizedNotes,
          date: format(selectedDate, "yyyy-MM-dd"),
          start_time: selectedTime,
          auto_confirm: barbershop.auto_confirm,
        },
      });

      setSubmitting(false);

      if (fnError || !result?.success) {
        console.error("Booking error:", fnError || result?.error);
        return;
      }

      const firstAppointmentId = result.appointment_id;
      if (firstAppointmentId) {
        setAppointmentId(firstAppointmentId);
        setConfirmed(true);
        sendBookingEmail({
          type: "confirmed",
          clientName: sanitizedName,
          clientEmail: sanitizedEmail,
          service: firstService,
          professional,
          selectedDate,
          selectedTime,
          barbershop,
        });
        supabase.functions.invoke("send-booking-confirmation", {
          body: { appointmentId: firstAppointmentId },
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmed(false);
    setStep(0);
    setDirection(1);
    setSelectedServices([]);
    setSelectedPro(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setClientNotes("");
    setAppointmentId(null);
    setResolvedProId(null);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentId) return;
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", appointmentId);
    if (clientEmail && firstService && professional && selectedDate && selectedTime) {
      sendBookingEmail({
        type: "cancelled",
        clientName,
        clientEmail,
        service: firstService,
        professional,
        selectedDate,
        selectedTime,
        barbershop,
      });
    }
    resetForm();
  };

  const handleReschedule = () => {
    if (!appointmentId) return;
    supabase.from("appointments").update({ status: "rescheduled" }).eq("id", appointmentId);
    setConfirmed(false);
    setDirection(-1);
    setStep(2);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setAppointmentId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Carregando...</p>
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Barbearia nao encontrada</h1>
          <p className="text-muted-foreground mb-8">O link que voce acessou nao corresponde a nenhuma barbearia cadastrada.</p>
          <Link to="/"><Button variant="outline" className="rounded-xl h-11 px-6">Voltar ao inicio</Button></Link>
        </motion.div>
      </div>
    );
  }

  if (confirmed && selectedServiceObjects.length > 0 && professional && selectedDate && selectedTime) {
    return (
      <BookingSuccess
        barbershop={barbershop}
        service={firstService}
        professional={professional}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        slug={slug || ""}
        onReschedule={handleReschedule}
        onCancel={handleCancelAppointment}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex h-14 sm:h-16 items-center px-4 gap-3">
          <button
            onClick={() => step > 0 ? goBack() : navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-accent transition-colors shrink-0"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          {barbershop.logo_url ? (
            <img src={barbershop.logo_url} className="h-10 w-10 rounded-xl object-cover border border-border" alt="" />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Scissors className="h-4 w-4 text-primary" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm block truncate">{barbershop.name}</span>
            {barbershop.address && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />{barbershop.address}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Barbershop info banner (step 0 only) */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-w-2xl mx-auto px-4 pt-5">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm mb-2">
                <div className="flex items-start gap-4">
                  {barbershop.logo_url ? (
                    <img src={barbershop.logo_url} className="h-16 w-16 rounded-2xl object-cover border border-border shrink-0" alt="" />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Scissors className="h-7 w-7 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="font-extrabold text-lg tracking-tight">{barbershop.name}</h1>
                    {barbershop.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{barbershop.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-muted-foreground">
                      {barbershop.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />{barbershop.address}
                        </span>
                      )}
                      {(barbershop.phone || barbershop.whatsapp) && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 shrink-0" />{barbershop.whatsapp || barbershop.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        {barbershop.opening_time?.slice(0, 5)} - {barbershop.closing_time?.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Progress steps */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-2">
            {stepsMeta.map((s, i) => {
              const isDone = i < step;
              const isActive = i === step;
              return (
                <div key={s.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                    isDone ? "bg-primary" : isActive ? "bg-primary" : "bg-border"
                  }`} />
                  <div className="hidden sm:flex items-center gap-1.5">
                    <s.icon className={`h-3.5 w-3.5 ${isDone || isActive ? "text-primary" : "text-muted-foreground/40"}`} />
                    <span className={`text-[11px] font-medium ${isDone || isActive ? "text-primary" : "text-muted-foreground/40"}`}>
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center sm:hidden">
            Passo {step + 1} de {stepsMeta.length}
          </p>
        </div>

        {/* Step content with animation */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {step === 0 && (
              <ServiceStep services={services} selectedServices={selectedServices} onToggle={handleToggleService} />
            )}
            {step === 1 && (
              <ProfessionalStep
                professionals={professionals}
                selectedPro={selectedPro}
                onSelect={(id) => { setSelectedPro(id); setSelectedTime(null); setResolvedProId(null); }}
              />
            )}
            {step === 2 && (
              <DateTimeStep
                barbershop={barbershop}
                service={firstService}
                professional={isAnyPro ? { name: "Qualquer profissional", role: "Primeiro disponivel" } : professional}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                timeSlots={finalTimeSlots}
                groupedSlots={finalGroupedSlots}
                dayStatusMap={dayStatusMap}
                availability={availability}
                onSelectDate={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                onSelectTime={handleTimeSelect}
                resolvedProfessional={isAnyPro && resolvedProId ? professionals.find((p) => p.id === resolvedProId) : undefined}
              />
            )}
            {step === 3 && (
              <ClientInfoStep
                service={firstService}
                professional={professional || (isAnyPro ? { name: "Qualquer profissional" } : null)}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                clientName={clientName}
                clientPhone={clientPhone}
                clientEmail={clientEmail}
                clientNotes={clientNotes}
                onChangeName={(v) => setClientName(v.slice(0, 100))}
                onChangePhone={setClientPhone}
                onChangeEmail={(v) => setClientEmail(v.slice(0, 255))}
                onChangeNotes={(v) => setClientNotes(v.slice(0, 500))}
              />
            )}
            {step === 4 && (
              <ConfirmStep
                services={selectedServiceObjects}
                professional={professional || (isAnyPro ? { name: "Qualquer profissional" } : null)}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                clientName={clientName}
                clientPhone={clientPhone}
                clientNotes={clientNotes}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8 sm:mt-10 pb-24 sm:pb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={goBack}
            disabled={step === 0}
            className="rounded-xl h-12 px-6 font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          {step < 4 ? (
            <Button
              size="lg"
              onClick={goNext}
              disabled={!canNext}
              className="rounded-xl h-12 px-6 font-semibold shadow-sm"
            >
              Proximo <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="hero"
              size="lg"
              onClick={handleConfirm}
              disabled={submitting}
              className="rounded-xl h-12 px-8 shadow-glow"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmar <Check className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
      <SupportBot />
    </div>
  );
}
