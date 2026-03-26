import { Check, CalendarPlus, CalendarDays, Sparkles, MessageCircle, ShieldCheck, Clock3, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format, addMinutes, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/format";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { motion } from "framer-motion";
import { openWhatsApp } from "@/lib/whatsappCTA";
import { ReviewDialog } from "@/components/booking/ReviewDialog";
import { useState } from "react";
import { ProfessionalAvatar } from "@/components/shared/ProfessionalAvatar";

interface BookingSuccessProps {
  barbershop: any;
  services?: any[];
  service: any;
  professional: any;
  selectedDate: Date;
  selectedTime: string;
  slug: string;
  onReschedule: () => void;
  onCancel: () => void;
  appointmentId?: string | null;
  clientName?: string;
  clientPhone?: string;
}

export function BookingSuccess({
  barbershop,
  services = [],
  service,
  professional,
  selectedDate,
  selectedTime,
  slug,
  onReschedule,
  onCancel,
  appointmentId,
  clientName,
  clientPhone,
}: BookingSuccessProps) {
  const [reviewDone, setReviewDone] = useState(false);
  const bookedServices = services.length > 0 ? services : [service];
  const totalDuration = bookedServices.reduce((sum, item) => sum + (item?.duration_minutes || 0), 0) || service.duration_minutes;
  const totalPrice = bookedServices.reduce((sum, item) => sum + Number(item?.price || 0), 0) || Number(service.price);
  const endTimeStr = format(
    addMinutes(parse(selectedTime, "HH:mm", selectedDate), totalDuration),
    "HH:mm",
  );

  const handleAddToCalendar = () => {
    const label = bookedServices.length > 1 ? `${bookedServices.length} servicos` : service.name;
    const url = buildGoogleCalendarUrl({
      title: `${label} - ${barbershop.name}`,
      date: selectedDate,
      startTime: selectedTime,
      durationMinutes: totalDuration,
      description: `Profissional: ${professional.name}\nValor: ${formatCurrency(totalPrice)}`,
      location: barbershop.address || "",
    });
    window.open(url, "_blank");
  };

  const whatsappNumber = barbershop.whatsapp || barbershop.phone;
  const whatsappMessage = `Ola! Acabei de agendar ${service.name} para ${format(selectedDate, "dd/MM")} as ${selectedTime} com ${professional.name}. Obrigado!`;

  const handleWhatsApp = () => {
    if (whatsappNumber) {
      openWhatsApp(whatsappNumber, whatsappMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.09),_transparent_34%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))]">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full space-y-5"
        >
          <div className="rounded-[32px] border border-border/60 bg-card/95 p-6 shadow-sm sm:p-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.12, type: "spring", stiffness: 220, damping: 16 }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-primary/10"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary text-primary-foreground shadow-[0_18px_36px_rgba(34,197,94,0.28)]">
                  <Check className="h-8 w-8" strokeWidth={3} />
                </div>
              </motion.div>

              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.05] px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Booking confirmed
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Reserva confirmada</h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Seu horario foi registrado com sucesso. Salve no calendario ou fale com a barbearia pelo WhatsApp.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-[28px] border border-border/60 bg-background/70 p-5 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                  <ProfessionalAvatar
                    name={professional.name}
                    avatarUrl={professional.avatar_url}
                    className="h-14 w-14 rounded-[20px] border border-border/70 shadow-sm"
                    fallbackClassName="rounded-[20px]"
                    imageClassName="object-cover"
                  />
                  <div>
                    <p className="text-base font-bold tracking-tight text-foreground">{professional.name}</p>
                    <p className="text-sm text-muted-foreground">{professional.role || "Profissional confirmado"}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-[24px] border border-border/60 bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Resumo da reserva</p>
                    <div className="mt-3 space-y-3 text-sm">
                      {bookedServices.map((item) => (
                        <div key={item.id || item.name} className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <Scissors className="mt-0.5 h-4 w-4 text-primary" />
                            <div>
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.duration_minutes} min</p>
                            </div>
                          </div>
                          <span className="font-semibold text-foreground">{formatCurrency(Number(item.price || 0))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[24px] border border-border/60 bg-card p-4 text-sm">
                      <p className="text-muted-foreground">Data</p>
                      <p className="mt-2 font-semibold capitalize text-foreground">
                        {format(selectedDate, "EEEE, dd MMM", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="rounded-[24px] border border-border/60 bg-card p-4 text-sm">
                      <p className="text-muted-foreground">Horario</p>
                      <p className="mt-2 font-semibold text-foreground">{selectedTime} - {endTimeStr}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-primary/15 bg-primary/[0.05] p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Total</p>
                  <p className="mt-2 text-3xl font-extrabold tracking-tight text-primary">{formatCurrency(totalPrice)}</p>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />{totalDuration} min reservados</p>
                    <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Confirmacao segura e sem spam</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {whatsappNumber ? (
                    <Button
                      className="h-12 w-full rounded-2xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                      onClick={handleWhatsApp}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Falar no WhatsApp
                    </Button>
                  ) : null}

                  <Button variant="outline" className="h-12 w-full rounded-2xl font-semibold" onClick={handleAddToCalendar}>
                    <CalendarPlus className="h-4 w-4" />
                    Adicionar ao calendario
                  </Button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <Button variant="outline" className="h-11 rounded-2xl font-semibold text-sm" onClick={onReschedule}>
                      <CalendarDays className="h-4 w-4" />
                      Remarcar
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 rounded-2xl border-destructive/20 font-semibold text-sm text-destructive hover:bg-destructive/5 hover:text-destructive"
                      onClick={onCancel}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-border/60 bg-background/70 p-4 text-sm text-muted-foreground shadow-sm">
                  <p className="font-semibold text-foreground">Proximos passos</p>
                  <p className="mt-2">Voce tambem pode salvar o compromisso no calendario e responder a avaliacao depois do atendimento.</p>
                </div>
              </div>
            </div>
          </div>

          {!reviewDone && barbershop?.id ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <ReviewDialog
                barbershopId={barbershop.id}
                appointmentId={appointmentId}
                professionalId={professional?.id}
                clientName={clientName || "Cliente"}
                clientPhone={clientPhone}
                onSubmitted={() => setReviewDone(true)}
              />
            </motion.div>
          ) : null}

          <div className="text-center">
            <Link to={`/b/${slug}`} onClick={() => window.location.reload()}>
              <Button variant="ghost" size="sm" className="font-medium text-muted-foreground">
                Agendar outro horario
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
