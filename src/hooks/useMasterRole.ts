import { useAuth } from "./useAuth";
import { useEffect, useState } from "react";
import { fetchUserRole, isMasterRole } from "@/lib/tenant";

export function useMasterRole() {
  const { user, loading: authLoading } = useAuth();
  const [isMaster, setIsMaster] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsMaster(false);
      setLoading(false);
      return;
    }

    fetchUserRole(user.id)
      .then((role) => setIsMaster(isMasterRole(role)))
      .catch((error) => {
        console.warn("[useMasterRole] Role fetch warning:", error);
        setIsMaster(false);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  return { isMaster, loading: authLoading || loading };
}
