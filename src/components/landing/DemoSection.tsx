import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, BarChart3, Users, LayoutDashboard, TrendingUp, Star, Bell, Search,
  Settings, ChevronRight, Scissors, Clock, CheckCircle2, ArrowUpRight,
  CalendarPlus, MessageSquare,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

/* ─── Tab config ─── */
const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
];

/* ─── Sidebar ─── */
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Calendar, label: "Agenda" },
  { icon: Users, label: "Clientes" },
  { icon: Scissors, label: "Serviços" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: Settings, label: "Configurações" },
];

function Sidebar({ activeTab }: { activeTab: string }) {
  const activeMap: Record<string, string> = { dashboard: "Dashboard", agenda: "Agenda", clients: "Clientes", reports: "Relatórios" };
  return (
    <div className="hidden lg:flex flex-col w-[160px] border-r border-border/30 dark:border-white/[0.06] bg-muted/20 dark:bg-white/[0.02] py-4 px-2.5 shrink-0">
      <div className="flex items-center gap-2 px-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
          <Scissors className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-[11px] font-bold text-foreground dark:text-white">CutFlow</span>
      </div>
      <div className="space-y-0.5">
        {sidebarItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeMap[activeTab] === item.label
                ? "bg-primary/10 text-primary dark:bg-emerald-500/15 dark:text-emerald-400"
                : "text-muted-foreground dark:text-white/40"
            }`}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30 dark:border-white/[0.06] bg-muted/10 dark:bg-white/[0.02]">
      <div className="flex items-center gap-2 bg-muted/40 dark:bg-white/[0.04] rounded-lg px-2.5 py-1.5 text-[9px] text-muted-foreground dark:text-white/30 w-32 border border-border/40 dark:border-white/[0.06]">
        <Search className="h-3 w-3" /><span>Buscar...</span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Bell className="h-3.5 w-3.5 text-muted-foreground dark:text-white/40" />
          <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary dark:bg-emerald-400" />
        </div>
        <div className="h-6 w-6 rounded-full bg-primary/20 dark:bg-emerald-500/20 flex items-center justify-center text-[9px] font-bold text-primary dark:text-emerald-400">CS</div>
      </div>
    </div>
  );
}

/* ─── Dashboard Mockup ─── */
function DashboardMockup() {
  return (
    <div className="p-4 space-y-3">
      <div>
        <p className="text-[11px] font-semibold text-foreground dark:text-white">Bom dia, Carlos 👋</p>
        <p className="text-[9px] text-muted-foreground dark:text-white/40">Terça-feira, 11 de março de 2026</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: "Agendamentos", value: "12", icon: Calendar },
          { label: "Clientes", value: "248", icon: Users },
          { label: "Faturamento", value: "R$ 18.5k", icon: TrendingUp },
          { label: "Presença", value: "94%", icon: Star },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="h-6 w-6 rounded-lg flex items-center justify-center bg-primary/10 dark:bg-emerald-500/10">
                <m.icon className="h-3 w-3 text-primary dark:text-emerald-400" />
              </div>
              <span className="text-[8px] text-primary dark:text-emerald-400 flex items-center"><ArrowUpRight className="h-2 w-2" />+</span>
            </div>
            <p className="text-sm font-bold text-foreground dark:text-white">{m.value}</p>
            <p className="text-[8px] text-muted-foreground dark:text-white/40">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-3">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-semibold text-foreground dark:text-white">Próximos</p>
          <ChevronRight className="h-3 w-3 text-muted-foreground dark:text-white/30" />
        </div>
        <div className="space-y-2">
          {[
            { time: "09:00", name: "João Silva", service: "Corte + Barba", color: "bg-primary dark:bg-emerald-400" },
            { time: "10:30", name: "Pedro Santos", service: "Corte", color: "bg-blue-500 dark:bg-blue-400" },
            { time: "11:00", name: "Lucas Oliveira", service: "Barba", color: "bg-amber-500 dark:bg-amber-400" },
          ].map((a) => (
            <div key={a.time} className="flex items-center gap-2.5 p-1.5 rounded-lg">
              <div className={`h-7 w-0.5 rounded-full ${a.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-foreground dark:text-white truncate">{a.name}</p>
                <p className="text-[8px] text-muted-foreground dark:text-white/40">{a.service}</p>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground dark:text-white/30">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Agenda Mockup ─── */
function AgendaMockup() {
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00"];
  const apts: Record<string, { col: number; label: string; client: string }> = {
    "09:00": { col: 0, label: "Corte + Barba", client: "João Silva" },
    "09:00b": { col: 1, label: "Corte", client: "Pedro S." },
    "10:00": { col: 1, label: "Corte + Barba", client: "Marcos L." },
    "11:00": { col: 2, label: "Barba", client: "Lucas O." },
  };

  const getApt = (h: string, col: number) => {
    if (apts[h]?.col === col) return apts[h];
    if (apts[h + "b"]?.col === col) return apts[h + "b"];
    return null;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold text-foreground dark:text-white">Ter, 11 Mar 2026</p>
        <span className="text-[9px] text-muted-foreground dark:text-white/40 bg-muted dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-border/40 dark:border-white/[0.06]">Hoje</span>
      </div>
      <div className="space-y-1">
        {hours.map((hour) => (
          <div key={hour} className="flex items-stretch gap-2 min-h-[36px]">
            <span className="text-[9px] font-mono text-muted-foreground dark:text-white/30 w-9 pt-2 shrink-0">{hour}</span>
            <div className="flex-1 grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((col) => {
                const apt = getApt(hour, col);
                return (
                  <div key={col} className={`rounded-lg border text-[9px] px-2 py-1.5 ${apt ? "border-primary/20 bg-primary/[0.06] dark:border-emerald-500/20 dark:bg-emerald-500/[0.08]" : "border-dashed border-border/40 dark:border-white/[0.06]"}`}>
                    {apt && (
                      <>
                        <p className="font-medium text-foreground dark:text-white truncate">{apt.label}</p>
                        <p className="text-[8px] text-muted-foreground dark:text-white/40 truncate">{apt.client}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Clients Mockup ─── */
function ClientsMockup() {
  const clients = [
    { name: "João Silva", visits: 12, tag: "VIP", cls: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20" },
    { name: "Pedro Santos", visits: 8, tag: "Ativo", cls: "bg-primary/10 text-primary dark:bg-emerald-500/10 dark:text-emerald-400 border-primary/20 dark:border-emerald-500/20" },
    { name: "Lucas Oliveira", visits: 3, tag: "Novo", cls: "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20" },
    { name: "Rafael Costa", visits: 15, tag: "VIP", cls: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20" },
  ];
  return (
    <div className="p-4">
      <p className="text-[11px] font-semibold text-foreground dark:text-white mb-2.5">Clientes</p>
      <div className="rounded-xl border border-border/50 dark:border-white/[0.06] overflow-hidden">
        {clients.map((c) => (
          <div key={c.name} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border/30 dark:border-white/[0.04] last:border-0">
            <div className="h-6 w-6 rounded-full bg-muted dark:bg-white/[0.06] flex items-center justify-center text-[8px] font-bold text-muted-foreground dark:text-white/40 shrink-0">
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <span className="text-[10px] font-medium text-foreground dark:text-white flex-1 truncate">{c.name}</span>
            <span className="text-[9px] text-muted-foreground dark:text-white/40">{c.visits}x</span>
            <span className={`text-[8px] px-2 py-0.5 rounded-full font-medium border ${c.cls}`}>{c.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Reports Mockup ─── */
function ReportsMockup() {
  return (
    <div className="p-4 space-y-3">
      <p className="text-[11px] font-semibold text-foreground dark:text-white">Relatórios — Março 2026</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Faturamento", value: "R$ 18.5k", change: "+12%" },
          { label: "Ticket médio", value: "R$ 65", change: "+R$ 5" },
          { label: "Retorno", value: "78%", change: "-2%" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-2.5">
            <p className="text-[8px] text-muted-foreground dark:text-white/40 mb-0.5">{m.label}</p>
            <p className="text-sm font-bold text-foreground dark:text-white">{m.value}</p>
            <span className="text-[8px] font-medium text-primary dark:text-emerald-400">{m.change}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-3">
        <p className="text-[10px] font-semibold text-foreground dark:text-white mb-2.5">Faturamento semanal</p>
        <div className="flex items-end gap-2 h-20">
          {[40, 65, 50, 80, 70, 95, 75].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`w-full rounded ${i === 5 ? "bg-primary dark:bg-emerald-400" : "bg-primary/40 dark:bg-emerald-500/50"}`}
              />
              <span className="text-[8px] text-muted-foreground dark:text-white/30">{["S", "T", "Q", "Q", "S", "S", "D"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const mockups: Record<string, () => JSX.Element> = {
  dashboard: DashboardMockup,
  agenda: AgendaMockup,
  clients: ClientsMockup,
  reports: ReportsMockup,
};

/* ─── Falling Notifications ─── */
const fallingNotifs = [
  { icon: CalendarPlus, title: "Novo agendamento criado", shop: "Barbearia Prime", time: "agora", color: "text-primary dark:text-emerald-400" },
  { icon: CheckCircle2, title: "Cliente confirmou horário", shop: "Dom H Barber", time: "2 min atrás", color: "text-emerald-500 dark:text-emerald-400" },
  { icon: Clock, title: "Horário liberado às 19:00", shop: "Elite Barber", time: "agora", color: "text-blue-500 dark:text-blue-400" },
  { icon: MessageSquare, title: "Lembrete enviado WhatsApp", shop: "Black Zone Barber", time: "3 min atrás", color: "text-teal-500 dark:text-teal-400" },
  { icon: CalendarPlus, title: "Novo agendamento criado", shop: "Barber Club", time: "1 min atrás", color: "text-primary dark:text-emerald-400" },
  { icon: CheckCircle2, title: "Cliente confirmou horário", shop: "Studio Corte", time: "agora", color: "text-amber-500 dark:text-purple-400" },
];

function FallingNotifications() {
  const [visible, setVisible] = useState<number[]>([0, 1, 2]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((p) => p + 1), 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const start = tick % fallingNotifs.length;
    setVisible([0, 1, 2].map((o) => (start + o) % fallingNotifs.length));
  }, [tick]);

  return (
    <div className="flex flex-col gap-2.5">
      <AnimatePresence mode="popLayout">
        {visible.map((idx, pos) => {
          const n = fallingNotifs[idx];
          const Icon = n.icon;
          return (
            <motion.div
              key={`${idx}-${tick}-${pos}`}
              initial={{ opacity: 0, y: -24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              transition={{ duration: 0.45, delay: pos * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/15 dark:from-purple-500/15 via-primary/5 dark:via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="relative rounded-xl bg-card/95 dark:bg-white/[0.04] backdrop-blur-xl border border-border/50 dark:border-white/[0.08] px-3 py-2.5 flex items-start gap-2.5 shadow-card dark:shadow-lg dark:shadow-black/20">
                <div className={`mt-0.5 ${n.color}`}><Icon className="h-3.5 w-3.5" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground dark:text-white/90 leading-snug">{n.title}</p>
                  <p className="text-[9px] text-muted-foreground dark:text-white/35 mt-0.5">{n.shop} <span className="text-muted-foreground/50 dark:text-white/20">— {n.time}</span></p>
                </div>
                <span className="relative flex h-1.5 w-1.5 mt-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary/60 dark:bg-emerald-400/60" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <p className="text-[10px] text-muted-foreground/60 dark:text-white/25 mt-1 text-center lg:text-left">
        <span className="text-primary dark:text-emerald-400 font-semibold">+2.400</span> agendamentos esta semana
      </p>
    </div>
  );
}

/* ─── Main Section ─── */
export function DemoSection() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveTab((prev) => {
        const idx = tabs.findIndex((t) => t.id === prev);
        return tabs[(idx + 1) % tabs.length].id;
      });
    }, 3000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleTab = (id: string) => { setActiveTab(id); resetTimer(); };
  const ActiveMockup = mockups[activeTab];

  return (
    <section id="showcase" className="relative overflow-hidden scroll-mt-20 py-20 sm:py-28 lg:py-36">
      {/* Dark background for dark mode, light clean for light mode */}
      <div className="absolute inset-0 bg-muted/30 dark:bg-[hsl(240,20%,4%)]" />

      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/[0.03] dark:bg-purple-600/[0.07] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-primary/[0.02] dark:bg-emerald-500/[0.04] blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/[0.03] dark:bg-purple-500/[0.06] blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.04)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.04)_1px,transparent_1px)] bg-[size:80px_80px] dark:bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)]" />
      </div>

      <div className="max-w-7xl mx-auto relative px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.08] border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Explore o sistema
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5 text-foreground dark:text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Controle total. Na palma da mão.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground dark:text-white/50 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Gerencie tudo pelo painel completo enquanto seus clientes agendam direto do celular.
          </motion.p>
        </div>

        {/* Tab selector */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-1 rounded-xl border border-border/50 dark:border-white/[0.08] bg-muted/40 dark:bg-white/[0.04] p-1 backdrop-blur-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground dark:text-white/40 hover:text-foreground dark:hover:text-white/70 hover:bg-muted/60 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1.5">
            {tabs.map((tab) => (
              <div key={tab.id} className="w-12 h-0.5 rounded-full bg-border/40 dark:bg-white/[0.08] overflow-hidden">
                {activeTab === tab.id && (
                  <motion.div
                    key={`progress-${tab.id}-${activeTab}`}
                    className="h-full bg-primary/60 dark:bg-emerald-400/60 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── MacBook + Notifications layout ─── */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* MacBook mockup — bigger */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex-1 min-w-0 order-1"
          >
            <div className="rounded-2xl border-2 border-border/60 dark:border-white/[0.08] bg-card dark:bg-[hsl(240,16%,8%)] shadow-2xl overflow-hidden ring-1 ring-border/20 dark:ring-white/[0.04]">
              {/* Browser chrome */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 border-b border-border/40 dark:border-white/[0.06] bg-muted/20 dark:bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-destructive/40" />
                  <div className="h-3 w-3 rounded-full bg-warning/40" />
                  <div className="h-3 w-3 rounded-full bg-primary/40" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="text-[10px] text-muted-foreground dark:text-white/30 bg-muted/40 dark:bg-white/[0.04] rounded-lg px-5 py-1.5 border border-border/30 dark:border-white/[0.06] font-mono">
                    cutflow.app/dashboard
                  </div>
                </div>
              </div>
              <div className="flex min-h-[300px] sm:min-h-[360px] lg:min-h-[400px]">
                <Sidebar activeTab={activeTab} />
                <div className="flex-1 flex flex-col min-w-0">
                  <TopBar />
                  <div className="flex-1 bg-background dark:bg-[hsl(240,16%,7%)] overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                        <ActiveMockup />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
            {/* Laptop base */}
            <div className="mx-auto w-[55%] h-3 sm:h-4 bg-gradient-to-b from-border/60 dark:from-white/[0.06] to-transparent rounded-b-xl" />
            <div className="mx-auto w-[70%] h-1.5 sm:h-2 bg-border/20 dark:bg-white/[0.03] rounded-b-2xl" />

            {/* Label */}
            <p className="text-center text-[11px] text-muted-foreground dark:text-white/30 mt-3 font-medium">
              Painel administrativo do dono
            </p>
          </motion.div>

          {/* Falling notifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="w-full lg:w-[260px] xl:w-[280px] shrink-0 lg:pt-10 order-2"
          >
            <FallingNotifications />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
