import { Link } from "react-router-dom";
import { AlertTriangle, Clock, CreditCard, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { STRIPE_PLANS, type StripePlanKey } from "@/lib/stripe";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Contextual banner shown in the dashboard based on subscription state.
 * Only renders when there's something actionable to show.
 */
export default function SubscriptionBanner() {
  const {
    isTrial,
    isPastDue,
    isCancelledButStillActive,
    daysRemaining,
    subscription,
  } = useSubscription();

  const currentPlan = (subscription?.plan || "starter") as StripePlanKey;
  const planName = STRIPE_PLANS[currentPlan]?.name || currentPlan;

  // Active paid subscription — show plan info
  if (subscription?.status === "active" && subscription.current_period_end) {
    return (
      <div className="rounded-xl border bg-primary/5 border-primary/15 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 text-sm font-medium text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            Plano ativo: {planName} · Próxima cobrança:{" "}
            {format(new Date(subscription.current_period_end), "dd MMM yyyy", { locale: ptBR })}
          </span>
        </div>
        <Link to="/billing">
          <Button size="sm" variant="outline" className="rounded-lg text-xs h-8">
            Gerenciar plano
          </Button>
        </Link>
      </div>
    );
  }

  // Trial with days remaining
  if (isTrial && daysRemaining !== null) {
    const urgent = daysRemaining <= 2;
    return (
      <div className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-3 flex-wrap ${
        urgent
          ? "bg-destructive/5 border-destructive/20 text-destructive"
          : "bg-amber-500/5 border-amber-500/20 text-amber-700"
      }`}>
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            {daysRemaining === 0
              ? "Seu teste gratuito expira hoje!"
              : `Teste gratuito ativo · Expira em: ${
                  subscription?.trial_ends_at
                    ? format(new Date(subscription.trial_ends_at), "dd MMM yyyy", { locale: ptBR })
                    : `${daysRemaining} dias`
                }`}
          </span>
        </div>
        <Link to="/billing">
          <Button size="sm" variant={urgent ? "destructive" : "default"} className="rounded-lg text-xs h-8">
            <CreditCard className="h-3.5 w-3.5 mr-1" />
            Escolher plano
          </Button>
        </Link>
      </div>
    );
  }

  // Past due payment
  if (isPastDue) {
    return (
      <div className="rounded-xl border bg-destructive/5 border-destructive/20 px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 text-sm font-medium text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Pagamento pendente — atualize sua forma de pagamento para evitar interrupção.</span>
        </div>
        <Link to="/billing">
          <Button size="sm" variant="destructive" className="rounded-lg text-xs h-8">
            Atualizar pagamento
          </Button>
        </Link>
      </div>
    );
  }

  // Cancelled but still active
  if (isCancelledButStillActive && daysRemaining !== null) {
    return (
      <div className="rounded-xl border bg-muted/50 border-border px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>
            Assinatura cancelada — acesso ativo por mais {daysRemaining} dia{daysRemaining !== 1 ? "s" : ""}.
          </span>
        </div>
        <Link to="/billing">
          <Button size="sm" variant="outline" className="rounded-lg text-xs h-8">
            Reativar plano
          </Button>
        </Link>
      </div>
    );
  }

  return null;
}
