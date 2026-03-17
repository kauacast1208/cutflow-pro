import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useAuth } from "./useAuth";
import {
  bootstrapCurrentUserProfile,
  fetchTenantSnapshot,
  type TenantBarbershop,
  type TenantProfile,
  type TenantRole,
} from "@/lib/tenant";

export type { TenantBarbershop, TenantProfile, TenantRole } from "@/lib/tenant";

type TenantStatus = "loading" | "unauthenticated" | "no_barbershop" | "ready";

interface TenantContextType {
  status: TenantStatus;
  loading: boolean;
  profile: TenantProfile | null;
  barbershop: TenantBarbershop | null;
  role: TenantRole;
  isOwner: boolean;
  isAdmin: boolean;
  tenantId: string | null;
  refresh: () => Promise<void>;
  setBarbershop: (shop: TenantBarbershop | null) => void;
  canManageServices: boolean;
  canManageProfessionals: boolean;
  canManageSettings: boolean;
  canViewFullAgenda: boolean;
  canCreateAppointments: boolean;
  canViewFinance: boolean;
  canViewReports: boolean;
  canManageCampaigns: boolean;
}

const TenantContext = createContext<TenantContextType>({
  status: "loading",
  loading: true,
  profile: null,
  barbershop: null,
  role: "owner",
  isOwner: true,
  isAdmin: true,
  tenantId: null,
  refresh: async () => {},
  setBarbershop: () => {},
  canManageServices: true,
  canManageProfessionals: true,
  canManageSettings: true,
  canViewFullAgenda: true,
  canCreateAppointments: true,
  canViewFinance: true,
  canViewReports: true,
  canManageCampaigns: true,
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [barbershop, setBarbershop] = useState<TenantBarbershop | null>(null);
  const [role, setRole] = useState<TenantRole>("owner");
  const [tenantLoading, setTenantLoading] = useState(true);

  const resolve = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setBarbershop(null);
      setRole("owner");
      setTenantLoading(false);
      return;
    }

    setTenantLoading(true);

    try {
      await bootstrapCurrentUserProfile(user.user_metadata?.full_name || user.email || null);
      const snapshot = await fetchTenantSnapshot(user.id);

      setProfile(snapshot.profile);
      setRole(snapshot.role);
      setBarbershop(snapshot.barbershop);
    } catch (error) {
      console.error("[Tenant] Failed to resolve tenant context", {
        userId: user.id,
        error,
      });
      setProfile(null);
      setBarbershop(null);
      setRole("owner");
    } finally {
      setTenantLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      resolve();
    }
  }, [authLoading, resolve]);

  const loading = authLoading || tenantLoading;

  const status: TenantStatus = useMemo(() => {
    if (loading) return "loading";
    if (!user) return "unauthenticated";
    if (!barbershop) return "no_barbershop";
    return "ready";
  }, [loading, user, barbershop]);

  const isOwner = role === "owner";
  const isAdmin = role === "admin" || role === "owner";
  const isReceptionist = role === "receptionist";

  const value: TenantContextType = useMemo(
    () => ({
      status,
      loading,
      profile,
      barbershop,
      role,
      isOwner,
      isAdmin,
      tenantId: barbershop?.id || null,
      refresh: resolve,
      setBarbershop,
      canManageServices: isAdmin,
      canManageProfessionals: isAdmin,
      canManageSettings: isAdmin,
      canViewFullAgenda: isAdmin || isReceptionist,
      canCreateAppointments: isAdmin || isReceptionist,
      canViewFinance: isAdmin,
      canViewReports: isAdmin,
      canManageCampaigns: isAdmin,
    }),
    [status, loading, profile, barbershop, role, isOwner, isAdmin, isReceptionist, resolve]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export const useTenant = () => useContext(TenantContext);

export function useTenantId(): string {
  const { tenantId } = useTenant();
  if (!tenantId) {
    throw new Error("useTenantId called before tenant is resolved");
  }
  return tenantId;
}
