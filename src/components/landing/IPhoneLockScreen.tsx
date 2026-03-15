import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CalendarPlus, CheckCircle2, Clock, MessageSquare, CalendarCheck, XCircle,
  Wifi, Signal, BatteryFull,
} from "lucide-react";

const lockNotifs = [
  { icon: CalendarPlus, title: "Novo agendamento criado", body: "João Silva • Corte + Barba às 14:00", time: "agora", color: "text-primary" },
  { icon: CheckCircle2, title: "Cliente confirmou horário", body: "Pedro Santos confirmou para 10:30", time: "2 min", color: "text-emerald-500" },
  { icon: Clock, title: "Horário liberado às 19:00", body: "Um novo horário ficou disponível", time: "5 min", color: "text-blue-500" },
  { icon: MessageSquare, title: "Lembrete enviado WhatsApp", body: "Lembrete automático para Lucas Oliveira", time: "8 min", color: "text-teal-500" },
  { icon: XCircle, title: "Cliente cancelou horário", body: "Rafael Costa cancelou às 16:00", time: "12 min", color: "text-destructive" },
  { icon: CalendarCheck, title: "Novo horário disponível", body: "Terça 11/03 às 15:30 aberto", time: "15 min", color: "text-amber-500" },
];

export function IPhoneLockScreen() {
  const [visibleNotifs, setVisibleNotifs] = useState<number[]>([0]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((p) => p + 1), 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Show 1-3 notifications, growing over time then cycling
    const count = Math.min(tick + 1, 3);
    const start = Math.max(0, tick - 2) % lockNotifs.length;
    const indices = Array.from({ length: count }, (_, i) => (start + i) % lockNotifs.length);
    setVisibleNotifs(indices);
  }, [tick]);

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  const dayNames = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const dayName = dayNames[now.getDay()];
  const dateStr = `${dayName}, ${now.getDate()} de ${monthNames[now.getMonth()]}`;

  return (
    <div className="h-full flex flex-col relative overflow-hidden select-none">
      {/* Blurred wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,40%,12%)] via-[hsl(250,30%,15%)] to-[hsl(200,35%,10%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Status bar */}
      <div className="relative flex items-center justify-between px-5 pt-3 pb-1 text-white/70 text-[9px] font-medium z-10">
        <span>{hours}:{minutes}</span>
        <div className="flex items-center gap-1">
          <Signal className="h-2.5 w-2.5" />
          <Wifi className="h-2.5 w-2.5" />
          <BatteryFull className="h-3 w-3" />
        </div>
      </div>

      {/* Lock icon */}
      <div className="relative flex flex-col items-center pt-4 z-10">
        <div className="h-5 w-5 rounded-full border border-white/20 flex items-center justify-center mb-2">
          <div className="h-1.5 w-1 rounded-sm bg-white/40" />
        </div>
      </div>

      {/* Date */}
      <div className="relative text-center z-10 mb-1">
        <p className="text-white/60 text-[10px] font-medium capitalize">{dateStr}</p>
      </div>

      {/* Clock */}
      <div className="relative text-center z-10 mb-6">
        <p className="text-white text-[52px] font-thin leading-none tracking-tight" style={{ fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
          {hours}:{minutes}
        </p>
      </div>

      {/* Notifications */}
      <div className="relative z-10 flex-1 px-3 space-y-2 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {visibleNotifs.map((idx, pos) => {
            const n = lockNotifs[idx];
            const Icon = n.icon;
            return (
              <motion.div
                key={`${idx}-${tick}-${pos}`}
                initial={{ opacity: 0, y: -30, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: pos * 0.1,
                }}
                className="rounded-2xl bg-white/[0.12] backdrop-blur-2xl border border-white/[0.08] px-3 py-2.5 flex items-start gap-2.5"
              >
                {/* App icon */}
                <div className="h-8 w-8 rounded-lg bg-primary/90 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[9px] font-bold text-white/90 uppercase tracking-wide">CutFlow</p>
                    <p className="text-[8px] text-white/40">{n.time}</p>
                  </div>
                  <p className="text-[10px] font-semibold text-white/90 leading-snug mt-0.5">{n.title}</p>
                  <p className="text-[9px] text-white/50 leading-snug">{n.body}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 px-4 pb-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center">
            <div className="h-4 w-4 rounded-sm border border-white/30" />
          </div>
          <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center">
            <div className="h-3.5 w-3.5 rounded-full border-2 border-white/30" />
          </div>
        </div>
        <div className="mx-auto mt-2 w-28 h-1 rounded-full bg-white/30" />
      </div>
    </div>
  );
}
