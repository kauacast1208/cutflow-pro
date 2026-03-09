import { motion } from "framer-motion";
import { Calendar, Users, Globe, BarChart3, ArrowUpRight } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agenda inteligente",
    description: "Calendário visual com controle completo de horários, profissionais e bloqueios automáticos.",
  },
  {
    icon: Users,
    title: "Clientes organizados",
    description: "Cadastro com histórico completo, contatos, preferências e aniversários.",
  },
  {
    icon: Globe,
    title: "Agendamento online",
    description: "Link exclusivo para seus clientes agendarem 24h por dia, direto pelo celular.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e controle",
    description: "Faturamento, comissões, ranking de profissionais e métricas em tempo real.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-secondary/30 relative overflow-hidden">
      <div className="absolute inset-0 glow-bg opacity-50" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/15 px-4 py-1.5 text-sm font-medium text-primary mb-5"
          >
            A solução
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-[-0.02em] mb-5"
          >
            Tudo que sua barbearia precisa
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed"
          >
            Ferramentas profissionais para organizar, crescer e encantar seus clientes.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-2xl border border-border bg-card p-7 shadow-card hover:shadow-elevated hover:border-primary/20 transition-all duration-300"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-lg font-bold mb-2.5 flex items-center gap-1.5">
                {feature.title}
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-primary transition-all duration-300 -translate-y-0.5" />
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
