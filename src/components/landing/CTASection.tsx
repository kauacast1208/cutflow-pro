import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="section-padding">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center rounded-2xl sm:rounded-3xl bg-primary p-8 sm:p-14 lg:p-20 shadow-premium relative overflow-hidden ring-1 ring-primary/20"
      >
        {/* Glow circles */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary-foreground/5 blur-3xl" />
        {/* Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground/80 mb-6 sm:mb-8">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Comece grátis hoje
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-4 sm:mb-5 tracking-[-0.02em] leading-tight">
            Pronto para organizar{" "}
            <br className="hidden sm:block" />
            sua barbearia?
          </h2>
          <p className="text-primary-foreground/70 text-base sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
            Comece agora com 7 dias grátis. Sem cartão de crédito, sem compromisso.
          </p>
          <Link to="/signup" className="block w-full sm:w-auto">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-base px-8 sm:px-12 h-14 sm:h-14 shadow-lg rounded-xl w-full sm:w-auto"
            >
              Começar teste gratuito
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-primary-foreground/50 text-xs sm:text-sm">
            7 dias grátis · Sem cartão · Cancele quando quiser
          </p>
          <div className="mt-5 sm:mt-6 flex items-center justify-center gap-2 text-primary-foreground/50 text-xs sm:text-sm">
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Pagamento seguro via Stripe</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
