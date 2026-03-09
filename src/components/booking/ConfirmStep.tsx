import { format, addMinutes, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, getInitials } from "@/lib/format";
import { CheckCircle2, Scissors, User, CalendarDays, Clock } from "lucide-react";

interface ConfirmStepProps {
  service: any;
  professional: any;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  clientName: string;
  clientPhone: string;
  clientNotes: string;
}

export function ConfirmStep({
  service,
  professional,
  selectedDate,
  selectedTime,
  clientName,
  clientPhone,
  clientNotes,
}: ConfirmStepProps) {
  const endTimeStr = selectedTime && service && selectedDate
    ? format(addMinutes(parse(selectedTime, "HH:mm", selectedDate), service.duration_minutes), "HH:mm")
    : "";

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5">Confirmar agendamento</h2>
      <p className="text-muted-foreground text-sm mb-7">Revise os detalhes antes de confirmar.</p>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-card space-y-3.5 max-w-md">
        {/* Professional header */}
        <div className="flex items-center gap-3.5 pb-4 border-b border-border">
          {professional?.avatar_url ? (
            <img src={professional.avatar_url} className="h-12 w-12 rounded-xl object-cover border border-border" alt="" />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm">
              {getInitials(professional?.name || "")}
            </div>
          )}
          <div>
            <p className="font-bold text-[15px]">{professional?.name}</p>
            <p className="text-xs text-muted-foreground">{professional?.role}</p>
          </div>
        </div>

        <div className="flex justify-between text-sm py-0.5">
          <span className="text-muted-foreground flex items-center gap-2"><Scissors className="h-3.5 w-3.5" />Serviço</span>
          <span className="font-semibold">{service?.name}</span>
        </div>
        <div className="flex justify-between text-sm py-0.5">
          <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-3.5 w-3.5" />Duração</span>
          <span className="font-semibold">{service?.duration_minutes} min</span>
        </div>
        <div className="flex justify-between text-sm py-0.5">
          <span className="text-muted-foreground flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" />Data</span>
          <span className="font-semibold capitalize">
            {selectedDate && format(selectedDate, "EEEE, dd MMM", { locale: ptBR })}
          </span>
        </div>
        <div className="flex justify-between text-sm py-0.5">
          <span className="text-muted-foreground flex items-center gap-2"><Clock className="h-3.5 w-3.5" />Horário</span>
          <span className="font-semibold">{selectedTime} - {endTimeStr}</span>
        </div>
        <div className="flex justify-between text-sm py-0.5">
          <span className="text-muted-foreground flex items-center gap-2"><User className="h-3.5 w-3.5" />Cliente</span>
          <span className="font-semibold">{clientName}</span>
        </div>
        {clientPhone && (
          <div className="flex justify-between text-sm py-0.5">
            <span className="text-muted-foreground">Telefone</span>
            <span className="font-semibold">{clientPhone}</span>
          </div>
        )}
        {clientNotes && (
          <div className="flex justify-between text-sm py-0.5">
            <span className="text-muted-foreground">Observações</span>
            <span className="font-semibold text-right max-w-[200px]">{clientNotes}</span>
          </div>
        )}
        <div className="border-t border-border pt-4 flex justify-between items-center">
          <span className="font-bold">Total</span>
          <span className="font-extrabold text-xl text-primary">{formatCurrency(Number(service?.price || 0))}</span>
        </div>
      </div>
    </div>
  );
}
