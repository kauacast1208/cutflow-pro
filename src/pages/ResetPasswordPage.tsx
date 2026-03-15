import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Check, Scissors, AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrengthIndicator } from "@/components/signup/PasswordStrengthIndicator";
import { cn } from "@/lib/utils";
import { mapResetPasswordError } from "@/lib/authErrors";

function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-destructive/[0.06] border border-destructive/10 px-3.5 py-3 text-[13px] text-destructive leading-snug">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [sessionErrorMessage, setSessionErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const sessionReadyRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const markReady = () => {
      if (mounted && !sessionReadyRef.current) {
        sessionReadyRef.current = true;
        setSessionReady(true);
      }
    };

    // Listen for PASSWORD_RECOVERY or SIGNED_IN events from the recovery link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        markReady();
      } else if (event === "SIGNED_IN" && session) {
        markReady();
      }
    });

    // Check if a session already exists (e.g., page was reloaded after token was consumed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session) {
        markReady();
      }
    });

    // Timeout: if no session after 10s, the link is expired/invalid
    const timeout = setTimeout(() => {
      if (mounted && !sessionReadyRef.current) {
        setSessionError(true);
      }
    }, 10000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("same_password") || msg.includes("different")) {
          setFormError("A nova senha não pode ser igual à anterior.");
        } else if (msg.includes("session") || msg.includes("not authenticated")) {
          setFormError("Sessão expirada. Solicite um novo link de recuperação.");
        } else {
          setFormError("Não foi possível redefinir a senha. Solicite um novo link.");
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch {
      setFormError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  // Expired / invalid link
  if (sessionError) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          <div className="bg-background rounded-2xl border border-border/50 shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_6px_24px_-4px_rgb(0_0_0/0.06)] p-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-7 w-7 text-destructive" />
            </div>
            <h1 className="text-[22px] font-bold tracking-tight mb-2">Link expirado</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Este link de recuperação expirou ou já foi utilizado. Solicite um novo link.
            </p>
            <button
              onClick={() => navigate("/forgot-password")}
              className={cn(
                "inline-flex items-center gap-1.5 h-11 px-6 rounded-xl text-sm font-semibold text-primary-foreground",
                "bg-gradient-to-b from-primary to-primary/90",
                "hover:brightness-110 transition-all duration-150"
              )}
            >
              Solicitar novo link
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[420px]">
          <div className="bg-background rounded-2xl border border-border/50 shadow-[0_1px_3px_0_rgb(0_0_0/0.04),0_6px_24px_-4px_rgb(0_0_0/0.06)] p-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-[22px] font-bold tracking-tight mb-2">Senha redefinida!</h1>
            <p className="text-muted-foreground text-sm">Redirecionando para o painel...</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading session
  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Validando link de recuperação...</p>
        </div>
      </div>
    );
  }

  // Reset form
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
          <h1 className="text-[22px] font-bold tracking-tight mb-1">Redefinir senha</h1>
          <p className="text-muted-foreground text-sm mb-6">Escolha uma nova senha para sua conta.</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[13px] font-medium text-foreground/80">
                Nova senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFormError(""); }}
                  required
                  autoComplete="new-password"
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
              <PasswordStrengthIndicator password={password} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-[13px] font-medium text-foreground/80">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFormError(""); }}
                  required
                  autoComplete="new-password"
                  className={cn(
                    "flex h-11 w-full rounded-xl border border-border/60 bg-background pl-10 pr-3 text-sm",
                    "placeholder:text-muted-foreground/40",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                    "transition-all duration-200",
                    confirmPassword && password !== confirmPassword && "border-destructive/50 focus:ring-destructive/20"
                  )}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] text-destructive">As senhas não coincidem</p>
              )}
            </div>

            <AuthError message={formError} />

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
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
