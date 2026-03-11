import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Calendar, Clock, Users, CheckCircle2, Sparkles, Shield, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 glow-bg" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.06)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.06)_1px,transparent_1px)] bg-[size:72px_72px] sm:bg-[size:80px_80px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-44 lg:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-primary/[0.04] px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm text-primary font-medium mb-5 sm:mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Configuração em menos de 5 minutos</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-[1.75rem] leading-[1.1] sm:text-4xl lg:text-[3rem] font-extrabold tracking-[-0.03em] sm:leading-[1.08] mb-4 sm:mb-5 px-1 sm:px-0"
          >
            Pare de perder clientes por falta de{" "}
            <span className="text-primary">organização.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-[15px] sm:text-lg text-muted-foreground max-w-xl mx-auto mb-6 sm:mb-7 leading-relaxed px-2 sm:px-0"
          >
            O CutFlow organiza sua agenda, envia lembretes automáticos e ajuda você a controlar sua barbearia — sem estresse.
          </motion.p>

          {/* Results line */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.17 }}
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm sm:text-base font-semibold text-foreground mb-5 sm:mb-6 px-2 sm:px-0"
          >
            <span>Menos faltas.</span>
            <span className="text-muted-foreground/40">·</span>
            <span>Mais clientes retornando.</span>
            <span className="text-muted-foreground/40">·</span>
            <span>Mais controle financeiro.</span>
          </motion.div>

          {/* Value props */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] sm:text-sm text-muted-foreground mb-7 sm:mb-8 px-3 sm:px-0"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Agenda online automática</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Lembretes por WhatsApp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Gestão de clientes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Controle financeiro</span>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-1 sm:px-0"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-[15px] sm:text-base px-8 sm:px-10 h-14 sm:h-14 shadow-glow">
                Teste grátis por 7 dias
                <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </Button>
            </Link>
            <Link to="/demo" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto text-[15px] sm:text-base px-8 sm:px-10 h-14 sm:h-14">
                <Play className="mr-2 h-4.5 w-4.5" />
                Ver demonstração
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.38 }}
            className="mt-6 sm:mt-7 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs sm:text-[13px] text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary/60" />
              <span>7 dias grátis</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary/60" />
              <span>Sem fidelidade</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary/60" />
              <span>Pagamento seguro via Stripe</span>
            </div>
          </motion.div>

        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14 sm:mt-20 max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-border/50 bg-card shadow-xl overflow-hidden ring-1 ring-border/20">
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-border/50 bg-muted/15">
              <div className="flex gap-1.5 sm:gap-2">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive/20" />
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-warning/20" />
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-primary/20" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-background/60 rounded-lg px-4 sm:px-5 py-1.5 text-[10px] sm:text-xs text-muted-foreground border border-border/40 font-medium">
                  cutflow.app/dashboard
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: Calendar, label: "Agendamentos hoje", value: "12", color: "text-primary" },
                { icon: Users, label: "Clientes ativos", value: "248", color: "text-info" },
                { icon: Clock, label: "Próximo horário", value: "14:30", color: "text-warning" },
                { icon: CheckCircle2, label: "Taxa de presença", value: "94%", color: "text-success" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border/50 bg-background p-3 sm:p-4">
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color} mb-2 sm:mb-3`} />
                  <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="hidden sm:block px-6 lg:px-8 pb-6 lg:pb-8 space-y-2">
              {["09:00 — Carlos Silva · Corte + Barba", "10:00 — Rafael Santos · Corte Masculino", "11:00 — André Oliveira · Barba"].map((row, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background px-4 py-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary/60" />
                  <span className="text-muted-foreground">{row}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
