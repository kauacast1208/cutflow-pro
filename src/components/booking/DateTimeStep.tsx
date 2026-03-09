import { useMemo, useCallback, useState } from "react";
import { Scissors, User, Clock, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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
}

const statusDotColors: Record<DayStatus, string> = {
  available: "bg-emerald-500",
  few: "bg-amber-500",
  full: "bg-destructive",
  closed: "",
};

const statusLabels: Record<DayStatus, string> = {
  available: "Disponível",
  few: "Poucos horários",
  full: "Lotado",
  closed: "Fechado",
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
  availability,
  onSelectDate,
  onSelectTime,
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
    // Check if professional has availability for this day
    if (availability.length > 0 && professional) {
      const hasAvail = availability.some(
        (a) => a.professional_id === professional.id && a.weekday === day
      );
      if (!hasAvail) return true;
    }
    return false;
  }, [barbershop, availability, professional]);

  const getDayStatus = useCallback((date: Date): DayStatus | null => {
    const key = date.toISOString().split("T")[0];
    return dayStatusMap.get(key) || null;
  }, [dayStatusMap]);

  const renderTimeGroup = (label: string, icon: string, slots: string[]) => {
    if (slots.length === 0) return null;
    return (
      <div className="mb-5 last:mb-0">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-base">{icon}</span>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
          <span className="text-xs text-muted-foreground/60 ml-auto">{slots.length} {slots.length === 1 ? "horário" : "horários"}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((t) => (
            <button
              key={t}
              onClick={() => onSelectTime(t)}
              className={`rounded-xl border py-2.5 sm:py-3 text-sm font-medium transition-all duration-200 ${
                selectedTime === t
                  ? "border-primary bg-primary text-primary-foreground shadow-md scale-[1.02]"
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent/50 active:scale-95"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl sm:text-2xl font-bold mb-1">Escolha data e horário</h2>
      <div className="flex items-center gap-2 flex-wrap text-sm text-muted-foreground mb-5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
          <Scissors className="h-3 w-3" />{service?.name}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
          <User className="h-3 w-3" />{professional?.name}
        </span>
        <span className="text-xs font-medium text-primary">{formatCurrency(Number(service?.price || 0))}</span>
      </div>

      {/* Week strip calendar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card mb-5">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
            disabled={isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 })) || weekStart < new Date()}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold capitalize">
            {format(weekStart, "MMMM yyyy", { locale: ptBR })}
          </p>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map((day) => {
            const closed = isDateClosed(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const status = getDayStatus(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => { if (!closed) onSelectDate(day); }}
                disabled={closed}
                className={`flex flex-col items-center py-2 sm:py-3 rounded-xl text-center transition-all duration-200 relative ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : closed
                      ? "opacity-30 cursor-not-allowed"
                      : isCurrentDay
                        ? "bg-accent text-accent-foreground hover:bg-primary/10"
                        : "hover:bg-accent/60"
                }`}
              >
                <span className="text-[10px] sm:text-xs uppercase font-medium">
                  {format(day, "EEE", { locale: ptBR }).slice(0, 3)}
                </span>
                <span className="text-base sm:text-lg font-bold mt-0.5">
                  {format(day, "dd")}
                </span>
                {/* Status dot indicator */}
                {!closed && status && status !== "closed" && (
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${
                    isSelected ? "bg-primary-foreground/70" : statusDotColors[status]
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">Disponível</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-muted-foreground">Poucos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            <span className="text-[10px] text-muted-foreground">Lotado</span>
          </div>
        </div>
      </div>

      {/* Time slots */}
      {selectedDate ? (
        <div className="animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold capitalize">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              timeSlots.length === 0 ? "bg-destructive/10 text-destructive" :
              timeSlots.length <= 3 ? "bg-amber-500/10 text-amber-600" :
              "bg-emerald-500/10 text-emerald-600"
            }`}>
              {timeSlots.length} {timeSlots.length === 1 ? "horário" : "horários"}
            </span>
          </div>
          {timeSlots.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground rounded-2xl border border-dashed border-border">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Nenhum horário disponível</p>
              <p className="text-xs mt-1">Tente outra data ou profissional.</p>
            </div>
          ) : (
            <div>
              {renderTimeGroup("Manhã", "", groupedSlots.morning)}
              {renderTimeGroup("Tarde", "", groupedSlots.afternoon)}
              {renderTimeGroup("Noite", "", groupedSlots.evening)}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground rounded-2xl border border-dashed border-border">
          <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Selecione uma data acima</p>
        </div>
      )}
    </div>
  );
}
