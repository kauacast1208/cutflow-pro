import { motion } from "framer-motion";
import { Calendar, BarChart3, Users, LayoutDashboard, Clock, TrendingUp, Star, Bell } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "reports", label: "Relatórios", icon: BarChart3 },
];

function DashboardMockup() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Agendamentos hoje", value: "12", icon: Calendar, color: "text-primary" },
          { label: "Clientes ativos", value: "248", icon: Users, color: "text-blue-600" },
          { label: "Faturamento mensal", value: "R$ 18.5k", icon: TrendingUp, color: "text-emerald-600" },
          { label: "Taxa de presença", value: "94%", icon: Star, color: "text-amber-500" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-background p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{m.label}</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold tracking-tight">{m.value}</p>
          </div>
        ))}
      </div>
      {/* Chart + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-background p-4">
          <p className="text-xs font-semibold mb-3">Faturamento semanal</p>
          <div className="flex items-end gap-1.5 h-24 sm:h-32">
            {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-md bg-primary/80 transition-all duration-500"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[9px] text-muted-foreground">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs font-semibold mb-3">Próximos horários</p>
          <div className="space-y-2.5">
            {[
              { time: "09:00", name: "João Silva", service: "Corte + Barba" },
              { time: "10:30", name: "Pedro Santos", service: "Corte" },
              { time: "11:00", name: "Lucas Oliveira", service: "Barba" },
            ].map((a) => (
              <div key={a.time} className="flex items-center gap-2.5 text-xs">
                <span className="font-mono text-muted-foreground text-[11px] w-10">{a.time}</span>
                <div className="h-6 w-0.5 rounded-full bg-primary/40" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.name}</p>
                  <p className="text-muted-foreground text-[10px]">{a.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgendaMockup() {
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00"];
  const professionals = ["Carlos", "Rafael", "André"];
  const appointments: Record<string, { col: number; label: string; span: number }> = {
    "09:00": { col: 0, label: "Corte + Barba", span: 2 },
    "10:00": { col: 1, label: "Corte Masculino", span: 1 },
    "11:00": { col: 2, label: "Barba", span: 1 },
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold">Terça-feira, 11 Mar 2026</p>
        <div className="flex gap-1">
          {professionals.map((p, i) => (
            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-background">{p}</span>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        {hours.map((hour) => {
          const apt = appointments[hour];
          return (
            <div key={hour} className="flex items-stretch gap-2 min-h-[36px]">
              <span className="text-[10px] font-mono text-muted-foreground w-10 pt-1 shrink-0">{hour}</span>
              <div className="flex-1 grid grid-cols-3 gap-1">
                {[0, 1, 2].map((col) => (
                  <div key={col} className={`rounded-lg border text-[10px] px-2 py-1.5 ${
                    apt && apt.col === col
                      ? "bg-primary/10 border-primary/30 text-foreground font-medium"
                      : "border-dashed border-border/50"
                  }`}>
                    {apt && apt.col === col ? apt.label : ""}
                  </div>
                ))}
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
    { name: "João Silva", visits: 12, last: "Hoje", tag: "VIP", tagColor: "bg-amber-100 text-amber-700" },
    { name: "Pedro Santos", visits: 8, last: "3 dias", tag: "Ativo", tagColor: "bg-emerald-100 text-emerald-700" },
    { name: "Lucas Oliveira", visits: 3, last: "2 sem", tag: "Novo", tagColor: "bg-blue-100 text-blue-700" },
    { name: "Rafael Costa", visits: 15, last: "1 sem", tag: "VIP", tagColor: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold">248 clientes ativos</p>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Bell className="h-3 w-3" />
          15 aniversariantes este mês
        </div>
      </div>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-4 gap-0 text-[10px] font-medium text-muted-foreground bg-muted/30 px-3 py-2 border-b border-border">
          <span>Cliente</span><span>Visitas</span><span>Último</span><span>Status</span>
        </div>
        {clients.map((c) => (
          <div key={c.name} className="grid grid-cols-4 gap-0 text-xs px-3 py-2.5 border-b border-border/50 last:border-0 items-center">
            <span className="font-medium truncate">{c.name}</span>
            <span className="text-muted-foreground">{c.visits}</span>
            <span className="text-muted-foreground">{c.last}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full w-fit font-medium ${c.tagColor}`}>{c.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsMockup() {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Faturamento mensal", value: "R$ 18.500" },
          { label: "Ticket médio", value: "R$ 65" },
          { label: "Taxa de retorno", value: "78%" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-background p-3 text-center">
            <p className="text-lg sm:text-xl font-bold">{m.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-background p-4">
        <p className="text-xs font-semibold mb-3">Ranking de profissionais</p>
        <div className="space-y-2.5">
          {[
            { name: "Carlos", revenue: "R$ 7.200", pct: 85 },
            { name: "Rafael", revenue: "R$ 6.100", pct: 72 },
            { name: "André", revenue: "R$ 5.200", pct: 61 },
          ].map((p, i) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground w-4">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.revenue}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/70" style={{ width: `${p.pct}%` }} />
                </div>
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
  reports: ReportsMockup,
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="max-w-5xl mx-auto"
        >
          {/* Browser window */}
          <div className="rounded-2xl border border-border/80 bg-card shadow-xl overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-border bg-muted/20">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/40" />
                <div className="h-2.5 w-2.5 rounded-full bg-primary/40" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="text-[11px] text-muted-foreground bg-background/60 rounded-md px-4 py-1 border border-border/50">
                  cutflow.app/dashboard
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex items-center gap-0.5 px-3 sm:px-4 pt-2 pb-0 border-b border-border bg-muted/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-background border border-border border-b-background text-foreground -mb-px"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content area */}
            <div className="min-h-[320px] sm:min-h-[380px] bg-muted/5">
              <ActiveMockup />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
