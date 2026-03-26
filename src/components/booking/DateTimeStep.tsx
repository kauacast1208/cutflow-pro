import { useMemo, useCallback, useState } from "react";
import { Scissors, User, Clock, CalendarDays, ChevronLeft, ChevronRight, Info, Sparkles } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, isToday, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/format";
import type { DayStatus, ProfessionalAvailability } from "@/lib/booking";

interface DateTimeStepProps {
  barbershop: any;
  service: any;
  professional: any;
  selectedDate: Date | undefined;
  selectedTime: string | null;
  timeSlots: string[];
  groupedSlots: { morning: string[]; afternoon: string[]; evening: string[] };
  dayStatusMap: Map<string, DayStatus>;
  availability: ProfessionalAvailability[];
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
  resolvedProfessional?: any;
}

const statusDotColors: Record<DayStatus, string> = {
  available: "bg-emerald-500",
  few: "bg-amber-500",
  full: "bg-destructive",
  closed: "",
};

export function DateTimeStep({
  barbershop,
  service,
  professional,
  selectedDate,
  selectedTime,
  timeSlots,
  groupedSlots,
  dayStatusMap,
  onSelectDate,
  onSelectTime,
  resolvedProfessional,
}: DateTimeStepProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const isDateClosed = useCallback((date: Date) => {
    const day = getDay(date);
    const closedDays = barbershop?.closed_days || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    if (closedDays.includes(day)) return true;
    return false;
  }, [barbershop]);

  const getDayStatus = useCallback((date: Date) => {
    const key = date.toISOString().split("T")[0];
    return dayStatusMap.get(key) || null;
  }, [dayStatusMap]);

  const nextAvailableToday = useMemo(() => {
    if (!selectedDate || !isToday(selectedDate) || timeSlots.length === 0) return null;
    return timeSlots[0];
  }, [selectedDate, timeSlots]);

  const renderTimeGroup = (label: string, slots: string[]) => {
    if (slots.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <span className="text-xs text-muted-foreground">{slots.length} {slots.length === 1 ? "horario" : "horarios"}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map((time) => {
            const isSelected = selectedTime === time;
            return (
              <button
                key={time}
                type="button"
                onClick={() => onSelectTime(time)}
                className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? "border-primary/30 bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(34,197,94,0.22)]"
                    : "border-border/70 bg-background hover:border-primary/20 hover:bg-accent/20 active:scale-[0.99]"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-border/60 bg-background/70 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 font-medium text-secondary-foreground">
              <Scissors className="h-3.5 w-3.5" />
              {service?.name || "Servico selecionado"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 font-medium text-secondary-foreground">
              <User className="h-3.5 w-3.5" />
              {professional?.name || "Escolha um profissional"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 font-medium text-secondary-foreground">
              <Clock className="h-3.5 w-3.5" />
              {service?.duration_minutes || 0} min
            </span>
          </div>
          <p className="text-lg font-extrabold tracking-tight text-primary">{formatCurrency(Number(service?.price || 0))}</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-border/60 bg-background/70 p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background hover:bg-accent transition-colors"
            disabled={isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 })) || weekStart < new Date()}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Calendario</p>
            <p className="text-sm font-bold capitalize text-foreground">{format(weekStart, "MMMM yyyy", { locale: ptBR })}</p>
          </div>
          <button
            type="button"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const closed = isDateClosed(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const status = getDayStatus(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => {
                  if (!closed) onSelectDate(day);
                }}
                disabled={closed}
                className={`relative rounded-2xl px-2 py-3 text-center transition-all duration-200 ${
                  isSelected
                    ? "border border-primary/30 bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(34,197,94,0.22)]"
                    : closed
                      ? "cursor-not-allowed border border-border/50 bg-muted/30 text-muted-foreground/40"
                      : "border border-border/70 bg-background hover:border-primary/20 hover:bg-accent/20"
                }`}
              >
                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em]">
                  {format(day, "EEE", { locale: ptBR }).slice(0, 3)}
                </span>
                <span className="mt-1 block text-lg font-extrabold">{format(day, "dd")}</span>
                {isCurrentDay ? (
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isSelected ? "bg-white/15 text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    Hoje
                  </span>
                ) : null}
                {!closed && status && status !== "closed" ? (
                  <span className={`absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${
                    isSelected ? "bg-primary-foreground/80" : statusDotColors[status]
                  }`} />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Disponivel</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Poucos horarios</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /> Sem vagas</span>
        </div>
      </div>

      {selectedDate ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-[24px] border border-border/60 bg-background/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Horario selecionavel</p>
              <p className="mt-1 text-base font-bold capitalize text-foreground">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
              timeSlots.length === 0 ? "bg-destructive/10 text-destructive" :
              timeSlots.length <= 3 ? "bg-amber-500/10 text-amber-600" :
              "bg-emerald-500/10 text-emerald-600"
            }`}>
              {timeSlots.length} {timeSlots.length === 1 ? "horario disponivel" : "horarios disponiveis"}
            </div>
          </div>

          {nextAvailableToday ? (
            <div className="rounded-[24px] border border-primary/15 bg-primary/[0.05] p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Proximo horario hoje</p>
                  <p className="mt-1 text-xs text-muted-foreground">A melhor opcao para encaixar sua reserva hoje e {nextAvailableToday}.</p>
                </div>
              </div>
            </div>
          ) : null}

          {resolvedProfessional && selectedTime ? (
            <div className="rounded-[24px] border border-primary/15 bg-primary/[0.05] p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Profissional resolvido automaticamente</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    O horario escolhido sera atendido por <span className="font-semibold text-foreground">{resolvedProfessional.name}</span>.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {timeSlots.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-border bg-muted/20 px-6 py-14 text-center text-muted-foreground">
              <Clock className="mx-auto mb-4 h-10 w-10 opacity-25" />
              <p className="text-base font-semibold text-foreground">Nao ha horarios livres nessa data</p>
              <p className="mt-2 text-sm">Escolha outro dia ou outro profissional para continuar.</p>
            </div>
          ) : (
            <div className="space-y-5 rounded-[24px] border border-border/60 bg-background/70 p-4 shadow-sm sm:p-5">
              {renderTimeGroup("Manha", groupedSlots.morning)}
              {renderTimeGroup("Tarde", groupedSlots.afternoon)}
              {renderTimeGroup("Noite", groupedSlots.evening)}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-border bg-muted/20 px-6 py-14 text-center text-muted-foreground">
          <CalendarDays className="mx-auto mb-4 h-10 w-10 opacity-25" />
          <p className="text-base font-semibold text-foreground">Selecione uma data para ver os horarios</p>
          <p className="mt-2 text-sm">Dias passados ficam bloqueados e a disponibilidade aparece com indicadores claros.</p>
        </div>
      )}
    </div>
  );
}
