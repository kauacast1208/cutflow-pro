import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Check,
  Star,
  Shield,
  Zap,
  Crown,
  MessageSquare,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldCheck,
  Globe,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { whatsAppClickHandler } from "@/lib/whatsappCTA";

type Billing = "monthly" | "yearly";

interface PlanDef {
  slug: string;
  label: string;
  monthly: number | null;
  yearly: number | null;
  tagline: string;
  description: string;
  features: { text: string; highlight?: boolean }[];
  cta: string;
  ctaStyle: "outline" | "hero";
  popular?: boolean;
  badge?: string;
  icon: React.ReactNode;
  link?: string;
  externalWhatsApp?: { phone: string; message: string };
}

const plans: PlanDef[] = [
  {
    slug: "starter",
    label: "Starter",
    monthly: 49,
    yearly: 39,
    tagline: "Para barbeiros autônomos",
    description: "O essencial para organizar sua agenda.",
    icon: <Zap className="h-4 w-4" />,
    features: [
      { text: "Agenda online" },
      { text: "1 profissional" },
      { text: "Até 100 clientes" },
      { text: "Financeiro básico" },
      { text: "Relatórios básicos" },
      { text: "Página de agendamento" },
    ],
    cta: "Começar teste grátis",
    ctaStyle: "outline",
    link: "/checkout?plan=starter",
  },
  {
    slug: "pro",
    label: "Pro",
    monthly: 79,
    yearly: 63,
    popular: true,
    badge: "Mais popular",
    tagline: "O plano escolhido por 73% das barbearias",
    description: "Controle total para barbearias em crescimento.",
    icon: <Star className="h-5 w-5" />,
    features: [
      { text: "Tudo do Starter", highlight: true },
      { text: "Até 5 profissionais" },
      { text: "CRM completo" },
      { text: "Google Calendar" },
      { text: "Financeiro avançado" },
      { text: "Relatórios semanais" },
      { text: "Métricas de desempenho" },
      { text: "Histórico de clientes" },
      { text: "Upload de logo" },
      { text: "Lembretes automáticos" },
    ],
    cta: "Começar teste grátis",
    ctaStyle: "hero",
    link: "/checkout?plan=pro",
  },
  {
    slug: "business",
    label: "Business",
    monthly: 159,
    yearly: 127,
    tagline: "Para operações profissionais",
    description: "Escala e automação para equipes maiores.",
    icon: <Sparkles className="h-4 w-4" />,
    features: [
      { text: "Tudo do Pro", highlight: true },
      { text: "Até 15 profissionais" },
      { text: "Permissões de equipe" },
      { text: "Automações" },
      { text: "Acesso à API" },
      { text: "Exportação de dados" },
      { text: "Analytics avançado" },
    ],
    cta: "Começar teste grátis",
    ctaStyle: "outline",
    link: "/checkout?plan=premium",
  },
  {
    slug: "franquias",
    label: "Franquias",
    monthly: null,
    yearly: null,
    badge: "Para redes",
    tagline: "Gestão centralizada para múltiplas unidades",
    description: "Solução sob medida para sua rede de barbearias.",
    icon: <Building2 className="h-5 w-5" />,
    features: [
      { text: "Tudo do Business", highlight: true },
      { text: "Múltiplas unidades" },
      { text: "Dashboard master" },
      { text: "Financeiro centralizado" },
      { text: "Personalização de marca" },
      { text: "Comparativo entre unidades" },
      { text: "Gestão de franquias" },
    ],
    cta: "Falar com especialista",
    ctaStyle: "outline",
    externalWhatsApp: {
      phone: "5553999481954",
      message: `Olá! Tenho interesse no plano *Franquias* do CutFlow.

📍 Quantidade de unidades: 
👥 Tamanho da equipe: 
🏙️ Cidade/Estado: 
📋 Principais necessidades: 

Gostaria de conversar com um especialista para montar a solução ideal.`,
    },
  },
  {
    slug: "enterprise",
    label: "Enterprise",
    monthly: null,
    yearly: null,
    tagline: "Para operações que exigem performance máxima",
    description: "Infraestrutura dedicada e suporte white-glove.",
    icon: <Crown className="h-5 w-5" />,
    features: [
      { text: "Tudo do Franquias", highlight: true },
      { text: "Limites personalizados" },
      { text: "Onboarding dedicado" },
      { text: "Integrações customizadas" },
      { text: "Suporte com SLA" },
      { text: "Gerente de conta" },
      { text: "White label" },
      { text: "Ambiente dedicado" },
      { text: "Consultoria estratégica" },
    ],
    cta: "Falar com especialista",
    ctaStyle: "outline",
    externalWhatsApp: {
      phone: "5553999481954",
      message: `Olá! Tenho interesse no plano *Enterprise* do CutFlow.

📍 Quantidade de unidades: 
👥 Tamanho da equipe: 
🏙️ Cidade/Estado: 
📋 Principais necessidades: 

Gostaria de montar uma solução personalizada com um especialista.`,
    },
  },
];

