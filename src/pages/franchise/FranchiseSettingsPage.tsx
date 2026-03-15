import { useFranchise } from "@/hooks/useFranchise";
import { Settings, Building2 } from "lucide-react";

export default function FranchiseSettingsPage() {
  const { group, units } = useFranchise();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configurações do grupo de negócio</p>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Grupo</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted-foreground">Nome do grupo</label>
            <p className="text-sm font-medium text-foreground mt-0.5">{group?.name || "—"}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Total de unidades</label>
            <p className="text-sm font-medium text-foreground mt-0.5">{units.length}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-12 text-center">
        <Settings className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <p className="text-lg font-semibold text-foreground">Configurações avançadas em breve</p>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie branding do grupo, permissões por unidade e integrações centralizadas.
        </p>
      </div>
    </div>
  );
}
