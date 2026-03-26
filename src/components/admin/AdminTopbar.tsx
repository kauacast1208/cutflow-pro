import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronRight, Plus, Search, Sparkles } from "lucide-react";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationPanel from "@/components/admin/NotificationPanel";
import { BarbershopLogo } from "@/components/shared/BarbershopLogo";

const routeLabels: Record<string, string> = {
  "/dashboard": "Visão Geral",
  "/dashboard/agenda": "Agenda",
  "/dashboard/clients": "Clientes",
  "/dashboard/professionals": "Profissionais",
  "/dashboard/services": "Serviços",
  "/dashboard/finance": "Financeiro",
  "/dashboard/reports": "Relatórios",
  "/dashboard/settings": "Configurações",
  "/dashboard/team": "Equipe",
  "/dashboard/marketing": "Marketing",
  "/dashboard/campaigns": "Campanhas",
  "/dashboard/automations": "Automações",
  "/dashboard/inactive-clients": "Clientes Inativos",
  "/dashboard/birthdays": "Aniversariantes",
  "/dashboard/referrals": "Indicações",
  "/dashboard/loyalty": "Fidelidade",
  "/dashboard/retention": "Retenção",
  "/dashboard/crm": "CRM",
};

export default function AdminTopbar() {
  const { barbershop } = useBarbershop();
  const { user } = useAuth();
  const { daysRemaining, subscription } = useSubscription();
  const isTrial = subscription?.status === "trial";
  const location = useLocation();
  const navigate = useNavigate();

  const pageLabel = routeLabels[location.pathname] || "";
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[linear-gradient(180deg,_hsl(218_34%_11%_/_0.95),_hsl(218_30%_10%_/_0.82))] px-3 sm:px-6 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between gap-3 sm:h-[72px]">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors shrink-0 h-10 w-10 sm:h-auto sm:w-auto flex items-center justify-center" />
        <div className="hidden h-5 w-px bg-white/10 sm:block" />
        <BarbershopLogo
          name={barbershop?.name}
          logoUrl={barbershop?.logo_url}
          className="hidden h-8 w-8 rounded-full border border-white/10 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)] sm:block"
          fallbackClassName="border-white/10 bg-white/5 text-[10px] text-emerald-300"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h1
              className="truncate text-sm font-semibold tracking-tight text-white sm:text-lg"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {barbershop?.name || "CutFlow"}
            </h1>
            {pageLabel && (
              <>
                <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-white/30 sm:block" />
                <span className="hidden truncate text-sm font-medium text-slate-300 sm:block">{pageLabel}</span>
              </>
            )}
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              <Sparkles className="h-3 w-3" />
              Executive View
            </span>
            {isTrial && daysRemaining !== null && (
              <Badge
                variant="secondary"
                className="border-0 bg-white/8 text-[10px] font-medium text-slate-300"
              >
                {daysRemaining}d restantes
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/dashboard/clients")}
          className="hidden h-10 rounded-2xl border-white/10 bg-white/5 px-3 text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-white/8 hover:text-white sm:flex"
        >
          <Search className="mr-2 h-4 w-4" />
          Buscar clientes
        </Button>
        <Button
          type="button"
          onClick={() => navigate("/dashboard/agenda")}
          className="hidden h-10 rounded-2xl border border-emerald-400/25 bg-[linear-gradient(135deg,_rgba(16,185,129,0.24),_rgba(15,118,110,0.18))] px-3 text-white shadow-[0_10px_32px_-18px_rgba(16,185,129,0.8)] hover:bg-[linear-gradient(135deg,_rgba(16,185,129,0.32),_rgba(15,118,110,0.22))] sm:flex"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo agendamento
        </Button>
        <NotificationPanel />
        {initials && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[11px] font-bold text-emerald-300 shadow-[0_8px_20px_-14px_rgba(0,0,0,0.9)] sm:h-10 sm:w-10">
            {initials}
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
