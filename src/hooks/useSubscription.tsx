import { useEffect, useState, useCallback } from "react";
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
        // Re-fetch local data after sync
        await fetchSubscription();
      } catch {
        // Silent fail - local data is still valid
      }
    };

    // Check URL for checkout success
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      // Wait a moment for Stripe webhook to process, then sync
      setTimeout(syncFromStripe, 2000);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      // Normal sync on mount
      syncFromStripe();
    }

    // Periodic sync every 60 seconds
    const interval = setInterval(syncFromStripe, 60000);
    return () => clearInterval(interval);
  }, [user, fetchSubscription]);

  const isTrialExpired =
    subscription?.status === "trial" &&
    new Date(subscription.trial_ends_at) < new Date();

  const isActive =
    subscription?.status === "active" ||
    (subscription?.status === "trial" && !isTrialExpired);

  const daysRemaining =
    subscription?.status === "trial"
      ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  const refreshSubscription = useCallback(async () => {
    try {
      await supabase.functions.invoke("check-subscription");
      await fetchSubscription();
    } catch {
      // silent
    }
  }, [fetchSubscription]);

  return { subscription, loading, isTrialExpired, isActive, daysRemaining, refreshSubscription };
}
