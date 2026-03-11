import { motion } from "framer-motion";
import { MessageSquare, Clock, Bell, TrendingUp, CheckCircle2 } from "lucide-react";

const benefits = [
  { icon: TrendingUp, text: "Menos faltas e mais presença" },
  { icon: Clock, text: "Agenda mais cheia e produtiva" },
  { icon: TrendingUp, text: "Mais faturamento no final do mês" },
];

export function WhatsAppFeatureSection() {
  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 glow-bg opacity-30" />
      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-5xl mx-auto">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5">
              <MessageSquare className="h-3.5 w-3.5" />
              Lembretes automáticos
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.02em] mb-4 sm:mb-5">
              Nunca mais tenha{" "}
              <span className="text-primary">horários vazios</span>
            </h2>
            <p className="text-muted-foreground text-[15px] sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-md">
              O CutFlow envia lembretes automáticos por WhatsApp para seus clientes, reduzindo faltas e mantendo sua agenda cheia.
            </p>

            {/* Reminder timeline */}
            <div className="space-y-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">24 horas antes</p>
                  <p className="text-xs text-muted-foreground">Lembrete de confirmação do agendamento</p>
                </div>
              </div>
              <div className="ml-5 h-6 w-px bg-border" />
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Clock className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">2 horas antes</p>
                  <p className="text-xs text-muted-foreground">Lembrete final com detalhes do horário</p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2.5">
              {benefits.map((b) => (
                <div key={b.text} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual mockup */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-card shadow-xl p-5 sm:p-6 space-y-3">
              {/* Message bubble - 24h */}
              <div className="rounded-xl bg-primary/[0.06] border border-primary/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">CutFlow</p>
                    <p className="text-[9px] text-muted-foreground">24h antes</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-foreground/90">
                  Olá João! 👋 Lembrete: seu corte está agendado para amanhã às 14:30 com Carlos. Confirme sua presença!
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium">✓ Confirmar</span>
                  <span className="text-[10px] px-3 py-1 rounded-full border border-border text-muted-foreground font-medium">Reagendar</span>
                </div>
              </div>

              {/* Message bubble - 2h */}
              <div className="rounded-xl bg-muted/40 border border-border/60 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">CutFlow</p>
                    <p className="text-[9px] text-muted-foreground">2h antes</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-foreground/90">
                  João, seu horário é daqui a 2 horas! ⏰ Corte + Barba às 14:30. Te esperamos!
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center rounded-xl bg-background border border-border p-3">
                  <p className="text-lg sm:text-xl font-extrabold text-primary">-40%</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">menos faltas</p>
                </div>
                <div className="text-center rounded-xl bg-background border border-border p-3">
                  <p className="text-lg sm:text-xl font-extrabold text-primary">94%</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">presença</p>
                </div>
                <div className="text-center rounded-xl bg-background border border-border p-3">
                  <p className="text-lg sm:text-xl font-extrabold text-primary">+R$480</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">receita/mês</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
