/**
 * Formatting utilities for the CutFlow application.
 */

/** Format a phone number to Brazilian format: (XX) XXXXX-XXXX */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Format a number as BRL currency */
export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2)}`;
}

/** Get initials from a full name (max 2 chars) */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
