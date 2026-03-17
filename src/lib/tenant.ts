import { supabase } from "@/integrations/supabase/client";
import { isMissingRelationError, isNoRowsError } from "@/lib/supabaseErrors";

type TenantRole = "owner" | "admin" | "professional" | "receptionist";
type TenantSubscriptionStatus = "trial" | "active" | "past_due" | "cancelled" | "expired";
type TenantSubscriptionPlan = "starter" | "pro" | "premium";

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

  const { data: professional, error: professionalError } = await supabase
    .from("professionals")
    .select("barbershop_id")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (professionalError && !isNoRowsError(professionalError)) {
    throw professionalError;
  }

  return professional?.barbershop_id ?? null;
}

export async function findUserRoleForBarbershop(userId: string, barbershopId: string) {
  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("barbershop_id", barbershopId)
    .maybeSingle();

  if (roleError && !isMissingRelationError(roleError) && !isNoRowsError(roleError)) {
    throw roleError;
  }

  if (roleRow?.role) {
    return roleRow.role;
  }

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

  const { data: professional, error: professionalError } = await supabase
    .from("professionals")
    .select("id")
    .eq("barbershop_id", barbershopId)
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (professionalError && !isNoRowsError(professionalError)) {
    throw professionalError;
  }

  return professional?.id ? "professional" : null;
}

export async function resolveTenantContextDirect(userId: string): Promise<DirectTenantContext> {
  const barbershopId = await findUserBarbershopId(userId);

  if (!barbershopId) {
    return {
      onboardingRequired: true,
      barbershopId: null,
      role: null,
      subscription: null,
    };
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
