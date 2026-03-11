import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function replacePlaceholders(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch appointment with related data
    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("*, services(name, duration_minutes, price), professionals(name), barbershops(name, phone, whatsapp)")
      .eq("id", appointmentId)
      .single();

    if (error || !appointment) {
      throw new Error(`Appointment not found: ${error?.message}`);
    }

    // Resolve client_id for notification logging
    let clientId: string | null = null;
    if (appointment.client_phone || appointment.client_email) {
      const { data: matched } = await supabase.rpc("match_client_for_booking", {
        _barbershop_id: appointment.barbershop_id,
        _phone: appointment.client_phone || undefined,
        _email: appointment.client_email || undefined,
      });
      if (matched && matched.length > 0) {
        clientId = matched[0].id;
      }
    }

    const formattedDate = new Date(appointment.date + "T00:00:00").toLocaleDateString("pt-BR", {
      weekday: "long", day: "numeric", month: "long",
    });
    const startTime = appointment.start_time?.slice(0, 5);
    const barbershopName = appointment.barbershops?.name || "Barbearia";
    const serviceName = appointment.services?.name || "—";
    const professionalName = appointment.professionals?.name || "—";

    // Schedule timestamps
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.start_time}`);
    const reminder24h = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
    const reminder2h = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
    const reminder1h = new Date(appointmentDateTime.getTime() - 1 * 60 * 60 * 1000);
    const now = new Date();

    // Fetch automation configs for this barbershop
    const { data: automations } = await supabase
      .from("automations")
      .select("type, enabled, config")
      .eq("barbershop_id", appointment.barbershop_id)
      .in("type", ["appointment_confirmation", "appointment_reminder_24h", "appointment_reminder_2h", "appointment_reminder_1h"]);

    const autoMap = new Map<string, any>();
    (automations || []).forEach((a: any) => autoMap.set(a.type, a));

    // Template variables for placeholder substitution
    const templateVars: Record<string, string> = {
      client_name: appointment.client_name,
      barbershop_name: barbershopName,
      service_name: serviceName,
      professional_name: professionalName,
      appointment_date: formattedDate,
      appointment_time: startTime,
      nome: appointment.client_name,
      link: "",
    };

    // Confirmation message — respect automation config
    const autoConfirm = autoMap.get("appointment_confirmation");
    const confirmEnabled = autoConfirm ? autoConfirm.enabled : true;
    const confirmChannel = autoConfirm?.config?.channel || (appointment.client_phone ? "whatsapp" : "email");
    const customConfirmMsg = autoConfirm?.config?.message;
    const confirmationBody = customConfirmMsg
      ? replacePlaceholders(customConfirmMsg, templateVars)
      : `Olá ${appointment.client_name}!\n\nSeu horário foi confirmado.\n\nServiço: ${serviceName}\nData: ${formattedDate}\nHora: ${startTime}\n\n${barbershopName}`;

    const preferredChannel = appointment.client_phone ? "whatsapp" : "email";

    const notifications: any[] = [];

    // Base fields shared by all notifications for this appointment
    const baseNotif = {
      barbershop_id: appointment.barbershop_id,
      appointment_id: appointmentId,
      client_id: clientId,
      recipient_name: appointment.client_name,
      recipient_email: appointment.client_email,
      recipient_phone: appointment.client_phone,
      status: "pending",
    };

    if (confirmEnabled) {
      notifications.push({
        ...baseNotif,
        channel: confirmChannel,
        type: "appointment_created",
        subject: `✅ Agendamento confirmado - ${barbershopName}`,
        body: confirmationBody,
        scheduled_for: now.toISOString(),
      });
    }

    // 24h reminder
    const auto24 = autoMap.get("appointment_reminder_24h");
    const enabled24 = auto24 ? auto24.enabled : true;
    if (enabled24 && reminder24h > now) {
      const channel24 = auto24?.config?.channel || preferredChannel;
      const customMsg = auto24?.config?.message;
      const body = customMsg
        ? replacePlaceholders(customMsg, templateVars)
        : `Lembrete: seu agendamento é amanhã às ${startTime}.\n${barbershopName}.`;

      notifications.push({
        ...baseNotif,
        channel: channel24,
        type: "appointment_reminder_24h",
        subject: `⏰ Lembrete: seu horário é amanhã - ${barbershopName}`,
        body,
        scheduled_for: reminder24h.toISOString(),
      });
    }

    // 2h reminder
    const auto2h = autoMap.get("appointment_reminder_2h");
    const enabled2h = auto2h ? auto2h.enabled : true;
    if (enabled2h && reminder2h > now) {
      const channel2h = auto2h?.config?.channel || preferredChannel;
      const customMsg = auto2h?.config?.message;
      const body = customMsg
        ? replacePlaceholders(customMsg, templateVars)
        : `Faltam 2 horas para seu agendamento às ${startTime}.\n${barbershopName}.`;

      notifications.push({
        ...baseNotif,
        channel: channel2h,
        type: "appointment_reminder_2h",
        subject: `⏰ Faltam 2 horas para seu horário - ${barbershopName}`,
        body,
        scheduled_for: reminder2h.toISOString(),
      });
    }

    // 1h reminder
    const auto1h = autoMap.get("appointment_reminder_1h");
    const enabled1h = auto1h ? auto1h.enabled : true;
    if (enabled1h && reminder1h > now) {
      const channel1h = "whatsapp";
      const customMsg1h = auto1h?.config?.message;
      const body1h = customMsg1h
        ? replacePlaceholders(customMsg1h, templateVars)
        : `Olá ${appointment.client_name}! Falta 1 hora para seu horário às ${startTime}.\n\nServiço: ${serviceName}\nProfissional: ${professionalName}\n\n${barbershopName} te espera!`;

      notifications.push({
        ...baseNotif,
        channel: channel1h,
        type: "appointment_reminder_1h",
        subject: `⏰ Falta 1 hora para seu horário - ${barbershopName}`,
        body: body1h,
        scheduled_for: reminder1h.toISOString(),
      });
    }

    // Idempotency: check for duplicate notifications
    const { data: existing } = await supabase
      .from("notifications")
      .select("type")
      .eq("appointment_id", appointmentId)
      .in("type", ["appointment_created", "appointment_reminder_24h", "appointment_reminder_2h", "appointment_reminder_1h"]);

    const existingTypes = new Set((existing || []).map((e: any) => e.type));
    const newNotifications = notifications.filter((n) => !existingTypes.has(n.type));

    if (newNotifications.length > 0) {
      await supabase.from("notifications").insert(newNotifications);
    }

    // ── Immediate sends (fire-and-forget, never block response) ─────────

    // Send confirmation email immediately
    if (resendKey && appointment.client_email && confirmEnabled) {
      try {
        const price = appointment.services?.price
          ? `R$ ${Number(appointment.services.price).toFixed(2)}`
          : null;

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: `${barbershopName} via CutFlow <onboarding@resend.dev>`,
            to: [appointment.client_email],
            subject: `✅ Agendamento confirmado - ${barbershopName}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="display: inline-block; background: #16a34a15; border-radius: 50%; width: 56px; height: 56px; line-height: 56px; font-size: 28px;">✅</div>
                </div>
                <h1 style="color: #1a1a1a; font-size: 22px; text-align: center; margin-bottom: 8px;">Agendamento Confirmado!</h1>
                <p style="color: #666; text-align: center; margin-bottom: 28px;">Olá, <strong>${appointment.client_name}</strong>! Seu horário foi confirmado.</p>
                <div style="background: #f8faf8; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px; margin-bottom: 28px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">📋 Serviço</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${serviceName}</td></tr>
                    <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">✂️ Profissional</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${professionalName}</td></tr>
                    <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">📅 Data</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${formattedDate}</td></tr>
                    <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">🕐 Horário</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a1a;">${startTime}</td></tr>
                    ${price ? `<tr><td style="padding: 8px 0; color: #888; font-size: 13px;">💰 Valor</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: #16a34a;">${price}</td></tr>` : ""}
                  </table>
                </div>
                <p style="color: #999; font-size: 13px; text-align: center;">Até lá! 👋</p>
                <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
                <p style="color: #bbb; font-size: 11px; text-align: center;">${barbershopName} · Enviado via CutFlow</p>
              </div>
            `,
          }),
        });

        await supabase
          .from("notifications")
          .update({
            status: emailRes.ok ? "sent" : "failed",
            sent_at: emailRes.ok ? new Date().toISOString() : null,
            error_message: emailRes.ok ? null : `HTTP ${emailRes.status}`,
            provider: "resend",
          })
          .eq("appointment_id", appointmentId)
          .eq("type", "appointment_created")
          .eq("channel", "email");
      } catch (emailErr) {
        console.error("[email] confirmation error:", emailErr);
      }
    }

    // Send WhatsApp confirmation immediately via send-whatsapp function
    if (appointment.client_phone && confirmEnabled && (confirmChannel === "whatsapp" || confirmChannel === "both")) {
      try {
        const waRes = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            phone: appointment.client_phone,
            message: confirmationBody,
          }),
        });

        const waResult = await waRes.json();

        await supabase
          .from("notifications")
          .update({
            status: waResult.success ? "sent" : "failed",
            sent_at: waResult.success ? new Date().toISOString() : null,
            error_message: waResult.success ? null : `[${waResult.provider || "whatsapp"}] ${waResult.error || "unknown"}`.slice(0, 500),
            provider: waResult.provider || "z_api",
          })
          .eq("appointment_id", appointmentId)
          .eq("type", "appointment_created")
          .eq("channel", "whatsapp");
      } catch (waErr) {
        console.error("[whatsapp] confirmation error:", waErr);
        // Never break the flow — just log
      }
    }

    return new Response(
      JSON.stringify({ success: true, notifications: newNotifications.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-booking-confirmation error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
