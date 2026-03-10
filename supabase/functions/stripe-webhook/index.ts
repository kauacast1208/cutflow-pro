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

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
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
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep("Webhook signature verified", { type: event.type });
    } else {
      event = JSON.parse(body) as Stripe.Event;
      logStep("Webhook received (no signature verification)", { type: event.type });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logStep("Webhook signature verification failed", { error: msg });
    return new Response(JSON.stringify({ error: `Webhook Error: ${msg}` }), { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("checkout.session.completed", { sessionId: session.id });

        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          logStep("No user_id in metadata, skipping");
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

        if (barbershopId) {
          const dbStatus = mapStripeStatus(subscription.status);

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
            logStep("Error updating subscription", { error: error.message });
          } else {
            logStep("Subscription updated successfully", { barbershopId, plan, status: dbStatus });
          }
        } else {
          logStep("No barbershop found for user", { userId });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        logStep("invoice.payment_succeeded", { subscriptionId });

        if (!subscriptionId) break;

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
          logStep("Error updating on payment success", { error: error.message });
        } else {
          logStep("Subscription activated on payment", { subscriptionId });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("customer.subscription.updated", {
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
          logStep("Error updating subscription", { error: error.message });
        } else {
          logStep("Subscription updated", { status: dbStatus, plan });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("customer.subscription.deleted", { subscriptionId: subscription.id });

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          logStep("Error cancelling subscription", { error: error.message });
        } else {
          logStep("Subscription cancelled in database");
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR processing webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
