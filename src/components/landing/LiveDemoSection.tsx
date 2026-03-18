import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  CalendarPlus, CheckCircle, Clock, MessageSquare, Calendar, Users,
  BarChart3, Settings, Scissors, Search, Bell, TrendingUp, Star,
  ArrowUpRight, ChevronRight, LayoutDashboard,
} from "lucide-react";
import { IPhoneLockScreen } from "./IPhoneLockScreen";

/* ─── Floating notifications ─── */
const notifications = [
  { icon: CalendarPlus, title: "Novo agendamento criado", shop: "Barbearia Prime", time: "agora", iconColor: "text-primary" },
  { icon: CheckCircle, title: "Cliente confirmou horário", shop: "Dom H Barber", time: "2 min atrás", iconColor: "text-emerald-500" },
  { icon: Clock, title: "Horário liberado às 19:00", shop: "Elite Barber", time: "agora", iconColor: "text-blue-500" },
  { icon: MessageSquare, title: "Lembrete enviado WhatsApp", shop: "Black Zone Barber", time: "3 min atrás", iconColor: "text-teal-500" },
  { icon: CalendarPlus, title: "Novo agendamento criado", shop: "Barber Club", time: "1 min atrás", iconColor: "text-primary" },
  { icon: CheckCircle, title: "Cliente confirmou horário", shop: "Barbearia Central", time: "agora", iconColor: "text-amber-500" },
];

