import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, ArrowRight, Share2, Sparkles, X,
  Store, Scissors, UserCog, Clock, Link2, Copy, PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useToast } from "@/hooks/use-toast";
import { useOnboardingChecklist, type OnboardingStep } from "@/hooks/useOnboardingChecklist";

const stepIcons: Record<string, any> = {
  profile: Store,
  service: Scissors,
  professional: UserCog,
  availability: Clock,
  share_link: Link2,
};

export function OnboardingChecklist() {
  const { steps, loading, progress, allDone, dismissed, dismiss, refresh } = useOnboardingChecklist();
  const { barbershop } = useBarbershop();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (loading || dismissed) return null;

  const bookingUrl = barbershop
    ? `${window.location.origin}/b/${barbershop.slug}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    toast({ title: "Link copiado!", description: "Compartilhe com seus clientes." });
  };

  const handleStepClick = (step: OnboardingStep) => {
    if (step.id === "share_link") {
      copyLink();
      return;
    }
    if (step.route) {
      navigate(step.route);
    }
  };

  if (allDone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/20 p-6 sm:p-8 shadow-card overflow-hidden"
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <PartyPopper className="h-8 w-8 text-primary" />
          </motion.div>

          <div>
            <h3 className="text-xl font-bold">Parabéns!</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Sua barbearia já pode receber agendamentos online.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={copyLink}>
              <Share2 className="h-4 w-4" />
              Compartilhar meu link de agendamento
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 w-full sm:w-auto"
              onClick={() => window.open(bookingUrl, "_blank")}
            >
              Ver minha página
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Copy className="h-3 w-3" />
            <span className="font-mono text-[11px] select-all">{bookingUrl}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-6 shadow-card"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base">Configure sua barbearia</h3>
            <p className="text-xs text-muted-foreground">
              Complete os passos abaixo para começar a receber agendamentos
            </p>
          </div>
        </div>
        <span className="text-sm font-bold text-primary">{progress}%</span>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-2 mb-6" />

      {/* Steps */}
      <div className="space-y-2">
        <AnimatePresence>
          {steps.map((step, i) => {
            const Icon = stepIcons[step.id] || Circle;
            const isShareLink = step.id === "share_link";

            return (
              <motion.button
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleStepClick(step)}
                className={`w-full flex items-center gap-3 rounded-xl p-3.5 text-left transition-all group ${
                  step.completed
                    ? "bg-primary/5 border border-primary/10"
                    : "bg-secondary/50 border border-transparent hover:border-primary/20 hover:bg-accent/30"
                }`}
              >
                {/* Status icon */}
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    step.completed
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                  ) : (
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      step.completed ? "text-primary line-through opacity-70" : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                </div>

                {/* Action */}
                {!step.completed && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                )}
                {isShareLink && !step.completed && (
                  <Copy className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
