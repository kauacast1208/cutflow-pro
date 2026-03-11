import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_PRICE_IDS = new Set([
  "price_1T9CKPGYcPFVpgolj3CkrGOE", // starter
  "price_1T9CLnGYcPFVpgol9bzdrSgY",  // pro
  "price_1T9CMGGYcPFVpgolzwe6TMW6",  // premium
]);

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

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

    const { priceId } = await req.json();
    if (!priceId) throw new Error("priceId is required");
    if (!VALID_PRICE_IDS.has(priceId)) throw new Error("Invalid priceId");
    logStep("Price ID validated", { priceId });

    // Get barbershop for metadata
    const { data: barbershop } = await supabaseAdmin
      .from("barbershops")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Check existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    let hasActiveSub = false;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });

      // Check if already has active/trialing subscription
      const activeSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 1,
      });
      const trialSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: "trialing",
        limit: 1,
      });

      if (activeSubs.data.length > 0 || trialSubs.data.length > 0) {
        hasActiveSub = true;
        logStep("User already has active/trialing subscription");
      }
    }

    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://cutflow.app";

    const metadata: Record<string, string> = {
      user_id: user.id,
    };
    if (barbershop?.id) {
      metadata.barbershop_id = barbershop.id;
    }

    // Only add trial if user doesn't already have an active subscription
    const subscriptionData: Stripe.Checkout.SessionCreateParams["subscription_data"] = {
      metadata,
    };
    if (!hasActiveSub) {
      subscriptionData.trial_period_days = 7;
      logStep("Trial period enabled (7 days)");
    } else {
      logStep("Skipping trial - user has existing subscription");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: subscriptionData,
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
      metadata,
      allow_promotion_codes: true,
    });

    logStep("Checkout session created", {
      sessionId: session.id,
      trial: !hasActiveSub,
      priceId,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    // Only expose safe messages to client
    const safeMessages = ["priceId is required", "Invalid priceId"];
    const clientMessage = safeMessages.some(m => errorMessage.includes(m))
      ? errorMessage
      : "Erro ao iniciar checkout. Tente novamente.";
    return new Response(JSON.stringify({ error: clientMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
