/**
 * Stripe plan configuration - maps Stripe price IDs to CutFlow plans.
 */

export const STRIPE_PLANS = {
  starter: {
    priceId: "price_1T9CKPGYcPFVpgolj3CkrGOE",
    name: "Starter",
    price: 79,
    description: "Ideal para barbeiros autônomos.",
    features: [
      "1 profissional",
      "Agenda online",
      "Gestão de clientes",
      "Histórico de atendimentos",
      "Relatórios básicos",
      "Página pública de agendamento",
    ],
  },
  pro: {
    priceId: "price_1T9CLnGYcPFVpgol9bzdrSgY",
    name: "Pro",
    price: 129,
    recommended: true,
    description: "Ideal para barbearias em crescimento.",
    features: [
      "Até 5 profissionais",
      "Tudo do Starter",
      "Controle financeiro",
      "Campanhas simples",
      "Mala direta para clientes",
      "Relatórios avançados",
      "Métricas de faturamento",
    ],
  },
  premium: {
    priceId: "price_1T9CMGGYcPFVpgolzwe6TMW6",
    name: "Premium",
    price: 189,
    description: "Para barbearias profissionais.",
    features: [
      "Profissionais ilimitados",
      "Tudo do Pro",
      "Campanhas completas",
      "Automações de marketing",
      "Integrações e API",
      "Suporte prioritário",
      "Relatórios estratégicos",
    ],
  },
  franquias: {
    priceId: "", // To be configured
    name: "Franquias",
    price: 349,
    description: "Para redes e franquias com múltiplas unidades.",
    features: [
      "Múltiplas unidades",
      "Tudo do Premium",
      "Gestão centralizada",
      "Relatórios por unidade",
      "Visão consolidada",
      "Gerente de conta dedicado",
    ],
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;
