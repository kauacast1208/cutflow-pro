import { useMemo, useState, useCallback, useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import {
  planConfig,
  type PlanTier,
  type PlanFeature,
  type PlanResource,
  getMinPlanForFeature,
  featureLabels,
  resourceLabels,
} from "@/lib/plans";

interface DbPlan {
  slug: string;
  label: string;
  price: number;
  features: string[];
  max_professionals: number;
  max_units: number;
  max_users: number;
  max_clients: number;
  max_services: number;
  description: string | null;
}

interface UsePlanPermissionsReturn {
  plan: PlanTier;
  planLabel: string;
  can: (feature: PlanFeature) => boolean;
  limit: (resource: PlanResource) => number;
  isAtLimit: (resource: PlanResource, currentCount: number) => boolean;
  upgradeFeature: PlanFeature | null;
  showUpgrade: (feature: PlanFeature) => void;
  hideUpgrade: () => void;
  getUpgradeMessage: (feature: PlanFeature) => string;
  getLimitMessage: (resource: PlanResource) => string;
  loading: boolean;
}

export function usePlanPermissions(): UsePlanPermissionsReturn {
  const { subscription, loading: subLoading } = useSubscription();
  const [upgradeFeature, setUpgradeFeature] = useState<PlanFeature | null>(null);
  const [dbPlans, setDbPlans] = useState<DbPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("plans")
      .select("slug, label, price, features, max_professionals, max_units, max_users, max_clients, max_services, description")
      .then(({ data }) => {
        if (data && data.length > 0) setDbPlans(data as unknown as DbPlan[]);
        setPlansLoading(false);
      });
  }, []);

  const plan: PlanTier = useMemo(() => {
    if (!subscription) return "starter";
    const p = subscription.plan as PlanTier;
    return planConfig[p] ? p : "starter";
  }, [subscription]);

  const activePlan = useMemo(() => {
    const dbPlan = dbPlans.find((p) => p.slug === plan);
    if (dbPlan) {
      return {
        label: dbPlan.label,
        features: dbPlan.features as PlanFeature[],
        limits: {
          professionals: dbPlan.max_professionals,
          units: dbPlan.max_units,
          users: dbPlan.max_users,
          clients: dbPlan.max_clients,
          services: dbPlan.max_services,
        } as Record<PlanResource, number>,
      };
    }
    return planConfig[plan];
  }, [plan, dbPlans]);

  const loading = subLoading || plansLoading;

  const can = useCallback(
    (feature: PlanFeature) => activePlan.features.includes(feature),
    [activePlan]
  );

  const limit = useCallback(
    (resource: PlanResource) => activePlan.limits[resource] ?? 0,
    [activePlan]
  );

  const isAtLimit = useCallback(
    (resource: PlanResource, currentCount: number) => {
      const max = activePlan.limits[resource];
      if (max === Infinity || max >= 999999) return false;
      return currentCount >= max;
    },
    [activePlan]
  );

  const showUpgrade = useCallback((feature: PlanFeature) => {
    setUpgradeFeature(feature);
  }, []);

  const hideUpgrade = useCallback(() => {
    setUpgradeFeature(null);
  }, []);

  const getUpgradeMessage = useCallback(
    (feature: PlanFeature) => {
      const minPlan = getMinPlanForFeature(feature);
      const label = featureLabels[feature];
      const dbPlan = dbPlans.find((p) => p.slug === minPlan);
      const planLabel = dbPlan?.label || planConfig[minPlan].label;
      return `O recurso "${label}" está disponível a partir do plano ${planLabel}. Faça upgrade para continuar.`;
    },
    [dbPlans]
  );

  const getLimitMessage = useCallback(
    (resource: PlanResource) => {
      const max = activePlan.limits[resource];
      const label = resourceLabels[resource];
      return `Seu plano permite no máximo ${max} ${label.toLowerCase()}. Faça upgrade para aumentar o limite.`;
    },
    [activePlan]
  );

  return {
    plan,
    planLabel: activePlan.label,
    can,
    limit,
    isAtLimit,
    upgradeFeature,
    showUpgrade,
    hideUpgrade,
    getUpgradeMessage,
    getLimitMessage,
    loading,
  };
}
