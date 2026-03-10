import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GRAPH_API_VERSION = "v21.0";

interface WhatsAppSendRequest {
  phone: string;       // E.164 format e.g. "5511999998888"
  message: string;     // Text body
  notificationId?: string; // Optional: to update status after send
}

interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Normalize Brazilian phone to E.164 (digits only, with country code 55).
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Add Brazil country code if missing
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

/**
 * Send a single WhatsApp text message via Meta Cloud API.
 */
async function sendWhatsAppMessage(
  phone: string,
  message: string,
  phoneNumberId: string,
  accessToken: string
): Promise<WhatsAppResult> {
  const normalizedPhone = normalizePhone(phone);

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizedPhone,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    }),
  });

  const data = await res.json();

  if (res.ok && data.messages?.[0]?.id) {
    return { success: true, messageId: data.messages[0].id };
  }

  const errorMsg =
    data.error?.message ||
    data.error?.error_data?.details ||
    `HTTP ${res.status}`;

  return { success: false, error: errorMsg };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");

    if (!phoneNumberId || !accessToken) {
      return new Response(
        JSON.stringify({
          error: "WhatsApp credentials not configured. Add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN secrets.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // Mode 1: Send a single message
    if (body.phone && body.message) {
      const result = await sendWhatsAppMessage(
        body.phone,
        body.message,
        phoneNumberId,
        accessToken
      );

      // Update notification status if notificationId provided
      if (body.notificationId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        if (result.success) {
          await supabase
            .from("notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              error_message: null,
            })
            .eq("id", body.notificationId);
        } else {
          await supabase
            .from("notifications")
            .update({
              status: "failed",
              error_message: result.error?.slice(0, 500),
            })
            .eq("id", body.notificationId);
        }
      }

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mode 2: Process all pending WhatsApp notifications (batch)
    if (body.processPending) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: pending, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("channel", "whatsapp")
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString())
        .not("recipient_phone", "is", null)
        .limit(50);

      if (error) throw error;

      let sent = 0;
      let failed = 0;
      let cancelled = 0;

      for (const notif of pending || []) {
        // Skip cancelled appointments
        if (notif.appointment_id) {
          const { data: appt } = await supabase
            .from("appointments")
            .select("status")
            .eq("id", notif.appointment_id)
            .single();

          if (!appt || appt.status === "cancelled") {
            await supabase
              .from("notifications")
              .update({ status: "cancelled" })
              .eq("id", notif.id);
            cancelled++;
            continue;
          }
        }

        const result = await sendWhatsAppMessage(
          notif.recipient_phone!,
          notif.body || "",
          phoneNumberId,
          accessToken
        );

        if (result.success) {
          await supabase
            .from("notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              error_message: null,
            })
            .eq("id", notif.id);
          sent++;
        } else {
          await supabase
            .from("notifications")
            .update({
              status: "failed",
              error_message: result.error?.slice(0, 500),
            })
            .eq("id", notif.id);
          failed++;
        }

        // Rate limit: small delay between messages
        if ((pending || []).length > 1) {
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          processed: (pending || []).length,
          sent,
          failed,
          cancelled,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request. Send { phone, message } or { processPending: true }" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-whatsapp error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
