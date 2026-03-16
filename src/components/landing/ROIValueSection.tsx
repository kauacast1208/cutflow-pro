import { motion } from "framer-motion";
import {
  CalendarCheck, UserCheck, DollarSign, BarChart3, ArrowRight, Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: CalendarCheck,
    stat: "1 cliente recuperado",
    headline: "já cobre o plano mensal",
    desc: "Com o ticket médio de R$60, basta recuperar um único cliente perdido por no-show para pagar todo o investimento no CutFlow.",
  },
  {
    icon: UserCheck,
    stat: "37% menos faltas",
    headline: "com lembretes automáticos",
    desc: "Confirmações via WhatsApp e notificações inteligentes reduzem drasticamente os horários vazios na sua agenda.",
  },
  {
    icon: DollarSign,
    stat: "Receita previsível",
    headline: "com controle real do fluxo",
    desc: "Visão financeira por profissional, serviço e período. Você sabe exatamente quanto entra — e de onde vem.",
  },
  {
    icon: BarChart3,
    stat: "3h economizadas",
    headline: "por semana em gestão",
    desc: "Agenda, clientes e financeiro centralizados. Sem planilhas, sem cadernos, sem retrabalho manual.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function ROIValueSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_20%,hsl(var(--primary)/0.05),transparent)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14 sm:mb-18"
        >
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">
            Retorno sobre investimento
          </p>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-[-0.025em] leading-tight mb-4">
            CutFlow não é um custo.
            <br />
            <span className="text-primary">É o investimento que se paga sozinho.</span>
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Cada cliente recuperado, cada falta evitada e cada hora economizada retornam diretamente para o seu faturamento. Barbearias em crescimento já entenderam isso.
          </p>
        </motion.div>

        {/* Pillar cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-12"
        >
          {pillars.map((p) => (
            <motion.div
              key={p.headline}
              variants={itemVariants}
              className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 sm:p-7 transition-all duration-300 hover:border-primary/25 hover:bg-card/80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 transition-colors group-hover:bg-primary/15">
                <p.icon className="h-5 w-5" />
              </div>
              <div className="mb-2">
                <span className="text-lg sm:text-xl font-extrabold text-foreground">{p.stat}</span>
                <span className="text-lg sm:text-xl font-extrabold text-muted-foreground/60 ml-1.5">{p.headline}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Positioning trigger strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-5 sm:p-6 mb-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
            {[
              { icon: Shield, title: "Controle total", desc: "Agenda, financeiro e CRM centralizados" },
              { icon: DollarSign, title: "ROI comprovado", desc: "1 cliente recuperado paga o sistema" },
              { icon: BarChart3, title: "Crescimento real", desc: "Dados que guiam decisões de negócio" },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center"
        >
          <p className="text-sm text-muted-foreground max-w-md">
            <span className="font-semibold text-foreground">A partir de R$49/mês</span> — menos do que um corte com barba na maioria das barbearias.
          </p>

          <Link to="/signup">
            <Button size="lg" className="rounded-xl h-12 px-8 font-bold text-sm gap-2">
              Começar teste grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
