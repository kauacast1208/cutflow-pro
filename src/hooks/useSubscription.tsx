import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBarbershop } from "./useBarbershop";

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
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!barbershop) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("barbershop_id", barbershop.id)
        .maybeSingle();
      setSubscription(data as Subscription | null);
      setLoading(false);
    };
    fetch();
  }, [barbershop]);

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

  return { subscription, loading, isTrialExpired, isActive, daysRemaining };
}
