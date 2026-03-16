import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import {
  CalendarPlus, CheckCircle2, Clock, MessageSquare, UserCheck,
  Scissors, Wifi, Signal, BatteryFull, TrendingUp, Users,
  Calendar, DollarSign,
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
  const h = 36;
  const padding = 4;
  const stepX = (w - padding * 2) / (chartData.length - 1);

  const points = chartData.map((d, i) => ({
    x: padding + i * stepX,
    y: h - padding - ((d.value / max) * (h - padding * 2 - 4)) - 2,
  }));

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
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(152,58%,50%)" stopOpacity={0.35} />
          <stop offset="100%" stopColor="hsl(152,58%,40%)" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(152,55%,42%)" />
          <stop offset="100%" stopColor="hsl(152,68%,58%)" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#chartFill)" />
      <path d={pathD} fill="none" stroke="url(#chartLine)" strokeWidth="1.5" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1" fill="hsl(152,58%,55%)" opacity={0.5} />
      ))}
      <circle cx={lastPt.x} cy={lastPt.y} r="2" fill="hsl(152,65%,58%)" stroke="hsl(152,58%,35%)" strokeWidth="0.5">
        <animate attributeName="r" values="2;3;2" dur="2.5s" repeatCount="indefinite" />
      </circle>
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
      {/* Deep cinematic wallpaper */}
      <div className="absolute inset-0 bg-[hsl(240,25%,3%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_20%_90%,hsl(260,50%,18%,0.6),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_80%_10%,hsl(152,50%,18%,0.35),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,hsl(220,45%,14%,0.3),transparent)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      {/* Top edge light */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/[0.015] to-transparent" />

      {/* Status bar */}
      <div className="relative flex items-center justify-between px-7 pt-3.5 pb-1 text-white/45 text-[9px] font-medium z-10">
        <span>{hours}:{minutes}</span>
        <div className="flex items-center gap-1">
          <Signal className="h-2.5 w-2.5" />
          <Wifi className="h-2.5 w-2.5" />
          <BatteryFull className="h-3 w-3" />
        </div>
      </div>

      {/* Lock icon */}
      <div className="relative flex flex-col items-center pt-2 z-10">
        <div className="h-5 w-5 rounded-full border border-white/10 flex items-center justify-center mb-1">
          <div className="h-1.5 w-1 rounded-sm bg-white/20" />
        </div>
      </div>

      {/* Date */}
      <div className="relative text-center z-10 mb-0.5">
        <p className="text-white/30 text-[10px] font-medium capitalize tracking-wide">{dateStr}</p>
      </div>

      {/* Clock */}
      <div className="relative text-center z-10 mb-3">
        <p
          className="text-white/85 text-[48px] font-extralight leading-none tracking-tight"
          style={{ fontFamily: "'SF Pro Display', -apple-system, system-ui, sans-serif" }}
        >
          {hours}:{minutes}
        </p>
      </div>

      {/* Mini dashboard widget */}
      <div className="relative z-10 px-3 mb-2">
        <div className="rounded-[14px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.05] p-3 shadow-[0_8px_40px_-6px_rgba(0,0,0,0.6)]">
          {/* Widget header */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-4 w-4 rounded-[5px] bg-gradient-to-br from-emerald-400/80 to-emerald-600/60 flex items-center justify-center shadow-[0_2px_8px_-2px_hsl(152,60%,40%,0.4)]">
              <TrendingUp className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider">Resumo do dia</span>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-1.5 mb-2.5">
            <div className="rounded-[10px] bg-white/[0.05] border border-white/[0.04] px-2 py-1.5">
              <div className="flex items-center gap-0.5 mb-0.5">
                <DollarSign className="h-2 w-2 text-emerald-400/50" />
                <p className="text-[6px] text-white/25 uppercase tracking-wider font-medium">Receita</p>
              </div>
              <p className="text-[14px] font-bold text-white/85 leading-none tracking-tight">R$820</p>
            </div>
            <div className="rounded-[10px] bg-white/[0.05] border border-white/[0.04] px-2 py-1.5">
              <div className="flex items-center gap-0.5 mb-0.5">
                <Calendar className="h-2 w-2 text-blue-400/50" />
                <p className="text-[6px] text-white/25 uppercase tracking-wider font-medium">Agenda</p>
              </div>
              <p className="text-[14px] font-bold text-white/85 leading-none tracking-tight">14</p>
            </div>
            <div className="rounded-[10px] bg-white/[0.05] border border-white/[0.04] px-2 py-1.5">
              <div className="flex items-center gap-0.5 mb-0.5">
                <Users className="h-2 w-2 text-violet-400/50" />
                <p className="text-[6px] text-white/25 uppercase tracking-wider font-medium">Clientes</p>
              </div>
              <p className="text-[14px] font-bold text-white/85 leading-none tracking-tight">248</p>
            </div>
          </div>

          {/* Weekly chart */}
          <div className="rounded-[8px] bg-white/[0.03] border border-white/[0.03] p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[7px] text-white/20 uppercase tracking-wider font-medium">Atendimentos da semana</span>
              <span className="text-[7px] text-emerald-400/60 font-semibold">+18%</span>
            </div>
            <div className="h-9">
              <MiniChart />
            </div>
            <div className="flex justify-between mt-0.5 px-0.5">
              {chartData.map((d) => (
                <span key={d.label} className="text-[5.5px] text-white/15 font-medium">{d.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="relative z-10 flex-1 px-3 space-y-1.5 overflow-hidden">
        <AnimatePresence>
          {notifications.map((idx, pos) => {
            const n = lockNotifs[idx];
            const Icon = n.icon;
            return (
              <motion.div
                key={`${cycle}-${pos}`}
                initial={{ opacity: 0, y: -36, scale: 0.9, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.94, y: 6, filter: "blur(3px)" }}
                transition={{ type: "spring", stiffness: 240, damping: 28, mass: 0.65 }}
                className="rounded-[14px] bg-white/[0.07] backdrop-blur-2xl border border-white/[0.04] px-3 py-2 flex items-start gap-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]"
              >
                <div className="h-7 w-7 rounded-[8px] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-[0_2px_10px_-2px_hsl(152,58%,40%,0.35)]">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[7px] font-bold text-white/50 uppercase tracking-wider">CutFlow</p>
                    <p className="text-[6.5px] text-white/15">{n.time}</p>
                  </div>
                  <p className="text-[9.5px] font-semibold text-white/80 leading-snug mt-0.5">{n.title}</p>
                  <p className="text-[8px] text-white/25 leading-snug">{n.body}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Home indicator */}
      <div className="relative z-10 pb-2 pt-1.5">
        <div className="mx-auto w-[80px] h-[4px] rounded-full bg-white/12" />
      </div>
    </div>
  );
}
