import { motion } from "framer-motion";
import { Calendar, Users, BarChart3, Globe, Bell, UserCheck } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agenda inteligente",
    description: "Visualize sua agenda semanal e organize horários facilmente. Sem conflitos, sem confusão.",
  },
  {
    icon: Users,
    title: "Gestão de clientes",
    description: "Acompanhe histórico de atendimentos, preferências e anotações de cada cliente.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e faturamento",
    description: "Entenda quanto sua barbearia está faturando com relatórios claros e detalhados.",
  },
  {
    icon: UserCheck,
    title: "Controle de equipe",
    description: "Gerencie barbeiros, escalas, comissões e produtividade individual com facilidade.",
  },
  {
    icon: Bell,
    title: "Lembretes automáticos",
    description: "Reduza faltas com lembretes automáticos por WhatsApp antes de cada atendimento.",
  },
  {
    icon: Globe,
    title: "Agendamento online",
    description: "Clientes agendam horários em poucos segundos, direto pelo celular, 24h por dia.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 glow-bg opacity-40" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            A solução
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-3 sm:mb-4"
          >
            Uma plataforma completa para{" "}
            <br className="hidden sm:block" />
            barbearias modernas.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-[15px] sm:text-lg max-w-lg mx-auto leading-relaxed"
          >
            Ferramentas profissionais para organizar, crescer e encantar seus clientes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group card-premium p-5 sm:p-6"
            >
              <div className="mb-4 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/[0.06] group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <feature.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-[15px] sm:text-base font-bold mb-1.5">{feature.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
