import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Play, CheckCircle2, Shield, CreditCard, TrendingDown,
  CalendarPlus, CalendarCheck, MessageSquare, Clock, Scissors, Wifi,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

/* ─── Notification Data ─── */
const notifications = [
  { icon: CalendarPlus, message: "Novo agendamento criado", shop: "Barbearia Prime", time: "agora", color: "text-primary" },
  { icon: CheckCircle2, message: "Cliente confirmou horário", shop: "Dom H Barber", time: "2 min atrás", color: "text-emerald-500" },
  { icon: Clock, message: "Horário liberado às 19:00", shop: "Elite Barber", time: "agora", color: "text-blue-500" },
  { icon: MessageSquare, message: "Lembrete enviado no WhatsApp", shop: "Black Zone Barber", time: "3 min atrás", color: "text-teal-500" },
  { icon: CalendarCheck, message: "Novo horário disponível", shop: "Barber Club", time: "1 min atrás", color: "text-amber-500" },
];

/* ─── Phone Booking Mockup ─── */
function PhoneBooking() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-card dark:bg-[hsl(240,16%,6%)]">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 text-[8px] text-muted-foreground">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <Wifi className="h-2.5 w-2.5" />
          <div className="w-5 h-2 rounded-sm border border-muted-foreground/30 relative">
            <div className="absolute inset-0.5 right-1 bg-primary rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Scissors className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-foreground">Barbearia Central</p>
            <p className="text-[8px] text-muted-foreground">Agendamento online</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1 px-4 pt-3 pb-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
            {i <= step && (
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: i < step ? "100%" : "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: i === step ? 3.5 : 0, ease: "linear" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-2 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className="text-[10px] font-semibold text-foreground mb-1">Escolha o serviço</p>
              <div className="space-y-1.5 mt-2">
                {[
                  { name: "Corte Masculino", price: "R$ 45", dur: "30 min", selected: true },
                  { name: "Corte + Barba", price: "R$ 65", dur: "45 min", selected: false },
                  { name: "Barba", price: "R$ 30", dur: "20 min", selected: false },
                ].map((s) => (
                  <div key={s.name} className={`flex items-center justify-between rounded-xl border p-2.5 ${s.selected ? "border-primary/30 bg-primary/[0.06]" : "border-border"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${s.selected ? "bg-primary/10" : "bg-muted"}`}>
                        <Scissors className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <p className="text-[9px] font-medium text-foreground">{s.name}</p>
                        <p className="text-[7px] text-muted-foreground">{s.dur}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-foreground">{s.price}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className="text-[10px] font-semibold text-foreground mb-1">Profissional</p>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {[{ name: "Carlos", spec: "Corte & Barba", sel: true }, { name: "Rafael", spec: "Degradê", sel: false }].map((p) => (
                  <div key={p.name} className={`flex flex-col items-center rounded-xl border p-2.5 ${p.sel ? "border-primary/30 bg-primary/[0.06]" : "border-border"}`}>
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground mb-1.5">{p.name[0]}</div>
                    <p className="text-[9px] font-medium text-foreground">{p.name}</p>
                    <p className="text-[7px] text-muted-foreground">{p.spec}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className="text-[10px] font-semibold text-foreground mb-1">Horário</p>
              <p className="text-[8px] text-muted-foreground mb-2">Terça, 11 de março</p>
              <div className="grid grid-cols-3 gap-1">
                {["09:00", "09:30", "10:00", "10:30", "11:00", "14:00"].map((t, i) => (
                  <div key={t} className={`rounded-lg border py-1.5 text-[9px] font-medium text-center ${i === 2 ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                    {t}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div className="flex flex-col items-center text-center py-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <p className="text-[11px] font-bold text-foreground mb-0.5">Confirmado!</p>
                <p className="text-[8px] text-muted-foreground mb-3">Lembrete enviado por WhatsApp</p>
                <div className="rounded-xl border border-border bg-muted/30 p-3 text-left w-full space-y-1.5">
                  {[["Serviço", "Corte Masculino"], ["Profissional", "Carlos"], ["Data", "11/03 às 10:00"], ["Valor", "R$ 45"]].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-[9px]">
                      <span className="text-muted-foreground">{l}</span>
                      <span className={`font-medium ${l === "Valor" ? "text-primary" : "text-foreground"}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom button */}
      <div className="px-4 pb-4 pt-2">
        <div className="w-full h-8 rounded-xl bg-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground shadow-lg">
          {step < 3 ? "Continuar" : "Novo agendamento"}
        </div>
        <div className="mx-auto mt-2 w-24 h-1 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  );
}

/* ─── Floating Notifications around phone ─── */
function HeroNotifications() {
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
    <>
      {/* Right notification */}
      <div className="absolute -right-2 sm:right-0 lg:-right-16 xl:-right-24 top-[25%] z-20 w-[200px] sm:w-[230px]">
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 24, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.92 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-lg px-3 py-2.5 flex items-start gap-2"
            >
              <div className={`mt-0.5 ${notif.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-foreground leading-snug">{notif.message}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {notif.shop} — <span className="text-muted-foreground/60">{notif.time}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Left notification (offset timing) */}
      <div className="absolute -left-2 sm:left-0 lg:-left-16 xl:-left-24 top-[55%] z-20 w-[200px] sm:w-[230px] hidden sm:block">
        <AnimatePresence mode="wait">
          {visible && (
            <motion.div
              key={`left-${(current + 2) % notifications.length}`}
              initial={{ opacity: 0, x: -24, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.92 }}
              transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-xl shadow-lg px-3 py-2.5 flex items-start gap-2"
            >
              {(() => {
                const n = notifications[(current + 2) % notifications.length];
                const NIcon = n.icon;
                return (
                  <>
                    <div className={`mt-0.5 ${n.color}`}>
                      <NIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground leading-snug">{n.message}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {n.shop} — <span className="text-muted-foreground/60">{n.time}</span>
                      </p>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
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
            className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/[0.06] px-4 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm text-destructive font-medium mb-5 sm:mb-6"
          >
            <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Você está perdendo dinheiro agora</span>
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

          {/* Pain sub text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="text-[15px] sm:text-lg text-muted-foreground max-w-xl mx-auto mb-6 sm:mb-7 leading-relaxed px-2 sm:px-0"
          >
            <p className="mb-3">A maioria das barbearias perde dinheiro por:</p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[13px] sm:text-[14px]">
              {[
                "Clientes que não aparecem",
                "Agenda bagunçada",
                "WhatsApp desorganizado",
                "Falta de controle financeiro",
              ].map((pain) => (
                <span key={pain} className="inline-flex items-center gap-1.5 rounded-full border border-destructive/15 bg-destructive/[0.04] px-3 py-1 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive/60 shrink-0" />
                  {pain}
                </span>
              ))}
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-1 sm:px-0"
          >
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-[15px] sm:text-base px-8 sm:px-10 h-14 sm:h-14 shadow-glow btn-glow">
                Testar grátis
                <ArrowRight className="ml-2 h-4.5 w-4.5" />
              </Button>
            </Link>
            <a href="#showcase" className="w-full sm:w-auto">
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto text-[15px] sm:text-base px-8 sm:px-10 h-14 sm:h-14">
                <Play className="mr-2 h-4.5 w-4.5" />
                Ver como funciona
              </Button>
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs sm:text-[13px] text-muted-foreground"
          >
            {[
              { icon: Users, label: "+200 barbeiros" },
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

      {/* ─── Mobile-First Smartphone Showcase ─── */}
      <div id="how-it-works" className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 scroll-mt-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm sm:text-base font-semibold text-foreground mb-2"
          >
            O cliente agenda direto do celular
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center text-xs sm:text-sm text-muted-foreground mb-8 sm:mb-10 max-w-md"
          >
            Experiência de agendamento moderna, rápida e sem atrito para seus clientes.
          </motion.p>

          {/* Phone + notifications */}
          <div className="relative w-[260px] sm:w-[280px]">
            {/* Glow behind phone */}
            <div className="absolute -inset-8 sm:-inset-12 rounded-[3rem] bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-transparent blur-2xl dark:from-primary/[0.12] dark:via-purple-500/[0.05]" />

            {/* Phone frame */}
            <div className="relative rounded-[2.5rem] border-[3px] border-border dark:border-border/40 bg-card dark:bg-[hsl(240,16%,6%)] shadow-2xl overflow-hidden ring-1 ring-border/30">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-card dark:bg-[hsl(240,16%,6%)] rounded-b-2xl z-10 flex items-center justify-center">
                <div className="w-12 h-1 rounded-full bg-muted-foreground/15" />
              </div>

              <div className="h-[440px] sm:h-[480px]">
                <PhoneBooking />
              </div>
            </div>

            {/* Floating notifications */}
            <HeroNotifications />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