const includedInAll = [
  { icon: <Lock className="h-4 w-4" />, label: "SSL incluso" },
  { icon: <ShieldCheck className="h-4 w-4" />, label: "Backups diários" },
  { icon: <Shield className="h-4 w-4" />, label: "Segurança avançada" },
  { icon: <Globe className="h-4 w-4" />, label: "Login com Google" },
  { icon: <Headphones className="h-4 w-4" />, label: "Suporte incluído" },
];

const faqs = [
  { q: "Posso cancelar a qualquer momento?", a: "Sim. Sem fidelidade, sem multa. Cancele quando quiser diretamente pelo painel." },
  { q: "O teste gratuito precisa de cartão?", a: "Não. Você começa o trial de 15 dias sem informar dados de pagamento." },
  { q: "Posso trocar de plano depois?", a: "Sim. Faça upgrade ou downgrade a qualquer momento. A cobrança é ajustada proporcionalmente." },
  { q: "O que acontece quando o trial acaba?", a: "Você escolhe um plano para continuar. Seus dados ficam salvos por 30 dias caso precise de mais tempo." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left border border-border/50 rounded-xl px-5 py-4 transition-colors hover:border-primary/20 hover:bg-card/60"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">{q}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>
      {open && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{a}</p>}
    </button>
  );
}

export function PricingSection() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="pricing" className="section-padding bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/[0.06] border border-primary/12 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-5"
          >
            <Zap className="h-3.5 w-3.5" />
            Preço de lançamento
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl sm:text-4xl font-extrabold tracking-[-0.025em] mb-3 sm:mb-4">
            Escolha o plano ideal para sua barbearia
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }} className="text-muted-foreground text-[15px] sm:text-lg max-w-lg mx-auto mb-8">
            Comece grátis. Sem fidelidade, sem taxa escondida.
          </motion.p>

          {/* Billing toggle */}
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm p-1">
            <button onClick={() => setBilling("monthly")} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === "monthly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              Mensal
            </button>
            <button onClick={() => setBilling("yearly")} className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billing === "yearly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              Anual
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-semibold">-20%</Badge>
            </button>
          </motion.div>
        </div>

        {/* Top 3 plans — Starter · Pro · Business */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-[960px] mx-auto items-stretch">
          {/* Starter — compact, understated */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl md:rounded-r-none border border-border/40 bg-card/60 p-6 sm:p-7 flex flex-col relative"
          >
            <StarterCard plan={plans[0]} billing={billing} />
          </motion.div>

          {/* Pro — dominant, elevated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="rounded-2xl border-2 border-primary/40 bg-card shadow-xl ring-1 ring-primary/10 p-7 sm:p-9 flex flex-col relative z-10 md:-mx-px md:scale-y-[1.03]"
          >
            {/* Popular badge */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/15 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-md whitespace-nowrap z-20">
              <Star className="h-3 w-3 fill-current" />
              {plans[1].badge}
            </div>
            <ProCard plan={plans[1]} billing={billing} />
          </motion.div>

          {/* Business — solid, professional */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 }}
            className="rounded-2xl md:rounded-l-none border border-border/40 bg-card/60 p-6 sm:p-7 flex flex-col relative"
          >
            <StarterCard plan={plans[2]} billing={billing} />
          </motion.div>
        </div>

        {/* Franchise + Enterprise — premium row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[960px] mx-auto mt-8 sm:mt-10">
          <FranchiseCard plan={plans[3]} />
          <EnterpriseCard plan={plans[4]} />
        </div>

        {/* Included in all */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.25 }} className="max-w-3xl mx-auto mt-14 sm:mt-16 text-center">
          <p className="text-sm font-semibold mb-5">Todos os planos incluem:</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {includedInAll.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs sm:text-[13px] text-muted-foreground">
                <span className="text-primary/60">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust row */}
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 text-xs sm:text-[13px] text-muted-foreground">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary/60" /><span>Pagamento seguro via Stripe</span></div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary/60" /><span>15 dias grátis</span></div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary/60" /><span>Sem taxa escondida</span></div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary/60" /><span>Cancele quando quiser</span></div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto mt-16 sm:mt-20">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6">Perguntas frequentes</h3>
          <div className="space-y-3">
            {faqs.map((f) => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Starter / Business card (compact) ── */
function StarterCard({ plan, billing }: { plan: PlanDef; billing: Billing }) {
  const price = billing === "monthly" ? plan.monthly : plan.yearly;
  const savings = plan.monthly && plan.yearly ? (plan.monthly - plan.yearly) * 12 : 0;

  return (
    <div className="relative flex flex-col flex-1">
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            {plan.icon}
          </div>
          <h3 className="text-lg font-bold">{plan.label}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{plan.tagline}</p>
      </div>

      <div className="mb-5">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-muted-foreground">R$</span>
          <span className="text-3xl font-extrabold tracking-tight">{price}</span>
          <span className="text-muted-foreground text-xs">/mês</span>
        </div>
        {billing === "yearly" && savings > 0 ? (
          <p className="text-[11px] text-primary mt-1 font-medium">Economia de R${savings}/ano</p>
        ) : (
          <p className="text-[11px] text-primary mt-1 font-medium">15 dias grátis</p>
        )}
      </div>

      <ul className="space-y-2 mb-6 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2 text-xs sm:text-[13px]">
            <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/50" />
            <span className={f.highlight ? "font-medium text-primary/80" : ""}>{f.text}</span>
          </li>
        ))}
      </ul>

      <Link to={plan.link || "/checkout"} className="block mt-auto">
        <Button variant="outline" className="w-full rounded-xl h-10 text-sm">
          {plan.cta}
        </Button>
      </Link>
      <p className="text-center text-[10px] text-muted-foreground mt-2.5">15 dias grátis · Sem fidelidade · Cancele quando quiser</p>
    </div>
  );
}

