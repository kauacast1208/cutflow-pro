import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { STRIPE_PLANS } from "@/lib/stripe";
import {
  CreditCard, ExternalLink, Loader2, RefreshCw, Crown,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function SubscriptionManager() {
  const { subscription, loading, isActive, isTrialExpired, daysRemaining } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const syncSubscription = useCallback(async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      if (data?.subscribed) {
        toast({ title: "Assinatura sincronizada!", description: `Plano: ${data.plan}` });
      }
    } catch {
      // silent
    } finally {
      setSyncing(false);
    }
  }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      syncSubscription();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [syncSubscription]);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      
      // Handle trial/no-customer gracefully
      if (data?.error === "trial_no_customer" || data?.error === "no_subscription") {
        toast({
          title: "Plano em teste",
          description: data.message,
        });
        setPortalLoading(false);
        return;
      }
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Não foi possível abrir o portal.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const plan = subscription?.plan || "starter";
  const planInfo = STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS];
  const statusLabel: Record<string, string> = {
    trial: "Em teste",
    active: "Ativo",
    past_due: "Pagamento pendente",
    cancelled: "Cancelado",
    expired: "Expirado",
  };

  const statusColor: Record<string, string> = {
    trial: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    active: "bg-primary/10 text-primary border-primary/20",
    past_due: "bg-destructive/10 text-destructive border-destructive/20",
    cancelled: "bg-muted text-muted-foreground border-border",
    expired: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-base font-semibold text-foreground flex items-center gap-2"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <Crown className="h-4 w-4 text-primary" />
          Assinatura
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={syncSubscription}
          disabled={syncing}
          className="text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${syncing ? "animate-spin" : ""}`} />
          Sincronizar
        </Button>
      </div>

      <div className="space-y-4">
        {/* Plan info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Plano {planInfo?.name || plan}
            </p>
            <p className="text-xs text-muted-foreground">
              R${planInfo?.price || 0}/mês
            </p>
          </div>
          <Badge
            variant="outline"
            className={statusColor[subscription?.status || "trial"]}
          >
            {statusLabel[subscription?.status || "trial"]}
          </Badge>
        </div>

        {/* Trial info */}
        {subscription?.status === "trial" && daysRemaining !== null && (
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
            <p className="text-sm text-amber-700 font-medium">
              {isTrialExpired
                ? "Seu período de teste expirou."
                : `${daysRemaining} dia${daysRemaining !== 1 ? "s" : ""} restante${daysRemaining !== 1 ? "s" : ""} no teste gratuito.`}
            </p>
          </div>
        )}

        {/* Next billing */}
        {subscription?.current_period_end && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Próxima cobrança</span>
            <span className="font-medium text-foreground">
              {format(new Date(subscription.current_period_end), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            size="sm"
            className="rounded-xl flex-1 h-11 sm:h-9"
            onClick={() => navigate("/billing")}
          >
            <CreditCard className="h-4 w-4 mr-1.5" />
            {isActive && subscription?.status !== "trial" ? "Trocar plano" : "Assinar plano"}
          </Button>

          {subscription?.stripe_customer_id && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl flex-1 h-11 sm:h-9"
              onClick={openPortal}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-1.5" />
              )}
              Gerenciar no Stripe
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
