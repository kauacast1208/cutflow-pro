import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CalendarPlus, CheckCircle2, Clock, MessageSquare, XCircle,
  Wifi, Signal, BatteryFull,
} from "lucide-react";

const lockNotifs = [
  { icon: CalendarPlus, title: "Novo agendamento criado", body: "João Silva • Corte + Barba às 14:00", time: "agora" },
  { icon: CheckCircle2, title: "Cliente confirmou horário", body: "Pedro Santos confirmou para 10:30", time: "2 min" },
  { icon: Clock, title: "Horário liberado às 19:00", body: "Um novo horário ficou disponível", time: "5 min" },
  { icon: MessageSquare, title: "Lembrete enviado WhatsApp", body: "Lembrete automático para Lucas Oliveira", time: "8 min" },
  { icon: XCircle, title: "Cliente cancelou horário", body: "Rafael Costa cancelou às 16:00", time: "12 min" },
];

export function IPhoneLockScreen() {
  const [visibleNotifs, setVisibleNotifs] = useState<number[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((p) => p + 1), 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const count = Math.min(tick + 1, 4);
    const start = Math.max(0, tick - 3) % lockNotifs.length;
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
      {/* Premium wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,35%,8%)] via-[hsl(260,25%,12%)] to-[hsl(200,30%,7%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(270,40%,30%,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Status bar */}
      <div className="relative flex items-center justify-between px-6 pt-3.5 pb-1 text-white/60 text-[9px] font-medium z-10">
        <span>{hours}:{minutes}</span>
        <div className="flex items-center gap-1">
          <Signal className="h-2.5 w-2.5" />
          <Wifi className="h-2.5 w-2.5" />
          <BatteryFull className="h-3 w-3" />
        </div>
      </div>

      {/* Lock icon */}
      <div className="relative flex flex-col items-center pt-5 z-10">
        <div className="h-5 w-5 rounded-full border border-white/15 flex items-center justify-center mb-2">
          <div className="h-1.5 w-1 rounded-sm bg-white/30" />
        </div>
      </div>

      {/* Date */}
      <div className="relative text-center z-10 mb-0.5">
        <p className="text-white/45 text-[10px] font-medium capitalize tracking-wide">{dateStr}</p>
      </div>

      {/* Clock */}
      <div className="relative text-center z-10 mb-5">
        <p
          className="text-white/95 text-[56px] font-extralight leading-none tracking-tight"
          style={{ fontFamily: "'SF Pro Display', -apple-system, system-ui, sans-serif" }}
        >
          {hours}:{minutes}
        </p>
      </div>

      {/* Notifications */}
      <div className="relative z-10 flex-1 px-2.5 space-y-1.5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {visibleNotifs.map((idx, pos) => {
            const n = lockNotifs[idx];
            const Icon = n.icon;
            return (
              <motion.div
                key={`${idx}-${tick}-${pos}`}
                initial={{ opacity: 0, y: -40, scale: 0.88, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, y: 8, filter: "blur(2px)" }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                  delay: pos * 0.12,
                }}
                className="rounded-[14px] bg-white/[0.10] backdrop-blur-2xl border border-white/[0.06] px-3 py-2.5 flex items-start gap-2.5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.3)]"
              >
                <div className="h-8 w-8 rounded-[8px] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-[0_2px_12px_-2px_hsl(var(--primary)/0.4)]">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[9px] font-bold text-white/80 uppercase tracking-wider">CutFlow</p>
                    <p className="text-[8px] text-white/30">{n.time}</p>
                  </div>
                  <p className="text-[10px] font-semibold text-white/90 leading-snug mt-0.5">{n.title}</p>
                  <p className="text-[9px] text-white/40 leading-snug">{n.body}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 px-4 pb-2.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-full bg-white/[0.08] backdrop-blur-xl flex items-center justify-center">
            <div className="h-4 w-4 rounded-[3px] border border-white/25" />
          </div>
          <div className="h-8 w-8 rounded-full bg-white/[0.08] backdrop-blur-xl flex items-center justify-center">
            <div className="h-3.5 w-3.5 rounded-full border-2 border-white/25" />
          </div>
        </div>
        <div className="mx-auto mt-2 w-[100px] h-[4px] rounded-full bg-white/25" />
      </div>
    </div>
  );
}
