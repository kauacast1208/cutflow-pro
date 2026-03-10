import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OnboardingPage from "./pages/OnboardingPage";
import DemoPage from "./pages/DemoPage";
import CheckoutPage from "./pages/CheckoutPage";
import TrialExpiredPage from "./pages/TrialExpiredPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import BillingPage from "./pages/BillingPage";
import BillingSuccessPage from "./pages/BillingSuccessPage";
import BillingCancelPage from "./pages/BillingCancelPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
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
import { Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useBarbershop } from "@/hooks/useBarbershop";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { barbershop, loading: shopLoading } = useBarbershop();
  const { isTrialExpired, loading: subLoading } = useSubscription();

  if (shopLoading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No barbershop yet → send to onboarding
  if (!barbershop) return <Navigate to="/onboarding" replace />;

  // Trial expired → show paywall
  if (isTrialExpired) return <TrialExpiredPage />;

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RedirectToAgendar() {
  const { slug } = useParams();
  return <Navigate to={`/agendar/${slug}`} replace />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
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
    <Route path="/agendar/:slug" element={<PublicBookingPage />} />
    <Route path="/book/:slug" element={<RedirectToAgendar />} />
    <Route path="/b/:slug" element={<RedirectToAgendar />} />
    {/* Legacy booking route */}
    <Route path="/booking" element={<Navigate to="/signup" replace />} />
    <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGuard><DashboardLayout /></SubscriptionGuard></ProtectedRoute>}>
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
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
