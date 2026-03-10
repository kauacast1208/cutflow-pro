import { motion } from "framer-motion";
import { MessageSquare, Clock, Users, ClipboardList, ArrowDown } from "lucide-react";

const problems = [
  {
    icon: MessageSquare,
    title: "Horarios baguncados no WhatsApp",
    description: "Mensagens perdidas, confusao de horarios e clientes esperando resposta.",
  },
  {
    icon: Clock,
    title: "Clientes esquecendo horarios",
    description: "Faltas constantes que geram prejuizo e tempo ocioso na cadeira.",
  },
  {
    icon: Users,
    title: "Dificuldade com a equipe",
    description: "Escala confusa, conflitos de horario e agenda desorganizada.",
  },
  {
    icon: ClipboardList,
    title: "Sem controle do negocio",
    description: "Sem dados, sem relatorios, sem visao clara do faturamento.",
  },
];

export function PainPointsSection() {
  return (
    <section className="section-padding bg-background relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-destructive/8 border border-destructive/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-destructive mb-4 sm:mb-5"
          >
            O problema
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5"
          >
            Sua agenda ainda e assim?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Problemas que toda barbearia enfrenta — e que voce nao precisa mais ter.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 max-w-4xl mx-auto">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-3.5 sm:gap-4 rounded-xl sm:rounded-2xl border border-destructive/10 bg-destructive/[0.02] p-4 sm:p-6 hover:border-destructive/20 transition-all duration-300"
            >
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-destructive/8">
                <p.icon className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base mb-1">{p.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
