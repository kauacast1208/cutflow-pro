import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock, Scissors, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import { useToast } from "@/hooks/use-toast";
import { SignupBrandingPanel } from "@/components/signup/SignupBrandingPanel";
import { GoogleIcon } from "@/components/signup/GoogleIcon";
import { mapLoginError, mapOAuthError } from "@/lib/authErrors";
import { cn } from "@/lib/utils";
import { startGoogleOAuthFlow } from "@/lib/oauth";
import { ensureCurrentUserSetup, isMasterRole } from "@/lib/tenant";

function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-destructive/[0.06] border border-destructive/10 px-3.5 py-3 text-[13px] text-destructive leading-snug">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugRawError, setDebugRawError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDebugRawError("");
    setLoading(true);

    try {
      console.info("[Login] Attempting email/password login for:", email.trim());

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        const rawMessage = signInError.message || "unknown_auth_error";
        const mappedMessage = mapLoginError(rawMessage);
        console.error("[Login] signInWithPassword error (raw):", rawMessage, "status:", signInError.status);
        console.info("[Login] mapped error:", mappedMessage);
        setDebugRawError(rawMessage);
        setError(mappedMessage);
        setLoading(false);
        return;
      }

      if (data.session) {
        console.info("[Login] Session obtained, user:", data.session.user.id);

        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .maybeSingle();

        if (roleError) {
          console.warn("[Login] Role fetch warning:", roleError.message);
        }

        toast({ title: "Bem-vindo de volta!", description: "Login realizado com sucesso." });

        if (roleData?.role === "master") {
          console.info("[Login] Redirect decision: /master");
          navigate("/master", { replace: true });
        } else {
          console.info("[Login] Redirect decision: /dashboard");
          navigate("/dashboard", { replace: true });
        }
        return;
      }

      const rawMessage = "session_not_found_after_login";
      const mappedMessage = mapLoginError(rawMessage);
      console.error("[Login] Session missing after successful signInWithPassword response.");
      setDebugRawError(rawMessage);
      setError(mappedMessage);
      setLoading(false);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "unexpected_login_error";
      const mappedMessage = mapLoginError(rawMessage);
      console.error("[Login] unexpected error (raw):", rawMessage);
      console.info("[Login] mapped error:", mappedMessage);
      setDebugRawError(rawMessage);
      setError(mappedMessage);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      setDebugRawError("");

      const oauthErrorMessage = await startGoogleOAuthFlow(`${window.location.origin}/auth/callback`);

      if (oauthErrorMessage) {
        const mappedMessage = mapOAuthError(oauthErrorMessage, "login");
        console.error("[Login] OAuth start error (raw):", oauthErrorMessage);
        console.info("[Login] OAuth mapped error:", mappedMessage);
        setDebugRawError(oauthErrorMessage);
        setError(mappedMessage);
        setGoogleLoading(false);
      }
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "unexpected_oauth_login_error";
      const mappedMessage = mapOAuthError(rawMessage, "login");
      console.error("[Login] OAuth unexpected error (raw):", rawMessage);
      console.info("[Login] OAuth mapped error:", mappedMessage);
      setDebugRawError(rawMessage);
      setError(mappedMessage);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <SignupBrandingPanel />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-16">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Scissors className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">CutFlow</span>
          </div>

          {/* Card */}
          <div className="bg-background rounded-2xl border border-border/50 shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_6px_24px_-4px_rgb(0_0_0/0.06)] p-8">
            <h1 className="text-[22px] font-bold tracking-tight mb-1">Entrar no painel</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Acesse o painel administrativo da sua barbearia.
            </p>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className={cn(
                "w-full h-11 rounded-xl border border-border bg-background text-sm font-medium",
                "flex items-center justify-center gap-2.5",
                "hover:bg-muted/50 hover:border-border/80 active:scale-[0.99]",
                "transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
              )}
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              {googleLoading ? "Conectando..." : "Entrar com Google"}
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-background px-3 text-muted-foreground/60 font-medium">
                  ou continue com e-mail
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                      setDebugRawError("");
                    }}
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[13px] font-medium text-foreground/80">
                    Senha
                  </label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                      setDebugRawError("");
                    }}
                    required
                    autoComplete="current-password"
                    className={cn(
                      "flex h-11 w-full rounded-xl border border-border/60 bg-background pl-10 pr-10 text-sm",
                      "placeholder:text-muted-foreground/40",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                      "transition-all duration-200"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <AuthError message={error} />
              {debugRawError && (
                <p className="text-xs text-muted-foreground break-all" aria-live="polite">
                  Detalhe técnico: {debugRawError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
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
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Não tem uma conta?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Criar conta grátis
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 mt-6 text-[11px] text-muted-foreground/50">
            <a href="#" className="hover:text-muted-foreground transition-colors">Termos</a>
            <span>·</span>
            <a href="#" className="hover:text-muted-foreground transition-colors">Privacidade</a>
            <span>·</span>
            <a href="#" className="hover:text-muted-foreground transition-colors">Suporte</a>
          </div>
        </div>
      </div>
    </div>
  );
}
