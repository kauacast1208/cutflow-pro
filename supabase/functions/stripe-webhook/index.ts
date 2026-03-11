import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Map Stripe price IDs to plan slugs
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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    logStep("ERROR: STRIPE_SECRET_KEY not set");
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2025-08-27.basil",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET not configured - rejecting event");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), { status: 500 });
    }
    if (!signature) {
      logStep("ERROR: No stripe-signature header - rejecting event");
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
    }
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep("Webhook signature verified", { type: event.type });
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Webhook signature verification FAILED", { error: msg });
    return new Response(JSON.stringify({ error: `Webhook Error: ${msg}` }), { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", {
          sessionId: session.id,
          customerId: session.customer,
          subscriptionId: session.subscription,
        });

        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          logStep("ERROR: No user_id in session metadata, cannot process");
          break;
        }

        if (!subscriptionId) {
          logStep("ERROR: No subscription ID in session, cannot process");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        const plan = priceId ? (PRICE_TO_PLAN[priceId] || "starter") : "starter";

        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const periodStart = new Date(subscription.current_period_start * 1000).toISOString();
        const dbStatus = mapStripeStatus(subscription.status);

        // Find barbershop - from metadata first, then from owner
        let barbershopId = session.metadata?.barbershop_id;
        if (!barbershopId) {
          const { data: barbershop } = await supabase
            .from("barbershops")
            .select("id")
            .eq("owner_id", userId)
            .maybeSingle();
          barbershopId = barbershop?.id;
        }

        if (!barbershopId) {
          logStep("ERROR: No barbershop found for user", { userId });
          break;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: dbStatus,
            trial_ends_at: trialEnd,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          })
          .eq("barbershop_id", barbershopId);

        if (error) {
          logStep("ERROR updating subscription in DB", { error: error.message, barbershopId });
        } else {
          logStep("Subscription updated successfully", {
            barbershopId,
            plan,
            status: dbStatus,
            trialEnd,
            periodEnd,
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        logStep("Processing invoice.payment_succeeded", {
          invoiceId: invoice.id,
          subscriptionId,
          billingReason: invoice.billing_reason,
        });

        if (!subscriptionId) {
          logStep("No subscription ID on invoice, skipping");
          break;
        }

        // Skip initial invoice during trial (no payment actually processed)
        if (invoice.billing_reason === "subscription_create" && invoice.amount_paid === 0) {
          logStep("Initial trial invoice (amount=0), skipping status update");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        const plan = priceId ? (PRICE_TO_PLAN[priceId] || null) : null;
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const periodStart = new Date(subscription.current_period_start * 1000).toISOString();

        const updateData: Record<string, any> = {
          status: "active",
          current_period_start: periodStart,
          current_period_end: periodEnd,
        };
        if (plan) updateData.plan = plan;

        const { error } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("stripe_subscription_id", subscriptionId);

        if (error) {
          logStep("ERROR updating on payment success", { error: error.message });
        } else {
          logStep("Subscription activated after payment", { subscriptionId, plan });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.updated", {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        });

        const priceId = subscription.items.data[0]?.price?.id;
        const plan = priceId ? (PRICE_TO_PLAN[priceId] || null) : null;
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const periodStart = new Date(subscription.current_period_start * 1000).toISOString();
        const dbStatus = mapStripeStatus(subscription.status);

        const updateData: Record<string, any> = {
          status: dbStatus,
          current_period_start: periodStart,
          current_period_end: periodEnd,
        };
        if (plan) updateData.plan = plan;
        if (subscription.trial_end) {
          updateData.trial_ends_at = new Date(subscription.trial_end * 1000).toISOString();
        }

        const { error } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("ERROR updating subscription", { error: error.message });
        } else {
          logStep("Subscription updated", { status: dbStatus, plan, cancelAtPeriodEnd: subscription.cancel_at_period_end });
        }
        break;
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.created", {
          subscriptionId: subscription.id,
          status: subscription.status,
        });

        const priceId = subscription.items.data[0]?.price?.id;
        const plan = priceId ? (PRICE_TO_PLAN[priceId] || "starter") : "starter";
        const dbStatus = mapStripeStatus(subscription.status);
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const periodStart = new Date(subscription.current_period_start * 1000).toISOString();

        // Try to find barbershop from metadata or customer email
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = (customer as any).email;

        let barbershopId: string | undefined;
        if (subscription.metadata?.barbershop_id) {
          barbershopId = subscription.metadata.barbershop_id;
        } else if (subscription.metadata?.user_id) {
          const { data: bs } = await supabase
            .from("barbershops")
            .select("id")
            .eq("owner_id", subscription.metadata.user_id)
            .maybeSingle();
          barbershopId = bs?.id;
        }

        if (barbershopId) {
          const trialEnd = subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : undefined;

          const { error } = await supabase
            .from("subscriptions")
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              plan,
              status: dbStatus,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              ...(trialEnd ? { trial_ends_at: trialEnd } : {}),
            })
            .eq("barbershop_id", barbershopId);

          if (error) {
            logStep("ERROR syncing new subscription", { error: error.message });
          } else {
            logStep("New subscription synced", { barbershopId, plan, dbStatus });
          }
        } else {
          logStep("Could not find barbershop for new subscription", { customerId });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing customer.subscription.deleted", { subscriptionId: subscription.id });

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("ERROR cancelling subscription in DB", { error: error.message });
        } else {
          logStep("Subscription cancelled in database", { subscriptionId: subscription.id });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        logStep("Processing invoice.payment_failed", {
          invoiceId: invoice.id,
          subscriptionId,
          attemptCount: invoice.attempt_count,
        });

        if (!subscriptionId) {
          logStep("No subscription ID on failed invoice, skipping");
          break;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);

        if (error) {
          logStep("ERROR updating to past_due", { error: error.message });
        } else {
          logStep("Subscription marked as past_due", { subscriptionId });
        }
        break;
      }

      default:
        logStep("Unhandled event type (ignored)", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("CRITICAL ERROR processing webhook", { message: errorMessage, eventType: event.type });
    // Return 200 to prevent Stripe from retrying on application errors
    // Only signature failures should return non-200
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }
});
