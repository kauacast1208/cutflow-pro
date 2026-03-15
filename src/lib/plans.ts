/**
 * Plan definitions and feature gating for CutFlow SaaS.
 * 
 * This is the single source of truth for what each plan includes.
 * DB plans table is the canonical source; this file provides fallback defaults.
 */

export type PlanTier = "starter" | "pro" | "premium" | "franquias" | "enterprise";

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
  | "integrations"
  | "crm_enabled"
  | "automations"
  | "custom_branding"
  | "multi_unit_enabled";

export type PlanResource = "professionals" | "units" | "users" | "clients" | "services";

export interface PlanConfig {
  label: string;
  features: PlanFeature[];
  limits: Record<PlanResource, number>;
  price: number;
  recommended?: boolean;
  description?: string;
  trialDays?: number;
}

export const planConfig: Record<PlanTier, PlanConfig> = {
  starter: {
    label: "Starter",
    price: 79,
    description: "Ideal para barbeiros autônomos",
    trialDays: 15,
    features: [
      "agenda",
      "clients",
      "services",
      "basic_reports",
    ],
    limits: {
      professionals: 1,
      units: 1,
      users: 3,
      clients: 200,
      services: 10,
    },
  },
  pro: {
    label: "Pro",
    price: 129,
    recommended: true,
    description: "Ideal para barbearias em crescimento",
    trialDays: 15,
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
      "crm_enabled",
    ],
    limits: {
      professionals: 5,
      units: 1,
      users: 10,
      clients: 1000,
      services: 30,
    },
  },
  premium: {
    label: "Premium",
    price: 189,
    description: "Para barbearias profissionais",
    trialDays: 15,
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
      "crm_enabled",
      "automations",
      "custom_branding",
    ],
    limits: {
      professionals: Infinity,
      units: 1,
      users: 50,
      clients: 5000,
      services: 100,
    },
  },
  franquias: {
    label: "Franquias",
    price: 349,
    description: "Para redes e franquias com múltiplas unidades",
    trialDays: 15,
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
      "crm_enabled",
      "automations",
      "custom_branding",
      "multi_unit_enabled",
    ],
    limits: {
      professionals: Infinity,
      units: 999,
      users: 999,
      clients: 99999,
      services: 999,
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
  crm_enabled: "CRM completo",
  automations: "Automações",
  custom_branding: "Marca personalizada",
  multi_unit_enabled: "Múltiplas unidades",
};

/** Human-readable resource labels */
export const resourceLabels: Record<PlanResource, string> = {
  professionals: "Profissionais",
  units: "Unidades",
  users: "Usuários",
  clients: "Clientes",
  services: "Serviços",
};

/** Get the minimum plan required for a feature */
export function getMinPlanForFeature(feature: PlanFeature): PlanTier {
  const tiers: PlanTier[] = ["starter", "pro", "premium", "franquias"];
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
  "/dashboard/crm": "crm_enabled",
  "/dashboard/inactive-clients": "crm_enabled",
  "/dashboard/birthdays": "crm_enabled",
  "/dashboard/retention": "crm_enabled",
  "/dashboard/loyalty": "crm_enabled",
  "/dashboard/referrals": "crm_enabled",
  "/dashboard/automations": "automations",
};
