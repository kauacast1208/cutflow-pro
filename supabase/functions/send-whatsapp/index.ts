import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Provider Interfaces ────────────────────────────────────────────────────
interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

interface WhatsAppProvider {
  name: string;
  send(phone: string, message: string): Promise<SendResult>;
}

// ─── Phone Normalization ────────────────────────────────────────────────────
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

// ─── Provider: WhatsApp Cloud API (Meta) ────────────────────────────────────
class MetaCloudProvider implements WhatsAppProvider {
  name = "meta_cloud";
  private phoneNumberId: string;
  private accessToken: string;
  private apiVersion = "v21.0";

  constructor(phoneNumberId: string, accessToken: string) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  async send(phone: string, message: string): Promise<SendResult> {
    const normalizedPhone = normalizePhone(phone);
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedPhone,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });

    const data = await res.json();

    if (res.ok && data.messages?.[0]?.id) {
      return { success: true, messageId: data.messages[0].id, provider: this.name };
    }

    return {
      success: false,
      error: data.error?.message || data.error?.error_data?.details || `HTTP ${res.status}`,
      provider: this.name,
    };
  }
}

// ─── Provider: Twilio ───────────────────────────────────────────────────────
class TwilioProvider implements WhatsAppProvider {
  name = "twilio";
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
  }

  async send(phone: string, message: string): Promise<SendResult> {
    const normalizedPhone = normalizePhone(phone);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

    const params = new URLSearchParams({
      From: `whatsapp:+${this.fromNumber}`,
      To: `whatsapp:+${normalizedPhone}`,
      Body: message,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (res.ok && data.sid) {
      return { success: true, messageId: data.sid, provider: this.name };
    }

    return {
      success: false,
      error: data.message || `HTTP ${res.status}`,
      provider: this.name,
    };
  }
}

// ─── Provider: Z-API ────────────────────────────────────────────────────────
class ZApiProvider implements WhatsAppProvider {
  name = "z_api";
  private instanceId: string;
  private token: string;
  private clientToken: string;

  constructor(instanceId: string, token: string, clientToken: string) {
    this.instanceId = instanceId;
    this.token = token;
    this.clientToken = clientToken;
  }

  async send(phone: string, message: string): Promise<SendResult> {
    const normalizedPhone = normalizePhone(phone);
    const url = `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}/send-text`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Token": this.clientToken,
      },
      body: JSON.stringify({ phone: normalizedPhone, message }),
    });

    const data = await res.json();

    if (res.ok && (data.zapiMessageId || data.messageId)) {
      return {
        success: true,
        messageId: data.zapiMessageId || data.messageId,
        provider: this.name,
      };
    }

    return {
      success: false,
      error: data.error || data.message || `HTTP ${res.status}`,
      provider: this.name,
    };
  }
}

// ─── Provider Factory ───────────────────────────────────────────────────────
function createProvider(): WhatsAppProvider | null {
  // Priority 1: Meta WhatsApp Cloud API
  const metaPhoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const metaToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  if (metaPhoneId && metaToken) {
    return new MetaCloudProvider(metaPhoneId, metaToken);
  }

  // Priority 2: Twilio
  const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuth = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioFrom = Deno.env.get("TWILIO_WHATSAPP_FROM");
  if (twilioSid && twilioAuth && twilioFrom) {
    return new TwilioProvider(twilioSid, twilioAuth, twilioFrom);
  }

  // Priority 3: Z-API
  const zapiInstance = Deno.env.get("ZAPI_INSTANCE_ID");
  const zapiToken = Deno.env.get("ZAPI_TOKEN");
  const zapiClientToken = Deno.env.get("ZAPI_CLIENT_TOKEN");
  if (zapiInstance && zapiToken && zapiClientToken) {
    return new ZApiProvider(zapiInstance, zapiToken, zapiClientToken);
  }

  return null;
}

// ─── Supabase Helper ────────────────────────────────────────────────────────
function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// ─── Update notification status ─────────────────────────────────────────────
async function updateNotificationStatus(
  notificationId: string,
  result: SendResult
) {
  const supabase = getServiceClient();

  if (result.success) {
    await supabase
      .from("notifications")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        error_message: null,
        provider: result.provider,
      })
      .eq("id", notificationId);
  } else {
    await supabase
      .from("notifications")
      .update({
        status: "failed",
        error_message: `[${result.provider}] ${result.error}`.slice(0, 500),
        provider: result.provider,
      })
      .eq("id", notificationId);
  }
}

// ─── Process pending reminders (batch mode) ─────────────────────────────────
async function processPendingReminders(provider: WhatsAppProvider) {
  const supabase = getServiceClient();

  const { data: pending, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("channel", "whatsapp")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .not("recipient_phone", "is", null)
    .order("scheduled_for", { ascending: true })
    .limit(50);

  if (error) throw error;

  let sent = 0;
  let failed = 0;
  let cancelled = 0;

  for (const notif of pending || []) {
    // Skip notifications for cancelled appointments
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

    const result = await provider.send(
      notif.recipient_phone!,
      notif.body || ""
    );

    await updateNotificationStatus(notif.id, result);
    result.success ? sent++ : failed++;

    // Rate limiting: 200ms between messages
    if ((pending || []).length > 1) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return { processed: (pending || []).length, sent, failed, cancelled };
}

// ─── Main Handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const provider = createProvider();

    if (!provider) {
      return new Response(
        JSON.stringify({
          error: "No WhatsApp provider configured.",
          hint: "Add one of: WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_ACCESS_TOKEN (Meta), TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM (Twilio), or ZAPI_INSTANCE_ID + ZAPI_TOKEN (Z-API).",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    // ── Mode 1: Send single message ──
    if (body.phone && body.message) {
      const result = await provider.send(body.phone, body.message);

      if (body.notificationId) {
        await updateNotificationStatus(body.notificationId, result);
      }

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Mode 2: Process all pending reminders ──
    if (body.processPending) {
      const stats = await processPendingReminders(provider);

      return new Response(
        JSON.stringify({ success: true, provider: provider.name, ...stats }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Invalid request.",
        usage: 'Send { phone, message } for single send, or { processPending: true } for batch.',
      }),
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
