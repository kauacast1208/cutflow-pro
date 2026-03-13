import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarPlus,
  CheckCircle,
  Clock,
  MessageSquare,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Scissors,
  Search,
  Bell,
  TrendingUp,
  Star,
  ArrowUpRight,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

const notifications = [
  {
    icon: CalendarPlus,
    title: "Novo agendamento criado",
    shop: "Barbearia Prime",
    time: "agora",
    glow: "from-primary/20 to-emerald-500/10",
    iconColor: "text-primary",
  },
  {
    icon: CheckCircle,
    title: "Cliente confirmou horário",
    shop: "Dom H Barber",
    time: "2 min atrás",
    glow: "from-emerald-500/20 to-teal-500/10",
    iconColor: "text-emerald-500",
  },
  {
    icon: Clock,
    title: "Horário liberado às 19:00",
    shop: "Elite Barber",
    time: "agora",
    glow: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-500",
  },
  {
    icon: MessageSquare,
    title: "Lembrete enviado WhatsApp",
    shop: "Black Zone Barber",
    time: "3 min atrás",
    glow: "from-teal-500/20 to-emerald-500/10",
    iconColor: "text-teal-500",
  },
  {
    icon: CalendarPlus,
    title: "Novo agendamento criado",
    shop: "Barber Club",
    time: "1 min atrás",
    glow: "from-primary/20 to-emerald-500/10",
    iconColor: "text-primary",
  },
  {
    icon: CheckCircle,
    title: "Cliente confirmou horário",
    shop: "Barbearia Central",
    time: "agora",
    glow: "from-amber-500/20 to-orange-500/10",
    iconColor: "text-amber-500",
  },
];

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
      {/* Sidebar */}
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
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Topbar */}
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

        {/* Dashboard content */}
        <div className="p-3 space-y-2.5">
          <div>
            <p className="text-[10px] font-semibold">Bom dia, Carlos 👋</p>
            <p className="text-[8px] text-muted-foreground">
              Terça-feira, 11 de março de 2026
            </p>
          </div>

          {/* Metric cards */}
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

          {/* Upcoming */}
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

export function LiveDemoSection() {
  const [visibleNotifs, setVisibleNotifs] = useState([0, 1, 2]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const start = tick % notifications.length;
    const indices = [0, 1, 2].map((offset) => (start + offset) % notifications.length);
    setVisibleNotifs(indices);
  }, [tick]);

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-br from-primary/[0.04] via-transparent to-emerald-500/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
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

        {/* Laptop + Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
            {/* Laptop mockup */}
            <div className="flex-1 w-full">
              {/* Screen bezel */}
              <div className="rounded-xl sm:rounded-2xl border-2 border-border/80 bg-card shadow-elevated overflow-hidden">
                {/* Browser chrome */}
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

                {/* Dashboard content */}
                <div className="h-[280px] sm:h-[340px] overflow-hidden">
                  <MiniDashboard />
                </div>
              </div>

              {/* Laptop base */}
              <div className="mx-auto w-[60%] h-3 bg-gradient-to-b from-border/60 to-border/30 rounded-b-xl" />
              <div className="mx-auto w-[75%] h-1.5 bg-border/20 rounded-b-2xl" />
            </div>

            {/* Floating notifications */}
            <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0 flex flex-col gap-3 lg:pt-8">
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
                      {/* Glow border */}
                      <div className={`absolute -inset-px rounded-xl bg-gradient-to-r ${notif.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />

                      {/* Card */}
                      <div className="relative rounded-xl bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border/50 dark:border-border/30 px-3.5 py-3 flex items-start gap-3 shadow-card">
                        <div className={`mt-0.5 ${notif.iconColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-foreground leading-snug">
                            {notif.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {notif.shop}{" "}
                            <span className="text-muted-foreground/50">
                              — {notif.time}
                            </span>
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

              {/* Activity counter */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-center lg:text-left mt-1"
              >
                <p className="text-[11px] text-muted-foreground/60">
                  <span className="text-primary font-semibold">+2.400</span>{" "}
                  agendamentos esta semana
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
