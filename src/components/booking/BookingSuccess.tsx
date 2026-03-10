import { Check, CalendarPlus, CalendarDays, Sparkles, MessageCircle, Phone as PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format, addMinutes, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, getInitials } from "@/lib/format";
import { buildGoogleCalendarUrl } from "@/lib/calendar";

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
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Ola! Acabei de agendar ${service.name} para ${format(selectedDate, "dd/MM")} as ${selectedTime} com ${professional.name}. Obrigado!`
      )}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Success animation */}
          <div className="mx-auto mb-8">
            <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-3xl bg-primary/10 animate-in zoom-in duration-500">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-glow">
                <Check className="h-8 w-8 text-primary-foreground" strokeWidth={3} />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Tudo certo!
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">Agendamento confirmado!</h1>
          <p className="text-sm text-muted-foreground mb-8">Confira os detalhes abaixo.</p>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-card text-left space-y-3.5 mb-6">
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
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full rounded-xl h-12 font-semibold bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Falar no WhatsApp
                </Button>
              </a>
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

          <Link to={`/agendar/${slug}`} onClick={() => window.location.reload()}>
            <Button variant="ghost" size="sm" className="text-muted-foreground font-medium">
              Agendar outro horario
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
