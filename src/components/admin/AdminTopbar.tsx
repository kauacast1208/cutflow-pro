import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "react-router-dom";

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

  const pageLabel = routeLabels[location.pathname] || "";
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 sm:h-16 flex items-center justify-between border-b border-border/60 px-3 sm:px-6 bg-card/80 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors shrink-0" />
        <div className="h-4 w-px bg-border/60 hidden sm:block" />
        <h1
          className="text-sm sm:text-lg font-semibold tracking-tight text-foreground truncate"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {barbershop?.name || "CutFlow"}
        </h1>
        {pageLabel && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 hidden sm:block" />
            <span className="text-sm text-muted-foreground font-medium truncate hidden sm:block">{pageLabel}</span>
          </>
        )}
        {isTrial && daysRemaining !== null && (
          <Badge
            variant="secondary"
            className="hidden md:inline-flex text-[10px] font-medium bg-accent text-accent-foreground ml-1"
          >
            {daysRemaining}d restantes
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground transition-colors h-9 w-9"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </Button>
        {initials && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
