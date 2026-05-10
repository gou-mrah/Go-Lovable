import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BreakingNewsTicker } from "@/components/media/BreakingNewsTicker";
import NewsTickerBar from "@/components/NewsTickerBar";
import { useAuth } from "@/_core/hooks/useAuth";

import { useLanguage, LANGUAGES, type Language } from "@/contexts/LanguageContext";
import { useCurrency, CURRENCIES, type Currency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Menu,
  ChevronDown,
  Globe,
  Plane,
  Hotel,
  Car,
  MapPin,
  ShoppingBag,
  FileText,
  Star,
  LogIn,
  LogOut,
  LayoutDashboard,
  Shield,
  HeartHandshake,
  Building2,
  Newspaper,
  TrendingUp,
  User,
  Bell,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useState as useStateNB } from "react";

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [unread, setUnread] = useStateNB(0);
  const { data } = trpc.providerNotifications.list.useQuery(
    { limit: 1 },
    { enabled: isAuthenticated, refetchInterval: 60_000 }
  );
  useRealtimeNotifications((n) => {
    if (n.type === "notification") setUnread((p) => p + 1);
  });
  const count = (data?.unreadCount ?? 0) + unread;
  if (!isAuthenticated) return null;
  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#1B5E52] hover:bg-[#1B5E52]/8">
        <Bell className="w-4 h-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>
    </div>
  );
}

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png";

