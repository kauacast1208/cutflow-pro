import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Calendar, Clock, Users, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Glow effect */}
      <div className="absolute inset-0 glow-bg" />
      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:80px_80px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 lg:pt-48 lg:pb-36">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-primary/15 bg-primary/5 px-5 py-2 text-sm text-primary font-medium mb-10 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4" />
            Teste grátis por 7 dias — sem cartão de crédito
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-[2.5rem] sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-extrabold tracking-[-0.03em] leading-[1.05] mb-7"
          >
            O sistema que toda{" "}
            <br className="hidden sm:block" />
            barbearia{" "}
            <span className="text-gradient">moderna precisa.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Organize sua agenda, receba agendamentos online e reduza faltas.
            Tudo em uma plataforma profissional e fácil de usar.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
          >
            <Link to="/signup">
              <Button variant="hero" size="lg" className="text-base sm:text-lg px-10 sm:px-12 h-14 sm:h-[60px] min-w-[280px] shadow-glow">
                Começar grátis
                <ArrowRight className="ml-2.5 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="hero-outline" size="lg" className="text-base sm:text-lg px-10 sm:px-12 h-14 sm:h-[60px] min-w-[280px]">
                <Play className="mr-2.5 h-5 w-5" />
                Ver demonstração
              </Button>
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-16 flex flex-col items-center gap-4"
          >
            <div className="flex -space-x-2.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-10 rounded-full border-[2.5px] border-background bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">+1.200 barbearias</span> já usam o CutFlow
            </p>
          </motion.div>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-24 max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-border/80 bg-card shadow-xl overflow-hidden ring-1 ring-border/50">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/30">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive/30" />
                <div className="h-3 w-3 rounded-full bg-warning/30" />
                <div className="h-3 w-3 rounded-full bg-primary/30" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-background rounded-lg px-5 py-1.5 text-xs text-muted-foreground border border-border font-medium">
                  cutflow.app/dashboard
                </div>
              </div>
            </div>
            {/* Mock content */}
            <div className="p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: "Agendamentos hoje", value: "12", color: "text-primary" },
                { icon: Users, label: "Clientes ativos", value: "248", color: "text-info" },
                { icon: Clock, label: "Próximo horário", value: "14:30", color: "text-warning" },
                { icon: CheckCircle2, label: "Taxa de presença", value: "94%", color: "text-success" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-background p-4 hover:shadow-md transition-shadow">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            {/* Mock agenda rows */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-2">
              {["09:00 — Carlos Silva · Corte + Barba", "10:00 — Rafael Santos · Corte Masculino", "11:00 — André Oliveira · Barba"].map((row, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm group hover:border-primary/20 transition-colors">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary/80" />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">{row}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
