import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Scissors, ArrowLeft, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <Scissors className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold">CutFlow</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verifique seu e-mail</h1>
            <p className="text-muted-foreground mb-6">
              Enviamos um link de recuperação para <strong>{email}</strong>.
            </p>
            <Link to="/login">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1">Esqueceu sua senha?</h1>
            <p className="text-muted-foreground text-sm mb-8">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Enviar link de recuperação
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/login" className="text-primary font-medium hover:underline">
                <ArrowLeft className="h-3 w-3 inline mr-1" />
                Voltar ao login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
