import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: barbershops } = await supabase
      .from("barbershops")
      .select("id, name, slug");

    let totalNotifications = 0;

    for (const shop of barbershops || []) {
      // Fetch retention-related automations
      const { data: automations } = await supabase
        .from("automations")
        .select("type, enabled, config")
        .eq("barbershop_id", shop.id)
        .in("type", ["inactive_client", "inactive_client_60", "inactive_client_90"]);

      const autoMap = new Map<string, any>();
      (automations || []).forEach((a: any) => autoMap.set(a.type, a));

      // Get all clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, phone, email")
        .eq("barbershop_id", shop.id);

      // Get all completed appointments
      const { data: allAppts } = await supabase
        .from("appointments")
        .select("client_name, client_email, client_phone, date")
        .eq("barbershop_id", shop.id)
        .neq("status", "cancelled")
        .order("date", { ascending: true });

      // Build client visit map
      const clientVisits = new Map<string, string[]>();
      (allAppts || []).forEach((a: any) => {
        const key = (a.client_email || a.client_phone || a.client_name).toLowerCase();
        if (!clientVisits.has(key)) clientVisits.set(key, []);
        clientVisits.get(key)!.push(a.date);
      });

      for (const client of clients || []) {
        if (!client.phone && !client.email) continue;

        const key = (client.email || client.phone || client.name).toLowerCase();
        const dates = clientVisits.get(key) || [];
        if (dates.length < 2) continue;

        // Calculate average frequency
        const sorted = [...dates].sort();
        const intervals: number[] = [];
        for (let i = 1; i < sorted.length; i++) {
          const diff = Math.floor(
            (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diff > 0) intervals.push(diff);
        }
        if (intervals.length === 0) continue;

        const avgFreq = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length);
        const lastVisit = sorted[sorted.length - 1];
        const daysSince = Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24));

        // Determine which automation tier applies
        let tierType: string | null = null;
        if (daysSince >= 90) tierType = "inactive_client_90";
        else if (daysSince >= 60) tierType = "inactive_client_60";
        else if (daysSince > avgFreq * 1.25 && daysSince >= 30) tierType = "inactive_client";

        if (!tierType) continue;

        const auto = autoMap.get(tierType);
        if (!auto || !auto.enabled) continue;

        // Check if we already notified recently (last 14 days)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const { data: recent } = await supabase
          .from("notifications")
          .select("id")
          .eq("barbershop_id", shop.id)
          .eq("recipient_name", client.name)
          .like("type", "retention_%")
          .gte("created_at", twoWeeksAgo.toISOString())
          .limit(1);

        if (recent && recent.length > 0) continue;

        const channel = auto.config?.channel || "whatsapp";
        const message = (auto.config?.message || `Olá ${client.name}! Sentimos sua falta.`)
          .split("{{client_name}}").join(client.name)
          .split("{{nome}}").join(client.name)
          .split("{{barbershop_name}}").join(shop.name)
          .split("{{link}}").join("");

        await supabase.from("notifications").insert({
          barbershop_id: shop.id,
          channel,
          type: `retention_${tierType}`,
          recipient_name: client.name,
          recipient_phone: client.phone,
          recipient_email: client.email,
          subject: `Sentimos sua falta - ${shop.name}`,
          body: message,
          status: "pending",
          scheduled_for: new Date().toISOString(),
        });
        totalNotifications++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, notifications_created: totalNotifications }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-retention error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
