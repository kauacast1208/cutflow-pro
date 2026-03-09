import { Scissors, Clock, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface ServiceStepProps {
  services: any[];
  selectedService: string | null;
  onSelect: (id: string) => void;
}

export function ServiceStep({ services, selectedService, onSelect }: ServiceStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5">Escolha o serviço</h2>
      <p className="text-muted-foreground text-sm mb-7">Selecione o que você deseja.</p>
      {services.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground rounded-2xl border border-dashed border-border bg-muted/30">
          <Scissors className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhum serviço disponível</p>
          <p className="text-xs mt-1">Esta barbearia ainda não cadastrou serviços.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => {
            const isSelected = selectedService === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={`w-full flex items-center justify-between rounded-2xl border p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ${
                    isSelected ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground"
                  }`}>
                    {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Scissors className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-[15px]">{s.name}</p>
                    {s.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {s.duration_minutes} min
                    </p>
                  </div>
                </div>
                <span className={`font-extrabold text-base shrink-0 ml-3 ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {formatCurrency(Number(s.price))}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
