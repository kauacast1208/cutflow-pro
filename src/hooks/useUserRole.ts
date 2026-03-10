/**
 * Backward-compatible hook that delegates to TenantProvider.
 * All existing code using useUserRole() continues to work unchanged.
 */
import { useTenant, type TenantRole } from "./useTenant";

export type UserRole = TenantRole;

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
  const tenant = useTenant();

  return {
    role: tenant.role,
    loading: tenant.loading,
    isOwner: tenant.isOwner,
    isAdmin: tenant.isAdmin,
    isProfessional: tenant.role === "professional",
    isReceptionist: tenant.role === "receptionist",
    canManageServices: tenant.canManageServices,
    canManageProfessionals: tenant.canManageProfessionals,
    canManageSettings: tenant.canManageSettings,
    canViewFullAgenda: tenant.canViewFullAgenda,
    canCreateAppointments: tenant.canCreateAppointments,
    canViewFinance: tenant.canViewFinance,
    canViewReports: tenant.canViewReports,
    canManageCampaigns: tenant.canManageCampaigns,
  };
}
