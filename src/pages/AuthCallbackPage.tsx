import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mapSessionRestoreError } from "@/lib/authErrors";
import { Loader2, Scissors } from "lucide-react";
import { bootstrapCurrentUserProfile, fetchTenantSnapshot, isMasterRole } from "@/lib/tenant";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [debugRawError, setDebugRawError] = useState("");

  useEffect(() => {
    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const resolveRedirect = async (userId: string) => {
      console.info("[AuthCallback] Resolving final redirect for user:", userId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      await bootstrapCurrentUserProfile(user?.user_metadata?.full_name || user?.email || null);
      const snapshot = await fetchTenantSnapshot(userId);

      if (isMasterRole(snapshot.rawRole)) {
        console.info("[AuthCallback] Final redirect decision: /master");
        navigate("/master", { replace: true });
        return;
      }

      if (snapshot.barbershop) {
        console.info("[AuthCallback] Final redirect decision: /dashboard");
        navigate("/dashboard", { replace: true });
        return;
      }

      console.info("[AuthCallback] Final redirect decision: /onboarding");
      navigate("/onboarding", { replace: true });
    };

    const getCallbackParams = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

      return {
        callbackError:
          searchParams.get("error_description") ||
          hashParams.get("error_description") ||
          searchParams.get("error") ||
          hashParams.get("error"),
        code: searchParams.get("code"),
      };
    };

    const handleCallback = async () => {
      try {
        const { callbackError, code } = getCallbackParams();
        console.info("[AuthCallback] callback code received:", code ? "yes" : "no");
        console.info("[AuthCallback] callback error received:", callbackError || "none");

        if (callbackError) {
          const mappedMessage = mapSessionRestoreError(callbackError);
          console.error("[AuthCallback] Callback error (raw):", callbackError);
          console.info("[AuthCallback] Callback mapped error:", mappedMessage);
          setDebugRawError(callbackError);
          setError(mappedMessage);
          setTimeout(() => navigate("/login", { replace: true }), 2500);
          return;
        }

        if (code) {
          console.info("[AuthCallback] exchangeCodeForSession start");
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            const mappedMessage = mapSessionRestoreError(exchangeError.message);
            console.error("[AuthCallback] exchangeCodeForSession failure (raw):", exchangeError.message);
            console.info("[AuthCallback] exchangeCodeForSession mapped error:", mappedMessage);

            const {
              data: { session: existingSession },
            } = await supabase.auth.getSession();

            if (existingSession?.user) {
              console.info("[AuthCallback] exchange failed but session exists, continuing redirect.");
              settled = true;
              await resolveRedirect(existingSession.user.id);
              return;
            }

            setDebugRawError(exchangeError.message);
            setError(mappedMessage);
            setTimeout(() => navigate("/login", { replace: true }), 2000);
            return;
          }

          console.info("[AuthCallback] exchangeCodeForSession success");
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.info("[AuthCallback] getSession after callback:", session?.user ? `user=${session.user.id}` : "session=null");

        if (sessionError) {
          const mappedMessage = mapSessionRestoreError(sessionError.message);
          console.error("[AuthCallback] getSession error (raw):", sessionError.message);
          console.info("[AuthCallback] getSession mapped error:", mappedMessage);
          setDebugRawError(sessionError.message);
          setError(mappedMessage);
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        if (session?.user) {
          settled = true;
          await resolveRedirect(session.user.id);
          return;
        }

        console.info("[AuthCallback] No session yet, waiting for onAuthStateChange...");

        const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
          console.info(
            "[AuthCallback] onAuthStateChange during callback:",
            event,
            nextSession?.user ? `user=${nextSession.user.id}` : "session=null"
          );

          if (!nextSession?.user || settled) return;

          settled = true;
          if (timeoutId) clearTimeout(timeoutId);
          data.subscription.unsubscribe();
          void resolveRedirect(nextSession.user.id);
        });

        authSubscription = data.subscription;

        timeoutId = setTimeout(() => {
          if (settled) return;

          settled = true;
          authSubscription?.unsubscribe();
          const rawMessage = "session_not_found_after_callback";
          const mappedMessage = mapSessionRestoreError(rawMessage);
          console.error("[AuthCallback] Timeout waiting for session after callback.");
          setDebugRawError(rawMessage);
          setError(mappedMessage);
          setTimeout(() => navigate("/login", { replace: true }), 1500);
        }, 8000);
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : "unexpected_callback_error";
        const mappedMessage = mapSessionRestoreError(rawMessage);
        console.error("[AuthCallback] Unexpected callback error (raw):", rawMessage);
        console.info("[AuthCallback] Unexpected callback mapped error:", mappedMessage);
        setDebugRawError(rawMessage);
        setError(mappedMessage);
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
        <div className="space-y-2">
          <p className="text-sm text-destructive text-center">{error}</p>
          {debugRawError && (
            <p className="text-xs text-muted-foreground text-center break-all">Detalhe técnico: {debugRawError}</p>
          )}
        </div>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Autenticando...</p>
        </>
      )}
    </div>
  );
}
