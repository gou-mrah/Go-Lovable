import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { useEffect, useRef } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import HajjPage from "./pages/Hajj";
import UmrahPage from "./pages/Umrah";
import HotelsPage from "./pages/Hotels";
import FlightsPage from "./pages/Flights";
import VisaPage from "./pages/Visa";
import TransportPage from "./pages/Transport";
import ToursPage from "./pages/Tours";
import StorePage from "./pages/Store";
import AdminPage from "./pages/Admin";
import HajjLocalPage from "./pages/HajjLocal";
import VoucherPage from "./pages/Voucher";
import UmrahTrainPage from "./pages/UmrahTrain";
import FlexibleRequestPage from "./pages/FlexibleRequest";
import ProviderDashboardPage from "./pages/provider/ProviderDashboard";
import BecomeProviderPage from "./pages/provider/BecomeProvider";
import MediaCenterPage from "./pages/MediaCenter";
import JoinMarketerPage from "./pages/JoinMarketer";
import MarketerPortalPage from "./pages/MarketerPortal";
import MaintenancePage from "./pages/MaintenancePage";
import NewsPage from "./pages/NewsPage";
import WaitlistPage from "./pages/WaitlistPage";
import LicensesPage from "./pages/Licenses";
import AboutUsPage from "./pages/AboutUs";
import FAQPage from "./pages/FAQ";
import ComplaintsPage from "./pages/Complaints";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import TermsAndConditionsPage from "./pages/TermsAndConditions";
import CancellationPolicyPage from "./pages/CancellationPolicy";
import PackageDetailPage from "./pages/PackageDetail";
import HotelDetailPage from "./pages/HotelDetail";
import SearchResultsPage from "./pages/SearchResults";
import PaymentPage from "./pages/PaymentPage";
import UnifiedPaymentPage from "./pages/UnifiedPaymentPage";
import { trpc } from "./lib/trpc";
import { useAuth } from "./_core/hooks/useAuth";
import UmrahChatbot from "./components/shared/UmrahChatbot";
import ChatWidget from "./components/shared/ChatWidget";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-18">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/hajj/:id" component={PackageDetailPage} />
      <Route path="/umrah/:id" component={PackageDetailPage} />
      <Route path="/hotels/:id" component={HotelDetailPage} />
      <Route path="/tours/:id" component={PackageDetailPage} />
      <Route path="/hajj" component={HajjPage} />
      <Route path="/umrah" component={UmrahPage} />
      <Route path="/hotels" component={HotelsPage} />
      <Route path="/flights" component={FlightsPage} />
      <Route path="/visa" component={VisaPage} />
      <Route path="/transport" component={TransportPage} />
      <Route path="/tours" component={ToursPage} />
      <Route path="/store" component={StorePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/hajj/local" component={HajjLocalPage} />
      <Route path="/voucher" component={VoucherPage} />
      <Route path="/umrah/train" component={UmrahTrainPage} />
      <Route path="/flexible-request" component={FlexibleRequestPage} />
      <Route path="/provider" component={ProviderDashboardPage} />
      <Route path="/become-provider" component={BecomeProviderPage} />
      <Route path="/media" component={MediaCenterPage} />
      <Route path="/join-marketer" component={JoinMarketerPage} />
      <Route path="/marketer-portal" component={MarketerPortalPage} />
      <Route path="/maintenance-preview" component={() => <MaintenancePage />} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/news" component={NewsPage} />
      <Route path="/admin/waitlist" component={WaitlistPage} />
      <Route path="/licenses" component={LicensesPage} />
      <Route path="/about" component={AboutUsPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/complaints" component={ComplaintsPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms-and-conditions" component={TermsAndConditionsPage} />
      <Route path="/cancellation" component={CancellationPolicyPage} />
      <Route path="/search" component={SearchResultsPage} />
      <Route path="/payment/:bookingNumber" component={PaymentPage} />
      <Route path="/pay/:serviceType/:serviceId" component={UnifiedPaymentPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// ─── Page View Tracker ───────────────────────────────────────────────────────
function getOrCreateSessionId(): string {
  const key = "go_umrah_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}
function getDevice(): "desktop" | "mobile" | "tablet" {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}
function PageTracker() {
  const [location] = useLocation();
  const trackPageView = trpc.analytics.trackPageView.useMutation();
  const lastTracked = useRef("");
  useEffect(() => {
    if (lastTracked.current === location) return;
    lastTracked.current = location;
    // Skip admin, api, and maintenance routes
    if (location.startsWith("/admin") || location.startsWith("/api")) return;
    trackPageView.mutate({
      sessionId: getOrCreateSessionId(),
      page: location,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      device: getDevice(),
    });
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// Routes that are always accessible regardless of site open/closed status
const ALWAYS_OPEN_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/admin",
  "/api/oauth",
  "/maintenance-preview",
];

function SiteGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const { data: siteStatus, isLoading } = trpc.siteSettings.getStatus.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  // Admin always bypasses maintenance mode
  if (user?.role === "admin") return <>{children}</>;
  // Auth & admin routes are always accessible (login, register, forgot-password, etc.)
  if (ALWAYS_OPEN_ROUTES.some((r) => location.startsWith(r))) return <>{children}</>;
  // While loading, show nothing (or could show a spinner)
  if (isLoading) return null;
  // Site is closed — show maintenance page
  if (siteStatus && !siteStatus.isOpen) {
    return <MaintenancePage />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <CurrencyProvider>
            <TooltipProvider>
              <Toaster />
              <PageTracker />
              <SiteGuard>
                <Layout>
                  <Router />
                </Layout>
                <UmrahChatbot />
                <ChatWidget />
              </SiteGuard>
            </TooltipProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