const NAV_ITEMS = [
  { labelKey: "nav.hajj" as const, href: "/hajj", icon: Star },
  { labelKey: "nav.umrah" as const, href: "/umrah", icon: Globe },
  { labelKey: "nav.hotels" as const, href: "/hotels", icon: Hotel },
  { labelKey: "nav.flights" as const, href: "/flights", icon: Plane },
  { labelKey: "nav.visa" as const, href: "/visa", icon: FileText },
  { labelKey: "nav.transport" as const, href: "/transport", icon: Car },
  { labelKey: "nav.tours" as const, href: "/tours", icon: MapPin },
  { labelKey: "nav.store" as const, href: "/store", icon: ShoppingBag },
  { labelKey: "nav.flexibleRequest" as const, href: "/flexible-request", icon: HeartHandshake },
  { labelKey: "nav.news" as const, href: "/news", icon: Newspaper },
  { labelKey: "nav.media" as const, href: "/media", icon: Newspaper },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language, setLanguage, languageConfig, isRTL } = useLanguage();
  const { currency, setCurrency, currencyConfig } = useCurrency();
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => logout() });

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  const navBg = scrolled
    ? "bg-white/97 backdrop-blur-md shadow-lg border-b border-[#C9A96E]/20"
    : "bg-white/92 backdrop-blur-sm border-b border-[#C9A96E]/10";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`} dir={isRTL ? "rtl" : "ltr"}>
      {/* Geometric pattern top strip */}
      <div
        className="w-full h-1.5"
        style={{
          background: "linear-gradient(90deg, #1B5E52 0%, #C9A96E 50%, #1B5E52 100%)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='6'%3E%3Cpath d='M0 3 L4 0 L8 3 L12 0 L16 3 L20 0 L24 3' stroke='%23C9A96E' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"), linear-gradient(90deg, %231B5E52, %231B5E52)`,
          backgroundRepeat: "repeat-x, no-repeat",
          backgroundSize: "24px 6px, 100% 100%",
        }}
      />

      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-18 gap-2">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <img
              src={LOGO_URL}
              alt="Go Umrah"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              style={{ maxWidth: 130 }}
            />
          </Link>

          {/* Desktop Navigation - scrollable on medium screens */}
          <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto scrollbar-none flex-1 justify-center px-2">
            {NAV_ITEMS.map(({ labelKey, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0
                  ${isActive(href)
                    ? "bg-[#1B5E52] text-white shadow-sm"
                    : "text-[#1B5E52] hover:bg-[#1B5E52]/8 hover:text-[#1B5E52]"
                  }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t(labelKey)}</span>
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-1 text-[#1B5E52] hover:bg-[#1B5E52]/8 px-2 h-8 text-xs font-medium"
                >
                  <span className="text-base leading-none">{languageConfig.flag}</span>
                  <span className="hidden md:inline text-xs">{languageConfig.code.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("lang.select")}
                </div>
                <DropdownMenuSeparator />
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as Language)}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded cursor-pointer ${language === lang.code ? "bg-[#1B5E52]/10 text-[#1B5E52] font-semibold" : ""}`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span
                        className="text-sm font-medium"
                        style={["ar", "ur"].includes(lang.code) ? { fontFamily: "'Tajawal', sans-serif", direction: "rtl", fontSize: "1rem" } : {}}
                      >{lang.nativeName}</span>
                      <span className="text-xs text-muted-foreground">{lang.name}</span>
                    </div>
                    {language === lang.code && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#1B5E52]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-1 text-[#1B5E52] hover:bg-[#1B5E52]/8 px-2 h-8 text-xs font-medium"
                >
                  <span className="font-bold text-[#C9A96E] text-sm">{currencyConfig.symbol}</span>
                  <span className="hidden md:inline text-xs">{currency}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t("currency.select")}
                </div>
                <DropdownMenuSeparator />
                {CURRENCIES.map((cur) => (
                  <DropdownMenuItem
                    key={cur.code}
                    onClick={() => setCurrency(cur.code as Currency)}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded cursor-pointer ${currency === cur.code ? "bg-[#C9A96E]/15 text-[#1B5E52] font-semibold" : ""}`}
                  >
                    <span className="text-lg">{cur.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{cur.code}</span>
                      <span
                        className="text-xs text-muted-foreground"
                        style={["SAR", "EGP"].includes(cur.code) ? { fontFamily: "'Tajawal', sans-serif", direction: "rtl" } : {}}
                      >{cur.name}</span>
                    </div>
                    <span
                      className="ml-auto text-sm font-bold text-[#C9A96E]"
                      style={["SAR", "EGP"].includes(cur.code) ? { fontFamily: "'Tajawal', sans-serif" } : {}}
                    >{cur.symbol}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Admin Link */}
            {user?.role === "admin" && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex items-center gap-1 text-[#C9A96E] hover:bg-[#C9A96E]/10 px-2 h-8 text-xs font-medium"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{t("nav.admin")}</span>
                </Button>
              </Link>
            )}
            {/* Provider Link */}
            {(user?.role === "provider" || user?.role === "admin") && (
              <Link href="/provider">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex items-center gap-1 text-teal-600 hover:bg-teal-50 px-2 h-8 text-xs font-medium"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">لوحة المزود</span>
                </Button>
              </Link>
            )}
            {/* Marketer Portal Link */}
            {user?.role === "marketer" && (
              <Link href="/marketer-portal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex items-center gap-1 text-orange-600 hover:bg-orange-50 px-2 h-8 text-xs font-medium"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">بوابة المسوق</span>
                </Button>
              </Link>
            )}

            {/* Notification Bell */}
            <NotificationBell />
            {/* Auth */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex items-center gap-1 text-[#1B5E52] hover:bg-[#1B5E52]/8 px-2 h-8"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1B5E52] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                          <LayoutDashboard className="w-4 h-4" />
                          {t("nav.admin")}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {(user?.role === "provider" || user?.role === "admin") && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/provider" className="flex items-center gap-2 cursor-pointer">
                          <Building2 className="w-4 h-4" />
                          لوحة مزود الخدمة
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role === "marketer" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/marketer-portal" className="flex items-center gap-2 cursor-pointer text-orange-600">
                          <TrendingUp className="w-4 h-4" />
                          بوابة المسوق
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user?.role === "user" && (
                    <>
                      <DropdownMenuItem asChild>
                        <a href="/#join-provider" className="flex items-center gap-2 cursor-pointer text-[#1B5E52] font-medium">
                          <Building2 className="w-4 h-4" />
                          انضم كمزود خدمة
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      ملفي الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    className="text-red-600 cursor-pointer gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  size="sm"
                  className="hidden sm:flex items-center gap-1 bg-[#1B5E52] hover:bg-[#1B5E52]/90 text-white h-8 px-3 text-xs font-semibold"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  {t("nav.login")}
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-[#1B5E52] hover:bg-[#1B5E52]/8 h-8 w-8 p-0"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-80 p-0 overflow-y-auto">
                <SheetHeader className="p-4 border-b border-[#C9A96E]/20 bg-[#1B5E52]">
                  <SheetTitle className="flex items-center gap-3">
                    <img
                      src={LOGO_URL}
                      alt="Go Umrah"
                      className="h-10 w-auto object-contain brightness-0 invert"
                    />
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Language & Currency */}
                <div className="p-4 border-b border-gray-100 bg-[#F5EFE6]/50">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Language */}
                    <div>
                      <p className="text-xs font-bold text-[#1B5E52] uppercase tracking-wide mb-2">{t("lang.select")}</p>
                      <div className="space-y-1">
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setLanguage(lang.code as Language)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors
                              ${language === lang.code ? "bg-[#1B5E52] text-white" : "hover:bg-[#1B5E52]/8 text-[#1B5E52]"}`}
                          >
                            <span className="text-sm">{lang.flag}</span>
                            <span className="font-medium text-xs">{lang.nativeName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Currency */}
                    <div>
                      <p className="text-xs font-bold text-[#1B5E52] uppercase tracking-wide mb-2">{t("currency.select")}</p>
                      <div className="space-y-1">
                        {CURRENCIES.map((cur) => (
                          <button
                            key={cur.code}
                            onClick={() => setCurrency(cur.code as Currency)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors
                              ${currency === cur.code ? "bg-[#C9A96E] text-white" : "hover:bg-[#C9A96E]/10 text-[#1B5E52]"}`}
                          >
                            <span className="font-bold text-xs w-4">{cur.symbol}</span>
                            <span className="font-medium text-xs">{cur.code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Nav Links */}
                <div className="p-3 space-y-1">
                  {NAV_ITEMS.map(({ labelKey, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${isActive(href)
                          ? "bg-[#1B5E52] text-white"
                          : "text-[#1B5E52] hover:bg-[#1B5E52]/8"
                        }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {t(labelKey)}
                    </Link>
                  ))}
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#C9A96E] hover:bg-[#C9A96E]/10"
                    >
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      {t("nav.admin")}
                    </Link>
                  )}
                  {user?.role === "marketer" && (
                    <Link
                      href="/marketer-portal"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50"
                    >
                      <TrendingUp className="w-4 h-4 flex-shrink-0" />
                      بوابة المسوق
                    </Link>
                  )}
                </div>

                {/* Mobile Auth */}
                <div className="p-3 border-t border-gray-100">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#F5EFE6] rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-[#1B5E52] text-white flex items-center justify-center text-sm font-bold">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1B5E52]">{user?.name}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { logoutMutation.mutate(); setMobileOpen(false); }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t("nav.logout")}
                      </Button>
                    </div>
                  ) : (
                    <Link href="/login" className="block">
                      <Button
                        className="w-full bg-[#1B5E52] hover:bg-[#1B5E52]/90 text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        {t("nav.login")}
                      </Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      {/* Breaking News Ticker */}
      <BreakingNewsTicker />
      {/* Hajj & Umrah News Ticker */}
      <NewsTickerBar
        bgClass="bg-[var(--teal-800)]"
        textClass="text-white/90"
        labelBgClass="bg-[var(--gold)]"
        labelTextClass="text-[var(--teal-900)] font-bold"
        heightClass="h-8"
        speed={55}
        language="ar"
        category="all"
      />
    </nav>
  );
}
