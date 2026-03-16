import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type TenantRole = "owner" | "admin" | "professional" | "receptionist";
export type RawUserRole = TenantRole | "master" | null;
export type TenantProfile = Tables<"profiles">;
export type TenantBarbershop = Tables<"barbershops">;

function getErrorStatus(error: unknown) {
  return typeof error === "object" && error && "status" in error && typeof error.status === "number"
    ? error.status
    : null;
}

function getErrorCode(error: unknown) {
  return typeof error === "object" && error && "code" in error && typeof error.code === "string"
    ? error.code
    : "";
}

function getErrorMessage(error: unknown) {
  return typeof error === "object" && error && "message" in error && typeof error.message === "string"
    ? error.message.toLowerCase()
    : "";
}

export function isNoRowsError(error: unknown) {
  const status = getErrorStatus(error);
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return (
    status === 406 ||
    code === "PGRST116" ||
    message.includes("0 rows") ||
    message.includes("no rows") ||
    message.includes("json object requested")
  );
}

export function normalizeTenantRole(role: RawUserRole | string | undefined): TenantRole {
  if (role === "admin" || role === "professional" || role === "receptionist" || role === "owner") {
    return role;
  }

  return "owner";
}

export function isMasterRole(role: RawUserRole | string | undefined) {
  return role === "master";
}

export async function ensureCurrentUserSetup(fullName?: string | null) {
  const { data, error } = await (supabase as any).rpc("ensure_current_user_setup", {
    _full_name: fullName?.trim() || null,
  });

  if (error) throw error;

  const row = Array.isArray(data) ? data[0] : data;

  return {
    profileId: row?.profile_id ?? null,
    role: (row?.user_role as RawUserRole | undefined) ?? null,
  };
}

export async function fetchUserRole(userId: string): Promise<RawUserRole> {
  const { data, error } = await supabase.rpc("get_user_role", { _user_id: userId });

  if (error) {
    if (isNoRowsError(error)) return null;
    throw error;
  }

  return typeof data === "string" ? (data as RawUserRole) : null;
}

export async function fetchTenantProfile(userId: string): Promise<TenantProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error && !isNoRowsError(error)) throw error;

  return data ?? null;
}

export async function fetchUserBarbershop(userId: string): Promise<TenantBarbershop | null> {
  const { data: barbershopId, error: idError } = await supabase.rpc("get_user_barbershop_id", {
    _user_id: userId,
  });

  if (idError) throw idError;
  if (!barbershopId) return null;

  const { data, error } = await supabase
    .from("barbershops")
    .select("*")
    .eq("id", barbershopId)
    .limit(1)
    .maybeSingle();

  if (error && !isNoRowsError(error)) throw error;

  return data ?? null;
}

export async function fetchTenantSnapshot(userId: string) {
  const [profileResult, roleResult, barbershopResult] = await Promise.allSettled([
    fetchTenantProfile(userId),
    fetchUserRole(userId),
    fetchUserBarbershop(userId),
  ]);

  if (profileResult.status === "rejected") {
    console.warn("[Tenant] Profile lookup failed during snapshot", {
      userId,
      error: profileResult.reason,
    });
  }

  if (roleResult.status === "rejected") {
    console.warn("[Tenant] Role lookup failed during snapshot", {
      userId,
      error: roleResult.reason,
    });
  }

  if (barbershopResult.status === "rejected") {
    throw barbershopResult.reason;
  }

  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
  const rawRole = roleResult.status === "fulfilled" ? roleResult.value : null;
  const barbershop = barbershopResult.value;

  return {
    profile,
    role: normalizeTenantRole(rawRole),
    rawRole,
    barbershop,
  };
}
