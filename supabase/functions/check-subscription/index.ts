import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const PRICE_TO_PLAN: Record<string, string> = {
  "price_1T9CKPGYcPFVpgolj3CkrGOE": "starter",
  "price_1T9CLnGYcPFVpgol9bzdrSgY": "pro",
  "price_1T9CMGGYcPFVpgolzwe6TMW6": "premium",
};

function mapStripeStatus(status: string): string {
  switch (status) {
    case "active": return "active";
    case "trialing": return "trial";
    case "past_due": return "past_due";
    case "canceled":
    case "unpaid": return "cancelled";
    case "incomplete":
    case "incomplete_expired": return "expired";
    default: return "expired";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Query ALL relevant subscription statuses (not just active+trialing)
    const [activeSubs, trialingSubs, pastDueSubs] = await Promise.all([
      stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 }),
      stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 1 }),
      stripe.subscriptions.list({ customer: customerId, status: "past_due", limit: 1 }),
    ]);

    // Priority: active > trialing > past_due
    const subscription = activeSubs.data[0] || trialingSubs.data[0] || pastDueSubs.data[0];

    let subscribed = false;
    let plan: string | null = null;
    let subscriptionEnd: string | null = null;
    let stripeSubscriptionId: string | null = null;
    let currentPeriodStart: string | null = null;
    let status: string | null = null;
    let cancelAtPeriodEnd = false;

    if (subscription) {
      subscribed = true;
      stripeSubscriptionId = subscription.id;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
      status = subscription.status;
      cancelAtPeriodEnd = subscription.cancel_at_period_end;

      const priceId = subscription.items.data[0]?.price?.id;
      plan = PRICE_TO_PLAN[priceId] || null;
      logStep("Subscription found", { subscriptionId: subscription.id, plan, status, cancelAtPeriodEnd });

      // Sync to Supabase
      const { data: barbershop } = await supabaseAdmin
        .from("barbershops")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (barbershop && plan) {
        const dbStatus = mapStripeStatus(subscription.status);
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : undefined;

        const { error: upsertError } = await supabaseAdmin
          .from("subscriptions")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: stripeSubscriptionId,
            plan,
            status: dbStatus,
            current_period_start: currentPeriodStart,
            current_period_end: subscriptionEnd,
            ...(trialEnd ? { trial_ends_at: trialEnd } : {}),
          })
          .eq("barbershop_id", barbershop.id);

        if (upsertError) {
          logStep("Error syncing subscription to DB", { error: upsertError.message });
        } else {
          logStep("Subscription synced to database", { barbershopId: barbershop.id, plan, dbStatus });
        }
      } else {
        logStep("Could not sync - missing barbershop or plan", { hasBarbershop: !!barbershop, plan });
      }
    } else {
      logStep("No active, trialing, or past_due subscription found");
    }

    return new Response(JSON.stringify({
      subscribed,
      plan,
      status,
      subscription_end: subscriptionEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Erro ao verificar assinatura" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
