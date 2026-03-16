/**
 * Reusable WhatsApp external link utilities.
 *
 * These helpers ensure WhatsApp links always open as top-level browser
 * navigations, avoiding ERR_BLOCKED_BY_RESPONSE in iframe/embedded contexts.
 */

const CUTFLOW_WHATSAPP = "5553999481954";

/**
 * Build a clean wa.me URL with pre-filled message.
 */
export function buildWhatsAppCTAUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Open WhatsApp in a new top-level window.
 * Uses window.open to bypass iframe/embedded context restrictions.
 */
export function openWhatsApp(phone: string, message: string): void {
  const url = buildWhatsAppCTAUrl(phone, message);
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Open the CutFlow sales WhatsApp with a preset message.
 */
export function openCutFlowWhatsApp(message: string): void {
  openWhatsApp(CUTFLOW_WHATSAPP, message);
}

/**
 * onClick handler factory — prevents default anchor behavior
 * and forces window.open for reliable external navigation.
 */
export function whatsAppClickHandler(phone: string, message: string) {
  return (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openWhatsApp(phone, message);
  };
}

export { CUTFLOW_WHATSAPP };
