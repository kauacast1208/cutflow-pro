/**
 * Stripe plan configuration - maps Stripe price IDs to CutFlow plans.
 */

export const STRIPE_PLANS = {
  starter: {
    priceId: "price_1T9CKPGYcPFVpgolj3CkrGOE",
    name: "Starter",
    price: 49,
    features: [
      "Agenda online",
      "Gestão de clientes",
      "Gestão de serviços",
      "Relatórios básicos",
      "1 profissional",
    ],
  },
  pro: {
    priceId: "price_1T9CLnGYcPFVpgolj9bzdrSgY",
    name: "Pro",
    price: 89,
    recommended: true,
    features: [
      "Tudo do Starter",
      "Relatórios avançados",
      "Controle financeiro",
      "Bloqueio de horários",
      "Campanhas simples",
      "Mala direta básica",
      "Suporte por chat",
      "Até 5 profissionais",
    ],
  },
  premium: {
    priceId: "price_1T9CMGGYcPFVpgolzwe6TMW6",
    name: "Premium",
    price: 149,
    features: [
      "Tudo do Pro",
      "Campanhas avançadas",
      "Mala direta completa",
      "Automação de marketing",
      "Suporte prioritário",
      "Integrações",
      "Profissionais ilimitados",
    ],
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;
