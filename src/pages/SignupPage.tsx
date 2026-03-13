import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Scissors, Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      const message = error.message?.toLowerCase().includes("already registered")
        ? "Este e-mail já está cadastrado. Faça login ou recupere sua senha."
        : "Não foi possível criar sua conta. Tente novamente.";
      setError(message);
      setLoading(false);
      return;
    }

    toast({ title: "Conta criada!", description: "Verifique seu e-mail para confirmar o cadastro." });
    navigate("/onboarding");
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);
    console.info("[Auth] Google signup clicked (SignupPage.handleGoogleSignup) → supabase.auth.signInWithOAuth");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Google OAuth error (SignupPage.handleGoogleSignup):", error.message);
        setError("Não foi possível conectar com o Google. Tente novamente ou cadastre com e-mail e senha.");
        setGoogleLoading(false);
        return;
      }

      if (!data?.url) {
        console.error("Google OAuth did not return a redirect URL (SignupPage.handleGoogleSignup).");
        setError("Não foi possível iniciar o cadastro com Google. Tente novamente.");
        setGoogleLoading(false);
        return;
      }
    } catch (err) {
      console.error("Google OAuth unexpected error (SignupPage.handleGoogleSignup):", err);
      setError("Erro de conexão com o Google. Tente novamente.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(152,58%,22%)_100%)]" />
        <div className="relative z-10 text-primary-foreground max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Scissors className="h-8 w-8" />
            <span className="text-3xl font-bold">CutFlow</span>
          </div>
          <h2 className="text-3xl font-bold mb-6 leading-tight">
            Comece a transformar sua barbearia hoje.
          </h2>
          <div className="space-y-4">
            {[
              "7 dias grátis para testar",
              "Sem cartão de crédito",
              "Cancele quando quiser",
              "Suporte por chat incluso",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-primary-foreground/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:p-12">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <Scissors className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CutFlow</span>
          </div>

          <h1 className="text-2xl sm:text-2xl font-bold mb-1">Crie sua conta</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Teste grátis por 7 dias. Sem compromisso.
          </p>

          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4 h-12 rounded-xl text-base font-medium"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <svg className="h-5 w-5 mr-2 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? "Conectando..." : "Criar conta com Google"}
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou</span></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">Seu nome completo</Label>
              <Input
                id="name"
                placeholder="João da Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12 text-base rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 text-base rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 h-12 text-base rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-3 py-2">{error}</p>
            )}

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-medium" disabled={loading || googleLoading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Criar conta grátis
              {!loading && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </form>

          {/* Trust badges — mobile */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 lg:hidden">
            {["7 dias grátis", "Sem cartão", "Cancele quando quiser"].map((t) => (
              <span key={t} className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Check className="h-3 w-3 text-primary" /> {t}
              </span>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
