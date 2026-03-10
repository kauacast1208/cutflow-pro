import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBarbershop } from "@/hooks/useBarbershop";
import { useUserRole } from "@/hooks/useUserRole";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SubscriptionBanner from "@/components/billing/SubscriptionBanner";

export default function DashboardLayout() {
  const { user } = useAuth();
  const { barbershop, loading } = useBarbershop();
  const { role } = useUserRole();
  const navigate = useNavigate();
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
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar />
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <SubscriptionBanner />
            <div className="mt-2">
              <Outlet />
            </div>
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
