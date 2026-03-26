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

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const overlaps = (startA: number, endA: number, startB: number, endB: number) =>
  startA < endB && endA > startB;

const getWeekday = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
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
      service_id,
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

    const normalizedServices = Array.isArray(services)
      ? services
      : typeof service_id === "string" && service_id
        ? [{ id: service_id }]
        : [];

    if (!Array.isArray(normalizedServices) || normalizedServices.length === 0) {
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
      .select("id, work_days, work_start, work_end, break_start_time, break_end_time")
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
    const serviceIds = normalizedServices
      .map((s: any) => s.id)
      .filter((id: unknown): id is string => typeof id === "string" && id.length > 0);
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

    const weekday = getWeekday(sanitizedDate);
    const { data: availabilityRows, error: availabilityError } = await supabase
      .from("professional_availability")
      .select("start_time, end_time")
      .eq("professional_id", professional_id)
      .eq("weekday", weekday)
      .order("start_time", { ascending: true });

    if (availabilityError) {
      return new Response(JSON.stringify({ error: "Erro ao validar disponibilidade do profissional" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("start_time, end_time, status")
      .eq("barbershop_id", barbershop_id)
      .eq("professional_id", professional_id)
      .eq("date", sanitizedDate)
      .in("status", ["scheduled", "confirmed"]);

    if (appointmentsError) {
      return new Response(JSON.stringify({ error: "Erro ao validar conflitos de agenda" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [datedBlockedRes, recurringBlockedRes] = await Promise.all([
      supabase
        .from("blocked_times")
        .select("all_day, start_time, end_time, recurring, recurring_days, date, professional_id")
        .eq("barbershop_id", barbershop_id)
        .eq("recurring", false)
        .eq("date", sanitizedDate),
      supabase
        .from("blocked_times")
        .select("all_day, start_time, end_time, recurring, recurring_days, date, professional_id")
        .eq("barbershop_id", barbershop_id)
        .eq("recurring", true)
        .contains("recurring_days", [weekday]),
    ]);

    if (datedBlockedRes.error || recurringBlockedRes.error) {
      return new Response(JSON.stringify({ error: "Erro ao validar bloqueios da agenda" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const relevantBlockedTimes = [...(datedBlockedRes.data || []), ...(recurringBlockedRes.data || [])]
      .filter((blocked) => !blocked.professional_id || blocked.professional_id === professional_id);

    const professionalWorkDays = Array.isArray(professional.work_days) ? professional.work_days : [];
    if (professionalWorkDays.length > 0 && !professionalWorkDays.includes(weekday) && (!availabilityRows || availabilityRows.length === 0)) {
      return new Response(JSON.stringify({ error: "Profissional indisponível neste dia" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const workingWindows = availabilityRows && availabilityRows.length > 0
      ? availabilityRows.map((item) => ({ start: item.start_time.slice(0, 5), end: item.end_time.slice(0, 5) }))
      : [{
          start: professional.work_start?.slice(0, 5) || "09:00",
          end: professional.work_end?.slice(0, 5) || "19:00",
        }];

    const professionalBreakStart = professional.break_start_time?.slice(0, 5) || null;
    const professionalBreakEnd = professional.break_end_time?.slice(0, 5) || null;

    // Create appointments chaining times
    let currentTime = start_time;
    let firstAppointmentId: string | null = null;
    const status = auto_confirm ? "confirmed" : "scheduled";

    for (const svcInput of normalizedServices) {
      const svc = svcMap.get(svcInput.id);
      if (!svc) continue;

      // Calculate end time
      const [hours, minutes] = currentTime.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + svc.duration_minutes;
      const endHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
      const endMins = (totalMinutes % 60).toString().padStart(2, "0");
      const endTime = `${endHours}:${endMins}`;
      const startMinutes = toMinutes(currentTime);
      const endMinutes = toMinutes(endTime);

      const fitsWorkingWindow = workingWindows.some((window) =>
        startMinutes >= toMinutes(window.start) &&
        endMinutes <= toMinutes(window.end)
      );

      if (!fitsWorkingWindow) {
        return new Response(JSON.stringify({ error: "O horário escolhido está fora do expediente do profissional" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (
        professionalBreakStart &&
        professionalBreakEnd &&
        overlaps(startMinutes, endMinutes, toMinutes(professionalBreakStart), toMinutes(professionalBreakEnd))
      ) {
        return new Response(JSON.stringify({ error: "O horário escolhido conflita com o intervalo do profissional" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const hasAppointmentConflict = (existingAppointments || []).some((appointment) =>
        overlaps(startMinutes, endMinutes, toMinutes(appointment.start_time.slice(0, 5)), toMinutes(appointment.end_time.slice(0, 5)))
      );

      if (hasAppointmentConflict) {
        return new Response(JSON.stringify({ error: "O horário escolhido acabou de ser reservado" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const hasBlockedConflict = relevantBlockedTimes.some((blocked) => {
        if (blocked.all_day) return true;
        if (!blocked.start_time || !blocked.end_time) return false;
        return overlaps(startMinutes, endMinutes, toMinutes(blocked.start_time.slice(0, 5)), toMinutes(blocked.end_time.slice(0, 5)));
      });

      if (hasBlockedConflict) {
        return new Response(JSON.stringify({ error: "O horário escolhido está bloqueado" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

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

      existingAppointments?.push({
        start_time: currentTime,
        end_time: endTime,
        status,
      });

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
