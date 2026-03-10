import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useUserRole } from "@/hooks/useUserRole";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SubscriptionBanner from "@/components/billing/SubscriptionBanner";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout() {
  const { user } = useAuth();
  const { barbershop, loading } = useBarbershop();
  const { role } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, upgradeFeature, hideUpgrade } = usePlanPermissions();

  useEffect(() => {
    if (!loading && !barbershop && user) {
      if (role === "owner" || role === "admin") {
        navigate("/onboarding");
      }
    }
  }, [loading, barbershop, user, navigate, role]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar />
          <main className="flex-1 p-3 sm:p-5 lg:p-6 overflow-auto">
            <SubscriptionBanner />
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="mt-1"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <UpgradePrompt
        feature={upgradeFeature}
        onClose={hideUpgrade}
        currentPlan={plan}
      />
    </SidebarProvider>
  );
}
