/**
 * WhatsApp message utilities for booking confirmations.
 */
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/format";

export interface WhatsAppMessageParams {
  clientName: string;
  clientPhone: string;
  barbershopName: string;
  serviceName: string;
  date: string;        // "yyyy-MM-dd"
  startTime: string;   // "HH:mm"
  endTime?: string;
  price?: number;
  professionalName?: string;
  type?: "confirmed" | "cancelled" | "rescheduled" | "reminder";
}

const templates: Record<string, (p: WhatsAppMessageParams) => string> = {
  confirmed: (p) =>
    `Olá, ${p.clientName}! ✅ Seu horário está *confirmado* na *${p.barbershopName}*.\n\n` +
    `✂ *Serviço:* ${p.serviceName}\n` +
    (p.professionalName ? `💈 *Profissional:* ${p.professionalName}\n` : "") +
    `📅 *Data:* ${formatDatePtBR(p.date)}\n` +
    `⏰ *Horário:* ${p.startTime}${p.endTime ? ` - ${p.endTime}` : ""}\n` +
    (p.price ? `💰 *Valor:* ${formatCurrency(p.price)}\n` : "") +
    `\nPrecisa remarcar? Responda esta mensagem.\n\nTe esperamos! 👋`,

  cancelled: (p) =>
    `Olá, ${p.clientName}. Seu horário na *${p.barbershopName}* foi *cancelado*.\n\n` +
    `✂ *Serviço:* ${p.serviceName}\n` +
    `📅 *Data:* ${formatDatePtBR(p.date)}\n` +
    `⏰ *Horário:* ${p.startTime}\n` +
    `\nQuer reagendar? Responda esta mensagem e marcamos um novo horário para você!`,

  rescheduled: (p) =>
    `Olá, ${p.clientName}! Seu horário na *${p.barbershopName}* foi *remarcado*.\n\n` +
    `✂ *Serviço:* ${p.serviceName}\n` +
    `📅 *Nova data:* ${formatDatePtBR(p.date)}\n` +
    `⏰ *Novo horário:* ${p.startTime}${p.endTime ? ` - ${p.endTime}` : ""}\n` +
    `\nPrecisa de algo? Responda esta mensagem.\n\nTe esperamos! 👋`,

  reminder: (p) =>
    `Olá, ${p.clientName}! Seu horário está chegando na *${p.barbershopName}*.\n\n` +
    `✂ *Serviço:* ${p.serviceName}\n` +
    `⏰ *Horário:* ${p.startTime}\n` +
    `\nEvite perder seu horário — compareça no horário marcado.\n` +
    `Precisa remarcar? Responda esta mensagem.\n\nTe esperamos! 👋`,
};

function formatDatePtBR(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  } catch {
    return dateStr;
  }
}

/** Build a formatted WhatsApp message */
export function buildWhatsAppMessage(params: WhatsAppMessageParams): string {
  const type = params.type || "confirmed";
  const builder = templates[type] || templates.confirmed;
  return builder(params);
}

/** Build the wa.me URL ready to open */
export function buildWhatsAppUrl(params: WhatsAppMessageParams): string | null {
  if (!params.clientPhone) return null;

  // Clean phone number: remove non-digits
  const phone = params.clientPhone.replace(/\D/g, "");
  // Ensure country code
  const fullPhone = phone.startsWith("55") ? phone : `55${phone}`;

  const message = buildWhatsAppMessage(params);
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}
