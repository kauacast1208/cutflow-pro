import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Play, Shield, CreditCard, TrendingDown, Users,
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
            className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/[0.06] px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm text-destructive font-medium mb-5 sm:mb-6"
          >
            <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Cada dia sem sistema é dinheiro perdido</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-[1.75rem] leading-[1.1] sm:text-4xl lg:text-[3.25rem] font-extrabold tracking-[-0.03em] sm:leading-[1.08] mb-5 sm:mb-6 px-1 sm:px-0"
          >
            Sua barbearia perde clientes{" "}
            <br className="hidden sm:block" />
            todo dia por falta de{" "}
            <span className="text-primary">controle.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-[15px] sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-5 sm:mb-6 leading-relaxed px-2 sm:px-0"
          >
            Agenda, lembretes automáticos, CRM e financeiro — tudo que você precisa para parar de perder dinheiro e começar a crescer de verdade.
          </motion.p>

          {/* Pain bullets */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-7 sm:mb-8 text-[12px] sm:text-[13px]"
          >
            {[
              "Clientes faltam sem avisar",
              "WhatsApp vira um caos",
              "Você perde R$ 500+/mês com faltas",
              "Zero controle do financeiro",
            ].map((pain) => (
              <span key={pain} className="inline-flex items-center gap-1.5 rounded-full border border-destructive/15 bg-destructive/[0.04] px-3 py-1 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive/60 shrink-0" />
                {pain}
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
                Começar teste grátis
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
              { icon: Users, label: "+200 barbearias já usam CutFlow" },
              { icon: Shield, label: "SSL seguro" },
              { icon: CreditCard, label: "Sem cartão" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-1.5">
                <badge.icon className="h-3.5 w-3.5 text-primary/60" />
                <span>{badge.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 text-primary/60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Login Google</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
