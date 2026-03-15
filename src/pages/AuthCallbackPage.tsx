import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isInvalidApiKeyMessage, mapOAuthError } from "@/lib/authErrors";
import { Loader2, Scissors } from "lucide-react";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const resolveRedirect = async (userId: string) => {
      // Check if user has a barbershop (completed onboarding)
      const { data: barbershop } = await supabase
        .from("barbershops")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle();

      if (barbershop) {
        navigate("/dashboard", { replace: true });
        return;
      }

      // Check if user is a linked professional
      const { data: pro } = await supabase
        .from("professionals")
        .select("barbershop_id")
        .eq("user_id", userId)
        .eq("active", true)
        .maybeSingle();

      if (pro?.barbershop_id) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    };

    const handleCallback = async () => {
      try {
        // Wait for auth state to settle after OAuth redirect
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Auth callback session error:", sessionError.message);
          setError(
            isInvalidApiKeyMessage(sessionError.message)
              ? "Erro de configuração da autenticação. Recarregue a página e tente novamente."
              : "Erro ao autenticar. Tente novamente."
          );
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        if (session?.user) {
          settled = true;
          await resolveRedirect(session.user.id);
          return;
        }

        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
          if (!nextSession?.user || settled) return;

          settled = true;
          if (timeoutId) clearTimeout(timeoutId);
          data.subscription.unsubscribe();
          void resolveRedirect(nextSession.user.id);
        });

        authSubscription = data.subscription;

        // Timeout after 8 seconds
        timeoutId = setTimeout(() => {
          if (settled) return;

          settled = true;
          authSubscription?.unsubscribe();
          setError("Sessão não encontrada. Faça login novamente.");
          setTimeout(() => navigate("/login", { replace: true }), 1500);
        }, 8000);
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : undefined;
        setError(
          isInvalidApiKeyMessage(rawMessage)
            ? "Erro de configuração da autenticação. Recarregue a página e tente novamente."
            : "Erro inesperado. Redirecionando..."
        );
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    };

    void handleCallback();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      authSubscription?.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
      <div className="flex items-center gap-2 mb-2">
        <Scissors className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">CutFlow</span>
      </div>
      {error ? (
        <p className="text-sm text-destructive text-center">{error}</p>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Autenticando...</p>
        </>
      )}
    </div>
  );
}
