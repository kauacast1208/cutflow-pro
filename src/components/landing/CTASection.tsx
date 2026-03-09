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
        className="max-w-4xl mx-auto text-center rounded-3xl bg-primary p-14 sm:p-20 shadow-premium relative overflow-hidden"
      >
        {/* Glow circles */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary-foreground/5 blur-3xl" />
        {/* Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground/80 mb-8">
            <Sparkles className="h-4 w-4" />
            Comece grátis hoje
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-5 tracking-[-0.02em]">
            Pronto para organizar{" "}
            <br className="hidden sm:block" />
            sua barbearia?
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Comece agora com 7 dias grátis. Sem cartão de crédito, sem compromisso.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold text-base px-12 h-14 shadow-lg rounded-xl"
            >
              Começar teste gratuito
              <ArrowRight className="ml-2.5 h-5 w-5" />
            </Button>
          </Link>
          <div className="mt-8 flex items-center justify-center gap-2 text-primary-foreground/50 text-sm">
            <Shield className="h-4 w-4" />
            <span>Sem cartão de crédito • Cancele quando quiser</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
