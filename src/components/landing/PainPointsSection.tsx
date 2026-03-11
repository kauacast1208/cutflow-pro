import { motion } from "framer-motion";
import { MessageSquare, Clock, DollarSign, ArrowRight } from "lucide-react";

const problems = [
  {
    icon: MessageSquare,
    title: "Horários esquecidos ou perdidos",
    description: "Mensagens no WhatsApp se perdem, horários confusos e clientes ficam sem resposta.",
  },
  {
    icon: Clock,
    title: "Clientes que faltam sem avisar",
    description: "Faltas constantes geram prejuízo e tempo ocioso na cadeira.",
  },
  {
    icon: DollarSign,
    title: "Falta de controle financeiro",
    description: "Sem dados claros de faturamento, ticket médio e desempenho do negócio.",
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
            Sua agenda ainda depende de WhatsApp ou papel?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Barbearias modernas usam sistemas profissionais para organizar seus atendimentos.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 max-w-4xl mx-auto">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-destructive/10 bg-destructive/[0.02] p-5 sm:p-6 hover:border-destructive/20 transition-all duration-300 text-center sm:text-left"
            >
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 mx-auto sm:mx-0 items-center justify-center rounded-xl sm:rounded-2xl bg-destructive/8 mb-4">
                <p.icon className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-1.5">{p.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
