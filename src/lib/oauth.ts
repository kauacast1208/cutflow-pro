import { supabase } from "@/integrations/supabase/client";
import { mapOAuthError } from "@/lib/authErrors";

export async function startGoogleOAuthFlow(redirectTo: string): Promise<string | null> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      return mapOAuthError(error.message);
    }

    return null;
  } catch (err) {
    return mapOAuthError(err instanceof Error ? err.message : undefined);
  }
}
