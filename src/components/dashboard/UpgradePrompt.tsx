import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import {
  planConfig,
  featureLabels,
  getMinPlanForFeature,
  type PlanFeature,
  type PlanTier,
} from "@/lib/plans";
import { formatCurrency } from "@/lib/format";

interface UpgradePromptProps {
  feature: PlanFeature | null;
  currentPlan: PlanTier;
  onClose: () => void;
}

export function UpgradePrompt({ feature, currentPlan, onClose }: UpgradePromptProps) {
  const navigate = useNavigate();

  if (!feature) return null;

  const minPlan = getMinPlanForFeature(feature);
  const targetConfig = planConfig[minPlan];
  const featureLabel = featureLabels[feature];

  const handleUpgrade = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <Dialog open={!!feature} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Upgrade necessário</DialogTitle>
        </DialogHeader>
        <div className="text-center py-4">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
            <Crown className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-xl font-bold mb-2">Recurso Premium</h2>
          <p className="text-muted-foreground text-sm mb-6">
            <strong>{featureLabel}</strong> está disponível a partir do plano{" "}
            <span className="font-semibold text-foreground">{targetConfig.label}</span>.
          </p>

          <div className="rounded-xl border border-border bg-card p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">{targetConfig.label}</span>
              </div>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(targetConfig.price)}<span className="text-xs text-muted-foreground font-normal">/mês</span>
              </span>
            </div>
            <ul className="space-y-1.5">
              {targetConfig.features.slice(0, 6).map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {featureLabels[f]}
                </li>
              ))}
              {targetConfig.features.length > 6 && (
                <li className="text-xs text-muted-foreground/60 pl-3.5">
                  +{targetConfig.features.length - 6} recursos
                </li>
              )}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Agora não
            </Button>
            <Button className="flex-1 gap-2" onClick={handleUpgrade}>
              Fazer upgrade <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground/60 mt-3">
            Seu plano atual: {planConfig[currentPlan].label}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Inline upgrade banner for embedding in pages */
export function UpgradeBanner({
  feature,
  currentPlan,
}: {
  feature: PlanFeature;
  currentPlan: PlanTier;
}) {
  const navigate = useNavigate();
  const minPlan = getMinPlanForFeature(feature);
  const targetConfig = planConfig[minPlan];

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-accent/30 p-6 sm:p-8 text-center">
      <Crown className="h-10 w-10 text-amber-500 mx-auto mb-3" />
      <h3 className="text-lg font-bold mb-1">Recurso do plano {targetConfig.label}</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
        {featureLabels[feature]} não está incluído no seu plano atual ({planConfig[currentPlan].label}).
        Faça upgrade para desbloquear.
      </p>
      <Button onClick={() => navigate("/checkout")} className="gap-2">
        <Sparkles className="h-4 w-4" /> Ver planos a partir de {formatCurrency(targetConfig.price)}/mês
      </Button>
    </div>
  );
}
