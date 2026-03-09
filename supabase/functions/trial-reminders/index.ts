import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const now = new Date();
    const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Fetch trial subscriptions expiring within 3 days or already expired
    const { data: subs, error: subError } = await supabase
      .from("subscriptions")
      .select("*, barbershops(name, owner_id)")
      .eq("status", "trial")
      .lte("trial_ends_at", in3Days.toISOString());

    if (subError) throw subError;
    if (!subs || subs.length === 0) {
      return new Response(
        JSON.stringify({ message: "No trial reminders to send", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;

    for (const sub of subs) {
      const barbershop = sub.barbershops;
      if (!barbershop?.owner_id) continue;

      // Get owner email from auth.users
      const { data: userData } = await supabase.auth.admin.getUserById(barbershop.owner_id);
      const email = userData?.user?.email;
      if (!email) continue;

      const trialEnd = new Date(sub.trial_ends_at);
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let subject: string;
      let body: string;
      const shopName = barbershop.name || "sua barbearia";

      if (daysLeft <= 0) {
        subject = `⚠️ Seu teste gratuito do CutFlow expirou`;
        body = buildEmailHtml({
          title: "Seu período de teste terminou",
          message: `O teste gratuito de <strong>${shopName}</strong> no CutFlow expirou. Para continuar gerenciando sua barbearia, escolha um plano agora.`,
          ctaText: "Escolher um plano",
          ctaUrl: "https://cutflow.app/checkout",
          urgent: true,
        });
      } else if (daysLeft === 1) {
        subject = `⏰ Último dia do seu teste grátis — CutFlow`;
        body = buildEmailHtml({
          title: "Falta apenas 1 dia!",
          message: `O teste gratuito de <strong>${shopName}</strong> no CutFlow expira amanhã. Não perca acesso à sua agenda e dados.`,
          ctaText: "Garantir meu plano",
          ctaUrl: "https://cutflow.app/checkout",
          urgent: true,
        });
      } else {
        subject = `📅 Seu teste grátis expira em ${daysLeft} dias — CutFlow`;
        body = buildEmailHtml({
          title: `${daysLeft} dias restantes no teste grátis`,
          message: `O teste gratuito de <strong>${shopName}</strong> no CutFlow expira em ${daysLeft} dias. Explore todas as funcionalidades e escolha o plano ideal para sua barbearia.`,
          ctaText: "Ver planos",
          ctaUrl: "https://cutflow.app/checkout",
          urgent: false,
        });
      }

      // Send email via Resend
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "CutFlow <onboarding@resend.dev>",
          to: [email],
          subject,
          html: body,
        }),
      });

      if (res.ok) {
        sent++;
        console.log(`Email sent to ${email} (${daysLeft} days left)`);
      } else {
        const err = await res.text();
        console.error(`Failed to send to ${email}: ${err}`);
      }
    }

    return new Response(
      JSON.stringify({ message: `Sent ${sent} trial reminder(s)`, sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in trial-reminders:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildEmailHtml(opts: {
  title: string;
  message: string;
  ctaText: string;
  ctaUrl: string;
  urgent: boolean;
}) {
  const accentColor = opts.urgent ? "#ef4444" : "#f59e0b";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:${accentColor};padding:24px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">✂️ CutFlow</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 12px;font-size:22px;color:#0f172a;">${opts.title}</h2>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;">${opts.message}</p>
      <a href="${opts.ctaUrl}" style="display:inline-block;background:${accentColor};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">
        ${opts.ctaText}
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">CutFlow — Sistema de gestão para barbearias</p>
    </div>
  </div>
</body>
</html>`;
}
