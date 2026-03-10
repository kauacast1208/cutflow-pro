import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Scissors } from "lucide-react";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait for auth state to settle after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Auth callback session error:", sessionError.message);
          setError("Erro ao autenticar. Tente novamente.");
          setTimeout(() => navigate("/login", { replace: true }), 2000);
          return;
        }

        if (!session?.user) {
          // Session might not be ready yet — listen for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              subscription.unsubscribe();
              resolveRedirect(session.user.id);
            }
          });

          // Timeout after 8 seconds
          setTimeout(() => {
            subscription.unsubscribe();
            setError("Sessão não encontrada. Faça login novamente.");
            setTimeout(() => navigate("/login", { replace: true }), 1500);
          }, 8000);
          return;
        }

        await resolveRedirect(session.user.id);
      } catch (err) {
        setError("Erro inesperado. Redirecionando...");
        setTimeout(() => navigate("/login", { replace: true }), 2000);
      }
    };

    const resolveRedirect = async (userId: string) => {
      // Check if user has a barbershop (completed onboarding)
      const { data: barbershop } = await supabase
        .from("barbershops")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle();

      if (barbershop) {
        navigate("/dashboard", { replace: true });
      } else {
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
      }
    };

    handleCallback();
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
