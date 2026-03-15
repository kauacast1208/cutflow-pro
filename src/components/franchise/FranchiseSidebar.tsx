import { NavLink } from "@/components/ui/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Building2, Users, UserCog, Scissors, BarChart3,
  Settings, LogOut, MapPin, Calendar, DollarSign,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFranchise } from "@/hooks/useFranchise";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const mainItems = [
  { title: "Visão Consolidada", url: "/franquias", icon: LayoutDashboard },
  { title: "Unidades", url: "/franquias/units", icon: Building2 },
  { title: "Profissionais", url: "/franquias/professionals", icon: UserCog },
  { title: "Serviços", url: "/franquias/services", icon: Scissors },
  { title: "Financeiro", url: "/franquias/finance", icon: DollarSign },
  { title: "Relatórios", url: "/franquias/reports", icon: BarChart3 },
];

const adminItems = [
  { title: "Configurações", url: "/franquias/settings", icon: Settings },
];

export default function FranchiseSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { group, units, selectedUnit, selectUnit, isConsolidatedView } = useFranchise();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const renderItem = (item: { title: string; url: string; icon: any }) => (
    <SidebarMenuItem key={item.url}>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end={item.url === "/franquias"}
          className="hover:bg-sidebar-accent/50 transition-colors duration-150"
          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
        >
          <item.icon className="mr-2 h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar-background">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <Building2 className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-bold text-lg tracking-tight text-sidebar-foreground truncate block" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {group?.name || "Franquias"}
            </span>
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-semibold uppercase tracking-wide">
              Franquias
            </Badge>
          </div>
        )}
      </div>

      <SidebarContent className="py-2">
        {/* Unit Switcher */}
        {!collapsed && units.length > 0 && (
          <div className="px-3 py-2">
            <Select
              value={selectedUnit?.id || "all"}
              onValueChange={(v) => selectUnit(v === "all" ? null : v)}
            >
              <SelectTrigger className="h-9 text-xs rounded-xl">
                <SelectValue placeholder="Todas as unidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    Todas as unidades
                  </span>
                </SelectItem>
                {units.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {u.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{mainItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{adminItems.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick access to single unit dashboard */}
        {!collapsed && selectedUnit && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
              Acesso rápido
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Calendar className="mr-2 h-4 w-4 shrink-0" />
                      <span>Ir para agenda da unidade</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

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
