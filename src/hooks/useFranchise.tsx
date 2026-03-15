import {
  createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode,
} from "react";
import { useAuth } from "./useAuth";
import { useTenant, type TenantBarbershop } from "./useTenant";
import { useSubscription } from "./useSubscription";
import { supabase } from "@/integrations/supabase/client";

export interface BusinessGroup {
  id: string;
  name: string;
  logo_url: string | null;
  owner_id: string;
}

export interface UnitMetrics {
  unitId: string;
  unitName: string;
  totalAppointments: number;
  revenue: number;
  totalClients: number;
  totalProfessionals: number;
}

interface FranchiseContextType {
  isFranquia: boolean;
  loading: boolean;
  group: BusinessGroup | null;
  units: TenantBarbershop[];
  selectedUnit: TenantBarbershop | null;
  selectUnit: (unitId: string | null) => void;
  isConsolidatedView: boolean;
  refresh: () => Promise<void>;
}

const FranchiseContext = createContext<FranchiseContextType>({
  isFranquia: false,
  loading: true,
  group: null,
  units: [],
  selectedUnit: null,
  selectUnit: () => {},
  isConsolidatedView: true,
  refresh: async () => {},
});

export function FranchiseProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { barbershop, loading: tenantLoading } = useTenant();
  const { subscription, loading: subLoading } = useSubscription();

  const [group, setGroup] = useState<BusinessGroup | null>(null);
  const [units, setUnits] = useState<TenantBarbershop[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [franchiseLoading, setFranchiseLoading] = useState(true);

  const isFranquia = subscription?.plan === "franquias";

  const resolve = useCallback(async () => {
    if (!user || !isFranquia) {
      setGroup(null);
      setUnits([]);
      setFranchiseLoading(false);
      return;
    }

    setFranchiseLoading(true);

    // Get business group owned by user
    const { data: groupData } = await supabase
      .from("business_groups")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!groupData) {
      // If no group but has barbershop, the barbershop is the single unit
      if (barbershop) {
        setUnits([barbershop]);
      }
      setGroup(null);
      setFranchiseLoading(false);
      return;
    }

    setGroup(groupData as BusinessGroup);

    // Get all units in this group
    const { data: unitsData } = await supabase
      .from("barbershops")
      .select("*")
      .eq("business_group_id", groupData.id)
      .order("name");

    setUnits((unitsData as TenantBarbershop[]) || []);
    setFranchiseLoading(false);
  }, [user, isFranquia, barbershop]);

  useEffect(() => {
    if (!tenantLoading && !subLoading) {
      resolve();
    }
  }, [tenantLoading, subLoading, resolve]);

  const selectedUnit = useMemo(() => {
    if (!selectedUnitId) return null;
    return units.find(u => u.id === selectedUnitId) || null;
  }, [selectedUnitId, units]);

  const isConsolidatedView = !selectedUnitId;

  const selectUnit = useCallback((unitId: string | null) => {
    setSelectedUnitId(unitId);
  }, []);

  const loading = tenantLoading || subLoading || franchiseLoading;

  const value: FranchiseContextType = useMemo(() => ({
    isFranquia,
    loading,
    group,
    units,
    selectedUnit,
    selectUnit,
    isConsolidatedView,
    refresh: resolve,
  }), [isFranquia, loading, group, units, selectedUnit, selectUnit, isConsolidatedView, resolve]);

  return (
    <FranchiseContext.Provider value={value}>{children}</FranchiseContext.Provider>
  );
}

export const useFranchise = () => useContext(FranchiseContext);
