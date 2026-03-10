/**
 * Frontend WhatsApp service — calls the send-whatsapp Edge Function.
 * Never calls Z-API (or any provider) directly from the browser.
 */
import { supabase } from "@/integrations/supabase/client";
import { buildWhatsAppMessage, type WhatsAppMessageParams } from "@/lib/whatsapp";

interface SendWhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

/**
 * Send a WhatsApp message via the backend Edge Function.
 */
export async function sendWhatsApp(
  phone: string,
  message: string,
  notificationId?: string
): Promise<SendWhatsAppResult> {
  try {
    const { data, error } = await supabase.functions.invoke("send-whatsapp", {
      body: { phone, message, notificationId },
    });

    if (error) {
      console.error("[whatsapp] Edge function error:", error.message);
      return { success: false, error: error.message };
    }

    return data as SendWhatsAppResult;
  } catch (err: any) {
    console.error("[whatsapp] Unexpected error:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

/**
 * Send a templated WhatsApp confirmation after appointment creation.
 */
export async function sendAppointmentConfirmation(
  params: WhatsAppMessageParams
): Promise<SendWhatsAppResult> {
  if (!params.clientPhone) {
    return { success: false, error: "No phone number provided" };
  }

  const message = buildWhatsAppMessage({ ...params, type: "confirmed" });
  return sendWhatsApp(params.clientPhone, message);
}
