import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import {
  CalendarPlus, CheckCircle2, Clock, MessageSquare, UserCheck,
  Scissors, Wifi, Signal, BatteryFull,
} from "lucide-react";

/* ─── Notification data ─── */
const lockNotifs = [
  { icon: CalendarPlus, title: "Novo agendamento criado", body: "João Silva • Corte + Barba às 14:00", time: "agora" },
  { icon: CheckCircle2, title: "Cliente confirmou horário", body: "Pedro Santos confirmou para 10:30", time: "2 min" },
  { icon: Clock, title: "Horário liberado às 19:00", body: "Um novo horário ficou disponível", time: "5 min" },
  { icon: MessageSquare, title: "Lembrete enviado WhatsApp", body: "Lembrete automático para Lucas Oliveira", time: "8 min" },
  { icon: UserCheck, title: "João barbeiro disponível", body: "Horário aberto às 14:30 — encaixe liberado", time: "12 min" },
  { icon: Scissors, title: "Corte + barba confirmado", body: "Rafael Costa • Amanhã às 16:00", time: "15 min" },
];

export function IPhoneLockScreen() {
  const [notifications, setNotifications] = useState<number[]>([]);
  const [cycle, setCycle] = useState(0);

  // Drop one notification every 2.8s, up to 4 visible, then reset
  const addNotification = useCallback(() => {
    setNotifications((prev) => {
      if (prev.length >= 4) {
        setCycle((c) => c + 1);
        return [];
      }
      const nextIdx = (cycle * 4 + prev.length) % lockNotifs.length;
      return [...prev, nextIdx];
    });
  }, [cycle]);

  useEffect(() => {
    const interval = setInterval(addNotification, 2800);
    // Drop first one immediately
    const timeout = setTimeout(addNotification, 600);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [addNotification]);

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  const dayNames = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const dayName = dayNames[now.getDay()];
  const dateStr = `${dayName}, ${now.getDate()} de ${monthNames[now.getMonth()]}`;

  return (
    <div className="h-full flex flex-col relative overflow-hidden select-none">
      {/* Wallpaper - adapts to theme */}
      <div className="absolute inset-0 bg-[hsl(240,20%,3%)] dark:bg-[hsl(240,20%,3%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(152,55%,30%,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(270,40%,25%,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Status bar */}
      <div className="relative flex items-center justify-between px-7 pt-3.5 pb-1 text-white/50 text-[9px] font-medium z-10">
        <span>{hours}:{minutes}</span>
        <div className="flex items-center gap-1">
          <Signal className="h-2.5 w-2.5" />
          <Wifi className="h-2.5 w-2.5" />
          <BatteryFull className="h-3 w-3" />
        </div>
      </div>

      {/* Lock icon */}
      <div className="relative flex flex-col items-center pt-4 z-10">
        <div className="h-5 w-5 rounded-full border border-white/10 flex items-center justify-center mb-2">
          <div className="h-1.5 w-1 rounded-sm bg-white/25" />
        </div>
      </div>

      {/* Date */}
      <div className="relative text-center z-10 mb-0.5">
        <p className="text-white/35 text-[10px] font-medium capitalize tracking-wide">{dateStr}</p>
      </div>

      {/* Clock — large SF-style */}
      <div className="relative text-center z-10 mb-6">
        <p
          className="text-white/90 text-[58px] font-extralight leading-none tracking-tight"
          style={{ fontFamily: "'SF Pro Display', -apple-system, system-ui, sans-serif" }}
        >
          {hours}:{minutes}
        </p>
      </div>

      {/* Notifications — drop one by one */}
      <div className="relative z-10 flex-1 px-3 space-y-2 overflow-hidden">
        <AnimatePresence>
          {notifications.map((idx, pos) => {
            const n = lockNotifs[idx];
            const Icon = n.icon;
            return (
              <motion.div
                key={`${cycle}-${pos}`}
                initial={{ opacity: 0, y: -50, scale: 0.85, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.92, y: 10, filter: "blur(3px)" }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 24,
                  mass: 0.8,
                }}
                className="rounded-[16px] bg-white/[0.08] backdrop-blur-2xl border border-white/[0.05] px-3.5 py-3 flex items-start gap-3 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
              >
                <div className="h-9 w-9 rounded-[10px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-[0_2px_16px_-2px_hsl(var(--primary)/0.35)]">
                  <Icon className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-wider">CutFlow</p>
                    <p className="text-[8px] text-white/25">{n.time}</p>
                  </div>
                  <p className="text-[11px] font-semibold text-white/85 leading-snug mt-0.5">{n.title}</p>
                  <p className="text-[9.5px] text-white/35 leading-snug">{n.body}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom bar — home indicator */}
      <div className="relative z-10 px-4 pb-2 pt-3">
        <div className="flex items-center justify-between">
          <div className="h-8 w-8 rounded-full bg-white/[0.06] backdrop-blur-xl flex items-center justify-center">
            <div className="h-4 w-4 rounded-[3px] border border-white/20" />
          </div>
          <div className="h-8 w-8 rounded-full bg-white/[0.06] backdrop-blur-xl flex items-center justify-center">
            <div className="h-3.5 w-3.5 rounded-full border-2 border-white/20" />
          </div>
        </div>
        <div className="mx-auto mt-2 w-[100px] h-[4px] rounded-full bg-white/20" />
      </div>
    </div>
  );
}
