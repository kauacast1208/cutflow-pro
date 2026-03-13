import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock, User, Check, Scissors, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { SignupBrandingPanel } from "@/components/signup/SignupBrandingPanel";
import { PasswordStrengthIndicator } from "@/components/signup/PasswordStrengthIndicator";
import { GoogleIcon } from "@/components/signup/GoogleIcon";
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

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Informe seu nome completo.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        const msg = signUpError.message?.toLowerCase() || "";
        if (msg.includes("already registered") || msg.includes("already been registered")) {
          setError("Este e-mail já está cadastrado. Faça login ou recupere sua senha.");
        } else if (msg.includes("password") && msg.includes("leaked")) {
          setError("Esta senha foi encontrada em vazamentos de dados. Escolha uma senha mais segura.");
        } else if (msg.includes("valid email")) {
          setError("Informe um endereço de e-mail válido.");
        } else if (msg.includes("password") && (msg.includes("short") || msg.includes("length"))) {
          setError("A senha deve ter pelo menos 6 caracteres.");
        } else {
          setError("Não foi possível criar sua conta. Tente novamente.");
        }
        setLoading(false);
        return;
      }

      // Email confirmation required (user exists but no session)
      if (data.user && !data.session) {
        toast({
          title: "Verifique seu e-mail",
          description: "Enviamos um link de confirmação para " + email.trim(),
        });
        setLoading(false);
        return;
      }

      // Auto-confirm on: user gets session immediately
      toast({ title: "Conta criada!", description: "Bem-vindo ao CutFlow!" });
      navigate("/onboarding");
    } catch {
      setError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      setError("");

      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        console.error("Erro no signup com Google:", result.error);
        setError("Não foi possível entrar com Google. Tente usar e-mail e senha.");
        setGoogleLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Erro inesperado ao conectar com Google.");
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
            <h1 className="text-[22px] font-bold tracking-tight mb-1">Crie sua conta</h1>
            <p className="text-muted-foreground text-sm mb-6">
              Teste grátis por 7 dias. Sem compromisso.
            </p>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignup}
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
              {googleLoading ? "Conectando..." : "Continuar com Google"}
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
            <form onSubmit={handleSignup} className="space-y-3.5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-[13px] font-medium text-foreground/80">
                  Nome completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input
                    id="name"
                    type="text"
                    placeholder="João da Silva"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setError(""); }}
                    required
                    autoComplete="name"
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

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-[13px] font-medium text-foreground/80">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
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

              <AuthError message={error} />

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
                {loading ? "Criando conta..." : "Começar teste gratuito"}
              </button>
            </form>

            <div className="flex items-center justify-center gap-3 mt-4">
              {["7 dias grátis", "Sem cartão", "Cancele quando quiser"].map((t) => (
                <span key={t} className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                  <Check className="h-3 w-3 text-primary/60" /> {t}
                </span>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Fazer login
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
