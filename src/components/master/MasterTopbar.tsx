import { SidebarTrigger } from "@/components/ui/sidebar";
import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";

const routeLabels: Record<string, string> = {
  "/master": "Visão Geral",
  "/master/tenants": "Clientes (Tenants)",
  "/master/users": "Usuários",
};

export default function MasterTopbar() {
  const { user } = useAuth();
  const location = useLocation();
  const pageLabel = routeLabels[location.pathname] || "";

  // Check if we're on a tenant detail page
  const tenantDetailMatch = location.pathname.match(/^\/master\/tenants\/(.+)/);
  const displayLabel = tenantDetailMatch ? "Detalhe do Cliente" : pageLabel;

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const initials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="h-14 sm:h-16 flex items-center justify-between border-b border-border/60 px-3 sm:px-6 bg-card/80 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors shrink-0" />
        <div className="h-4 w-px bg-border/60 hidden sm:block" />
        <Shield className="h-4 w-4 text-destructive shrink-0" />
        <h1 className="text-sm sm:text-lg font-semibold tracking-tight text-foreground truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Master Admin
        </h1>
        {displayLabel && (
          <>
            <span className="text-muted-foreground/40 hidden sm:block">›</span>
            <span className="text-sm text-muted-foreground font-medium truncate hidden sm:block">{displayLabel}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {initials && (
          <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center text-[11px] font-bold text-destructive shrink-0">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
