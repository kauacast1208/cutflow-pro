import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Scissors,
  Loader2,
  AlertCircle,
  MapPin,
  ChevronLeft,
  User,
  CalendarDays,
  Phone,
  Clock,
  ShieldCheck,
  Sparkles,
  Users,
  Star,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import SupportBot from "@/components/booking/SupportBot";
import { ReviewsDisplay } from "@/components/booking/ReviewsDisplay";
import { ServiceStep } from "@/components/booking/ServiceStep";
import { ProfessionalStep, ANY_PRO_ID } from "@/components/booking/ProfessionalStep";
import { DateTimeStep } from "@/components/booking/DateTimeStep";
import { ClientInfoStep } from "@/components/booking/ClientInfoStep";
import { ConfirmStep } from "@/components/booking/ConfirmStep";
import { BookingSuccess } from "@/components/booking/BookingSuccess";
import { LocationMap } from "@/components/booking/LocationMap";
import { useBookingSlots } from "@/hooks/useBookingSlots";
import { sendBookingEmail } from "@/lib/email";
import { generateTimeSlots } from "@/lib/booking";
import { fetchPublicBookingPageData, normalizePublicBookingSlug } from "@/lib/publicBooking";
import { formatCurrency } from "@/lib/format";
import { BarbershopLogo } from "@/components/shared/BarbershopLogo";
import { useToast } from "@/hooks/use-toast";

type Step = 0 | 1 | 2 | 3 | 4;

const stepsMeta = [
  { label: "Servico", icon: Scissors, description: "Escolha o que voce quer agendar." },
  { label: "Profissional", icon: User, description: "Selecione um barbeiro ou o primeiro disponivel." },
  { label: "Horario", icon: CalendarDays, description: "Encontre a melhor data e hora." },
  { label: "Seus dados", icon: Phone, description: "Preencha os dados de contato para confirmar." },
  { label: "Confirmar", icon: Check, description: "Revise tudo antes de finalizar." },
];

function safeNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function smartCapitalize(name: string) {
  const lower = ["do", "da", "de", "dos", "das", "e", "em", "no", "na", "nos", "nas", "o", "a", "os", "as"];
  return name
    ?.split(" ")
    .map((word: string, i: number) =>
      i === 0 || !lower.includes(word.toLowerCase())
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase(),
    )
    .join(" ") || name;
}

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [barbershop, setBarbershop] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1);
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

  const displayName = smartCapitalize(barbershop?.name || "");
  const ratingValue = safeNumber(barbershop?.rating_average, barbershop?.rating, barbershop?.avg_rating);
  const reviewCount = safeNumber(barbershop?.review_count, barbershop?.reviews_count);
  const clientsServed = safeNumber(
    barbershop?.total_clients_served,
    barbershop?.clients_served_count,
    barbershop?.completed_appointments_count,
  );

  const trustStats = [
    {
      icon: Star,
      label: ratingValue ? `${ratingValue.toFixed(1)} avaliacao` : "Avaliacao em breve",
      value: reviewCount ? `${reviewCount}+ reviews` : "Nova experiencia",
    },
    {
      icon: Users,
      label: clientsServed ? `${clientsServed}+ clientes` : "Atendimento premium",
      value: "Clientes atendidos",
    },
    {
      icon: Zap,
      label: "Reserva rapida",
      value: "Fluxo em poucos passos",
    },
    {
      icon: ShieldCheck,
      label: "Seguro",
      value: "Dados usados so para o agendamento",
    },
  ];

  const handleToggleService = (id: string) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  useEffect(() => {
    const fetchData = async () => {
      const normalizedSlug = slug ? normalizePublicBookingSlug(slug) : "";

      if (!normalizedSlug) {
        setNotFound(true);
        setLoadError(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);
      setLoadError(false);

      try {
        const data = await fetchPublicBookingPageData(normalizedSlug);

        if (data === null) {
          setNotFound(true);
          setBarbershop(null);
          setServices([]);
          setProfessionals([]);
          setAvailability([]);
          setLoading(false);
          return;
        }

        setBarbershop(data.barbershop);
        setServices(data.services);
        setProfessionals(data.professionals);
        setAvailability(data.availability);
        setSelectedPro((current) => {
          if (data.professionals.length === 1) {
            return data.professionals[0].id;
          }

          if (current && data.professionals.some((professional) => professional.id === current)) {
            return current;
          }

          return null;
        });
      } catch (error) {
        console.error("Failed to load public booking page", { slug: normalizedSlug, error });
        setLoadError(true);
        setBarbershop(null);
        setServices([]);
        setProfessionals([]);
        setAvailability([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  useEffect(() => {
    setSelectedDate(undefined);
    setSelectedTime(null);
    setResolvedProId(null);
  }, [selectedServices, selectedPro]);

  useEffect(() => {
    if (!selectedDate || !barbershop) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const dayOfWeek = selectedDate.getDay();
    Promise.all([
      supabase.rpc("get_booked_slots", {
        _barbershop_id: barbershop.id,
        _date: dateStr,
      }),
      (supabase as any)
        .from("blocked_times_public")
        .select("*")
        .eq("barbershop_id", barbershop.id)
        .eq("recurring", false)
        .eq("date", dateStr),
      (supabase as any)
        .from("blocked_times_public")
        .select("*")
        .eq("barbershop_id", barbershop.id)
        .eq("recurring", true)
        .contains("recurring_days", [dayOfWeek]),
    ]).then(([appRes, blockRes, recurringBlockRes]) => {
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
      const slots = generateTimeSlots(selectedDate, pro.id, config, appointments, blockedTimes, availability, pro);
      slots.forEach((t) => {
        if (!slotMap.has(t)) slotMap.set(t, pro.id);
      });
    });

    return Array.from(slotMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [isAnyPro, selectedDate, barbershop, selectedServices.length, totalDuration, professionals, appointments, blockedTimes, availability]);

  const weekDays = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 21 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, []);

  const { timeSlots, groupedSlots, dayStatusMap } = useBookingSlots({
    barbershop,
    selectedDate,
    selectedPro: isAnyPro ? null : selectedPro,
    serviceDuration: totalDuration || 30,
    appointments,
    blockedTimes,
    availability,
    professionals,
    weekDays,
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

  const isValidPhone = clientPhone.replace(/\D/g, "").length >= 10;
  const isValidName = clientName.trim().length >= 2 && clientName.trim().length <= 100;
  const isValidEmail = !clientEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail);

  const canNext =
    (step === 0 && selectedServices.length > 0) ||
    (step === 1 && selectedPro !== null && professionals.length > 0) ||
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
    if (!barbershop || selectedServices.length === 0 || !selectedDate || !selectedTime) {
      toast({ title: "Reserva incompleta", description: "Selecione servicos, data e horario antes de confirmar.", variant: "destructive" });
      return;
    }
    if (!professional) {
      toast({ title: "Profissional indisponivel", description: "Nao foi possivel resolver o profissional para esse horario.", variant: "destructive" });
      return;
    }
    if (!isValidName || !isValidPhone || !isValidEmail) {
      toast({ title: "Dados incompletos", description: "Revise seus dados de contato para continuar.", variant: "destructive" });
      return;
    }
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
        toast({
          title: "Nao foi possivel concluir a reserva",
          description: fnError?.message || result?.error || "Tente novamente em alguns instantes.",
          variant: "destructive",
        });
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
      toast({
        title: "Erro ao reservar",
        description: "Ocorreu um problema ao confirmar sua reserva. Tente novamente.",
        variant: "destructive",
      });
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

  const nextActionLabel = step < 4 ? "Continuar" : "Confirmar reserva";
  const mobileSummaryLine =
    selectedServices.length > 0
      ? `${selectedServices.length} ${selectedServices.length === 1 ? "servico" : "servicos"}`
      : "Selecione um servico";
  const mobileSecondaryLine = selectedDate && selectedTime
    ? `${format(selectedDate, "dd/MM")} as ${selectedTime}`
    : step === 1
      ? "Escolha um profissional"
      : step === 2
        ? "Selecione data e horario"
        : step === 3
          ? "Preencha seus dados"
          : "Pronto para continuar";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-border/60 bg-card shadow-sm">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Preparando a agenda</p>
            <p className="text-xs text-muted-foreground">Carregando horarios e servicos.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-[28px] border border-border/60 bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Barbearia nao encontrada</h1>
          <p className="mt-2 text-sm text-muted-foreground">Esse link nao corresponde a uma pagina publica valida.</p>
          <Link to="/">
            <Button variant="outline" className="mt-6 rounded-xl px-6">Voltar ao inicio</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (loadError || !barbershop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-[28px] border border-border/60 bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Nao foi possivel carregar</h1>
          <p className="mt-2 text-sm text-muted-foreground">Houve um problema ao carregar a pagina de agendamento.</p>
          <Link to="/">
            <Button variant="outline" className="mt-6 rounded-xl px-6">Voltar ao inicio</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (confirmed && selectedServiceObjects.length > 0 && professional && selectedDate && selectedTime) {
    return (
      <BookingSuccess
        barbershop={barbershop}
        services={selectedServiceObjects}
        service={firstService}
        professional={professional}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        slug={slug || ""}
        onReschedule={handleReschedule}
        onCancel={handleCancelAppointment}
        appointmentId={appointmentId}
        clientName={clientName}
        clientPhone={clientPhone}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.09),_transparent_34%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => (step > 0 ? goBack() : navigate(-1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card hover:bg-accent transition-colors shrink-0"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <BarbershopLogo
            name={barbershop?.name}
            logoUrl={barbershop?.logo_url}
            className="h-10 w-10 rounded-full border border-border/40 shadow-sm"
            fallbackClassName="text-sm"
          />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold tracking-tight text-foreground sm:text-[15px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {displayName}
            </span>
            <p className="truncate text-[11px] text-muted-foreground">Reserva online premium</p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Agendamento seguro
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 sm:pt-8 md:pb-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-border/60 bg-card/90 p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <BarbershopLogo
                      name={barbershop?.name}
                      logoUrl={barbershop?.logo_url}
                      className="h-16 w-16 rounded-full border border-border/40 shadow-sm sm:h-20 sm:w-20"
                      fallbackClassName="text-xl sm:text-2xl"
                    />

                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Reserva online
                      </div>
                      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {displayName}
                      </h1>
                      <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
                        {barbershop.description || "Agende em poucos passos, com horario claro, confirmacao segura e uma experiencia feita para converter no mobile."}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-xs text-muted-foreground shadow-sm">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Confirmacao protegida
                    </div>
                    <p className="mt-1">Seus dados sao usados apenas para reserva e contato da agenda.</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {trustStats.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2 text-primary">
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-semibold text-foreground">{item.label}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      Endereco
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs sm:text-sm">{barbershop.address || "Endereco sera informado apos a reserva."}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      Contato
                    </div>
                    <p className="mt-1 text-xs sm:text-sm">{barbershop.whatsapp || barbershop.phone || "Contato disponivel apos confirmacao."}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      Atendimento
                    </div>
                    <p className="mt-1 text-xs sm:text-sm">
                      {barbershop.opening_time?.slice(0, 5)} - {barbershop.closing_time?.slice(0, 5)}
                    </p>
                  </div>
                </div>

                {barbershop.address && (
                  <div className="overflow-hidden rounded-[24px] border border-border/60 bg-background/70 shadow-sm">
                    <LocationMap
                      address={barbershop.address}
                      name={barbershop.name}
                      addressComplement={barbershop.address_complement}
                    />
                  </div>
                )}

                {barbershop.id && (
                  <div className="rounded-[24px] border border-border/60 bg-background/70 p-4 shadow-sm">
                    <ReviewsDisplay barbershopId={barbershop.id} />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-border/60 bg-card/95 p-5 shadow-sm sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Fluxo de reserva</p>
                  <h2 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">{stepsMeta[step].label}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{stepsMeta[step].description}</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/80 px-3 py-2 text-right shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Passo</p>
                  <p className="text-sm font-bold text-foreground">{step + 1} / {stepsMeta.length}</p>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-5 gap-2">
                {stepsMeta.map((item, index) => {
                  const isDone = index < step;
                  const isActive = index === step;
                  return (
                    <div key={item.label} className="space-y-2">
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${
                        isDone ? "bg-primary" : isActive ? "bg-primary/70" : "bg-border"
                      }`} />
                      <div className={`flex items-center gap-2 rounded-2xl border px-2 py-2 text-[11px] transition-all duration-300 ${
                        isDone || isActive
                          ? "border-primary/20 bg-primary/[0.06] text-foreground"
                          : "border-border/60 bg-background/70 text-muted-foreground"
                      }`}>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                          isDone ? "bg-primary text-primary-foreground" : isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          <item.icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="hidden truncate font-medium sm:block">{item.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -24 }}
                  transition={{ duration: 0.24, ease: "easeInOut" }}
                >
                  {step === 0 && (
                    <ServiceStep services={services} selectedServices={selectedServices} onToggle={handleToggleService} />
                  )}
                  {step === 1 && (
                    <ProfessionalStep
                      professionals={professionals}
                      selectedPro={selectedPro}
                      onSelect={(id) => {
                        setSelectedPro(id);
                        setSelectedTime(null);
                        setResolvedProId(null);
                      }}
                    />
                  )}
                  {step === 2 && (
                    <DateTimeStep
                      barbershop={barbershop}
                      service={firstService}
                      professional={isAnyPro ? { name: "Primeiro disponivel", role: "O sistema escolhe o melhor horario" } : professional}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      timeSlots={finalTimeSlots}
                      groupedSlots={finalGroupedSlots}
                      dayStatusMap={dayStatusMap}
                      availability={availability}
                      onSelectDate={(d) => {
                        setSelectedDate(d);
                        setSelectedTime(null);
                      }}
                      onSelectTime={handleTimeSelect}
                      resolvedProfessional={isAnyPro && resolvedProId ? professionals.find((p) => p.id === resolvedProId) : undefined}
                    />
                  )}
                  {step === 3 && (
                    <ClientInfoStep
                      service={firstService}
                      professional={professional || (isAnyPro ? { name: "Primeiro disponivel" } : null)}
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
                      barbershop={barbershop}
                      services={selectedServiceObjects}
                      professional={professional || (isAnyPro ? { name: "Primeiro disponivel" } : null)}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      clientName={clientName}
                      clientPhone={clientPhone}
                      clientEmail={clientEmail}
                      clientNotes={clientNotes}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 hidden items-center justify-between md:flex">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={goBack}
                  disabled={step === 0}
                  className="rounded-xl px-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>

                {step < 4 ? (
                  <Button size="lg" onClick={goNext} disabled={!canNext} className="rounded-xl px-6 shadow-sm">
                    {nextActionLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="hero" size="lg" onClick={handleConfirm} disabled={submitting} className="rounded-xl px-8 shadow-lg">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Confirmar reserva
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pb-6 text-[11px] text-muted-foreground md:pb-0">
              <span>Agendamento seguro</span>
              <span className="text-muted-foreground/40">|</span>
              <span>Sem spam</span>
              <span className="text-muted-foreground/40">|</span>
              <span>Cancelamento sujeito a politica da barbearia</span>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-[28px] border border-border/60 bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Resumo</p>
                <h3 className="mt-2 text-lg font-extrabold tracking-tight">Sua reserva</h3>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="text-xs font-medium text-muted-foreground">Servicos</p>
                    {selectedServiceObjects.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {selectedServiceObjects.map((service) => (
                          <div key={service.id} className="flex items-start justify-between gap-3 text-sm">
                            <div>
                              <p className="font-semibold text-foreground">{service.name}</p>
                              <p className="text-xs text-muted-foreground">{service.duration_minutes} min</p>
                            </div>
                            <span className="font-semibold">{formatCurrency(Number(service.price))}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground">Escolha um servico para ver o resumo.</p>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Profissional</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {professional?.name || (isAnyPro ? "Primeiro disponivel" : "Selecione um profissional")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Horario</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {selectedDate && selectedTime ? `${format(selectedDate, "dd/MM")} as ${selectedTime}` : "Selecione data e hora"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-primary/15 bg-primary/[0.05] px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Total previsto</p>
                    <p className="text-sm font-semibold text-foreground">{totalDuration || 0} min</p>
                  </div>
                  <span className="text-xl font-extrabold text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div className="rounded-[28px] border border-border/60 bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Confianca</p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="font-semibold text-foreground">Fluxo otimizado para mobile</p>
                    <p className="mt-1 text-xs">Selecao rapida de servico, profissional, horario e confirmacao em poucos toques.</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="font-semibold text-foreground">Politica de cancelamento</p>
                    <p className="mt-1 text-xs">
                      {barbershop.cancellation_limit_hours
                        ? `Cancelamentos online ate ${barbershop.cancellation_limit_hours}h antes do horario.`
                        : "Consulte a barbearia para remarcacoes e cancelamentos."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                    <p className="font-semibold text-foreground">Sem spam</p>
                    <p className="mt-1 text-xs">Seus dados ficam restritos ao agendamento e a comunicacao da reserva.</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-3 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{mobileSummaryLine}</p>
            <p className="truncate text-xs text-muted-foreground">{mobileSecondaryLine}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-sm font-extrabold text-primary">{formatCurrency(totalPrice)}</p>
          </div>
          {step > 0 ? (
            <Button variant="outline" size="sm" onClick={goBack} className="rounded-xl px-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : null}
          {step < 4 ? (
            <Button onClick={goNext} disabled={!canNext} className="rounded-xl shadow-sm">
              {nextActionLabel}
            </Button>
          ) : (
            <Button variant="hero" onClick={handleConfirm} disabled={submitting} className="rounded-xl shadow-lg">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirmar
            </Button>
          )}
        </div>
      </div>

      <SupportBot />
    </div>
  );
}
