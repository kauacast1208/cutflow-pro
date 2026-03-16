import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbershop } from "./useBarbershop";
import { useAuth } from "./useAuth";
import { isNoRowsError } from "@/lib/tenant";

export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled" | "expired";
export type SubscriptionPlan = "starter" | "pro" | "premium" | "franquias";

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

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "Erro desconhecido ao verificar assinatura.";
}

export function useSubscription() {
  const { barbershop } = useBarbershop();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!barbershop) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("barbershop_id", barbershop.id)
      .maybeSingle();

    if (error && !isNoRowsError(error)) {
      console.warn("[Subscription] Failed to fetch subscription", error);
    }

    setSubscription((error && !isNoRowsError(error) ? null : data) as Subscription | null);
    setLoading(false);
  }, [barbershop]);

  const syncFromStripe = useCallback(async () => {
    if (!user || !barbershop) {
      setSyncError(null);
      return;
    }

    const { error } = await supabase.functions.invoke("check-subscription");

    if (error) {
      const message = getErrorMessage(error);
      setSyncError(message);
      console.error("[Subscription] check-subscription failed", { error });
      throw error;
    }

    setSyncError(null);
    await fetchSubscription();
  }, [user, barbershop, fetchSubscription]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (!user || !barbershop) {
      setSyncError(null);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      setTimeout(() => {
        void syncFromStripe().catch(() => undefined);
      }, 2000);
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      void syncFromStripe().catch(() => undefined);
    }

    const interval = setInterval(() => {
      void syncFromStripe().catch(() => undefined);
    }, 60000);

    return () => clearInterval(interval);
  }, [user, barbershop, syncFromStripe]);

  const isTrialExpired = useMemo(
    () => subscription?.status === "trial" && new Date(subscription.trial_ends_at) < new Date(),
    [subscription],
  );

  const isTrial = useMemo(
    () => subscription?.status === "trial" && !isTrialExpired,
    [subscription, isTrialExpired],
  );

  const isPastDue = useMemo(() => subscription?.status === "past_due", [subscription]);

  const isCancelled = useMemo(() => subscription?.status === "cancelled", [subscription]);

  const isCancelledButStillActive = useMemo(
    () =>
      subscription?.status === "cancelled" &&
      !!subscription?.current_period_end &&
      new Date(subscription.current_period_end) > new Date(),
    [subscription],
  );

  const isExpired = useMemo(
    () => subscription?.status === "expired" || isTrialExpired,
    [subscription, isTrialExpired],
  );

  const isActive = useMemo(
    () =>
      subscription?.status === "active" ||
      isTrial ||
      isCancelledButStillActive ||
      isPastDue,
    [subscription, isTrial, isCancelledButStillActive, isPastDue],
  );

  const daysRemaining = useMemo(() => {
    if (subscription?.status === "trial") {
      return Math.max(
        0,
        Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      );
    }
    if (isCancelledButStillActive && subscription?.current_period_end) {
      return Math.max(
        0,
        Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      );
    }
    return null;
  }, [subscription, isCancelledButStillActive]);

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

  const statusSeverity = useMemo((): "success" | "warning" | "error" | "info" => {
    if (subscription?.status === "active") return "success";
    if (isTrial) return "info";
    if (isPastDue || isCancelledButStillActive) return "warning";
    return "error";
  }, [subscription, isTrial, isPastDue, isCancelledButStillActive]);

  const refreshSubscription = useCallback(async () => {
    if (!barbershop) {
      setSyncError(null);
      await fetchSubscription();
      return;
    }

    await syncFromStripe();
  }, [barbershop, fetchSubscription, syncFromStripe]);

  return {
    subscription,
    loading,
    syncError,
    isTrial,
    isTrialExpired,
    isActive,
    isPastDue,
    isCancelled,
    isCancelledButStillActive,
    isExpired,
    daysRemaining,
    statusLabel,
    statusSeverity,
    refreshSubscription,
  };
}
