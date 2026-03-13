import { motion } from "framer-motion";
import { Scissors, Target, Heart, Zap } from "lucide-react";

export function AboutSection() {
  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 glow-bg opacity-20" />
      <div className="max-w-4xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            <Scissors className="h-3.5 w-3.5" />
            Sobre o CutFlow
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5"
          >
            Feito para quem vive a rotina da barbearia.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            CutFlow nasceu para transformar a rotina da barbearia em uma operação mais organizada, profissional e previsível. Chega de agenda de papel, faltas sem aviso e controle financeiro no escuro.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {[
            {
              icon: Target,
              title: "Foco em resultado",
              description: "Cada funcionalidade foi pensada para resolver problemas reais de barbearias brasileiras.",
            },
            {
              icon: Heart,
              title: "Feito com propósito",
              description: "Nascemos ouvindo barbeiros. Sabemos que organização é liberdade para quem empreende.",
            },
            {
              icon: Zap,
              title: "Simples e rápido",
              description: "Sem complexidade. Configure em minutos e comece a ver resultados na primeira semana.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-base mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
