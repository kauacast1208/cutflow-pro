import { Link } from "react-router-dom";
import { AlertTriangle, Clock, CreditCard, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

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
              : `${daysRemaining} dia${daysRemaining !== 1 ? "s" : ""} restante${daysRemaining !== 1 ? "s" : ""} no teste gratuito`}
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
