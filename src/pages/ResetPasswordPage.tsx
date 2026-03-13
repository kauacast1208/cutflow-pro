import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Check, Scissors } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 2000);
  };

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
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

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
      </div>
    </div>
  );
}
