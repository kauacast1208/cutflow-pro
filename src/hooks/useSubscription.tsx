import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbershop } from "./useBarbershop";
import { useAuth } from "./useAuth";

export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled" | "expired";
export type SubscriptionPlan = "starter" | "pro" | "premium";

export interface Subscription {
  id: string;
  barbershop_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_ends_at: string;
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export function useSubscription() {
  const { barbershop } = useBarbershop();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!barbershop) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .maybeSingle();
    setSubscription(data as Subscription | null);
    setLoading(false);
  }, [barbershop]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Sync with Stripe on mount and after checkout
  useEffect(() => {
    if (!user) return;

    const syncFromStripe = async () => {
      try {
        await supabase.functions.invoke("check-subscription");
        await fetchSubscription();
      } catch {
        // Silent fail - local data is still valid
      }
    };

    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setTimeout(syncFromStripe, 2000);
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      syncFromStripe();
    }

    const interval = setInterval(syncFromStripe, 60000);
    return () => clearInterval(interval);
  }, [user, fetchSubscription]);

  // ---------- Computed state helpers ----------

  const isTrialExpired = useMemo(() =>
    subscription?.status === "trial" &&
    new Date(subscription.trial_ends_at) < new Date(),
    [subscription]
  );

  const isTrial = useMemo(() =>
    subscription?.status === "trial" && !isTrialExpired,
    [subscription, isTrialExpired]
  );

  const isPastDue = useMemo(() =>
    subscription?.status === "past_due",
    [subscription]
  );

  const isCancelled = useMemo(() =>
    subscription?.status === "cancelled",
    [subscription]
  );

  const isCancelledButStillActive = useMemo(() =>
    subscription?.status === "cancelled" &&
    !!subscription?.current_period_end &&
    new Date(subscription.current_period_end) > new Date(),
    [subscription]
  );

  const isExpired = useMemo(() =>
    subscription?.status === "expired" || isTrialExpired,
    [subscription, isTrialExpired]
  );

  /** Whether the user can access the dashboard */
  const isActive = useMemo(() =>
    subscription?.status === "active" ||
    isTrial ||
    isCancelledButStillActive ||
    isPastDue, // past_due still allows access with warning
    [subscription, isTrial, isCancelledButStillActive, isPastDue]
  );

  const daysRemaining = useMemo(() => {
    if (subscription?.status === "trial") {
      return Math.max(0, Math.ceil(
        (new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ));
    }
    if (isCancelledButStillActive && subscription?.current_period_end) {
      return Math.max(0, Math.ceil(
        (new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ));
    }
    return null;
  }, [subscription, isCancelledButStillActive]);

  /** Human-readable status label */
  const statusLabel = useMemo(() => {
    if (isTrialExpired) return "Teste expirado";
    const labels: Record<SubscriptionStatus, string> = {
      trial: "Em teste",
      active: "Ativo",
      past_due: "Pagamento pendente",
      cancelled: isCancelledButStillActive ? "Cancelado (ativo até o fim do período)" : "Cancelado",
      expired: "Expirado",
    };
    return labels[subscription?.status || "trial"];
  }, [subscription, isTrialExpired, isCancelledButStillActive]);

  /** Status severity for UI coloring */
  const statusSeverity = useMemo((): "success" | "warning" | "error" | "info" => {
    if (subscription?.status === "active") return "success";
    if (isTrial) return "info";
    if (isPastDue || isCancelledButStillActive) return "warning";
    return "error";
  }, [subscription, isTrial, isPastDue, isCancelledButStillActive]);

  const refreshSubscription = useCallback(async () => {
    try {
      await supabase.functions.invoke("check-subscription");
      await fetchSubscription();
    } catch {
      // silent
    }
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    // State booleans
    isTrial,
    isTrialExpired,
    isActive,
    isPastDue,
    isCancelled,
    isCancelledButStillActive,
    isExpired,
    // Display helpers
    daysRemaining,
    statusLabel,
    statusSeverity,
    // Actions
    refreshSubscription,
  };
}
