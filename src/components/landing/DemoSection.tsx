import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, BarChart3, Users, LayoutDashboard, TrendingUp, Star, Bell, Search,
  Settings, ChevronRight, Scissors, Clock, CheckCircle2, ArrowUpRight,
  DollarSign, Heart, UserX, Gift, Target, Megaphone, Crown,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { IPhoneLockScreen } from "./IPhoneLockScreen";

/* ─── Tab config (6 tabs) ─── */
const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "crm", label: "CRM", icon: Heart },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "finance", label: "Financeiro", icon: DollarSign },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Calendar, label: "Agenda" },
  { icon: Users, label: "Clientes" },
  { icon: Heart, label: "CRM" },
  { icon: Scissors, label: "Serviços" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: DollarSign, label: "Financeiro" },
  { icon: Settings, label: "Configurações" },
];

function Sidebar({ activeTab }: { activeTab: string }) {
  const activeMap: Record<string, string> = {
    dashboard: "Dashboard", agenda: "Agenda", clients: "Clientes",
    crm: "CRM", reports: "Relatórios", finance: "Financeiro",
  };
  return (
    <div className="hidden lg:flex flex-col w-[160px] border-r border-border/30 dark:border-white/[0.06] bg-muted/20 dark:bg-white/[0.02] py-4 px-2.5 shrink-0">
      <div className="flex items-center gap-2 px-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
          <Scissors className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-[11px] font-bold text-foreground">CutFlow</span>
      </div>
      <div className="space-y-0.5">
        {sidebarItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[10px] font-medium transition-colors ${
              activeMap[activeTab] === item.label
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
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
      <div className="flex items-center gap-2 bg-muted/40 dark:bg-white/[0.04] rounded-lg px-2.5 py-1.5 text-[9px] text-muted-foreground w-32 border border-border/40 dark:border-white/[0.06]">
        <Search className="h-3 w-3" /><span>Buscar...</span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">CS</div>
      </div>
    </div>
  );
}

/* ─── Dashboard ─── */
function DashboardMockup() {
  return (
    <div className="p-4 space-y-3">
      <div>
        <p className="text-[11px] font-semibold text-foreground">Bom dia, Carlos 👋</p>
        <p className="text-[9px] text-muted-foreground">Terça-feira, 11 de março de 2026</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: "Agendamentos", value: "12", icon: Calendar, change: "+3" },
          { label: "Clientes", value: "248", icon: Users, change: "+8" },
          { label: "Faturamento", value: "R$ 18.5k", icon: TrendingUp, change: "+12%" },
          { label: "Presença", value: "94%", icon: Star, change: "+2%" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="h-6 w-6 rounded-lg flex items-center justify-center bg-primary/10">
                <m.icon className="h-3 w-3 text-primary" />
              </div>
              <span className="text-[8px] text-emerald-500 flex items-center font-medium"><ArrowUpRight className="h-2 w-2" />{m.change}</span>
            </div>
            <p className="text-sm font-bold text-foreground">{m.value}</p>
            <p className="text-[8px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-3">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-semibold text-foreground">Próximos agendamentos</p>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          {[
            { time: "09:00", name: "João Silva", service: "Corte + Barba", color: "bg-primary" },
            { time: "10:30", name: "Pedro Santos", service: "Corte", color: "bg-blue-500" },
            { time: "11:00", name: "Lucas Oliveira", service: "Barba", color: "bg-amber-500" },
          ].map((a) => (
            <div key={a.time} className="flex items-center gap-2.5 p-1.5 rounded-lg">
              <div className={`h-7 w-0.5 rounded-full ${a.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-foreground truncate">{a.name}</p>
                <p className="text-[8px] text-muted-foreground">{a.service}</p>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Agenda ─── */
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
        <p className="text-[11px] font-semibold text-foreground">Ter, 11 Mar 2026</p>
        <span className="text-[9px] text-muted-foreground bg-muted dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-border/40 dark:border-white/[0.06]">Hoje</span>
      </div>
      <div className="space-y-1">
        {hours.map((hour) => (
          <div key={hour} className="flex items-stretch gap-2 min-h-[36px]">
            <span className="text-[9px] font-mono text-muted-foreground w-9 pt-2 shrink-0">{hour}</span>
            <div className="flex-1 grid grid-cols-3 gap-1.5">
              {[0, 1, 2].map((col) => {
                const apt = getApt(hour, col);
                return (
                  <div key={col} className={`rounded-lg border text-[9px] px-2 py-1.5 ${apt ? "border-primary/20 bg-primary/[0.06]" : "border-dashed border-border/40 dark:border-white/[0.06]"}`}>
                    {apt && (
                      <>
                        <p className="font-medium text-foreground truncate">{apt.label}</p>
                        <p className="text-[8px] text-muted-foreground truncate">{apt.client}</p>
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

/* ─── Clients ─── */
function ClientsMockup() {
  const clients = [
    { name: "João Silva", visits: 12, tag: "VIP", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { name: "Pedro Santos", visits: 8, tag: "Ativo", cls: "bg-primary/10 text-primary border-primary/20" },
    { name: "Lucas Oliveira", visits: 3, tag: "Novo", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { name: "Rafael Costa", visits: 15, tag: "VIP", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  ];
  return (
    <div className="p-4">
      <p className="text-[11px] font-semibold text-foreground mb-2.5">Clientes</p>
      <div className="rounded-xl border border-border/50 dark:border-white/[0.06] overflow-hidden">
        {clients.map((c) => (
          <div key={c.name} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border/30 dark:border-white/[0.04] last:border-0">
            <div className="h-6 w-6 rounded-full bg-muted dark:bg-white/[0.06] flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">
              {c.name.split(" ").map(n => n[0]).join("")}
            </div>
            <span className="text-[10px] font-medium text-foreground flex-1 truncate">{c.name}</span>
            <span className="text-[9px] text-muted-foreground">{c.visits}x</span>
            <span className={`text-[8px] px-2 py-0.5 rounded-full font-medium border ${c.cls}`}>{c.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CRM ─── */
function CRMMockup() {
  return (
    <div className="p-4 space-y-3">
      <p className="text-[11px] font-semibold text-foreground">CRM & Relacionamento</p>

      {/* Segments */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { label: "VIP", value: "18", icon: Crown, accent: "text-amber-500 bg-amber-500/10" },
          { label: "Ativos", value: "156", icon: Heart, accent: "text-primary bg-primary/10" },
          { label: "Inativos", value: "32", icon: UserX, accent: "text-destructive bg-destructive/10" },
          { label: "Aniversários", value: "5", icon: Gift, accent: "text-purple-500 bg-purple-500/10" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-2.5">
            <div className={`h-6 w-6 rounded-lg flex items-center justify-center mb-1.5 ${s.accent}`}>
              <s.icon className="h-3 w-3" />
            </div>
            <p className="text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-[8px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Retention insights */}
      <div className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-3">
        <p className="text-[10px] font-semibold text-foreground mb-2">Retenção</p>
        <div className="space-y-2">
          {[
            { label: "Taxa de retorno", value: "78%", bar: 78 },
            { label: "Frequência média", value: "2.3x/mês", bar: 65 },
            { label: "Satisfação", value: "4.8/5", bar: 96 },
          ].map((r) => (
            <div key={r.label}>
              <div className="flex justify-between text-[9px] mb-1">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium text-foreground">{r.value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted dark:bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${r.bar}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign suggestions */}
      <div className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-foreground">Campanhas sugeridas</p>
          <Megaphone className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Reativar inativos", desc: "32 clientes há +30 dias", icon: Target },
            { label: "Aniversariantes da semana", desc: "5 clientes esta semana", icon: Gift },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/30 dark:bg-white/[0.02]">
              <c.icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-medium text-foreground">{c.label}</p>
                <p className="text-[8px] text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Reports ─── */
function ReportsMockup() {
  return (
    <div className="p-4 space-y-3">
      <p className="text-[11px] font-semibold text-foreground">Relatórios — Março 2026</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Faturamento", value: "R$ 18.5k", change: "+12%" },
          { label: "Ticket médio", value: "R$ 65", change: "+R$ 5" },
          { label: "Retorno", value: "78%", change: "-2%" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-2.5">
            <p className="text-[8px] text-muted-foreground mb-0.5">{m.label}</p>
            <p className="text-sm font-bold text-foreground">{m.value}</p>
            <span className="text-[8px] font-medium text-primary">{m.change}</span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-3">
        <p className="text-[10px] font-semibold text-foreground mb-2.5">Faturamento semanal</p>
        <div className="flex items-end gap-2 h-20">
          {[40, 65, 50, 80, 70, 95, 75].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className={`w-full rounded ${i === 5 ? "bg-primary" : "bg-primary/40"}`}
              />
              <span className="text-[8px] text-muted-foreground">{["S", "T", "Q", "Q", "S", "S", "D"][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Finance ─── */
function FinanceMockup() {
  return (
    <div className="p-4 space-y-3">
      <p className="text-[11px] font-semibold text-foreground">Financeiro — Março 2026</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {[
          { label: "Receita", value: "R$ 18.5k", icon: TrendingUp, accent: "text-emerald-500 bg-emerald-500/10" },
          { label: "Ticket médio", value: "R$ 65", icon: DollarSign, accent: "text-primary bg-primary/10" },
          { label: "Serviços realizados", value: "284", icon: Scissors, accent: "text-blue-500 bg-blue-500/10" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-2.5">
            <div className={`h-6 w-6 rounded-lg flex items-center justify-center mb-1.5 ${m.accent}`}>
              <m.icon className="h-3 w-3" />
            </div>
            <p className="text-sm font-bold text-foreground">{m.value}</p>
            <p className="text-[8px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-3">
        <p className="text-[10px] font-semibold text-foreground mb-2.5">Receita por profissional</p>
        <div className="space-y-2">
          {[
            { name: "Carlos", value: "R$ 7.2k", pct: 39 },
            { name: "Rafael", value: "R$ 5.8k", pct: 31 },
            { name: "André", value: "R$ 5.5k", pct: 30 },
          ].map((p) => (
            <div key={p.name}>
              <div className="flex justify-between text-[9px] mb-1">
                <span className="font-medium text-foreground">{p.name}</span>
                <span className="text-muted-foreground">{p.value} ({p.pct}%)</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted dark:bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${p.pct * 2.5}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border/50 dark:border-white/[0.06] bg-card dark:bg-white/[0.03] p-3">
        <p className="text-[10px] font-semibold text-foreground mb-2">Top serviços</p>
        <div className="space-y-1.5">
          {[
            { name: "Corte + Barba", count: 98, revenue: "R$ 6.3k" },
            { name: "Corte Masculino", count: 112, revenue: "R$ 5.0k" },
            { name: "Barba", count: 74, revenue: "R$ 2.2k" },
          ].map((s) => (
            <div key={s.name} className="flex items-center justify-between p-1.5 rounded-lg bg-muted/30 dark:bg-white/[0.02]">
              <span className="text-[9px] font-medium text-foreground">{s.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-[8px] text-muted-foreground">{s.count}x</span>
                <span className="text-[9px] font-semibold text-primary">{s.revenue}</span>
              </div>
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
  crm: CRMMockup,
  reports: ReportsMockup,
  finance: FinanceMockup,
};

/* ─── Interactive 3D Phone ─── */
function InteractivePhone() {
  const phoneRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 2, y: -4 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * 5;
    setRotation({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotation({ x: 2, y: -4 });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="flex justify-center"
      style={{ perspective: "1200px" }}
      ref={phoneRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative"
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
          rotateZ: 0.5,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.5 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Ambient glow behind phone */}
        <div className="absolute -inset-12 bg-[radial-gradient(ellipse_at_center,hsl(152,55%,30%,0.12),transparent_65%)] blur-3xl pointer-events-none" />
        <div className="absolute -inset-16 bg-[radial-gradient(ellipse_at_bottom,hsl(270,40%,25%,0.08),transparent_65%)] blur-3xl pointer-events-none" />

        {/* Phone frame — titanium orange inspired */}
        <div className="relative w-[270px] sm:w-[300px] rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_-15px_rgba(0,0,0,0.7),0_10px_30px_-10px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]">
          {/* Outer titanium bezel with warm metallic gradient */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-[hsl(25,15%,22%)] via-[hsl(25,12%,14%)] to-[hsl(25,10%,9%)]" />
          
          {/* Metallic highlight streak */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] via-transparent to-transparent" />

          {/* Side button highlights */}
          <div className="absolute top-[85px] -right-[1px] w-[2px] h-[45px] bg-gradient-to-b from-[hsl(25,20%,40%,0.3)] via-[hsl(25,15%,25%,0.1)] to-transparent rounded-full" />
          <div className="absolute top-[65px] -left-[1px] w-[2px] h-[26px] bg-gradient-to-b from-[hsl(25,20%,40%,0.2)] via-transparent to-transparent rounded-full" />
          <div className="absolute top-[100px] -left-[1px] w-[2px] h-[40px] bg-gradient-to-b from-[hsl(25,20%,40%,0.2)] via-transparent to-transparent rounded-full" />

          {/* Inner bezel ring */}
          <div className="absolute inset-[2.5px] rounded-[2.2rem] border border-white/[0.04]" />

          {/* Screen area */}
          <div className="relative m-[7px] rounded-[2rem] overflow-hidden">
            {/* Dynamic Island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30">
              <div className="w-[80px] h-[22px] bg-black rounded-full flex items-center justify-center gap-2 shadow-[0_0_8px_2px_rgba(0,0,0,0.3)]">
                <div className="w-[7px] h-[7px] rounded-full bg-[hsl(240,12%,12%)] ring-1 ring-[hsl(240,12%,18%)]" />
              </div>
            </div>

            {/* Screen content */}
            <div className="aspect-[9/19.5]">
              <IPhoneLockScreen />
            </div>

            {/* Screen glare overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none rounded-[2rem]" />
          </div>
        </div>

        {/* Surface reflection */}
        <div className="absolute -bottom-8 left-6 right-6 h-16 bg-gradient-to-b from-primary/[0.04] to-transparent blur-2xl opacity-50 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Section ─── */
export function DemoSection() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setActiveTab((prev) => {
          const idx = tabs.findIndex((t) => t.id === prev);
          return tabs[(idx + 1) % tabs.length].id;
        });
      }
    }, 5000);
  }, [isPaused]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleTab = (id: string) => { setActiveTab(id); resetTimer(); };
  const ActiveMockup = mockups[activeTab];

  return (
    <section id="showcase" className="relative overflow-hidden scroll-mt-20 py-20 sm:py-28 lg:py-36">
      <div className="absolute inset-0 bg-secondary/40 dark:bg-[hsl(240,20%,3%)]" />

      {/* Glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/[0.03] dark:bg-[hsl(260,40%,40%,0.07)] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-primary/[0.02] dark:bg-[hsl(152,55%,40%,0.04)] blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/[0.03] dark:bg-[hsl(260,40%,40%,0.06)] blur-[120px]" />
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
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5 text-foreground"
          >
            Controle total. Na palma da mão.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Gerencie tudo pelo painel completo enquanto seus clientes recebem notificações em tempo real.
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
          <div className="inline-flex items-center gap-1 rounded-xl border border-border/50 dark:border-white/[0.08] bg-muted/40 dark:bg-white/[0.04] p-1 backdrop-blur-sm overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-white/[0.04]"
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
              <div key={tab.id} className="w-10 h-0.5 rounded-full bg-border/40 dark:bg-white/[0.08] overflow-hidden">
                {activeTab === tab.id && (
                  <motion.div
                    key={`progress-${tab.id}-${activeTab}`}
                    className="h-full bg-primary/60 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── MacBook (TOP) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="rounded-2xl border-2 border-border/60 dark:border-white/[0.08] bg-card dark:bg-[hsl(240,18%,6%)] shadow-2xl overflow-hidden ring-1 ring-border/20 dark:ring-white/[0.04]">
            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 border-b border-border/40 dark:border-white/[0.06] bg-muted/20 dark:bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-destructive/40" />
                <div className="h-3 w-3 rounded-full bg-warning/40" />
                <div className="h-3 w-3 rounded-full bg-primary/40" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="text-[10px] text-muted-foreground bg-muted/40 dark:bg-white/[0.04] rounded-lg px-5 py-1.5 border border-border/30 dark:border-white/[0.06] font-mono">
                  cutflow.app/dashboard
                </div>
              </div>
            </div>
            <div className="flex min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]">
              <Sidebar activeTab={activeTab} />
              <div className="flex-1 flex flex-col min-w-0">
                <TopBar />
                <div className="flex-1 bg-background dark:bg-[hsl(240,16%,7%)] overflow-hidden overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
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
          <p className="text-center text-[11px] text-muted-foreground mt-3 font-medium">
            Painel administrativo — Visão do dono
          </p>
        </motion.div>

        {/* ─── Cinematic iPhone Showcase ─── */}
        <div className="relative mt-20 sm:mt-28 lg:mt-36">
          {/* Deep backdrop - theme aware */}
          <div className="absolute inset-0 -mx-5 sm:-mx-6 lg:-mx-8 -my-16 bg-[hsl(240,20%,3%)] dark:bg-[hsl(240,20%,3%)] rounded-3xl overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,hsl(152,55%,30%,0.08),transparent_60%)] blur-[60px]" />
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[radial-gradient(ellipse,hsl(270,40%,30%,0.06),transparent_60%)] blur-[80px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[radial-gradient(ellipse,hsl(152,55%,30%,0.05),transparent_60%)] blur-[60px]" />
          </div>

          <div className="relative py-16 sm:py-20 lg:py-24">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-14"
            >
              <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-[-0.02em] mb-3">
                Seus clientes recebem tudo no celular
              </h3>
              <p className="text-sm sm:text-base text-white/40 max-w-md mx-auto leading-relaxed">
                Notificações em tempo real direto na tela de bloqueio. Sem app, sem atrito.
              </p>
            </motion.div>

            {/* Phone with interactive 3D mouse tracking */}
            <InteractivePhone />

            {/* Caption */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-center text-[11px] text-white/25 mt-8 font-medium tracking-wide"
            >
              Tela de bloqueio — Experiência do cliente
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
