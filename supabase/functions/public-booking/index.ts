import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[PUBLIC-BOOKING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();
    const {
      barbershop_id,
      services,
      professional_id,
      client_name,
      client_phone,
      client_email,
      client_notes,
      date,
      start_time,
      auto_confirm,
    } = body;

    // --- Input validation ---
    if (!barbershop_id || typeof barbershop_id !== "string") {
      return new Response(JSON.stringify({ error: "barbershop_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!professional_id || typeof professional_id !== "string") {
      return new Response(JSON.stringify({ error: "professional_id é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!client_name || typeof client_name !== "string" || client_name.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Nome do cliente é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!date || !start_time) {
      return new Response(JSON.stringify({ error: "Data e horário são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return new Response(JSON.stringify({ error: "Pelo menos um serviço é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize inputs
    const sanitizedName = client_name.trim().slice(0, 100);
    const sanitizedPhone = (client_phone || "").trim().slice(0, 20);
    const sanitizedEmail = (client_email || "").trim().slice(0, 255).toLowerCase();
    const sanitizedNotes = (client_notes || "").trim().slice(0, 500);
    const sanitizedDate = date.slice(0, 10); // YYYY-MM-DD

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sanitizedDate)) {
      return new Response(JSON.stringify({ error: "Formato de data inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(start_time)) {
      return new Response(JSON.stringify({ error: "Formato de horário inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify barbershop exists
    const { data: barbershop, error: bsError } = await supabase
      .from("barbershops")
      .select("id")
      .eq("id", barbershop_id)
      .maybeSingle();

    if (bsError || !barbershop) {
      return new Response(JSON.stringify({ error: "Barbearia não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify professional exists and belongs to barbershop
    const { data: professional, error: proError } = await supabase
      .from("professionals")
      .select("id")
      .eq("id", professional_id)
      .eq("barbershop_id", barbershop_id)
      .eq("active", true)
      .maybeSingle();

    if (proError || !professional) {
      return new Response(JSON.stringify({ error: "Profissional não encontrado ou inativo" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify all services exist and belong to barbershop
    const serviceIds = services.map((s: any) => s.id);
    const { data: validServices, error: svcError } = await supabase
      .from("services")
      .select("id, duration_minutes, price")
      .eq("barbershop_id", barbershop_id)
      .eq("active", true)
      .in("id", serviceIds);

    if (svcError || !validServices || validServices.length !== serviceIds.length) {
      return new Response(JSON.stringify({ error: "Um ou mais serviços são inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Validation passed", { barbershop_id, professional_id, services: serviceIds.length });

    // Upsert client (using phone as match key)
    if (sanitizedName && sanitizedPhone) {
      const { data: existingClients } = await supabase
        .from("clients")
        .select("id")
        .eq("barbershop_id", barbershop_id)
        .eq("phone", sanitizedPhone)
        .limit(1);

      if (existingClients && existingClients.length > 0) {
        await supabase
          .from("clients")
          .update({
            name: sanitizedName,
            email: sanitizedEmail || null,
          })
          .eq("id", existingClients[0].id);
        logStep("Client updated", { clientId: existingClients[0].id });
      } else {
        await supabase.from("clients").insert({
          barbershop_id,
          name: sanitizedName,
          phone: sanitizedPhone,
          email: sanitizedEmail || null,
        });
        logStep("Client created");
      }
    }

    // Build a map of valid services by ID for quick lookup
    const svcMap = new Map(validServices.map((s) => [s.id, s]));

    // Create appointments chaining times
    let currentTime = start_time;
    let firstAppointmentId: string | null = null;
    const status = auto_confirm ? "confirmed" : "scheduled";

    for (const svcInput of services) {
      const svc = svcMap.get(svcInput.id);
      if (!svc) continue;

      // Calculate end time
      const [hours, minutes] = currentTime.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + svc.duration_minutes;
      const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
      const endMins = (totalMinutes % 60).toString().padStart(2, "0");
      const endTime = `${endHours}:${endMins}`;

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          barbershop_id,
          service_id: svc.id,
          professional_id,
          client_name: sanitizedName,
          client_phone: sanitizedPhone,
          client_email: sanitizedEmail || null,
          notes: sanitizedNotes || null,
          date: sanitizedDate,
          start_time: currentTime,
          end_time: endTime,
          price: svc.price,
          status,
        })
        .select("id")
        .single();

      if (error) {
        logStep("Error creating appointment", { error: error.message });
        return new Response(JSON.stringify({ error: "Erro ao criar agendamento" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (data && !firstAppointmentId) {
        firstAppointmentId = data.id;
      }

      currentTime = endTime;
    }

    logStep("Booking completed", { firstAppointmentId });

    return new Response(
      JSON.stringify({ success: true, appointment_id: firstAppointmentId }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
