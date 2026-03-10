import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Checkout cancelado</h1>
        <p className="text-muted-foreground mb-8">
          Nenhuma cobranca foi realizada. Voce pode escolher um plano a
          qualquer momento.
        </p>

        <div className="flex flex-col gap-3">
          <Link to="/checkout">
            <Button variant="hero" size="lg" className="w-full h-12 rounded-xl">
              Tentar novamente
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="lg" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