/* ── Pro card (hero, dominant) ── */
function ProCard({ plan, billing }: { plan: PlanDef; billing: Billing }) {
  const price = billing === "monthly" ? plan.monthly : plan.yearly;
  const savings = plan.monthly && plan.yearly ? (plan.monthly - plan.yearly) * 12 : 0;

  return (
    <div className="relative flex flex-col flex-1">
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
            {plan.icon}
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">{plan.label}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{plan.tagline}</p>
      </div>

      <div className="mb-7">
        <div className="flex items-baseline gap-1">
          <span className="text-sm text-muted-foreground">R$</span>
          <span className="text-5xl sm:text-[3.5rem] font-extrabold tracking-tight">{price}</span>
          <span className="text-muted-foreground text-sm">/mês</span>
        </div>
        {billing === "yearly" && savings > 0 ? (
          <p className="text-xs text-primary mt-2 font-semibold">Economia de R${savings}/ano</p>
        ) : (
          <p className="text-xs text-primary mt-2 font-semibold">15 dias grátis · Sem cobrança hoje</p>
        )}
      </div>

      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-2.5 text-sm">
            <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
            <span className={f.highlight ? "font-semibold text-primary" : ""}>{f.text}</span>
          </li>
        ))}
      </ul>

      <Link to={plan.link || "/checkout"} className="block mt-auto">
        <Button variant="hero" className="w-full rounded-xl h-13 text-[15px] btn-glow shadow-lg">
          {plan.cta}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </Link>
      <p className="text-center text-[11px] text-muted-foreground mt-3">15 dias grátis · Sem cartão · Cancele quando quiser</p>
    </div>
  );
}

/* ── Franchise card ── */
function FranchiseCard({ plan }: { plan: PlanDef }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-primary/15 bg-gradient-to-br from-card via-card to-primary/[0.04] p-7 sm:p-8 flex flex-col relative"
    >
      <div className="absolute -top-2.5 left-6 z-20">
        <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider px-3 py-0.5">
          {plan.badge}
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8">
        <div className="sm:flex-1">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {plan.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold">{plan.label}</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">{plan.tagline}</p>

          <div className="mb-5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">Sob medida</span>
            <p className="text-xs text-muted-foreground mt-1.5">{plan.description}</p>
          </div>
        </div>

        <div className="sm:flex-1">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
            {plan.features.map((f) => (
              <li key={f.text} className="flex items-start gap-2 text-xs sm:text-[13px]">
                <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                <span className={f.highlight ? "font-medium text-primary/80" : ""}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a
        href={`https://wa.me/${plan.externalWhatsApp!.phone}?text=${encodeURIComponent(plan.externalWhatsApp!.message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-auto w-full"
      >
        <Button variant="outline" className="w-full rounded-xl gap-2 h-11 text-sm border-primary/20 hover:bg-primary/5">
          <MessageSquare className="h-4 w-4" />
          {plan.cta}
        </Button>
      </a>
      <p className="text-center text-[10px] text-muted-foreground mt-2.5">Plano sob medida para operações maiores</p>
    </motion.div>
  );
}

/* ── Enterprise card ── */
function EnterpriseCard({ plan }: { plan: PlanDef }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm ring-1 ring-primary/5 p-7 sm:p-8 flex flex-col relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8">
        <div className="sm:flex-1">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-9 w-9 rounded-lg bg-primary/8 flex items-center justify-center text-primary/70">
              {plan.icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold">{plan.label}</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">{plan.tagline}</p>

          <div className="mb-5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">Sob medida</span>
            <p className="text-xs text-muted-foreground mt-1.5">{plan.description}</p>
          </div>
        </div>

        <div className="sm:flex-1">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mb-6">
            {plan.features.map((f) => (
              <li key={f.text} className="flex items-start gap-2 text-xs sm:text-[13px]">
                <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/50" />
                <span className={f.highlight ? "font-medium text-primary/70" : "text-muted-foreground"}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a
        href={`https://wa.me/${plan.externalWhatsApp!.phone}?text=${encodeURIComponent(plan.externalWhatsApp!.message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-auto w-full"
      >
        <Button variant="outline" className="w-full rounded-xl gap-2 h-11 text-sm">
          <MessageSquare className="h-4 w-4" />
          {plan.cta}
        </Button>
      </a>
    </motion.div>
  );
}
