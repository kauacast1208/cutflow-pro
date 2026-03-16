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
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

// ── Types ──────────────────────────────────────────────
export type TenantRole = "owner" | "admin" | "professional" | "receptionist";
export type TenantProfile = Tables<"profiles">;
export type TenantBarbershop = Tables<"barbershops">;

type TenantStatus =
  | "loading"
  | "unauthenticated"
  | "no_barbershop"
  | "ready";

interface TenantContextType {
  /** Current status of the tenant resolution */
  status: TenantStatus;
  /** Shortcut: true while resolving auth + tenant */
  loading: boolean;
  /** The authenticated user's profile */
  profile: TenantProfile | null;
  /** The resolved barbershop (tenant) */
  barbershop: TenantBarbershop | null;
  /** The user's role within the barbershop */
  role: TenantRole;
  /** Whether the user is the barbershop owner */
  isOwner: boolean;
  /** Whether the user has admin-level access (owner or admin) */
  isAdmin: boolean;
  /** Convenience: current barbershop ID or null */
  tenantId: string | null;
  /** Force re-fetch of tenant data (e.g. after onboarding) */
  refresh: () => Promise<void>;
  /** Update barbershop in context without refetch (optimistic) */
  setBarbershop: (shop: TenantBarbershop | null) => void;

  // ── Permission helpers ──
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

// ── Provider ───────────────────────────────────────────
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

    // Fetch profile, role, and barbershop in parallel
    const [profileRes, roleRes, ownedShopRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("barbershops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle(),
    ]);

    setProfile((profileRes.data as TenantProfile) || null);
    setRole((roleRes.data?.role as TenantRole) || "owner");

    if (ownedShopRes.data) {
      setBarbershop(ownedShopRes.data as TenantBarbershop);
      setTenantLoading(false);
      return;
    }

    // Not an owner — check if linked as professional
    const { data: pro } = await supabase
      .from("professionals")
      .select("barbershop_id")
      .eq("user_id", user.id)
      .eq("active", true)
      .maybeSingle();

    if (pro?.barbershop_id) {
      const { data: shop } = await supabase
        .from("barbershops")
        .select("*")
        .eq("id", pro.barbershop_id)
        .maybeSingle();
      setBarbershop((shop as TenantBarbershop) || null);
    } else {
      setBarbershop(null);
    }

    setTenantLoading(false);
  }, [user]);

  // Resolve on mount and when user changes
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
  const isProfessional = role === "professional";
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
      // Permissions
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

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────
export const useTenant = () => useContext(TenantContext);

/**
 * Quick helper — returns the current tenant (barbershop) ID.
 * Throws if called outside TenantProvider or before tenant resolves.
 */
export function useTenantId(): string {
  const { tenantId } = useTenant();
  if (!tenantId) {
    throw new Error("useTenantId called before tenant is resolved");
  }
  return tenantId;
}
