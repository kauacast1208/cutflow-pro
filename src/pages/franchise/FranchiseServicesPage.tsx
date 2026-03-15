import { useState, useEffect } from "react";
import { useFranchise } from "@/hooks/useFranchise";
import { supabase } from "@/integrations/supabase/client";
import { Scissors, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  category: string | null;
  active: boolean;
  barbershop_id: string;
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.06 },
});

export default function FranchiseServicesPage() {
  const { units, selectedUnit, isConsolidatedView } = useFranchise();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const activeUnits = selectedUnit ? [selectedUnit] : units;

  useEffect(() => {
    if (activeUnits.length === 0) {
      setServices([]);
      setLoading(false);
      return;
    }

    const ids = activeUnits.map(u => u.id);
    supabase
      .from("services")
      .select("*")
      .in("barbershop_id", ids)
      .eq("active", true)
      .order("name")
      .then(({ data }) => {
        setServices((data as Service[]) || []);
        setLoading(false);
      });
  }, [activeUnits]);

  const getUnitName = (bId: string) => units.find(u => u.id === bId)?.name || "—";

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Serviços
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {services.length} serviço{services.length !== 1 ? "s" : ""} ativo{services.length !== 1 ? "s" : ""}
          {isConsolidatedView ? " em todas as unidades" : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Serviço</th>
              {isConsolidatedView && <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Unidade</th>}
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preço</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duração</th>
            </tr>
          </thead>
          <tbody>
            {services.map((svc, i) => (
              <motion.tr key={svc.id} {...fadeUp(i)}
                className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{svc.name}</p>
                      {svc.category && <p className="text-xs text-muted-foreground">{svc.category}</p>}
                    </div>
                  </div>
                </td>
                {isConsolidatedView && (
                  <td className="px-4 py-3 text-xs text-muted-foreground">{getUnitName(svc.barbershop_id)}</td>
                )}
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  R$ {Number(svc.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">{svc.duration_minutes} min</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!loading && services.length === 0 && (
          <div className="text-center py-12">
            <Scissors className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum serviço encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
