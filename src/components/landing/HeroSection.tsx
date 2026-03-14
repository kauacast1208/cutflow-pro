import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Calendar, Clock, Users, CheckCircle2, Shield, CreditCard, TrendingDown, BarChart3, CalendarPlus, CalendarCheck, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const notifications = [
  { icon: CalendarPlus, message: "Novo agendamento criado", shop: "Barbearia Prime", time: "agora", color: "text-primary" },
  { icon: CheckCircle2, message: "Cliente confirmou horário", shop: "Dom H Barber", time: "2 min atrás", color: "text-emerald-500" },
  { icon: Clock, message: "Horário liberado às 19:00", shop: "Elite Barber", time: "agora", color: "text-blue-500" },
  { icon: MessageSquare, message: "Lembrete enviado no WhatsApp", shop: "Black Zone Barber", time: "3 min atrás", color: "text-teal-500" },
  { icon: CalendarCheck, message: "Novo horário disponível", shop: "Barber Club", time: "1 min atrás", color: "text-amber-500" },
];

function MacBookNotifications() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % notifications.length);
        setVisible(true);
      }, 350);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const notif = notifications[current];
  const Icon = notif.icon;

  return (
    <div className="absolute -right-4 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-[220px] sm:w-[260px]">
      {visible && (
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl px-3.5 py-3 flex items-start gap-2.5"
        >
          <div className={`mt-0.5 ${notif.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] sm:text-[13px] font-semibold text-foreground leading-snug">{notif.message}</p>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
              {notif.shop} — <span className="text-muted-foreground/60">{notif.time}</span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background */}
      <div className="absolute inset-0 glow-bg" />
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.06)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.06)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-28 pb-10 sm:pt-36 sm:pb-14 lg:pt-44 lg:pb-16">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-primary/[0.04] px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm text-primary font-medium mb-5 sm:mb-6"
          >
            <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Reduza faltas em até 40%</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-[1.75rem] leading-[1.1] sm:text-4xl lg:text-[3.25rem] font-extrabold tracking-[-0.03em] sm:leading-[1.08] mb-4 sm:mb-5 px-1 sm:px-0"
          >
            Pare de perder clientes{" "}
            <br className="hidden sm:block" />
            por falta de{" "}
            <span className="text-primary">organização.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-[15px] sm:text-lg text-muted-foreground max-w-xl mx-auto mb-6 sm:mb-7 leading-relaxed px-2 sm:px-0"
          >
            Organize sua agenda, envie lembretes automáticos no WhatsApp e acompanhe o faturamento da sua barbearia em um só lugar.
          </motion.p>

          {/* Benefit pills */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-7 sm:mb-8 px-3 sm:px-0"
          >
            {[
              "Menos faltas com lembretes",
              "Clientes voltam mais",
              "Agenda sempre organizada",
              "Controle financeiro simples",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-1.5 rounded-full border border-primary/12 bg-primary/[0.04] px-3.5 py-1.5 text-[12px] sm:text-[13px] font-medium text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
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
                Criar minha agenda grátis
                <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto text-[15px] sm:text-base px-8 sm:px-10 h-14 sm:h-14">
                <Play className="mr-2 h-4.5 w-4.5" />
                Ver como funciona
              </Button>
            </a>
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
              <span>Sem cobrança hoje</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary/60" />
              <span>Cancele quando quiser</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* MacBook Showcase — "Como funciona" anchor */}
      <div id="how-it-works" className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* MacBook frame */}
          <div className="max-w-5xl mx-auto">
            {/* Screen */}
            <div className="relative rounded-t-2xl border border-border/50 bg-[hsl(var(--card))] shadow-2xl overflow-hidden ring-1 ring-border/20">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-border/50 bg-muted/15">
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-destructive/30" />
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-warning/30" />
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-primary/30" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-background/60 rounded-lg px-4 sm:px-5 py-1.5 text-[10px] sm:text-xs text-muted-foreground border border-border/40 font-medium">
                    cutflow.app/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: Calendar, label: "Agendamentos hoje", value: "12", color: "text-primary" },
                  { icon: Users, label: "Clientes ativos", value: "248", color: "text-info" },
                  { icon: Clock, label: "Próximo horário", value: "14:30", color: "text-warning" },
                  { icon: BarChart3, label: "Faturamento mensal", value: "R$ 18.5k", color: "text-success" },
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

              {/* Notifications overlay — attached to MacBook */}
              <MacBookNotifications />
            </div>

            {/* MacBook base/hinge */}
            <div className="relative mx-auto">
              <div className="h-3 sm:h-4 bg-gradient-to-b from-muted/40 to-muted/20 border-x border-b border-border/40 rounded-b-lg mx-8 sm:mx-16" />
              <div className="h-1.5 sm:h-2 bg-muted/15 border-x border-b border-border/30 rounded-b-xl mx-4 sm:mx-8" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
