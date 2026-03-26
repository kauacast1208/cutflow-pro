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

    // Get all active loyalty programs
    const { data: programs } = await supabase
      .from("loyalty_programs")
      .select("*, barbershops(name, slug)")
      .eq("enabled", true);

    let updated = 0;
    let earned = 0;
    let notified = 0;

    const normalizeServiceIds = (program: any) => {
      if (Array.isArray(program?.service_ids)) {
        return program.service_ids.filter((item: unknown): item is string => typeof item === "string");
      }

      if (typeof program?.specific_service_id === "string" && program.specific_service_id) {
        return [program.specific_service_id];
      }

      return [];
    };

    for (const program of programs || []) {
      const shopName = (program as any).barbershops?.name || "Barbearia";
      const selectedServiceIds = normalizeServiceIds(program);

      // Get all clients for this barbershop
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, phone, email")
        .eq("barbershop_id", program.barbershop_id);

      for (const client of clients || []) {
        // Calculate progress based on program type
        let progress = 0;
        let totalSpent = 0;

        if (program.type === "visits") {
          const { count } = await supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("barbershop_id", program.barbershop_id)
            .eq("client_name", client.name)
            .eq("status", "completed");
          progress = count || 0;
        } else if (program.type === "spending") {
          const { data: appts } = await supabase
            .from("appointments")
            .select("price")
            .eq("barbershop_id", program.barbershop_id)
            .eq("client_name", client.name)
            .eq("status", "completed");
          totalSpent = (appts || []).reduce((sum: number, a: any) => sum + (Number(a.price) || 0), 0);
          progress = Math.floor(totalSpent / program.target);
        } else if (program.type === "specific_service" && selectedServiceIds.length > 0) {
          const { count } = await supabase
            .from("appointments")
            .select("id", { count: "exact", head: true })
            .eq("barbershop_id", program.barbershop_id)
            .eq("client_name", client.name)
            .in("service_id", selectedServiceIds)
            .eq("status", "completed");
          progress = count || 0;
        }

        if (progress === 0 && totalSpent === 0) continue;

        // For spending type, progress means completed cycles
        const effectiveProgress = program.type === "spending"
          ? Math.floor(totalSpent / program.target) > 0 ? program.target : Math.floor(totalSpent % program.target / (program.target / program.target))
          : progress;

        // Normalize progress for display (modulo target for cycles)
        const cycleProgress = program.type === "spending"
          ? totalSpent
          : progress % program.target || (progress >= program.target ? program.target : 0);

        const hasReachedTarget = program.type === "spending"
          ? totalSpent >= program.target
          : progress >= program.target;

        // Check existing reward
        const { data: existingReward } = await supabase
          .from("loyalty_rewards")
          .select("*")
          .eq("program_id", program.id)
          .eq("client_id", client.id)
          .in("status", ["in_progress", "earned"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingReward) {
          // Update progress
          const newProgress = program.type === "spending"
            ? Math.min(program.target, Math.floor((totalSpent % (program.target * (Math.floor(totalSpent / program.target) || 1))) ))
            : progress % program.target;

          if (existingReward.status === "in_progress") {
            const displayProgress = program.type === "spending"
              ? Math.min(program.target, totalSpent)
              : progress;

            await supabase.from("loyalty_rewards").update({
              progress: displayProgress,
              total_spent: totalSpent,
            }).eq("id", existingReward.id);
            updated++;

            // Check if just earned
            if (hasReachedTarget) {
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + program.reward_validity_days);

              await supabase.from("loyalty_rewards").update({
                status: "earned",
                earned_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
                progress: program.target,
              }).eq("id", existingReward.id);
              earned++;

              // Send earned notification
              if (client.phone || client.email) {
                const msg = (program.notification_message || "")
                  .split("{{client_name}}").join(client.name)
                  .split("{{reward}}").join(program.reward_description)
                  .split("{{barbershop_name}}").join(shopName);

                await supabase.from("notifications").insert({
                  barbershop_id: program.barbershop_id,
                  channel: client.phone ? "whatsapp" : "email",
                  type: "loyalty_earned",
                  recipient_name: client.name,
                  recipient_phone: client.phone,
                  recipient_email: client.email,
                  subject: `🎉 Recompensa disponível - ${shopName}`,
                  body: msg,
                  status: "pending",
                  scheduled_for: new Date().toISOString(),
                });
                notified++;
              }
            } else {
              // Check if near target → send "almost there" notification
              const remaining = program.target - (program.type === "spending" ? totalSpent : progress);
              if (remaining > 0 && remaining <= program.near_threshold) {
                // Check if already sent near notification recently
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                const { data: recentNotif } = await supabase
                  .from("notifications")
                  .select("id")
                  .eq("barbershop_id", program.barbershop_id)
                  .eq("recipient_name", client.name)
                  .eq("type", "loyalty_near")
                  .gte("created_at", weekAgo.toISOString())
                  .limit(1);

                if (!recentNotif || recentNotif.length === 0) {
                  const remainStr = program.type === "spending"
                    ? `R$ ${remaining.toFixed(0)}`
                    : `${remaining} ${remaining === 1 ? "visita" : "visitas"}`;

                  const msg = (program.notification_near_message || "")
                    .split("{{client_name}}").join(client.name)
                    .split("{{remaining}}").join(remainStr)
                    .split("{{reward}}").join(program.reward_description)
                    .split("{{barbershop_name}}").join(shopName);

                  await supabase.from("notifications").insert({
                    barbershop_id: program.barbershop_id,
                    channel: client.phone ? "whatsapp" : "email",
                    type: "loyalty_near",
                    recipient_name: client.name,
                    recipient_phone: client.phone,
                    recipient_email: client.email,
                    subject: `⭐ Falta pouco! - ${shopName}`,
                    body: msg,
                    status: "pending",
                    scheduled_for: new Date().toISOString(),
                  });
                  notified++;
                }
              }
            }
          }
        } else if (progress > 0 || totalSpent > 0) {
          // Create new reward tracker
          const displayProgress = program.type === "spending"
            ? Math.min(program.target, totalSpent)
            : Math.min(program.target, progress);

          const status = hasReachedTarget ? "earned" : "in_progress";
          const expiresAt = hasReachedTarget
            ? new Date(Date.now() + program.reward_validity_days * 24 * 60 * 60 * 1000).toISOString()
            : null;

          await supabase.from("loyalty_rewards").insert({
            barbershop_id: program.barbershop_id,
            client_id: client.id,
            program_id: program.id,
            progress: displayProgress,
            total_spent: totalSpent,
            target: program.target,
            reward_description: program.reward_description,
            status,
            earned_at: hasReachedTarget ? new Date().toISOString() : null,
            expires_at: expiresAt,
          });
          updated++;
          if (hasReachedTarget) earned++;
        }
      }

      // Expire old rewards
      await supabase
        .from("loyalty_rewards")
        .update({ status: "expired" })
        .eq("program_id", program.id)
        .eq("status", "earned")
        .lt("expires_at", new Date().toISOString());
    }

    return new Response(
      JSON.stringify({ success: true, updated, earned, notified }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-loyalty error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
