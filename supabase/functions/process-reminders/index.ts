import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch pending reminders that are due
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .in("type", ["appointment_reminder_24h", "appointment_reminder_2h", "post_service", "birthday_campaign", "reactivation_campaign", "referral_reward"])
      .limit(50);

    if (error) throw error;

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const notif of notifications || []) {
      // Check if appointment still active
      if (notif.appointment_id) {
        const { data: appt } = await supabase
          .from("appointments")
          .select("status, barbershops(name)")
          .eq("id", notif.appointment_id)
          .single();

        if (!appt || appt.status === "cancelled") {
          await supabase.from("notifications").update({ status: "cancelled" }).eq("id", notif.id);
          skipped++;
          continue;
        }
      }

      // Send email reminder
      if (notif.channel === "email" && notif.recipient_email && resendKey) {
        const isReminder24 = notif.type === "appointment_reminder_24h";

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "CutFlow <onboarding@resend.dev>",
            to: [notif.recipient_email],
            subject: notif.subject,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="display: inline-block; background: #f59e0b15; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 28px;">⏰</div>
                </div>
                <h1 style="color: #1a1a1a; font-size: 22px; text-align: center; margin-bottom: 8px;">
                  ${isReminder24 ? "Seu horário é amanhã!" : "Faltam 2 horas!"}
                </h1>
                <p style="color: #666; text-align: center; margin-bottom: 28px; white-space: pre-line;">${notif.body}</p>
                <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
                <p style="color: #bbb; font-size: 11px; text-align: center;">Enviado via CutFlow</p>
              </div>
            `,
          }),
        });

        if (emailRes.ok) {
          await supabase.from("notifications").update({
            status: "sent",
            sent_at: new Date().toISOString(),
          }).eq("id", notif.id);
          sent++;
        } else {
          await supabase.from("notifications").update({
            status: "failed",
            error_message: `HTTP ${emailRes.status}`,
          }).eq("id", notif.id);
          failed++;
        }
      }

      // WhatsApp placeholder
      if (notif.channel === "whatsapp" && notif.recipient_phone) {
        console.log(`[WhatsApp Ready] ${notif.type} to ${notif.recipient_phone}: ${notif.body}`);
        await supabase.from("notifications").update({
          status: "skipped",
          error_message: "WhatsApp integration pending",
        }).eq("id", notif.id);
        skipped++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: (notifications || []).length, sent, failed, skipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
