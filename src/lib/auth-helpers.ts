import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

/**
 * Helper that detects the current domain and uses the appropriate
 * OAuth method:
 * - On Lovable domains (*.lovable.app, *.lovableproject.com): uses managed OAuth proxy
 * - On custom domains (Vercel, custom): uses Supabase Auth directly
 */
function isLovableDomain(): boolean {
  const host = window.location.hostname;
  return host.endsWith(".lovable.app") || host.endsWith(".lovableproject.com") || host === "localhost";
}

export async function signInWithGoogle(redirectPath: string = "/auth/callback") {
  const redirectUrl = `${window.location.origin}${redirectPath}`;

  if (isLovableDomain()) {
    // Use Lovable managed OAuth (works on Lovable domains)
    return lovable.auth.signInWithOAuth("google", {
      redirect_uri: redirectUrl,
    });
  }

  // Use Supabase Auth directly (works on any domain with Google OAuth configured)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });

  return { error: error || null, data };
}
