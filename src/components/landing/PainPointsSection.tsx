import { motion } from "framer-motion";
import { MessageSquare, Clock, Users, ClipboardList } from "lucide-react";

const problems = [
  {
    icon: MessageSquare,
    title: "Horários bagunçados no WhatsApp",
    description: "Mensagens perdidas, confusão de horários e clientes esperando resposta.",
    emoji: "",
  },
  {
    icon: Clock,
    title: "Clientes esquecendo horários",
    description: "Faltas constantes que geram prejuízo e tempo ocioso na cadeira.",
    emoji: "",
  },
  {
    icon: Users,
    title: "Dificuldade com a equipe",
    description: "Escala confusa, conflitos de horário e agenda desorganizada.",
    emoji: "",
  },
  {
    icon: ClipboardList,
    title: "Sem controle do negócio",
    description: "Sem dados, sem relatórios, sem visão clara do faturamento.",
    emoji: "",
  },
];

export function PainPointsSection() {
  return (
    <section className="section-padding bg-background relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-destructive/8 border border-destructive/15 px-4 py-1.5 text-sm font-medium text-destructive mb-5"
          >
            O problema
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-5"
          >
            Sua agenda ainda é assim?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed"
          >
            Problemas que toda barbearia enfrenta — e que você não precisa mais ter.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4 rounded-2xl border border-destructive/10 bg-destructive/[0.02] p-6 hover:border-destructive/20 transition-all duration-300"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-destructive/8 text-xl">
                {p.emoji}
              </div>
              <div>
                <h3 className="font-bold text-base mb-1.5">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
