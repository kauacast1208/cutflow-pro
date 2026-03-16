import { z } from "zod";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres`)
    .optional()
    .or(z.literal(""));

export const onboardingBarbershopSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da barbearia")
    .max(80, "O nome deve ter no máximo 80 caracteres"),
  phone: optionalText(30),
  address: optionalText(180),
  addressComplement: optionalText(120),
});

export const barbershopSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome da barbearia")
    .max(80, "O nome deve ter no máximo 80 caracteres"),
  phone: optionalText(30),
  address: optionalText(180),
  addressComplement: optionalText(120),
  instagram: optionalText(100),
  whatsapp: optionalText(30),
  description: optionalText(500),
  openingTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário de abertura inválido"),
  closingTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário de fechamento inválido"),
  slotInterval: z.number().int().min(5).max(180),
  bufferMinutes: z.number().int().min(0).max(180),
  minAdvance: z.number().int().min(0).max(168),
  allowCancel: z.boolean(),
  allowReschedule: z.boolean(),
  cancelLimit: z.number().int().min(0).max(168),
  autoConfirm: z.boolean(),
});

export type OnboardingBarbershopValues = z.infer<typeof onboardingBarbershopSchema>;
export type BarbershopSettingsValues = z.infer<typeof barbershopSettingsSchema>;

export function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export function buildBarbershopInsert(
  values: OnboardingBarbershopValues,
  ownerId: string,
  slug: string,
): TablesInsert<"barbershops"> {
  return {
    owner_id: ownerId,
    name: values.name.trim(),
    slug,
    phone: normalizeOptionalText(values.phone),
    address: normalizeOptionalText(values.address),
    address_complement: normalizeOptionalText(values.addressComplement),
  };
}

export function buildBarbershopUpdate(
  values: BarbershopSettingsValues,
): TablesUpdate<"barbershops"> {
  return {
    name: values.name.trim(),
    phone: normalizeOptionalText(values.phone),
    address: normalizeOptionalText(values.address),
    address_complement: normalizeOptionalText(values.addressComplement),
    instagram: normalizeOptionalText(values.instagram),
    whatsapp: normalizeOptionalText(values.whatsapp),
    description: normalizeOptionalText(values.description),
    opening_time: values.openingTime,
    closing_time: values.closingTime,
    slot_interval_minutes: values.slotInterval,
    buffer_minutes: values.bufferMinutes,
    min_advance_hours: values.minAdvance,
    allow_online_cancellation: values.allowCancel,
    allow_online_reschedule: values.allowReschedule,
    cancellation_limit_hours: values.cancelLimit,
    auto_confirm: values.autoConfirm,
  };
}

export function getBarbershopErrorMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") return fallback;

  const maybeMessage = "message" in error && typeof error.message === "string" ? error.message : "";
  const maybeCode = "code" in error && typeof error.code === "string" ? error.code : "";
  const normalized = maybeMessage.toLowerCase();

  if (maybeCode === "23505" || normalized.includes("duplicate key")) {
    if (normalized.includes("barbershops_slug_key")) {
      return "Já existe uma barbearia com esse identificador. Tente novamente.";
    }

    if (normalized.includes("subscriptions_barbershop_id_key")) {
      return "A assinatura inicial desta barbearia já foi criada. Tente novamente em alguns segundos.";
    }

    if (normalized.includes("profiles_user_id_key") || normalized.includes("user_roles_user_id_role_key")) {
      return "Seu cadastro inicial já existe. Atualize a página e tente novamente.";
    }

    return "Já existe um registro com esses dados. Tente novamente.";
  }

  if (normalized.includes("row-level security") || normalized.includes("permission denied")) {
    return "Você não tem permissão para concluir essa ação.";
  }

  if (normalized.includes("address_complement")) {
    return "O campo de complemento do endereço não está sincronizado corretamente no banco.";
  }

  return maybeMessage || fallback;
}
