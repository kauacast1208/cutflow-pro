/**
 * Backward-compatible hook that delegates to TenantProvider.
 * All existing code using useBarbershop() continues to work unchanged.
 */
import { useTenant, type TenantBarbershop } from "./useTenant";

export function useBarbershop() {
  const { barbershop, loading, setBarbershop } = useTenant();
  return {
    barbershop,
    loading,
    setBarbershop,
  } as {
    barbershop: TenantBarbershop | null;
    loading: boolean;
    setBarbershop: (shop: TenantBarbershop | null) => void;
  };
}
