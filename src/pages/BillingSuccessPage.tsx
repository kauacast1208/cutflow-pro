import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  useEffect(() => {
    // Clean URL params
    window.history.replaceState({}, "", "/billing/success");
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Assinatura ativada! 🎉</h1>
        <p className="text-muted-foreground mb-2">
          Seu plano foi ativado com sucesso. Seus 7 dias de teste gratuito
          já começaram — nenhuma cobrança será feita hoje.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Você pode gerenciar sua assinatura a qualquer momento na página de billing.
        </p>

        <Link to="/dashboard">
          <Button variant="hero" size="lg" className="w-full h-12 rounded-xl">
            Ir para o dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
