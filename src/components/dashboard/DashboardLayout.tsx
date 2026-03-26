import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBarbershop } from "@/hooks/useBarbershop";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { UpgradePrompt } from "@/components/dashboard/UpgradePrompt";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function DashboardLayout() {
  const { user } = useAuth();
  const { barbershop, loading } = useBarbershop();
  const navigate = useNavigate();
  const { plan, upgradeFeature, hideUpgrade } = usePlanPermissions();

  useEffect(() => {
    if (!loading && !barbershop && user) {
      navigate("/onboarding");
    }
  }, [loading, barbershop, user, navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[radial-gradient(circle_at_top,_hsl(163_68%_18%_/_0.12),_transparent_24%),radial-gradient(circle_at_85%_18%,_hsl(207_62%_24%_/_0.18),_transparent_20%),linear-gradient(180deg,_hsl(217_39%_12%)_0%,_hsl(218_36%_10%)_45%,_hsl(222_30%_8%)_100%)]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar />
          <main className="flex-1 overflow-auto bg-transparent px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
            <Outlet />
          </main>
        </div>
      </div>
      <UpgradePrompt feature={upgradeFeature} currentPlan={plan} onClose={hideUpgrade} />
    </SidebarProvider>
  );
}
