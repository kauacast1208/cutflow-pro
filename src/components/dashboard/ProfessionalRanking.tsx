import { useMemo } from "react";
import { Trophy, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfessionalRankingProps {
  appointments: any[];
}

export function ProfessionalRanking({ appointments }: ProfessionalRankingProps) {
  const ranking = useMemo(() => {
    const proMap = new Map<string, { name: string; count: number; revenue: number }>();

    const completed = appointments.filter((a) => a.status !== "cancelled");
    completed.forEach((a) => {
      const name = a.professionals?.name || "—";
      const existing = proMap.get(name) || { name, count: 0, revenue: 0 };
      existing.count++;
      existing.revenue += Number(a.price || 0);
      proMap.set(name, existing);
    });

    return Array.from(proMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [appointments]);

  if (ranking.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Trophy className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm">Sem dados de ranking ainda.</p>
      </div>
    );
  }

  const medals = ["1º", "2º", "3º"];

  return (
    <div className="space-y-3">
      {ranking.map((pro, i) => (
        <div key={pro.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
          <span className="text-sm font-bold w-8 text-center shrink-0 text-muted-foreground">
            {i < 3 ? medals[i] : <span className="text-xs text-muted-foreground font-mono">{i + 1}º</span>}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{pro.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {pro.count} atendimentos
              </span>
              <span className="text-xs text-success flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> R$ {pro.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
          {i === 0 && (
            <Badge className="bg-warning/10 text-warning border-warning/20 text-[10px]">Top</Badge>
          )}
        </div>
      ))}
    </div>
  );
}
