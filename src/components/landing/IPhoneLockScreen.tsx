import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CheckCircle2, Clock, Scissors, TrendingUp, Users, ChevronRight,
  Calendar, DollarSign, Bell, ArrowUpRight, Star, Wifi, Signal,
} from "lucide-react";

/* ─── Data ─── */
const chartData = [
  { label: "Seg", value: 12 },
  { label: "Ter", value: 18 },
  { label: "Qua", value: 15 },
  { label: "Qui", value: 21 },
  { label: "Sex", value: 26 },
  { label: "Sáb", value: 34 },
  { label: "Dom", value: 6 },
];

const agenda = [
  { name: "João Silva", service: "Corte + Barba", time: "14:00", duration: "45min", status: "confirmed" as const, avatar: "JS" },
  { name: "Pedro Santos", service: "Degradê", time: "15:00", duration: "30min", status: "pending" as const, avatar: "PS" },
  { name: "Lucas Oliveira", service: "Barba + Sobrancelha", time: "16:30", duration: "40min", status: "confirmed" as const, avatar: "LO" },
];

const statusConfig = {
  confirmed: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400", label: "Confirmado" },
  pending: { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-400", label: "Pendente" },
};

/* ─── Smooth weekly chart ─── */
function WeeklyChart() {
  const max = Math.max(...chartData.map((d) => d.value));
  const W = 220;
  const H = 64;
  const padX = 6;
  const padTop = 10;
  const padBot = 4;
  const drawH = H - padTop - padBot;
  const stepX = (W - padX * 2) / (chartData.length - 1);

  const pts = chartData.map((d, i) => ({
    x: padX + i * stepX,
    y: padTop + drawH - (d.value / max) * drawH,
  }));

  // Catmull-Rom to cubic bezier
  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  const area = line + ` L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;
  const peakIdx = 5; // Saturday
  const peak = pts[peakIdx];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(152,58%,48%)" stopOpacity={0.2} />
          <stop offset="80%" stopColor="hsl(152,58%,48%)" stopOpacity={0.02} />
          <stop offset="100%" stopColor="hsl(152,58%,48%)" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(152,45%,40%)" />
          <stop offset="60%" stopColor="hsl(152,60%,50%)" />
          <stop offset="100%" stopColor="hsl(152,65%,55%)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Horizontal guides */}
      {[0.33, 0.66].map((r) => (
        <line key={r} x1={padX} x2={W - padX} y1={padTop + drawH * (1 - r)} y2={padTop + drawH * (1 - r)} stroke="white" strokeOpacity={0.03} strokeWidth="0.5" strokeDasharray="2 3" />
      ))}

      <path d={area} fill="url(#chartArea)" />
      <path d={line} fill="none" stroke="url(#chartLine)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Peak highlight */}
      <circle cx={peak.x} cy={peak.y} r="8" fill="hsl(152,60%,50%)" opacity={0.08} filter="url(#glow)">
        <animate attributeName="r" values="8;12;8" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.08;0.03;0.08" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={peak.x} cy={peak.y} r="3" fill="hsl(220,20%,7%)" stroke="hsl(152,60%,50%)" strokeWidth="1.5" />
      <text x={peak.x} y={peak.y - 8} textAnchor="middle" fill="hsl(152,58%,60%)" fontSize="6" fontWeight="700" fontFamily="system-ui">
        34
      </text>
    </svg>
  );
}

export function IPhoneLockScreen() {
  const [visibleItems, setVisibleItems] = useState(0);

  useEffect(() => {
    const timers = agenda.map((_, i) =>
      setTimeout(() => setVisibleItems(i + 1), 800 + i * 600)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return (
    <div className="h-full flex flex-col relative overflow-hidden select-none" style={{ background: "linear-gradient(180deg, hsl(220,20%,8%) 0%, hsl(220,18%,6%) 100%)" }}>

      {/* ── iOS Status Bar ── */}
      <div className="flex items-center justify-between px-5 pt-2.5 pb-1 shrink-0">
        <span className="text-[9px] font-semibold text-white/50 tabular-nums">{hours}:{minutes}</span>
        <div className="flex items-center gap-1.5">
          <Signal className="h-2.5 w-2.5 text-white/30" />
          <Wifi className="h-2.5 w-2.5 text-white/30" />
          <div className="w-4 h-2 rounded-sm border border-white/25 relative">
            <div className="absolute inset-[1px] right-[2px] rounded-[1px] bg-emerald-400" />
          </div>
        </div>
      </div>

      {/* ── App Header ── */}
      <div className="px-4 pt-1 pb-2 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[6.5px] text-white/20 uppercase tracking-[0.12em] font-bold leading-none">CutFlow</p>
          <p className="text-[12px] font-bold text-white/90 leading-tight mt-1">Bom dia, Rafael</p>
          <p className="text-[7px] text-white/25 mt-0.5">Terça-feira, 16 março</p>
        </div>
        <div className="relative">
          <div className="h-7 w-7 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
            <Bell className="h-3 w-3 text-white/35" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[hsl(220,20%,7%)] flex items-center justify-center">
            <span className="text-[4px] font-bold text-white">3</span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats Row ── */}
      <div className="px-3 grid grid-cols-3 gap-1.5 mb-2 shrink-0">
        {[
          { label: "Receita", value: "R$2.840", change: "+12%", icon: DollarSign, accent: "emerald" },
          { label: "Agenda", value: "18", change: "+3 hoje", icon: Calendar, accent: "sky" },
          { label: "Clientes", value: "248", change: "+5 novos", icon: Users, accent: "violet" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-2 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-1 mb-1">
              <kpi.icon className={`h-2.5 w-2.5 ${kpi.accent === "emerald" ? "text-emerald-400/50" : kpi.accent === "sky" ? "text-sky-400/50" : "text-violet-400/50"}`} />
              <p className="text-[6px] text-white/20 uppercase tracking-wider font-bold">{kpi.label}</p>
            </div>
            <p className="text-[14px] font-extrabold text-white/90 leading-none tracking-tight">{kpi.value}</p>
            <div className="flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="h-2 w-2 text-emerald-400/60" />
              <p className="text-[5.5px] text-emerald-400/60 font-bold">{kpi.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Weekly Chart ── */}
      <div className="px-3 mb-2 shrink-0">
        <div className="rounded-xl p-2.5 relative" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-2.5 w-2.5 text-emerald-400/50" />
              <span className="text-[7px] font-bold text-white/25 uppercase tracking-wider">Atendimentos da semana</span>
            </div>
            <span className="text-[6px] text-emerald-400/60 font-bold bg-emerald-400/[0.08] rounded px-1.5 py-0.5">+18%</span>
          </div>
          <div className="h-16">
            <WeeklyChart />
          </div>
          <div className="flex justify-between px-[6px] mt-0.5">
            {chartData.map((d, i) => (
              <span key={d.label} className={`text-[5.5px] font-semibold ${i === 5 ? "text-emerald-400/50" : "text-white/12"}`}>
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Agenda Section ── */}
      <div className="px-3 flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="h-2.5 w-2.5 text-white/20" />
            <span className="text-[7px] font-bold text-white/25 uppercase tracking-wider">Agenda de hoje</span>
          </div>
          <div className="flex items-center gap-0.5 text-white/15 cursor-pointer">
            <span className="text-[6.5px] font-medium">Ver tudo</span>
            <ChevronRight className="h-2.5 w-2.5" />
          </div>
        </div>

        <div className="space-y-1.5 flex-1 min-h-0 overflow-hidden">
          <AnimatePresence>
            {agenda.slice(0, visibleItems).map((item, i) => {
              const sc = statusConfig[item.status];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 28, delay: i * 0.05 }}
                  className="rounded-xl p-2 flex items-center gap-2"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)" }}>
                    <span className="text-[8px] font-bold text-emerald-400/80">{item.avatar}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[9px] font-bold text-white/85 truncate">{item.name}</p>
                      <span className={`text-[5.5px] font-bold px-1.5 py-[2px] rounded-full shrink-0 ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <Scissors className="h-2 w-2 text-white/15" />
                        <span className="text-[7px] text-white/30">{item.service}</span>
                      </div>
                      <span className="text-white/08">•</span>
                      <span className="text-[7px] text-white/40 font-semibold">{item.time}</span>
                      <span className="text-white/08">•</span>
                      <span className="text-[6.5px] text-white/20">{item.duration}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Review highlight ── */}
      <div className="px-3 mt-1.5 mb-1 shrink-0">
        <div className="rounded-lg px-2.5 py-1.5 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-2 w-2 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-[6.5px] text-white/30 flex-1 truncate">
            <span className="text-white/50 font-semibold">Marcos A.</span> — "Melhor barbearia da região!"
          </p>
        </div>
      </div>

      {/* ── Bottom Tab Bar ── */}
      <div className="px-3 pt-1 pb-1 mt-auto shrink-0">
        <div className="flex items-center justify-around rounded-2xl py-1.5 px-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          {[
            { icon: TrendingUp, label: "Home", active: true },
            { icon: Calendar, label: "Agenda", active: false },
            { icon: Users, label: "Clientes", active: false },
            { icon: Scissors, label: "Serviços", active: false },
          ].map((tab) => (
            <div key={tab.label} className="flex flex-col items-center gap-[2px] min-w-0">
              <div className={`relative ${tab.active ? "" : ""}`}>
                <tab.icon className={`h-3 w-3 ${tab.active ? "text-emerald-400" : "text-white/15"}`} />
                {tab.active && (
                  <div className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-[2px] rounded-full bg-emerald-400" />
                )}
              </div>
              <span className={`text-[5px] font-semibold ${tab.active ? "text-emerald-400" : "text-white/15"}`}>{tab.label}</span>
            </div>
          ))}
        </div>
        {/* Home indicator */}
        <div className="mx-auto w-[52px] h-[3px] rounded-full bg-white/8 mt-1.5" />
      </div>
    </div>
  );
}
