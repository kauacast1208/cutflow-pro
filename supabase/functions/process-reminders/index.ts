import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Fetch pending reminders ─────────────────────────────────────────
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .in("type", [
        "appointment_created",
        "appointment_reminder_24h",
        "appointment_reminder_2h",
        "appointment_reminder_1h",
        "post_service",
        "birthday_campaign",
        "reactivation_campaign",
        "reactivation_inactive_client",
        "reactivation_inactive_client_60",
        "reactivation_inactive_client_90",
        "referral_reward",
        "loyalty_earned",
        "loyalty_near",
        "retention_inactive_client",
        "retention_inactive_client_60",
        "retention_inactive_client_90",
      ])
      .order("scheduled_for", { ascending: true })
      .limit(50);

    if (error) throw error;

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    const emailNotifs: any[] = [];
    const whatsappNotifs: any[] = [];

    // ── Pre-filter: check appointment status ────────────────────────────
    for (const notif of notifications || []) {
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
          skipped++;
          continue;
        }
      }

      if (notif.channel === "whatsapp" && notif.recipient_phone) {
        whatsappNotifs.push(notif);
      } else if (notif.channel === "email" && notif.recipient_email) {
        emailNotifs.push(notif);
      } else {
        skipped++;
      }
    }

    // ── Process emails via Resend ───────────────────────────────────────
    for (const notif of emailNotifs) {
      if (!resendKey) {
        skipped++;
        continue;
      }

      const isReminder = notif.type?.includes("reminder");

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "CutFlow <onboarding@resend.dev>",
          to: [notif.recipient_email],
          subject: notif.subject || "Lembrete - CutFlow",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: #16a34a15; border-radius: 16px; width: 56px; height: 56px; line-height: 56px; font-size: 24px; color: #16a34a;">CF</div>
              </div>
              <h1 style="color: #1a1a1a; font-size: 20px; text-align: center; margin-bottom: 8px;">
                ${isReminder ? "Lembrete de agendamento" : (notif.subject || "Notificacao")}
              </h1>
              <p style="color: #555; text-align: center; margin-bottom: 28px; white-space: pre-line; line-height: 1.6;">${notif.body}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #bbb; font-size: 11px; text-align: center;">Enviado via CutFlow</p>
            </div>
          `,
        }),
      });

      if (emailRes.ok) {
        await supabase
          .from("notifications")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", notif.id);
        sent++;
      } else {
        const errBody = await emailRes.text();
        await supabase
          .from("notifications")
          .update({
            status: "failed",
            error_message: `[email] HTTP ${emailRes.status}: ${errBody.slice(0, 300)}`,
          })
          .eq("id", notif.id);
        failed++;
      }
    }

    // ── Process WhatsApp via send-whatsapp function ─────────────────────
    for (const notif of whatsappNotifs) {
      try {
        const waRes = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            phone: notif.recipient_phone,
            message: notif.body || "",
            notificationId: notif.id,
          }),
        });

        const result = await waRes.json();

        if (result.success) {
          sent++;
        } else if (waRes.status === 503) {
          // Provider not configured yet — skip, don't mark as failed
          skipped++;
        } else {
          failed++;
        }
      } catch (waErr) {
        console.error(`WhatsApp error for notification ${notif.id}:`, waErr);
        await supabase
          .from("notifications")
          .update({
            status: "failed",
            error_message: `[whatsapp] ${(waErr as Error).message}`.slice(0, 500),
          })
          .eq("id", notif.id);
        failed++;
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: (notifications || []).length,
        sent,
        failed,
        skipped,
        channels: {
          email: emailNotifs.length,
          whatsapp: whatsappNotifs.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-reminders error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
