import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Check, ArrowRight, ArrowLeft, Scissors,
  Loader2, AlertCircle, MapPin, ChevronLeft, User, CalendarDays, Phone
} from "lucide-react";
import { format, addMinutes, parse } from "date-fns";
import SupportBot from "@/components/booking/SupportBot";
import { ServiceStep } from "@/components/booking/ServiceStep";
import { ProfessionalStep } from "@/components/booking/ProfessionalStep";
import { DateTimeStep } from "@/components/booking/DateTimeStep";
import { ClientInfoStep } from "@/components/booking/ClientInfoStep";
import { ConfirmStep } from "@/components/booking/ConfirmStep";
import { BookingSuccess } from "@/components/booking/BookingSuccess";
import { useBookingSlots } from "@/hooks/useBookingSlots";
import { sendBookingEmail } from "@/lib/email";

type Step = 0 | 1 | 2 | 3 | 4;

const stepsMeta = [
  { label: "Serviço", icon: Scissors },
  { label: "Profissional", icon: User },
  { label: "Data e hora", icon: CalendarDays },
  { label: "Seus dados", icon: Phone },
  { label: "Confirmar", icon: Check },
];

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
  const [selectedService, setSelectedService] = useState<string | null>(null);
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

  const service = services.find((s) => s.id === selectedService);
  const professional = professionals.find((p) => p.id === selectedPro);

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
    Promise.all([
      supabase.from("appointments").select("*").eq("barbershop_id", barbershop.id).eq("date", dateStr)
        .not("status", "eq", "cancelled"),
      supabase.from("blocked_times").select("*").eq("barbershop_id", barbershop.id).eq("date", dateStr),
    ]).then(([appRes, blockRes]) => {
      setAppointments(appRes.data || []);
      setBlockedTimes(blockRes.data || []);
    });
  }, [selectedDate, barbershop]);

  const { timeSlots, groupedSlots, dayStatusMap } = useBookingSlots({
    barbershop,
    selectedDate,
    selectedPro,
    serviceDuration: service?.duration_minutes,
    appointments,
    blockedTimes,
    availability,
  });

  const canNext =
    (step === 0 && selectedService !== null) ||
    (step === 1 && selectedPro !== null) ||
    (step === 2 && selectedDate !== undefined && selectedTime !== null) ||
    (step === 3 && clientName.trim() !== "" && clientPhone.trim() !== "") ||
    step === 4;

  const handleConfirm = async () => {
    if (!barbershop || !service || !professional || !selectedDate || !selectedTime) return;
    setSubmitting(true);

    const endTime = format(
      addMinutes(parse(selectedTime, "HH:mm", selectedDate), service.duration_minutes),
      "HH:mm"
    );

    if (clientName.trim()) {
      await supabase.from("clients").upsert(
        { barbershop_id: barbershop.id, name: clientName, phone: clientPhone, email: clientEmail },
        { onConflict: "id" }
      );
    }

    const { data, error } = await supabase.from("appointments").insert({
      barbershop_id: barbershop.id,
      service_id: service.id,
      professional_id: professional.id,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail,
      notes: clientNotes || null,
      date: format(selectedDate, "yyyy-MM-dd"),
      start_time: selectedTime,
      end_time: endTime,
      price: service.price,
      status: barbershop.auto_confirm ? "confirmed" : "scheduled",
    }).select("id").single();

    setSubmitting(false);
    if (!error && data) {
      setAppointmentId(data.id);
      setConfirmed(true);
      sendBookingEmail({
        type: "confirmed",
        clientName,
        clientEmail,
        service,
        professional,
        selectedDate,
        selectedTime,
        barbershop,
      });
      supabase.functions.invoke("send-booking-confirmation", {
        body: { appointmentId: data.id },
      }).catch(console.error);
    }
  };

  const resetForm = () => {
    setConfirmed(false);
    setStep(0);
    setSelectedService(null);
    setSelectedPro(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setClientNotes("");
    setAppointmentId(null);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentId) return;
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", appointmentId);
    if (clientEmail && service && professional && selectedDate && selectedTime) {
      sendBookingEmail({
        type: "cancelled",
        clientName,
        clientEmail,
        service,
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
    setStep(2);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setAppointmentId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Barbearia não encontrada</h1>
          <p className="text-muted-foreground mb-8">O link que você acessou não corresponde a nenhuma barbearia cadastrada.</p>
          <Link to="/"><Button variant="outline" className="rounded-xl h-11 px-6">Voltar ao início</Button></Link>
        </div>
      </div>
    );
  }

  if (confirmed && service && professional && selectedDate && selectedTime) {
    return (
      <BookingSuccess
        barbershop={barbershop}
        service={service}
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
        <div className="max-w-2xl mx-auto flex h-16 items-center px-4 gap-3">
          <button
            onClick={() => step > 0 ? setStep((step - 1) as Step) : navigate(-1)}
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

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Progress steps */}
        <div className="flex items-center gap-1 mb-8">
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

        {/* Step content */}
        {step === 0 && (
          <ServiceStep services={services} selectedService={selectedService} onSelect={setSelectedService} />
        )}
        {step === 1 && (
          <ProfessionalStep
            professionals={professionals}
            selectedPro={selectedPro}
            onSelect={(id) => { setSelectedPro(id); setSelectedTime(null); }}
          />
        )}
        {step === 2 && (
          <DateTimeStep
            barbershop={barbershop}
            service={service}
            professional={professional}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            timeSlots={timeSlots}
            groupedSlots={groupedSlots}
            dayStatusMap={dayStatusMap}
            availability={availability}
            onSelectDate={(d) => { setSelectedDate(d); setSelectedTime(null); }}
            onSelectTime={setSelectedTime}
          />
        )}
        {step === 3 && (
          <ClientInfoStep
            service={service}
            professional={professional}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            clientName={clientName}
            clientPhone={clientPhone}
            clientEmail={clientEmail}
            clientNotes={clientNotes}
            onChangeName={setClientName}
            onChangePhone={setClientPhone}
            onChangeEmail={setClientEmail}
            onChangeNotes={setClientNotes}
          />
        )}
        {step === 4 && (
          <ConfirmStep
            service={service}
            professional={professional}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            clientName={clientName}
            clientPhone={clientPhone}
            clientNotes={clientNotes}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 sm:mt-10 pb-24 sm:pb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep((step - 1) as Step)}
            disabled={step === 0}
            className="rounded-xl h-12 px-6 font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          {step < 4 ? (
            <Button
              size="lg"
              onClick={() => setStep((step + 1) as Step)}
              disabled={!canNext}
              className="rounded-xl h-12 px-6 font-semibold shadow-sm"
            >
              Próximo <ArrowRight className="h-4 w-4 ml-2" />
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
