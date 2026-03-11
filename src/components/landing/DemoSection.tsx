import { motion, AnimatePresence } from "framer-motion";
import { Calendar, BarChart3, Users, LayoutDashboard, TrendingUp, Star, Bell, Search, Settings, ChevronRight, Scissors, Clock, CheckCircle2, ArrowUpRight, Globe, MapPin, Phone, Check } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "booking", label: "Agendamento", icon: Globe },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: Calendar, label: "Agenda", active: false },
  { icon: Users, label: "Clientes", active: false },
  { icon: Scissors, label: "Serviços", active: false },
  { icon: BarChart3, label: "Relatórios", active: false },
  { icon: Settings, label: "Configurações", active: false },
];

function Sidebar({ activeTab }: { activeTab: string }) {
  const activeMap: Record<string, string> = {
    dashboard: "Dashboard",
    agenda: "Agenda",
    clients: "Clientes",
    reports: "Relatórios",
  };
  return (
    <div className="hidden lg:flex flex-col w-[180px] border-r border-border bg-muted/10 py-3 px-2 shrink-0">
      <div className="flex items-center gap-2 px-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
          <Scissors className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-xs font-bold">CutFlow</span>
      </div>
      <div className="space-y-0.5">
        {sidebarItems.map((item) => {
          const isActive = activeMap[activeTab] === item.label;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-border bg-background/80">
      <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-2.5 py-1.5 text-[10px] text-muted-foreground w-36 sm:w-48">
        <Search className="h-3 w-3 shrink-0" />
        <span>Buscar...</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-destructive" />
        </div>
        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
          CS
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="p-4 sm:p-5 space-y-4">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Bom dia, Carlos 👋</p>
          <p className="text-[10px] text-muted-foreground">Terça-feira, 11 de março de 2026</p>
        </div>
        <div className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Online
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: "Agendamentos hoje", value: "12", change: "+3", icon: Calendar, accent: "bg-primary/10 text-primary" },
          { label: "Clientes ativos", value: "248", change: "+18", icon: Users, accent: "bg-blue-50 text-blue-600" },
          { label: "Faturamento", value: "R$ 18.5k", change: "+12%", icon: TrendingUp, accent: "bg-emerald-50 text-emerald-600" },
          { label: "Presença", value: "94%", change: "+2%", icon: Star, accent: "bg-amber-50 text-amber-600" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-background p-3 group hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${m.accent}`}>
                <m.icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-[9px] font-medium text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="h-2.5 w-2.5" />{m.change}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold tracking-tight">{m.value}</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2.5">
        <div className="lg:col-span-3 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold">Faturamento semanal</p>
            <span className="text-[9px] text-muted-foreground">Esta semana</span>
          </div>
          <div className="flex items-end gap-2 h-20 sm:h-28">
            {[40, 65, 50, 80, 70, 95, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                  className={`w-full rounded-md ${i === 5 ? "bg-primary" : "bg-primary/60"}`}
                />
                <span className="text-[8px] sm:text-[9px] text-muted-foreground font-medium">
                  {["S", "T", "Q", "Q", "S", "S", "D"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold">Próximos</p>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {[
              { time: "09:00", name: "João Silva", service: "Corte + Barba", color: "bg-primary" },
              { time: "10:30", name: "Pedro Santos", service: "Corte", color: "bg-blue-500" },
              { time: "11:00", name: "Lucas Oliveira", service: "Barba", color: "bg-amber-500" },
            ].map((a) => (
              <div key={a.time} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`h-8 w-1 rounded-full ${a.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium truncate">{a.name}</p>
                  <p className="text-[9px] text-muted-foreground">{a.service}</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgendaMockup() {
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];
  const professionals = [
    { name: "Carlos", color: "bg-primary" },
    { name: "Rafael", color: "bg-blue-500" },
    { name: "André", color: "bg-amber-500" },
  ];
  const appointments: Record<string, { col: number; label: string; client: string; duration: string }> = {
    "09:00": { col: 0, label: "Corte + Barba", client: "João Silva", duration: "45 min" },
    "09:00b": { col: 1, label: "Corte Masculino", client: "Pedro S.", duration: "30 min" },
    "10:00": { col: 1, label: "Corte + Barba", client: "Marcos L.", duration: "45 min" },
    "11:00": { col: 2, label: "Barba", client: "Lucas O.", duration: "20 min" },
    "11:00b": { col: 0, label: "Corte", client: "Rafael C.", duration: "30 min" },
  };

  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold">Ter, 11 Mar 2026</p>
          <span className="text-[9px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Hoje</span>
        </div>
        <div className="flex gap-1.5">
          {professionals.map((p) => (
            <div key={p.name} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-border bg-background">
              <div className={`h-1.5 w-1.5 rounded-full ${p.color}`} />
              <span className="hidden sm:inline">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-0.5">
        {hours.map((hour) => {
          const getApt = (h: string, col: number) => {
            const key1 = h;
            const key2 = h + "b";
            if (appointments[key1]?.col === col) return appointments[key1];
            if (appointments[key2]?.col === col) return appointments[key2];
            return null;
          };
          return (
            <div key={hour} className="flex items-stretch gap-2 min-h-[40px]">
              <span className="text-[10px] font-mono text-muted-foreground w-10 pt-2 shrink-0">{hour}</span>
              <div className="flex-1 grid grid-cols-3 gap-1">
                {[0, 1, 2].map((col) => {
                  const apt = getApt(hour, col);
                  return (
                    <div
                      key={col}
                      className={`rounded-lg border text-[10px] px-2 py-1.5 transition-colors ${
                        apt
                          ? `${professionals[col].color}/10 border-${professionals[col].color.replace("bg-", "")}/20 text-foreground`
                          : "border-dashed border-border/40"
                      }`}
                      style={apt ? {
                        backgroundColor: `hsl(var(--${col === 0 ? "primary" : col === 1 ? "primary" : "primary"}) / 0.08)`,
                        borderColor: `hsl(var(--${col === 0 ? "primary" : col === 1 ? "primary" : "primary"}) / 0.2)`,
                      } : undefined}
                    >
                      {apt && (
                        <>
                          <p className="font-medium truncate">{apt.label}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{apt.client} · {apt.duration}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClientsMockup() {
  const clients = [
    { name: "João Silva", visits: 12, last: "Hoje", tag: "VIP", tagClass: "bg-amber-50 text-amber-700 border-amber-200", revenue: "R$ 780" },
    { name: "Pedro Santos", visits: 8, last: "3 dias", tag: "Ativo", tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200", revenue: "R$ 520" },
    { name: "Lucas Oliveira", visits: 3, last: "2 sem", tag: "Novo", tagClass: "bg-blue-50 text-blue-700 border-blue-200", revenue: "R$ 195" },
    { name: "Rafael Costa", visits: 15, last: "1 sem", tag: "VIP", tagClass: "bg-amber-50 text-amber-700 border-amber-200", revenue: "R$ 975" },
    { name: "Marcos Lima", visits: 6, last: "5 dias", tag: "Ativo", tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200", revenue: "R$ 390" },
  ];

  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold">Clientes</p>
          <p className="text-[9px] text-muted-foreground">248 ativos · 32 VIP · 15 aniversariantes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg px-2 py-1 text-[9px] text-muted-foreground">
            <Search className="h-2.5 w-2.5" /> Buscar cliente...
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-5 gap-0 text-[9px] sm:text-[10px] font-semibold text-muted-foreground bg-muted/30 px-3 py-2 border-b border-border uppercase tracking-wider">
          <span className="col-span-1">Cliente</span><span>Visitas</span><span>Último</span><span>Receita</span><span>Status</span>
        </div>
        {clients.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-5 gap-0 text-[10px] sm:text-xs px-3 py-2 border-b border-border/40 last:border-0 items-center hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-1.5 col-span-1">
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">
                {c.name.split(" ").map(n => n[0]).join("")}
              </div>
              <span className="font-medium truncate">{c.name}</span>
            </div>
            <span className="text-muted-foreground">{c.visits}</span>
            <span className="text-muted-foreground">{c.last}</span>
            <span className="font-medium">{c.revenue}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full w-fit font-medium border ${c.tagClass}`}>{c.tag}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ReportsMockup() {
  return (
    <div className="p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">Relatórios — Março 2026</p>
        <span className="text-[9px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Este mês</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Faturamento", value: "R$ 18.500", change: "+12%", positive: true },
          { label: "Ticket médio", value: "R$ 65", change: "+R$ 5", positive: true },
          { label: "Taxa de retorno", value: "78%", change: "-2%", positive: false },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-background p-3">
            <p className="text-[9px] text-muted-foreground mb-1">{m.label}</p>
            <p className="text-base sm:text-lg font-bold">{m.value}</p>
            <span className={`text-[9px] font-medium flex items-center gap-0.5 mt-1 ${m.positive ? "text-emerald-600" : "text-destructive"}`}>
              <ArrowUpRight className={`h-2.5 w-2.5 ${!m.positive ? "rotate-90" : ""}`} />
              {m.change}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-[11px] font-semibold mb-3">Ranking de profissionais</p>
        <div className="space-y-3">
          {[
            { name: "Carlos", revenue: "R$ 7.200", clients: 42, pct: 85 },
            { name: "Rafael", revenue: "R$ 6.100", clients: 38, pct: 72 },
            { name: "André", revenue: "R$ 5.200", clients: 31, pct: 61 },
          ].map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                i === 0 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-medium">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground">{p.clients} clientes</span>
                    <span className="font-semibold">{p.revenue}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-primary/70"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingMockup() {
  const [step, setStep] = useState(0);

  const services = [
    { name: "Corte Masculino", price: "R$ 45", duration: "30 min", selected: true },
    { name: "Corte + Barba", price: "R$ 65", duration: "45 min", selected: false },
    { name: "Barba", price: "R$ 30", duration: "20 min", selected: false },
    { name: "Corte Infantil", price: "R$ 35", duration: "25 min", selected: false },
  ];

  const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00"];

  return (
    <div className="flex min-h-[340px] sm:min-h-[400px]">
      {/* Booking sidebar - barbershop info */}
      <div className="hidden lg:flex flex-col w-[200px] border-r border-border bg-muted/10 p-4 shrink-0">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <Scissors className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-sm font-bold mb-0.5">Barbearia Central</h3>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-3">
          <Star className="h-2.5 w-2.5 fill-warning text-warning" />
          4.9 · 248 avaliações
        </div>
        <div className="space-y-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>Rua Augusta, 1200 · SP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 shrink-0" />
            <span>(11) 99999-0000</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 shrink-0" />
            <span>Seg–Sáb · 09:00–20:00</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mt-auto pt-4 space-y-1.5">
          {["Serviço", "Profissional", "Data e hora", "Seus dados"].map((s, i) => (
            <div key={s} className={`flex items-center gap-2 text-[10px] ${
              i === step ? "text-primary font-semibold" : i < step ? "text-primary/50" : "text-muted-foreground"
            }`}>
              <div className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                i < step ? "bg-primary text-primary-foreground" : i === step ? "border-2 border-primary text-primary" : "border border-border"
              }`}>
                {i < step ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </div>
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Main booking content */}
      <div className="flex-1 p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="services" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <p className="text-xs font-semibold mb-1">Escolha o serviço</p>
              <p className="text-[10px] text-muted-foreground mb-3">Selecione o serviço desejado para continuar</p>
              <div className="space-y-2">
                {services.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setStep(1)}
                    className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      i === 0 ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        i === 0 ? "bg-primary/10" : "bg-muted/50"
                      }`}>
                        <Scissors className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium">{s.name}</p>
                        <p className="text-[9px] text-muted-foreground">{s.duration}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold">{s.price}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="professionals" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <p className="text-xs font-semibold mb-1">Escolha o profissional</p>
              <p className="text-[10px] text-muted-foreground mb-3">Corte Masculino · R$ 45 · 30 min</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "Carlos", specialty: "Corte & Barba" },
                  { name: "Rafael", specialty: "Degradê" },
                  { name: "André", specialty: "Barba" },
                ].map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setStep(2)}
                    className={`flex flex-col items-center rounded-xl border p-3 transition-all ${
                      i === 0 ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground mb-2">
                      {p.name[0]}
                    </div>
                    <p className="text-[11px] font-medium">{p.name}</p>
                    <p className="text-[9px] text-muted-foreground">{p.specialty}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="datetime" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <p className="text-xs font-semibold mb-1">Escolha a data e horário</p>
              <p className="text-[10px] text-muted-foreground mb-3">Corte Masculino · Carlos · 30 min</p>
              <p className="text-[10px] font-medium mb-2">Terça, 11 de março</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {times.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setStep(3)}
                    className={`rounded-lg border py-2 text-[11px] font-medium transition-all ${
                      i === 2 ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <div className="flex flex-col items-center text-center py-4 sm:py-8">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm font-bold mb-1">Agendamento confirmado!</p>
                <p className="text-[11px] text-muted-foreground mb-4">Você receberá uma confirmação por e-mail</p>
                <div className="rounded-xl border border-border bg-muted/20 p-4 text-left w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Serviço</span>
                    <span className="font-medium">Corte Masculino</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Profissional</span>
                    <span className="font-medium">Carlos</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-medium">11/03 às 10:00</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Valor</span>
                    <span className="font-bold text-primary">R$ 45</span>
                  </div>
                </div>
                <button onClick={() => setStep(0)} className="mt-4 text-[10px] text-primary font-medium hover:underline">
                  ← Ver novamente
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const mockups: Record<string, () => JSX.Element> = {
  dashboard: DashboardMockup,
  agenda: AgendaMockup,
  clients: ClientsMockup,
  reports: ReportsMockup,
  booking: BookingMockup,
};

export function DemoSection() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const ActiveMockup = mockups[activeTab];

  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 glow-bg opacity-30" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            O sistema
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5"
          >
            Conheça o CutFlow por dentro
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Explore as telas reais do sistema que vai transformar sua barbearia.
          </motion.p>
        </div>

        {/* Tab selector — pill style */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="max-w-5xl mx-auto"
        >
          {/* Browser window */}
          <div className="rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 border-b border-border bg-muted/20">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[hsl(0_70%_65%)]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[hsl(45_80%_60%)]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[hsl(140_50%_55%)]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="text-[10px] sm:text-[11px] text-muted-foreground bg-background/60 rounded-md px-4 py-1 border border-border/50 font-mono">
                  {activeTab === "booking" ? "cutflow.app/b/barbearia-central" : "cutflow.app/dashboard"}
                </div>
              </div>
            </div>

            {/* App content with sidebar */}
            <div className="flex min-h-[340px] sm:min-h-[400px]">
              <Sidebar activeTab={activeTab} />
              <div className="flex-1 flex flex-col min-w-0">
                <TopBar />
                <div className="flex-1 bg-muted/5 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ActiveMockup />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
