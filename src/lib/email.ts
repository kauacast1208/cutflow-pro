import { supabase } from "@/integrations/supabase/client";
import { format, addMinutes, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/format";

type EmailType = "confirmed" | "cancelled" | "rescheduled";

interface SendBookingEmailParams {
  type: EmailType;
  clientName: string;
  clientEmail: string;
  service: { name: string; price: number; duration_minutes: number };
  professional: { name: string };
  selectedDate: Date;
  selectedTime: string;
  barbershop: { id: string; name: string; address?: string; slug: string };
  // For rescheduled
  newDate?: Date;
  newStartTime?: string;
}

export async function sendBookingEmail(params: SendBookingEmailParams) {
  const { type, clientEmail, clientName, service, professional, selectedDate, selectedTime, barbershop, newDate, newStartTime } = params;

  if (!clientEmail) return; // silently skip if no email

  const endTime = format(
    addMinutes(parse(selectedTime, "HH:mm", selectedDate), service.duration_minutes),
    "HH:mm"
  );

  const dateFormatted = format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR });

  const payload: Record<string, string | undefined> = {
    type,
    clientName,
    clientEmail,
    serviceName: service.name,
    professionalName: professional.name,
    date: dateFormatted,
    startTime: selectedTime,
    endTime,
    price: formatCurrency(Number(service.price)),
    barbershopName: barbershop.name,
    barbershopId: barbershop.id,
    barbershopAddress: barbershop.address || undefined,
    bookingUrl: `${window.location.origin}/agendar/${barbershop.slug}`,
  };

  if (type === "rescheduled" && newDate && newStartTime) {
    payload.newDate = format(newDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
    payload.newStartTime = newStartTime;
    payload.newEndTime = format(
      addMinutes(parse(newStartTime, "HH:mm", newDate), service.duration_minutes),
      "HH:mm"
    );
  }

  try {
    await supabase.functions.invoke("send-booking-email", { body: payload });
  } catch (err) {
    console.error("Failed to send booking email:", err);
  }
}
