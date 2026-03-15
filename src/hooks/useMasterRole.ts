import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

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

    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsMaster(data?.role === "master");
        setLoading(false);
      });
  }, [user, authLoading]);

  return { isMaster, loading: authLoading || loading };
}
