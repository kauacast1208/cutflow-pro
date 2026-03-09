/**
 * Plan definitions and feature gating for CutFlow SaaS.
 * 
 * This is the single source of truth for what each plan includes.
 * Adding a new feature? Add it to PlanFeature and the planConfig below.
 */

export type PlanTier = "starter" | "pro" | "premium";

export type PlanFeature =
  | "agenda"
  | "clients"
  | "services"
  | "basic_reports"
  | "advanced_reports"
  | "finance"
  | "blocked_times"
  | "simple_campaigns"
  | "advanced_campaigns"
  | "basic_mailing"
  | "mailing"
  | "marketing_automation"
  | "priority_support"
  | "chat_support"
  | "integrations";

export type PlanResource = "professionals";

export interface PlanConfig {
  label: string;
  features: PlanFeature[];
  limits: Record<PlanResource, number>;
  price: number;       // monthly BRL
  recommended?: boolean;
}

export const planConfig: Record<PlanTier, PlanConfig> = {
  starter: {
    label: "Starter",
    price: 49,
    features: [
      "agenda",
      "clients",
      "services",
      "basic_reports",
    ],
    limits: {
      professionals: 1,
    },
  },
  pro: {
    label: "Pro",
    price: 89,
    recommended: true,
    features: [
      "agenda",
      "clients",
      "services",
      "basic_reports",
      "advanced_reports",
      "finance",
      "blocked_times",
      "simple_campaigns",
      "basic_mailing",
      "chat_support",
    ],
    limits: {
      professionals: 5,
    },
  },
  premium: {
    label: "Premium",
    price: 149,
    features: [
      "agenda",
      "clients",
      "services",
      "basic_reports",
      "advanced_reports",
      "finance",
      "blocked_times",
      "simple_campaigns",
      "advanced_campaigns",
      "basic_mailing",
      "mailing",
      "marketing_automation",
      "priority_support",
      "chat_support",
      "integrations",
    ],
    limits: {
      professionals: Infinity,
    },
  },
};

/** Human-readable feature labels */
export const featureLabels: Record<PlanFeature, string> = {
  agenda: "Agenda online",
  clients: "Gestão de clientes",
  services: "Gestão de serviços",
  basic_reports: "Relatórios básicos",
  advanced_reports: "Relatórios avançados",
  finance: "Controle financeiro",
  blocked_times: "Bloqueio de horários",
  simple_campaigns: "Campanhas simples",
  advanced_campaigns: "Campanhas avançadas",
  basic_mailing: "Mala direta básica",
  mailing: "Mala direta completa",
  marketing_automation: "Automação de marketing",
  priority_support: "Suporte prioritário",
  chat_support: "Suporte por chat",
  integrations: "Integrações",
};

/** Get the minimum plan required for a feature */
export function getMinPlanForFeature(feature: PlanFeature): PlanTier {
  const tiers: PlanTier[] = ["starter", "pro", "premium"];
  for (const tier of tiers) {
    if (planConfig[tier].features.includes(feature)) return tier;
  }
  return "premium";
}

/** Map dashboard routes to required features */
export const routeFeatureMap: Record<string, PlanFeature> = {
  "/dashboard": "agenda",
  "/dashboard/agenda": "agenda",
  "/dashboard/clients": "clients",
  "/dashboard/services": "services",
  "/dashboard/professionals": "agenda",
  "/dashboard/finance": "finance",
  "/dashboard/reports": "basic_reports",
  "/dashboard/campaigns": "simple_campaigns",
  "/dashboard/direct-mail": "basic_mailing",
  "/dashboard/settings": "agenda",
};
