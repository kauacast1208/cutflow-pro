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
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:64px_64px] sm:bg-[size:80px_80px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-48 lg:pb-36">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm text-primary font-medium mb-8 sm:mb-10 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Teste gratis por 7 dias — sem cartao de credito</span>
            <span className="sm:hidden">7 dias gratis — sem cartao</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-[2rem] leading-[1.1] sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-extrabold tracking-[-0.03em] sm:leading-[1.05] mb-6 sm:mb-7 px-1 sm:px-0"
          >
            Gerencie sua barbearia com{" "}
            <br className="hidden sm:block" />
            <span className="text-gradient">eficiencia profissional.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed px-1 sm:px-0"
          >
            Agenda, clientes, financeiro e relatorios em um so sistema.
            Tudo em uma plataforma profissional e facil de usar.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 px-1 sm:px-0"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 h-14 sm:h-[60px] shadow-glow">
                Comecar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-12 h-14 sm:h-[60px]">
                <Play className="mr-2 h-5 w-5" />
                Ver demonstracao
              </Button>
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-12 sm:mt-16 flex flex-col items-center gap-3 sm:gap-4"
          >
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/25 to-primary/5 flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">+1.200 barbearias</span> ja usam o CutFlow
            </p>
          </motion.div>
        </div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-16 sm:mt-24 max-w-5xl mx-auto"
        >
          <div className="rounded-xl sm:rounded-2xl border border-border/80 bg-card shadow-xl overflow-hidden ring-1 ring-border/50">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5 sm:gap-2">
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive/30" />
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-warning/30" />
                <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-primary/30" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-background rounded-lg px-4 sm:px-5 py-1.5 text-[10px] sm:text-xs text-muted-foreground border border-border font-medium">
                  cutflow.app/dashboard
                </div>
              </div>
            </div>
            {/* Mock content — cards */}
            <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: Calendar, label: "Agendamentos hoje", value: "12", color: "text-primary" },
                { icon: Users, label: "Clientes ativos", value: "248", color: "text-info" },
                { icon: Clock, label: "Proximo horario", value: "14:30", color: "text-warning" },
                { icon: CheckCircle2, label: "Taxa de presenca", value: "94%", color: "text-success" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-background p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color} mb-2 sm:mb-3`} />
                  <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{stat.label}</p>
                </div>
              ))}
            </div>
            {/* Mock agenda rows — hide on very small screens */}
            <div className="hidden sm:block px-6 lg:px-8 pb-6 lg:pb-8 space-y-2">
              {["09:00 — Carlos Silva · Corte + Barba", "10:00 — Rafael Santos · Corte Masculino", "11:00 — Andre Oliveira · Barba"].map((row, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm group hover:border-primary/20 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-primary/80" />
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
