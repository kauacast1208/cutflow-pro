import { supabase } from "@/integrations/supabase/client";
import { isMissingRelationError, isNoRowsError } from "@/lib/supabaseErrors";
import { getAuthenticatedUser, resolveUserFullName, upsertProfileForUser } from "@/lib/profile";

export { isNoRowsError, isMissingRelationError } from "@/lib/supabaseErrors";

export type TenantRole = "owner" | "admin" | "professional" | "receptionist" | "master";
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

export async function bootstrapCurrentUserProfile(fullName?: string | null): Promise<{ role: string | null }> {
  try {
    const user = await getAuthenticatedUser();
    await upsertProfileForUser(user, fullName ?? resolveUserFullName(user));
  } catch (error) {
    console.warn("[tenant] bootstrapCurrentUserProfile warning:", error);
  }

  return { role: null };
}

export function isMasterRole(role: string | null | undefined): boolean {
  return role === "master";
}

async function fetchRoleRows(userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error && !isMissingRelationError(error) && !isNoRowsError(error)) {
    throw error;
  }

  return (data ?? []).map((row) => row.role as TenantRole);
}

export async function fetchUserRole(userId: string): Promise<string | null> {
  const roles = await fetchRoleRows(userId);

  if (roles.includes("master")) return "master";
  if (roles.includes("owner")) return "owner";
  if (roles.includes("admin")) return "admin";
  if (roles.includes("professional")) return "professional";
  if (roles.includes("receptionist")) return "receptionist";

  return null;
}

async function safeFetchUserRole(userId: string) {
  try {
    return await fetchUserRole(userId);
  } catch (error) {
    console.warn("[Tenant] step-resolve_tenant_optional_user_roles skipped", {
      userId,
      error,
    });
    return null;
  }
}

async function findProfessionalMembership(userId: string, barbershopId?: string | null) {
  try {
    let query = supabase
      .from("professionals")
      .select("id, barbershop_id")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (barbershopId) {
      query = query.eq("barbershop_id", barbershopId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      if (isNoRowsError(error)) {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.warn("[Tenant] step-resolve_tenant_optional_professionals skipped", {
      userId,
      barbershopId: barbershopId ?? null,
      error,
    });
    return null;
  }
}

export async function findUserBarbershopId(userId: string) {
  const { data: owned, error: ownedError } = await supabase
    .from("barbershops")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (ownedError && !isNoRowsError(ownedError)) {
    throw ownedError;
  }

  if (owned?.id) {
    return owned.id;
  }

  const professional = await findProfessionalMembership(userId);
  return professional?.barbershop_id ?? null;
}

export async function findUserRoleForBarbershop(userId: string, barbershopId: string) {
  const { data: owned, error: ownedError } = await supabase
    .from("barbershops")
    .select("id")
    .eq("id", barbershopId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (ownedError && !isNoRowsError(ownedError)) {
    throw ownedError;
  }

  if (owned?.id) {
    return "owner";
  }

  const directRole = await fetchUserRole(userId);
  if (directRole && directRole !== "master") {
    return directRole;
  }

  const professional = await findProfessionalMembership(userId, barbershopId);
  return professional?.id ? "professional" : null;
}

export async function fetchTenantSnapshot(userId: string): Promise<TenantSnapshot> {
  const [profileResult, ownerBarbershopResult, roleResult] = await Promise.allSettled([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("barbershops").select("*").eq("owner_id", userId).maybeSingle(),
    safeFetchUserRole(userId),
  ]);

  const profile =
    profileResult.status === "fulfilled" && profileResult.value.data
      ? (profileResult.value.data as TenantProfile)
      : null;

  const directRole =
    roleResult.status === "fulfilled" && roleResult.value
      ? roleResult.value
      : null;

  if (ownerBarbershopResult.status === "fulfilled" && ownerBarbershopResult.value.data) {
    return {
      profile,
      barbershop: ownerBarbershopResult.value.data as TenantBarbershop,
      role: "owner",
      rawRole: directRole ?? "owner",
    };
  }

  const professional = await findProfessionalMembership(userId);
  if (!professional?.barbershop_id) {
    return {
      profile,
      barbershop: null,
      role: (directRole as TenantRole | null) ?? "owner",
      rawRole: directRole,
    };
  }

  const { data: barbershop, error: barbershopError } = await supabase
    .from("barbershops")
    .select("*")
    .eq("id", professional.barbershop_id)
    .maybeSingle();

  if (barbershopError && !isNoRowsError(barbershopError)) {
    throw barbershopError;
  }

  const resolvedRole = ((await findUserRoleForBarbershop(userId, professional.barbershop_id)) ?? directRole ?? "owner") as TenantRole;

  return {
    profile,
    barbershop: (barbershop as TenantBarbershop | null) ?? null,
    role: resolvedRole,
    rawRole: directRole,
  };
}

export async function resolveTenantContextDirect(userId: string): Promise<DirectTenantContext> {
  const { data: owned, error: ownedError } = await supabase
    .from("barbershops")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (ownedError && !isNoRowsError(ownedError)) {
    throw ownedError;
  }

  const directRole = await safeFetchUserRole(userId);
  let barbershopId = owned?.id ?? null;

  if (!barbershopId) {
    const professional = await findProfessionalMembership(userId);
    barbershopId = professional?.barbershop_id ?? null;
  }

  if (!barbershopId) {
    return {
      onboardingRequired: true,
      barbershopId: null,
      role: null,
      subscription: null,
    };
  }

  const role = ((owned?.id ? "owner" : null) ?? (await findUserRoleForBarbershop(userId, barbershopId)) ?? directRole ?? "owner") as TenantRole;

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

export async function ensureCurrentUserSetup(fullName?: string | null): Promise<{ role: string | null }> {
  return bootstrapCurrentUserProfile(fullName);
}