/* ─── Mini Dashboard (laptop screen) ─── */
function MiniDashboard() {
  const sidebar = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Calendar, label: "Agenda", active: false },
    { icon: Users, label: "Clientes", active: false },
    { icon: Scissors, label: "Serviços", active: false },
    { icon: BarChart3, label: "Relatórios", active: false },
    { icon: Settings, label: "Config.", active: false },
  ];

  return (
    <div className="flex h-full bg-background rounded-lg overflow-hidden">
      <div className="hidden sm:flex flex-col w-[140px] border-r border-border bg-muted/20 py-3 px-2 shrink-0">
        <div className="flex items-center gap-1.5 px-2 mb-3">
          <div className="h-5 w-5 rounded-md bg-primary flex items-center justify-center">
            <Scissors className="h-2.5 w-2.5 text-primary-foreground" />
          </div>
          <span className="text-[10px] font-bold">CutFlow</span>
        </div>
        <div className="space-y-0.5">
          {sidebar.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[9px] font-medium ${
                item.active ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <div className="flex items-center gap-1.5 bg-muted/40 rounded-md px-2 py-1 text-[8px] text-muted-foreground w-28">
            <Search className="h-2.5 w-2.5" />
            <span>Buscar...</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Bell className="h-3 w-3 text-muted-foreground" />
              <div className="absolute -top-0.5 -right-0.5 h-1 w-1 rounded-full bg-destructive" />
            </div>
            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[7px] font-bold text-primary">
              CS
            </div>
          </div>
        </div>

        <div className="p-3 space-y-2.5">
          <div>
            <p className="text-[10px] font-semibold">Bom dia, Carlos 👋</p>
            <p className="text-[8px] text-muted-foreground">Terça-feira, 11 de março de 2026</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { label: "Agendamentos", value: "12", icon: Calendar, accent: "text-primary" },
              { label: "Clientes", value: "248", icon: Users, accent: "text-blue-500" },
              { label: "Faturamento", value: "R$ 18.5k", icon: TrendingUp, accent: "text-emerald-500" },
              { label: "Presença", value: "94%", icon: Star, accent: "text-amber-500" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-border p-2">
                <div className="flex items-center justify-between mb-1">
                  <m.icon className={`h-3 w-3 ${m.accent}`} />
                  <span className="text-[7px] text-emerald-500 flex items-center">
                    <ArrowUpRight className="h-2 w-2" />+
                  </span>
                </div>
                <p className="text-xs font-bold">{m.value}</p>
                <p className="text-[7px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border p-2.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-semibold">Próximos agendamentos</p>
              <ChevronRight className="h-2.5 w-2.5 text-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              {[
                { time: "09:00", name: "João Silva", service: "Corte + Barba", color: "bg-primary" },
                { time: "10:30", name: "Pedro Santos", service: "Corte", color: "bg-blue-500" },
                { time: "11:00", name: "Lucas Oliveira", service: "Barba", color: "bg-amber-500" },
              ].map((a) => (
                <div key={a.time} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/20">
                  <div className={`h-6 w-0.5 rounded-full ${a.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-medium truncate">{a.name}</p>
                    <p className="text-[7px] text-muted-foreground">{a.service}</p>
                  </div>
                  <span className="font-mono text-[8px] text-muted-foreground">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 3D Phone with mouse tracking ─── */
function PhoneShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative shrink-0"
      style={{ perspective: "1600px" }}
    >
      {/* Multi-layer ambient glow — much stronger */}
      <div className="absolute -inset-24 bg-[radial-gradient(ellipse_at_center,hsl(152,55%,42%,0.18),transparent_55%)] blur-3xl pointer-events-none" />
      <div className="absolute -inset-32 bg-[radial-gradient(ellipse_at_bottom,hsl(220,60%,50%,0.10),transparent_50%)] blur-3xl pointer-events-none" />
      <div className="absolute -inset-16 bg-[radial-gradient(circle_at_top,hsl(152,50%,55%,0.10),transparent_45%)] blur-2xl pointer-events-none" />

      {/* 3D phone wrapper */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* Phone frame — LARGER */}
        <div className="relative w-[280px] sm:w-[320px] lg:w-[340px] rounded-[2.6rem] overflow-hidden shadow-[0_40px_120px_-15px_rgba(0,0,0,0.7),0_16px_48px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.08)]">
          {/* Titanium bezel gradient */}
          <div className="absolute inset-0 rounded-[2.6rem] bg-gradient-to-b from-[hsl(220,15%,24%)] via-[hsl(220,14%,16%)] to-[hsl(222,16%,10%)]" />

          {/* Titanium edge highlights */}
          <div className="absolute inset-0 rounded-[2.6rem] bg-gradient-to-r from-white/[0.05] via-transparent to-white/[0.03] pointer-events-none" />

          {/* Side button reflections */}
          <div className="absolute top-[90px] -right-[1px] w-[2px] h-[44px] bg-gradient-to-b from-white/[0.14] via-white/[0.05] to-transparent rounded-full" />
          <div className="absolute top-[68px] -left-[1px] w-[2px] h-[26px] bg-gradient-to-b from-white/[0.10] to-transparent rounded-full" />
          <div className="absolute top-[105px] -left-[1px] w-[2px] h-[40px] bg-gradient-to-b from-white/[0.10] to-transparent rounded-full" />

          {/* Inner bezel ring */}
          <div className="absolute inset-[2px] rounded-[2.4rem] border border-white/[0.06]" />
          <div className="absolute inset-[3px] rounded-[2.3rem] border border-black/20" />

          {/* Screen */}
          <div className="relative m-[7px] rounded-[2.2rem] overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30">
              <div className="w-[80px] h-[22px] bg-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.6),0_0_0_0.5px_rgba(255,255,255,0.07)]">
                <div className="w-[7px] h-[7px] rounded-full bg-[hsl(220,15%,15%)] ring-1 ring-[hsl(220,15%,22%)]" />
              </div>
            </div>

            {/* Screen content */}
            <div className="aspect-[9/19.2]">
              <IPhoneLockScreen />
            </div>

            {/* Screen glare */}
            <div className="absolute inset-0 pointer-events-none rounded-[2.2rem]" style={{
              background: "linear-gradient(125deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.02) 100%)",
            }} />
            <div className="absolute inset-0 pointer-events-none rounded-[2.2rem] border border-white/[0.04]" />
          </div>
        </div>

        {/* Surface reflection */}
        <div className="absolute -bottom-12 left-4 right-4 h-24 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-b from-primary/[0.06] via-primary/[0.03] to-transparent blur-2xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>
      </motion.div>
    </div>
  );
}

export function LiveDemoSection() {
  const [visibleNotifs, setVisibleNotifs] = useState([0, 1, 2]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((prev) => prev + 1), 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const start = tick % notifications.length;
    const indices = [0, 1, 2].map((offset) => (start + offset) % notifications.length);
    setVisibleNotifs(indices);
  }, [tick]);

  return (
    <section className="section-padding relative overflow-hidden py-20 sm:py-28">
      {/* Cinematic background — stronger, less muddy */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(220,20%,6%)] to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,hsl(152,55%,42%,0.07),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_20%,hsl(260,40%,40%,0.04),transparent)]" />
      {/* Horizontal accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Ao vivo
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5"
          >
            Veja o CutFlow funcionando em tempo real
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto"
          >
            Acompanhe agendamentos acontecendo enquanto você organiza sua barbearia.
          </motion.p>
        </div>

        {/* Laptop + Phone */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-0">
            {/* Laptop mockup */}
            <div className="flex-1 w-full lg:pr-4">
              <div className="rounded-xl sm:rounded-2xl border-2 border-border/80 bg-card shadow-[var(--shadow-elevated)] overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/40 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                    <div className="h-2.5 w-2.5 rounded-full bg-warning/40" />
                    <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-background/60 border border-border/50 rounded-md px-3 py-1 text-[9px] text-muted-foreground/60 max-w-[240px] mx-auto">
                      cutflow.app/dashboard
                    </div>
                  </div>
                </div>
                <div className="h-[280px] sm:h-[340px] overflow-hidden">
                  <MiniDashboard />
                </div>
              </div>
              <div className="mx-auto w-[60%] h-3 bg-gradient-to-b from-border/60 to-border/30 rounded-b-xl" />
              <div className="mx-auto w-[75%] h-1.5 bg-border/20 rounded-b-2xl" />
            </div>

            {/* Premium 3D Phone */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotateY: -8 }}
              whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:-ml-16 lg:mt-8"
            >
              <PhoneShowcase />
            </motion.div>
          </div>

          {/* Floating notification cards (desktop only) */}
          <div className="hidden xl:flex absolute -right-4 top-8 w-[260px] flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {visibleNotifs.map((idx, position) => {
                const notif = notifications[idx];
                const Icon = notif.icon;
                return (
                  <motion.div
                    key={`${idx}-${tick}-${position}`}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: position * 0.08 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                    <div className="relative rounded-xl bg-card/80 backdrop-blur-xl border border-border/50 px-3.5 py-3 flex items-start gap-3 shadow-[var(--shadow-card)]">
                      <div className={`mt-0.5 ${notif.iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-foreground leading-snug">{notif.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {notif.shop} <span className="text-muted-foreground/50">— {notif.time}</span>
                        </p>
                      </div>
                      <div className="mt-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/60" />
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-left mt-1"
            >
              <p className="text-[11px] text-muted-foreground/60">
                <span className="text-primary font-semibold">+2.400</span> agendamentos esta semana
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
