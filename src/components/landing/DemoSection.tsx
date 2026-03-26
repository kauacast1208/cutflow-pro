import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, BarChart3, Users, LayoutDashboard, TrendingUp, Star, Bell, Search,
  Settings, ChevronRight, Scissors, Clock, CheckCircle2, ArrowUpRight,
  DollarSign, Heart, UserX, Gift, Target, Megaphone, Crown,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { IPhoneLockScreen } from "./IPhoneLockScreen";

/* Tab config (6 tabs) */
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
  const primaryItems = sidebarItems.slice(0, 4);
  const opsItems = sidebarItems.slice(4);
  return (
    <div className="hidden lg:flex w-[160px] shrink-0 flex-col border-r border-white/[0.06] bg-[linear-gradient(180deg,rgba(7,10,16,0.99),rgba(7,10,16,0.96)_28%,rgba(5,7,12,0.99))] px-2 py-2.5">
      <div className="rounded-[18px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] px-2.5 py-2.5 shadow-[0_8px_18px_rgba(2,6,23,0.16),inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,hsl(var(--primary)),rgba(34,197,94,0.72))] shadow-[0_10px_22px_rgba(22,163,74,0.22)]">
            <div className="absolute inset-[1px] rounded-[11px] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.03))]" />
            <Scissors className="relative h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">CutFlow</p>
            <p className="text-[9px] text-white/42">Control center</p>
          </div>
        </div>
        <div className="mt-3 rounded-[14px] border border-white/[0.06] bg-black/18 p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[8px] uppercase tracking-[0.22em] text-white/35">Studio pulse</p>
              <p className="text-[10px] font-semibold text-white/88">4 cadeiras em operacao</p>
            </div>
            <div className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-semibold text-primary">+18%</div>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-2.5 py-2">
            <div>
              <p className="text-[8px] uppercase tracking-[0.18em] text-white/30">Hoje</p>
              <p className="mt-1 text-[11px] font-semibold text-white/88">87 slots</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] uppercase tracking-[0.18em] text-white/30">No-show</p>
              <p className="mt-1 text-[11px] font-semibold text-white/88">3.2%</p>
            </div>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between rounded-xl border border-white/[0.05] bg-black/16 px-2.5 py-2">
          <div>
            <p className="text-[8px] uppercase tracking-[0.22em] text-white/35">Status</p>
            <p className="text-[9px] font-medium text-white/80">Operacao estavel</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.45)]" />
        </div>
      </div>
      <p className="mt-3.5 px-2 text-[8px] font-semibold uppercase tracking-[0.24em] text-white/28">Front office</p>
      <div className="mt-2 space-y-1">
        {primaryItems.map((item) => {
          const isActive = activeMap[activeTab] === item.label;
          return (
            <div
              key={item.label}
              className={`group relative flex items-center gap-2 overflow-hidden rounded-[14px] px-2.5 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                isActive
                  ? "border border-white/[0.08] bg-primary/[0.09] text-white shadow-[0_8px_18px_rgba(2,6,23,0.22)]"
                  : "border border-transparent text-white/52 hover:border-white/[0.06] hover:bg-white/[0.03] hover:text-white/82"
              }`}
            >
              {isActive && <div className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" />}
              <div className={`flex h-6.5 w-6.5 items-center justify-center rounded-lg border ${isActive ? "border-white/[0.08] bg-black/20" : "border-white/[0.04] bg-white/[0.02]"}`}>
                <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-white/55 group-hover:text-white/75"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px]">{item.label}</p>
                <p className="text-[8px] text-white/34">{item.label === "Dashboard" ? "Visao executiva" : item.label === "Agenda" ? "Operacao ao vivo" : item.label === "Clientes" ? "Base ativa" : "Relacionamento"}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3.5 px-2 text-[8px] font-semibold uppercase tracking-[0.24em] text-white/28">Back office</p>
      <div className="mt-2 space-y-1">
        {opsItems.map((item) => {
          const isActive = activeMap[activeTab] === item.label;
          return (
            <div
              key={item.label}
              className={`group flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-[10px] font-medium transition-all duration-200 ${
                isActive
                  ? "border-white/[0.08] bg-white/[0.06] text-white"
                  : "border-transparent bg-transparent text-white/48 hover:border-white/[0.04] hover:bg-white/[0.02] hover:text-white/75"
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${isActive ? "border-white/[0.08] bg-black/20" : "border-white/[0.04] bg-white/[0.02]"}`}>
                <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "text-white/52 group-hover:text-white/72"}`} />
              </div>
              <span className="truncate">{item.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-auto rounded-[18px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(14,18,27,0.96),rgba(10,13,20,0.9))] p-2.5 shadow-[0_8px_18px_rgba(2,6,23,0.16),inset_0_1px_0_rgba(255,255,255,0.03)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[8px] uppercase tracking-[0.22em] text-white/35">AI concierge</p>
            <p className="text-[10px] font-semibold text-white/88">12 reacoes sugeridas</p>
          </div>
          <div className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-semibold text-primary">Ativo</div>
        </div>
        <p className="mt-2 text-[8px] leading-relaxed text-white/50">Clientes VIP com 17 dias sem retorno. Campanha pronta.</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-[68%] rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(268_72%_66%))]" />
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex items-center justify-between gap-2.5 border-b border-white/[0.06] bg-[linear-gradient(180deg,rgba(14,17,24,0.92),rgba(11,14,20,0.82))] px-3 py-1.5 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="hidden xl:flex items-center gap-2 rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[linear-gradient(135deg,rgba(34,197,94,0.22),rgba(34,197,94,0.08))] text-primary">
            <LayoutDashboard className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/34">Workspace</p>
            <p className="text-[10px] font-semibold text-white/88">CutFlow Prime</p>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-2 rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[9px] text-white/52 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <Search className="h-3 w-3 shrink-0" />
          <span className="truncate">Buscar cliente ou agendamento</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-2 rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
          <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/55">Ao vivo</span>
        </div>
        <div className="hidden rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[8px] font-medium text-white/62 lg:block">11 mar 2026</div>
        <div className="relative flex h-7.5 w-7.5 items-center justify-center rounded-[14px] border border-white/[0.07] bg-white/[0.03] text-white/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <Bell className="h-3.5 w-3.5" />
          <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
        </div>
        <div className="flex items-center gap-2 rounded-[14px] border border-white/[0.07] bg-white/[0.03] px-2 py-1.5 shadow-[0_6px_14px_rgba(2,6,23,0.14)]">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/20 text-[9px] font-bold text-white">CS</div>
          <div className="hidden sm:block">
            <p className="text-[9px] font-semibold text-white/90">Carlos Souza</p>
            <p className="text-[8px] text-white/45">Owner</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Dashboard */
function DashboardMockup() {
  const metrics = [
    { label: "Receita do dia", value: "R$ 8.420", sub: "76% da meta capturada ate agora", icon: TrendingUp, change: "+22%", tone: "from-primary/28 via-primary/12 to-transparent", accent: "text-primary" },
    { label: "Ocupacao", value: "91%", sub: "32 de 35 slots confirmados", icon: Calendar, change: "+9 pts", tone: "from-[rgba(139,92,246,0.22)] via-[rgba(139,92,246,0.08)] to-transparent", accent: "text-[hsl(268_72%_66%)]" },
    { label: "Clientes VIP", value: "18", sub: "5 prontos para reaceleracao", icon: Crown, change: "+6", tone: "from-white/16 via-white/[0.05] to-transparent", accent: "text-white" },
  ];
  const revenuePoints = "16,156 96,132 176,118 256,78 336,84 416,48 496,36";
  const demandPoints = "16,168 96,148 176,136 256,112 336,96 416,86 496,72";
  const flowBars = [
    { label: "Walk-in", value: "24%", height: "44%" },
    { label: "Online", value: "61%", height: "82%" },
    { label: "Retorno", value: "38%", height: "58%" },
    { label: "Upsell", value: "17%", height: "35%" },
  ];

  return (
    <div className="space-y-2.5 p-3 text-white">
      <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(139,92,246,0.06),transparent_30%),linear-gradient(180deg,rgba(16,20,30,0.98),rgba(8,11,18,0.96))] p-3.5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-[480px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1">
              <Star className="h-3.5 w-3.5 text-amber-300" />
              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-white/55">Executive command deck</span>
            </div>
            <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.05em] text-white">Carlos, sua operacao entra na janela mais lucrativa em 42 minutos.</h3>
            <p className="mt-2 text-[9px] leading-relaxed text-white/54">Receita projetada acima da media, fila premium aquecida e base VIP com alto potencial de reativacao. O painel abaixo prioriza crescimento de ticket, ocupacao e margem em uma unica leitura.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:w-[270px]">
            <div className="rounded-[18px] border border-primary/14 bg-[linear-gradient(180deg,rgba(34,197,94,0.12),rgba(34,197,94,0.035))] p-2.5 shadow-[0_8px_16px_rgba(34,197,94,0.07)]">
              <p className="text-[8px] uppercase tracking-[0.22em] text-white/42">Meta premium</p>
              <p className="mt-1 text-[18px] font-bold tracking-[-0.05em] text-white">R$ 18.9k</p>
              <p className="mt-1 text-[8px] text-primary">+14% acima do plano do dia</p>
            </div>
            <div className="rounded-[18px] border border-white/[0.07] bg-white/[0.028] p-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[8px] uppercase tracking-[0.22em] text-white/42">Alertas ativos</p>
                <Bell className="h-3.5 w-3.5 text-white/42" />
              </div>
              <p className="mt-1 text-[18px] font-bold tracking-[-0.05em] text-white">03</p>
              <p className="mt-1 text-[8px] text-white/52">2 upsells quentes e 1 risco de ociosidade</p>
            </div>
          </div>
        </div>

        <div className="mt-3.5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-[18px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-start justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-[16px] border border-white/[0.07] bg-gradient-to-br ${m.tone}`}>
                  <m.icon className={`h-4 w-4 ${m.accent}`} />
                </div>
                <span className="flex items-center gap-0.5 rounded-full border border-white/[0.07] bg-black/18 px-2 py-1 text-[8px] font-semibold text-primary">
                  <ArrowUpRight className="h-2.5 w-2.5" />
                  {m.change}
                </span>
              </div>
              <p className="mt-3 text-[8px] uppercase tracking-[0.22em] text-white/34">{m.label}</p>
              <p className="mt-1 text-[19px] font-bold tracking-[-0.05em] text-white">{m.value}</p>
              <p className="mt-1 text-[8px] leading-relaxed text-white/54">{m.sub}</p>
            </div>
          ))}
          <div className="rounded-[18px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[8px] uppercase tracking-[0.22em] text-white/42">Leverage score</p>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-[22px] font-bold tracking-[-0.07em] text-white">94</p>
            <p className="mt-1 text-[8px] leading-relaxed text-white/54">Equipe, mix e ocupacao no melhor alinhamento da semana.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-2 xl:grid-cols-[1.56fr_0.88fr]">
        <div className="rounded-[24px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.07),transparent_20%),linear-gradient(180deg,rgba(13,17,24,0.98),rgba(8,11,18,0.94))] p-3 shadow-[0_18px_38px_rgba(2,6,23,0.24)]">
          <div className="mb-2.5 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[8px] uppercase tracking-[0.28em] text-white/34">Performance cockpit</p>
              <p className="mt-1 text-[15px] font-semibold tracking-[-0.04em] text-white">Receita, demanda e margem em escala executiva</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-primary/16 bg-primary/10 px-2.5 py-1 text-[8px] font-semibold text-primary">Forecast +27%</span>
              <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[8px] text-white/56">Agora</span>
            </div>
          </div>

          <div className="grid gap-2.5 lg:grid-cols-[1.52fr_0.72fr]">
            <div className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.042),rgba(255,255,255,0.015))] px-3.5 py-3">
              <div className="absolute -left-10 top-4 h-24 w-24 rounded-full bg-primary/7 blur-3xl" />
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[hsl(268_72%_66%/.06)] blur-3xl" />
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.22em] text-white/34">Gross revenue runway</p>
                  <p className="mt-1 text-[24px] font-bold tracking-[-0.06em] text-white">R$ 24.900</p>
                  <p className="mt-1 text-[8px] text-white/46">Melhor leitura dos ultimos 90 dias com margem premium em alta.</p>
                </div>
                <div className="rounded-[18px] border border-white/[0.07] bg-black/18 px-3 py-2 text-right">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-white/34">Margem</p>
                  <p className="mt-1 text-[14px] font-semibold text-white">31.4%</p>
                  <p className="text-[8px] text-primary">+4.2 pts</p>
                </div>
              </div>
              <svg viewBox="0 0 512 236" className="relative z-10 mt-3 h-[186px] w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dashboardRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(34,197,94,0.32)" />
                    <stop offset="70%" stopColor="rgba(139,92,246,0.08)" />
                    <stop offset="100%" stopColor="rgba(139,92,246,0)" />
                  </linearGradient>
                  <linearGradient id="dashboardRevenueStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="rgba(110,231,183,0.88)" />
                    <stop offset="50%" stopColor="rgba(34,197,94,1)" />
                    <stop offset="100%" stopColor="rgba(168,85,247,0.58)" />
                  </linearGradient>
                </defs>
                {[26, 64, 102, 140, 178, 216].map((y) => (
                  <line key={y} x1="0" y1={y} x2="512" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                ))}
                {[42, 134, 226, 318, 410].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="236" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                ))}
                <polyline fill="url(#dashboardRevenueFill)" stroke="none" points={`${revenuePoints} 496,236 16,236`} />
                <polyline fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" strokeDasharray="6 7" strokeLinecap="round" strokeLinejoin="round" points={demandPoints} />
                <polyline fill="none" stroke="url(#dashboardRevenueStroke)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={revenuePoints} />
                <circle cx="496" cy="36" r="7" fill="rgba(34,197,94,1)" />
                <circle cx="496" cy="36" r="16" fill="rgba(34,197,94,0.14)" />
              </svg>
              <div className="relative z-10 mt-2.5 grid grid-cols-4 gap-1.5">
                {flowBars.map((bar) => (
                  <div key={bar.label} className="rounded-[14px] border border-white/[0.05] bg-black/16 px-2 py-1.5">
                    <div className="flex h-10 items-end">
                      <div className="w-full rounded-t-[14px] bg-[linear-gradient(180deg,rgba(34,197,94,0.98),rgba(34,197,94,0.48))]" style={{ height: bar.height }} />
                    </div>
                    <p className="mt-2 text-[8px] uppercase tracking-[0.18em] text-white/32">{bar.label}</p>
                    <p className="text-[10px] font-semibold text-white/88">{bar.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="rounded-[18px] border border-white/[0.07] bg-white/[0.028] p-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-white/92">Mix de servicos</p>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-semibold text-primary">High margin</span>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { label: "Corte + Barba Signature", value: "46%", width: "46%", tone: "bg-primary" },
                    { label: "Corte premium", value: "28%", width: "28%", tone: "bg-white/60" },
                    { label: "Barba executive", value: "18%", width: "18%", tone: "bg-white/35" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-[8px]">
                        <span className="text-white/46">{item.label}</span>
                        <span className="font-semibold text-white/86">{item.value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className={`h-full rounded-full ${item.tone}`} style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[18px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-2.5">
                <p className="text-[8px] uppercase tracking-[0.22em] text-white/34">Ticket premium</p>
                <p className="mt-1 text-[21px] font-bold tracking-[-0.05em] text-white">R$ 143</p>
                <p className="mt-1 text-[8px] leading-relaxed text-white/54">Clientes premium aceitam upgrade com 82% de conversao quando entram entre 11h e 13h.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="rounded-[24px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.06),transparent_32%),linear-gradient(180deg,rgba(15,18,27,0.98),rgba(8,11,18,0.92))] p-3 shadow-[0_18px_36px_rgba(2,6,23,0.22)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] uppercase tracking-[0.24em] text-white/34">Insight rail</p>
                <p className="mt-1 text-[13px] font-semibold text-white/92">Prioridades executivas</p>
              </div>
              <div className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-medium text-primary">Live</div>
            </div>

            <div className="mt-3 space-y-2">
              {[
                { title: "Janela de pico", desc: "11:30-13:00 com maior elasticidade de ticket e menor risco de ociosidade.", icon: TrendingUp, tone: "text-primary bg-primary/12" },
                { title: "VIP em risco", desc: "3 clientes premium sem retorno ha 19 dias. Campanha de recall recomendada.", icon: Crown, tone: "text-amber-300 bg-amber-300/12" },
                { title: "Equipe lider", desc: "Andre converte 32% dos upgrades e sustenta a maior margem da semana.", icon: Users, tone: "text-white bg-white/[0.08]" },
              ].map((item) => (
                <div key={item.title} className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[18px] ${item.tone}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-white/88">{item.title}</p>
                      <p className="mt-1 text-[8px] leading-relaxed text-white/46">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-[18px] border border-white/[0.06] bg-black/16 p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold text-white/92">Linha de frente</p>
                <ChevronRight className="h-3.5 w-3.5 text-white/35" />
              </div>
              <div className="space-y-1.5">
                {[
                  { time: "09:00", name: "Joao Silva", service: "Corte + Barba Signature", color: "bg-primary", meta: "VIP confirmado" },
                  { time: "10:30", name: "Pedro Santos", service: "Corte premium", color: "bg-[hsl(268_72%_66%)]", meta: "Upsell aberto" },
                  { time: "11:00", name: "Lucas Oliveira", service: "Barba executive", color: "bg-amber-300", meta: "Retorno em 21 dias" },
                ].map((a) => (
                  <div key={a.time} className="flex items-center gap-2.5 rounded-[16px] border border-white/[0.06] bg-white/[0.025] px-2.5 py-2">
                    <div className={`h-9 w-1 rounded-full ${a.color}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium text-white/88">{a.name}</p>
                      <p className="text-[8px] text-white/42">{a.service}</p>
                      <p className="text-[8px] text-white/28">{a.meta}</p>
                    </div>
                    <span className="font-mono text-[8px] text-white/40">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-[18px] border border-white/[0.06] bg-white/[0.03] p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold text-white/92">Conversao e retencao</p>
                <span className="text-[8px] font-medium text-primary">82%</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Confirmacoes premium", value: "31", width: "82%", tone: "bg-primary" },
                  { label: "Upsell executado", value: "12", width: "58%", tone: "bg-[hsl(268_72%_66%)]" },
                  { label: "Retorno previsto", value: "18", width: "74%", tone: "bg-emerald-300" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-[8px]">
                      <span className="text-white/42">{item.label}</span>
                      <span className="font-medium text-white/86">{item.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className={`h-full rounded-full ${item.tone}`} style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Agenda */
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

/* Clients */
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

/* CRM */
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

/* Reports with smooth chart */
function ReportsMockup() {
  const chartPath = "M 0 50 C 20 45, 30 25, 50 30 S 80 10, 100 15 S 130 5, 150 8 S 180 20, 200 14 S 225 10, 240 12";
  return (
    <div className="p-4 space-y-3 text-white">
      <p className="text-[11px] font-semibold text-white/92">Relatórios — Março 2026</p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Faturamento", value: "R$ 18.5k", change: "+12%" },
          { label: "Ticket médio", value: "R$ 65", change: "+R$ 5" },
          { label: "Retorno", value: "78%", change: "+3%" },
        ].map((m) => (
          <div key={m.label} className="rounded-[22px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(13,17,24,0.96),rgba(8,11,18,0.88))] p-2.5 shadow-[0_16px_34px_rgba(2,6,23,0.28)]">
            <p className="mb-0.5 text-[8px] uppercase tracking-[0.18em] text-white/34">{m.label}</p>
            <p className="text-sm font-bold text-white">{m.value}</p>
            <span className="text-[8px] font-medium text-primary">{m.change}</span>
          </div>
        ))}
      </div>
      <div className="rounded-[26px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_28%),linear-gradient(180deg,rgba(13,17,24,0.96),rgba(8,11,18,0.88))] p-3 shadow-[0_26px_56px_rgba(2,6,23,0.32)]">
        <p className="mb-2 text-[10px] font-semibold text-white/92">Faturamento semanal</p>
        <div className="relative h-[70px]">
          <svg viewBox="0 0 240 55" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(34,197,94,0.24)" />
                <stop offset="70%" stopColor="rgba(139,92,246,0.1)" />
                <stop offset="100%" stopColor="rgba(34,197,94,0)" />
              </linearGradient>
              <linearGradient id="reportLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(74,222,128,0.62)" />
                <stop offset="55%" stopColor="rgba(34,197,94,1)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0.88)" />
              </linearGradient>
            </defs>
            {[14, 28, 42].map((y) => (
              <line key={y} x1="0" y1={y} x2="240" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
            ))}
            <path d={`${chartPath} L 240 55 L 0 55 Z`} fill="url(#reportGrad)" />
            <path d={chartPath} fill="none" stroke="rgba(168,85,247,0.26)" strokeWidth="3" strokeLinecap="round" />
            <path d={chartPath} fill="none" stroke="url(#reportLine)" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="240" cy="12" r="2.5" fill="hsl(var(--primary))" />
            <circle cx="240" cy="12" r="7" fill="rgba(34,197,94,0.14)" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
              <span key={d} className="text-[7px] text-white/28">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Finance with premium Stripe-style chart */
function FinanceMockup() {
  const revenuePath = "M 0 55 C 15 50, 25 30, 40 35 S 65 15, 80 20 S 105 5, 120 10 S 145 25, 160 18 S 185 8, 200 12 S 225 20, 240 15";
  const appointmentsPath = "M 0 45 C 15 42, 25 38, 40 40 S 65 30, 80 28 S 105 22, 120 25 S 145 32, 160 28 S 185 18, 200 22 S 225 28, 240 24";
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="p-4 space-y-3 text-white">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-white/92">Financeiro — Semana atual</p>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[9px] text-white/45">Semanal</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-[22px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(13,17,24,0.96),rgba(8,11,18,0.88))] p-2.5 shadow-[0_18px_36px_rgba(2,6,23,0.28)]">
          <p className="mb-0.5 text-[8px] uppercase tracking-[0.18em] text-white/34">Receita semanal</p>
          <p className="text-base font-extrabold text-white">R$ 4.820</p>
          <span className="text-[8px] font-medium text-primary">+12% vs semana anterior</span>
        </div>
        <div className="rounded-[22px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(13,17,24,0.96),rgba(8,11,18,0.88))] p-2.5 shadow-[0_18px_36px_rgba(2,6,23,0.28)]">
          <p className="mb-0.5 text-[8px] uppercase tracking-[0.18em] text-white/34">Atendimentos</p>
          <p className="text-base font-extrabold text-white">87</p>
          <span className="text-[8px] font-medium text-primary">+8 vs semana anterior</span>
        </div>
      </div>

      <div className="rounded-[26px] border border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.16),transparent_26%),linear-gradient(180deg,rgba(13,17,24,0.96),rgba(8,11,18,0.88))] p-3 shadow-[0_26px_56px_rgba(2,6,23,0.3)]">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-white/92">Receita & Atendimentos</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-4 rounded-full bg-primary" />
              <span className="text-[8px] text-white/42">Receita</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-4 rounded-full bg-purple-500/60" />
              <span className="text-[8px] text-white/42">Atend.</span>
            </div>
          </div>
        </div>
        <div className="relative h-[70px]">
          <svg viewBox="0 0 240 60" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(34,197,94,0.24)" />
                <stop offset="70%" stopColor="rgba(139,92,246,0.08)" />
                <stop offset="100%" stopColor="rgba(34,197,94,0)" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(74,222,128,0.62)" />
                <stop offset="50%" stopColor="rgba(34,197,94,1)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0.82)" />
              </linearGradient>
            </defs>
            {[15, 30, 45].map((y) => (
              <line key={y} x1="0" y1={y} x2="240" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
            ))}
            <path d={`${revenuePath} L 240 60 L 0 60 Z`} fill="url(#revenueGrad)" />
            <path d={revenuePath} fill="none" stroke="url(#lineGrad)" strokeWidth="1.5" strokeLinecap="round" />
            <path d={appointmentsPath} fill="none" stroke="hsl(270, 50%, 60%)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" strokeDasharray="3 2" />
            <circle cx="240" cy="15" r="2.5" fill="hsl(var(--primary))" />
            <circle cx="240" cy="15" r="5" fill="hsl(var(--primary))" opacity="0.15" />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
            {days.map((d) => (
              <span key={d} className="text-[7px] text-white/28">{d}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(13,17,24,0.96),rgba(8,11,18,0.88))] p-3 shadow-[0_20px_42px_rgba(2,6,23,0.3)]">
        <p className="mb-2 text-[10px] font-semibold text-white/92">Ranking — Profissionais</p>
        <div className="space-y-2">
          {[
            { name: "Carlos", appointments: 72, revenue: "R$ 7.2k", pct: 39 },
            { name: "Rafael", appointments: 58, revenue: "R$ 5.8k", pct: 31 },
            { name: "André", appointments: 55, revenue: "R$ 5.5k", pct: 30 },
          ].map((p, i) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="w-3 text-[8px] font-bold text-white/35">{i + 1}º</span>
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[7px] font-bold text-primary">{p.name[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-[9px] font-medium text-white/88">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[7px] text-white/42">{p.appointments} atend.</span>
                    <span className="text-[9px] font-semibold text-primary">{p.revenue}</span>
                  </div>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.pct * 2.5}%` }} />
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
  crm: CRMMockup,
  reports: ReportsMockup,
  finance: FinanceMockup,
};

/* Interactive 3D Phone */
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

        {/* Phone frame - titanium orange inspired */}
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

/* Main Section */
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

        {/* MacBook (TOP) */}
                <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="relative max-w-[72rem] mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute left-1/2 top-[11%] h-[66%] w-[76%] -translate-x-1/2 rounded-[4rem] bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.12),transparent_60%)] blur-[64px] pointer-events-none" />
          <div className="absolute left-1/2 top-[21%] h-[48%] w-[50%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08),transparent_70%)] blur-[78px] pointer-events-none" />
          <div className="relative mx-auto max-w-[67rem] px-2 sm:px-5">
            <div className="relative rounded-[1.75rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(58,61,68,0.9),rgba(28,31,36,0.95)_14%,rgba(12,15,20,0.98)_40%,rgba(7,9,14,1))] p-2 shadow-[0_24px_68px_rgba(0,0,0,0.38),0_12px_28px_rgba(0,0,0,0.18)] ring-1 ring-white/[0.04] sm:rounded-[2.2rem] sm:p-2.5">
              <div className="absolute inset-x-10 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.42),transparent)]" />
              <div className="overflow-hidden rounded-[1.3rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,12,18,0.98),rgba(6,8,13,1))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:rounded-[1.8rem]">
                <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[linear-gradient(180deg,rgba(17,20,28,0.94),rgba(12,15,21,0.88))] px-3.5 py-2">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#ff5f57]/80" />
                    <div className="h-2 w-2 rounded-full bg-[#febc2e]/80" />
                    <div className="h-2 w-2 rounded-full bg-primary/85" />
                  </div>
                  <div className="flex flex-1 justify-center">
                    <div className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1 font-mono text-[9px] text-white/48 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      cutflow.app/dashboard
                    </div>
                  </div>
                </div>
                <div className="flex min-h-[320px] bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.05),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.06),transparent_24%),linear-gradient(180deg,rgba(9,12,18,1),rgba(6,8,13,1))] sm:min-h-[360px] lg:min-h-[404px]">
                  <Sidebar activeTab={activeTab} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <TopBar />
                    <div className="flex-1 overflow-hidden overflow-y-auto bg-transparent">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 8, scale: 0.99 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.995 }}
                          transition={{ duration: 0.24, ease: "easeOut" }}
                        >
                          <ActiveMockup />
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto h-3.5 w-[55%] rounded-b-[1.1rem] bg-[linear-gradient(180deg,rgba(115,120,130,0.88),rgba(66,70,78,0.66)_40%,rgba(30,34,40,0.32))] shadow-[0_8px_18px_rgba(0,0,0,0.18)]" />
            <div className="mx-auto h-1.5 w-[69%] rounded-b-[2rem] bg-[linear-gradient(180deg,rgba(170,176,186,0.22),rgba(60,66,74,0.08))]" />
            <div className="mx-auto -mt-1 h-8 w-[48%] rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.22),transparent_72%)] blur-xl" />
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-3 font-medium">
            Painel administrativo - Visão do dono
          </p>
        </motion.div>

        {/* Cinematic iPhone Showcase */}
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
              Tela de bloqueio - Experiência do cliente
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}


