import { NavLink } from "@/components/ui/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Building2, Users, LogOut, Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const items = [
  { title: "Visão Geral", url: "/master", icon: LayoutDashboard },
  { title: "Clientes (Tenants)", url: "/master/tenants", icon: Building2 },
  { title: "Usuários", url: "/master/users", icon: Users },
];

export default function MasterSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar-background">
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-xl bg-destructive flex items-center justify-center shrink-0 shadow-sm">
          <Shield className="h-4 w-4 text-destructive-foreground" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-sidebar-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            CutFlow Master
          </span>
        )}
      </div>

      <SidebarContent className="py-2">
        {!collapsed && (
          <div className="px-4 pt-1 pb-2">
            <Badge variant="destructive" className="text-[10px] font-semibold uppercase tracking-wide">
              Master Admin
            </Badge>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
            Plataforma
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/master"}
                      className="hover:bg-sidebar-accent/50 transition-colors duration-150"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

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
