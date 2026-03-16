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
  RefreshCw,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface PlanDef {
  slug: string;
  label: string;
  price: number | null;
  description: string;
  features: string[];
  cta: string;
  ctaStyle: "outline" | "hero";
  popular?: boolean;
  icon: React.ReactNode;
  link?: string;
  externalLink?: string;
}

const plans: PlanDef[] = [
  {
    slug: "starter",
    label: "Starter",
    price: 29,
    description: "Para barbeiros autônomos que querem se organizar.",
    icon: <Zap className="h-5 w-5" />,
    features: [
      "Agenda online",
      "1 profissional",
      "Até 150 clientes",
      "Lembretes via WhatsApp",
      "Página de agendamento",
      "Financeiro básico",
      "Relatórios básicos",
      "Suporte por e-mail",
    ],
    cta: "Começar grátis",
    ctaStyle: "outline",
    link: "/checkout?plan=starter",
  },
  {
    slug: "pro",
    label: "Pro",
    price: 79,
    popular: true,
    description: "Para barbearias em crescimento que precisam de mais controle.",
    icon: <Star className="h-5 w-5" />,
    features: [
      "Tudo do Starter",
      "Até 5 profissionais",
      "CRM completo",
      "Lembretes automáticos",
      "Google Calendar",
      "Dashboard financeiro completo",
      "Relatórios avançados",
      "Métricas semanais",
      "Upload de logo",
      "Suporte prioritário",
    ],
    cta: "Começar teste grátis",
    ctaStyle: "hero",
    link: "/checkout?plan=pro",
  },
  {
    slug: "business",
    label: "Business",
    price: 149,
    description: "Para operações profissionais que precisam de escala.",
    icon: <Sparkles className="h-5 w-5" />,
    features: [
      "Tudo do Pro",
      "Até 15 profissionais",
      "Relatórios estratégicos",
      "Permissões de equipe",
      "Automações",
      "Integrações",
      "Acesso à API",
      "Exportação de dados",
    ],
    cta: "Começar Business",
    ctaStyle: "outline",
    link: "/checkout?plan=premium",
  },
  {
    slug: "franquias",
    label: "Franquias",
    price: 349,
    description: "Para redes com múltiplas unidades.",
    icon: <Building2 className="h-5 w-5" />,
    features: [
      "Tudo do Business",
      "Múltiplas unidades",
      "Dashboard master",
      "Comparativo entre unidades",
      "Financeiro centralizado",
      "Personalização de marca",
      "Gestão de franquias",
    ],
    cta: "Falar com vendas",
    ctaStyle: "outline",
    externalLink:
      "https://wa.me/5553999481954?text=Olá! Tenho interesse no plano Franquias do CutFlow para minha rede de barbearias.",
  },
  {
    slug: "enterprise",
    label: "Enterprise",
    price: null,
    description: "Para operações de grande porte com necessidades personalizadas.",
    icon: <Crown className="h-5 w-5" />,
    features: [
      "Tudo incluso",
      "Limites personalizados",
      "Onboarding dedicado",
      "Integrações customizadas",
      "Suporte com SLA",
      "Gerente de conta",
      "White label",
      "Ambiente dedicado",
    ],
    cta: "Falar com vendas",
    ctaStyle: "outline",
    externalLink:
      "https://wa.me/5553999481954?text=Olá! Tenho interesse no plano Enterprise do CutFlow para minha barbearia e gostaria de entender como funciona a solução personalizada.",
  },
];

const includedInAll = [
  { icon: <Lock className="h-4 w-4" />, label: "SSL incluso" },
  { icon: <ShieldCheck className="h-4 w-4" />, label: "Backup diário" },
  { icon: <RefreshCw className="h-4 w-4" />, label: "Atualizações automáticas" },
  { icon: <Shield className="h-4 w-4" />, label: "Segurança avançada" },
  { icon: <Globe className="h-4 w-4" />, label: "Login com Google" },
];

const faqs = [
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Sem fidelidade, sem multa. Cancele quando quiser diretamente pelo painel.",
  },
  {
    q: "O teste gratuito precisa de cartão?",
    a: "Não. Você começa o trial de 7 dias sem informar dados de pagamento.",
  },
  {
    q: "Posso trocar de plano depois?",
    a: "Sim. Faça upgrade ou downgrade a qualquer momento. A cobrança é ajustada proporcionalmente.",
  },
  {
    q: "O que acontece quando o trial acaba?",
    a: "Você escolhe um plano para continuar. Seus dados ficam salvos por 30 dias caso precise de mais tempo.",
  },
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
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </div>
      {open && (
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{a}</p>
      )}
    </button>
  );
}

