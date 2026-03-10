import { motion } from "framer-motion";
import { UserPlus, Settings, CalendarCheck } from "lucide-react";

const steps = [
  { icon: UserPlus, step: "01", title: "Crie sua conta", description: "Cadastre sua barbearia em menos de 2 minutos. Gratis por 7 dias." },
  { icon: Settings, step: "02", title: "Configure sua barbearia", description: "Adicione seus servicos, precos e equipe de barbeiros." },
  { icon: CalendarCheck, step: "03", title: "Comece a receber agendamentos", description: "Compartilhe o link e seus clientes agendam sozinhos." },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-sm font-medium text-primary mb-5">
            Como funciona
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-5">
            Comece em 3 passos simples
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Configuracao simples, resultados imediatos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="text-center relative"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-gradient-to-r from-border to-border/30" />
              )}
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground relative z-10 shadow-glow">
                <item.icon className="h-7 w-7" />
              </div>
              <p className="text-xs font-bold text-primary/80 mb-2 tracking-widest">PASSO {item.step}</p>
              <h3 className="text-base font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
