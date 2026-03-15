import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.info("[Auth] Initializing auth listener...");

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      console.info(
        "[Auth] onAuthStateChange:",
        event,
        nextSession ? `user=${nextSession.user.id}` : "session=null"
      );

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      console.info("[Auth] Loading finished via onAuthStateChange. sessionNull:", !nextSession);
    });

    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error("[Auth] getSession error:", error.message);
      } else {
        console.info(
          "[Auth] getSession result:",
          currentSession ? `user=${currentSession.user.id}` : "session=null"
        );
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);

      console.info("[Auth] Loading finished via getSession. sessionNull:", !currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
