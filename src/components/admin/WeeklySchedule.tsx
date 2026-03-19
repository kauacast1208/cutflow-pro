import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Appointment {
  id: string;
  clientName: string;
  serviceName: string;
  professionalName: string;
  startTime: string;
  endTime: string;
  date: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
}

interface WeeklyScheduleProps {
  appointments?: Appointment[];
  onSlotClick?: (date: string, time: string) => void;
}

const hours = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);

const statusConfig: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  scheduled: {
    bg: "bg-accent/80",
    border: "border-primary/20",
    text: "text-accent-foreground",
    dot: "bg-primary",
  },
  confirmed: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
    dot: "bg-primary",
  },
  completed: {
    bg: "bg-muted/60",
    border: "border-border",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  cancelled: {
    bg: "bg-destructive/8",
    border: "border-destructive/20",
    text: "text-destructive/80",
    dot: "bg-destructive/60",
  },
};

export default function WeeklySchedule({ appointments = [], onSlotClick }: WeeklyScheduleProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const n = new Date();
      setCurrentMinutes(n.getHours() * 60 + n.getMinutes());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const weekStart = startOfWeek(addDays(now, weekOffset * 7), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (date: Date) =>
    appointments.filter((a) => a.date === format(date, "yyyy-MM-dd"));

  // Current time indicator position (percentage within the grid)
  const gridStartMinutes = 8 * 60; // 08:00
  const gridEndMinutes = 20 * 60;  // 20:00
  const isCurrentTimeVisible = currentMinutes >= gridStartMinutes && currentMinutes <= gridEndMinutes;
  const currentTimePercent = ((currentMinutes - gridStartMinutes) / (gridEndMinutes - gridStartMinutes)) * 100;

  // Check if current week contains today
  const weekHasToday = days.some((d) => isToday(d));
  const todayIndex = days.findIndex((d) => isToday(d));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3
          className="text-base font-semibold text-foreground"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Agenda da semana
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 px-3 font-medium"
            onClick={() => setWeekOffset(0)}
          >
            Hoje
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((w) => w + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[740px] relative">
          {/* Day headers */}
          <div className="grid grid-cols-[76px_repeat(7,1fr)] border-b border-border/60 bg-muted/[0.03]">
            <div className="p-2" />
            {days.map((day) => {
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`py-3 px-2 text-center border-l border-border/30 transition-colors ${
                    today ? "bg-primary/[0.06]" : ""
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/50 font-semibold">
                    {format(day, "EEE", { locale: ptBR })}
                  </p>
                  <p
                    className={`text-sm mt-0.5 tabular-nums ${
                      today
                        ? "font-bold text-primary bg-primary/10 rounded-full w-7 h-7 flex items-center justify-center mx-auto"
                        : "font-semibold text-foreground"
                    }`}
                  >
                    {format(day, "dd")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Time rows with current time indicator */}
          <div className="relative">
            {/* Current time indicator line */}
            {isCurrentTimeVisible && weekHasToday && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${currentTimePercent}%` }}
              >
                {/* Line across the today column */}
                <div className="grid grid-cols-[76px_repeat(7,1fr)]">
                  <div className="relative">
                    {/* Time label */}
                    <span className="absolute right-1 -top-2.5 text-[10px] font-bold text-primary tabular-nums bg-primary/10 px-1.5 py-0.5 rounded-md">
                      {`${Math.floor(currentMinutes / 60).toString().padStart(2, "0")}:${(currentMinutes % 60).toString().padStart(2, "0")}`}
                    </span>
                  </div>
                  {days.map((day, i) => (
                    <div key={i} className="relative border-l border-border/30">
                      {isToday(day) && (
                        <>
                          <div className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
                          <div className="absolute -left-[5px] -top-[4px] w-[10px] h-[10px] rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.5)]" />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hours.map((hour, hourIdx) => (
              <div
                key={hour}
                className={`grid grid-cols-[76px_repeat(7,1fr)] border-b border-border/30 last:border-b-0 ${
                  hourIdx % 2 === 0 ? "bg-background" : "bg-muted/[0.02]"
                }`}
              >
                {/* Hour label */}
                <div className="min-h-[72px] flex items-start justify-end pr-3 pt-2">
                  <span
                    className="text-[11px] text-muted-foreground/50 font-semibold tabular-nums tracking-tight"
                    style={{ fontFamily: "'Plus Jakarta Sans', monospace" }}
                  >
                    {hour}
                  </span>
                </div>

                {/* Day cells */}
                {days.map((day) => {
                  const dayAppts = getAppointmentsForDay(day).filter((a) =>
                    a.startTime.startsWith(hour.slice(0, 2))
                  );
                  const today = isToday(day);
                  const hasAppts = dayAppts.length > 0;

                  return (
                    <div
                      key={day.toISOString() + hour}
                      className={`min-h-[72px] border-l border-border/30 p-1.5 cursor-pointer transition-all duration-150 group relative ${
                        today
                          ? "bg-primary/[0.03]"
                          : ""
                      } ${
                        !hasAppts
                          ? "hover:bg-accent/20"
                          : ""
                      }`}
                      onClick={() => onSlotClick?.(format(day, "yyyy-MM-dd"), hour)}
                    >
                      {/* Hover indicator for empty slots */}
                      {!hasAppts && (
                        <div className="absolute inset-1.5 rounded-lg border border-dashed border-transparent group-hover:border-primary/15 transition-colors duration-150" />
                      )}

                      {dayAppts.map((appt) => {
                        const sc = statusConfig[appt.status] || statusConfig.scheduled;
                        return (
                          <div
                            key={appt.id}
                            className={`rounded-lg border ${sc.border} ${sc.bg} px-2.5 py-2 mb-1 last:mb-0 transition-shadow hover:shadow-md`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} shrink-0`} />
                              <p
                                className={`text-[11px] font-bold truncate ${sc.text}`}
                                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                              >
                                {appt.serviceName}
                              </p>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate pl-3">
                              {appt.clientName}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 tabular-nums pl-3 mt-0.5">
                              {appt.startTime} – {appt.endTime}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
