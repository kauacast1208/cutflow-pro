import { motion } from "framer-motion";
import { Settings, Share2, CalendarCheck } from "lucide-react";

const steps = [
  { icon: Settings, step: "01", title: "Configure sua barbearia", description: "Adicione serviços, preços e equipe de barbeiros em poucos minutos." },
  { icon: Share2, step: "02", title: "Compartilhe sua página de agendamento", description: "Envie o link exclusivo para seus clientes agendarem online." },
  { icon: CalendarCheck, step: "03", title: "Receba clientes automaticamente", description: "Clientes agendam sozinhos e sua agenda fica sempre organizada." },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5">
            Como funciona
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5">
            Comece em 3 passos simples
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Configuração simples, resultados imediatos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="text-center relative"
            >
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-gradient-to-r from-border to-border/30" />
              )}
              <div className="mx-auto mb-4 sm:mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground relative z-10 shadow-glow">
                <item.icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-primary/80 mb-1.5 sm:mb-2 tracking-widest">PASSO {item.step}</p>
              <h3 className="text-sm sm:text-base font-bold mb-1.5 sm:mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
