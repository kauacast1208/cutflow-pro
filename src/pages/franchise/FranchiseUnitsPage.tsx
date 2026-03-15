import { useState } from "react";
import { useFranchise } from "@/hooks/useFranchise";
import { Building2, MapPin, Phone, Globe, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay: i * 0.06 },
});

export default function FranchiseUnitsPage() {
  const { units, selectUnit } = useFranchise();

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Unidades
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {units.length} unidade{units.length !== 1 ? "s" : ""} cadastrada{units.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Nova unidade
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {units.map((unit, i) => (
          <motion.div key={unit.id} {...fadeUp(i)}
            className="rounded-2xl border border-border/80 bg-card p-5 hover:shadow-card-hover transition-all duration-200 cursor-pointer"
            onClick={() => selectUnit(unit.id)}
          >
            <div className="flex items-start gap-3 mb-4">
              {unit.logo_url ? (
                <img src={unit.logo_url} alt={unit.name} className="h-12 w-12 rounded-xl object-cover border border-border/40" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-foreground truncate">{unit.name}</h3>
                <Badge variant="secondary" className="text-[9px] mt-1">
                  {unit.slug}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              {unit.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{unit.address}{unit.address_complement ? `, ${unit.address_complement}` : ""}</span>
                </div>
              )}
              {unit.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span>{unit.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="font-mono text-[11px]">/b/{unit.slug}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Horário</span>
              <span className="text-xs font-medium text-foreground">
                {unit.opening_time?.slice(0, 5)} - {unit.closing_time?.slice(0, 5)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-16">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-foreground">Nenhuma unidade cadastrada</p>
          <p className="text-sm text-muted-foreground mt-1">Crie sua primeira unidade para começar.</p>
        </div>
      )}
    </div>
  );
}
