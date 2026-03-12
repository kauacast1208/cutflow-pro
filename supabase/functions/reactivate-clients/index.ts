import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all barbershops
    const { data: barbershops } = await supabase
      .from("barbershops")
      .select("id, name, slug");

    let totalCreated = 0;

    for (const shop of barbershops || []) {
      // Fetch reactivation automations for this barbershop
      const { data: automations } = await supabase
        .from("automations")
        .select("type, enabled, config")
        .eq("barbershop_id", shop.id)
        .in("type", ["inactive_client", "inactive_client_60", "inactive_client_90"]);

      const autoMap = new Map<string, any>();
      (automations || []).forEach((a: any) => autoMap.set(a.type, a));

      // Process each tier
      const tiers = [
        { type: "inactive_client", defaultDays: 30 },
        { type: "inactive_client_60", defaultDays: 60 },
        { type: "inactive_client_90", defaultDays: 90 },
      ];

      for (const tier of tiers) {
        const auto = autoMap.get(tier.type);
        if (!auto || !auto.enabled) continue;

        const daysThreshold = auto.config?.days_threshold || tier.defaultDays;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
        const cutoffStr = cutoffDate.toISOString().split("T")[0];

        // Find clients whose last appointment is before cutoff
        // Get all clients for this barbershop
        const { data: clients } = await supabase
          .from("clients")
          .select("id, name, phone, email")
          .eq("barbershop_id", shop.id);

        for (const client of clients || []) {
          if (!client.phone && !client.email) continue;

          // Check last appointment
          const { data: lastAppt } = await supabase
            .from("appointments")
            .select("date")
            .eq("barbershop_id", shop.id)
            .eq("client_name", client.name)
            .neq("status", "cancelled")
            .order("date", { ascending: false })
            .limit(1);

          if (!lastAppt || lastAppt.length === 0) continue;

          const lastDate = lastAppt[0].date;
          if (lastDate >= cutoffStr) continue; // Not inactive yet

          // Check if we already sent this type of reactivation notification recently (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: existing } = await supabase
            .from("notifications")
            .select("id")
            .eq("barbershop_id", shop.id)
            .eq("recipient_name", client.name)
            .eq("type", `reactivation_${tier.type}`)
            .gte("created_at", thirtyDaysAgo.toISOString())
            .limit(1);

          if (existing && existing.length > 0) continue; // Already sent

          const channel = auto.config?.channel || "whatsapp";
          const bookingLink = `${supabaseUrl.replace('.supabase.co', '')}/agendar/${shop.slug}`;

          const templateVars: Record<string, string> = {
            client_name: client.name,
            nome: client.name,
            barbershop_name: shop.name,
            link: bookingLink,
          };

          const message = auto.config?.message
            ? replacePlaceholders(auto.config.message, templateVars)
            : `Olá, ${client.name}! 👋 Sentimos sua falta na *${shop.name}*.\n\nQue tal agendar um horário? Estamos te esperando!\n\n✂ Agende agora e garanta seu horário.`;

          await supabase.from("notifications").insert({
            barbershop_id: shop.id,
            channel,
            type: `reactivation_${tier.type}`,
            recipient_name: client.name,
            recipient_email: client.email,
            recipient_phone: client.phone,
            subject: `Sentimos sua falta - ${shop.name}`,
            body: message,
            status: "pending",
            scheduled_for: new Date().toISOString(),
          });

          totalCreated++;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, notifications_created: totalCreated }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("reactivate-clients error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
