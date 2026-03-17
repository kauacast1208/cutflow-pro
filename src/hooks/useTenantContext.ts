import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatSupabaseError } from "@/lib/supabaseErrors";
import { resolveTenantContextDirect } from "@/lib/tenant";

export type TenantRole = "owner" | "admin" | "professional" | "receptionist";
export type TenantSubscriptionStatus = "trial" | "active" | "past_due" | "cancelled" | "expired";
export type TenantSubscriptionPlan = "starter" | "pro" | "premium";

export interface TenantContextState {
  onboardingRequired: boolean;
  barbershopId: string | null;
  role: TenantRole | null;
  subscription: {
    id: string;
    plan: TenantSubscriptionPlan;
    status: TenantSubscriptionStatus;
    trialEndsAt: string | null;
  } | null;
}

const emptyTenantState: TenantContextState = {
  onboardingRequired: true,
  barbershopId: null,
  role: null,
  subscription: null,
};

export function useTenantContext() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<TenantContextState>(emptyTenantState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTenant(emptyTenantState);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchTenantContext = async () => {
      setLoading(true);
      setError(null);

      console.info("[Tenant] Resolving tenant context", {
        userId: user.id,
      });

      try {
        const resolvedTenant = await resolveTenantContextDirect(user.id);

        if (resolvedTenant.onboardingRequired || !resolvedTenant.barbershopId) {
          console.info("[Tenant] No active tenant yet; onboarding required", {
            userId: user.id,
          });
          setTenant(emptyTenantState);
          setLoading(false);
          return;
        }

        console.info("[Tenant] Tenant context resolved", {
          userId: user.id,
          barbershopId: resolvedTenant.barbershopId,
          role: resolvedTenant.role,
          subscriptionStatus: resolvedTenant.subscription?.status ?? null,
        });

        setTenant(resolvedTenant);
        setLoading(false);
      } catch (tenantError) {
        const message = formatSupabaseError(tenantError as Error);
        console.error("[Tenant] Failed to resolve tenant context", {
          userId: user.id,
          error: tenantError,
        });
        setTenant(emptyTenantState);
        setError(message);
        setLoading(false);
      }
    };

    void fetchTenantContext();
  }, [user]);

  return { tenant, loading, error, setTenant };
}
