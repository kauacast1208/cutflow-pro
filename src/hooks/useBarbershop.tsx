import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useBarbershop() {
  const { user } = useAuth();
  const [barbershop, setBarbershop] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBarbershop(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      // First try as owner
      const { data: owned } = await supabase
        .from("barbershops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (owned) {
        setBarbershop(owned);
        setLoading(false);
        return;
      }

      // Then try as linked professional
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
        setBarbershop(shop);
      }

      setLoading(false);
    };
    fetch();
  }, [user]);

  return { barbershop, loading, setBarbershop };
}
