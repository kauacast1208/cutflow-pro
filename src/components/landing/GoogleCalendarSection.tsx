import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Users, RefreshCcw } from "lucide-react";

const benefits = [
  { icon: RefreshCcw, text: "Sincronize agendamentos automaticamente" },
  { icon: Calendar, text: "Evite conflitos de horário entre plataformas" },
  { icon: Users, text: "Mantenha toda a equipe alinhada" },
];

export function GoogleCalendarSection() {
  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />
      </div>
      <div className="max-w-5xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5">
              <Calendar className="h-3.5 w-3.5" />
              Integração
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-[-0.02em] mb-4 sm:mb-5">
              Sincronize com o{" "}
              <span className="text-primary">Google Calendar</span>
            </h2>
            <p className="text-muted-foreground text-[15px] sm:text-base leading-relaxed mb-6 sm:mb-8 max-w-md">
              Conecte sua agenda do CutFlow ao Google Calendar e centralize todos os compromissos em um só lugar.
            </p>

            <div className="space-y-3">
              {benefits.map((b) => (
                <div key={b.text} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <b.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{b.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-2xl border border-border bg-card shadow-elevated p-5 sm:p-6">
              {/* Calendar mockup */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-blue-500" fill="currentColor">
                    <path d="M19.5 3h-3V1.5h-1.5V3h-6V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8h15v11.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-semibold">Google Calendar</p>
                  <p className="text-[9px] text-muted-foreground">Sincronizado com CutFlow</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
              </div>

              <div className="space-y-2">
                {[
                  { time: "09:00", title: "João Silva - Corte + Barba", source: "CutFlow", color: "bg-primary" },
                  { time: "10:30", title: "Pedro Santos - Corte", source: "CutFlow", color: "bg-primary" },
                  { time: "12:00", title: "Almoço", source: "Google", color: "bg-blue-500" },
                  { time: "14:00", title: "Lucas Oliveira - Barba", source: "CutFlow", color: "bg-primary" },
                ].map((event) => (
                  <div key={event.time} className="flex items-center gap-3 p-2.5 rounded-xl border border-border/50 bg-muted/20">
                    <div className={`w-0.5 h-8 rounded-full ${event.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium truncate">{event.title}</p>
                      <p className="text-[8px] text-muted-foreground">{event.time}</p>
                    </div>
                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-medium ${
                      event.source === "CutFlow"
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                    }`}>
                      {event.source}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
