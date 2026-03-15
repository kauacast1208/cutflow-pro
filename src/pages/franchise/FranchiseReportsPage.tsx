import { useFranchise } from "@/hooks/useFranchise";
import { BarChart3, Building2 } from "lucide-react";

export default function FranchiseReportsPage() {
  const { units, isConsolidatedView, selectedUnit } = useFranchise();

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Relatórios
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isConsolidatedView ? "Visão consolidada de todas as unidades" : selectedUnit?.name}
        </p>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-12 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <p className="text-lg font-semibold text-foreground">Relatórios em breve</p>
        <p className="text-sm text-muted-foreground mt-1">
          Relatórios consolidados por unidade, retenção por unidade e ranking de profissionais estarão disponíveis em breve.
        </p>
      </div>
    </div>
  );
}
