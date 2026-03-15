import { supabase } from "@/integrations/supabase/client";
import { mapOAuthError } from "@/lib/authErrors";

type AuthSettingsResponse = {
  external?: Record<string, boolean | undefined>;
};

async function isGoogleProviderEnabled(): Promise<boolean> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) return true;

  try {
    const response = await fetch(`${url}/auth/v1/settings`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    if (!response.ok) return true;

    const settings = (await response.json()) as AuthSettingsResponse;
    const googleEnabled = settings.external?.google;

    return googleEnabled !== false;
  } catch {
    // If settings probe fails, don't block OAuth start.
    return true;
  }
}

export async function startGoogleOAuthFlow(redirectTo: string): Promise<string | null> {
  const googleEnabled = await isGoogleProviderEnabled();

  if (!googleEnabled) {
    return mapOAuthError("provider is not enabled");
  }

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
}
