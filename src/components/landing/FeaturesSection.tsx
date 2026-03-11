import { motion } from "framer-motion";
import { Calendar, Users, Globe, BarChart3, UserCheck, Zap, Bell } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agenda inteligente",
    description: "Controle total da agenda com visualização por dia, semana e profissional. Sem conflitos.",
  },
  {
    icon: Users,
    title: "Gestão de clientes",
    description: "Histórico completo, preferências e anotações. Conheça seus clientes de verdade.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e financeiro",
    description: "Faturamento, ticket médio, ranking de profissionais e desempenho em tempo real.",
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
    description: "Link exclusivo para seus clientes agendarem 24h por dia, direto pelo celular.",
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
            Benefícios
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl font-extrabold tracking-[-0.025em] mb-3 sm:mb-4"
          >
            Tudo que sua barbearia precisa
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
