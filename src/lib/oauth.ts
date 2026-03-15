import { supabase } from "@/integrations/supabase/client";

export async function startGoogleOAuthFlow(redirectTo: string): Promise<string | null> {
  try {
    console.info("[OAuth] Starting Google OAuth flow. Redirect:", redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("[OAuth] signInWithOAuth error:", error);
      return error.message || "OAuth start failed";
    }

    console.info("[OAuth] Google OAuth redirect initiated successfully.");
    return null;
  } catch (err) {
    console.error("[OAuth] Unexpected signInWithOAuth error:", err);
    return err instanceof Error ? err.message : "OAuth start failed";
  }
}
