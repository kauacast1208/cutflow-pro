import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export async function getAuthenticatedUser(): Promise<User> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error(error?.message || "Usuário não autenticado.");
  }
  return data.user;
}

export function resolveUserFullName(user: User): string | null {
  return user.user_metadata?.full_name || user.email || null;
}

export async function upsertProfileForUser(user: User, fullName: string | null): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: user.id,
        full_name: fullName,
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.warn("[profile] upsert warning:", error);
  }
}
