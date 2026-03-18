import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

const PRICE_TO_PLAN: Record<string, string> = {
  "price_1T9CKPGYcPFVpgolj3CkrGOE": "starter",
  "price_1T9CLnGYcPFVpgol9bzdrSgY": "pro",
  "price_1T9CMGGYcPFVpgolzwe6TMW6": "premium",
};

function mapStripeStatus(status: string): string {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trial";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "cancelled";
    case "incomplete":
    case "incomplete_expired":
      return "expired";
    default:
      return "expired";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

  const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    logStep("Function started", { method: req.method, origin: req.headers.get("origin") });

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized", details: "Missing bearer token" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      logStep("JWT validation failed", { error: claimsError?.message });
      return jsonResponse({ error: "Unauthorized", details: claimsError?.message ?? "Invalid token" }, 401);
    }

    const userId = String(claimsData.claims.sub);
    const userEmail = typeof claimsData.claims.email === "string" ? claimsData.claims.email : null;

    if (!userEmail) {
      throw new Error("Authenticated user has no email claim");
    }

    logStep("User authenticated", { userId, email: userEmail });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found", { userId });
      return jsonResponse({ subscribed: false, plan: null, status: null, subscription_end: null, cancel_at_period_end: false });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const [activeSubs, trialingSubs, pastDueSubs] = await Promise.all([
      stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 }),
      stripe.subscriptions.list({ customer: customerId, status: "trialing", limit: 1 }),
      stripe.subscriptions.list({ customer: customerId, status: "past_due", limit: 1 }),
    ]);

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

      logStep("Subscription found", {
        subscriptionId: subscription.id,
        plan,
        status,
        cancelAtPeriodEnd,
      });

      const { data: barbershop, error: barbershopError } = await supabaseAdmin
        .from("barbershops")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle();

      if (barbershopError) {
        logStep("Barbershop lookup failed", { error: barbershopError.message, userId });
      } else if (barbershop && plan) {
        const dbStatus = mapStripeStatus(subscription.status);
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : undefined;

        const { error: updateError } = await supabaseAdmin
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

        if (updateError) {
          logStep("Error syncing subscription to DB", { error: updateError.message, barbershopId: barbershop.id });
        } else {
          logStep("Subscription synced to database", { barbershopId: barbershop.id, plan, dbStatus });
        }
      } else {
        logStep("Skipping DB sync", { hasBarbershop: !!barbershop, plan, userId });
      }
    } else {
      logStep("No active, trialing, or past_due subscription found", { customerId });
    }

    return jsonResponse({
      subscribed,
      plan,
      status,
      subscription_end: subscriptionEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    return jsonResponse(
      {
        error: "Erro ao verificar assinatura",
        details: errorMessage,
      },
      500,
    );
  }
});
