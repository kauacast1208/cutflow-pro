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
  features: string[];
  cta: string;
  ctaStyle: "outline" | "hero";
  popular?: boolean;
  badge?: string;
  icon: React.ReactNode;
  link?: string;
  externalWhatsApp?: { phone: string; message: string };
  cardClass?: string;
}

const plans: PlanDef[] = [
  {
    slug: "starter",
    label: "Starter",
    monthly: 49,
    yearly: 39,
    tagline: "Ideal para barbeiros autônomos.",
    description: "O essencial para organizar sua agenda e seus clientes.",
    icon: <Zap className="h-5 w-5" />,
    features: [
      "Agenda online",
      "1 profissional",
      "Até 100 clientes",
      "Financeiro básico",
      "Relatórios básicos",
      "Página de agendamento",
    ],
    cta: "Começar grátis",
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
    tagline: "Plano escolhido pela maioria das barbearias.",
    description: "Controle total para barbearias em crescimento.",
    icon: <Star className="h-5 w-5" />,
    features: [
      "Tudo do Starter",
      "Até 5 profissionais",
      "CRM completo",
      "Google Calendar",
      "Financeiro avançado",
      "Relatórios semanais",
      "Métricas de desempenho",
      "Histórico de clientes",
      "Upload de logo",
      "Lembretes automáticos",
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
    tagline: "Para operações profissionais.",
    description: "Escala e automação para equipes maiores.",
    icon: <Sparkles className="h-5 w-5" />,
    cardClass: "border-primary/25",
    features: [
      "Tudo do Pro",
      "Até 15 profissionais",
      "Permissões de equipe",
      "Automações",
      "Acesso à API",
      "Exportação de dados",
      "Analytics avançado",
    ],
    cta: "Começar Business",
    ctaStyle: "outline",
    link: "/checkout?plan=premium",
  },
  {
    slug: "franquias",
    label: "Franquias",
    monthly: 299,
    yearly: 239,
    badge: "Para redes",
    tagline: "Gestão centralizada para múltiplas unidades.",
    description: "Controle total da sua rede de barbearias.",
    icon: <Building2 className="h-5 w-5" />,
    cardClass: "bg-gradient-to-br from-card via-card to-primary/[0.04] border-primary/15",
    features: [
      "Tudo do Business",
      "Múltiplas unidades",
      "Dashboard master",
      "Financeiro centralizado",
      "Personalização de marca",
      "Comparativo entre unidades",
      "Gestão de franquias",
    ],
    cta: "Falar com vendas",
    ctaStyle: "outline",
    externalWhatsApp: {
      phone: "5553999481954",
      message: "Olá! Tenho interesse no plano Franquias do CutFlow para minha rede de barbearias.",
    },
  },
  {
    slug: "enterprise",
    label: "Solução Enterprise",
    monthly: null,
    yearly: null,
    tagline: "Para operações que exigem performance máxima.",
    description: "Infraestrutura dedicada e suporte white-glove.",
    icon: <Crown className="h-5 w-5" />,
    cardClass: "bg-card/60 backdrop-blur-md border-primary/10 ring-1 ring-primary/5",
    features: [
      "Tudo do Franquias",
      "Limites personalizados",
      "Onboarding dedicado",
      "Integrações customizadas",
      "Suporte com SLA",
      "Gerente de conta",
      "White label",
      "Ambiente dedicado",
      "Consultoria estratégica",
    ],
    cta: "Falar com especialista",
    ctaStyle: "outline",
    externalLink:
      "https://wa.me/5553999481954?text=Olá! Tenho interesse no plano Enterprise do CutFlow e gostaria de falar com um especialista.",
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
  { q: "O teste gratuito precisa de cartão?", a: "Não. Você começa o trial de 7 dias sem informar dados de pagamento." },
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
        <div className="text-center mb-10 sm:mb-14">
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

        {/* Top 3 plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto items-start">
          {plans.slice(0, 3).map((plan, i) => (
            <PlanCard key={plan.slug} plan={plan} billing={billing} index={i} />
          ))}
        </div>

        {/* Franchise + Enterprise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mt-10">
          {plans.slice(3).map((plan, i) => (
            <PlanCard key={plan.slug} plan={plan} billing={billing} index={i + 3} wide />
          ))}
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
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary/60" /><span>7 dias grátis</span></div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary/60" /><span>Sem taxa escondida</span></div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-primary/60" /><span>Cancele quando quiser</span></div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto mt-16 sm:mt-20">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6">Perguntas frequentes</h3>
          <div className="space-y-3">
            {faqs.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PlanCard({ plan, billing, index, wide }: { plan: PlanDef; billing: Billing; index: number; wide?: boolean }) {
  const isPopular = plan.popular;
  const price = billing === "monthly" ? plan.monthly : plan.yearly;
  const isCustom = price === null;
  const savings = plan.monthly && plan.yearly ? (plan.monthly - plan.yearly) * 12 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border flex flex-col relative transition-all duration-300 ${
        isPopular
          ? "border-primary/40 bg-card shadow-lg ring-2 ring-primary/20 md:scale-[1.04] z-10 p-7 sm:p-9"
          : `border-border/50 bg-card shadow-card hover:shadow-card-hover hover:border-primary/20 p-6 sm:p-8 ${plan.cardClass || ""}`
      } ${wide ? "md:flex-row md:items-start md:gap-8 p-8" : ""}`}
    >
      {/* Popular badge */}
      {isPopular && (
        <>
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm whitespace-nowrap z-20">
            <Star className="h-3 w-3 fill-current" />
            {plan.badge}
          </div>
        </>
      )}

      {/* Non-popular badge */}
      {!isPopular && plan.badge && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20">
          <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider px-3 py-0.5">
            {plan.badge}
          </Badge>
        </div>
      )}

      <div className={`relative ${wide ? "md:flex-1" : ""}`}>
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${isPopular ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
              {plan.icon}
            </div>
            <h3 className={`font-bold ${isPopular ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"}`}>{plan.label}</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{plan.tagline}</p>
        </div>

        <div className="mb-6">
          {isCustom ? (
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">Sob medida</span>
              <p className="text-xs text-muted-foreground mt-1.5">{plan.description}</p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-sm text-muted-foreground">R$</span>
                <span className={`font-extrabold tracking-tight ${isPopular ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}>{price}</span>
                <span className="text-muted-foreground text-xs sm:text-sm">/mês</span>
              </div>
              {billing === "yearly" && savings > 0 ? (
                <p className="text-[11px] sm:text-xs text-primary mt-1.5 font-medium">Economia de R${savings}/ano</p>
              ) : (
                <p className="text-[11px] sm:text-xs text-primary mt-1.5 font-medium">7 dias grátis · Sem cobrança hoje</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`relative ${wide ? "md:flex-1" : ""} flex flex-col flex-1`}>
        <ul className={`space-y-2.5 mb-7 flex-1 ${wide ? "sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2.5 sm:space-y-0" : ""}`}>
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm">
              <Check className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 shrink-0 ${isPopular ? "text-primary" : "text-primary/60"}`} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {plan.externalLink ? (
          <a href={plan.externalLink} target="_blank" rel="noopener noreferrer" className="block mt-auto">
            <Button variant="outline" className={`w-full rounded-xl gap-2 h-11 sm:h-12 text-sm`}>
              <MessageSquare className="h-4 w-4" />
              {plan.cta}
            </Button>
          </a>
        ) : (
          <Link to={plan.link || "/checkout"} className="block mt-auto">
            <Button
              variant={plan.ctaStyle === "hero" ? "hero" : "outline"}
              className={`w-full rounded-xl ${isPopular ? "h-12 sm:h-13 text-[15px] btn-glow" : "h-11 sm:h-12 text-sm"}`}
            >
              {plan.cta}
            </Button>
          </Link>
        )}

        <p className="text-center text-[10px] sm:text-[11px] text-muted-foreground mt-3">
          Cancele quando quiser · Sem fidelidade
        </p>
      </div>
    </motion.div>
  );
}
