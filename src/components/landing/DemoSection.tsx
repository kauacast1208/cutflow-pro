import { motion, AnimatePresence } from "framer-motion";
import { Calendar, BarChart3, Users, LayoutDashboard, TrendingUp, Star, Bell, Search, Settings, ChevronRight, Scissors, Clock, CheckCircle2, ArrowUpRight, Globe, MapPin, Phone, Check } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
  { id: "booking", label: "Agendamento", icon: Globe },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Calendar, label: "Agenda" },
  { icon: Users, label: "Clientes" },
  { icon: Scissors, label: "Serviços" },
  { icon: BarChart3, label: "Relatórios" },
  { icon: Settings, label: "Configurações" },
];

function Sidebar({ activeTab }: { activeTab: string }) {
  const activeMap: Record<string, string> = {
    dashboard: "Dashboard",
    agenda: "Agenda",
    clients: "Clientes",
    reports: "Relatórios",
  };
  return (
    <div className="hidden lg:flex flex-col w-[180px] border-r border-white/[0.06] bg-white/[0.02] py-3 px-2 shrink-0">
      <div className="flex items-center gap-2 px-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Scissors className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-xs font-bold text-white">CutFlow</span>
      </div>
      <div className="space-y-0.5">
        {sidebarItems.map((item) => {
          const isActive = activeMap[activeTab] === item.label;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-white/40 hover:text-white/60"
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
    <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
      <div className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-2.5 py-1.5 text-[10px] text-white/30 w-36 sm:w-48 border border-white/[0.06]">
        <Search className="h-3 w-3 shrink-0" />
        <span>Buscar...</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Bell className="h-3.5 w-3.5 text-white/40" />
          <div className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </div>
        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[9px] font-bold text-emerald-400">
          CS
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Bom dia, Carlos 👋</p>
          <p className="text-[10px] text-white/40">Terça-feira, 11 de março de 2026</p>
        </div>
        <div className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium flex items-center gap-1 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" /> Online
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { label: "Agendamentos hoje", value: "12", change: "+3", icon: Calendar },
          { label: "Clientes ativos", value: "248", change: "+18", icon: Users },
          { label: "Faturamento", value: "R$ 18.5k", change: "+12%", icon: TrendingUp },
          { label: "Presença", value: "94%", change: "+2%", icon: Star },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-emerald-500/10">
                <m.icon className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-[9px] font-medium text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="h-2.5 w-2.5" />{m.change}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold tracking-tight text-white">{m.value}</p>
            <p className="text-[9px] sm:text-[10px] text-white/40 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2.5">
        <div className="lg:col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-white">Faturamento semanal</p>
            <span className="text-[9px] text-white/30">Esta semana</span>
          </div>
          <div className="flex items-end gap-2 h-20 sm:h-28">
            {[40, 65, 50, 80, 70, 95, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                  className={`w-full rounded-md ${i === 5 ? "bg-emerald-400" : "bg-emerald-500/50"}`}
                />
                <span className="text-[8px] sm:text-[9px] text-white/30 font-medium">
                  {["S", "T", "Q", "Q", "S", "S", "D"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-white">Próximos</p>
            <ChevronRight className="h-3 w-3 text-white/30" />
          </div>
          <div className="space-y-2">
            {[
              { time: "09:00", name: "João Silva", service: "Corte + Barba", color: "bg-emerald-400" },
              { time: "10:30", name: "Pedro Santos", service: "Corte", color: "bg-blue-400" },
              { time: "11:00", name: "Lucas Oliveira", service: "Barba", color: "bg-amber-400" },
            ].map((a) => (
              <div key={a.time} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                <div className={`h-8 w-1 rounded-full ${a.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-white truncate">{a.name}</p>
                  <p className="text-[9px] text-white/40">{a.service}</p>
                </div>
                <span className="font-mono text-[10px] text-white/30 shrink-0">{a.time}</span>
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
    { name: "Carlos", color: "bg-emerald-400" },
    { name: "Rafael", color: "bg-blue-400" },
    { name: "André", color: "bg-amber-400" },
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
          <p className="text-xs font-semibold text-white">Ter, 11 Mar 2026</p>
          <span className="text-[9px] text-white/40 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">Hoje</span>
        </div>
        <div className="flex gap-1.5">
          {professionals.map((p) => (
            <div key={p.name} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-white/60">
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
              <span className="text-[10px] font-mono text-white/30 w-10 pt-2 shrink-0">{hour}</span>
              <div className="flex-1 grid grid-cols-3 gap-1">
                {[0, 1, 2].map((col) => {
                  const apt = getApt(hour, col);
                  return (
                    <div
                      key={col}
                      className={`rounded-lg border text-[10px] px-2 py-1.5 transition-colors ${
                        apt
                          ? "border-emerald-500/20 bg-emerald-500/[0.08]"
                          : "border-dashed border-white/[0.06]"
                      }`}
                    >
                      {apt && (
                        <>
                          <p className="font-medium text-white truncate">{apt.label}</p>
                          <p className="text-[9px] text-white/40 truncate">{apt.client} · {apt.duration}</p>
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
    { name: "João Silva", visits: 12, last: "Hoje", tag: "VIP", tagClass: "bg-amber-500/10 text-amber-400 border-amber-500/20", revenue: "R$ 780" },
    { name: "Pedro Santos", visits: 8, last: "3 dias", tag: "Ativo", tagClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", revenue: "R$ 520" },
    { name: "Lucas Oliveira", visits: 3, last: "2 sem", tag: "Novo", tagClass: "bg-blue-500/10 text-blue-400 border-blue-500/20", revenue: "R$ 195" },
    { name: "Rafael Costa", visits: 15, last: "1 sem", tag: "VIP", tagClass: "bg-amber-500/10 text-amber-400 border-amber-500/20", revenue: "R$ 975" },
    { name: "Marcos Lima", visits: 6, last: "5 dias", tag: "Ativo", tagClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", revenue: "R$ 390" },
  ];

  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-white">Clientes</p>
          <p className="text-[9px] text-white/40">248 ativos · 32 VIP · 15 aniversariantes</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.04] rounded-lg px-2 py-1 text-[9px] text-white/30 border border-white/[0.06]">
          <Search className="h-2.5 w-2.5" /> Buscar cliente...
        </div>
      </div>
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="grid grid-cols-5 gap-0 text-[9px] sm:text-[10px] font-semibold text-white/40 bg-white/[0.03] px-3 py-2 border-b border-white/[0.06] uppercase tracking-wider">
          <span className="col-span-1">Cliente</span><span>Visitas</span><span>Último</span><span>Receita</span><span>Status</span>
        </div>
        {clients.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="grid grid-cols-5 gap-0 text-[10px] sm:text-xs px-3 py-2 border-b border-white/[0.04] last:border-0 items-center hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-1.5 col-span-1">
              <div className="h-5 w-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[8px] font-bold text-white/40 shrink-0">
                {c.name.split(" ").map(n => n[0]).join("")}
              </div>
              <span className="font-medium text-white truncate">{c.name}</span>
            </div>
            <span className="text-white/40">{c.visits}</span>
            <span className="text-white/40">{c.last}</span>
            <span className="font-medium text-white">{c.revenue}</span>
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
        <p className="text-xs font-semibold text-white">Relatórios — Março 2026</p>
        <span className="text-[9px] text-white/40 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">Este mês</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Faturamento", value: "R$ 18.500", change: "+12%", positive: true },
          { label: "Ticket médio", value: "R$ 65", change: "+R$ 5", positive: true },
          { label: "Taxa de retorno", value: "78%", change: "-2%", positive: false },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
            <p className="text-[9px] text-white/40 mb-1">{m.label}</p>
            <p className="text-base sm:text-lg font-bold text-white">{m.value}</p>
            <span className={`text-[9px] font-medium flex items-center gap-0.5 mt-1 ${m.positive ? "text-emerald-400" : "text-red-400"}`}>
              <ArrowUpRight className={`h-2.5 w-2.5 ${!m.positive ? "rotate-90" : ""}`} />
              {m.change}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
        <p className="text-[11px] font-semibold text-white mb-3">Ranking de profissionais</p>
        <div className="space-y-3">
          {[
            { name: "Carlos", revenue: "R$ 7.200", clients: 42, pct: 85 },
            { name: "Rafael", revenue: "R$ 6.100", clients: 38, pct: 72 },
            { name: "André", revenue: "R$ 5.200", clients: 31, pct: 61 },
          ].map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                i === 0 ? "bg-amber-500/15 text-amber-400" : "bg-white/[0.06] text-white/40"
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-medium text-white">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-white/30">{p.clients} clientes</span>
                    <span className="font-semibold text-white">{p.revenue}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-emerald-500/60"
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
      <div className="hidden lg:flex flex-col w-[200px] border-r border-white/[0.06] bg-white/[0.02] p-4 shrink-0">
        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
          <Scissors className="h-5 w-5 text-emerald-400" />
        </div>
        <h3 className="text-sm font-bold mb-0.5 text-white">Barbearia Central</h3>
        <div className="flex items-center gap-1 text-[10px] text-white/40 mb-3">
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
          4.9 · 248 avaliações
        </div>
        <div className="space-y-2 text-[10px] text-white/40">
          <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" /><span>Rua Augusta, 1200 · SP</span></div>
          <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0" /><span>(11) 99999-0000</span></div>
          <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 shrink-0" /><span>Seg–Sáb · 09:00–20:00</span></div>
        </div>
        <div className="mt-auto pt-4 space-y-1.5">
          {["Serviço", "Profissional", "Data e hora", "Seus dados"].map((s, i) => (
            <div key={s} className={`flex items-center gap-2 text-[10px] ${
              i === step ? "text-emerald-400 font-semibold" : i < step ? "text-emerald-500/40" : "text-white/30"
            }`}>
              <div className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                i < step ? "bg-emerald-500 text-white" : i === step ? "border-2 border-emerald-400 text-emerald-400" : "border border-white/20"
              }`}>
                {i < step ? <Check className="h-2.5 w-2.5" /> : i + 1}
              </div>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-5">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="services" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <p className="text-xs font-semibold mb-1 text-white">Escolha o serviço</p>
              <p className="text-[10px] text-white/40 mb-3">Selecione o serviço desejado para continuar</p>
              <div className="space-y-2">
                {services.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setStep(1)}
                    className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                      i === 0 ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-white/[0.06] hover:border-emerald-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${i === 0 ? "bg-emerald-500/10" : "bg-white/[0.04]"}`}>
                        <Scissors className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-white">{s.name}</p>
                        <p className="text-[9px] text-white/40">{s.duration}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-white">{s.price}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="professionals" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <p className="text-xs font-semibold mb-1 text-white">Escolha o profissional</p>
              <p className="text-[10px] text-white/40 mb-3">Corte Masculino · R$ 45 · 30 min</p>
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
                      i === 0 ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-white/[0.06] hover:border-emerald-500/20"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/40 mb-2">
                      {p.name[0]}
                    </div>
                    <p className="text-[11px] font-medium text-white">{p.name}</p>
                    <p className="text-[9px] text-white/40">{p.specialty}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="datetime" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <p className="text-xs font-semibold mb-1 text-white">Escolha a data e horário</p>
              <p className="text-[10px] text-white/40 mb-3">Corte Masculino · Carlos · 30 min</p>
              <p className="text-[10px] font-medium mb-2 text-white/60">Terça, 11 de março</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {times.map((t, i) => (
                  <button
                    key={t}
                    onClick={() => setStep(3)}
                    className={`rounded-lg border py-2 text-[11px] font-medium transition-all ${
                      i === 2 ? "border-emerald-500 bg-emerald-500 text-white" : "border-white/[0.08] text-white/60 hover:border-emerald-500/30"
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
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="text-sm font-bold mb-1 text-white">Agendamento confirmado!</p>
                <p className="text-[11px] text-white/40 mb-4">Você receberá uma confirmação por e-mail</p>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-left w-full max-w-xs space-y-2">
                  {[
                    ["Serviço", "Corte Masculino"],
                    ["Profissional", "Carlos"],
                    ["Data", "11/03 às 10:00"],
                    ["Valor", "R$ 45"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-[11px]">
                      <span className="text-white/40">{label}</span>
                      <span className={`font-medium ${label === "Valor" ? "text-emerald-400 font-bold" : "text-white"}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(0)} className="mt-4 text-[10px] text-emerald-400 font-medium hover:underline">
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

const activityNotifications = [
  { icon: Calendar, title: "Novo agendamento criado", shop: "Barbearia Prime", time: "agora", iconColor: "text-emerald-400" },
  { icon: CheckCircle2, title: "Cliente confirmou horário", shop: "Dom H Barber", time: "2 min atrás", iconColor: "text-emerald-400" },
  { icon: Clock, title: "Horário liberado às 19:00", shop: "Elite Barber", time: "agora", iconColor: "text-blue-400" },
  { icon: Bell, title: "Lembrete enviado no WhatsApp", shop: "Black Zone Barber", time: "3 min atrás", iconColor: "text-teal-400" },
  { icon: Calendar, title: "Novo horário disponível", shop: "Barbearia Central", time: "1 min atrás", iconColor: "text-purple-400" },
  { icon: Calendar, title: "Novo agendamento criado", shop: "Barber Club", time: "agora", iconColor: "text-emerald-400" },
  { icon: CheckCircle2, title: "Cliente confirmou horário", shop: "Studio Corte", time: "4 min atrás", iconColor: "text-emerald-400" },
];

function ActivityFeed() {
  const [visibleNotifs, setVisibleNotifs] = useState<number[]>([0, 1, 2]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const start = tick % activityNotifications.length;
    setVisibleNotifs([0, 1, 2].map((offset) => (start + offset) % activityNotifications.length));
  }, [tick]);

  return (
    <div className="flex flex-col gap-2.5">
      <AnimatePresence mode="popLayout">
        {visibleNotifs.map((idx, position) => {
          const notif = activityNotifications[idx];
          const Icon = notif.icon;
          return (
            <motion.div
              key={`${idx}-${tick}-${position}`}
              initial={{ opacity: 0, y: -20, x: 10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.92 }}
              transition={{ duration: 0.4, delay: position * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative"
            >
              {/* Glow */}
              <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-purple-500/20 via-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              
              <div className="relative rounded-xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] px-3.5 py-3 flex items-start gap-3 shadow-lg shadow-black/20">
                <div className={`mt-0.5 ${notif.iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white/90 leading-snug">{notif.title}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {notif.shop} <span className="text-white/20">— {notif.time}</span>
                  </p>
                </div>
                <span className="relative flex h-2 w-2 mt-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400/60" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <p className="text-[11px] text-white/30 mt-1 text-center lg:text-left">
        <span className="text-emerald-400 font-semibold">+2.400</span> agendamentos esta semana
      </p>
    </div>
  );
}

export function DemoSection() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveTab((prev) => {
        const currentIdx = tabs.findIndex((t) => t.id === prev);
        return tabs[(currentIdx + 1) % tabs.length].id;
      });
    }, 3000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    resetTimer();
  };

  const ActiveMockup = mockups[activeTab];

  return (
    <section id="showcase" className="relative overflow-hidden scroll-mt-20 py-20 sm:py-28 lg:py-36">
      {/* Premium dark background */}
      <div className="absolute inset-0 bg-[hsl(240,20%,4%)]" />

      {/* Purple/green glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left purple glow */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-purple-600/[0.07] blur-[120px]" />
        {/* Center green glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-emerald-500/[0.05] blur-[100px]" />
        {/* Bottom-right purple glow */}
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-purple-500/[0.06] blur-[120px]" />

        {/* Subtle curved glow lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.04]" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-100 400C200 200 400 600 700 300S1100 500 1300 200" stroke="url(#glow1)" strokeWidth="1.5" />
          <path d="M-100 500C300 300 500 700 800 400S1200 600 1400 300" stroke="url(#glow2)" strokeWidth="1" />
          <defs>
            <linearGradient id="glow1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(270,70%,60%)" />
              <stop offset="50%" stopColor="hsl(160,60%,50%)" />
              <stop offset="100%" stopColor="hsl(270,70%,60%)" />
            </linearGradient>
            <linearGradient id="glow2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(160,60%,50%)" />
              <stop offset="100%" stopColor="hsl(270,70%,60%)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="max-w-7xl mx-auto relative px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 px-4 py-1.5 text-xs sm:text-sm font-medium text-emerald-400 mb-4 sm:mb-5"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Explore o sistema
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5 text-white"
          >
            Conheça o CutFlow por dentro
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Explore as telas reais do sistema que vai transformar sua barbearia.
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
          <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1 backdrop-blur-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
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
        <div className="flex justify-center mb-6">
          <div className="flex gap-1.5">
            {tabs.map((tab) => (
              <div key={tab.id} className="w-12 h-0.5 rounded-full bg-white/[0.08] overflow-hidden">
                {activeTab === tab.id && (
                  <motion.div
                    key={`progress-${tab.id}-${activeTab}`}
                    className="h-full bg-emerald-400/60 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Browser window + Activity feed */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="flex-1 min-w-0"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-[hsl(240,16%,8%)] shadow-2xl shadow-black/40 overflow-hidden ring-1 ring-white/[0.04]">
              {/* Title bar */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="text-[10px] sm:text-[11px] text-white/30 bg-white/[0.04] rounded-md px-4 py-1 border border-white/[0.06] font-mono">
                    {activeTab === "booking" ? "cutflow.app/b/barbearia-central" : "cutflow.app/dashboard"}
                  </div>
                </div>
              </div>

              {/* App content */}
              {activeTab === "booking" ? (
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
              ) : (
                <div className="flex min-h-[340px] sm:min-h-[400px]">
                  <Sidebar activeTab={activeTab} />
                  <div className="flex-1 flex flex-col min-w-0">
                    <TopBar />
                    <div className="flex-1 bg-[hsl(240,16%,7%)] overflow-hidden">
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
              )}
            </div>

            {/* Laptop base */}
            <div className="mx-auto w-[60%] h-3 bg-gradient-to-b from-white/[0.06] to-transparent rounded-b-xl" />
            <div className="mx-auto w-[75%] h-1.5 bg-white/[0.03] rounded-b-2xl" />
          </motion.div>

          {/* Activity notifications */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-[280px] xl:w-[300px] shrink-0 lg:pt-10"
          >
            <ActivityFeed />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
