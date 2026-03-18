import { useState, useEffect } from "react";
import { useFranchise } from "@/hooks/useFranchise";
import { supabase } from "@/integrations/supabase/client";
import { UserCog, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface Professional {
  id: string;
  name: string;
  role: string | null;
  avatar_url: string | null;
  is_active: boolean;
  barbershop_id: string;
  specialties: string[] | null;
}

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.06 },
});

export default function FranchiseProfessionalsPage() {
  const { units, selectedUnit, isConsolidatedView } = useFranchise();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  const activeUnits = selectedUnit ? [selectedUnit] : units;

  useEffect(() => {
    if (activeUnits.length === 0) {
      setProfessionals([]);
      setLoading(false);
      return;
    }

    const ids = activeUnits.map(u => u.id);
    supabase
      .from("professionals")
      .select("*")
      .in("barbershop_id", ids)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setProfessionals((data as Professional[]) || []);
        setLoading(false);
      });
  }, [activeUnits]);

  const getUnitName = (bId: string) => units.find(u => u.id === bId)?.name || "—";

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Profissionais
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {professionals.length} profissional{professionals.length !== 1 ? "is" : ""} ativo{professionals.length !== 1 ? "s" : ""}
          {isConsolidatedView ? " em todas as unidades" : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {professionals.map((pro, i) => (
          <motion.div key={pro.id} {...fadeUp(i)}
            className="rounded-2xl border border-border/80 bg-card p-4 hover:shadow-card-hover transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src={pro.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {pro.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-foreground truncate">{pro.name}</h4>
                <p className="text-xs text-muted-foreground">{pro.role || "Barbeiro"}</p>
              </div>
            </div>
            {isConsolidatedView && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                <span>{getUnitName(pro.barbershop_id)}</span>
              </div>
            )}
            {pro.specialties && pro.specialties.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {pro.specialties.slice(0, 3).map(s => (
                  <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {!loading && professionals.length === 0 && (
        <div className="text-center py-16">
          <UserCog className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-foreground">Nenhum profissional encontrado</p>
        </div>
      )}
    </div>
  );
}
