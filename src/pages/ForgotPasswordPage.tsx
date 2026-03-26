import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, Scissors, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mapPasswordRecoveryRequestError } from "@/lib/authErrors";
import { getAppBaseUrl } from "@/lib/appUrl";
import { cn } from "@/lib/utils";

function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-destructive/[0.06] border border-destructive/10 px-3.5 py-3 text-[13px] text-destructive leading-snug">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Informe seu e-mail.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${getAppBaseUrl()}/reset-password`,
      });

      if (resetError) {
        console.error("Reset password error:", resetError);
        setError(mapPasswordRecoveryRequestError(resetError.message));
        return;
      }

      setSent(true);
    } catch (err) {
      setError(mapPasswordRecoveryRequestError(err instanceof Error ? err.message : undefined));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Scissors className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">CutFlow</span>
        </div>

        {/* Card */}
        <div className="bg-background rounded-2xl border border-border/50 shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_6px_24px_-4px_rgb(0_0_0/0.06)] p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-[22px] font-bold tracking-tight mb-2">Verifique seu e-mail</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Se existe uma conta com <strong>{email}</strong>, enviamos um link de recuperação.
              </p>
              <Link
                to="/login"
                className={cn(
                  "inline-flex items-center gap-1.5 h-11 px-6 rounded-xl text-sm font-medium",
                  "border border-border bg-background hover:bg-muted/50",
                  "transition-all duration-150"
                )}
              >
                <ArrowLeft className="h-4 w-4" /> Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[22px] font-bold tracking-tight mb-1">Esqueceu sua senha?</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[13px] font-medium text-foreground/80">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      required
                      autoComplete="email"
                      className={cn(
                        "flex h-11 w-full rounded-xl border border-border/60 bg-background pl-10 pr-3 text-sm",
                        "placeholder:text-muted-foreground/40",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                        "transition-all duration-200"
                      )}
                    />
                  </div>
                </div>

                <AuthError message={error} />

                <button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full h-11 rounded-xl text-sm font-semibold text-primary-foreground",
                    "bg-gradient-to-b from-primary to-primary/90",
                    "shadow-[0_1px_2px_0_rgb(0_0_0/0.1),inset_0_1px_0_0_rgb(255_255_255/0.1)]",
                    "hover:shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.5)] hover:brightness-110",
                    "active:scale-[0.99] transition-all duration-150",
                    "disabled:opacity-50 disabled:pointer-events-none",
                    "flex items-center justify-center gap-2"
                  )}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-5">
                <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Voltar ao login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
