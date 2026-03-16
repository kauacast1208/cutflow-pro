import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import {
  CalendarPlus, CheckCircle2, Clock, MessageSquare,
  Scissors, TrendingUp, Users, ChevronRight,
  Calendar, DollarSign, Bell, ArrowUpRight,
} from "lucide-react";

/* ─── Notification data ─── */
const reminders = [
  { icon: CalendarPlus, name: "João Silva", action: "Corte + Barba", time: "14:00", status: "confirmed" as const },
  { icon: CheckCircle2, name: "Pedro Santos", action: "Barba", time: "15:30", status: "pending" as const },
  { icon: MessageSquare, name: "Lucas Oliveira", action: "Corte Degradê", time: "16:00", status: "reminder" as const },
];

/* ─── Weekly chart data ─── */
const chartData = [
  { label: "Seg", value: 12 },
  { label: "Ter", value: 15 },
  { label: "Qua", value: 18 },
  { label: "Qui", value: 14 },
  { label: "Sex", value: 22 },
  { label: "Sáb", value: 31 },
  { label: "Dom", value: 8 },
];

function WeeklyChart() {
  const max = Math.max(...chartData.map((d) => d.value));
  const w = 200;
  const h = 56;
  const px = 8;
  const py = 6;
  const stepX = (w - px * 2) / (chartData.length - 1);

  const points = chartData.map((d, i) => ({
    x: px + i * stepX,
    y: h - py - ((d.value / max) * (h - py * 2 - 6)) - 3,
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
  const highlightPt = points[5]; // Saturday highlight

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(152,58%,50%)" stopOpacity={0.25} />
          <stop offset="100%" stopColor="hsl(152,58%,40%)" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(152,50%,38%)" />
          <stop offset="100%" stopColor="hsl(152,65%,55%)" />
        </linearGradient>
      </defs>
      <path d={fillD} fill="url(#areaFill)" />
      <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="1.8" strokeLinecap="round" />
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((r) => (
        <line key={r} x1={px} x2={w - px} y1={h - py - r * (h - py * 2 - 6) - 3} y2={h - py - r * (h - py * 2 - 6) - 3} stroke="white" strokeOpacity={0.04} strokeWidth="0.5" />
      ))}
      {/* Saturday highlight dot */}
      <circle cx={highlightPt.x} cy={highlightPt.y} r="3" fill="hsl(152,60%,50%)" opacity={0.9}>
        <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={highlightPt.x} cy={highlightPt.y} r="6" fill="hsl(152,60%,50%)" opacity={0.15}>
        <animate attributeName="r" values="6;9;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x={highlightPt.x} y={highlightPt.y - 7} textAnchor="middle" fill="hsl(152,58%,65%)" fontSize="5.5" fontWeight="700" fontFamily="system-ui">
        31
      </text>
    </svg>
  );
}

const statusColors = {
  confirmed: "bg-emerald-500/20 text-emerald-400",
  pending: "bg-amber-500/20 text-amber-400",
  reminder: "bg-blue-500/20 text-blue-400",
};
const statusLabels = {
  confirmed: "Confirmado",
  pending: "Pendente",
  reminder: "Lembrete",
};

export function IPhoneLockScreen() {
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    const timers = reminders.map((_, i) =>
      setTimeout(() => setVisibleItems(i + 1), 600 + i * 700)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="h-full flex flex-col relative overflow-hidden select-none bg-[hsl(220,20%,7%)]">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 text-white/40 text-[8px] font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-3.5 h-1.5 rounded-sm border border-white/30 relative">
            <div className="absolute inset-[1px] right-[2px] bg-emerald-400 rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* App header */}
      <div className="px-4 pt-1.5 pb-2.5 flex items-center justify-between">
        <div>
          <p className="text-[7px] text-white/30 uppercase tracking-[0.1em] font-semibold">CutFlow</p>
          <p className="text-[13px] font-bold text-white/90 leading-tight mt-0.5">Bom dia, Rafael 👋</p>
        </div>
        <div className="relative">
          <div className="h-6 w-6 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
            <Bell className="h-3 w-3 text-white/40" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-[hsl(220,20%,7%)]" />
        </div>
      </div>

      {/* KPI Row */}
      <div className="px-3 grid grid-cols-3 gap-1.5 mb-2.5">
        {[
          { label: "Receita", value: "R$1.240", icon: DollarSign, change: "+12%", color: "emerald" },
          { label: "Agendamentos", value: "18", icon: Calendar, change: "+3", color: "blue" },
          { label: "Clientes", value: "248", icon: Users, change: "+5", color: "violet" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-8 h-8 rounded-bl-2xl bg-${kpi.color}-500/[0.06]`} />
            <div className="flex items-center gap-1 mb-1.5">
              <kpi.icon className={`h-2.5 w-2.5 text-${kpi.color}-400/60`} />
              <p className="text-[6.5px] text-white/25 uppercase tracking-wider font-semibold">{kpi.label}</p>
            </div>
            <p className="text-[15px] font-extrabold text-white/90 leading-none tracking-tight">{kpi.value}</p>
            <div className="flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="h-2 w-2 text-emerald-400/70" />
              <p className="text-[6px] text-emerald-400/70 font-bold">{kpi.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Chart Card */}
      <div className="px-3 mb-2.5">
        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-emerald-400/60" />
              <span className="text-[8px] font-bold text-white/35 uppercase tracking-wider">Atendimentos</span>
            </div>
            <div className="flex items-center gap-1 bg-white/[0.04] rounded-md px-1.5 py-0.5">
              <span className="text-[6.5px] text-emerald-400/80 font-bold">+18% vs semana anterior</span>
            </div>
          </div>
          <div className="h-14">
            <WeeklyChart />
          </div>
          <div className="flex justify-between mt-1 px-1">
            {chartData.map((d, i) => (
              <span key={d.label} className={`text-[6px] font-semibold ${i === 5 ? 'text-emerald-400/60' : 'text-white/15'}`}>
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Agenda Section */}
      <div className="px-3 flex-1 min-h-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-white/25" />
            <span className="text-[8px] font-bold text-white/30 uppercase tracking-wider">Próximos horários</span>
          </div>
          <div className="flex items-center gap-0.5 text-white/20">
            <span className="text-[7px] font-medium">Ver todos</span>
            <ChevronRight className="h-2.5 w-2.5" />
          </div>
        </div>

        <div className="space-y-1.5">
          <AnimatePresence>
            {reminders.slice(0, visibleItems).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-2.5 flex items-center gap-2.5"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/10 flex items-center justify-center shrink-0">
                  <Scissors className="h-3.5 w-3.5 text-emerald-400/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-white/80 truncate">{item.name}</p>
                    <span className={`text-[6px] font-bold px-1.5 py-0.5 rounded-full ${statusColors[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[7.5px] text-white/30">{item.action}</p>
                    <span className="text-[7px] text-white/15">•</span>
                    <p className="text-[7.5px] text-white/40 font-semibold">{item.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav bar */}
      <div className="px-3 pt-2 pb-1.5 mt-auto">
        <div className="flex items-center justify-around rounded-2xl bg-white/[0.04] border border-white/[0.06] py-2 px-2">
          {[
            { icon: TrendingUp, label: "Home", active: true },
            { icon: Calendar, label: "Agenda", active: false },
            { icon: Users, label: "Clientes", active: false },
            { icon: Scissors, label: "Serviços", active: false },
          ].map((tab) => (
            <div key={tab.label} className="flex flex-col items-center gap-0.5">
              <tab.icon className={`h-3.5 w-3.5 ${tab.active ? 'text-emerald-400' : 'text-white/20'}`} />
              <span className={`text-[5.5px] font-semibold ${tab.active ? 'text-emerald-400' : 'text-white/20'}`}>{tab.label}</span>
            </div>
          ))}
        </div>
        {/* Home indicator */}
        <div className="mx-auto w-[60px] h-[3px] rounded-full bg-white/10 mt-1.5" />
      </div>
    </div>
  );
}
