import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { TenantProvider, useTenant } from "@/hooks/useTenant";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OnboardingPage from "./pages/OnboardingPage";
import { OnboardingErrorBoundary } from "./components/OnboardingErrorBoundary";
import DemoPage from "./pages/DemoPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import CheckoutPage from "./pages/CheckoutPage";
import TrialExpiredPage from "./pages/TrialExpiredPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import ReschedulePage from "./pages/ReschedulePage";
import FAQPage from "./pages/FAQPage";
import AmbassadorPage from "./pages/AmbassadorPage";
import BillingPage from "./pages/BillingPage";
import BillingSuccessPage from "./pages/BillingSuccessPage";
import BillingCancelPage from "./pages/BillingCancelPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import MasterLayout from "./components/master/MasterLayout";
import MasterDashboard from "./pages/master/MasterDashboard";
import MasterTenantsPage from "./pages/master/MasterTenantsPage";
import MasterTenantDetailPage from "./pages/master/MasterTenantDetailPage";
import MasterUsersPage from "./pages/master/MasterUsersPage";
import MasterPlansPage from "./pages/master/MasterPlansPage";
import MasterSubscriptionsPage from "./pages/master/MasterSubscriptionsPage";
import MasterLogsPage from "./pages/master/MasterLogsPage";
import MasterSettingsPage from "./pages/master/MasterSettingsPage";
import { useMasterRole } from "./hooks/useMasterRole";
import DashboardHome from "./pages/dashboard/DashboardHome";
import AgendaPage from "./pages/dashboard/AgendaPage";
import ClientsPage from "./pages/dashboard/ClientsPage";
import ProfessionalsPage from "./pages/dashboard/ProfessionalsPage";
import ServicesPage from "./pages/dashboard/ServicesPage";
import FinancePage from "./pages/dashboard/FinancePage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import CampaignsPage from "./pages/dashboard/CampaignsPage";
import DirectMailPage from "./pages/dashboard/DirectMailPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import TeamPage from "./pages/dashboard/TeamPage";
import ReferralsPage from "./pages/dashboard/ReferralsPage";
import AutomationsPage from "./pages/dashboard/AutomationsPage";
import InactiveClientsPage from "./pages/dashboard/InactiveClientsPage";
import MarketingOverviewPage from "./pages/dashboard/MarketingOverviewPage";
import BirthdaysPage from "./pages/dashboard/BirthdaysPage";
import LoyaltyPage from "./pages/dashboard/LoyaltyPage";
import RetentionPage from "./pages/dashboard/RetentionPage";
import CRMPage from "./pages/dashboard/CRMPage";
import FranchiseLayout from "./components/franchise/FranchiseLayout";
import FranchiseDashboard from "./pages/franchise/FranchiseDashboard";
import FranchiseUnitsPage from "./pages/franchise/FranchiseUnitsPage";
import FranchiseProfessionalsPage from "./pages/franchise/FranchiseProfessionalsPage";
import FranchiseServicesPage from "./pages/franchise/FranchiseServicesPage";
import FranchiseFinancePage from "./pages/franchise/FranchiseFinancePage";
import FranchiseReportsPage from "./pages/franchise/FranchiseReportsPage";
import FranchiseSettingsPage from "./pages/franchise/FranchiseSettingsPage";
import { Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

const queryClient = new QueryClient();

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

/** Redirects to /login if not authenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * Dashboard guard — requires:
 * 1. Authenticated user (handled by ProtectedRoute wrapper)
 * 2. Resolved tenant (barbershop)
 * 3. Active subscription (not trial-expired)
 *
 * Redirects:
 * - No barbershop → /onboarding
 * - Trial expired → TrialExpiredPage (inline)
 */
function TenantGuard({ children }: { children: React.ReactNode }) {
  const { status } = useTenant();
  const { isExpired, isActive, loading: subLoading } = useSubscription();

  if (status === "loading" || subLoading) return <FullScreenLoader />;

  // No barbershop → onboarding
  if (status === "no_barbershop") return <Navigate to="/onboarding" replace />;

  // Expired (trial expired, cancelled past period, or expired status) → paywall
  if (isExpired && !isActive) return <TrialExpiredPage />;

  return <>{children}</>;
}

/** Guard for Master-only routes */
function MasterGuard({ children }: { children: React.ReactNode }) {
  const { isMaster, loading } = useMasterRole();
  if (loading) return <FullScreenLoader />;
  if (!isMaster) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Guard for Franquias routes — requires franquias plan */
function FranchiseGuard({ children }: { children: React.ReactNode }) {
  const { subscription, loading } = useSubscription();
  const { status } = useTenant();
  if (loading || status === "loading") return <FullScreenLoader />;
  if (subscription?.plan !== "franquias") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Redirects authenticated users away from login/signup */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isMaster, loading: masterLoading } = useMasterRole();
  if (loading || masterLoading) return <FullScreenLoader />;
  if (user && isMaster) return <Navigate to="/master" replace />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RedirectToBooking() {
  const { slug } = useParams();
  return <Navigate to={`/b/${slug}`} replace />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/faq" element={<FAQPage />} />
    <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
    <Route path="/auth/callback" element={<AuthCallbackPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
    <Route path="/demo" element={<DemoPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/trial-expired" element={<ProtectedRoute><TrialExpiredPage /></ProtectedRoute>} />
    <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
    <Route path="/billing/success" element={<ProtectedRoute><BillingSuccessPage /></ProtectedRoute>} />
    <Route path="/billing/cancel" element={<BillingCancelPage />} />
    <Route path="/settings/billing" element={<Navigate to="/billing" replace />} />
    <Route path="/ambassador" element={<ProtectedRoute><AmbassadorPage /></ProtectedRoute>} />
    <Route path="/b/:slug" element={<PublicBookingPage />} />
    <Route path="/reagendar/:token" element={<ReschedulePage />} />
    <Route path="/agendar/:slug" element={<RedirectToBooking />} />
    <Route path="/book/:slug" element={<RedirectToBooking />} />
    <Route path="/booking" element={<Navigate to="/signup" replace />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <TenantGuard>
            <DashboardLayout />
          </TenantGuard>
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardHome />} />
      <Route path="agenda" element={<AgendaPage />} />
      <Route path="clients" element={<ClientsPage />} />
      <Route path="professionals" element={<ProfessionalsPage />} />
      <Route path="services" element={<ServicesPage />} />
      <Route path="finance" element={<FinancePage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="campaigns" element={<CampaignsPage />} />
      <Route path="direct-mail" element={<DirectMailPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="team" element={<TeamPage />} />
      <Route path="referrals" element={<ReferralsPage />} />
      <Route path="automations" element={<AutomationsPage />} />
      <Route path="inactive-clients" element={<InactiveClientsPage />} />
      <Route path="marketing" element={<MarketingOverviewPage />} />
      <Route path="birthdays" element={<BirthdaysPage />} />
      <Route path="loyalty" element={<LoyaltyPage />} />
      <Route path="retention" element={<RetentionPage />} />
      <Route path="crm" element={<CRMPage />} />
    </Route>
    {/* Franquias routes */}
    <Route
      path="/franquias"
      element={
        <ProtectedRoute>
          <TenantGuard>
            <FranchiseGuard>
              <FranchiseLayout />
            </FranchiseGuard>
          </TenantGuard>
        </ProtectedRoute>
      }
    >
      <Route index element={<FranchiseDashboard />} />
      <Route path="units" element={<FranchiseUnitsPage />} />
      <Route path="professionals" element={<FranchiseProfessionalsPage />} />
      <Route path="services" element={<FranchiseServicesPage />} />
      <Route path="finance" element={<FranchiseFinancePage />} />
      <Route path="reports" element={<FranchiseReportsPage />} />
      <Route path="settings" element={<FranchiseSettingsPage />} />
    </Route>
    {/* Master routes */}
    <Route
      path="/master"
      element={
        <ProtectedRoute>
          <MasterGuard>
            <MasterLayout />
          </MasterGuard>
        </ProtectedRoute>
      }
    >
      <Route index element={<MasterDashboard />} />
      <Route path="tenants" element={<MasterTenantsPage />} />
      <Route path="tenants/:tenantId" element={<MasterTenantDetailPage />} />
      <Route path="plans" element={<MasterPlansPage />} />
      <Route path="subscriptions" element={<MasterSubscriptionsPage />} />
      <Route path="users" element={<MasterUsersPage />} />
      <Route path="logs" element={<MasterLogsPage />} />
      <Route path="settings" element={<MasterSettingsPage />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
