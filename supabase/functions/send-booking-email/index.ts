import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type EmailType = "confirmed" | "cancelled" | "rescheduled";

interface BookingEmailRequest {
  type: EmailType;
  clientName: string;
  clientEmail?: string;
  serviceName: string;
  professionalName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  barbershopName: string;
  barbershopAddress?: string;
  barbershopId?: string;
  bookingUrl?: string;
  newDate?: string;
  newStartTime?: string;
  newEndTime?: string;
}

function buildClientEmailContent(data: BookingEmailRequest) {
  const firstName = data.clientName.split(" ")[0];
  const detailsBlock = buildDetailsBlock(data);
  const addressLine = data.barbershopAddress
    ? `<p style="color:#6b7280;font-size:13px;margin-top:8px;">📍 ${data.barbershopAddress}</p>`
    : "";
  const bookAgainBtn = data.bookingUrl
    ? `<div style="text-align:center;margin-top:24px;">
        <a href="${data.bookingUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">Agendar novamente</a>
       </div>`
    : "";

  if (data.type === "confirmed") {
    return {
      subject: `✅ Agendamento confirmado — ${data.barbershopName}`,
      html: wrapEmail(`
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:#ecfdf5;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">✅</div>
        </div>
        <h1 style="text-align:center;font-size:22px;margin:0 0 4px;">Agendamento confirmado!</h1>
        <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 20px;">Olá ${firstName}, tudo certo com seu agendamento.</p>
        ${detailsBlock}
        ${addressLine}
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;">${data.barbershopName}</p>
      `),
    };
  }

  if (data.type === "cancelled") {
    return {
      subject: `❌ Agendamento cancelado — ${data.barbershopName}`,
      html: wrapEmail(`
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:#fef2f2;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">❌</div>
        </div>
        <h1 style="text-align:center;font-size:22px;margin:0 0 4px;">Agendamento cancelado</h1>
        <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 20px;">Olá ${firstName}, seu agendamento foi cancelado.</p>
        ${detailsBlock}
        ${bookAgainBtn}
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;">${data.barbershopName}</p>
      `),
    };
  }

  return {
    subject: `🔄 Agendamento remarcado — ${data.barbershopName}`,
    html: wrapEmail(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#eff6ff;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">🔄</div>
      </div>
      <h1 style="text-align:center;font-size:22px;margin:0 0 4px;">Agendamento remarcado</h1>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 20px;">Olá ${firstName}, seu agendamento foi atualizado para um novo horário.</p>
      ${detailsBlock}
      ${addressLine}
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;">${data.barbershopName}</p>
    `),
  };
}

function buildOwnerEmailContent(data: BookingEmailRequest) {
  const detailsBlock = buildDetailsBlock(data);

  if (data.type === "confirmed") {
    return {
      subject: `📅 Novo agendamento — ${data.clientName}`,
      html: wrapEmail(`
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:#ecfdf5;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">📅</div>
        </div>
        <h1 style="text-align:center;font-size:22px;margin:0 0 4px;">Novo agendamento!</h1>
        <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 20px;">${data.clientName} acabou de agendar um horário.</p>
        ${detailsBlock}
        ${data.clientEmail ? `<div style="margin-top:12px;"><span style="color:#6b7280;font-size:13px;">📧 ${data.clientEmail}</span></div>` : ""}
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;">${data.barbershopName}</p>
      `),
    };
  }

  if (data.type === "cancelled") {
    return {
      subject: `❌ Agendamento cancelado — ${data.clientName}`,
      html: wrapEmail(`
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:#fef2f2;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">❌</div>
        </div>
        <h1 style="text-align:center;font-size:22px;margin:0 0 4px;">Agendamento cancelado</h1>
        <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 20px;">${data.clientName} cancelou o agendamento.</p>
        ${detailsBlock}
        <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;">${data.barbershopName}</p>
      `),
    };
  }

  return {
    subject: `🔄 Agendamento remarcado — ${data.clientName}`,
    html: wrapEmail(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#eff6ff;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">🔄</div>
      </div>
      <h1 style="text-align:center;font-size:22px;margin:0 0 4px;">Agendamento remarcado</h1>
      <p style="text-align:center;color:#6b7280;font-size:14px;margin:0 0 20px;">${data.clientName} remarcou o agendamento.</p>
      ${detailsBlock}
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:32px;">${data.barbershopName}</p>
    `),
  };
}

function buildDetailsBlock(data: BookingEmailRequest) {
  const displayDate = data.type === "rescheduled" && data.newDate ? data.newDate : data.date;
  const displayTime = data.type === "rescheduled" && data.newStartTime
    ? `${data.newStartTime} - ${data.newEndTime}`
    : `${data.startTime} - ${data.endTime}`;

  return `
    <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Cliente</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;">${data.clientName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Serviço</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;">${data.serviceName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Profissional</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;">${data.professionalName}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Data</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;">${displayDate}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Horário</td><td style="padding:6px 0;text-align:right;font-weight:600;font-size:14px;">${displayTime}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;font-size:14px;">Valor</td><td style="padding:6px 0;text-align:right;font-weight:700;font-size:16px;color:#7c3aed;">${data.price}</td></tr>
      </table>
    </div>`;
}

function wrapEmail(content: string) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;background:#ffffff;">${content}</div>`;
}

async function getOwnerEmail(barbershopId: string): Promise<string | null> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: shop } = await supabase
    .from("barbershops")
    .select("owner_id")
    .eq("id", barbershopId)
    .single();

  if (!shop?.owner_id) return null;

  const { data: userData } = await supabase.auth.admin.getUserById(shop.owner_id);
  return userData?.user?.email || null;
}

async function sendEmail(apiKey: string, from: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Resend API error:", data);
    throw new Error(`Resend error [${res.status}]: ${JSON.stringify(data)}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const body: BookingEmailRequest = await req.json();
    const from = `${body.barbershopName} <onboarding@resend.dev>`;
    const results: string[] = [];

    // Send client email
    if (body.clientEmail) {
      const { subject, html } = buildClientEmailContent(body);
      const r = await sendEmail(RESEND_API_KEY, from, body.clientEmail, subject, html);
      results.push(`client:${r.id}`);
    }

    // Send owner email
    if (body.barbershopId) {
      try {
        const ownerEmail = await getOwnerEmail(body.barbershopId);
        if (ownerEmail) {
          const { subject, html } = buildOwnerEmailContent(body);
          const r = await sendEmail(RESEND_API_KEY, from, ownerEmail, subject, html);
          results.push(`owner:${r.id}`);
        }
      } catch (e) {
        console.error("Failed to send owner email:", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, ids: results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending booking email:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
