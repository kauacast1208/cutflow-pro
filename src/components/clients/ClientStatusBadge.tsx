import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Crown, Repeat, UserCheck, UserX } from "lucide-react";

const config: Record<string, { label: string; icon: any; className: string }> = {
  new: { label: "Novo", icon: UserCheck, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  recurring: { label: "Recorrente", icon: Repeat, className: "bg-primary/10 text-primary border-primary/20" },
  vip: { label: "VIP", icon: Crown, className: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  at_risk: { label: "Em risco", icon: AlertTriangle, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  inactive: { label: "Inativo", icon: UserX, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function ClientStatusBadge({ type }: { type: string }) {
  const c = config[type] || config.new;
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`text-[10px] font-medium rounded-full gap-1 ${c.className}`}>
      <Icon className="h-3 w-3" /> {c.label}
    </Badge>
  );
}
