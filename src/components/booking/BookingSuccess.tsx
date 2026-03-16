import { Check, CalendarPlus, CalendarDays, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format, addMinutes, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, getInitials } from "@/lib/format";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { motion } from "framer-motion";
import { openWhatsApp } from "@/lib/whatsappCTA";

interface BookingSuccessProps {
  barbershop: any;
  service: any;
  professional: any;
  selectedDate: Date;
  selectedTime: string;
  slug: string;
  onReschedule: () => void;
  onCancel: () => void;
}

export function BookingSuccess({
  barbershop,
  service,
  professional,
  selectedDate,
  selectedTime,
  slug,
  onReschedule,
  onCancel,
}: BookingSuccessProps) {
  const endTimeStr = format(
    addMinutes(parse(selectedTime, "HH:mm", selectedDate), service.duration_minutes),
    "HH:mm"
  );

  const handleAddToCalendar = () => {
    const url = buildGoogleCalendarUrl({
      title: `${service.name} - ${barbershop.name}`,
      date: selectedDate,
      startTime: selectedTime,
      durationMinutes: service.duration_minutes,
      description: `Profissional: ${professional.name}\nValor: ${formatCurrency(Number(service.price))}`,
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
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center max-w-md w-full"
        >
          {/* Success animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-8"
          >
            <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-3xl bg-primary/10">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow">
                <Check className="h-8 w-8 text-primary-foreground" strokeWidth={3} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/15 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Tudo certo!
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">Agendamento confirmado!</h1>
            <p className="text-sm text-muted-foreground mb-8">Confira os detalhes abaixo.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm text-left space-y-3.5 mb-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                {professional.avatar_url ? (
                  <img src={professional.avatar_url} className="h-12 w-12 rounded-xl object-cover border border-border" alt="" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                    {getInitials(professional.name)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{professional.name}</p>
                  <p className="text-xs text-muted-foreground">{professional.role}</p>
                </div>
              </div>

              <div className="flex justify-between text-sm py-0.5">
                <span className="text-muted-foreground">Servico</span>
                <span className="font-semibold">{service.name}</span>
              </div>
              <div className="flex justify-between text-sm py-0.5">
                <span className="text-muted-foreground">Data</span>
                <span className="font-semibold capitalize">{format(selectedDate, "EEEE, dd MMM", { locale: ptBR })}</span>
              </div>
              <div className="flex justify-between text-sm py-0.5">
                <span className="text-muted-foreground">Horario</span>
                <span className="font-semibold">{selectedTime} - {endTimeStr}</span>
              </div>
              <div className="flex justify-between text-sm py-0.5">
                <span className="text-muted-foreground">Duracao</span>
                <span className="font-semibold">{service.duration_minutes} min</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="font-extrabold text-xl text-primary">{formatCurrency(Number(service.price))}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 mb-5">
              {whatsappNumber && (
                <Button
                  className="w-full rounded-xl h-12 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              )}

              <Button variant="outline" className="w-full rounded-xl h-12 font-semibold" onClick={handleAddToCalendar}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Salvar na agenda
              </Button>
            </div>

            <div className="flex gap-2.5 mb-5">
              <Button variant="outline" className="flex-1 rounded-xl h-11 font-semibold text-sm" onClick={onReschedule}>
                <CalendarDays className="h-4 w-4 mr-1.5" />
                Remarcar
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11 font-semibold text-sm text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            </div>

          <Link to={`/b/${slug}`} onClick={() => window.location.reload()}>
              <Button variant="ghost" size="sm" className="text-muted-foreground font-medium">
                Agendar outro horário
              </Button>
            </Link>

            {/* Viral CutFlow branding */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Sistema de agendamento profissional:{" "}
                <a
                  href="https://cutflow.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline"
                >
                  CutFlow
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
