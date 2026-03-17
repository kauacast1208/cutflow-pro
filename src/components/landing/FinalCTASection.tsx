import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function FinalCTASection() {
  return (
    <section className="section-padding">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center rounded-3xl bg-primary p-8 sm:p-12 lg:p-16 shadow-premium relative overflow-hidden"
      >
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground/80 mb-5 sm:mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Controle total da sua barbearia
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-foreground mb-3 sm:mb-4 tracking-[-0.025em] leading-tight">
            Sua barbearia merece uma{" "}
            <br className="hidden sm:block" />
            ferramenta profissional.
          </h2>
          <p className="text-primary-foreground/65 text-sm sm:text-base mb-7 sm:mb-8 max-w-md mx-auto leading-relaxed">
            5 minutos para criar sua conta. 15 dias grátis. 1 cliente recuperado paga o sistema.
          </p>
          <Link to="/signup" className="block w-full sm:w-auto sm:inline-block">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-[15px] px-8 sm:px-10 h-14 shadow-lg rounded-xl w-full sm:w-auto"
            >
              Começar teste grátis — 7 dias
              <ArrowRight className="ml-2 h-4.5 w-4.5" />
            </Button>
          </Link>
          <div className="mt-5 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-5 text-primary-foreground/50 text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>7 dias grátis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Sem cobrança hoje</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>Pagamento seguro via Stripe</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
