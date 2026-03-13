import { NavLink } from "@/components/ui/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Calendar, Users, UserCog, DollarSign, BarChart3,
  Settings, Scissors, LogOut, ExternalLink, Copy, Lock, Megaphone,
  Mail, UserPlus, Gift, Zap, UserX, Cake, Trophy, Heart, Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useUserRole } from "@/hooks/useUserRole";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import type { PlanFeature } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { STRIPE_PLANS } from "@/lib/stripe";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  feature?: PlanFeature;
  roles?: string[];
  group?: string;
}

const items: MenuItem[] = [
  { title: "Visão Geral", url: "/dashboard", icon: LayoutDashboard, group: "main" },
  { title: "Agenda", url: "/dashboard/agenda", icon: Calendar, feature: "agenda", group: "main" },
  { title: "Clientes", url: "/dashboard/clients", icon: Users, feature: "clients", roles: ["owner", "admin", "receptionist"], group: "main" },
  { title: "Profissionais", url: "/dashboard/professionals", icon: UserCog, roles: ["owner", "admin"], group: "main" },
  { title: "Serviços", url: "/dashboard/services", icon: Scissors, feature: "services", roles: ["owner", "admin"], group: "main" },
  { title: "Financeiro", url: "/dashboard/finance", icon: DollarSign, feature: "finance", roles: ["owner", "admin"], group: "main" },
  { title: "Relatórios", url: "/dashboard/reports", icon: BarChart3, feature: "basic_reports", roles: ["owner", "admin"], group: "main" },
  { title: "Visão geral", url: "/dashboard/marketing", icon: Megaphone, roles: ["owner", "admin"], group: "marketing" },
  { title: "Campanhas", url: "/dashboard/campaigns", icon: Mail, feature: "simple_campaigns", roles: ["owner", "admin"], group: "marketing" },
  { title: "Automações", url: "/dashboard/automations", icon: Zap, roles: ["owner", "admin"], group: "marketing" },
  { title: "Clientes Inativos", url: "/dashboard/inactive-clients", icon: UserX, roles: ["owner", "admin"], group: "marketing" },
  { title: "Aniversariantes", url: "/dashboard/birthdays", icon: Cake, roles: ["owner", "admin"], group: "marketing" },
  { title: "Indicações", url: "/dashboard/referrals", icon: Gift, roles: ["owner", "admin"], group: "marketing" },
  { title: "Fidelidade", url: "/dashboard/loyalty", icon: Trophy, roles: ["owner", "admin"], group: "marketing" },
  { title: "Retenção", url: "/dashboard/retention", icon: Heart, roles: ["owner", "admin"], group: "marketing" },
  { title: "Equipe", url: "/dashboard/team", icon: UserPlus, roles: ["owner", "admin"], group: "admin" },
  { title: "Configurações", url: "/dashboard/settings", icon: Settings, roles: ["owner", "admin"], group: "admin" },
];

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  professional: "Barbeiro",
  receptionist: "Recepção",
};

export default function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { barbershop } = useBarbershop();
  const { role } = useUserRole();
  const { signOut } = useAuth();
  const { subscription, isTrial, daysRemaining } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { can, showUpgrade } = usePlanPermissions();

  const bookingUrl = barbershop
    ? `${window.location.origin}/b/${barbershop.slug}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast({ title: "Link copiado!", description: "Compartilhe com seus clientes." });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const visibleItems = items.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  const mainItems = visibleItems.filter((i) => i.group === "main");
  const marketingItems = visibleItems.filter((i) => i.group === "marketing");
  const adminItems = visibleItems.filter((i) => i.group === "admin");

  const renderItem = (item: MenuItem) => {
    const hasAccess = !item.feature || can(item.feature);
    return (
      <SidebarMenuItem key={item.title + item.url}>
        <SidebarMenuButton asChild>
          {hasAccess ? (
            <NavLink
              to={item.url}
              end={item.url === "/dashboard"}
              className="hover:bg-sidebar-accent/50 transition-colors duration-150"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
            >
              <item.icon className="mr-2 h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ) : (
            <button
              onClick={() => item.feature && showUpgrade(item.feature)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-150"
            >
              <item.icon className="mr-2 h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.title}</span>
                  <Lock className="h-3 w-3 shrink-0" />
                </>
              )}
            </button>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroup = (label: string, groupItems: MenuItem[]) => {
    if (groupItems.length === 0) return null;
    return (
      <SidebarGroup key={label}>
        <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>{groupItems.map(renderItem)}</SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar-background">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <Scissors className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-sidebar-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            CutFlow
          </span>
        )}
      </div>

      <SidebarContent className="py-2">
        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 pt-1 pb-2">
            <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
              {roleLabels[role] || role}
            </Badge>
          </div>
        )}

        {renderGroup("Principal", mainItems)}
        {renderGroup("Marketing", marketingItems)}
        {renderGroup("Administração", adminItems)}

        {/* Booking link */}
        {!collapsed && barbershop && (role === "owner" || role === "admin") && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
              Link de agendamento
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 space-y-2">
                <div className="text-[11px] text-muted-foreground bg-muted/60 rounded-lg p-2.5 break-all font-mono leading-relaxed">
                  {bookingUrl}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs h-7" onClick={copyLink}>
                    <Copy className="h-3 w-3 mr-1" /> Copiar
                  </Button>
                  <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-7">
                      <ExternalLink className="h-3 w-3 mr-1" /> Abrir
                    </Button>
                  </a>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Plan & Trial Info */}
      {!collapsed && subscription && (
        <div className="border-t border-sidebar-border px-3 py-3">
          <div className="rounded-xl bg-sidebar-accent/50 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Plano</span>
              {isTrial && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[9px] px-1.5 py-0">
                  Teste
                </Badge>
              )}
            </div>
            <p className="text-sm font-bold text-sidebar-foreground">
              {STRIPE_PLANS[(subscription.plan as keyof typeof STRIPE_PLANS)]?.name || subscription.plan}
            </p>
            {isTrial && daysRemaining !== null && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600">
                <Clock className="h-3 w-3" />
                <span>{daysRemaining} dia{daysRemaining !== 1 ? "s" : ""} restante{daysRemaining !== 1 ? "s" : ""}</span>
              </div>
            )}
            {isTrial && (
              <Button size="sm" variant="default" className="w-full h-8 text-xs rounded-lg mt-1" onClick={() => navigate("/billing")}>
                Ativar plano
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <SidebarMenuButton asChild>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full transition-colors duration-150"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </SidebarMenuButton>
      </div>
    </Sidebar>
  );
}
