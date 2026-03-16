import { motion } from "framer-motion";
import {
  ShieldCheck, TrendingUp, Users, BarChart3, Clock, Zap,
  Building2, Lock, Award,
} from "lucide-react";

const trustPillars = [
  {
    icon: BarChart3,
    title: "Visibilidade financeira total",
    desc: "Receita, ticket médio e projeções em tempo real. Decisões baseadas em dados, não intuição.",
  },
  {
    icon: Users,
    title: "Retenção inteligente de clientes",
    desc: "CRM com histórico, lembretes automáticos e campanhas de reativação que reduzem churn.",
  },
  {
    icon: Clock,
    title: "Controle operacional completo",
    desc: "Agenda, equipe, serviços e horários bloqueados — tudo centralizado e sem retrabalho.",
  },
  {
    icon: TrendingUp,
    title: "Crescimento previsível",
    desc: "Métricas de performance por profissional, período e serviço. Escale com confiança.",
  },
];

const trustBadges = [
  { icon: Lock, label: "Dados protegidos com criptografia" },
  { icon: ShieldCheck, label: "Pagamentos seguros via Stripe" },
  { icon: Zap, label: "99.9% de disponibilidade" },
  { icon: Award, label: "Suporte prioritário incluso" },
];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export function TrustAuthoritySection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-14 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-xs font-semibold text-primary mb-5">
            <Building2 className="h-3.5 w-3.5" />
            Plataforma profissional
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-[-0.025em] leading-tight mb-4">
            Mais do que agenda online.
            <br />
            <span className="text-primary">Um sistema operacional para seu negócio.</span>
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            O CutFlow reúne gestão financeira, controle de equipe, CRM e automações em uma única plataforma — projetada para barbearias que levam o negócio a sério.
          </p>
        </motion.div>

        {/* Pillar cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-14 sm:mb-20"
        >
          {trustPillars.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              className="group rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 sm:p-7 transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <p.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-foreground mb-1.5 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm px-6 py-5 sm:py-6"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {trustBadges.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.08] text-primary/70">
                  <b.icon className="h-4 w-4" />
                </div>
                <span className="text-xs sm:text-[13px] text-muted-foreground font-medium leading-tight">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
