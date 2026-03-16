import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Users, BarChart3, MessageSquare, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const solutions = [
  {
    icon: Calendar,
    title: "Agenda inteligente",
    description: "Chega de caderno. Veja tudo num painel limpo, sem conflitos e sem estresse.",
  },
  {
    icon: CheckCircle2,
    title: "Confirmações automáticas",
    description: "Lembretes automáticos pelo WhatsApp. Menos faltas, mais cadeiras ocupadas.",
  },
  {
    icon: Users,
    title: "CRM de clientes",
    description: "Histórico, aniversários e perfil completo. Cliente fidelizado volta sozinho.",
  },
  {
    icon: BarChart3,
    title: "Financeiro simples",
    description: "Receita, ticket médio e desempenho por profissional em tempo real.",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp integrado",
    description: "Confirmações, lembretes e comunicação automática direto no WhatsApp.",
  },
  {
    icon: Globe,
    title: "Agendamento online",
    description: "Página profissional para seus clientes agendarem 24h, sem precisar ligar.",
  },
];

export function SolutionSection() {
  return (
    <section className="section-padding bg-secondary/30 relative overflow-hidden">
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
            Como o CutFlow{" "}
            <span className="text-primary">resolve isso.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-[15px] sm:text-lg max-w-lg mx-auto leading-relaxed"
          >
            Ferramentas práticas que trabalham por você enquanto você atende.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group card-premium p-5 sm:p-6 card-lift"
            >
              <div className="mb-4 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/[0.06] group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <s.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <h3 className="text-[15px] sm:text-base font-bold mb-1.5">{s.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10 sm:mt-14"
        >
          <Link to="/signup">
            <Button variant="hero" size="lg" className="btn-glow shadow-glow">
              Começar agora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
