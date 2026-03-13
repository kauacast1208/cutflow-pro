import { lovable } from "@/integrations/lovable/index";

/**
 * Sign in with Google using Lovable's managed OAuth proxy.
 * Works on all domains (Lovable, Vercel, custom) — no Supabase OAuth secrets needed.
 */
export async function signInWithGoogle(redirectPath: string = "/auth/callback") {
  const redirectUrl = `${window.location.origin}${redirectPath}`;

  try {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: redirectUrl,
    });

    if (result?.error) {
      console.error("Google OAuth error:", result.error);
      return {
        error: new Error(
          "Não foi possível conectar com o Google. Tente novamente ou use e-mail e senha."
        ),
        data: null,
      };
    }

    return { error: null, data: result };
  } catch (err) {
    console.error("Google OAuth unexpected error:", err);
    return {
      error: new Error(
        "Erro de conexão com o Google. Tente novamente mais tarde."
      ),
      data: null,
    };
  }
}
