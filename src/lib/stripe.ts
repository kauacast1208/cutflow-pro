/**
 * Stripe plan configuration - maps Stripe price IDs to CutFlow plans.
 */

export const STRIPE_PLANS = {
  starter: {
    priceId: "price_1T9CKPGYcPFVpgolj3CkrGOE",
    name: "Starter",
    price: 79,
    features: [
      "1 profissional",
      "Agenda online",
      "Gestao de clientes",
      "Relatorios basicos",
      "Agendamento online",
    ],
  },
  pro: {
    priceId: "price_1T9CLnGYcPFVpgol9bzdrSgY",
    name: "Pro",
    price: 129,
    recommended: true,
    features: [
      "Ate 5 profissionais",
      "Tudo do Starter",
      "Controle financeiro",
      "Campanhas simples",
      "Mala direta",
      "Relatorios avancados",
    ],
  },
  premium: {
    priceId: "price_1T9CMGGYcPFVpgolzwe6TMW6",
    name: "Premium",
    price: 189,
    features: [
      "Profissionais ilimitados",
      "Tudo do Pro",
      "Campanhas completas",
      "Automacoes de marketing",
      "Suporte prioritario",
      "Integracoes e API",
    ],
  },
} as const;

export type StripePlanKey = keyof typeof STRIPE_PLANS;
