import { supabase } from "@/integrations/supabase/client";
import { isNoRowsError, isMissingRelationError } from "@/lib/supabaseErrors";

// Re-export for consumers that import from tenant
export { isNoRowsError, isMissingRelationError } from "@/lib/supabaseErrors";

export type TenantRole = "owner" | "admin" | "professional" | "receptionist";
type TenantSubscriptionStatus = "trial" | "active" | "past_due" | "cancelled" | "expired";
type TenantSubscriptionPlan = "starter" | "pro" | "premium";

export interface TenantProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

export interface TenantBarbershop {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  address_complement: string | null;
  description: string | null;
  instagram: string | null;
  whatsapp: string | null;
  opening_time: string;
  closing_time: string;
  slot_interval_minutes: number;
  buffer_minutes: number;
  min_advance_hours: number;
  allow_online_cancellation: boolean;
  allow_online_reschedule: boolean;
  cancellation_limit_hours: number;
  auto_confirm: boolean;
}

export interface DirectTenantContext {
  onboardingRequired: boolean;
  barbershopId: string | null;
  role: TenantRole | null;
  subscription: {
    id: string;
    plan: TenantSubscriptionPlan;
    status: TenantSubscriptionStatus;
    trialEndsAt: string | null;
  } | null;
}

export interface TenantSnapshot {
  profile: TenantProfile | null;
  barbershop: TenantBarbershop | null;
  role: TenantRole;
  rawRole: string | null;
}

// ─── helpers ───

export async function findUserBarbershopId(userId: string) {
  const { data: owned, error: ownedError } = await supabase
    .from("barbershops")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (ownedError && !isNoRowsError(ownedError)) throw ownedError;
  if (owned?.id) return owned.id;

  const { data: professional, error: professionalError } = await supabase
    .from("professionals")
    .select("barbershop_id")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (professionalError && !isNoRowsError(professionalError)) throw professionalError;
  return professional?.barbershop_id ?? null;
}

export async function findUserRoleForBarbershop(userId: string, barbershopId: string) {
  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (roleError && !isMissingRelationError(roleError) && !isNoRowsError(roleError)) throw roleError;
  if (roleRow?.role) return roleRow.role;

  const { data: owned, error: ownedError } = await supabase
    .from("barbershops")
    .select("id")
    .eq("id", barbershopId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (ownedError && !isNoRowsError(ownedError)) throw ownedError;
  if (owned?.id) return "owner";

  const { data: professional, error: professionalError } = await supabase
    .from("professionals")
    .select("id")
    .eq("barbershop_id", barbershopId)
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (professionalError && !isNoRowsError(professionalError)) throw professionalError;
  return professional?.id ? "professional" : null;
}

// ─── core functions ───

export async function ensureCurrentUserSetup(fullName?: string | null): Promise<{ role: string | null }> {
  try {
    const { data, error } = await supabase.rpc("ensure_current_user_setup", {
      _full_name: fullName ?? undefined,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    return { role: row?.user_role ?? null };
  } catch (err) {
    console.warn("[tenant] ensureCurrentUserSetup error:", err);
    return { role: null };
  }
}

export function isMasterRole(role: string | null | undefined): boolean {
  return role === "master";
}

export async function fetchUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("get_user_role", { _user_id: userId });
  if (error) throw error;
  return (data as string) ?? null;
}

export async function fetchTenantSnapshot(userId: string): Promise<TenantSnapshot> {
  const [profileResult, barbershopResult] = await Promise.allSettled([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    findUserBarbershopId(userId),
  ]);

  const profile: TenantProfile | null =
    profileResult.status === "fulfilled" && profileResult.value.data
      ? (profileResult.value.data as TenantProfile)
      : null;

  const barbershopId =
    barbershopResult.status === "fulfilled" ? barbershopResult.value : null;

  let barbershop: TenantBarbershop | null = null;
  let rawRole: string | null = null;
  let role: TenantRole = "owner";

  if (barbershopId) {
    const [shopResult, roleResult] = await Promise.allSettled([
      supabase.from("barbershops").select("*").eq("id", barbershopId).maybeSingle(),
      findUserRoleForBarbershop(userId, barbershopId),
    ]);

    if (shopResult.status === "fulfilled" && shopResult.value.data) {
      barbershop = shopResult.value.data as TenantBarbershop;
    }

    if (roleResult.status === "fulfilled" && roleResult.value) {
      rawRole = roleResult.value;
      role = rawRole as TenantRole;
    }
  }

  return { profile, barbershop, role, rawRole };
}

export async function resolveTenantContextDirect(userId: string): Promise<DirectTenantContext> {
  const barbershopId = await findUserBarbershopId(userId);

  if (!barbershopId) {
    return { onboardingRequired: true, barbershopId: null, role: null, subscription: null };
  }

  const role = (await findUserRoleForBarbershop(userId, barbershopId)) as TenantRole | null;

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("id, plan, status, trial_ends_at")
    .eq("barbershop_id", barbershopId)
    .maybeSingle();

  if (subscriptionError && !isNoRowsError(subscriptionError) && !isMissingRelationError(subscriptionError)) {
    throw subscriptionError;
  }

  return {
    onboardingRequired: false,
    barbershopId,
    role,
    subscription: subscription?.id
      ? {
          id: subscription.id,
          plan: subscription.plan as TenantSubscriptionPlan,
          status: subscription.status as TenantSubscriptionStatus,
          trialEndsAt: subscription.trial_ends_at,
        }
      : null,
  };
}
