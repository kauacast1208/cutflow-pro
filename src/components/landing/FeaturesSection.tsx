import { motion } from "framer-motion";
import { Calendar, Users, Globe, BarChart3, UserCheck, Zap, ArrowUpRight } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agenda inteligente",
    description: "Controle total da agenda da barbearia com visualizacao por dia, semana e profissional.",
  },
  {
    icon: Users,
    title: "Gestao de clientes",
    description: "Historico completo de clientes e atendimentos com tags, preferencias e CRM integrado.",
  },
  {
    icon: BarChart3,
    title: "Relatorios e financeiro",
    description: "Acompanhe faturamento, ticket medio, ranking de profissionais e desempenho da barbearia.",
  },
  {
    icon: UserCheck,
    title: "Controle de profissionais",
    description: "Gerencie barbeiros, produtividade da equipe, escalas e comissoes com facilidade.",
  },
  {
    icon: Zap,
    title: "Automacao de marketing",
    description: "Reative clientes inativos, envie lembretes automaticos e mensagens de aniversario.",
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
      <div className="absolute inset-0 glow-bg opacity-50" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            Beneficios
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-4 sm:mb-5"
          >
            Tudo que sua barbearia precisa
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Ferramentas profissionais para organizar, crescer e encantar seus clientes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-card hover:shadow-card-hover hover:border-primary/15 transition-all duration-300"
            >
              <div className="mb-4 sm:mb-5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary/8 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2 flex items-center gap-1.5">
                {feature.title}
                <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/0 group-hover:text-primary transition-all duration-300 -translate-y-0.5" />
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
