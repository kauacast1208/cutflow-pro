import { motion } from "framer-motion";
import { Scissors, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface ServiceStepProps {
  services: any[];
  selectedServices: string[];
  onToggle: (id: string) => void;
}

export function ServiceStep({ services, selectedServices, onToggle }: ServiceStepProps) {
  const selectedObjects = services.filter((s) => selectedServices.includes(s.id));
  const totalDuration = selectedObjects.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalPrice = selectedObjects.reduce((sum, s) => sum + Number(s.price), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Escolha seus servicos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cards claros, tempo previsto e valor total para facilitar a decisao.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.05] px-3 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Etapa principal
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-border bg-muted/20 px-6 py-16 text-center text-muted-foreground">
          <Scissors className="mx-auto mb-4 h-10 w-10 opacity-25" />
          <p className="text-base font-semibold text-foreground">A barbearia esta configurando os servicos</p>
          <p className="mt-2 text-sm">Volte em breve ou entre em contato para reservar diretamente.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {services.map((service) => {
              const isSelected = selectedServices.includes(service.id);
              const categoryLabel = service.category || null;
              const isPopular = Boolean((service as any).popular || (service as any).featured);

              return (
                <motion.button
                  key={service.id}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => onToggle(service.id)}
                  className={`group w-full rounded-[24px] border p-5 text-left transition-all duration-200 sm:p-6 ${
                    isSelected
                      ? "border-primary/30 bg-primary/[0.06] shadow-[0_12px_30px_rgba(34,197,94,0.10)] ring-2 ring-primary/15"
                      : "border-border/70 bg-background hover:border-primary/20 hover:bg-accent/20 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ${
                        isSelected ? "bg-primary text-primary-foreground shadow-sm" : "bg-primary/10 text-primary"
                      }`}>
                        {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Scissors className="h-5 w-5" />}
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold tracking-tight text-foreground">{service.name}</p>
                          {categoryLabel ? (
                            <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                              {categoryLabel}
                            </span>
                          ) : null}
                          {isPopular ? (
                            <span className="rounded-full border border-primary/15 bg-primary/[0.06] px-2.5 py-1 text-[11px] font-semibold text-primary">
                              Popular
                            </span>
                          ) : null}
                        </div>

                        {service.description ? (
                          <p className="max-w-2xl text-sm text-muted-foreground">{service.description}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Atendimento profissional com horario reservado para voce.</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-2.5 py-1 font-medium text-secondary-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration_minutes} min
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-2.5 py-1 font-medium text-secondary-foreground">
                            <Scissors className="h-3.5 w-3.5" />
                            Equipe CutFlow
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xl font-extrabold tracking-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {formatCurrency(Number(service.price))}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">Valor estimado</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-primary/15 bg-primary/[0.05] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {selectedServices.length > 0
                    ? `${selectedServices.length} ${selectedServices.length === 1 ? "servico selecionado" : "servicos selecionados"}`
                    : "Selecione ao menos um servico"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedServices.length > 0
                    ? `${totalDuration} min previstos para sua reserva`
                    : "Monte sua reserva com total de tempo e valor sempre visiveis."}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-extrabold tracking-tight text-primary">{formatCurrency(totalPrice)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
