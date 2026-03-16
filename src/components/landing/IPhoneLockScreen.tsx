import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import {
  CalendarPlus, CheckCircle2, Clock, MessageSquare, UserCheck,
  Scissors, Wifi, Signal, BatteryFull, TrendingUp, Users,
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

/* ─── Weekly chart data ─── */
const chartData = [
  { label: "Seg", value: 12 },
  { label: "Ter", value: 15 },
  { label: "Qua", value: 18 },
  { label: "Qui", value: 14 },
  { label: "Sex", value: 22 },
  { label: "Sáb", value: 31 },
];

function MiniChart() {
  const max = Math.max(...chartData.map((d) => d.value));
  const w = 100;
  const h = 40;
  const padding = 4;
  const stepX = (w - padding * 2) / (chartData.length - 1);

  const points = chartData.map((d, i) => ({
    x: padding + i * stepX,
    y: h - padding - ((d.value / max) * (h - padding * 2 - 4)) - 2,
  }));

  // Smooth curve using catmull-rom to bezier
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const fillD = pathD + ` L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;
  const lastPt = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="miniChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(152,58%,50%)" stopOpacity={0.3} />
          <stop offset="50%" stopColor="hsl(152,58%,45%)" stopOpacity={0.1} />
          <stop offset="100%" stopColor="hsl(152,58%,40%)" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(152,58%,40%)" />
          <stop offset="60%" stopColor="hsl(152,58%,55%)" />
          <stop offset="100%" stopColor="hsl(152,68%,60%)" />
        </linearGradient>
        <filter id="chartGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dotGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Area fill */}
      <path d={fillD} fill="url(#miniChartGrad)">
        <animate attributeName="opacity" from="0" to="1" dur="0.8s" fill="freeze" />
      </path>
      {/* Line */}
      <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" strokeLinecap="round" filter="url(#chartGlow)">
        <animate attributeName="stroke-dashoffset" from="200" to="0" dur="1s" fill="freeze" />
        <animate attributeName="stroke-dasharray" from="200" to="200" dur="0.01s" fill="freeze" />
      </path>
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="hsl(152,58%,55%)" stroke="hsl(152,58%,35%)" strokeWidth="0.4" opacity={0.7} />
      ))}
      {/* Glowing pulse dot on last (current) day */}
      <circle cx={lastPt.x} cy={lastPt.y} r="3" fill="hsl(152,68%,55%)" opacity={0.2} filter="url(#dotGlow)">
        <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.35;0.2" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={lastPt.x} cy={lastPt.y} r="2" fill="hsl(152,65%,58%)" stroke="hsl(152,58%,40%)" strokeWidth="0.5" />
      {/* Value label on last point */}
      <text x={lastPt.x} y={lastPt.y - 4} textAnchor="middle" fill="hsl(152,58%,65%)" fontSize="4" fontWeight="700" fontFamily="system-ui">
        {chartData[chartData.length - 1].value}
      </text>
    </svg>
  );
}

export function IPhoneLockScreen() {
  const [notifications, setNotifications] = useState<number[]>([]);
  const [cycle, setCycle] = useState(0);

  const addNotification = useCallback(() => {
    setNotifications((prev) => {
      if (prev.length >= 3) {
        setCycle((c) => c + 1);
        return [];
      }
      const nextIdx = (cycle * 3 + prev.length) % lockNotifs.length;
      return [...prev, nextIdx];
    });
  }, [cycle]);

  useEffect(() => {
    const interval = setInterval(addNotification, 3200);
    const timeout = setTimeout(addNotification, 800);
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
      {/* Cinematic wallpaper — deep purple / blue / emerald */}
      <div className="absolute inset-0 bg-[hsl(260,30%,2%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_15%_85%,hsl(270,60%,22%,0.55),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_85%_15%,hsl(152,55%,22%,0.3),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,hsl(230,50%,18%,0.25),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,hsl(280,45%,16%,0.2),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      {/* Soft edge light reflection */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/[0.02] to-transparent" />

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
      <div className="relative flex flex-col items-center pt-3 z-10">
        <div className="h-5 w-5 rounded-full border border-white/10 flex items-center justify-center mb-1.5">
          <div className="h-1.5 w-1 rounded-sm bg-white/25" />
        </div>
      </div>

      {/* Date */}
      <div className="relative text-center z-10 mb-0.5">
        <p className="text-white/35 text-[10px] font-medium capitalize tracking-wide">{dateStr}</p>
      </div>

      {/* Clock */}
      <div className="relative text-center z-10 mb-4">
        <p
          className="text-white/90 text-[52px] font-extralight leading-none tracking-tight"
          style={{ fontFamily: "'SF Pro Display', -apple-system, system-ui, sans-serif" }}
        >
          {hours}:{minutes}
        </p>
      </div>

      {/* Mini dashboard card */}
      <div className="relative z-10 px-3 mb-2.5">
        <div className="rounded-[14px] bg-white/[0.07] backdrop-blur-2xl border border-white/[0.06] p-3 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="h-4 w-4 rounded-[5px] bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
              <TrendingUp className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-[8px] font-bold text-white/50 uppercase tracking-wider">Resumo de hoje</span>
          </div>

          <div className="flex gap-3 mb-3">
            {/* Revenue */}
            <div className="flex-1 rounded-[10px] bg-white/[0.05] border border-white/[0.04] px-2.5 py-2">
              <p className="text-[7px] text-white/30 uppercase tracking-wider font-medium mb-0.5">Receita</p>
              <p className="text-[16px] font-bold text-white/90 leading-none tracking-tight">R$820</p>
            </div>
            {/* Appointments */}
            <div className="flex-1 rounded-[10px] bg-white/[0.05] border border-white/[0.04] px-2.5 py-2">
              <div className="flex items-center gap-1 mb-0.5">
                <Users className="h-2 w-2 text-white/30" />
                <p className="text-[7px] text-white/30 uppercase tracking-wider font-medium">Atendimentos</p>
              </div>
              <p className="text-[16px] font-bold text-white/90 leading-none tracking-tight">14</p>
            </div>
          </div>

          {/* Mini chart */}
          <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.03] p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[7px] text-white/25 uppercase tracking-wider font-medium">Semana</span>
              <span className="text-[7px] text-primary/60 font-medium">+18%</span>
            </div>
            <div className="h-8">
              <MiniChart />
            </div>
            <div className="flex justify-between mt-1">
              {chartData.map((d) => (
                <span key={d.label} className="text-[6px] text-white/20 font-medium">{d.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="relative z-10 flex-1 px-3 space-y-2 overflow-hidden">
        <AnimatePresence>
          {notifications.map((idx, pos) => {
            const n = lockNotifs[idx];
            const Icon = n.icon;
            return (
              <motion.div
                key={`${cycle}-${pos}`}
                initial={{ opacity: 0, y: -40, scale: 0.88, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.92, y: 8, filter: "blur(3px)" }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 26,
                  mass: 0.7,
                }}
                className="rounded-[14px] bg-white/[0.08] backdrop-blur-2xl border border-white/[0.05] px-3 py-2.5 flex items-start gap-2.5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
              >
                <div className="h-8 w-8 rounded-[9px] bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-[0_2px_12px_-2px_hsl(152,58%,40%,0.3)]">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[8px] font-bold text-white/60 uppercase tracking-wider">CutFlow</p>
                    <p className="text-[7px] text-white/20">{n.time}</p>
                  </div>
                  <p className="text-[10px] font-semibold text-white/85 leading-snug mt-0.5">{n.title}</p>
                  <p className="text-[9px] text-white/30 leading-snug">{n.body}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 px-4 pb-2 pt-2">
        <div className="flex items-center justify-between">
          <div className="h-7 w-7 rounded-full bg-white/[0.06] backdrop-blur-xl flex items-center justify-center">
            <div className="h-3.5 w-3.5 rounded-[3px] border border-white/15" />
          </div>
          <div className="h-7 w-7 rounded-full bg-white/[0.06] backdrop-blur-xl flex items-center justify-center">
            <div className="h-3 w-3 rounded-full border-2 border-white/15" />
          </div>
        </div>
        <div className="mx-auto mt-1.5 w-[90px] h-[4px] rounded-full bg-white/15" />
      </div>
    </div>
  );
}
