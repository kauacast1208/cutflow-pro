import { motion } from "framer-motion";
import { User, CheckCircle2, Shuffle, Star, Clock3 } from "lucide-react";
import { ProfessionalAvatar } from "@/components/shared/ProfessionalAvatar";

interface ProfessionalStepProps {
  professionals: any[];
  selectedPro: string | null;
  onSelect: (id: string) => void;
}

const ANY_PRO_ID = "__any__";

function getRatingLabel(professional: any) {
  const raw = professional?.rating_average ?? professional?.rating ?? professional?.avg_rating;
  const parsed = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
  return Number.isFinite(parsed) ? `${parsed.toFixed(1)} avaliacao` : "Avaliacao em breve";
}

export function ProfessionalStep({ professionals, selectedPro, onSelect }: ProfessionalStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Escolha seu profissional</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Se preferir, o sistema pode selecionar o primeiro horario livre para acelerar a reserva.
        </p>
      </div>

      <div className="grid gap-3">
        {professionals.length > 1 ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(ANY_PRO_ID)}
            className={`w-full rounded-[24px] border p-5 text-left transition-all duration-200 sm:p-6 ${
              selectedPro === ANY_PRO_ID
                ? "border-primary/30 bg-primary/[0.06] ring-2 ring-primary/15 shadow-[0_12px_30px_rgba(34,197,94,0.10)]"
                : "border-border/70 bg-background hover:border-primary/20 hover:bg-accent/20 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                selectedPro === ANY_PRO_ID ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
              }`}>
                {selectedPro === ANY_PRO_ID ? <CheckCircle2 className="h-6 w-6" /> : <Shuffle className="h-6 w-6" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold tracking-tight text-foreground">Primeiro disponivel</p>
                  <span className="rounded-full border border-primary/15 bg-primary/[0.06] px-2.5 py-1 text-[11px] font-semibold text-primary">
                    Mais rapido
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  O sistema escolhe quem tiver o melhor horario para sua reserva.
                </p>
              </div>
            </div>
          </motion.button>
        ) : null}

        {professionals.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-border bg-muted/20 px-6 py-16 text-center text-muted-foreground">
            <User className="mx-auto mb-4 h-10 w-10 opacity-25" />
            <p className="text-base font-semibold text-foreground">Nenhum profissional disponivel online</p>
            <p className="mt-2 text-sm">Esta agenda ainda nao publicou profissionais. Entre em contato com a barbearia para concluir a reserva.</p>
          </div>
        ) : (
          professionals.map((professional) => {
            const isSelected = selectedPro === professional.id;
            const specialty = professional.role || professional.specialties?.[0] || "Especialista da casa";

            return (
              <motion.button
                key={professional.id}
                type="button"
                whileTap={{ scale: 0.99 }}
                onClick={() => onSelect(professional.id)}
                className={`w-full rounded-[24px] border p-5 text-left transition-all duration-200 sm:p-6 ${
                  isSelected
                    ? "border-primary/30 bg-primary/[0.06] ring-2 ring-primary/15 shadow-[0_12px_30px_rgba(34,197,94,0.10)]"
                    : "border-border/70 bg-background hover:border-primary/20 hover:bg-accent/20 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-4">
                  <ProfessionalAvatar
                    name={professional.name}
                    avatarUrl={professional.avatar_url}
                    className={`h-16 w-16 rounded-[20px] border shadow-sm ${isSelected ? "border-primary/30" : "border-border/70"}`}
                    fallbackClassName={`rounded-[20px] text-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
                    imageClassName="object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-bold tracking-tight text-foreground">{professional.name}</p>
                      {professional.specialties?.length > 0 ? (
                        <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          {professional.specialties[0]}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">{specialty}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-2.5 py-1 font-medium text-secondary-foreground">
                        <Star className="h-3.5 w-3.5" />
                        {getRatingLabel(professional)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-2.5 py-1 font-medium text-secondary-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        Agenda online
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}

export { ANY_PRO_ID };
