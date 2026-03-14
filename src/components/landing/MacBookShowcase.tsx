import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  BarChart3,
  CalendarPlus,
  CalendarCheck,
  CheckCircle2,
  MessageSquare,
  Bell,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";

/* ─── Tab definitions ─── */
const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "clients", label: "Clientes", icon: Users },
] as const;

type TabId = (typeof tabs)[number]["id"];

/* ─── Notification feed ─── */
const notifications = [
  { icon: CalendarPlus, message: "Novo agendamento criado", detail: "Carlos Silva · 14:30", color: "hsl(152 55% 42%)" },
  { icon: CheckCircle2, message: "Cliente confirmou horário", detail: "Rafael Santos · 10:00", color: "hsl(152 58% 48%)" },
  { icon: Clock, message: "Horário liberado às 19:00", detail: "Barbearia Prime", color: "hsl(210 80% 58%)" },
  { icon: MessageSquare, message: "Lembrete enviado no WhatsApp", detail: "André Oliveira", color: "hsl(168 55% 42%)" },
  { icon: CalendarCheck, message: "Novo horário disponível", detail: "Amanhã · 09:00", color: "hsl(38 80% 52%)" },
];

/* ─── Notification toast ─── */
function FloatingNotification({ side }: { side: "left" | "right" }) {
  const pool = side === "left" ? notifications.slice(0, 3) : notifications.slice(2);
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIdx((p) => (p + 1) % pool.length);
        setShow(true);
      }, 300);
    }, side === "left" ? 3800 : 4200);
    return () => clearInterval(t);
  }, [pool.length, side]);

  const n = pool[idx];
  const Icon = n.icon;
  const posClass = side === "left"
    ? "left-0 -translate-x-1/2 top-[38%]"
    : "right-0 translate-x-1/2 top-[55%]";

  return (
    <div className={`absolute ${posClass} z-30 hidden lg:block`}>
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={`${side}-${idx}`}
            initial={{ opacity: 0, x: side === "left" ? -20 : 20, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: side === "left" ? -10 : 10, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="w-[240px] rounded-xl border border-white/[0.08] bg-[hsl(220_16%_10%/0.92)] backdrop-blur-xl shadow-2xl px-3.5 py-3 flex items-start gap-2.5"
          >
            <div className="mt-0.5 shrink-0" style={{ color: n.color }}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white/90 leading-snug truncate">
                {n.message}
              </p>
              <p className="text-[10px] text-white/40 mt-0.5 truncate">{n.detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Tab content ─── */
function DashboardTab() {
  const stats = [
    { icon: Calendar, label: "Agendamentos", value: "12", sub: "hoje", accent: "hsl(152 55% 42%)" },
    { icon: Users, label: "Clientes ativos", value: "248", sub: "+18 este mês", accent: "hsl(210 80% 58%)" },
    { icon: TrendingUp, label: "Faturamento", value: "R$ 18.5k", sub: "+23%", accent: "hsl(152 58% 48%)" },
    { icon: Star, label: "Avaliação", value: "4.9", sub: "142 reviews", accent: "hsl(38 80% 52%)" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3"
          >
            <s.icon className="h-3.5 w-3.5 mb-2 opacity-70" style={{ color: s.accent }} />
            <p className="text-lg sm:text-xl font-bold text-white/90 leading-none">{s.value}</p>
            <p className="text-[10px] text-white/35 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        {[
          { time: "09:00", name: "Carlos Silva", service: "Corte + Barba", status: "confirmed" },
          { time: "10:00", name: "Rafael Santos", service: "Corte Masculino", status: "confirmed" },
          { time: "11:00", name: "André Oliveira", service: "Barba", status: "pending" },
          { time: "14:30", name: "Lucas Mendes", service: "Corte Degradê", status: "confirmed" },
        ].map((a, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-[12px]"
          >
            <span className="text-white/30 font-mono w-10 shrink-0">{a.time}</span>
            <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${a.status === "confirmed" ? "bg-[hsl(152_55%_42%)]" : "bg-[hsl(38_80%_52%)]"}`} />
            <span className="text-white/70 truncate">{a.name}</span>
            <span className="text-white/25 hidden sm:inline">·</span>
            <span className="text-white/25 truncate hidden sm:inline">{a.service}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgendaTab() {
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
  const booked = [
    { start: 1, span: 1, name: "Carlos S.", color: "hsl(152 55% 42%)" },
    { start: 2, span: 2, name: "Rafael S.", color: "hsl(210 80% 58%)" },
    { start: 5, span: 1, name: "André O.", color: "hsl(260 40% 55%)" },
    { start: 6, span: 2, name: "Lucas M.", color: "hsl(38 80% 52%)" },
  ];

  return (
    <div className="grid grid-cols-[48px_1fr] gap-0">
      {hours.map((h, i) => {
        const event = booked.find((b) => b.start === i);
        return (
          <div key={h} className="contents">
            <div className="text-[10px] text-white/25 font-mono pr-2 pt-1 text-right border-r border-white/[0.06] h-8">
              {h}
            </div>
            <div className="relative h-8 border-b border-white/[0.04] ml-2">
              {event && (
                <div
                  className="absolute inset-y-0.5 left-0 right-2 rounded-md px-2 flex items-center text-[10px] font-medium text-white/80"
                  style={{
                    backgroundColor: event.color,
                    opacity: 0.7,
                    height: `${event.span * 32 - 4}px`,
                  }}
                >
                  {event.name}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ClientsTab() {
  const clients = [
    { name: "Carlos Silva", visits: 24, lastVisit: "Hoje", spending: "R$ 2.400", avatar: "CS" },
    { name: "Rafael Santos", visits: 18, lastVisit: "3 dias", spending: "R$ 1.890", avatar: "RS" },
    { name: "André Oliveira", visits: 12, lastVisit: "1 semana", spending: "R$ 960", avatar: "AO" },
    { name: "Lucas Mendes", visits: 8, lastVisit: "2 semanas", spending: "R$ 640", avatar: "LM" },
  ];

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-[1fr_60px_70px_80px] gap-2 text-[10px] text-white/25 uppercase tracking-wider pb-1 border-b border-white/[0.06] px-2">
        <span>Cliente</span>
        <span className="text-right">Visitas</span>
        <span className="text-right">Última</span>
        <span className="text-right hidden sm:block">Total</span>
      </div>
      {clients.map((c) => (
        <div
          key={c.name}
          className="grid grid-cols-[1fr_60px_70px_80px] gap-2 items-center rounded-lg px-2 py-2 hover:bg-white/[0.03] transition-colors text-[12px]"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full bg-[hsl(152_55%_42%/0.2)] flex items-center justify-center text-[9px] font-bold text-[hsl(152_55%_50%)] shrink-0">
              {c.avatar}
            </div>
            <span className="text-white/70 truncate">{c.name}</span>
          </div>
          <span className="text-right text-white/50">{c.visits}</span>
          <span className="text-right text-white/35">{c.lastVisit}</span>
          <span className="text-right text-white/50 font-medium hidden sm:block">{c.spending}</span>
        </div>
      ))}
    </div>
  );
}

const tabComponents: Record<TabId, React.FC> = {
  dashboard: DashboardTab,
  agenda: AgendaTab,
  clients: ClientsTab,
};

/* ─── Main export ─── */
export function MacBookShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(220 16% 6%) 0%, hsl(225 18% 8%) 40%, hsl(220 16% 6%) 100%)",
      }}
    >
      {/* Ambient glow effects */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(260 40% 30% / 0.15), transparent)",
            "radial-gradient(ellipse 50% 50% at 20% 80%, hsl(152 55% 42% / 0.06), transparent)",
            "radial-gradient(ellipse 50% 50% at 80% 80%, hsl(260 40% 50% / 0.04), transparent)",
          ].join(", "),
        }}
      />
      {/* Luminous curve - top */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 0%, hsl(260 45% 40% / 0.12), hsl(152 55% 42% / 0.04), transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs sm:text-sm font-medium text-[hsl(152_55%_55%)] mb-4 sm:mb-5"
          >
            <Zap className="h-3.5 w-3.5" />
            Como funciona
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.03em] text-white mb-4 sm:mb-5"
          >
            Tudo que você precisa.{" "}
            <span className="bg-gradient-to-r from-[hsl(152_55%_50%)] to-[hsl(260_40%_60%)] bg-clip-text text-transparent">
              Em um só lugar.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Gerencie agendamentos, clientes e faturamento em uma interface poderosa e intuitiva.
          </motion.p>
        </div>

        {/* MacBook */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[900px] mx-auto"
        >
          {/* Notifications */}
          <FloatingNotification side="left" />
          <FloatingNotification side="right" />

          {/* Screen bezel */}
          <div
            className="relative rounded-t-[12px] sm:rounded-t-[16px] overflow-hidden"
            style={{
              border: "2px solid hsl(220 10% 18%)",
              background: "hsl(220 14% 9%)",
              boxShadow: [
                "0 0 0 1px hsl(220 10% 12%)",
                "0 25px 80px -12px hsl(260 40% 20% / 0.3)",
                "0 12px 40px -8px hsl(0 0% 0% / 0.5)",
                "inset 0 1px 0 hsl(220 10% 22%)",
              ].join(", "),
            }}
          >
            {/* Camera notch */}
            <div className="flex justify-center pt-1.5 pb-0.5">
              <div className="h-[5px] w-[5px] rounded-full bg-[hsl(220_10%_22%)] ring-1 ring-[hsl(220_10%_16%)]" />
            </div>

            {/* Tab bar (inside screen) */}
            <div className="flex items-center gap-1 px-3 sm:px-4 pb-2 pt-1">
              <div className="flex items-center gap-1.5 mr-3">
                <div className="h-[7px] w-[7px] rounded-full bg-[hsl(0_55%_50%/0.6)]" />
                <div className="h-[7px] w-[7px] rounded-full bg-[hsl(38_80%_52%/0.5)]" />
                <div className="h-[7px] w-[7px] rounded-full bg-[hsl(152_55%_42%/0.5)]" />
              </div>

              <div className="flex-1 flex items-center gap-0.5 sm:gap-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        relative flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md text-[11px] sm:text-[12px] font-medium transition-all duration-200
                        ${isActive
                          ? "text-white/90 bg-white/[0.08]"
                          : "text-white/30 hover:text-white/50 hover:bg-white/[0.04]"
                        }
                      `}
                    >
                      <TabIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="showcase-tab-indicator"
                          className="absolute bottom-0 left-2 right-2 h-[1.5px] rounded-full"
                          style={{ background: "hsl(152 55% 42%)" }}
                          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* URL bar */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] px-3 py-1 text-[10px] text-white/25 font-mono">
                <div className="h-2.5 w-2.5 rounded-full bg-[hsl(152_55%_42%/0.4)]" />
                cutflow.app/dashboard
              </div>

              {/* Bell icon */}
              <div className="relative ml-1.5">
                <Bell className="h-3.5 w-3.5 text-white/25" />
                <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[hsl(152_55%_42%)]" />
              </div>
            </div>

            {/* Screen content */}
            <div className="px-3 sm:px-5 pb-4 sm:pb-6 min-h-[260px] sm:min-h-[320px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {(() => {
                    const Comp = tabComponents[activeTab];
                    return <Comp />;
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* MacBook hinge / chin */}
          <div className="relative">
            {/* Hinge strip */}
            <div
              className="h-[6px] sm:h-[8px] mx-[2px] rounded-b-[2px]"
              style={{
                background: "linear-gradient(180deg, hsl(220 10% 16%) 0%, hsl(220 10% 20%) 50%, hsl(220 10% 15%) 100%)",
                borderLeft: "1px solid hsl(220 10% 22%)",
                borderRight: "1px solid hsl(220 10% 22%)",
                borderBottom: "1px solid hsl(220 10% 18%)",
              }}
            />
            {/* Base / palm rest */}
            <div
              className="h-[12px] sm:h-[16px] mx-[-16px] sm:mx-[-28px] rounded-b-[10px] sm:rounded-b-[14px]"
              style={{
                background: "linear-gradient(180deg, hsl(220 10% 18%) 0%, hsl(220 8% 14%) 100%)",
                boxShadow: [
                  "inset 0 1px 0 hsl(220 10% 22%)",
                  "0 4px 20px -4px hsl(0 0% 0% / 0.6)",
                  "0 2px 8px hsl(0 0% 0% / 0.4)",
                ].join(", "),
                border: "1px solid hsl(220 10% 16%)",
                borderTop: "none",
              }}
            >
              {/* Trackpad indent */}
              <div className="absolute bottom-[3px] sm:bottom-[4px] left-1/2 -translate-x-1/2 w-[60px] sm:w-[80px] h-[2px] rounded-full bg-white/[0.04]" />
            </div>
          </div>

          {/* Reflection / shadow under laptop */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[70%] h-[40px] blur-2xl"
            style={{
              background: "radial-gradient(ellipse, hsl(260 40% 30% / 0.15), transparent 70%)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
