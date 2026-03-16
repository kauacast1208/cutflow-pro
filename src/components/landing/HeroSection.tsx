import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Play, Shield, CreditCard, TrendingUp, Users, Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 glow-bg" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.06)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm text-primary font-medium mb-5 sm:mb-6"
          >
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Ferramenta profissional, não agenda</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-[1.75rem] leading-[1.1] sm:text-4xl lg:text-[3.25rem] font-extrabold tracking-[-0.03em] sm:leading-[1.08] mb-5 sm:mb-6 px-1 sm:px-0"
          >
            Transforme sua agenda{" "}
            <br className="hidden sm:block" />
            em{" "}
            <span className="text-primary">receita previsível.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-[15px] sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-5 sm:mb-6 leading-relaxed px-2 sm:px-0"
          >
            CutFlow é o sistema operacional da sua barbearia. Agenda inteligente, lembretes automáticos, CRM e financeiro — controle total do seu negócio em um só lugar.
          </motion.p>

          {/* Value bullets */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-7 sm:mb-8 text-[12px] sm:text-[13px]"
          >
            {[
              "1 cliente recuperado paga o sistema",
              "37% menos no-shows",
              "3h economizadas por semana",
              "Controle financeiro completo",
            ].map((point) => (
              <span key={point} className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.04] px-3 py-1 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                {point}
              </span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-1 sm:px-0"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-[15px] sm:text-base px-8 sm:px-10 h-14 shadow-glow btn-glow">
                Começar teste grátis — 7 dias
                <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </Button>
            </Link>
            <a href="#showcase" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto text-[15px] sm:text-base px-8 sm:px-10 h-14">
                <Play className="mr-2 h-4.5 w-4.5" />
                Ver como funciona
              </Button>
            </a>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.36 }}
            className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs sm:text-[13px] text-muted-foreground"
          >
            {[
              { icon: TrendingUp, label: "Barbearias em crescimento usam CutFlow" },
              { icon: Shield, label: "Dados protegidos" },
              { icon: CreditCard, label: "Sem cartão para testar" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5">
                <badge.icon className="h-3.5 w-3.5 text-primary/60" />
                <span>{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
