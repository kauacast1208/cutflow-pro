import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type UserRole = "owner" | "admin" | "professional" | "receptionist";

interface UserRoleData {
  role: UserRole;
  loading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isProfessional: boolean;
  isReceptionist: boolean;
  canManageServices: boolean;
  canManageProfessionals: boolean;
  canManageSettings: boolean;
  canViewFullAgenda: boolean;
  canCreateAppointments: boolean;
  canViewFinance: boolean;
  canViewReports: boolean;
  canManageCampaigns: boolean;
}

export function useUserRole(): UserRoleData {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>("owner");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole("owner");
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      setRole((data?.role as UserRole) || "owner");
      setLoading(false);
    };
    fetchRole();
  }, [user]);

  const isOwner = role === "owner";
  const isAdmin = role === "admin" || role === "owner";
  const isProfessional = role === "professional";
  const isReceptionist = role === "receptionist";

  return {
    role,
    loading,
    isOwner,
    isAdmin,
    isProfessional,
    isReceptionist,
    // Permissions
    canManageServices: isAdmin,
    canManageProfessionals: isAdmin,
    canManageSettings: isAdmin,
    canViewFullAgenda: isAdmin || isReceptionist,
    canCreateAppointments: isAdmin || isReceptionist,
    canViewFinance: isAdmin,
    canViewReports: isAdmin,
    canManageCampaigns: isAdmin,
  };
}
