import { User, Star, CheckCircle2, Shuffle } from "lucide-react";
import { getInitials } from "@/lib/format";

interface ProfessionalStepProps {
  professionals: any[];
  selectedPro: string | null;
  onSelect: (id: string) => void;
}

const ANY_PRO_ID = "__any__";

export function ProfessionalStep({ professionals, selectedPro, onSelect }: ProfessionalStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5">Escolha o profissional</h2>
      <p className="text-muted-foreground text-sm mb-7">Com quem voce quer ser atendido?</p>
      {professionals.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground rounded-2xl border border-dashed border-border bg-muted/30">
          <User className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Nenhum profissional disponivel</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Any professional option */}
          {professionals.length > 1 && (
            <button
              onClick={() => onSelect(ANY_PRO_ID)}
              className={`w-full flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                selectedPro === ANY_PRO_ID
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                  : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                selectedPro === ANY_PRO_ID
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-gradient-to-br from-primary/15 to-primary/5 text-primary"
              }`}>
                {selectedPro === ANY_PRO_ID ? <CheckCircle2 className="h-6 w-6" /> : <Shuffle className="h-6 w-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[15px]">Qualquer profissional</p>
                <p className="text-xs text-muted-foreground mt-0.5">Primeiro horario disponivel</p>
              </div>
            </button>
          )}

          {professionals.map((p) => {
            const isSelected = selectedPro === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className={`w-full flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                {p.avatar_url ? (
                  <img src={p.avatar_url} className={`h-14 w-14 rounded-2xl object-cover border shrink-0 ${isSelected ? "border-primary" : "border-border"}`} alt="" />
                ) : (
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "bg-gradient-to-br from-primary/15 to-primary/5 text-primary"
                  }`}>
                    {isSelected ? <CheckCircle2 className="h-6 w-6" /> : getInitials(p.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px]">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.role}</p>
                  {p.specialties && p.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.specialties.slice(0, 3).map((sp: string) => (
                        <span key={sp} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                          {sp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { ANY_PRO_ID };
