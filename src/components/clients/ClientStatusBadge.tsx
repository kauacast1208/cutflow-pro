import { Badge } from "@/components/ui/badge";
import { Star, UserCheck, UserX, Users } from "lucide-react";

const config: Record<string, { label: string; icon: any; className: string }> = {
  vip: { label: "VIP", icon: Star, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  recurring: { label: "Recorrente", icon: Star, className: "bg-primary/10 text-primary border-primary/20" },
  inactive: { label: "Inativo", icon: UserX, className: "bg-destructive/10 text-destructive border-destructive/20" },
  regular: { label: "Regular", icon: UserCheck, className: "bg-muted text-muted-foreground border-border" },
  new: { label: "Novo", icon: Users, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
};

export function ClientStatusBadge({ type }: { type: string }) {
  const c = config[type] || config.regular;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`text-[10px] font-medium rounded-full gap-1 ${c.className}`}>
      <Icon className="h-3 w-3" /> {c.label}
    </Badge>
  );
}
