import { Scissors, Clock, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface ServiceStepProps {
  services: any[];
  selectedServices: string[];
  onToggle: (id: string) => void;
}

export function ServiceStep({ services, selectedServices, onToggle }: ServiceStepProps) {
  const totalDuration = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + Number(s.price), 0);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1">Escolha os serviços</h2>
      <p className="text-muted-foreground text-sm mb-6">Selecione um ou mais serviços desejados.</p>
      {services.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border bg-muted/20">
          <Scissors className="h-8 w-8 mx-auto mb-3 opacity-25" />
          <p className="font-semibold text-sm">Esta barbearia ainda não adicionou serviços.</p>
          <p className="text-xs mt-1 text-muted-foreground/70">Entre em contato com a barbearia para mais informações.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {services.map((s) => {
              const isSelected = selectedServices.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => onToggle(s.id)}
                  className={`w-full flex items-center justify-between rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/[0.04] ring-2 ring-primary/15"
                      : "border-border bg-card hover:border-primary/20 hover:bg-accent/20"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Scissors className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm sm:text-[15px]">{s.name}</p>
                      {s.description && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>}
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {s.duration_minutes} min
                      </p>
                    </div>
                  </div>
                  <span className={`font-extrabold text-sm sm:text-base shrink-0 ml-3 ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {formatCurrency(Number(s.price))}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedServices.length > 0 && (
            <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  {selectedServices.length} {selectedServices.length === 1 ? "serviço selecionado" : "serviços selecionados"}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {totalDuration} min no total
                </p>
              </div>
              <span className="font-extrabold text-lg text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
