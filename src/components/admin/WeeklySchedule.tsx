import { useState } from "react";
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
  startTime: string; // HH:mm
  endTime: string;
  date: string; // yyyy-MM-dd
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
}

interface WeeklyScheduleProps {
  appointments?: Appointment[];
  onSlotClick?: (date: string, time: string) => void;
}

const hours = Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);

const statusColors: Record<string, string> = {
  scheduled: "bg-accent border-primary/30 text-accent-foreground",
  confirmed: "bg-primary/10 border-primary/40 text-primary",
  completed: "bg-muted border-border text-muted-foreground",
  cancelled: "bg-destructive/10 border-destructive/30 text-destructive",
};

export default function WeeklySchedule({ appointments = [], onSlotClick }: WeeklyScheduleProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const now = new Date();
  const weekStart = startOfWeek(addDays(now, weekOffset * 7), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (date: Date) =>
    appointments.filter((a) => a.date === format(date, "yyyy-MM-dd"));

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
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
            <div className="p-2" />
            {days.map((day) => {
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 text-center border-l border-border ${today ? "bg-accent/40" : ""}`}
                >
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                    {format(day, "EEE", { locale: ptBR })}
                  </p>
                  <p
                    className={`text-sm font-semibold mt-0.5 ${
                      today ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {format(day, "dd")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50 last:border-b-0">
              <div className="p-2.5 text-xs text-muted-foreground font-bold text-right pr-3 tabular-nums">
                {hour}
              </div>
              {days.map((day) => {
                const dayAppts = getAppointmentsForDay(day).filter((a) => a.startTime.startsWith(hour.slice(0, 2)));
                const today = isToday(day);
                return (
                  <div
                    key={day.toISOString() + hour}
                    className={`min-h-[56px] border-l border-border/50 p-1.5 cursor-pointer hover:bg-accent/30 transition-colors duration-150 ${
                      today ? "bg-accent/15" : ""
                    }`}
                    onClick={() => onSlotClick?.(format(day, "yyyy-MM-dd"), hour)}
                  >
                    {dayAppts.map((appt) => (
                      <div
                        key={appt.id}
                        className={`rounded-lg border px-2 py-1.5 text-[11px] leading-tight mb-0.5 ${
                          statusColors[appt.status] || statusColors.scheduled
                        }`}
                      >
                        <p className="font-medium truncate">{appt.clientName}</p>
                        <p className="truncate opacity-70">{appt.serviceName}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