export function PricingSection() {
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
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl font-extrabold tracking-[-0.025em] mb-3 sm:mb-4"
          >
            Escolha o plano ideal para sua barbearia
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-muted-foreground text-[15px] sm:text-lg max-w-lg mx-auto"
          >
            Comece grátis. Sem fidelidade, sem taxa escondida.
          </motion.p>
        </div>

        {/* Top 3 plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto items-start">
          {plans.slice(0, 3).map((plan, i) => (
            <PlanCard key={plan.slug} plan={plan} index={i} />
          ))}
        </div>

        {/* Franchise + Enterprise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto mt-5 sm:mt-6">
          {plans.slice(3).map((plan, i) => (
            <PlanCard key={plan.slug} plan={plan} index={i + 3} wide />
          ))}
        </div>

        {/* Included in all */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="max-w-3xl mx-auto mt-12 sm:mt-14 text-center"
        >
          <p className="text-sm font-semibold mb-4">Todos os planos incluem:</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {includedInAll.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-xs sm:text-[13px] text-muted-foreground"
              >
                <span className="text-primary/60">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 text-xs sm:text-[13px] text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary/60" />
            <span>Pagamento seguro via Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary/60" />
            <span>7 dias grátis</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary/60" />
            <span>Sem taxa escondida</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary/60" />
            <span>Cancele quando quiser</span>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mt-16 sm:mt-20"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6">
            Perguntas frequentes
          </h3>
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

function PlanCard({
  plan,
  index,
  wide,
}: {
  plan: PlanDef;
  index: number;
  wide?: boolean;
}) {
  const isPopular = plan.popular;
  const isCustom = plan.price === null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-2xl border flex flex-col relative transition-all duration-300 ${
        isPopular
          ? "border-primary/40 bg-card shadow-lg ring-2 ring-primary/20 md:scale-[1.03] z-10 p-6 sm:p-8"
          : "border-border/50 bg-card shadow-card hover:shadow-card-hover hover:border-primary/20 p-5 sm:p-7"
      } ${wide ? "md:flex-row md:items-start md:gap-8" : ""}`}
    >
      {isPopular && (
        <>
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm whitespace-nowrap z-20">
            <Star className="h-3 w-3 fill-current" />
            Mais popular
          </div>
        </>
      )}

      <div className={`relative ${wide ? "md:flex-1" : ""}`}>
        <div className="mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                isPopular ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {plan.icon}
            </div>
            <h3 className={`font-bold ${isPopular ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"}`}>
              {plan.label}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {plan.description}
          </p>
        </div>

        <div className="mb-5 sm:mb-6">
          {isCustom ? (
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">Sob medida</span>
              <p className="text-xs text-muted-foreground mt-1">Plano personalizado</p>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-sm text-muted-foreground">R$</span>
                <span className={`font-extrabold tracking-tight ${isPopular ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"}`}>
                  {plan.price}
                </span>
                <span className="text-muted-foreground text-xs sm:text-sm">/mês</span>
              </div>
              <p className="text-[11px] sm:text-xs text-primary mt-1.5 font-medium">
                7 dias grátis · Sem cobrança hoje
              </p>
            </div>
          )}
        </div>
      </div>

      <div className={`relative ${wide ? "md:flex-1" : ""} flex flex-col flex-1`}>
        <ul className={`space-y-2.5 mb-6 sm:mb-7 flex-1 ${wide ? "sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2.5 sm:space-y-0" : ""}`}>
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm">
              <Check className={`h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 shrink-0 ${isPopular ? "text-primary" : "text-primary/60"}`} />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {plan.externalLink ? (
          <a href={plan.externalLink} target="_blank" rel="noopener noreferrer" className="block mt-auto">
            <Button
              variant={plan.ctaStyle === "hero" ? "hero" : "outline"}
              className={`w-full rounded-xl gap-2 ${isPopular ? "h-12 sm:h-13 text-[15px]" : "h-11 sm:h-12 text-sm"}`}
            >
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
