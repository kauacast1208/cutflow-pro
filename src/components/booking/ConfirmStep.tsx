import { format, addMinutes, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/format";
import { User, CalendarDays, Clock, Phone, Mail, ShieldCheck } from "lucide-react";
import { ProfessionalAvatar } from "@/components/shared/ProfessionalAvatar";

interface ConfirmStepProps {
  barbershop?: any;
  services: any[];
  professional: any;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  clientNotes: string;
}

export function ConfirmStep({
  barbershop,
  services,
  professional,
  selectedDate,
  selectedTime,
  clientName,
  clientPhone,
  clientEmail,
  clientNotes,
}: ConfirmStepProps) {
  const totalDuration = services.reduce((sum: number, service: any) => sum + service.duration_minutes, 0);
  const totalPrice = services.reduce((sum: number, service: any) => sum + Number(service.price), 0);

  const endTimeStr = selectedTime && selectedDate && totalDuration
    ? format(addMinutes(parse(selectedTime, "HH:mm", selectedDate), totalDuration), "HH:mm")
    : "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Revise antes de confirmar</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tudo organizado em um resumo final claro para reduzir erro e aumentar confianca.
        </p>
      </div>

      <div className="rounded-[28px] border border-border/60 bg-background/70 p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          <ProfessionalAvatar
            name={professional?.name}
            avatarUrl={professional?.avatar_url}
            className="h-14 w-14 rounded-[20px] border border-border/70 shadow-sm"
            fallbackClassName="rounded-[20px]"
            imageClassName="object-cover"
          />
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight text-foreground">{professional?.name || "Primeiro disponivel"}</p>
            <p className="text-sm text-muted-foreground">{professional?.role || "Profissional confirmado para sua reserva"}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-[24px] border border-border/60 bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Servicos</p>
            <div className="mt-3 space-y-3">
              {services.map((service: any) => (
                <div key={service.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{service.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{service.duration_minutes} min</p>
                  </div>
                  <span className="font-semibold text-foreground">{formatCurrency(Number(service.price))}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border/60 bg-card p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-muted-foreground"><CalendarDays className="h-4 w-4" />Data</p>
              <p className="mt-2 font-semibold capitalize text-foreground">
                {selectedDate && format(selectedDate, "EEEE, dd MMM", { locale: ptBR })}
              </p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-card p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-muted-foreground"><Clock className="h-4 w-4" />Horario</p>
              <p className="mt-2 font-semibold text-foreground">{selectedTime} {endTimeStr ? `- ${endTimeStr}` : ""}</p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-card p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-muted-foreground"><User className="h-4 w-4" />Cliente</p>
              <p className="mt-2 font-semibold text-foreground">{clientName}</p>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-card p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-muted-foreground"><Phone className="h-4 w-4" />Contato</p>
              <p className="mt-2 font-semibold text-foreground">{clientPhone}</p>
              {clientEmail ? <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5" />{clientEmail}</p> : null}
            </div>
          </div>

          {clientNotes ? (
            <div className="rounded-[24px] border border-border/60 bg-card p-4 text-sm">
              <p className="font-medium text-muted-foreground">Observacoes</p>
              <p className="mt-2 text-foreground">{clientNotes}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-between rounded-[24px] border border-primary/15 bg-primary/[0.05] px-4 py-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total estimado</p>
            <p className="text-sm font-semibold text-foreground">{totalDuration} min reservados</p>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-primary">{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      <div className="rounded-[24px] border border-primary/15 bg-primary/[0.05] p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Reserva segura</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {barbershop?.allow_online_cancellation
                ? "Voce podera gerenciar a reserva online conforme a politica da barbearia."
                : "Caso precise alterar algo, fale com a barbearia apos a confirmacao."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
