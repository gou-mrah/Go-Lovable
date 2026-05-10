import { useState, useRef, useCallback, useEffect } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import MediaCenterAdmin from "@/pages/admin/MediaCenterAdmin";
import SubscriptionsAdmin from "@/pages/admin/SubscriptionsAdmin";
import SectionBookingsTab from "@/components/admin/SectionBookingsTab";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard, Package, Hotel, Plane, FileText,
  Car, Map, ShoppingBag, Users, Settings, LogOut,
  Plus, Edit, Trash2, Eye, BarChart3, TrendingUp, TrendingDown,
  CheckCircle, Clock, AlertCircle, RefreshCw, Star,
  ChevronRight, Search, Filter, Download, Bell,
  Loader2, X, Save, Globe, Lock, Languages, DollarSign, Zap,
  BarChart2, Image, Video, FileSpreadsheet, Tag, Newspaper, Train,
  Shield, AlertTriangle, Award, Upload, Check, Calendar, Building2, Send,
  HeartHandshake, UserCheck, Briefcase, ShoppingCart, PieChart as PieChartIcon,
  Rss, ExternalLink, ToggleLeft, ToggleRight,
  MessageSquare, Phone, Ban, UserX, Mail, Smartphone, UserCog, CheckCheck,
  ChevronRight as ChevronRightArrow, Crown,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import MarketersAdmin from "@/pages/MarketersAdmin";
import SuppliersAdmin from "@/pages/SuppliersAdmin";
import SalesOrdersAdmin from "@/pages/SalesOrdersAdmin";
import SalesReportsAdmin from "@/pages/SalesReportsAdmin";
import ImageUpload from "@/components/ui/ImageUpload";
import AIContentAssistant from "@/components/admin/AIContentAssistant";
import PaymentsAdmin from "@/pages/admin/PaymentsAdmin";

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminSection =
  | "overview"
  | "hajj"
  | "umrah"
  | "hotels"
  | "flights"
  | "visa"
  | "transport"
  | "tours"
  | "store"
  | "bookings"
  | "users"
  | "localization"
  | "analytics"
  | "assets"
  | "data-export"
  | "pricing"
  | "reviews"
  | "seo"
  | "flexible-requests"
  | "provider-applications"
  | "roles-permissions"
  | "media-center"
  | "hero-ads"
  | "search-settings"
  | "marketers"
  | "suppliers"
  | "sales-orders"
  | "sales-reports"
  | "site-settings"
  | "news-center"
  | "subscriptions"
  | "payments"
;

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { id: "overview" as AdminSection, label: "لوحة التحكم", icon: LayoutDashboard },
  { id: "hajj" as AdminSection, label: "برامج الحج", icon: Globe },
  { id: "umrah" as AdminSection, label: "برامج العمرة", icon: Globe },
  { id: "hotels" as AdminSection, label: "الفنادق", icon: Hotel },
  { id: "flights" as AdminSection, label: "الرحلات الجوية", icon: Plane },
  { id: "visa" as AdminSection, label: "أنواع التأشيرات", icon: FileText },
  { id: "transport" as AdminSection, label: "المواصلات", icon: Car },
  { id: "tours" as AdminSection, label: "جولات الزيارات", icon: Map },
  { id: "store" as AdminSection, label: "المتجر الإلكتروني", icon: ShoppingBag },
  { id: "bookings" as AdminSection, label: "جميع الحجوزات", icon: Package },
  { id: "users" as AdminSection, label: "المستخدمون", icon: Users },
  { id: "localization" as AdminSection, label: "اللغة والعملة", icon: Languages },
  { id: "analytics" as AdminSection, label: "التحليلات المتقدمة", icon: BarChart2 },
  { id: "assets" as AdminSection, label: "مدير الأصول", icon: Image },
  { id: "data-export" as AdminSection, label: "تصدير البيانات", icon: FileSpreadsheet },
  { id: "pricing" as AdminSection, label: "التسعير الديناميكي", icon: Tag },
  { id: "reviews" as AdminSection, label: "مركز التقييمات", icon: Star },
  { id: "seo" as AdminSection, label: "إدارة SEO", icon: Search },
  { id: "flexible-requests" as AdminSection, label: "الطلبات المرنة", icon: HeartHandshake },
  { id: "provider-applications" as AdminSection, label: "طلبات المزودين", icon: Building2 },
  { id: "roles-permissions" as AdminSection, label: "الأدوار والصلاحيات", icon: Shield },
  { id: "media-center" as AdminSection, label: "المركز الإعلامي", icon: Newspaper },
  { id: "hero-ads" as AdminSection, label: "إعلانات الهيرو", icon: Image },
  { id: "search-settings" as AdminSection, label: "إعدادات البحث", icon: Search },
  { id: "marketers" as AdminSection, label: "المسوقون", icon: UserCheck },
  { id: "suppliers" as AdminSection, label: "الموردون", icon: Briefcase },
  { id: "sales-orders" as AdminSection, label: "طلبات المبيعات", icon: ShoppingCart },
  { id: "sales-reports" as AdminSection, label: "التقارير المالية", icon: PieChartIcon },
  { id: "site-settings" as AdminSection, label: "إعدادات الموقع", icon: Settings },
  { id: "news-center" as AdminSection, label: "مركز الأخبار", icon: Rss },
  { id: "payments" as AdminSection, label: "المدفوعات", icon: DollarSign },
  { id: "subscriptions" as AdminSection, label: "إدارة الاشتراكات", icon: Crown },
];

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color, change }: {
  title: string; value: string | number; icon: any; color: string; change?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-[var(--teal-800)] mb-0.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        {value}
      </div>
      <div className="text-xs text-[var(--muted-foreground)]">{title}</div>
    </div>
  );
}

// ─── Sparkline Mini Chart ─────────────────────────────────────────────────────
function SparkLine({ data, color = "#0d9488" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 40 - (v / max) * 36;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 40" className="w-full h-10" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Stat Card with Sparkline ─────────────────────────────────────────────────
function StatCardSpark({ title, value, subtitle, icon: Icon, color, bgColor, sparkData, sparkColor, trend }: {
  title: string; value: string | number; subtitle?: string; icon: any; color: string; bgColor: string;
  sparkData?: number[]; sparkColor?: string; trend?: { value: string; up: boolean };
}) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-[var(--muted-foreground)] mb-0.5">{title}</p>
          <div className="text-2xl font-bold" style={{ color: "var(--teal-800)", fontFamily: "'Tajawal', sans-serif" }}>{value}</div>
          {subtitle && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      {sparkData && sparkData.length > 1 && (
        <div className="mb-2">
          <SparkLine data={sparkData} color={sparkColor || "#0d9488"} />
        </div>
      )}
      <div className="flex items-center justify-between">
        {trend && (
          <span className={`text-xs font-medium flex items-center gap-1 ${trend.up ? "text-green-600" : "text-red-500"}`}>
            {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
        <span className="text-xs text-[var(--muted-foreground)] mr-auto">كل الأيام</span>
      </div>
    </div>
  );
}
// ─── Flag Emoji Helper ───────────────────────────────────────────────────────
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode === "XX") return "🏳️";
  const codePoints = countryCode.toUpperCase().split("").map(c => 0x1F1E6 - 65 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// ─── Overview Dashboard ───────────────────────────────────────────────────────
function OverviewDashboard({ onNavigate }: { onNavigate?: (section: AdminSection) => void }) {
  const { data: stats } = trpc.admin.stats.useQuery();
  const { data: userStats } = trpc.analytics.userStats.useQuery();
  const { data: visitors } = trpc.analytics.visitorOverview.useQuery({ days: 30 });
  const { data: financial } = trpc.analytics.financialOverview.useQuery();
  const { data: products } = trpc.analytics.productOverview.useQuery();
  const { format: formatCurrency } = useCurrency();
  const { data: hajjBookings } = trpc.hajjBooking.list.useQuery({ status: "all", limit: 5 });
  const { data: umrahBookings } = trpc.umrahBooking.list.useQuery({ status: "all", limit: 5 });
  const { data: reviewStats } = trpc.reviews.getStats.useQuery();
  const totalBookings = (hajjBookings?.total ?? 0) + (umrahBookings?.total ?? 0);
  const pendingBookings = [
    ...(hajjBookings?.rows ?? []).filter((r: any) => r.status === "new"),
    ...(umrahBookings?.rows ?? []).filter((r: any) => r.status === "new"),
  ].length;

  const allRecentRequests = [
    ...(hajjBookings?.rows ?? []).map((r: any) => ({ ...r, type: "حج" })),
    ...(umrahBookings?.rows ?? []).map((r: any) => ({ ...r, type: "عمرة" })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);

  const totalReviews = reviewStats?.total ?? 0;
  const publishedReviews = reviewStats?.total ?? 0;
  const pendingReviews = 0;

  // Real sparkline data from visitor daily views
  const visitSparkData = visitors?.dailyViews?.length
    ? visitors.dailyViews.map((d: any) => Number(d.views))
    : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const bookingSparkData = [2, 5, 3, 8, 6, 10, 7, 12, 9, totalBookings || 0];

  const statusColor = (status: string) => {
    if (status === "confirmed") return "bg-green-100 text-green-700";
    if (status === "new") return "bg-amber-100 text-amber-700";
    if (status === "reviewing") return "bg-blue-100 text-blue-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };
  const statusLabel = (status: string) => {
    const map: Record<string, string> = { new: "جديد", reviewing: "قيد المراجعة", confirmed: "مؤكد", cancelled: "ملغي" };
    return map[status] || status;
  };

  const today = new Date().toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            يا هلاً بك، جو عمرة 👋
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {today}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[var(--teal-50)] text-[var(--teal-700)] border border-[var(--teal-200)] px-3 py-1.5 rounded-full font-medium">
            آخر 90 يوماً
          </span>
        </div>
      </div>

      {/* Stats Cards — Real Data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSpark
          title="زيارات الموقع (30 يوم)"
          value={Number(visitors?.totalViews ?? 0).toLocaleString("ar-SA")}
          subtitle={`${Number(visitors?.uniqueSessions ?? 0).toLocaleString("ar-SA")} زائر فريد`}
          icon={Eye}
          color="text-[var(--primary)]"
          bgColor="bg-[var(--teal-50)]"
          sparkData={visitSparkData.length > 1 ? visitSparkData : [0, 1, 0, 1, 0, 1, 0, 1, 0, Number(visitors?.totalViews ?? 0)]}
          sparkColor="#0d9488"
          trend={visitors?.byCountry?.[0] ? { value: `أكثرها: ${visitors.byCountry[0].country}`, up: true } : { value: "لا توجد بيانات بعد", up: true }}
        />
        <StatCardSpark
          title="إجمالي الإيرادات"
          value={formatCurrency(Number(financial?.totalRevenue ?? 0))}
          subtitle={`مدفوع: ${formatCurrency(Number(financial?.paidRevenue ?? 0))}`}
          icon={DollarSign}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          sparkData={bookingSparkData}
          sparkColor="#10b981"
          trend={financial?.pendingRevenue ? { value: `معلق: ${formatCurrency(Number(financial.pendingRevenue))}`, up: false } : undefined}
        />
        <StatCardSpark
          title="إجمالي المستخدمين"
          value={Number(userStats?.totalUsers ?? 0).toLocaleString()}
          subtitle={`مستجد جديد هذا الشهر: ${userStats?.newThisMonth ?? 0}`}
          icon={Users}
          color="text-purple-600"
          bgColor="bg-purple-50"
          sparkData={[1, 2, 3, 2, 4, 3, 5, 4, 6, userStats?.totalUsers ?? 0]}
          sparkColor="#9333ea"
          trend={{ value: `مورد: ${products?.approvedSuppliers ?? 0} | مسوق: ${products?.totalMarketers ?? 0}`, up: true }}
        />
        <StatCardSpark
          title="طلبات معلقة"
          value={financial?.pendingBookings ?? pendingBookings}
          subtitle="تحتاج مراجعة"
          icon={Clock}
          color="text-amber-600"
          bgColor="bg-amber-50"
          trend={(financial?.pendingBookings ?? pendingBookings) > 0 ? { value: `${financial?.cancelledBookings ?? 0} ملغي`, up: false } : { value: "لا توجد طلبات", up: true }}
        />
      </div>

      {/* Real Visitor Stats by Country */}
      {visitors && visitors.byCountry && visitors.byCountry.length > 0 && (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--teal-800)] mb-4 flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <Globe className="w-4 h-4 text-[var(--teal-500)]" />
            الزوار حسب الدولة (آخر 30 يوم)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {visitors.byCountry.slice(0, 10).map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-2 bg-[var(--teal-50)] rounded-xl px-3 py-2">
                <span className="text-lg">{getFlagEmoji(c.countryCode)}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[var(--teal-800)] truncate">{c.country}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{Number(c.visits).toLocaleString("ar-SA")} زيارة</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real Product Counts */}
      {products && (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
          <h3 className="font-bold text-[var(--teal-800)] mb-4 flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <Package className="w-4 h-4 text-[var(--teal-500)]" />
            إحصائيات المنتجات والخدمات
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: "برامج الحج", value: products.hajj, icon: "🕋" },
              { label: "برامج العمرة", value: products.umrah, icon: "🌙" },
              { label: "الفنادق", value: products.hotels, icon: "🏨" },
              { label: "الرحلات", value: products.flights, icon: "✈️" },
              { label: "الجولات", value: products.tours, icon: "🗺️" },
              { label: "المواصلات", value: products.vehicles, icon: "🚌" },
              { label: "التأشيرات", value: products.visaTypes, icon: "📋" },
            ].map((item, i) => (
              <div key={i} className="text-center bg-[var(--teal-50)] rounded-xl p-3">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>{item.value}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--teal-800)]">{products.totalSuppliers} <span className="text-xs text-green-600">({products.approvedSuppliers} معتمد)</span></div>
              <div className="text-xs text-[var(--muted-foreground)]">موردون</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--teal-800)]">{products.totalMarketers} <span className="text-xs text-green-600">({products.activeMarketers} معتمد)</span></div>
              <div className="text-xs text-[var(--muted-foreground)]">مسوقون</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--teal-800)]">{products.waitlistCount}</div>
              <div className="text-xs text-[var(--muted-foreground)]">قائمة الانتظار</div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings - 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-bold text-[var(--teal-800)] flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              <Package className="w-4 h-4 text-[var(--teal-500)]" />
              أحدث الطلبات
            </h3>
            <Badge variant="outline" className="text-xs text-[var(--teal-600)] border-[var(--teal-200)]">مباشر</Badge>
          </div>
          {allRecentRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-full bg-[var(--teal-50)] flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7 text-[var(--teal-300)]" />
              </div>
              <p className="text-[var(--muted-foreground)] text-sm">لا توجد طلبات حتى الآن</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">ستظهر الطلبات الجديدة هنا فور وصولها</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--teal-50)] border-b border-[var(--border)]">
                    <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">رقم الطلب</th>
                    <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">العميل</th>
                    <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">النوع</th>
                    <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">الحالة</th>
                    <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {allRecentRequests.map((req: any, i: number) => (
                    <tr key={req.id} className={`border-b border-[var(--border)] hover:bg-[var(--teal-50)]/50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                      <td className="px-4 py-3 text-sm font-mono text-[var(--teal-700)]">#{req.requestId?.slice(-6) || req.id}</td>
                      <td className="px-4 py-3 text-sm text-[var(--teal-800)] font-medium">{req.customerName}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${req.type === "حج" ? "bg-[var(--teal-100)] text-[var(--teal-700)]" : "bg-amber-100 text-amber-700"}`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(req.status)}`}>
                          {statusLabel(req.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                        {new Date(req.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column - Reviews + Quick Stats */}
        <div className="space-y-4">
          {/* Reviews Summary */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
            <h3 className="font-bold text-[var(--teal-800)] mb-4 flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              <Star className="w-4 h-4 text-amber-500" />
              تقييمات العملاء
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">إجمالي التقييمات</span>
                <span className="text-lg font-bold text-[var(--teal-800)]">{totalReviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">التقييمات المنشورة</span>
                <span className="text-sm font-semibold text-green-600">{publishedReviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">قيد المراجعة</span>
                <span className="text-sm font-semibold text-amber-600">{pendingReviews}</span>
              </div>
              {totalReviews > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-1">
                    <span>نسبة النشر</span>
                    <span>{Math.round((publishedReviews / totalReviews) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.round((publishedReviews / totalReviews) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Programs Summary */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
            <h3 className="font-bold text-[var(--teal-800)] mb-4 flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              <Globe className="w-4 h-4 text-[var(--teal-500)]" />
              الباقات المتاحة
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--teal-50)]">
                <span className="text-sm font-medium text-[var(--teal-700)]">🕌 باقات الحج</span>
                <span className="text-sm font-bold text-[var(--teal-800)]">{stats?.hajj ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50">
                <span className="text-sm font-medium text-amber-700">🌙 باقات العمرة</span>
                <span className="text-sm font-bold text-amber-800">{stats?.umrah ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50">
                <span className="text-sm font-medium text-blue-700">🏨 الفنادق</span>
                <span className="text-sm font-bold text-blue-800">{stats?.hotels ?? 0}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50">
                <span className="text-sm font-medium text-purple-700">🗺️ جولات الزيارات</span>
                <span className="text-sm font-bold text-purple-800">{stats?.tours ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Tracker */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[var(--teal-800)] flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <TrendingUp className="w-4 h-4 text-[var(--teal-500)]" />
            تابع أهدافك
          </h3>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 rounded-full bg-[var(--teal-800)] text-white font-medium">شهري</button>
            <button className="text-xs px-3 py-1 rounded-full border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--teal-50)]">سنوي</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: "إجمالي الطلبات", current: totalBookings, target: 50, color: "bg-[var(--primary)]" },
            { label: "باقات الحج", current: stats?.hajj ?? 0, target: 20, color: "bg-amber-500" },
            { label: "باقات العمرة", current: stats?.umrah ?? 0, target: 30, color: "bg-purple-500" },
          ].map((goal) => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            return (
              <div key={goal.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--teal-700)]">{goal.label}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{pct}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className={`${goal.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                  <span>الحالي: <strong className="text-[var(--teal-800)]">{goal.current}</strong></span>
                  <span>الهدف: <strong className="text-[var(--teal-800)]">{goal.target}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <h3 className="font-bold text-[var(--teal-800)] mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>الإجراءات السريعة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "إضافة باقة حج", icon: "🕌", color: "hover:border-[var(--teal-300)] hover:bg-[var(--teal-50)]", section: "hajj" as AdminSection },
            { label: "إضافة باقة عمرة", icon: "🌙", color: "hover:border-amber-300 hover:bg-amber-50", section: "umrah" as AdminSection },
            { label: "إضافة فندق", icon: "🏨", color: "hover:border-blue-300 hover:bg-blue-50", section: "hotels" as AdminSection },
            { label: "إدارة المستخدمين", icon: "👥", color: "hover:border-purple-300 hover:bg-purple-50", section: "users" as AdminSection },
            { label: "إضافة جولة زيارة", icon: "🗺️", color: "hover:border-green-300 hover:bg-green-50", section: "tours" as AdminSection },
            { label: "إضافة مركبة", icon: "🚗", color: "hover:border-orange-300 hover:bg-orange-50", section: "transport" as AdminSection },
            { label: "عرض الحجوزات", icon: "📋", color: "hover:border-[var(--teal-300)] hover:bg-[var(--teal-50)]", section: "bookings" as AdminSection },
            { label: "إدارة المتجر", icon: "🛍️", color: "hover:border-pink-300 hover:bg-pink-50", section: "store" as AdminSection },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate?.(action.section)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--border)] transition-all text-center group ${action.color}`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-medium text-[var(--teal-700)] group-hover:text-[var(--teal-900)]">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Generic CRUD Table ────────────────────────────────────────────────────────
function CRUDSection({
  title,
  icon: Icon,
  items,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  columns,
  emptyMessage,
}: {
  title: string;
  icon: any;
  items: any[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  columns: { key: string; label: string; render?: (val: any, row: any) => React.ReactNode }[];
  emptyMessage?: string;
}) {
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = items.filter((item) =>
    search === "" || JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setDeleting(id);
    try {
      await onDelete(id);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            {title}
          </h2>
          <Badge variant="outline" className="text-xs">{items.length} items</Badge>
        </div>
        <Button onClick={onAdd} className="bg-[var(--primary)] text-white gap-1.5 text-sm">
          <Plus className="w-4 h-4" /> Add New
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
        <Input
          placeholder={`Search ${title.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-[var(--teal-50)] flex items-center justify-center mx-auto mb-3">
              <Icon className="w-6 h-6 text-[var(--teal-400)]" />
            </div>
            <p className="text-[var(--muted-foreground)] text-sm">{emptyMessage || "No items found. Click 'Add New' to create one."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--teal-50)]">
                  {columns.map((col) => (
                    <th key={col.key} className="text-left text-xs font-semibold text-[var(--teal-700)] uppercase tracking-wider px-4 py-3">
                      {col.label}
                    </th>
                  ))}
                  <th className="text-right text-xs font-semibold text-[var(--teal-700)] uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id} className={`border-b border-[var(--border)] hover:bg-[var(--teal-50)]/50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-[var(--teal-800)]">
                        {col.render ? col.render(item[col.key], item) : (
                          <span className="truncate max-w-[200px] block">{String(item[col.key] ?? "—")}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(item)}
                          className="h-7 px-2 text-xs gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="h-7 px-2 text-xs gap-1 text-red-500 hover:text-red-700 hover:border-red-300"
                        >
                          {deleting === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hajj Admin (Unified: General + Domestic + International) ────────────────
function HajjAdmin() {
  const [activeTab, setActiveTab] = useState<"domestic" | "international">("domestic");

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-0">
        {[
          { id: "domestic" as const, label: "حجاج الداخل", icon: "🏠" },
          { id: "international" as const, label: "حجاج الخارج", icon: "✈️" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-[var(--primary)] text-[var(--primary)] bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "domestic" && <HajjDomesticAdmin />}
      {activeTab === "international" && <HajjInternationalAdmin />}
    </div>
  );
}
// ─── Hajj General Admin ───────────────────────────────────────────────────────
function HajjGeneralAdmin() {
  const utils = trpc.useUtils();
  const { data: programs = [], isLoading } = trpc.hajj.list.useQuery({ limit: 100 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", portalType: "internal", priceUSD: "", duration: "", departureCity: "", description: "", imageUrl: "", isFeatured: false, isUrgent: false });
  const createMutation = trpc.hajj.create.useMutation({
    onSuccess: () => { utils.hajj.list.invalidate(); setDialogOpen(false); toast.success("تم إضافة برنامج الحج!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.hajj.update.useMutation({
    onSuccess: () => { utils.hajj.list.invalidate(); setDialogOpen(false); toast.success("تم تحديث البرنامج!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.hajj.delete.useMutation({
    onSuccess: () => { utils.hajj.list.invalidate(); toast.success("تم حذف البرنامج"); },
    onError: (e) => toast.error(e.message),
  });
  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", subtitle: "", portalType: "internal", priceUSD: "", duration: "", departureCity: "", description: "", imageUrl: "", isFeatured: false, isUrgent: false });
    setDialogOpen(true);
  };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ title: item.title, subtitle: item.subtitle || "", portalType: item.portalType || "internal", priceUSD: item.priceUSD, duration: String(item.duration || ""), departureCity: item.departureCity || "", description: item.description || "", imageUrl: item.imageUrl || "", isFeatured: item.isFeatured, isUrgent: item.isUrgent });
    setDialogOpen(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, duration: form.duration ? Number(form.duration) : 14 };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };
  return (
    <>
      <CRUDSection
        title="الباقات العامة"
        icon={Globe}
        items={programs}
        isLoading={isLoading}
        onAdd={openAdd}
        columns={[
          { key: "title", label: "العنوان" },
          { key: "portalType", label: "البوابة" },
          { key: "priceUSD", label: "السعر (USD)" },
          { key: "duration", label: "المدة (أيام)" },
          { key: "isFeatured", label: "مميز", render: (v: boolean) => v ? "✓" : "—" },
        ]}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate({ id })}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل برنامج الحج" : "إضافة برنامج حج"}</DialogTitle>
            <DialogDescription>أدخل تفاصيل برنامج الحج.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <AIContentAssistant
                contentType="hajj_package"
                onApply={(data) => setForm((f) => ({
                  ...f,
                  ...(data.title && { title: data.title }),
                  ...(data.subtitle && { subtitle: data.subtitle }),
                  ...(data.description && { description: data.description }),
                  ...(data.imageUrl && { imageUrl: data.imageUrl }),
                }))}
              />
            </div>
            <div className="col-span-2">
              <Label>العنوان *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label>العنوان الفرعي</Label>
              <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>نوع البوابة</Label>
              <Select value={form.portalType} onValueChange={(v) => setForm({ ...form, portalType: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">داخلي</SelectItem>
                  <SelectItem value="external">خارجي</SelectItem>
                  <SelectItem value="both">كلاهما</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>السعر (USD) *</Label>
              <Input type="number" value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label>المدة (أيام) *</Label>
              <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required className="mt-1" />
            </div>
            <div>
              <Label>مدينة المغادرة</Label>
              <Input value={form.departureCity} onChange={(e) => setForm({ ...form, departureCity: e.target.value })} className="mt-1" />
            </div>
            <div className="col-span-2">
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                folder="hajj"
                label="صورة البرنامج"
                aspectRatio="16/9"
              />
            </div>
            <div className="col-span-2">
              <Label>الوصف</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featured-h" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              <Label htmlFor="featured-h">مميز</Label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="urgent-h" checked={form.isUrgent} onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })} />
              <Label htmlFor="urgent-h">عاجل / محدود</Label>
            </div>
            <div className="col-span-2 flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">إلغاء</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-[var(--primary)] text-white">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />{editing ? "تحديث" : "إنشاء"}</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
// ─── Umrah Programs (inner) ──────────────────────────────────────────────────
function UmrahAdminPrograms() {
  const utils = trpc.useUtils();
  const { data: programs = [], isLoading } = trpc.umrah.list.useQuery({ limit: 100 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", portalType: "internal", priceUSD: "", duration: "", departureCity: "", description: "", imageUrl: "", isFeatured: false, isUrgent: false });

  const createMutation = trpc.umrah.create.useMutation({
    onSuccess: () => { utils.umrah.list.invalidate(); setDialogOpen(false); toast.success("Umrah program created!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.umrah.update.useMutation({
    onSuccess: () => { utils.umrah.list.invalidate(); setDialogOpen(false); toast.success("Umrah program updated!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.umrah.delete.useMutation({
    onSuccess: () => { utils.umrah.list.invalidate(); toast.success("Program deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", subtitle: "", portalType: "internal", priceUSD: "", duration: "", departureCity: "", description: "", imageUrl: "", isFeatured: false, isUrgent: false });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ title: item.title, subtitle: item.subtitle || "", portalType: item.portalType || "internal", priceUSD: item.priceUSD, duration: String(item.duration || ""), departureCity: item.departureCity || "", description: item.description || "", imageUrl: item.imageUrl || "", isFeatured: item.isFeatured, isUrgent: item.isUrgent });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, duration: form.duration ? Number(form.duration) : 10 };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <>
      <CRUDSection
        title="Umrah Programs"
        icon={Globe}
        items={programs}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate({ id })}
        columns={[
          { key: "title", label: "Title" },
          { key: "portalType", label: "Portal", render: (v) => <Badge variant="outline" className="capitalize text-xs">{v}</Badge> },
          { key: "priceUSD", label: "Price", render: (v) => <span className="font-semibold text-[var(--teal-700)]">${Number(v).toLocaleString()}</span> },
          { key: "duration", label: "Duration", render: (v) => `${v} days` },
          { key: "isFeatured", label: "Featured", render: (v) => v ? <CheckCircle className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-300" /> },
          { key: "isActive", label: "Status", render: (v) => <Badge className={v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{v ? "Active" : "Inactive"}</Badge> },
        ]}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Umrah Program" : "Add Umrah Program"}</DialogTitle>
            <DialogDescription>Fill in the details for this Umrah program package.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <AIContentAssistant
              contentType="umrah_package"
              onApply={(data) => setForm((f) => ({
                ...f,
                ...(data.title && { title: data.title }),
                ...(data.subtitle && { subtitle: data.subtitle }),
                ...(data.description && { description: data.description }),
                ...(data.imageUrl && { imageUrl: data.imageUrl }),
              }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={form.portalType} onValueChange={(v) => setForm({ ...form, portalType: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (USD) *</Label>
                <Input type="number" value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <Label>Duration (Days) *</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <Label>Departure City</Label>
                <Input value={form.departureCity} onChange={(e) => setForm({ ...form, departureCity: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2">
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  folder="umrah"
                  label="صورة البرنامج"
                  aspectRatio="16/9"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured-u" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                <Label htmlFor="featured-u">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="urgent-u" checked={form.isUrgent} onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })} />
                <Label htmlFor="urgent-u">Urgent / Limited</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-[var(--primary)] text-white">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />{editing ? "Update" : "Create"}</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Umrah Admin (with tabs) ─────────────────────────────────────────────────
function UmrahAdmin() {
  const [activeTab, setActiveTab] = useState<"programs" | "bookings">("programs");
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {[
          { id: "programs" as const, label: "برامج العمرة", icon: "🕌" },
          { id: "bookings" as const, label: "طلبات الحجز", icon: "📋" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 -mb-px ${
              activeTab === tab.id ? "border-[var(--primary)] text-[var(--primary)] bg-white" : "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50"
            }`}>{tab.icon} {tab.label}</button>
        ))}
      </div>
      {activeTab === "programs" && <UmrahAdminPrograms />}
      {activeTab === "bookings" && <SectionBookingsTab serviceType="umrah" title="العمرة" />}
    </div>
  );
}

// ─── Tours Programs (inner) ──────────────────────────────────────────────────
function ToursAdminPrograms() {
  const utils = trpc.useUtils();
  const { data: tours = [], isLoading } = trpc.tours.list.useQuery({ limit: 100 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", location: "makkah", category: "religious", priceUSD: "", duration: "", maxGroupSize: "", guideName: "", imageUrl: "", description: "", isFeatured: false, isUrgent: false });

  const createMutation = trpc.tours.create.useMutation({
    onSuccess: () => { utils.tours.list.invalidate(); setDialogOpen(false); toast.success("Tour created!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.tours.update.useMutation({
    onSuccess: () => { utils.tours.list.invalidate(); setDialogOpen(false); toast.success("Tour updated!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.tours.delete.useMutation({
    onSuccess: () => { utils.tours.list.invalidate(); toast.success("Tour deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", subtitle: "", location: "makkah", category: "religious", priceUSD: "", duration: "", maxGroupSize: "", guideName: "", imageUrl: "", description: "", isFeatured: false, isUrgent: false });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ title: item.title, subtitle: item.subtitle || "", location: item.location, category: item.category, priceUSD: item.priceUSD, duration: String(item.duration), maxGroupSize: String(item.maxGroupSize || ""), guideName: item.guideName || "", imageUrl: item.imageUrl || "", description: item.description || "", isFeatured: item.isFeatured, isUrgent: item.isUrgent });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, duration: Number(form.duration), maxGroupSize: form.maxGroupSize ? Number(form.maxGroupSize) : undefined };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <>
      <CRUDSection
        title="Ziyarat Tours"
        icon={Map}
        items={tours}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate({ id })}
        columns={[
          { key: "title", label: "Title" },
          { key: "location", label: "Location", render: (v) => <Badge variant="outline" className="capitalize text-xs">{v}</Badge> },
          { key: "category", label: "Category", render: (v) => <Badge variant="outline" className="capitalize text-xs">{v}</Badge> },
          { key: "priceUSD", label: "Price", render: (v) => <span className="font-semibold text-[var(--teal-700)]">${Number(v).toLocaleString()}</span> },
          { key: "duration", label: "Duration", render: (v) => `${v}h` },
          { key: "isActive", label: "Status", render: (v) => <Badge className={v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{v ? "Active" : "Inactive"}</Badge> },
        ]}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Tour" : "Add Tour"}</DialogTitle>
            <DialogDescription>Fill in the details for this Ziyarat tour.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <AIContentAssistant
              contentType="tour"
              onApply={(data) => setForm((f) => ({
                ...f,
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
                ...(data.imageUrl && { imageUrl: data.imageUrl }),
              }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <Label>Location *</Label>
                <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="makkah">Makkah</SelectItem>
                    <SelectItem value="madinah">Madinah</SelectItem>
                    <SelectItem value="jeddah">Jeddah</SelectItem>
                    <SelectItem value="taif">Taif</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="religious">Religious</SelectItem>
                    <SelectItem value="historical">Historical</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="combined">Combined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (USD) *</Label>
                <Input type="number" value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <Label>Duration (Hours) *</Label>
                <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <Label>Max Group Size</Label>
                <Input type="number" value={form.maxGroupSize} onChange={(e) => setForm({ ...form, maxGroupSize: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Guide Name</Label>
                <Input value={form.guideName} onChange={(e) => setForm({ ...form, guideName: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2">
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  folder="tours"
                  label="صورة الجولة"
                  aspectRatio="16/9"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="featured-t" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                <Label htmlFor="featured-t">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="urgent-t" checked={form.isUrgent} onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })} />
                <Label htmlFor="urgent-t">Urgent / Limited</Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-[var(--primary)] text-white">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />{editing ? "Update" : "Create"}</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Tours Admin (with tabs) ─────────────────────────────────────────────────
function ToursAdmin() {
  const [activeTab, setActiveTab] = useState<"programs" | "bookings">("programs");
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {[
          { id: "programs" as const, label: "جولات الزيارات", icon: "🗺️" },
          { id: "bookings" as const, label: "طلبات الحجز", icon: "📋" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 -mb-px ${
              activeTab === tab.id ? "border-[var(--primary)] text-[var(--primary)] bg-white" : "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50"
            }`}>{tab.icon} {tab.label}</button>
        ))}
      </div>
      {activeTab === "programs" && <ToursAdminPrograms />}
      {activeTab === "bookings" && <SectionBookingsTab serviceType="tours" title="الجولات" />}
    </div>
  );
}

// ─── Store Admin ──────────────────────────────────────────────────────────────
function StoreAdmin() {
  const utils = trpc.useUtils();
  const { data: products = [], isLoading } = trpc.store.listProducts.useQuery({ limit: 100 });
  const { data: orders = [], isLoading: ordersLoading } = trpc.store.listOrders.useQuery({ limit: 50 });
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", priceUSD: "", originalPriceUSD: "", imageUrl: "", sku: "", stock: "", isFeatured: false, isActive: true });

  const createMutation = trpc.store.createProduct.useMutation({
    onSuccess: () => { utils.store.listProducts.invalidate(); setDialogOpen(false); toast.success("Product created!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.store.updateProduct.useMutation({
    onSuccess: () => { utils.store.listProducts.invalidate(); setDialogOpen(false); toast.success("Product updated!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.store.deleteProduct.useMutation({
    onSuccess: () => { utils.store.listProducts.invalidate(); toast.success("Product deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", priceUSD: "", originalPriceUSD: "", imageUrl: "", sku: "", stock: "", isFeatured: false, isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ name: item.name, slug: item.slug || "", description: item.description || "", priceUSD: item.priceUSD, originalPriceUSD: item.originalPriceUSD || "", imageUrl: item.imageUrl || "", sku: item.sku || "", stock: String(item.stock || ""), isFeatured: item.isFeatured, isActive: item.isActive });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, stock: form.stock ? Number(form.stock) : undefined, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab("products")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === "products" ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-white text-[var(--teal-700)]"}`}>
          Products ({products.length})
        </button>
        <button onClick={() => setTab("orders")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === "orders" ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-white text-[var(--teal-700)]"}`}>
          Orders ({orders.length})
        </button>
      </div>

      {tab === "products" ? (
        <>
          <CRUDSection
            title="Products"
            icon={ShoppingBag}
            items={products}
            isLoading={isLoading}
            onAdd={openAdd}
            onEdit={openEdit}
            onDelete={(id) => deleteMutation.mutate({ id })}
            columns={[
              { key: "name", label: "Product" },
              { key: "priceUSD", label: "Price", render: (v) => <span className="font-semibold text-[var(--teal-700)]">${Number(v).toFixed(2)}</span> },
              { key: "stockQuantity", label: "Stock", render: (v) => v === null ? "∞" : String(v) },
              { key: "isFeatured", label: "Featured", render: (v) => v ? <CheckCircle className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-300" /> },
              { key: "isActive", label: "Status", render: (v) => <Badge className={v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{v ? "Active" : "Inactive"}</Badge> },
            ]}
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
                <DialogDescription>Fill in the product details for the store.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <AIContentAssistant
                  contentType="product"
                  onApply={(data) => setForm((f) => ({
                    ...f,
                    ...(data.title && { name: data.title }),
                    ...(data.description && { description: data.description }),
                    ...(data.imageUrl && { imageUrl: data.imageUrl }),
                  }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Product Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Price (USD) *</Label>
                    <Input type="number" step="0.01" value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: e.target.value })} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Original Price (USD)</Label>
                    <Input type="number" step="0.01" value={form.originalPriceUSD} onChange={(e) => setForm({ ...form, originalPriceUSD: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Stock Quantity</Label>
                    <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Leave empty for unlimited" className="mt-1" />
                  </div>
                  <div className="col-span-2">
                    <ImageUpload
                      value={form.imageUrl}
                      onChange={(url) => setForm({ ...form, imageUrl: url })}
                      folder="store"
                      label="صورة المنتج"
                      aspectRatio="1/1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="featured-p" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                    <Label htmlFor="featured-p">Featured</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="active-p" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                    <Label htmlFor="active-p">Active</Label>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-[var(--primary)] text-white">
                    {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />{editing ? "Update" : "Create"}</>}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="font-bold text-[var(--teal-800)]">Store Orders</h3>
            <Badge variant="outline">{orders.length} total</Badge>
          </div>
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" /></div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted-foreground)] text-sm">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--teal-50)]">
                    {["Order #", "Customer", "Total", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-[var(--teal-700)] uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(orders as any[]).map((order: any, i: number) => (
                    <tr key={order.id} className={`border-b border-[var(--border)] hover:bg-[var(--teal-50)]/50 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                      <td className="px-4 py-3 text-sm font-mono text-[var(--teal-700)]">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-sm">{order.customerName || "—"}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[var(--teal-700)]">﷼{Number(order.totalUSD).toLocaleString("ar-SA")}</td>
                      <td className="px-4 py-3">
                        <Badge className={`capitalize text-xs ${order.status === "completed" ? "bg-green-100 text-green-700" : order.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Visa Admin ───────────────────────────────────────────────────────────────
function VisaAdmin() {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<"applications" | "types">("applications");
  const { data: applications = [], isLoading } = trpc.visa.listApplications.useQuery({ status: "all", limit: 100 });
  const { data: visaTypesList = [], isLoading: typesLoading } = trpc.visa.listTypes.useQuery({});
  const updateStatus = trpc.visa.updateApplicationStatus.useMutation({
    onSuccess: () => { utils.visa.listApplications.invalidate(); toast.success("تم تحديث الحالة"); },
    onError: (e) => toast.error(e.message),
  });
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [typeForm, setTypeForm] = useState({ name: "", type: "umrah", priceUSD: "", processingDays: "", validityDays: "", description: "", isActive: true, isFeatured: false });
  const createType = trpc.visa.createType.useMutation({
    onSuccess: () => { utils.visa.listTypes.invalidate(); setTypeDialogOpen(false); toast.success("تم إضافة نوع التأشيرة!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateType = trpc.visa.updateType.useMutation({
    onSuccess: () => { utils.visa.listTypes.invalidate(); setTypeDialogOpen(false); toast.success("تم تحديث التأشيرة!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteType = trpc.visa.deleteType.useMutation({
    onSuccess: () => { utils.visa.listTypes.invalidate(); toast.success("تم حذف نوع التأشيرة"); },
    onError: (e) => toast.error(e.message),
  });
  const openAddType = () => { setEditingType(null); setTypeForm({ name: "", type: "umrah", priceUSD: "", processingDays: "", validityDays: "", description: "", isActive: true, isFeatured: false }); setTypeDialogOpen(true); };
  const openEditType = (item: any) => { setEditingType(item); setTypeForm({ name: item.name, type: item.type, priceUSD: item.priceUSD, processingDays: String(item.processingDays ?? ""), validityDays: String(item.validityDays ?? ""), description: item.description ?? "", isActive: item.isActive, isFeatured: item.isFeatured }); setTypeDialogOpen(true); };
  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...typeForm, processingDays: typeForm.processingDays ? Number(typeForm.processingDays) : undefined, validityDays: typeForm.validityDays ? Number(typeForm.validityDays) : undefined };
    if (editingType) { updateType.mutate({ id: editingType.id, data }); } else { createType.mutate(data as any); }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            إدارة التأشيرات
          </h2>
        </div>
        {activeTab === "types" && <Button onClick={openAddType} className="bg-[var(--primary)] text-white text-sm h-8 gap-1"><Plus className="w-4 h-4" />إضافة نوع تأشيرة</Button>}
      </div>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        <button onClick={() => setActiveTab("applications")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "applications" ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--teal-700)]"}`}>طلبات التأشيرة ({applications.length})</button>
        <button onClick={() => setActiveTab("types")} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "types" ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--teal-700)]"}`}>أنواع التأشيرات ({(visaTypesList as any[]).length})</button>
      </div>
      {/* Visa Types Tab */}
      {activeTab === "types" && (
        <>
          <CRUDSection
            title="أنواع التأشيرات"
            icon={FileText}
            items={visaTypesList as any[]}
            isLoading={typesLoading}
            onAdd={openAddType}
            onEdit={openEditType}
            onDelete={(id) => deleteType.mutate({ id })}
            columns={[
              { key: "name", label: "اسم التأشيرة" },
              { key: "type", label: "النوع", render: (v) => <Badge variant="outline" className="capitalize text-xs">{v}</Badge> },
              { key: "priceUSD", label: "السعر", render: (v) => <span className="font-semibold text-[var(--teal-700)]">${Number(v).toLocaleString()}</span> },
              { key: "processingDays", label: "مدة المعالجة", render: (v) => v ? `${v} يوم` : "—" },
              { key: "isActive", label: "الحالة", render: (v) => <Badge className={v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{v ? "نشط" : "غير نشط"}</Badge> },
            ]}
            emptyMessage="لا توجد أنواع تأشيرات. أضف أول نوع الآن."
          />
          <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
            <DialogContent className="max-w-lg" dir="rtl">
              <DialogHeader><DialogTitle>{editingType ? "تعديل نوع التأشيرة" : "إضافة نوع تأشيرة"}</DialogTitle></DialogHeader>
              <form onSubmit={handleTypeSubmit} className="space-y-3">
                <div><Label>اسم التأشيرة *</Label><Input value={typeForm.name} onChange={e => setTypeForm(f => ({ ...f, name: e.target.value }))} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>النوع</Label>
                    <Select value={typeForm.type} onValueChange={v => setTypeForm(f => ({ ...f, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="umrah">عمرة</SelectItem>
                        <SelectItem value="hajj">حج</SelectItem>
                        <SelectItem value="tourist">سياحية</SelectItem>
                        <SelectItem value="transit">عبور</SelectItem>
                        <SelectItem value="business">عمل</SelectItem>
                        <SelectItem value="family">عائلية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>السعر (USD) *</Label><Input type="number" value={typeForm.priceUSD} onChange={e => setTypeForm(f => ({ ...f, priceUSD: e.target.value }))} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>مدة المعالجة (يوم)</Label><Input type="number" value={typeForm.processingDays} onChange={e => setTypeForm(f => ({ ...f, processingDays: e.target.value }))} /></div>
                  <div><Label>مدة الصلاحية (يوم)</Label><Input type="number" value={typeForm.validityDays} onChange={e => setTypeForm(f => ({ ...f, validityDays: e.target.value }))} /></div>
                </div>
                <div><Label>الوصف</Label><Textarea value={typeForm.description} onChange={e => setTypeForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={typeForm.isActive} onChange={e => setTypeForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />نشط</label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={typeForm.isFeatured} onChange={e => setTypeForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4" />مميز</label>
                </div>
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setTypeDialogOpen(false)}>إلغاء</Button>
                  <Button type="submit" className="bg-[var(--primary)] text-white" disabled={createType.isPending || updateType.isPending}>{editingType ? "حفظ التعديلات" : "إضافة التأشيرة"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
      {/* Applications Tab */}
      {activeTab === "applications" && (
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted-foreground)] text-sm">No visa applications yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--teal-50)]">
                  {["Applicant", "Passport", "Nationality", "Status", "Date", "Action"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-[var(--teal-700)] uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(applications as any[]).map((app: any, i: number) => (
                  <tr key={app.id} className={`border-b border-[var(--border)] hover:bg-[var(--teal-50)]/50 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3 text-sm font-medium">{app.applicantName}</td>
                    <td className="px-4 py-3 text-sm font-mono text-xs">{app.passportNumber}</td>
                    <td className="px-4 py-3 text-sm">{app.nationality}</td>
                    <td className="px-4 py-3">
                      <Badge className={`capitalize text-xs ${app.status === "approved" ? "bg-green-100 text-green-700" : app.status === "pending" ? "bg-amber-100 text-amber-700" : app.status === "rejected" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={app.status}
                        onValueChange={(v) => updateStatus.mutate({ id: app.id, status: v as any })}
                      >
                        <SelectTrigger className="h-7 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         )}
      </div>
      )}
    </div>
  );
}
// ─── Bookings Admin ───────────────────────────────────────────────────────────
function BookingsAdmin() {
  const { data: bookings = [], isLoading } = trpc.bookings.listAll.useQuery({ limit: 100 });

  return (
    <CRUDSection
      title="All Bookings"
      icon={Package}
      items={bookings}
      isLoading={isLoading}
      onAdd={() => toast.info("Bookings are created by customers")}
      onEdit={() => toast.info("Booking editing coming soon")}
      onDelete={() => toast.info("Use status update to cancel bookings")}
      columns={[
        { key: "bookingReference", label: "Reference", render: (v) => <span className="font-mono text-xs">{v}</span> },
        { key: "serviceType", label: "Service", render: (v) => <Badge variant="outline" className="capitalize text-xs">{v?.replace(/_/g, " ")}</Badge> },
        { key: "customerName", label: "Customer" },
        { key: "totalUSD", label: "الإجمالي", render: (v) => <span className="font-semibold text-[var(--teal-700)]">﷼{Number(v).toLocaleString("ar-SA")}</span> },        { key: "status", label: "Status", render: (v) => <Badge className={`capitalize text-xs ${v === "confirmed" ? "bg-green-100 text-green-700" : v === "pending" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{v}</Badge> },
        { key: "createdAt", label: "Date", render: (v) => new Date(v).toLocaleDateString() },
      ]}
      emptyMessage="No bookings yet. Bookings are created when customers book services."
    />
  );
}

/// ─── Users Admin ─────────────────────────────────────────────────────────────
function UsersAdmin() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user" | "provider" | "marketer">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");
  const PAGE_SIZE = 50;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = trpc.admin.listUsersPaginated.useQuery({
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    search: debouncedSearch || undefined,
    role: roleFilter,
    status: statusFilter,
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Mutations
  const banMutation = trpc.admin.banUser.useMutation({
    onSuccess: () => { utils.admin.listUsersPaginated.invalidate(); toast.success("تم حظر المستخدم"); },
    onError: (e) => toast.error(e.message),
  });
  const unbanMutation = trpc.admin.unbanUser.useMutation({
    onSuccess: () => { utils.admin.listUsersPaginated.invalidate(); toast.success("تم رفع الحظر"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.deleteUserById.useMutation({
    onSuccess: () => { utils.admin.listUsersPaginated.invalidate(); toast.success("تم حذف المستخدم"); setDeleteDialogOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const editMutation = trpc.admin.editUser.useMutation({
    onSuccess: () => { utils.admin.listUsersPaginated.invalidate(); toast.success("تم تحديث بيانات المستخدم"); setEditDialogOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const sendEmailMutation = trpc.admin.sendBulkEmail.useMutation({
    onSuccess: (r) => { toast.success(`تم إرسال البريد إلى ${r.sent} مستخدم`); setEmailDialogOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const sendWhatsAppMutation = trpc.admin.sendWhatsAppBroadcast.useMutation({
    onSuccess: (r) => {
      if (r.total === 0) { toast.error("لا يوجد مستخدمون بأرقام جوال مسجلة"); return; }
      // Open WhatsApp for first number as demo
      const firstNum = r.numbers[0];
      const msg = encodeURIComponent(r.message);
      window.open(`https://wa.me/${firstNum}?text=${msg}`, "_blank");
      toast.success(`تم تجهيز ${r.total} رسالة واتساب`);
      setWhatsappDialogOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banReason, setBanReason] = useState("");

  // Edit form state
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", nationality: "", role: "user" as string });

  // Email campaign state
  const [emailForm, setEmailForm] = useState({
    targetGroup: "all" as "all" | "active" | "banned" | "custom",
    subject: "",
    templateType: "announcement" as "announcement" | "offer" | "newsletter" | "reminder" | "custom",
    title: "",
    body: "",
    ctaText: "",
    ctaUrl: "",
  });

  // WhatsApp state
  const [waForm, setWaForm] = useState({ targetGroup: "all" as "all" | "active" | "custom", message: "" });

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({ name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "", nationality: user.nationality ?? "", role: user.role ?? "user" });
    setEditDialogOpen(true);
  };

  const openBan = (user: any) => { setSelectedUser(user); setBanReason(""); setBanDialogOpen(true); };
  const openDelete = (user: any) => { setSelectedUser(user); setDeleteDialogOpen(true); };

  const exportCSV = () => {
    const headers = ["الاسم", "البريد الإلكتروني", "الجوال", "الجنسية", "الدور", "الحالة", "تاريخ التسجيل"];
    const csvRows = rows.map((u: any) => [
      u.name ?? "", u.email ?? "", u.phone ?? "", u.nationality ?? "",
      u.role ?? "user", u.isBanned ? "محظور" : "نشط",
      new Date(u.createdAt).toLocaleDateString("ar-SA"),
    ]);
    const csv = [headers, ...csvRows].map(r => r.map((c: string) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "users.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير بيانات المستخدمين");
  };

  const bannedCount = rows.filter((u: any) => u.isBanned).length;
  const adminCount = rows.filter((u: any) => u.role === "admin").length;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>إدارة المستخدمين</h2>
            <p className="text-xs text-[var(--muted-foreground)]">إجمالي {total.toLocaleString("ar-SA")} مستخدم</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setEmailDialogOpen(true)} className="bg-[var(--primary)] text-white text-sm h-8 gap-1.5">
            <Mail className="w-4 h-4" />مراسلة جماعية
          </Button>
          <Button onClick={() => setWhatsappDialogOpen(true)} variant="outline" className="text-sm h-8 gap-1.5 border-green-500 text-green-700 hover:bg-green-50">
            <Smartphone className="w-4 h-4" />واتساب
          </Button>
          <Button onClick={exportCSV} variant="outline" className="text-sm h-8 gap-1.5">
            <Download className="w-4 h-4" />تصدير CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي المستخدمين", value: total.toLocaleString("ar-SA"), color: "text-[var(--teal-700)]" },
          { label: "في هذه الصفحة", value: rows.length, color: "text-blue-600" },
          { label: "مشرفون", value: adminCount, color: "text-purple-600" },
          { label: "محظورون", value: bannedCount, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[var(--border)] p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input placeholder="بحث بالاسم أو البريد أو الجوال..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pr-9" />
        </div>
        <Select value={roleFilter} onValueChange={v => { setRoleFilter(v as any); setPage(0); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأدوار</SelectItem>
            <SelectItem value="admin">مشرف</SelectItem>
            <SelectItem value="user">مستخدم</SelectItem>
            <SelectItem value="provider">مزود</SelectItem>
            <SelectItem value="marketer">مسوق</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as any); setPage(0); }}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="banned">محظور</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" /></div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)] text-sm">لا يوجد مستخدمون بهذه المعايير.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--teal-50)]">
                  {["المستخدم", "البريد", "الجوال", "الجنسية", "الدور", "الحالة", "تاريخ التسجيل", "إجراءات"].map(h => (
                    <th key={h} className="text-right text-xs font-semibold text-[var(--teal-700)] px-3 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((user: any, i: number) => (
                  <tr key={user.id} className={`border-b border-[var(--border)] hover:bg-[var(--teal-50)]/40 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"} ${user.isBanned ? "opacity-60" : ""}`}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${user.isBanned ? "bg-red-400" : "bg-[var(--primary)]"}`}>
                          {String(user.name ?? "?")[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[var(--teal-800)] max-w-[120px] truncate">{user.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--muted-foreground)] max-w-[160px] truncate">{user.email ?? "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-[var(--muted-foreground)]">{user.phone ?? "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-[var(--muted-foreground)]">{user.nationality ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge className={`text-[10px] capitalize ${user.role === "admin" ? "bg-purple-100 text-purple-700" : user.role === "provider" ? "bg-blue-100 text-blue-700" : user.role === "marketer" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}>
                        {user.role === "admin" ? "مشرف" : user.role === "provider" ? "مزود" : user.role === "marketer" ? "مسوق" : "مستخدم"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {user.isBanned
                        ? <Badge className="bg-red-100 text-red-700 text-[10px]">محظور</Badge>
                        : <Badge className="bg-green-100 text-green-700 text-[10px]">نشط</Badge>
                      }
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[var(--muted-foreground)]">{new Date(user.createdAt).toLocaleDateString("ar-SA")}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50" title="تعديل" onClick={() => openEdit(user)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        {user.isBanned ? (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-green-600 hover:bg-green-50" title="رفع الحظر" onClick={() => unbanMutation.mutate({ userId: user.id })}>
                            <CheckCheck className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50" title="حظر" onClick={() => openBan(user)}>
                            <Ban className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50" title="حذف" onClick={() => openDelete(user)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--muted-foreground)]">صفحة {page + 1} من {totalPages} — {total.toLocaleString("ar-SA")} مستخدم</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronRight className="w-4 h-4" />السابق
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              التالي<ChevronRightArrow className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── Edit User Dialog ─── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCog className="w-5 h-5 text-[var(--primary)]" />تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription>تعديل بيانات: {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>الاسم</Label><Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>البريد الإلكتروني</Label><Input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>رقم الجوال</Label><Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="+966XXXXXXXXX" /></div>
            <div><Label>الجنسية</Label><Input value={editForm.nationality} onChange={e => setEditForm(f => ({ ...f, nationality: e.target.value }))} /></div>
            <div>
              <Label>الدور</Label>
              <Select value={editForm.role} onValueChange={v => setEditForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">مستخدم عادي</SelectItem>
                  <SelectItem value="admin">مشرف</SelectItem>
                  <SelectItem value="provider">مزود خدمة</SelectItem>
                  <SelectItem value="marketer">مسوق</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>إلغاء</Button>
            <Button className="bg-[var(--primary)] text-white" onClick={() => editMutation.mutate({ userId: selectedUser?.id, ...editForm, role: editForm.role as any })} disabled={editMutation.isPending}>
              {editMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Ban User Dialog ─── */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-700"><Ban className="w-5 h-5" />حظر المستخدم</DialogTitle>
            <DialogDescription>سيتم منع {selectedUser?.name} من الدخول إلى الموقع.</DialogDescription>
          </DialogHeader>
          <div><Label>سبب الحظر (اختياري)</Label><Textarea value={banReason} onChange={e => setBanReason(e.target.value)} placeholder="أدخل سبب الحظر..." rows={3} /></div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>إلغاء</Button>
            <Button className="bg-amber-600 text-white hover:bg-amber-700" onClick={() => { banMutation.mutate({ userId: selectedUser?.id, reason: banReason || undefined }); setBanDialogOpen(false); }} disabled={banMutation.isPending}>
              تأكيد الحظر
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete User Dialog ─── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700"><Trash2 className="w-5 h-5" />حذف المستخدم</DialogTitle>
            <DialogDescription>هل أنت متأكد من حذف <strong>{selectedUser?.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={() => deleteMutation.mutate({ userId: selectedUser?.id })} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}حذف نهائي
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Bulk Email Dialog ─── */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-[var(--primary)]" />مراسلة جماعية بالبريد الإلكتروني</DialogTitle>
            <DialogDescription>أرسل رسالة إلى مجموعة من المستخدمين باستخدام قالب جميل ومميز</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>المستهدفون</Label>
                <Select value={emailForm.targetGroup} onValueChange={v => setEmailForm(f => ({ ...f, targetGroup: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستخدمين</SelectItem>
                    <SelectItem value="active">المستخدمون النشطون</SelectItem>
                    <SelectItem value="banned">المستخدمون المحظورون</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نوع القالب</Label>
                <Select value={emailForm.templateType} onValueChange={v => setEmailForm(f => ({ ...f, templateType: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">📢 إعلان هام</SelectItem>
                    <SelectItem value="offer">🌟 عرض خاص</SelectItem>
                    <SelectItem value="newsletter">📰 نشرة إخبارية</SelectItem>
                    <SelectItem value="reminder">🔔 تذكير</SelectItem>
                    <SelectItem value="custom">✉️ مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>موضوع البريد *</Label><Input value={emailForm.subject} onChange={e => setEmailForm(f => ({ ...f, subject: e.target.value }))} placeholder="مثال: عروض رمضان الخاصة على برامج العمرة" /></div>
            <div><Label>عنوان الرسالة *</Label><Input value={emailForm.title} onChange={e => setEmailForm(f => ({ ...f, title: e.target.value }))} placeholder="مثال: عروض لا تُفوَّت على برامج العمرة 1446" /></div>
            <div><Label>نص الرسالة *</Label><Textarea value={emailForm.body} onChange={e => setEmailForm(f => ({ ...f, body: e.target.value }))} placeholder="اكتب نص الرسالة هنا..." rows={5} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>نص زر الإجراء (اختياري)</Label><Input value={emailForm.ctaText} onChange={e => setEmailForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="مثال: احجز الآن" /></div>
              <div><Label>رابط زر الإجراء (اختياري)</Label><Input value={emailForm.ctaUrl} onChange={e => setEmailForm(f => ({ ...f, ctaUrl: e.target.value }))} placeholder="https://go-umrah.com/..." /></div>
            </div>
            <div className="p-3 bg-[var(--teal-50)] rounded-lg border border-[var(--teal-200)] text-xs text-[var(--teal-700)]">
              <strong>ملاحظة:</strong> سيتم إرسال البريد لجميع المستخدمين الذين لديهم عناوين بريد إلكتروني صالحة. يتطلب ذلك تفعيل Resend وتحقق النطاق.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>إلغاء</Button>
            <Button
              className="bg-[var(--primary)] text-white"
              onClick={() => sendEmailMutation.mutate(emailForm)}
              disabled={sendEmailMutation.isPending || !emailForm.subject || !emailForm.title || !emailForm.body}
            >
              {sendEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Send className="w-4 h-4 ml-2" />}
              إرسال الرسالة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── WhatsApp Broadcast Dialog ─── */}
      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700"><Smartphone className="w-5 h-5" />رسالة واتساب جماعية</DialogTitle>
            <DialogDescription>أرسل رسالة واتساب للمستخدمين الذين لديهم أرقام جوال مسجلة</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>المستهدفون</Label>
              <Select value={waForm.targetGroup} onValueChange={v => setWaForm(f => ({ ...f, targetGroup: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستخدمين</SelectItem>
                  <SelectItem value="active">المستخدمون النشطون فقط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نص الرسالة *</Label>
              <Textarea value={waForm.message} onChange={e => setWaForm(f => ({ ...f, message: e.target.value }))} placeholder="اكتب رسالة الواتساب هنا..." rows={5} />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">{waForm.message.length}/1000 حرف</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-xs text-green-700">
              <strong>كيف يعمل:</strong> سيتم فتح واتساب لكل رقم على حدة. للإرسال الجماعي الكامل، يلزم الاشتراك في WhatsApp Business API.
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setWhatsappDialogOpen(false)}>إلغاء</Button>
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => sendWhatsAppMutation.mutate(waForm)}
              disabled={sendWhatsAppMutation.isPending || !waForm.message}
            >
              {sendWhatsAppMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Smartphone className="w-4 h-4 ml-2" />}
              إرسال عبر واتساب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Localization & Pricing Admin ───────────────────────────────────────────
function LocalizationAdmin() {
  const utils = trpc.useUtils();
  const { data: rates, isLoading: ratesLoading } = trpc.localization.getExchangeRates.useQuery();
  const { data: offsets = [], isLoading: offsetsLoading } = trpc.localization.getCurrencyOffsets.useQuery();

  const updateOffset = trpc.localization.updateCurrencyOffset.useMutation({
    onSuccess: () => { utils.localization.getCurrencyOffsets.invalidate(); toast.success("Currency offset updated!"); },
    onError: (e) => toast.error(e.message),
  });

  const CURRENCIES = [
    { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
    { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
    { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰" },
    { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
    { code: "EGP", name: "الجنيه المصري", symbol: "ج.م", flag: "🇪🇬" },
  ];

  const LANGUAGES = [
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", dir: "LTR" },
    { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", dir: "RTL" },
    { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰", dir: "RTL" },
    { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", dir: "LTR" },
    { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", dir: "LTR" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", dir: "LTR" },
  ];

  const getOffset = (code: string) => {
    const o = (offsets as any[]).find((x: any) => x.currency === code);
    return o ? Number(o.offset) : 0;
  };

  const handleOffsetChange = (code: string, value: string) => {
    updateOffset.mutate({ currency: code as any, offset: Number(value) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
          <Languages className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            Localization &amp; Pricing
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">Manage languages, currencies, and exchange rate offsets</p>
        </div>
      </div>

      {/* Language Management */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--teal-50)] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[var(--teal-700)]" />
          <h3 className="font-bold text-[var(--teal-800)]">Active Languages</h3>
          <Badge className="ml-auto bg-green-100 text-green-700 text-xs">6 Languages Active</Badge>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--teal-50)]/50">
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-[var(--teal-800)]">{lang.name}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{lang.nativeName} · {lang.dir}</div>
                </div>
                <Badge className="bg-green-100 text-green-700 text-[10px]">Active</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700">
              <strong>Translation Management:</strong> All 6 languages are fully translated and active. To add custom translations or override specific strings, edit the LanguageContext in the codebase or contact your developer.
            </p>
          </div>
        </div>
      </div>

      {/* Currency & Exchange Rates */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--teal-50)] flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[var(--teal-700)]" />
          <h3 className="font-bold text-[var(--teal-800)]">Currency Exchange Rates</h3>
          {ratesLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-[var(--teal-500)] ml-auto" />
          ) : (
            <Badge className="ml-auto bg-blue-100 text-blue-700 text-xs">Live Rates</Badge>
          )}
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CURRENCIES.map((currency) => {
              const rate = (rates as any)?.[currency.code] || 1;
              const offset = getOffset(currency.code);
              const effectiveRate = rate * (1 + offset / 100);
              return (
                <div key={currency.code} className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--teal-300)] transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{currency.flag}</span>
                    <div>
                      <div className="font-bold text-sm text-[var(--teal-800)]">{currency.code}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{currency.name}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-bold text-[var(--teal-700)] text-sm">{currency.symbol}{ratesLoading ? "..." : Number(rate).toFixed(4)}</div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">per USD</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">Price Offset (%)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        min="-50"
                        max="100"
                        defaultValue={offset}
                        className="text-sm h-8"
                        onBlur={(e) => handleOffsetChange(currency.code, e.target.value)}
                      />
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--teal-50)] border border-[var(--teal-200)] text-xs font-bold text-[var(--teal-700)]">
                        {offset > 0 ? "+" : ""}{offset}%
                      </div>
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">
                      Effective rate: {currency.symbol}{Number(effectiveRate).toFixed(4)}/USD
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-[var(--teal-50)] border border-[var(--teal-200)]">
            <p className="text-xs text-[var(--teal-700)]">
              <strong>How it works:</strong> Live exchange rates are fetched from Open Exchange Rates API. The offset percentage allows you to add a markup or discount to displayed prices. A +5% offset on GBP means all GBP prices will be 5% higher than the raw conversion rate.
            </p>
          </div>
        </div>
      </div>

      {/* Currency Price Preview */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--teal-50)]">
          <h3 className="font-bold text-[var(--teal-800)]">Price Preview — Sample Package ($2,500 USD)</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CURRENCIES.map((currency) => {
              const rate = (rates as any)?.[currency.code] || 1;
              const offset = getOffset(currency.code);
              const effectiveRate = rate * (1 + offset / 100);
              const price = 2500 * effectiveRate;
              return (
                <div key={currency.code} className="text-center p-3 rounded-xl bg-[var(--teal-50)] border border-[var(--teal-100)]">
                  <div className="text-lg mb-1">{currency.flag}</div>
                  <div className="font-bold text-[var(--teal-700)] text-sm">
                    {currency.symbol}{ratesLoading ? "..." : price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">{currency.code}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hotels Programs (inner) ─────────────────────────────────────────────────
function HotelsAdminInner() {
  const utils = trpc.useUtils();
  const { data: hotels = [], isLoading } = trpc.hotels.list.useQuery({ limit: 100 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", city: "makkah", starRating: "", pricePerNightUSD: "", distanceToHaram: "", description: "", imageUrl: "", isActive: true, isFeatured: false });
  const createMutation = trpc.hotels.create.useMutation({
    onSuccess: () => { utils.hotels.list.invalidate(); setDialogOpen(false); toast.success("تم إضافة الفندق بنجاح!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.hotels.update.useMutation({
    onSuccess: () => { utils.hotels.list.invalidate(); setDialogOpen(false); toast.success("تم تحديث الفندق!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.hotels.delete.useMutation({
    onSuccess: () => { utils.hotels.list.invalidate(); toast.success("تم حذف الفندق"); },
    onError: (e) => toast.error(e.message),
  });
  const openAdd = () => { setEditing(null); setForm({ name: "", city: "makkah", starRating: "", pricePerNightUSD: "", distanceToHaram: "", description: "", imageUrl: "", isActive: true, isFeatured: false }); setDialogOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ name: item.name, city: item.city, starRating: String(item.starRating ?? ""), pricePerNightUSD: item.pricePerNightUSD, distanceToHaram: item.distanceToHaram ?? "", description: item.description ?? "", imageUrl: item.imageUrl ?? "", isActive: item.isActive, isFeatured: item.isFeatured }); setDialogOpen(true); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, starRating: form.starRating ? Number(form.starRating) : undefined };
    if (editing) { updateMutation.mutate({ id: editing.id, data }); } else { createMutation.mutate(data as any); }
  };
  return (
    <>
      <CRUDSection
        title="إدارة الفنادق"
        icon={Hotel}
        items={hotels as any[]}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate({ id })}
        columns={[
          { key: "name", label: "اسم الفندق" },
          { key: "city", label: "المدينة", render: (v) => <Badge variant="outline" className="capitalize text-xs">{v}</Badge> },
          { key: "starRating", label: "النجوم", render: (v) => v ? "⭐".repeat(Number(v)) : "—" },
          { key: "pricePerNightUSD", label: "السعر/ليلة", render: (v) => v ? <span className="font-semibold text-[var(--teal-700)]">${Number(v).toLocaleString()}</span> : "—" },
          { key: "distanceToHaram", label: "المسافة من الحرم" },
          { key: "isActive", label: "الحالة", render: (v) => <Badge className={v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{v ? "نشط" : "غير نشط"}</Badge> },
        ]}
        emptyMessage="لا توجد فنادق بعد. أضف أول فندق الآن."
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editing ? "تعديل الفندق" : "إضافة فندق جديد"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <AIContentAssistant
              contentType="hotel"
              onApply={(data) => setForm((f) => ({
                ...f,
                ...(data.title && { name: data.title }),
                ...(data.description && { description: data.description }),
                ...(data.imageUrl && { imageUrl: data.imageUrl }),
              }))}
            />
            <div><Label>اسم الفندق *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>المدينة</Label>
                <Select value={form.city} onValueChange={v => setForm(f => ({ ...f, city: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="makkah">مكة المكرمة</SelectItem>
                    <SelectItem value="madinah">المدينة المنورة</SelectItem>
                    <SelectItem value="jeddah">جدة</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>عدد النجوم</Label><Input type="number" min="1" max="7" value={form.starRating} onChange={e => setForm(f => ({ ...f, starRating: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>السعر/ليلة (USD) *</Label><Input type="number" value={form.pricePerNightUSD} onChange={e => setForm(f => ({ ...f, pricePerNightUSD: e.target.value }))} required /></div>
              <div><Label>المسافة من الحرم</Label><Input placeholder="مثال: 200م" value={form.distanceToHaram} onChange={e => setForm(f => ({ ...f, distanceToHaram: e.target.value }))} /></div>
            </div>
            <div><Label>الوصف</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
              folder="hotels"
              label="صورة الفندق"
              aspectRatio="16/9"
            />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />نشط</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4" />مميز</label>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
              <Button type="submit" className="bg-[var(--primary)] text-white" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? "حفظ التعديلات" : "إضافة الفندق"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Hotels Admin (with tabs) ────────────────────────────────────────────────
function HotelsAdmin() {
  const [activeTab, setActiveTab] = useState<"hotels" | "bookings">("hotels");
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {[
          { id: "hotels" as const, label: "الفنادق الداخلية", icon: "🏨" },
          { id: "bookings" as const, label: "جميع الطلبات", icon: "📋" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 -mb-px ${
              activeTab === tab.id ? "border-[var(--primary)] text-[var(--primary)] bg-white" : "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50"
            }`}>{tab.icon} {tab.label}</button>
        ))}
      </div>
      {activeTab === "hotels" && <HotelsAdminInner />}
      {activeTab === "bookings" && <SectionBookingsTab serviceType="hotel" title="الفنادق" />}
    </div>
  );
}

function FlightsAdminInner() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
          <Plane className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
          Flight Management
        </h2>
      </div>
      <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center">
        <Plane className="w-12 h-12 text-[var(--teal-300)] mx-auto mb-3" />
        <h3 className="font-bold text-[var(--teal-800)] mb-2">Flight API Integration</h3>
        <p className="text-[var(--muted-foreground)] text-sm max-w-md mx-auto">
          Flight inventory is managed through GDS (Global Distribution System) APIs like Amadeus, Sabre, or Travelport. Connect your preferred flight API to enable real-time flight management.
        </p>
        <Button className="mt-4 bg-[var(--primary)] text-white" onClick={() => toast.info("Connect a GDS API to manage flights")}>
          Connect Flight API
        </Button>
      </div>
    </div>
  );
}
function FlightsAdmin() {
  const [activeTab, setActiveTab] = useState<"flights" | "bookings">("flights");
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {[
          { id: "flights" as const, label: "الرحلات الجوية", icon: "✈️" },
          { id: "bookings" as const, label: "طلبات الحجز", icon: "📋" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 -mb-px ${
              activeTab === tab.id ? "border-[var(--primary)] text-[var(--primary)] bg-white" : "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50"
            }`}>{tab.icon} {tab.label}</button>
        ))}
      </div>
      {activeTab === "flights" && <FlightsAdminInner />}
      {activeTab === "bookings" && <SectionBookingsTab serviceType="flights" title="الرحلات" />}
    </div>
  );
}

function TransportAdminInner() {
  const utils = trpc.useUtils();
  const { data: vehicles = [], isLoading } = trpc.transport.list.useQuery({ limit: 100 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", type: "sedan", capacity: "", pricePerTripUSD: "", description: "", imageUrl: "", isFeatured: false });

  const createMutation = trpc.transport.create.useMutation({
    onSuccess: () => { utils.transport.list.invalidate(); setDialogOpen(false); toast.success("Vehicle created!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.transport.update.useMutation({
    onSuccess: () => { utils.transport.list.invalidate(); setDialogOpen(false); toast.success("Vehicle updated!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.transport.delete.useMutation({
    onSuccess: () => { utils.transport.list.invalidate(); toast.success("Vehicle deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", type: "sedan", capacity: "", pricePerTripUSD: "", description: "", imageUrl: "", isFeatured: false });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ name: item.name, type: item.type, capacity: String(item.capacity), pricePerTripUSD: item.pricePerTripUSD, description: item.description || "", imageUrl: item.imageUrl || "", isFeatured: item.isFeatured });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, capacity: Number(form.capacity) };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data as any);
    }
  };

  return (
    <>
      <CRUDSection
        title="Transportation"
        icon={Car}
        items={vehicles}
        isLoading={isLoading}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(id) => deleteMutation.mutate({ id })}
        columns={[
          { key: "name", label: "Vehicle" },
          { key: "type", label: "Type", render: (v) => <Badge variant="outline" className="capitalize text-xs">{v?.replace(/_/g, " ")}</Badge> },
          { key: "capacity", label: "Capacity", render: (v) => `${v} seats` },
          { key: "pricePerTripUSD", label: "Price/Trip", render: (v) => <span className="font-semibold text-[var(--teal-700)]">${Number(v).toLocaleString()}</span> },
          { key: "isActive", label: "Status", render: (v) => <Badge className={v ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{v ? "Active" : "Inactive"}</Badge> },
        ]}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
            <DialogDescription>Fill in the vehicle details for transportation services.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Vehicle Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1" placeholder="e.g. Toyota Land Cruiser" />
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="minibus">Minibus</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                    <SelectItem value="vip_car">VIP Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Capacity (seats) *</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required className="mt-1" />
              </div>
              <div>
                <Label>Price per Trip (USD) *</Label>
                <Input type="number" step="0.01" value={form.pricePerTripUSD} onChange={(e) => setForm({ ...form, pricePerTripUSD: e.target.value })} required className="mt-1" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" id="featured-v" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                <Label htmlFor="featured-v">Featured</Label>
              </div>
              <div className="col-span-2">
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                  folder="transport"
                  label="صورة المركبة"
                  aspectRatio="16/9"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1 bg-[var(--primary)] text-white">
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />{editing ? "Update" : "Create"}</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Transport Admin (with tabs) ─────────────────────────────────────────────
function TransportAdmin() {
  const [activeTab, setActiveTab] = useState<"vehicles" | "bookings">("vehicles");
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {[
          { id: "vehicles" as const, label: "المركبات", icon: "🚐" },
          { id: "bookings" as const, label: "طلبات الحجز", icon: "📋" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 -mb-px ${
              activeTab === tab.id ? "border-[var(--primary)] text-[var(--primary)] bg-white" : "border-transparent text-gray-500 hover:text-gray-700 bg-gray-50"
            }`}>{tab.icon} {tab.label}</button>
        ))}
      </div>
      {activeTab === "vehicles" && <TransportAdminInner />}
      {activeTab === "bookings" && <SectionBookingsTab serviceType="transport" title="المواصلات" />}
    </div>
  );
}

// ─── Analytics Dashboard ────────────────────────────────────────────────────
const BRAND_TEAL = "#1B5E52";
const BRAND_GOLD = "#C9A96E";
const CHART_COLORS = [BRAND_TEAL, BRAND_GOLD, "#2d8a7a", "#8b5cf6", "#06b6d4", "#f59e0b"];
function AnalyticsDashboard() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "365d">("30d");
  const { data: revenue, isLoading: revLoading } = trpc.analytics.revenue.useQuery({ period });
  const { data: conversion } = trpc.analytics.conversion.useQuery();
  const { data: seasonal } = trpc.analytics.seasonalForecast.useQuery();
  const { data: userStats } = trpc.analytics.userStats.useQuery();
  const { data: funnel } = trpc.analytics.conversionFunnel.useQuery();
  const { data: topProviders } = trpc.analytics.topProviders.useQuery();
  const { format: formatCurrency } = useCurrency();
  const kpis = [
    { label: "إجمالي الإيرادات", value: formatCurrency(Number(revenue?.total ?? 0)), icon: DollarSign, trend: "+12%", up: true, color: BRAND_TEAL },
    { label: "إيرادات الحجوزات", value: formatCurrency(Number(revenue?.bookingRevenue ?? 0)), icon: ShoppingBag, trend: "+8%", up: true, color: BRAND_GOLD },
    { label: "إيرادات المتجر", value: formatCurrency(Number(revenue?.orderRevenue ?? 0)), icon: Package, trend: "+15%", up: true, color: "#2d8a7a" },
    { label: "إجمالي المستخدمين", value: Number(userStats?.totalUsers ?? 0).toLocaleString(), icon: Users, trend: `+${userStats?.newThisMonth ?? 0} هذا الشهر`, up: true, color: "#8b5cf6" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>التحليلات المتقدمة</h2>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 أيام</SelectItem>
            <SelectItem value="30d">30 يوم</SelectItem>
            <SelectItem value="90d">90 يوم</SelectItem>
            <SelectItem value="365d">سنة كاملة</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl" style={{ background: `${kpi.color}20` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <Badge variant="outline" className={`text-xs ${kpi.up ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
                {kpi.trend}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-[var(--teal-800)]">{revLoading ? "..." : kpi.value}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
          <h3 className="font-bold text-[var(--teal-800)] mb-4">الإيرادات اليومية</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenue?.daily ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`﷼${Number(v).toFixed(0)}`, "الإيرادات بالريال"]} />
              <Line type="monotone" dataKey="revenue" stroke={BRAND_TEAL} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
          <h3 className="font-bold text-[var(--teal-800)] mb-4">الإيرادات حسب الخدمة</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={revenue?.byService ?? []} dataKey="revenue" nameKey="serviceType" cx="50%" cy="50%" outerRadius={80} label={({ serviceType, percent }) => `${serviceType} ${(percent * 100).toFixed(0)}%`}>
                {(revenue?.byService ?? []).map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => [`﷼${Number(v).toFixed(0)}`, "الإيرادات بالريال"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
        <h3 className="font-bold text-[var(--teal-800)] mb-4">التوقعات الموسمية (12 شهر)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={seasonal ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="count" fill={BRAND_TEAL} name="الحجوزات" radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenue" fill={BRAND_GOLD} name="الإيرادات ($)" radius={[4, 4, 0, 0]} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
        <h3 className="font-bold text-[var(--teal-800)] mb-4">معدلات التحويل حسب الخدمة</h3>
        <div className="space-y-3">
          {(conversion ?? []).map((c: any) => (
            <div key={c.serviceType} className="flex items-center gap-3">
              <div className="w-24 text-sm font-medium text-right">{c.serviceType}</div>
              <div className="flex-1 bg-[var(--teal-50)] rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.conversionRate}%`, background: BRAND_TEAL }} />
              </div>
              <div className="w-12 text-sm font-bold text-[var(--teal-700)] text-left">{c.conversionRate}%</div>
              <div className="text-xs text-[var(--muted-foreground)] w-20">{Number(c.total)} حجز</div>
            </div>
          ))}
          {(!conversion || conversion.length === 0) && <p className="text-center text-[var(--muted-foreground)] py-8">لا توجد بيانات حجوزات بعد</p>}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
        <h3 className="font-bold text-[var(--teal-800)] mb-4">قمع التحويل (User Funnel)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={funnel ?? []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="stage" type="category" width={110} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill={BRAND_TEAL} name="المستخدمين" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Providers */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
        <h3 className="font-bold text-[var(--teal-800)] mb-4">أفضل مزودي الخدمات</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border)]">
              <th className="text-right py-2 font-semibold text-[var(--teal-800)]">الشركة</th>
              <th className="text-center py-2 font-semibold text-[var(--teal-800)]">الحجوزات</th>
              <th className="text-left py-2 font-semibold text-[var(--teal-800)]">الإيرادات ($)</th>
            </tr></thead>
            <tbody>
              {(topProviders ?? []).map((p: any, i: number) => (
                <tr key={i} className="border-b border-[var(--border)]/50 hover:bg-[var(--teal-50)]/30 transition-colors">
                  <td className="py-2 font-medium">{p.companyName || `مزود #${p.providerId}`}</td>
                  <td className="py-2 text-center">{Number(p.bookingCount)}</td>
                  <td className="py-2 text-left text-[var(--teal-700)] font-bold">${Number(p.revenue).toFixed(0)}</td>
                </tr>
              ))}
              {(!topProviders || topProviders.length === 0) && (
                <tr><td colSpan={3} className="py-8 text-center text-[var(--muted-foreground)]">لا توجد بيانات بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
// ─── Asset Manager ─────────────────────────────────────────────────────────
function AssetManager() {
  const [folder, setFolder] = useState<"hajj" | "umrah" | "hotels" | "tours" | "transport" | "visa" | "store" | "general">("general");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.assets.upload.useMutation();
  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("حجم الملف يتجاوز 50 ميجابايت"); return; }
    setUploading(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadMutation.mutateAsync({ filename: file.name, contentType: file.type, base64Data, folder });
      setUploadedUrl(result.url);
      toast.success("تم رفع الملف بنجاح!");
    } catch { toast.error("فشل رفع الملف"); } finally { setUploading(false); }
  }, [folder, uploadMutation]);
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>مدير الأصول الرقمية</h2>
      <p className="text-[var(--muted-foreground)] text-sm">رفع صور 4K ومقاطع فيديو 360° مباشرة إلى التخزين السحابي</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
          <h3 className="font-bold text-[var(--teal-800)] mb-4">رفع ملف جديد</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">المجلد</Label>
              <Select value={folder} onValueChange={(v) => setFolder(v as typeof folder)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["hajj", "umrah", "hotels", "tours", "transport", "visa", "store", "general"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver ? "border-[var(--primary)] bg-[var(--teal-50)]" : "border-[var(--border)] hover:border-[var(--teal-300)]"}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? <RefreshCw className="w-10 h-10 text-[var(--primary)] animate-spin mx-auto" /> : <Upload className="w-10 h-10 text-[var(--muted-foreground)] mx-auto" />}
              <p className="font-medium mt-3">{uploading ? "جاري الرفع..." : "اسحب الملف هنا أو انقر للاختيار"}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">PNG, JPG, WEBP, MP4 — حتى 50 ميجابايت</p>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
            {uploadedUrl && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-medium text-green-700 mb-2">✓ تم الرفع — رابط CDN:</p>
                <div className="flex gap-2">
                  <Input value={uploadedUrl} readOnly className="text-xs" />
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(uploadedUrl); toast.success("تم نسخ الرابط"); }}>نسخ</Button>
                </div>
                {uploadedUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) && <img src={uploadedUrl} alt="Preview" className="mt-3 rounded-lg max-h-40 object-cover w-full" />}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
          <h3 className="font-bold text-[var(--teal-800)] mb-4">تعليمات الاستخدام</h3>
          <div className="space-y-3 text-sm">
            {[
              { icon: Image, text: "ارفع صور 4K للبرامج والفنادق والجولات" },
              { icon: Video, text: "ارفع مقاطع فيديو 360° للمواقع المقدسة" },
              { icon: CheckCircle, text: "انسخ رابط CDN والصقه في حقل 'رابط الصورة'" },
              { icon: Zap, text: "الصور تُحمّل فوراً على الواجهة الأمامية" },
              { icon: Shield, text: "جميع الملفات مخزنة بأمان على S3" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 p-3 bg-[var(--teal-50)] rounded-lg">
                <Icon className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── Data Export ───────────────────────────────────────────────────────────
function DataExport() {
  const [exportType, setExportType] = useState<"bookings" | "orders" | "users">("bookings");
  const [format, setFormat] = useState<"csv" | "json" | "xlsx">("csv");
  const [status, setStatus] = useState<"all" | "pending" | "confirmed" | "cancelled" | "completed">("all");
  const { data: bookingsData, isLoading: bLoading } = trpc.data.exportBookings.useQuery({ status });
  const { data: ordersData, isLoading: oLoading } = trpc.data.exportOrders.useQuery({ limit: 1000 });
  const { data: usersData, isLoading: uLoading } = trpc.data.exportUsers.useQuery();
  const handleExport = async () => {
    const data = exportType === "bookings" ? bookingsData : exportType === "orders" ? ordersData : usersData;
    if (!data || data.length === 0) { toast.error("لا توجد بيانات للتصدير"); return; }
    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${exportType}_export.json`; a.click();
      URL.revokeObjectURL(url);
    } else if (format === "csv") {
      const keys = Object.keys((data[0] as Record<string, unknown>) ?? {});
      const csv = [keys.join(","), ...data.map((row: any) => keys.map(k => JSON.stringify((row as Record<string, unknown>)[k] ?? "")).join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${exportType}_export.csv`; a.click();
      URL.revokeObjectURL(url);
    } else {
      try {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(data as Record<string, unknown>[]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, exportType);
        XLSX.writeFile(wb, `${exportType}_export.xlsx`);
      } catch { toast.error("فشل تصدير Excel"); return; }
    }
    toast.success(`تم تصدير ${data.length} سجل بنجاح`);
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>تصدير البيانات</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
          <h3 className="font-bold text-[var(--teal-800)] mb-4">تصدير البيانات</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-2 block">نوع البيانات</Label>
              <Select value={exportType} onValueChange={(v) => setExportType(v as typeof exportType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bookings">الحجوزات</SelectItem>
                  <SelectItem value="orders">الطلبات</SelectItem>
                  <SelectItem value="users">المستخدمون</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {exportType === "bookings" && (
              <div>
                <Label className="text-sm mb-2 block">الحالة</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="confirmed">مؤكد</SelectItem>
                    <SelectItem value="cancelled">ملغى</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label className="text-sm mb-2 block">صيغة التصدير</Label>
              <div className="flex gap-2">
                {(["csv", "json", "xlsx"] as const).map(f => (
                  <Button key={f} variant={format === f ? "default" : "outline"} size="sm" onClick={() => setFormat(f)} className="flex-1">{f.toUpperCase()}</Button>
                ))}
              </div>
            </div>
            <Button onClick={handleExport} disabled={bLoading || oLoading || uLoading} className="w-full bg-[var(--primary)] text-white">
              <Download className="w-4 h-4 mr-2" />
              تصدير {exportType === "bookings" ? "الحجوزات" : exportType === "orders" ? "الطلبات" : "المستخدمين"}
            </Button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
          <h3 className="font-bold text-[var(--teal-800)] mb-4">إحصائيات البيانات</h3>
          <div className="space-y-3">
            {[
              { label: "الحجوزات الكلية", icon: ShoppingBag, color: BRAND_TEAL, count: bookingsData?.length ?? 0 },
              { label: "الطلبات الكلية", icon: Package, color: BRAND_GOLD, count: ordersData?.length ?? 0 },
              { label: "المستخدمون المسجلون", icon: Users, color: "#8b5cf6", count: usersData?.length ?? 0 },
            ].map(({ label, icon: Icon, color, count }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-[var(--teal-50)] rounded-lg">
                <div className="p-2 rounded-lg" style={{ background: `${color}20` }}><Icon className="w-4 h-4" style={{ color }} /></div>
                <span className="font-medium flex-1">{label}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── Dynamic Pricing ───────────────────────────────────────────────────────
function DynamicPricing() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ruleId: "", name: "", type: "seasonal" as "seasonal" | "group" | "earlybird" | "currency", discountPercent: 10, isActive: true });
  const { data: rules, refetch } = trpc.pricing.listRules.useQuery();
  const upsertMutation = trpc.pricing.upsertRule.useMutation({ onSuccess: () => { refetch(); setShowForm(false); toast.success("تم حفظ القاعدة"); } });
  const deleteMutation = trpc.pricing.deleteRule.useMutation({ onSuccess: () => { refetch(); toast.success("تم حذف القاعدة"); } });
  const typeLabels = { seasonal: "موسمي", group: "مجموعات", earlybird: "حجز مبكر", currency: "عملة" };
  const typeColors = { seasonal: BRAND_TEAL, group: BRAND_GOLD, earlybird: "#8b5cf6", currency: "#06b6d4" };
  const presetRules = [
    { ruleId: "ramadan_2025", name: "خصم رمضان 2025", type: "seasonal" as const, discountPercent: 15, conditions: { month: "ramadan" } },
    { ruleId: "group_10plus", name: "خصم المجموعات (10+)", type: "group" as const, discountPercent: 10, conditions: { minPeople: 10 } },
    { ruleId: "earlybird_90d", name: "الحجز المبكر (90 يوم)", type: "earlybird" as const, discountPercent: 12, conditions: { daysInAdvance: 90 } },
    { ruleId: "hajj_season", name: "موسم الحج", type: "seasonal" as const, discountPercent: 0, conditions: { season: "hajj" } },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>محرك التسعير الديناميكي</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[var(--primary)] text-white"><Plus className="w-4 h-4 mr-2" />قاعدة جديدة</Button>
      </div>
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
        <h3 className="font-bold text-[var(--teal-800)] mb-3">قواعد جاهزة — أضفها بنقرة واحدة</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {presetRules.map(rule => (
            <Button key={rule.ruleId} variant="outline" className="h-auto py-3 flex-col gap-1 text-center" onClick={() => upsertMutation.mutate({ ...rule, isActive: true })}>
              <Zap className="w-4 h-4" style={{ color: typeColors[rule.type] }} />
              <span className="text-xs font-medium">{rule.name}</span>
              <Badge variant="outline" className="text-xs">{rule.discountPercent}% خصم</Badge>
            </Button>
          ))}
        </div>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl border border-[var(--primary)]/30 p-5">
          <h3 className="font-bold text-[var(--teal-800)] mb-4">إضافة قاعدة تسعير</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-sm mb-1 block">معرف القاعدة</Label><Input placeholder="e.g. summer_2025" value={form.ruleId} onChange={e => setForm(f => ({ ...f, ruleId: e.target.value }))} /></div>
            <div><Label className="text-sm mb-1 block">اسم القاعدة</Label><Input placeholder="خصم الصيف 2025" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <Label className="text-sm mb-1 block">النوع</Label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v as typeof form.type }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm mb-1 block">نسبة الخصم (%)</Label><Input type="number" min={0} max={100} value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: Number(e.target.value) }))} /></div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => upsertMutation.mutate({ ...form, conditions: {} })} disabled={!form.ruleId || !form.name} className="bg-[var(--primary)] text-white"><Check className="w-4 h-4 mr-2" />حفظ</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}><X className="w-4 h-4 mr-2" />إلغاء</Button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
        <h3 className="font-bold text-[var(--teal-800)] mb-4">القواعد النشطة</h3>
        {(!rules || rules.length === 0) ? (
          <p className="text-center text-[var(--muted-foreground)] py-8">لا توجد قواعد تسعير بعد</p>
        ) : (
          <div className="space-y-3">
            {rules.map((rule: any) => {
              let parsed: any = {};
              try { parsed = JSON.parse(rule.value ?? "{}"); } catch { /* ignore */ }
              const ruleType = (parsed.type ?? "seasonal") as keyof typeof typeColors;
              return (
                <div key={rule.key} className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-xl">
                  <div className="p-2 rounded-lg" style={{ background: `${typeColors[ruleType]}20` }}><Tag className="w-4 h-4" style={{ color: typeColors[ruleType] }} /></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{parsed.name ?? rule.key}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{typeLabels[ruleType]} — {parsed.discountPercent ?? 0}% خصم</p>
                  </div>
                  <Badge variant={parsed.isActive ? "default" : "outline"}>{parsed.isActive ? "نشط" : "معطل"}</Badge>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteMutation.mutate({ ruleId: rule.key?.replace("pricing_rule_", "") ?? "" })}><Trash2 className="w-4 h-4" /></Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// ─── Reviews Hub ───────────────────────────────────────────────────────────
function ReviewsHub() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "approved" | "pending" | "hidden">("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { data: platformData, refetch } = trpc.reviews.listPlatformReviews.useQuery({ page, limit: 20, status: statusFilter, search: search || undefined });
  const { data: reviewStats } = trpc.reviews.getStats.useQuery();
  const updateStatusMutation = trpc.reviews.updatePlatformReview.useMutation({ onSuccess: () => { refetch(); toast.success("تم تحديث حالة التقييم"); } });
  const deletePlatformMutation = trpc.reviews.deletePlatformReview.useMutation({ onSuccess: () => { refetch(); toast.success("تم حذف التقييم"); } });
  const adminCreateMutation = trpc.reviews.adminCreate.useMutation({ onSuccess: () => { refetch(); setAddDialogOpen(false); toast.success("تم إضافة التقييم بنجاح!"); } });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({ reviewerName: "", reviewerCountry: "", rating: 5, comment: "", serviceType: "", isVerified: true, featured: false, status: "approved" as "approved" | "pending" });
  const statusColors: Record<string, string> = { pending: "bg-amber-100 text-amber-700", approved: "bg-green-100 text-green-700", hidden: "bg-gray-100 text-gray-700" };
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adminCreateMutation.mutate(addForm);
  };
  const reviews = platformData?.reviews ?? [];
  const totalReviews = platformData?.total ?? 0;
  const totalPages = Math.ceil(totalReviews / 20);
  const avgRating = reviewStats?.average ?? 0;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>مركز التقييمات والسمعة</h2>
          <p className="text-[var(--muted-foreground)] text-sm">تقييمات حقيقية مستوردة من منصة زد — {totalReviews} تقييم بمتوسط {avgRating}/5</p>
        </div>
        <Button className="bg-[var(--primary)] text-white text-sm h-8 gap-1" onClick={() => setAddDialogOpen(true)}><Plus className="w-4 h-4" />إضافة تقييم</Button>
      </div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-[var(--border)] p-4 text-center">
          <div className="text-2xl font-bold text-[var(--teal-700)]">{reviewStats?.total ?? 0}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">إجمالي التقييمات</div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-4 text-center">
          <div className="text-2xl font-bold text-amber-500">{avgRating}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">متوسط التقييم</div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{reviewStats?.distribution?.[5] ?? 0}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">تقييم 5 نجوم</div>
        </div>
        <div className="bg-white rounded-xl border border-[var(--border)] p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{reviewStats?.distribution?.[4] ?? 0}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">تقييم 4 نجوم</div>
        </div>
      </div>
      {/* Rating Distribution Bar */}
      {reviewStats && (
        <div className="bg-white rounded-xl border border-[var(--border)] p-4">
          <p className="text-sm font-semibold text-[var(--teal-800)] mb-3">توزيع التقييمات</p>
          <div className="space-y-2">
            {[5,4,3,2,1].map(star => {
              const count = reviewStats.distribution?.[star] ?? 0;
              const pct = reviewStats.total > 0 ? Math.round((count / reviewStats.total) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs w-12 text-right text-[var(--muted-foreground)]">{star} ★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs w-8 text-[var(--muted-foreground)]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="بحث باسم العميل..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            className="pr-9 text-sm h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v as any); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="approved">منشورة</SelectItem>
            <SelectItem value="pending">معلقة</SelectItem>
            <SelectItem value="hidden">مخفية</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-9" onClick={() => { setSearch(searchInput); setPage(1); }}><Search className="w-4 h-4" /></Button>
      </div>
      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-16 text-center">
          <Star className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)] mb-4">لا توجد تقييمات تطابق البحث</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: any) => {
            const status = (review.status as string) ?? "approved";
            return (
              <div key={review.id} className="bg-white rounded-2xl border border-[var(--border)] p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--teal-100)] flex items-center justify-center text-[var(--primary)] font-bold shrink-0 text-lg">
                    {String(review.reviewerName ?? "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-[var(--teal-800)]">{String(review.reviewerName ?? "")}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[status] ?? "bg-gray-100 text-gray-700"}`}>
                        {status === "pending" ? "معلق" : status === "approved" ? "منشور" : "مخفي"}
                      </span>
                      {review.productName && (
                        <span className="text-xs text-[var(--muted-foreground)] bg-[var(--teal-50)] px-2 py-0.5 rounded-full truncate max-w-[200px]">
                          {review.productName}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating as number) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    {review.reviewText && (
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-3 leading-relaxed">
                        "{review.reviewText.length > 250 ? review.reviewText.substring(0, 250) + '...' : review.reviewText}"
                      </p>
                    )}
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                      {new Date(review.createdAt).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {status === "approved" && (
                      <Button size="sm" variant="outline" className="text-xs text-amber-600 border-amber-200" onClick={() => updateStatusMutation.mutate({ id: review.id, status: "hidden" })}>
                        <Eye className="w-3 h-3 ml-1" />إخفاء
                      </Button>
                    )}
                    {status === "hidden" && (
                      <Button size="sm" variant="outline" className="text-xs text-green-600 border-green-200" onClick={() => updateStatusMutation.mutate({ id: review.id, status: "approved" })}>
                        <Eye className="w-3 h-3 ml-1" />نشر
                      </Button>
                    )}
                    {status === "pending" && (
                      <Button size="sm" className="text-xs bg-[var(--primary)] text-white" onClick={() => updateStatusMutation.mutate({ id: review.id, status: "approved" })}>
                        <Check className="w-3 h-3 ml-1" />موافقة
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-xs text-red-500" onClick={() => { if (confirm("حذف هذا التقييم نهائياً?")) deletePlatformMutation.mutate({ id: review.id }); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← السابق</Button>
          <span className="text-sm text-[var(--muted-foreground)]">صفحة {page} من {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>التالي →</Button>
        </div>
      )}
      {/* Add Review Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>إضافة تقييم يدوي</DialogTitle></DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>اسم العميل *</Label><Input value={addForm.reviewerName} onChange={e => setAddForm(f => ({ ...f, reviewerName: e.target.value }))} required /></div>
              <div><Label>الدولة</Label><Input value={addForm.reviewerCountry} onChange={e => setAddForm(f => ({ ...f, reviewerCountry: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>التقييم (1-5)</Label>
                <Select value={String(addForm.rating)} onValueChange={v => setAddForm(f => ({ ...f, rating: Number(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[5,4,3,2,1].map(n => <SelectItem key={n} value={String(n)}>{'⭐'.repeat(n)} ({n})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>نوع الخدمة</Label><Input placeholder="حج، عمرة..." value={addForm.serviceType} onChange={e => setAddForm(f => ({ ...f, serviceType: e.target.value }))} /></div>
            </div>
            <div><Label>التعليق *</Label><Textarea value={addForm.comment} onChange={e => setAddForm(f => ({ ...f, comment: e.target.value }))} rows={3} required /></div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={addForm.isVerified} onChange={e => setAddForm(f => ({ ...f, isVerified: e.target.checked }))} className="w-4 h-4" />موثق</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={addForm.featured} onChange={e => setAddForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4" />مميز</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={addForm.status === "approved"} onChange={e => setAddForm(f => ({ ...f, status: e.target.checked ? "approved" : "pending" }))} className="w-4 h-4" />نشر فوري
              </label>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>إلغاء</Button>
              <Button type="submit" className="bg-[var(--primary)] text-white" disabled={adminCreateMutation.isPending}>إضافة التقييم</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
// ─── SEO Manager ───────────────────────────────────────────────────────────
function SeoManager() {
  const pages = [
    { id: "home", label: "الرئيسية", path: "/" },
    { id: "hajj", label: "الحج", path: "/hajj" },
    { id: "umrah", label: "العمرة", path: "/umrah" },
    { id: "hotels", label: "الفنادق", path: "/hotels" },
    { id: "flights", label: "الرحلات", path: "/flights" },
    { id: "visa", label: "التأشيرات", path: "/visa" },
    { id: "tours", label: "الجولات", path: "/tours" },
    { id: "store", label: "المتجر", path: "/store" },
  ];
  const [selectedPage, setSelectedPage] = useState("home");
  const [form, setForm] = useState({ title: "", description: "", keywords: "", ogTitle: "", ogDescription: "", ogImage: "" });
  const { data: seoData, refetch } = trpc.seo.get.useQuery({ page: selectedPage });
  const updateMutation = trpc.seo.update.useMutation({ onSuccess: () => { refetch(); toast.success("تم حفظ إعدادات SEO"); } });
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>مدير تحسين محركات البحث (SEO)</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--teal-50)]">
            <h3 className="font-bold text-[var(--teal-800)] text-sm">الصفحات</h3>
          </div>
          {pages.map(page => (
            <button key={page.id} onClick={() => setSelectedPage(page.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors border-b last:border-0 ${selectedPage === page.id ? "bg-[var(--teal-50)] text-[var(--primary)] font-medium" : "hover:bg-[var(--teal-50)]/50"}`}>
              <Globe className="w-4 h-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{page.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{page.path}</p>
              </div>
              {selectedPage === page.id && <ChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
            <h3 className="font-bold text-[var(--teal-800)] mb-4">إعدادات SEO — {pages.find(p => p.id === selectedPage)?.label}</h3>
            <div className="space-y-4">
              <div><Label className="text-sm mb-1 block">عنوان الصفحة (Title Tag)</Label><Input placeholder="Go Umrah — برامج الحج والعمرة المميزة" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /><p className="text-xs text-[var(--muted-foreground)] mt-1">{form.title.length}/60 حرف</p></div>
              <div><Label className="text-sm mb-1 block">الوصف (Meta Description)</Label><Textarea placeholder="احجز رحلة الحج والعمرة الآن مع Go Umrah..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /><p className="text-xs text-[var(--muted-foreground)] mt-1">{form.description.length}/160 حرف</p></div>
              <div><Label className="text-sm mb-1 block">الكلمات المفتاحية</Label><Input placeholder="حج, عمرة, مكة, المدينة, باقات..." value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} /></div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Open Graph (مشاركة السوشيال ميديا)</p>
                <div className="space-y-3">
                  <Input placeholder="OG Title" value={form.ogTitle} onChange={e => setForm(f => ({ ...f, ogTitle: e.target.value }))} />
                  <Input placeholder="OG Description" value={form.ogDescription} onChange={e => setForm(f => ({ ...f, ogDescription: e.target.value }))} />
                  <Input placeholder="OG Image URL" value={form.ogImage} onChange={e => setForm(f => ({ ...f, ogImage: e.target.value }))} />
                </div>
              </div>
              <Button onClick={() => updateMutation.mutate({ page: selectedPage, ...form })} disabled={updateMutation.isPending} className="w-full bg-[var(--primary)] text-white">
                <Check className="w-4 h-4 mr-2" />{updateMutation.isPending ? "جاري الحفظ..." : "حفظ إعدادات SEO"}
              </Button>
            </div>
          </div>
          {seoData && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-sm font-medium text-green-700 mb-2">✓ الإعدادات الحالية المحفوظة:</p>
              <div className="space-y-1 text-xs text-green-600">
                <p><strong>العنوان:</strong> {(seoData as any).title}</p>
                <p><strong>الوصف:</strong> {(seoData as any).description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ─── Hajj Vertical ─────────────────────────────────────────────────────────

// ─── Hajj Nusuk Packages Admin ────────────────────────────────────────────────
const NUSUK_PACKAGE_TYPES = [
  { value: "makhayem_mutawwara", label: "المخيمات المطورة" },
  { value: "makhayem_ghayr_mutawwara", label: "المخيمات غير المطورة" },
  { value: "abraj_kidana", label: "أبراج كدانة" },
  { value: "abraj_mina", label: "أبراج منى" },
  { value: "iqtisadiyya", label: "الباقات الاقتصادية" },
  { value: "standard", label: "باقة عامة" },
];

// ─── Nusuk Package Form (separate component to prevent re-render focus loss) ──
type NusukFormData = {
  title: string; subtitle: string; portalType: "internal" | "external";
  category: string; nusukPackageType: string;
  priceUSD: string; priceSAR: string; priceFromSAR: string; priceToSAR: string;
  duration: string; departureCity: string;
  arafatSleeping: string; minyaSleeping: string; muzdalifaSleeping: string;
  description: string; imageUrl: string; features: string;
  isFeatured: boolean; isUrgent: boolean;
};
function NusukPackageForm({ initialData, editing, onSubmit, onCancel, isSubmitting }: {
  initialData: NusukFormData;
  editing: boolean;
  onSubmit: (data: NusukFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  // Form state is isolated here — parent uses `key` prop to reset on open
  const [form, setForm] = useState<NusukFormData>(initialData);
  const f = form;
  const set = useCallback((field: keyof NusukFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AIContentAssistant
        contentType="hajj_package"
        hints={`نوع الباقة: ${NUSUK_PACKAGE_TYPES.find(t => t.value === f.nusukPackageType)?.label || f.nusukPackageType}`}
        onApply={(data) => {
          if (data.title) set("title", data.title);
          if (data.subtitle) set("subtitle", data.subtitle);
          if (data.description) set("description", data.description);
          if (data.imageUrl) set("imageUrl", data.imageUrl);
          if (data.features && data.features.length > 0) set("features", data.features.join("\n"));
          if (data.price_suggestion) {
            // Extract numbers from price suggestion like "من 15,000 إلى 25,000 ريال سعودي"
            const nums = data.price_suggestion.match(/[0-9,]+/g)?.map(n => n.replace(/,/g, "")) || [];
            if (nums.length >= 2) {
              set("priceFromSAR", nums[0]);
              set("priceToSAR", nums[1]);
            } else if (nums.length === 1) {
              set("priceSAR", nums[0]);
            }
          }
        }}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>عنوان الباقة *</Label>
          <Input value={f.title} onChange={e => set("title", e.target.value)} required className="mt-1" placeholder="مثال: باقة مخيمات مطورة VIP 21 يوم" />
        </div>
        <div className="col-span-2">
          <Label>العنوان الفرعي</Label>
          <Input value={f.subtitle} onChange={e => set("subtitle", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>نوع الباقة (نسك) *</Label>
          <Select value={f.nusukPackageType} onValueChange={v => set("nusukPackageType", v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {NUSUK_PACKAGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>المدة (أيام)</Label>
          <Input type="number" value={f.duration} onChange={e => set("duration", e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>السعر الثابت (ريال سعودي)</Label>
          <Input type="number" value={f.priceSAR} onChange={e => set("priceSAR", e.target.value)} className="mt-1" placeholder="اتركه فارغاً إذا كان نطاق سعري" />
        </div>
        <div>
          <Label>السعر من (ريال)</Label>
          <Input type="number" value={f.priceFromSAR} onChange={e => set("priceFromSAR", e.target.value)} className="mt-1" placeholder="مثال: 15000" />
        </div>
        <div>
          <Label>السعر إلى (ريال)</Label>
          <Input type="number" value={f.priceToSAR} onChange={e => set("priceToSAR", e.target.value)} className="mt-1" placeholder="مثال: 25000" />
        </div>
        <div>
          <Label>سكن عرفة</Label>
          <Input value={f.arafatSleeping} onChange={e => set("arafatSleeping", e.target.value)} className="mt-1" placeholder="مثال: مخيم مطور مع تكييف" />
        </div>
        <div>
          <Label>سكن منى</Label>
          <Input value={f.minyaSleeping} onChange={e => set("minyaSleeping", e.target.value)} className="mt-1" placeholder="مثال: مخيم غير مطور" />
        </div>
        <div>
          <Label>سكن مزدلفة</Label>
          <Input value={f.muzdalifaSleeping} onChange={e => set("muzdalifaSleeping", e.target.value)} className="mt-1" placeholder="مثال: ابراج مزدلفة" />
        </div>
        <div className="col-span-2">
          <ImageUpload value={f.imageUrl} onChange={url => set("imageUrl", url)} folder="hajj" label="صورة الباقة" aspectRatio="16/9" />
        </div>
        <div className="col-span-2">
          <Label>الوصف</Label>
          <Textarea value={f.description} onChange={e => set("description", e.target.value)} rows={3} className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label>المميزات (سطر لكل ميزة)</Label>
          <Textarea value={f.features} onChange={e => set("features", e.target.value)} rows={3} className="mt-1" placeholder="إقامة 5 نجوم&#10;مواصلات مكيفة&#10;مرشد معتمد" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="nusuk-featured" checked={f.isFeatured} onChange={e => set("isFeatured", e.target.checked)} />
          <Label htmlFor="nusuk-featured">باقة مميزة</Label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="nusuk-urgent" checked={f.isUrgent} onChange={e => set("isUrgent", e.target.checked)} />
          <Label htmlFor="nusuk-urgent">عاجل / محدود</Label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">إلغاء</Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[var(--primary)] text-white">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />{editing ? "تحديث" : "إضافة الباقة"}</>}
        </Button>
      </div>
    </form>
  );
}

function HajjNusukPackagesAdmin() {
  const utils = trpc.useUtils();
  const { data: programs = [], isLoading } = trpc.hajj.list.useQuery({ portal: "internal", limit: 100, includeInactive: true });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const emptyForm: NusukFormData = {
    title: "", subtitle: "", portalType: "internal",
    category: "hajj_domestic", nusukPackageType: "makhayem_mutawwara",
    priceUSD: "0", priceSAR: "", priceFromSAR: "", priceToSAR: "",
    duration: "21", departureCity: "مكة المكرمة",
    arafatSleeping: "", minyaSleeping: "", muzdalifaSleeping: "",
    description: "", imageUrl: "", features: "",
    isFeatured: false, isUrgent: false,
  };
  const [formInitial, setFormInitial] = useState<NusukFormData>(emptyForm);
  const [formKey, setFormKey] = useState(0);

  const createMutation = trpc.hajj.create.useMutation({
    onSuccess: () => { utils.hajj.list.invalidate(); setDialogOpen(false); toast.success("تم إضافة الباقة!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.hajj.update.useMutation({
    onSuccess: () => { utils.hajj.list.invalidate(); setDialogOpen(false); toast.success("تم تحديث الباقة!"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.hajj.delete.useMutation({
    onSuccess: () => { utils.hajj.list.invalidate(); toast.success("تم حذف الباقة"); },
  });
  const toggleActiveMutation = trpc.hajj.toggleActive.useMutation({
    onSuccess: (_, vars) => { utils.hajj.list.invalidate(); toast.success(vars.isActive ? "تم تفعيل الباقة" : "تم تعطيل الباقة"); },
    onError: (e) => toast.error(e.message),
  });

  const openAdd = () => { setEditing(null); setFormInitial(emptyForm); setFormKey(k => k + 1); setDialogOpen(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    setFormInitial({
      title: item.title || "", subtitle: item.subtitle || "",
      portalType: item.portalType || "internal",
      category: item.category || "hajj_domestic",
      nusukPackageType: item.nusukPackageType || "makhayem_mutawwara",
      priceUSD: String(item.priceUSD || "0"),
      priceSAR: String(item.priceSAR || ""),
      priceFromSAR: String(item.priceFromSAR || ""),
      priceToSAR: String(item.priceToSAR || ""),
      duration: String(item.duration || "21"),
      departureCity: item.departureCity || "مكة المكرمة",
      arafatSleeping: item.arafatSleeping || "", minyaSleeping: item.minyaSleeping || "", muzdalifaSleeping: item.muzdalifaSleeping || "",
      description: item.description || "", imageUrl: item.imageUrl || "",
      features: Array.isArray(item.features) ? item.features.join("\n") : (item.features || ""),
      isFeatured: item.isFeatured || false, isUrgent: item.isUrgent || false,
    });
    setFormKey(k => k + 1);
    setDialogOpen(true);
  };

  const handleSubmit = (formData: NusukFormData) => {
    const data: any = {
      title: formData.title, subtitle: formData.subtitle || undefined,
      portalType: formData.portalType, category: formData.category,
      nusukPackageType: formData.nusukPackageType,
      priceUSD: formData.priceUSD || "0",
      priceSAR: formData.priceSAR || undefined,
      priceFromSAR: formData.priceFromSAR || undefined,
      priceToSAR: formData.priceToSAR || undefined,
      duration: Number(formData.duration) || 21,
      departureCity: formData.departureCity || undefined,
      arafatSleeping: formData.arafatSleeping || undefined, minyaSleeping: formData.minyaSleeping || undefined, muzdalifaSleeping: formData.muzdalifaSleeping || undefined,
      description: formData.description || undefined, imageUrl: formData.imageUrl || undefined,
      features: formData.features ? formData.features.split("\n").filter(Boolean) : undefined,
      isFeatured: formData.isFeatured, isUrgent: formData.isUrgent,
    };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const nusukTypeLabel = (v: string) => NUSUK_PACKAGE_TYPES.find(t => t.value === v)?.label || v;
  const filteredPrograms = filterType === "all" ? programs : programs.filter((p: any) => p.nusukPackageType === filterType);

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[var(--teal-800)]">باقات نسك — حجاج الداخل</h3>
          <p className="text-xs text-gray-500 mt-0.5">المخيمات المطورة، غير المطورة، أبراج كدانة، أبراج منى، الاقتصادية</p>
        </div>
        <Button onClick={openAdd} className="bg-[var(--primary)] text-white"><Plus className="w-4 h-4 ml-2" />إضافة باقة</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterType("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === "all" ? "bg-[var(--primary)] text-white" : "bg-gray-100 text-gray-600"}`}>الكل ({programs.length})</button>
        {NUSUK_PACKAGE_TYPES.map(t => {
          const count = programs.filter((p: any) => p.nusukPackageType === t.value).length;
          return (
            <button key={t.value} onClick={() => setFilterType(t.value)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === t.value ? "bg-[var(--primary)] text-white" : "bg-gray-100 text-gray-600"}`}>
              {t.label}{count > 0 && <span className="opacity-60 mr-1">({count})</span>}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" /></div>
      ) : filteredPrograms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <span className="text-4xl mb-3 block">🕌</span>
          <p className="text-gray-400 text-sm">لا توجد باقات في هذا النوع بعد</p>
          <Button onClick={openAdd} variant="outline" className="mt-4 text-sm">إضافة أول باقة</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrograms.map((pkg: any) => (
            <div key={pkg.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${!pkg.isActive ? 'border-red-200 bg-red-50/30' : 'border-[var(--border)]'}`}>
              {pkg.imageUrl && <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-36 object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[var(--teal-800)] text-sm truncate">{pkg.title}</h4>
                    {pkg.subtitle && <p className="text-xs text-gray-500 truncate">{pkg.subtitle}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 items-center">
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: pkg.id, isActive: !pkg.isActive })}
                      disabled={toggleActiveMutation.isPending}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--primary)] ${
                        pkg.isActive ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                      title={pkg.isActive ? 'تعطيل الباقة' : 'تفعيل الباقة'}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        pkg.isActive ? 'translate-x-1' : 'translate-x-[18px]'
                      }`} />
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(pkg)} className="h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => { if (confirm("حذف الباقة؟")) deleteMutation.mutate({ id: pkg.id }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge className="text-xs bg-teal-50 text-teal-700 border-teal-200">{nusukTypeLabel(pkg.nusukPackageType || "standard")}</Badge>
                  {pkg.isFeatured && <Badge className="text-xs bg-amber-50 text-amber-700">مميزة</Badge>}
                  {pkg.isUrgent && <Badge className="text-xs bg-red-50 text-red-700">عاجل</Badge>}
                  {!pkg.isActive && <Badge className="text-xs bg-red-100 text-red-700 border-red-200">معطّلة</Badge>}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-400 mb-0.5">المدة</div>
                    <div className="font-semibold">{pkg.duration} يوم</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-gray-400 mb-0.5">السعر</div>
                    {pkg.priceFromSAR && pkg.priceToSAR ? (
                      <div className="font-bold text-[var(--primary)]">{Number(pkg.priceFromSAR).toLocaleString()} — {Number(pkg.priceToSAR).toLocaleString()} ر.س</div>
                    ) : pkg.priceSAR ? (
                      <div className="font-bold text-[var(--primary)]">{Number(pkg.priceSAR).toLocaleString()} ر.س</div>
                    ) : (
                      <div className="font-bold text-[var(--primary)]">${pkg.priceUSD}</div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 col-span-2">
                    <div className="text-gray-400 mb-0.5">مواقع السكن</div>
                    <div className="font-semibold text-xs space-y-0.5">
                      {pkg.arafatSleeping && <div>عرفة: {pkg.arafatSleeping}</div>}
                      {pkg.minyaSleeping && <div>منى: {pkg.minyaSleeping}</div>}
                      {pkg.muzdalifaSleeping && <div>مزدلفة: {pkg.muzdalifaSleeping}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل باقة نسك" : "إضافة باقة نسك جديدة"}</DialogTitle>
            <DialogDescription>أدخل تفاصيل الباقة المعتمدة من منصة نسك</DialogDescription>
          </DialogHeader>
          <NusukPackageForm
            key={formKey}
            initialData={formInitial}
            editing={!!editing}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Hajj Domestic Admin ──────────────────────────────────────────────────────
function HajjDomesticAdmin() {
  const [activeTab, setActiveTab] = useState<"nusuk" | "companies" | "notifications" | "subscribers">("nusuk");
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const emptyCompany = { nameAr: "", nameEn: "", licenseNumber: "", city: "", phone: "", whatsapp: "", email: "", website: "", nusukProfileUrl: "", description: "", logoUrl: "", coverImageUrl: "", yearsExperience: 0, totalPilgrims: 0, isVerified: false, isFeatured: false };
  const [companyForm, setCompanyForm] = useState(emptyCompany);
  const { data: companiesData, refetch: refetchCompanies } = trpc.hajjDomestic.listCompanies.useQuery({});
  const createCompany = trpc.hajjDomestic.addCompany.useMutation({ onSuccess: () => { refetchCompanies(); setShowCompanyForm(false); toast.success("تم إضافة الشركة"); setCompanyForm(emptyCompany); } });
  const updateCompany = trpc.hajjDomestic.updateCompany.useMutation({ onSuccess: () => { refetchCompanies(); setEditingCompany(null); toast.success("تم تحديث الشركة"); } });
  const deleteCompany = trpc.hajjDomestic.deleteCompany.useMutation({ onSuccess: () => { refetchCompanies(); toast.success("تم حذف الشركة"); } });
  const [showNotifForm, setShowNotifForm] = useState(false);
  const [notifForm, setNotifForm] = useState({ titleAr: "", contentAr: "", category: "news" as "news" | "alert" | "announcement" | "article" | "update", isUrgent: false, isPinned: false, sourceUrl: "", imageUrl: "" });
  const [sendChannels, setSendChannels] = useState({ email: false, whatsapp: false });
  const { data: notifsData, refetch: refetchNotifs } = trpc.hajjDomestic.listNotifications.useQuery({ category: "all" });
  const createNotif = trpc.hajjDomestic.addNotification.useMutation({ onSuccess: () => { refetchNotifs(); setShowNotifForm(false); toast.success("تم نشر الإشعار"); setNotifForm({ titleAr: "", contentAr: "", category: "news", isUrgent: false, isPinned: false, sourceUrl: "", imageUrl: "" }); } });
  const { data: subsData } = trpc.hajjDomestic.listSubscribers.useQuery();
  const catColors: Record<string, string> = { alert: "bg-red-100 text-red-700", announcement: "bg-blue-100 text-blue-700", news: "bg-teal-100 text-teal-700", article: "bg-purple-100 text-purple-700", update: "bg-amber-100 text-amber-700" };
  const catLabels: Record<string, string> = { alert: "تنبيه", announcement: "إعلان", news: "خبر", article: "مقال", update: "تحديث" };
  const CField = ({ form, onChange }: { form: typeof emptyCompany; onChange: (k: string, v: any) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Input placeholder="اسم الشركة بالعربية *" value={form.nameAr} onChange={e => onChange("nameAr", e.target.value)} />
      <Input placeholder="Company Name in English" value={form.nameEn} onChange={e => onChange("nameEn", e.target.value)} />
      <Input placeholder="رقم الترخيص" value={form.licenseNumber} onChange={e => onChange("licenseNumber", e.target.value)} />
      <Input placeholder="المدينة" value={form.city} onChange={e => onChange("city", e.target.value)} />
      <Input placeholder="رقم الهاتف" value={form.phone} onChange={e => onChange("phone", e.target.value)} />
      <Input placeholder="رقم الواتساب (مع رمز الدولة)" value={form.whatsapp} onChange={e => onChange("whatsapp", e.target.value)} />
      <Input placeholder="البريد الإلكتروني" type="email" value={form.email} onChange={e => onChange("email", e.target.value)} />
      <Input placeholder="الموقع الإلكتروني" value={form.website} onChange={e => onChange("website", e.target.value)} />
      <Input placeholder="رابط صفحة نسك" value={form.nusukProfileUrl} onChange={e => onChange("nusukProfileUrl", e.target.value)} />
      <Input placeholder="سنوات الخبرة" type="number" value={form.yearsExperience} onChange={e => onChange("yearsExperience", Number(e.target.value))} />
      <Input placeholder="عدد الحجاج السابقين" type="number" value={form.totalPilgrims} onChange={e => onChange("totalPilgrims", Number(e.target.value))} />
      <ImageUpload
        value={form.logoUrl}
        onChange={(url) => onChange("logoUrl", url)}
        folder="hajj"
        label="شعار الشركة"
        aspectRatio="1/1"
        placeholder="ارفع شعار الشركة"
      />
      <ImageUpload
        value={form.coverImageUrl}
        onChange={(url) => onChange("coverImageUrl", url)}
        folder="hajj"
        label="صورة الغلاف"
        aspectRatio="16/9"
        placeholder="ارفع صورة الغلاف"
      />
      <Textarea placeholder="وصف الشركة..." value={form.description} onChange={e => onChange("description", e.target.value)} rows={2} className="col-span-2" />
      <div className="flex gap-4 col-span-2">
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isVerified} onChange={e => onChange("isVerified", e.target.checked)} /><span className="text-sm">شركة موثقة</span></label>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={e => onChange("isFeatured", e.target.checked)} /><span className="text-sm">شركة مميزة</span></label>
      </div>
    </div>
  );
  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-bold text-[var(--teal-800)]">إدارة حجاج الداخل</h2>
      <div className="flex gap-2 flex-wrap">
        {(["nusuk", "companies", "notifications", "subscribers"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === t ? "bg-[var(--primary)] text-white" : "bg-gray-100 text-gray-600"}`}>
            {t === "nusuk" ? "🕌 باقات نسك" : t === "companies" ? `🏢 شركات الحج (${companiesData?.companies.length ?? 0})` : t === "notifications" ? `📢 إشعارات (${notifsData?.items.length ?? 0})` : `📧 مشتركون (${subsData?.length ?? 0})`}
          </button>
        ))}
      </div>
      {activeTab === "nusuk" && <HajjNusukPackagesAdmin />}
      {activeTab === "companies" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">إدارة شركات حجاج الداخل المرخصة</p>
            <Button onClick={() => setShowCompanyForm(!showCompanyForm)} className="bg-[var(--primary)] text-white"><Plus className="w-4 h-4 ml-2" />إضافة شركة</Button>
          </div>
          {showCompanyForm && (
            <div className="bg-white rounded-2xl border border-[var(--primary)]/30 p-5 space-y-3">
              <h3 className="font-bold text-[var(--teal-800)]">بيانات الشركة الجديدة</h3>
              <CField form={companyForm} onChange={(k, v) => setCompanyForm(p => ({ ...p, [k]: v }))} />
              <div className="flex gap-2">
                <Button onClick={() => createCompany.mutate(companyForm)} className="bg-[var(--primary)] text-white" disabled={!companyForm.nameAr || createCompany.isPending}><Save className="w-4 h-4 ml-2" />حفظ</Button>
                <Button variant="outline" onClick={() => setShowCompanyForm(false)}>إلغاء</Button>
              </div>
            </div>
          )}
          {editingCompany && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 space-y-3">
              <h3 className="font-bold text-amber-800">تعديل: {editingCompany.nameAr}</h3>
              <CField form={editingCompany} onChange={(k, v) => setEditingCompany((p: any) => ({ ...p, [k]: v }))} />
              <div className="flex gap-2">
                <Button onClick={() => updateCompany.mutate({ companyId: editingCompany.companyId, ...editingCompany })} className="bg-amber-600 text-white" disabled={updateCompany.isPending}><Save className="w-4 h-4 ml-2" />حفظ التعديل</Button>
                <Button variant="outline" onClick={() => setEditingCompany(null)}>إلغاء</Button>
              </div>
            </div>
          )}
          {(!companiesData?.companies || companiesData.companies.length === 0) ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center"><Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">لا توجد شركات مضافة بعد</p></div>
          ) : (
            <div className="space-y-3">
              {companiesData.companies.map((c: any) => (
                <div key={c.id} className="bg-white rounded-2xl border border-[var(--border)] p-4 flex items-start gap-4">
                  {c.logoUrl && <img src={c.logoUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[var(--teal-800)]">{c.nameAr}</span>
                      {c.isVerified && <Badge className="text-xs bg-emerald-100 text-emerald-700">موثق</Badge>}
                      {c.isFeatured && <Badge className="text-xs bg-amber-100 text-amber-700">مميز</Badge>}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                      {c.city && <span>{c.city}</span>}
                      {c.phone && <span>{c.phone}</span>}
                      {c.licenseNumber && <span>ترخيص: {c.licenseNumber}</span>}
                      <span>تقييم: {Number(c.averageRating || 0).toFixed(1)} ({c.totalReviews})</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setEditingCompany(c)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm("حذف الشركة؟")) deleteCompany.mutate({ companyId: c.companyId }); }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === "notifications" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">إنشاء وإدارة الأخبار والإشعارات</p>
            <Button onClick={() => setShowNotifForm(!showNotifForm)} className="bg-[var(--primary)] text-white"><Plus className="w-4 h-4 ml-2" />إضافة إشعار</Button>
          </div>
          {showNotifForm && (
            <div className="bg-white rounded-2xl border border-[var(--primary)]/30 p-5 space-y-3">
              <Input placeholder="عنوان الإشعار *" value={notifForm.titleAr} onChange={e => setNotifForm(p => ({ ...p, titleAr: e.target.value }))} />
              <Textarea placeholder="محتوى الإشعار..." value={notifForm.contentAr} onChange={e => setNotifForm(p => ({ ...p, contentAr: e.target.value }))} rows={3} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={notifForm.category} onValueChange={v => setNotifForm(p => ({ ...p, category: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(catLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="رابط المصدر (اختياري)" value={notifForm.sourceUrl} onChange={e => setNotifForm(p => ({ ...p, sourceUrl: e.target.value }))} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={notifForm.isUrgent} onChange={e => setNotifForm(p => ({ ...p, isUrgent: e.target.checked }))} /><span className="text-sm">عاجل</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={notifForm.isPinned} onChange={e => setNotifForm(p => ({ ...p, isPinned: e.target.checked }))} /><span className="text-sm">تثبيت في الأعلى</span></label>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-sm font-semibold text-blue-800 mb-2">إرسال للمشتركين ({subsData?.length ?? 0} مشترك):</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sendChannels.email} onChange={e => setSendChannels(p => ({ ...p, email: e.target.checked }))} /><span className="text-sm">إيميل</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sendChannels.whatsapp} onChange={e => setSendChannels(p => ({ ...p, whatsapp: e.target.checked }))} /><span className="text-sm">واتساب</span></label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => createNotif.mutate({ ...notifForm, sendEmail: sendChannels.email, sendWhatsapp: sendChannels.whatsapp })} className="bg-[var(--primary)] text-white" disabled={!notifForm.titleAr || createNotif.isPending}><Send className="w-4 h-4 ml-2" />نشر وإرسال</Button>
                <Button variant="outline" onClick={() => setShowNotifForm(false)}>إلغاء</Button>
              </div>
            </div>
          )}
          {(!notifsData?.items || notifsData.items.length === 0) ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center"><Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">لا توجد إشعارات بعد</p></div>
          ) : (
            <div className="space-y-3">
              {notifsData.items.map((item: any) => (
                <div key={item.id} className="bg-white rounded-2xl border border-[var(--border)] p-4 flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[item.category] || "bg-gray-100 text-gray-600"}`}>{catLabels[item.category] || item.category}</span>
                      {item.isUrgent && <Badge className="text-xs bg-red-100 text-red-700">عاجل</Badge>}
                      {item.isPinned && <Badge className="text-xs bg-amber-100 text-amber-700">مثبت</Badge>}
                    </div>
                    <p className="font-medium">{item.titleAr}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.contentAr}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === "subscribers" && (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5">
          <h3 className="font-bold text-[var(--teal-800)] mb-4">مشتركو الإشعارات ({subsData?.length ?? 0})</h3>
          {(!subsData || subsData.length === 0) ? (
            <p className="text-center text-gray-400 py-8">لا يوجد مشتركون بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">الاسم</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">الإيميل</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">الواتساب</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">القناة</th>
                </tr></thead>
                <tbody>
                  {(subsData ?? []).map((s: any) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3">{s.name || "—"}</td>
                      <td className="py-2 px-3 text-gray-500">{s.email || "—"}</td>
                      <td className="py-2 px-3 text-gray-500">{s.whatsapp || "—"}</td>
                      <td className="py-2 px-3"><Badge className="text-xs">{s.subscriptionType}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// ─── Hajj International Admin ──────────────────────────────────────────────────
// ── Standalone form component to prevent focus loss on parent re-renders ──────
type IntlFormData = {
  titleAr: string; titleEn: string; countryAr: string; countryEn: string;
  countryCode: string; cityAr: string; cityEn: string;
  companyNameAr: string; companyName: string; companyLogoUrl: string;
  imageUrl: string; priceUSD: number; priceSAR: number; duration: number;
  seatsAvailable: number; hotelMakkah: string; hotelMadinah: string;
  hotelStarRating: number; contactPhone: string; contactWhatsapp: string;
  contactEmail: string; description: string; isFeatured: boolean; isUrgent: boolean;
};
const emptyIntlForm: IntlFormData = {
  titleAr: "", titleEn: "", countryAr: "", countryEn: "", countryCode: "",
  cityAr: "", cityEn: "", companyNameAr: "", companyName: "", companyLogoUrl: "",
  imageUrl: "", priceUSD: 0, priceSAR: 0, duration: 14, seatsAvailable: 0,
  hotelMakkah: "", hotelMadinah: "", hotelStarRating: 4,
  contactPhone: "", contactWhatsapp: "", contactEmail: "",
  description: "", isFeatured: false, isUrgent: false,
};
function IntlPackageForm({
  initialData, editing, onSubmit, onCancel, isSubmitting,
}: {
  initialData: IntlFormData;
  editing: boolean;
  onSubmit: (data: IntlFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<IntlFormData>(initialData);
  const set = useCallback((k: keyof IntlFormData, v: any) => setForm(p => ({ ...p, [k]: v })), []);
  return (
    <div className="space-y-4">
      <AIContentAssistant
        contentType="hajj_package"
        onApply={(data) => {
          if (data.title) set("titleAr", data.title);
          if (data.subtitle) set("titleEn", data.subtitle);
          if (data.description) set("description", data.description);
          if (data.imageUrl) set("imageUrl", data.imageUrl);
          if (data.features && data.features.length > 0) {
            // Use features as description supplement
            const featText = data.features.join("\n");
            set("description", (form.description ? form.description + "\n" : "") + featText);
          }
          if (data.price_suggestion) {
            const nums = data.price_suggestion.match(/[0-9,]+/g)?.map(n => n.replace(/,/g, "")) || [];
            if (nums.length >= 1) set("priceUSD", Number(nums[0]));
            if (nums.length >= 2) set("priceSAR", Number(nums[1]));
          }
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input placeholder="عنوان الباقة بالعربية *" value={form.titleAr} onChange={e => set("titleAr", e.target.value)} />
        <Input placeholder="Package Title in English" value={form.titleEn} onChange={e => set("titleEn", e.target.value)} />
        <Input placeholder="الدولة بالعربية *" value={form.countryAr} onChange={e => set("countryAr", e.target.value)} />
        <Input placeholder="Country in English" value={form.countryEn} onChange={e => set("countryEn", e.target.value)} />
        <Input placeholder="رمز الدولة (SA, EG, PK...)" value={form.countryCode} onChange={e => set("countryCode", e.target.value.toUpperCase())} />
        <Input placeholder="المدينة بالعربية" value={form.cityAr} onChange={e => set("cityAr", e.target.value)} />
        <Input placeholder="اسم الشركة بالعربية" value={form.companyNameAr} onChange={e => set("companyNameAr", e.target.value)} />
        <Input placeholder="Company Name" value={form.companyName} onChange={e => set("companyName", e.target.value)} />
        <ImageUpload value={form.companyLogoUrl} onChange={url => set("companyLogoUrl", url)} folder="hajj" label="شعار الشركة" aspectRatio="1/1" placeholder="ارفع شعار الشركة" />
        <ImageUpload value={form.imageUrl} onChange={url => set("imageUrl", url)} folder="hajj" label="صورة الباقة" aspectRatio="16/9" placeholder="ارفع صورة الباقة" />
        <Input placeholder="السعر بالدولار *" type="number" value={form.priceUSD || ""} onChange={e => set("priceUSD", Number(e.target.value))} />
        <Input placeholder="السعر بالريال" type="number" value={form.priceSAR || ""} onChange={e => set("priceSAR", Number(e.target.value))} />
        <Input placeholder="عدد الأيام" type="number" value={form.duration || ""} onChange={e => set("duration", Number(e.target.value))} />
        <Input placeholder="المقاعد المتاحة" type="number" value={form.seatsAvailable || ""} onChange={e => set("seatsAvailable", Number(e.target.value))} />
        <Input placeholder="فندق مكة" value={form.hotelMakkah} onChange={e => set("hotelMakkah", e.target.value)} />
        <Input placeholder="فندق المدينة" value={form.hotelMadinah} onChange={e => set("hotelMadinah", e.target.value)} />
        <Input placeholder="رقم التواصل" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} />
        <Input placeholder="واتساب" value={form.contactWhatsapp} onChange={e => set("contactWhatsapp", e.target.value)} />
        <Input placeholder="بريد إلكتروني" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
        <Textarea placeholder="وصف الباقة..." value={form.description} onChange={e => set("description", e.target.value)} rows={3} className="col-span-2" />
        <div className="flex gap-4 col-span-2">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={e => set("isFeatured", e.target.checked)} /><span className="text-sm">باقة مميزة</span></label>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isUrgent} onChange={e => set("isUrgent", e.target.checked)} /><span className="text-sm">عاجل / محدود</span></label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSubmit(form)} className={editing ? "bg-amber-600 text-white" : "bg-[var(--primary)] text-white"} disabled={!form.titleAr || !form.countryAr || form.priceUSD <= 0 || isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 ml-2" />{editing ? "حفظ التعديل" : "حفظ"}</>}
        </Button>
        <Button variant="outline" onClick={onCancel}>إلغاء</Button>
      </div>
    </div>
  );
}

function HajjInternationalAdmin() {
  const [intlTab, setIntlTab] = useState<"packages" | "bookings">("packages");
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingPkg, setEditingPkg] = useState<any>(null);
  const [editKey, setEditKey] = useState(0);
  const { data: pkgsData, refetch } = trpc.hajjInternational.list.useQuery({});
  const { data: countriesList } = trpc.hajjInternational.listCountries.useQuery();
  const createPkg = trpc.hajjInternational.add.useMutation({ onSuccess: () => { refetch(); setShowForm(false); toast.success("تم إضافة الباقة"); } });
  const updatePkg = trpc.hajjInternational.update.useMutation({ onSuccess: () => { refetch(); setEditingPkg(null); toast.success("تم تحديث الباقة"); } });
  const deletePkg = trpc.hajjInternational.delete.useMutation({ onSuccess: () => { refetch(); toast.success("تم حذف الباقة"); } });
  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-bold text-[var(--teal-800)]">إدارة حجاج الخارج</h2>
      <div className="flex gap-2">
        {([{ id: "packages", label: "✈️ برامج الحج الدولية" }, { id: "bookings", label: "📋 طلبات الحجز" }] as const).map(t => (
          <button key={t.id} onClick={() => setIntlTab(t.id)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${intlTab === t.id ? "bg-[var(--primary)] text-white" : "bg-gray-100 text-gray-600"}`}>{t.label}</button>
        ))}
      </div>
      {intlTab === "bookings" && <HajjBookingRequestsAdmin />}
      {intlTab === "packages" && <>
      {countriesList && countriesList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {countriesList.map(c => <Badge key={c.countryCode} className="bg-teal-50 text-teal-700 border-teal-200">{c.countryAr}</Badge>)}
        </div>
      )}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{pkgsData?.total ?? 0} باقة من {countriesList?.length ?? 0} دولة</p>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[var(--primary)] text-white"><Plus className="w-4 h-4 ml-2" />إضافة باقة</Button>
      </div>
      {showForm && (
        <div className="bg-white rounded-2xl border border-[var(--primary)]/30 p-5">
          <h3 className="font-bold text-[var(--teal-800)] mb-4">بيانات الباقة الجديدة</h3>
          <IntlPackageForm
            key={formKey}
            initialData={emptyIntlForm}
            editing={false}
            onSubmit={(data) => createPkg.mutate(data)}
            onCancel={() => setShowForm(false)}
            isSubmitting={createPkg.isPending}
          />
        </div>
      )}
      {editingPkg && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <h3 className="font-bold text-amber-800 mb-4">تعديل: {editingPkg.titleAr}</h3>
          <IntlPackageForm
            key={`edit-${editKey}`}
            initialData={editingPkg}
            editing={true}
            onSubmit={(data) => updatePkg.mutate({ packageId: editingPkg.packageId, ...data })}
            onCancel={() => setEditingPkg(null)}
            isSubmitting={updatePkg.isPending}
          />
        </div>
      )}
      {(!pkgsData?.packages || pkgsData.packages.length === 0) ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center"><Plane className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">لا توجد باقات مضافة بعد</p></div>
      ) : (
        <div className="space-y-3">
          {pkgsData.packages.map((pkg: any) => (
            <div key={pkg.id} className="bg-white rounded-2xl border border-[var(--border)] p-4 flex items-start gap-4">
              {pkg.imageUrl && <img src={pkg.imageUrl} alt="" className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[var(--teal-800)]">{pkg.titleAr}</span>
                  <Badge className="text-xs bg-teal-50 text-teal-700">{pkg.countryAr}{pkg.cityAr && ` — ${pkg.cityAr}`}</Badge>
                  {pkg.isFeatured && <Badge className="text-xs bg-amber-100 text-amber-700">مميز</Badge>}
                  {pkg.isUrgent && <Badge className="text-xs bg-red-100 text-red-700">عاجل</Badge>}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex gap-3 flex-wrap">
                  <span>السعر: ${pkg.priceUSD}</span>
                  {pkg.duration && <span>{pkg.duration} يوم</span>}
                  {pkg.companyNameAr && <span>الشركة: {pkg.companyNameAr}</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditingPkg(pkg)}><Edit className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => { if (confirm("حذف الباقة؟")) deletePkg.mutate({ packageId: pkg.packageId }); }}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      }
    </div>
  );
}

// ──// ─── Hajj Booking Requests Admin ──────────────────────────────────────────────
function HajjBookingRequestsAdmin() {
  const utils = trpc.useUtils();
  const { data: result, isLoading } = trpc.hajjBooking.list.useQuery({ limit: 100 });
  const requests = result?.rows ?? [];
  const updateMutation = trpc.hajjBooking.updateStatus.useMutation({
    onSuccess: () => { utils.hajjBooking.list.invalidate(); toast.success("تم تحديث حالة الطلب"); },
    onError: () => toast.error("حدث خطأ في التحديث"),
  });

  const statusColor = (s: string) => s === "confirmed" ? "bg-green-100 text-green-700" : s === "cancelled" ? "bg-red-100 text-red-700" : s === "reviewing" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";
  const statusLabel = (s: string) => s === "confirmed" ? "مؤكد" : s === "cancelled" ? "ملغى" : s === "reviewing" ? "قيد المراجعة" : "جديد";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-[var(--teal-800)]"> طلبات حج الخارج</h3>
          <p className="text-xs text-[var(--muted-foreground)]">مراجعة وإدارة طلبات الحج الواردة من حجاج الخارج</p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[var(--border)]">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)] text-sm">لا توجد طلبات حج حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[var(--teal-800)]">{req.fullName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(req.status)}`}>{statusLabel(req.status)}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-[var(--muted-foreground)] mt-2">
                    <span>📞 {req.phone}</span>
                    <span>📧 {req.email}</span>
                    <span>🌍 {req.country}</span>
                    <span>📅 {new Date(req.createdAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                  {req.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg p-2">{req.notes}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {req.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-3"
                        onClick={() => updateMutation.mutate({ id: req.id, status: "confirmed" })}>
                        <Check className="w-3 h-3 mr-1" /> تأكيد
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 text-xs h-8 px-3"
                        onClick={() => updateMutation.mutate({ id: req.id, status: "cancelled" })}>
                        <X className="w-3 h-3 mr-1" /> إلغاء
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Flexible Requests Admin ──────────────────────────────────────────────
function FlexibleRequestsAdmin() {
  const utils = trpc.useUtils();
  const { data: requests = [], isLoading } = trpc.flexibleRequest.list.useQuery({ limit: 100 });
  const { data: stats } = trpc.flexibleRequest.stats.useQuery();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: "reviewing" as any, adminNotes: "", quotedPrice: "" });

  const updateMutation = trpc.flexibleRequest.updateStatus.useMutation({
    onSuccess: () => {
      utils.flexibleRequest.list.invalidate();
      utils.flexibleRequest.stats.invalidate();
      setDialogOpen(false);
      toast.success("تم تحديث حالة الطلب");
    },
    onError: (e) => toast.error(e.message),
  });

  const SERVICE_LABELS: Record<string, string> = {
    hajj: "الحج", umrah: "العمرة", hotel: "الفندق", flight: "الرحلة",
    visa: "التأشيرة", transport: "المواصلات", tour: "الجولة", other: "أخرى",
  };
  const STATUS_COLORS: Record<string, string> = {
    new: "bg-amber-100 text-amber-700",
    reviewing: "bg-blue-100 text-blue-700",
    quoted: "bg-purple-100 text-purple-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const STATUS_LABELS: Record<string, string> = {
    new: "جديد", reviewing: "قيد المراجعة", quoted: "تم التسعير", confirmed: "مؤكد", cancelled: "ملغي",
  };

  const openDetail = (req: any) => {
    setSelectedRequest(req);
    setStatusForm({ status: req.status, adminNotes: req.adminNotes || "", quotedPrice: req.quotedPrice || "" });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>إدارة الطلبات المرنة</h2>
            <p className="text-xs text-[var(--muted-foreground)]">طلبات مخصصة من العملاء</p>
          </div>
        </div>
        <Link href="/flexible-request" target="_blank">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Eye className="w-3.5 h-3.5" />صفحة الطلب
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات", value: stats?.total ?? 0, color: "bg-[var(--teal-50)]", textColor: "text-[var(--primary)]" },
          { label: "جديدة", value: stats?.new ?? 0, color: "bg-amber-50", textColor: "text-amber-700" },
          { label: "قيد المراجعة", value: stats?.reviewing ?? 0, color: "bg-blue-50", textColor: "text-blue-700" },
          { label: "تم التسعير", value: stats?.quoted ?? 0, color: "bg-purple-50", textColor: "text-purple-700" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 border border-[var(--border)]`}>
            <div className={`text-2xl font-bold ${s.textColor}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>{s.value}</div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--teal-50)] flex items-center justify-between">
          <h3 className="font-bold text-[var(--teal-800)] text-sm">قائمة الطلبات</h3>
          <Badge className="bg-[var(--teal-100)] text-[var(--teal-700)] text-xs">{requests.length} طلب</Badge>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" /></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <HeartHandshake className="w-10 h-10 text-[var(--teal-200)] mx-auto mb-3" />
            <p className="text-[var(--muted-foreground)] text-sm">لا توجد طلبات مرنة بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--teal-50)]/50">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)] text-xs">العميل</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)] text-xs">الخدمة</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)] text-xs">الوجهة</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)] text-xs">تاريخ السفر</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)] text-xs">الميزانية</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)] text-xs">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)] text-xs">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req: any) => (
                  <tr key={req.id} className="border-t border-[var(--border)] hover:bg-[var(--teal-50)]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[var(--teal-800)] text-xs">{req.customerName}</div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">{req.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="text-xs bg-[var(--teal-50)] text-[var(--teal-700)] border border-[var(--teal-200)]">{SERVICE_LABELS[req.serviceType] || req.serviceType}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{req.destination || req.departureCity || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{req.travelDate || "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      {req.budgetMin || req.budgetMax ? (
                        <span className="font-medium text-[var(--teal-700)]">{req.budgetMin || "—"}–{req.budgetMax || "—"} {req.currency}</span>
                      ) : <span className="text-[var(--muted-foreground)]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${STATUS_COLORS[req.status] || "bg-gray-100 text-gray-700"}`}>{STATUS_LABELS[req.status] || req.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" onClick={() => openDetail(req)} className="text-xs h-7 px-2 gap-1">
                        <Eye className="w-3 h-3" />عرض
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Tajawal', sans-serif" }}>تفاصيل الطلب</DialogTitle>
            <DialogDescription className="text-xs">رقم الطلب: {selectedRequest?.requestId}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[var(--teal-50)] rounded-xl p-3">
                  <div className="text-xs text-[var(--muted-foreground)] mb-0.5">العميل</div>
                  <div className="font-semibold text-[var(--teal-800)]">{selectedRequest.customerName}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{selectedRequest.customerPhone}</div>
                  {selectedRequest.customerEmail && <div className="text-xs text-[var(--muted-foreground)]">{selectedRequest.customerEmail}</div>}
                </div>
                <div className="bg-[var(--teal-50)] rounded-xl p-3">
                  <div className="text-xs text-[var(--muted-foreground)] mb-0.5">تفاصيل الرحلة</div>
                  <div className="font-semibold text-[var(--teal-800)]">{SERVICE_LABELS[selectedRequest.serviceType]}</div>
                  {selectedRequest.departureCity && <div className="text-xs">من: {selectedRequest.departureCity}</div>}
                  {selectedRequest.destination && <div className="text-xs">إلى: {selectedRequest.destination}</div>}
                  {selectedRequest.travelDate && <div className="text-xs">تاريخ: {selectedRequest.travelDate}</div>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-[var(--teal-50)] rounded-lg">
                  <div className="font-bold text-[var(--teal-800)]">{selectedRequest.adults}</div>
                  <div className="text-[var(--muted-foreground)]">بالغ</div>
                </div>
                <div className="text-center p-2 bg-[var(--teal-50)] rounded-lg">
                  <div className="font-bold text-[var(--teal-800)]">{selectedRequest.children}</div>
                  <div className="text-[var(--muted-foreground)]">أطفال</div>
                </div>
                <div className="text-center p-2 bg-[var(--teal-50)] rounded-lg">
                  <div className="font-bold text-[var(--teal-800)]">{selectedRequest.hotelStars ? `${selectedRequest.hotelStars}★` : "—"}</div>
                  <div className="text-[var(--muted-foreground)]">الفندق</div>
                </div>
              </div>
              {selectedRequest.specialRequirements && (
                <div className="text-sm">
                  <div className="text-xs text-[var(--muted-foreground)] mb-1">متطلبات خاصة</div>
                  <div className="bg-[var(--teal-50)] rounded-xl p-3 text-[var(--teal-800)]">{selectedRequest.specialRequirements}</div>
                </div>
              )}
              <div className="border-t border-[var(--border)] pt-4 space-y-3">
                <h4 className="font-semibold text-[var(--teal-800)] text-sm">تحديث الحالة</h4>
                <div>
                  <Label className="text-xs mb-1 block">الحالة</Label>
                  <select
                    value={statusForm.status}
                    onChange={e => setStatusForm(f => ({ ...f, status: e.target.value as any }))}
                    className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm bg-white outline-none focus:border-[var(--teal-400)]"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    <option value="new">جديد</option>
                    <option value="reviewing">قيد المراجعة</option>
                    <option value="quoted">تم التسعير</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">سعر العرض (USD)</Label>
                  <Input
                    type="number"
                    value={statusForm.quotedPrice}
                    onChange={e => setStatusForm(f => ({ ...f, quotedPrice: e.target.value }))}
                    placeholder="أدخل سعر العرض..."
                    className="rounded-xl border-[var(--border)]"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">ملاحظات المشرف</Label>
                  <Textarea
                    value={statusForm.adminNotes}
                    onChange={e => setStatusForm(f => ({ ...f, adminNotes: e.target.value }))}
                    placeholder="أضف ملاحظات..."
                    className="rounded-xl border-[var(--border)] resize-none text-sm"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={() => updateMutation.mutate({ id: selectedRequest.id, ...statusForm, quotedPrice: statusForm.quotedPrice ? Number(statusForm.quotedPrice) : undefined })}
                  disabled={updateMutation.isPending}
                  className="w-full bg-[var(--primary)] text-white rounded-xl gap-2"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  حفظ التغييرات
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}// ─── Provider Applications Admin ─────────────────────────────────────────────────────────────────────────────────────
function ProviderApplicationsAdmin() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected" | "under_review">("under_review");
  const { data: apps, isLoading, refetch } = trpc.providerApplication.adminList.useQuery({ status: statusFilter === "all" ? undefined : statusFilter });
  const { data: stats } = trpc.providerApplication.adminStats.useQuery();
  const utils = trpc.useUtils();
  const reviewMutation = trpc.providerApplication.adminReview.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الطلب بنجاح");
      setSelectedApp(null);
      utils.providerApplication.adminList.invalidate();
      utils.providerApplication.adminStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: "قيد الانتظار", className: "bg-amber-100 text-amber-700 border-amber-200" },
      under_review: { label: "قيد المراجعة", className: "bg-blue-100 text-blue-700 border-blue-200" },
      approved: { label: "موافق عليه", className: "bg-green-100 text-green-700 border-green-200" },
      rejected: { label: "مرفوض", className: "bg-red-100 text-red-700 border-red-200" },
    };
    const cfg = map[status] || { label: status, className: "bg-gray-100 text-gray-700" };
    return <Badge className={`text-xs border ${cfg.className}`}>{cfg.label}</Badge>;
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>طلبات انضمام المزودين</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">مراجعة واعتماد طلبات الشركات والوكالات</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4" />تحديث
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات", value: stats?.total ?? 0, color: "bg-[var(--teal-500)]" },
          { label: "قيد الانتظار", value: stats?.pending ?? 0, color: "bg-amber-500" },
          { label: "تمت الموافقة", value: stats?.approved ?? 0, color: "bg-green-500" },
          { label: "مرفوضة", value: stats?.rejected ?? 0, color: "bg-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-[var(--teal-800)]">{s.value}</div>
            <div className="text-xs text-[var(--muted-foreground)]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="جميع الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="under_review">قيد المراجعة</SelectItem>
            <SelectItem value="approved">موافق عليها</SelectItem>
            <SelectItem value="rejected">مرفوضة</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-[var(--muted-foreground)]">{apps?.length ?? 0} طلب</span>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--teal-500)]" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--teal-50)] border-b">
              <tr>
                <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">اسم الشركة</th>
                <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">المسؤول</th>
                <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">التواصل</th>
                <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">الخدمات</th>
                <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">الحالة</th>
                <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">التاريخ</th>
                <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(apps ?? []).map((app: any) => (
                <tr key={app.id} className="hover:bg-[var(--teal-50)]/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm text-[var(--teal-800)]">{app.companyName}</div>
                    {app.companyNameAr && <div className="text-xs text-[var(--muted-foreground)]">{app.companyNameAr}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{app.contactName}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{app.user?.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">{app.contactPhone}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{app.contactEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(app.serviceTypes as string[] || []).slice(0, 2).map((s: string) => (
                        <Badge key={s} variant="outline" className="text-[10px] px-1.5">{s}</Badge>
                      ))}
                      {(app.serviceTypes as string[] || []).length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5">+{(app.serviceTypes as string[]).length - 2}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{statusBadge(app.status)}</td>
                  <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                    {new Date(app.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedApp(app); setReviewNotes(app.adminNotes || ""); setReviewStatus("under_review"); }} className="gap-1 text-xs">
                      <Eye className="w-3 h-3" />مراجعة
                    </Button>
                  </td>
                </tr>
              ))}
              {(apps ?? []).length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-[var(--muted-foreground)]"><Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />لا توجد طلبات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-[var(--teal-800)]">مراجعة طلب الانضمام</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--teal-50)] rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">اسم الشركة</p>
                  <p className="font-semibold text-sm">{selectedApp.companyName}</p>
                  {selectedApp.companyNameAr && <p className="text-xs text-[var(--muted-foreground)]">{selectedApp.companyNameAr}</p>}
                </div>
                <div className="bg-[var(--teal-50)] rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">نوع الشركة</p>
                  <p className="font-semibold text-sm">{selectedApp.companyType || "-"}</p>
                </div>
                <div className="bg-[var(--teal-50)] rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">المسؤول</p>
                  <p className="font-semibold text-sm">{selectedApp.contactName}</p>
                  <p className="text-xs">{selectedApp.contactEmail}</p>
                </div>
                <div className="bg-[var(--teal-50)] rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">الهاتف</p>
                  <p className="font-semibold text-sm">{selectedApp.contactPhone}</p>
                  {selectedApp.contactWhatsapp && <p className="text-xs">واتسآب: {selectedApp.contactWhatsapp}</p>}
                </div>
                <div className="bg-[var(--teal-50)] rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">رقم الترخيص</p>
                  <p className="font-semibold text-sm">{selectedApp.licenseNumber || "-"}</p>
                  {selectedApp.licenseExpiry && <p className="text-xs">ينتهي: {selectedApp.licenseExpiry}</p>}
                </div>
                <div className="bg-[var(--teal-50)] rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">الموقع</p>
                  <p className="font-semibold text-sm">{selectedApp.city}, {selectedApp.country}</p>
                  {selectedApp.website && <a href={selectedApp.website} target="_blank" className="text-xs text-[var(--primary)] hover:underline">{selectedApp.website}</a>}
                </div>
              </div>
              {selectedApp.description && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">وصف الشركة</p>
                  <p className="text-sm">{selectedApp.description}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {(selectedApp.serviceTypes as string[] || []).map((s: string) => (
                  <Badge key={s} className="bg-[var(--teal-50)] text-[var(--teal-700)] border-[var(--teal-200)]">{s}</Badge>
                ))}
              </div>
              <div className="border-t pt-4 space-y-3">
                <Label className="text-sm font-semibold">قرار المراجعة</Label>
                <div className="flex gap-3">
                  {(["approved", "under_review", "rejected"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setReviewStatus(s)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        reviewStatus === s
                          ? s === "approved" ? "border-green-500 bg-green-50 text-green-700"
                          : s === "rejected" ? "border-red-500 bg-red-50 text-red-700"
                          : "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-border text-[var(--muted-foreground)] hover:border-[var(--teal-300)]"
                      }`}
                    >
                      {s === "approved" ? "✔ موافقة" : s === "rejected" ? "✖ رفض" : "🔍 قيد المراجعة"}
                    </button>
                  ))}
                </div>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="ملاحظات المراجعة (اختياري - تظهر للمتقدم عند الرفض)"
                  className="min-h-[80px]"
                  dir="rtl"
                />
                {reviewStatus === "approved" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                    ⚠️ سيتم تلقائياً ترقية دور المستخدم إلى <strong>مزود خدمة</strong> وإنشاء ملف شركته تلقائياً.
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedApp(null)}>إلغاء</Button>
            <Button
              onClick={() => reviewMutation.mutate({ id: selectedApp.id, status: reviewStatus, adminNotes: reviewNotes || undefined })}
              disabled={reviewMutation.isPending}
              className={reviewStatus === "approved" ? "bg-green-600 text-white" : reviewStatus === "rejected" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}
            >
              {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ القرار
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Roles & Permissions Admin ─────────────────────────────────────────────────────────────────────────────────────
function RolesPermissionsAdmin() {
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [permissionsUser, setPermissionsUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRole, setNewRole] = useState({ name: "", nameAr: "", description: "", color: "#6B7280" });
  const [userPermissions, setUserPermissions] = useState<Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }>>({});

  const { data: roles, isLoading: rolesLoading } = trpc.rolesPermissions.listRoles.useQuery();
  const { data: sections } = trpc.rolesPermissions.listSections.useQuery();
  const { data: usersWithPerms, isLoading: usersLoading } = trpc.rolesPermissions.listUsersWithPermissions.useQuery({ search: searchQuery || undefined });
  const { data: selectedUserPerms } = trpc.rolesPermissions.getUserPermissions.useQuery(
    { userId: permissionsUser?.id ?? 0 },
    { enabled: !!permissionsUser }
  );

  const utils = trpc.useUtils();
  const createRoleMutation = trpc.rolesPermissions.createRole.useMutation({
    onSuccess: () => { toast.success("تم إنشاء الدور بنجاح"); setCreateRoleOpen(false); setNewRole({ name: "", nameAr: "", description: "", color: "#6B7280" }); utils.rolesPermissions.listRoles.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const updateRoleMutation = trpc.rolesPermissions.updateRole.useMutation({
    onSuccess: () => { toast.success("تم تحديث الدور"); setEditRoleOpen(false); utils.rolesPermissions.listRoles.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteRoleMutation = trpc.rolesPermissions.deleteRole.useMutation({
    onSuccess: () => { toast.success("تم حذف الدور"); utils.rolesPermissions.listRoles.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const updateRoleMut = trpc.rolesPermissions.updateUserRole.useMutation({
    onSuccess: () => { toast.success("تم تحديث الدور"); utils.rolesPermissions.listUsersWithPermissions.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const setPermsMutation = trpc.rolesPermissions.setUserPermissions.useMutation({
    onSuccess: () => { toast.success("تم حفظ الصلاحيات"); setPermissionsUser(null); utils.rolesPermissions.listUsersWithPermissions.invalidate(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteUserMutation = trpc.rolesPermissions.deleteUser.useMutation({
    onSuccess: () => { toast.success("تم حذف المستخدم"); utils.rolesPermissions.listUsersWithPermissions.invalidate(); },
    onError: (err) => toast.error(err.message),
  });

  // Initialize userPermissions from selectedUserPerms when they load
  const initPerms = (perms: any[]) => {
    const map: Record<string, any> = {};
    (sections ?? []).forEach((s: any) => {
      const found = perms.find((p: any) => p.section === s.key);
      map[s.key] = found
        ? { canView: found.canView, canCreate: found.canCreate, canEdit: found.canEdit, canDelete: found.canDelete }
        : { canView: false, canCreate: false, canEdit: false, canDelete: false };
    });
    setUserPermissions(map);
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700 border-red-200",
    provider: "bg-teal-100 text-teal-700 border-teal-200",
    user: "bg-gray-100 text-gray-700 border-gray-200",
    supervisor: "bg-purple-100 text-purple-700 border-purple-200",
    sales: "bg-amber-100 text-amber-700 border-amber-200",
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>الأدوار والصلاحيات</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">إدارة أدوار المستخدمين وصلاحياتهم على كل قسم</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="roles">إدارة الأدوار</TabsTrigger>
          <TabsTrigger value="users">صلاحيات المستخدمين</TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--teal-800)]">الأدوار المتاحة</h3>
            <Button onClick={() => setCreateRoleOpen(true)} className="bg-[var(--primary)] text-white gap-2" size="sm">
              <Plus className="w-4 h-4" />إضافة دور
            </Button>
          </div>
          {rolesLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(roles ?? []).map((role: any) => (
                <div key={role.id} className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: role.color + "20" }}>
                        <Shield className="w-4 h-4" style={{ color: role.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{role.nameAr || role.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{role.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="w-7 h-7 p-0" onClick={() => { setEditingRole({ ...role }); setEditRoleOpen(true); }}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      {!role.isSystem && (
                        <Button size="sm" variant="ghost" className="w-7 h-7 p-0 text-red-500 hover:text-red-600" onClick={() => { if (confirm("حذف هذا الدور?")) deleteRoleMutation.mutate({ id: role.id }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {role.description && <p className="text-xs text-[var(--muted-foreground)] mb-2">{role.description}</p>}
                  {role.isSystem && <Badge className="text-[10px] bg-gray-100 text-gray-600 border-gray-200">نظام أساسي</Badge>}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Users Permissions Tab */}
        <TabsContent value="users">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="بحث عن مستخدم..." className="pr-9" />
              </div>
            </div>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[var(--teal-50)] border-b">
                    <tr>
                      <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">المستخدم</th>
                      <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">الدور</th>
                      <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">الصلاحيات المخصصة</th>
                      <th className="text-right text-xs font-semibold text-[var(--teal-700)] px-4 py-3">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(usersWithPerms ?? []).map((u: any) => (
                      <tr key={u.id} className="hover:bg-[var(--teal-50)]/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-sm">{u.name}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Select value={u.role} onValueChange={(v) => updateRoleMut.mutate({ userId: u.id, role: v as any })}>
                            <SelectTrigger className="h-8 w-36 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">مستخدم عادي</SelectItem>
                              <SelectItem value="provider">مزود خدمة</SelectItem>
                              <SelectItem value="admin">مدير النظام</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {u.permissions?.length > 0 ? `${u.permissions.length} قسم مخصص` : "لا توجد صلاحيات مخصصة"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => { setPermissionsUser(u); if (u.permissions) initPerms(u.permissions); }}>
                              <Shield className="w-3 h-3" />صلاحيات
                            </Button>
                            <Button size="sm" variant="ghost" className="w-7 h-7 p-0 text-red-500 hover:text-red-600" onClick={() => { if (confirm(`حذف ${u.name}?`)) deleteUserMutation.mutate({ userId: u.id }); }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>إضافة دور جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>اسم الدور (إنجليزي) *</Label><Input value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} placeholder="e.g. supervisor" className="mt-1" /></div>
            <div><Label>اسم الدور (عربي)</Label><Input value={newRole.nameAr} onChange={(e) => setNewRole({ ...newRole, nameAr: e.target.value })} placeholder="مشرف" className="mt-1" dir="rtl" /></div>
            <div><Label>وصف</Label><Input value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} placeholder="وصف مختصر للدور" className="mt-1" /></div>
            <div><Label>لون الدور</Label><div className="flex items-center gap-2 mt-1"><input type="color" value={newRole.color} onChange={(e) => setNewRole({ ...newRole, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" /><span className="text-sm text-[var(--muted-foreground)]">{newRole.color}</span></div></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRoleOpen(false)}>إلغاء</Button>
            <Button onClick={() => createRoleMutation.mutate(newRole)} disabled={!newRole.name || createRoleMutation.isPending} className="bg-[var(--primary)] text-white">
              {createRoleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>تعديل الدور</DialogTitle></DialogHeader>
          {editingRole && (
            <div className="space-y-3">
              <div><Label>اسم الدور (عربي)</Label><Input value={editingRole.nameAr || ""} onChange={(e) => setEditingRole({ ...editingRole, nameAr: e.target.value })} className="mt-1" dir="rtl" /></div>
              <div><Label>وصف</Label><Input value={editingRole.description || ""} onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })} className="mt-1" /></div>
              <div><Label>لون</Label><div className="flex items-center gap-2 mt-1"><input type="color" value={editingRole.color || "#6B7280"} onChange={(e) => setEditingRole({ ...editingRole, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" /></div></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleOpen(false)}>إلغاء</Button>
            <Button onClick={() => updateRoleMutation.mutate({ id: editingRole.id, nameAr: editingRole.nameAr, description: editingRole.description, color: editingRole.color })} disabled={updateRoleMutation.isPending} className="bg-[var(--primary)] text-white">
              {updateRoleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={!!permissionsUser} onOpenChange={() => setPermissionsUser(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>صلاحيات: {permissionsUser?.name}</DialogTitle>
            <DialogDescription className="text-xs">حدد صلاحيات المستخدم لكل قسم من أقسام المنصة</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {/* Header row */}
            <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-[var(--teal-50)] rounded-lg">
              <div className="col-span-1 text-xs font-semibold text-[var(--teal-700)]">القسم</div>
              {["عرض", "إضافة", "تعديل", "حذف"].map(h => (
                <div key={h} className="text-center text-xs font-semibold text-[var(--teal-700)]">{h}</div>
              ))}
            </div>
            {(sections ?? []).map((sec: any) => {
              const p = userPermissions[sec.key] || { canView: false, canCreate: false, canEdit: false, canDelete: false };
              const toggle = (field: string) => setUserPermissions(prev => ({
                ...prev,
                [sec.key]: { ...p, [field]: !(p as any)[field] },
              }));
              return (
                <div key={sec.key} className="grid grid-cols-5 gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-[var(--border)]">
                  <div className="col-span-1 text-sm font-medium text-[var(--teal-800)] flex items-center">{sec.label}</div>
                  {["canView", "canCreate", "canEdit", "canDelete"].map(field => (
                    <div key={field} className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => toggle(field)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          (p as any)[field]
                            ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                            : "border-gray-300 hover:border-[var(--primary)]"
                        }`}
                      >
                        {(p as any)[field] && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPermissionsUser(null)}>إلغاء</Button>
            <Button
              onClick={() => setPermsMutation.mutate({
                userId: permissionsUser.id,
                permissions: Object.entries(userPermissions).map(([section, p]) => ({ section, ...p })),
              })}
              disabled={setPermsMutation.isPending}
              className="bg-[var(--primary)] text-white"
            >
              {setPermsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ الصلاحيات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Hero Ads Admin ──────────────────────────────────────────────────────────
function HeroAdsAdmin() {
  const utils = trpc.useUtils();
  const { data: ads = [], isLoading } = trpc.heroAds.listAll.useQuery();
  const createMutation = trpc.heroAds.create.useMutation({ onSuccess: () => { utils.heroAds.listAll.invalidate(); utils.heroAds.list.invalidate(); setDialogOpen(false); toast.success("تم إضافة الإعلان"); } });
  const updateMutation = trpc.heroAds.update.useMutation({ onSuccess: () => { utils.heroAds.listAll.invalidate(); utils.heroAds.list.invalidate(); setDialogOpen(false); toast.success("تم تحديث الإعلان"); } });
  const deleteMutation = trpc.heroAds.delete.useMutation({ onSuccess: () => { utils.heroAds.listAll.invalidate(); utils.heroAds.list.invalidate(); toast.success("تم حذف الإعلان"); } });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const emptyForm = { title: "", subtitle: "", mediaUrl: "", mediaType: "image" as "image" | "video", linkUrl: "", linkLabel: "", sortOrder: 0, isActive: true };
  const [form, setForm] = useState(emptyForm);
  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (ad: any) => { setEditing(ad); setForm({ title: ad.title, subtitle: ad.subtitle || "", mediaUrl: ad.mediaUrl, mediaType: ad.mediaType, linkUrl: ad.linkUrl || "", linkLabel: ad.linkLabel || "", sortOrder: ad.sortOrder, isActive: ad.isActive }); setDialogOpen(true); };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, subtitle: form.subtitle || undefined, linkUrl: form.linkUrl || undefined, linkLabel: form.linkLabel || undefined };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>إعلانات الهيرو</h2>
        <Button onClick={openAdd} className="bg-[var(--primary)] text-white gap-2"><Plus className="w-4 h-4" />إضافة إعلان</Button>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(ads as any[]).map((ad: any) => (
            <div key={ad.id} className="bg-white rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
              <div className="relative h-40 bg-gray-100">
                {ad.mediaType === "video" ? <video src={ad.mediaUrl} className="w-full h-full object-cover" muted /> : <img src={ad.mediaUrl} alt={ad.title} className="w-full h-full object-cover" />}
                <div className="absolute top-2 left-2"><Badge className={ad.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{ad.isActive ? "نشط" : "معطل"}</Badge></div>
                <div className="absolute top-2 right-2"><Badge variant="outline" className="bg-white/80 text-xs">الترتيب: {ad.sortOrder}</Badge></div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-[var(--teal-800)] text-sm">{ad.title}</p>
                {ad.subtitle && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{ad.subtitle}</p>}
                {ad.linkUrl && <p className="text-xs text-blue-600 mt-1 truncate">{ad.linkUrl}</p>}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(ad)} className="flex-1 gap-1"><Edit className="w-3 h-3" />تعديل</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate({ id: ad.id })} className="text-red-500 hover:bg-red-50 gap-1"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>
          ))}
          {(ads as any[]).length === 0 && <div className="col-span-3 text-center py-12 text-[var(--muted-foreground)]">لا توجد إعلانات حتى الآن</div>}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editing ? "تعديل إعلان" : "إضافة إعلان جديد"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><Label>عنوان الإعلان *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="mt-1" /></div>
            <div><Label>عنوان فرعي</Label><Input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="mt-1" /></div>
            <div><Label>رابط الصورة/الفيديو *</Label><Input value={form.mediaUrl} onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))} placeholder="https://..." required className="mt-1" /></div>
            <div><Label>نوع الوسيط</Label>
              <Select value={form.mediaType} onValueChange={v => setForm(f => ({ ...f, mediaType: v as "image" | "video" }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="image">صورة</SelectItem><SelectItem value="video">فيديو</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>رابط الإعلان</Label><Input value={form.linkUrl} onChange={e => setForm(f => ({ ...f, linkUrl: e.target.value }))} placeholder="/hajj" className="mt-1" /></div>
              <div><Label>نص الزر</Label><Input value={form.linkLabel} onChange={e => setForm(f => ({ ...f, linkLabel: e.target.value }))} placeholder="اكتشف المزيد" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>الترتيب</Label><Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: +e.target.value }))} className="mt-1" /></div>
              <div className="flex items-center gap-2 mt-6"><input type="checkbox" id="ad-active" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" /><Label htmlFor="ad-active">نشط</Label></div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
              <Button type="submit" className="bg-[var(--primary)] text-white" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? "حفظ" : "إضافة"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Search Settings Admin ────────────────────────────────────────────────────
function SearchSettingsAdmin() {
  const utils = trpc.useUtils();
  const { data: fields = [], isLoading } = trpc.searchConfig.listAll.useQuery();
  const updateMutation = trpc.searchConfig.update.useMutation({ onSuccess: () => { utils.searchConfig.listAll.invalidate(); toast.success("تم تحديث الحقل"); } });
  const deleteMutation = trpc.searchConfig.delete.useMutation({ onSuccess: () => { utils.searchConfig.listAll.invalidate(); toast.success("تم حذف الحقل"); } });
  const createMutation = trpc.searchConfig.create.useMutation({ onSuccess: () => { utils.searchConfig.listAll.invalidate(); setAddOpen(false); toast.success("تم إضافة الحقل"); } });
  const [addOpen, setAddOpen] = useState(false);
  const [newField, setNewField] = useState({ serviceTab: "hajj", fieldKey: "", labelAr: "", labelEn: "", fieldType: "text" as "text" | "select" | "date" | "number" | "city", placeholder: "", sortOrder: 0 });
  const TABS = ["hajj", "umrah", "hotels", "flights", "visa", "transport", "tours"];
  const TAB_LABELS: Record<string, string> = { hajj: "الحج", umrah: "العمرة", hotels: "الفنادق", flights: "الرحلات", visa: "التأشيرة", transport: "المواصلات", tours: "الجولات" };
  const FIELD_TYPE_LABELS: Record<string, string> = { text: "نص", select: "قائمة", date: "تاريخ", number: "رقم", city: "مدينة" };
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>إعدادات محرك البحث</h2>
        <Button onClick={() => setAddOpen(true)} className="bg-[var(--primary)] text-white gap-2"><Plus className="w-4 h-4" />إضافة حقل</Button>
      </div>
      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" /></div> : (
        <Tabs defaultValue="hajj" dir="rtl">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            {TABS.map(tab => <TabsTrigger key={tab} value={tab}>{TAB_LABELS[tab]}</TabsTrigger>)}
          </TabsList>
          {TABS.map(tab => (
            <TabsContent key={tab} value={tab}>
              <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[var(--teal-50)] border-b border-[var(--border)]">
                    <th className="text-right px-4 py-3 text-[var(--teal-700)] font-semibold">التسمية بالعربية</th>
                    <th className="text-right px-4 py-3 text-[var(--teal-700)] font-semibold">التسمية بالإنجليزية</th>
                    <th className="text-right px-4 py-3 text-[var(--teal-700)] font-semibold">النوع</th>
                    <th className="text-right px-4 py-3 text-[var(--teal-700)] font-semibold">الترتيب</th>
                    <th className="text-right px-4 py-3 text-[var(--teal-700)] font-semibold">مفعّل</th>
                    <th className="px-4 py-3"></th>
                  </tr></thead>
                  <tbody>
                    {(fields as any[]).filter((f: any) => f.serviceTab === tab).map((field: any) => (
                      <tr key={field.id} className="border-b border-[var(--border)] hover:bg-[var(--teal-50)]/30">
                        <td className="px-4 py-3"><Input defaultValue={field.labelAr} onBlur={e => { if (e.target.value !== field.labelAr) updateMutation.mutate({ id: field.id, data: { labelAr: e.target.value } }); }} className="h-8 text-sm" /></td>
                        <td className="px-4 py-3"><Input defaultValue={field.labelEn} onBlur={e => { if (e.target.value !== field.labelEn) updateMutation.mutate({ id: field.id, data: { labelEn: e.target.value } }); }} className="h-8 text-sm" /></td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{FIELD_TYPE_LABELS[field.fieldType] || field.fieldType}</Badge></td>
                        <td className="px-4 py-3"><Input type="number" defaultValue={field.sortOrder} onBlur={e => { if (+e.target.value !== field.sortOrder) updateMutation.mutate({ id: field.id, data: { sortOrder: +e.target.value } }); }} className="h-8 text-sm w-16" /></td>
                        <td className="px-4 py-3"><input type="checkbox" checked={field.isEnabled} onChange={e => updateMutation.mutate({ id: field.id, data: { isEnabled: e.target.checked } })} className="w-4 h-4 accent-[var(--primary)]" /></td>
                        <td className="px-4 py-3"><Button size="sm" variant="outline" onClick={() => deleteMutation.mutate({ id: field.id })} className="text-red-500 hover:bg-red-50 h-7 w-7 p-0"><Trash2 className="w-3 h-3" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>إضافة حقل بحث جديد</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); createMutation.mutate(newField); }} className="space-y-3">
            <div><Label>التبويب</Label>
              <Select value={newField.serviceTab} onValueChange={v => setNewField(f => ({ ...f, serviceTab: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{TABS.map(t => <SelectItem key={t} value={t}>{TAB_LABELS[t]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>التسمية بالعربية *</Label><Input value={newField.labelAr} onChange={e => setNewField(f => ({ ...f, labelAr: e.target.value }))} required className="mt-1" /></div>
              <div><Label>التسمية بالإنجليزية *</Label><Input value={newField.labelEn} onChange={e => setNewField(f => ({ ...f, labelEn: e.target.value }))} required className="mt-1" /></div>
            </div>
            <div><Label>مفتاح الحقل *</Label><Input value={newField.fieldKey} onChange={e => setNewField(f => ({ ...f, fieldKey: e.target.value }))} placeholder="city, date, persons..." required className="mt-1" /></div>
            <div><Label>نوع الحقل</Label>
              <Select value={newField.fieldType} onValueChange={v => setNewField(f => ({ ...f, fieldType: v as any }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>نص توضيحي</Label><Input value={newField.placeholder} onChange={e => setNewField(f => ({ ...f, placeholder: e.target.value }))} className="mt-1" /></div>
              <div><Label>الترتيب</Label><Input type="number" value={newField.sortOrder} onChange={e => setNewField(f => ({ ...f, sortOrder: +e.target.value }))} className="mt-1" /></div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>إلغاء</Button>
              <Button type="submit" className="bg-[var(--primary)] text-white" disabled={createMutation.isPending}>إضافة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [section, setSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--teal-500)]" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--teal-800)] mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            Admin Access Required
          </h2>
          <p className="text-[var(--muted-foreground)] text-sm mb-6">
            This area is restricted to administrators only. Please log in with an admin account.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            <Button className="bg-[var(--primary)] text-white" onClick={() => window.location.href = "/login"}>
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

// ─── Site Settings Admin ─────────────────────────────────────────────────────
function SiteSettingsAdmin() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.siteSettings.getAdminSettings.useQuery();
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [launchDate, setLaunchDate] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Initialize form from server data
  if (settings && !initialized) {
    setMessage(settings.message);
    setTitle(settings.title);
    // Convert stored ISO string to local datetime-local format
    if (settings.launchDate) {
      const d = new Date(settings.launchDate);
      const pad = (n: number) => String(n).padStart(2, "0");
      setLaunchDate(`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
    }
    setInitialized(true);
  }

  const toggleMut = trpc.siteSettings.toggleSite.useMutation({
    onSuccess: (data) => {
      toast.success(data.isOpen ? "تم فتح الموقع بنجاح" : "تم غلق الموقع بنجاح");
      utils.siteSettings.getAdminSettings.invalidate();
      utils.siteSettings.getStatus.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMut = trpc.siteSettings.updateMessage.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الرسالة بنجاح");
      utils.siteSettings.getAdminSettings.invalidate();
      utils.siteSettings.getStatus.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const launchDateMut = trpc.siteSettings.setLaunchDate.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ تاريخ الإطلاق بنجاح");
      utils.siteSettings.getAdminSettings.invalidate();
      utils.siteSettings.getStatus.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;

  const isOpen = settings?.isOpen ?? true;

  return (
    <div className="space-y-6 max-w-2xl" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>إعدادات الموقع</h2>
        <p className="text-muted-foreground text-sm mt-1">تحكم في حالة الموقع ورسالة صفحة الغلق</p>
      </div>

      {/* Site Status Toggle */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">حالة الموقع</h3>
            <p className="text-sm text-muted-foreground">عند الغلق، تظهر صفحة القريباً لجميع الزوار (عدا المدير)</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
            isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
            {isOpen ? "مفتوح" : "مغلق"}
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => toggleMut.mutate({ isOpen: true })}
            disabled={isOpen || toggleMut.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            {toggleMut.isPending && toggleMut.variables?.isOpen ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            فتح الموقع
          </Button>
          <Button
            onClick={() => toggleMut.mutate({ isOpen: false })}
            disabled={!isOpen || toggleMut.isPending}
            variant="destructive"
            className="flex-1 gap-2"
          >
            {toggleMut.isPending && !toggleMut.variables?.isOpen ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            غلق الموقع
          </Button>
        </div>
        {!isOpen && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            ⚠️ الموقع مغلق حالياً. سيظهر للزوار صفحة الغلق المتحركة.
          </div>
        )}
      </div>

      {/* Maintenance Message */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4">رسالة صفحة الغلق</h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-1 block">عنوان الصفحة (اختياري)</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="قريباً..."
              className="text-right"
            />
          </div>
          <div>
            <Label className="mb-1 block">الرسالة الرئيسية *</Label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="انتظروا منصة جو عمرة في حلتها الجديدة"
              rows={3}
              className="text-right"
            />
          </div>
          <Button
            onClick={() => updateMut.mutate({ message, title })}
            disabled={updateMut.isPending || !message.trim()}
            className="gap-2 bg-[var(--primary)] text-white"
          >
            {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ الرسالة
          </Button>
        </div>
      </div>

      {/* Launch Date Countdown */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-1">تاريخ الإطلاق</h3>
        <p className="text-sm text-muted-foreground mb-4">حدد تاريخ ووقت الإطلاق ليظهر العداد التنازلي في صفحة الغلق</p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label className="mb-1 block">تاريخ ووقت الإطلاق</Label>
            <input
              type="datetime-local"
              value={launchDate}
              onChange={e => setLaunchDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <Button
            onClick={() => {
              const isoDate = launchDate ? new Date(launchDate).toISOString() : null;
              launchDateMut.mutate({ launchDate: isoDate });
            }}
            disabled={launchDateMut.isPending}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold"
          >
            {launchDateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ
          </Button>
          {settings?.launchDate && (
            <Button
              variant="outline"
              onClick={() => { setLaunchDate(""); launchDateMut.mutate({ launchDate: null }); }}
              disabled={launchDateMut.isPending}
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              حذف
            </Button>
          )}
        </div>
        {settings?.launchDate && (
          <p className="text-xs text-muted-foreground mt-2">
            تاريخ الإطلاق الحالي: {new Date(settings.launchDate).toLocaleString("ar-SA")}
          </p>
        )}
      </div>

      {/* Preview */}
      {!isOpen && (
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-3">معاينة صفحة الغلق</h3>
          <a href="/" target="_blank" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
            <Eye className="h-4 w-4" />
            اضغط هنا لمعاينة صفحة الغلق في تبويب جديد
          </a>
        </div>
      )}
    </div>
  );
}

// ─── News Center Admin ───────────────────────────────────────────────────────
function NewsCenterAdmin() {
  const [activeTab, setActiveTab] = useState<"articles" | "sources">("articles");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "hajj" | "umrah" | "general" | "official">("all");
  const [selectedSourceId, setSelectedSourceId] = useState<number | undefined>(undefined);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [showSourceForm, setShowSourceForm] = useState(false);
  const [editingSource, setEditingSource] = useState<any>(null);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);

  const utils = trpc.useUtils();

  // Queries
  const { data: articlesData, isLoading: articlesLoading } = trpc.news.adminList.useQuery({
    page,
    limit: 20,
    sourceId: selectedSourceId,
    category: selectedCategory,
    search: search || undefined,
  });
  const { data: sources, isLoading: sourcesLoading } = trpc.news.listSources.useQuery();
  const { data: stats } = trpc.news.getStats.useQuery();

  // Mutations
  const fetchAll = trpc.news.fetchAllSources.useMutation({
    onSuccess: (data) => {
      toast.success(`تم جلب ${data.totalInserted} خبر جديد`);
      utils.news.adminList.invalidate();
      utils.news.getStats.invalidate();
      utils.news.listSources.invalidate();
    },
    onError: () => toast.error("فشل جلب الأخبار"),
  });
  const fetchSource = trpc.news.fetchSource.useMutation({
    onSuccess: (data) => {
      toast.success(`تم جلب ${data.inserted} خبر جديد`);
      utils.news.adminList.invalidate();
      utils.news.getStats.invalidate();
      utils.news.listSources.invalidate();
    },
    onError: () => toast.error("فشل جلب الأخبار"),
  });
  const togglePublish = trpc.news.updateArticle.useMutation({
    onSuccess: () => utils.news.adminList.invalidate(),
    onError: () => toast.error("فشل تحديث الخبر"),
  });
  const deleteArticle = trpc.news.deleteArticle.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الخبر");
      utils.news.adminList.invalidate();
      utils.news.getStats.invalidate();
    },
    onError: () => toast.error("فشل حذف الخبر"),
  });
  const bulkDelete = trpc.news.bulkDeleteArticles.useMutation({
    onSuccess: () => {
      toast.success(`تم حذف ${selectedArticles.length} خبر`);
      setSelectedArticles([]);
      utils.news.adminList.invalidate();
      utils.news.getStats.invalidate();
    },
    onError: () => toast.error("فشل الحذف الجماعي"),
  });
  const deleteSource = trpc.news.deleteSource.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المصدر");
      utils.news.listSources.invalidate();
      utils.news.getStats.invalidate();
    },
    onError: () => toast.error("فشل حذف المصدر"),
  });
  const toggleSource = trpc.news.updateSource.useMutation({
    onSuccess: () => utils.news.listSources.invalidate(),
    onError: () => toast.error("فشل تحديث المصدر"),
  });
  const createSource = trpc.news.createSource.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المصدر");
      setShowSourceForm(false);
      setEditingSource(null);
      utils.news.listSources.invalidate();
    },
    onError: () => toast.error("فشل إضافة المصدر"),
  });
  const updateSource = trpc.news.updateSource.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المصدر");
      setShowSourceForm(false);
      setEditingSource(null);
      utils.news.listSources.invalidate();
    },
    onError: () => toast.error("فشل تحديث المصدر"),
  });
  const createArticle = trpc.news.createArticle.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الخبر");
      setShowArticleForm(false);
      setEditingArticle(null);
      utils.news.adminList.invalidate();
      utils.news.getStats.invalidate();
    },
    onError: () => toast.error("فشل إضافة الخبر"),
  });
  const updateArticle = trpc.news.updateArticle.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الخبر");
      setShowArticleForm(false);
      setEditingArticle(null);
      utils.news.adminList.invalidate();
    },
    onError: () => toast.error("فشل تحديث الخبر"),
  });

  const categoryLabels: Record<string, string> = {
    hajj: "حج", umrah: "عمرة", general: "عام", official: "رسمي", all: "الكل",
  };
  const categoryColors: Record<string, string> = {
    hajj: "bg-green-100 text-green-700",
    umrah: "bg-blue-100 text-blue-700",
    general: "bg-gray-100 text-gray-700",
    official: "bg-amber-100 text-amber-700",
  };
  const typeLabels: Record<string, string> = { rss: "RSS", scrape: "استخراج", manual: "يدوي" };

  // Source form state
  const [srcForm, setSrcForm] = useState({ nameAr: "", nameEn: "", type: "rss" as "rss" | "scrape" | "manual", url: "", category: "general" as "hajj" | "umrah" | "general" | "official", language: "ar" as "ar" | "en", fetchInterval: 30, isActive: true });
  // Article form state
  const [artForm, setArtForm] = useState({ sourceId: 0, title: "", summary: "", url: "", category: "general" as "hajj" | "umrah" | "general" | "official", language: "ar" as "ar" | "en", isPublished: true, isFeatured: false });

  useEffect(() => {
    if (editingSource) {
      setSrcForm({ nameAr: editingSource.nameAr, nameEn: editingSource.nameEn || "", type: editingSource.type, url: editingSource.url, category: editingSource.category, language: editingSource.language, fetchInterval: editingSource.fetchInterval, isActive: editingSource.isActive });
    } else {
      setSrcForm({ nameAr: "", nameEn: "", type: "rss", url: "", category: "general", language: "ar", fetchInterval: 30, isActive: true });
    }
  }, [editingSource]);

  useEffect(() => {
    if (editingArticle) {
      setArtForm({ sourceId: editingArticle.sourceId, title: editingArticle.title, summary: editingArticle.summary || "", url: editingArticle.url || "", category: editingArticle.category, language: editingArticle.language, isPublished: editingArticle.isPublished, isFeatured: editingArticle.isFeatured });
    } else {
      setArtForm({ sourceId: sources?.[0]?.id || 0, title: "", summary: "", url: "", category: "general", language: "ar", isPublished: true, isFeatured: false });
    }
  }, [editingArticle, sources]);

  const handleSaveSource = () => {
    if (!srcForm.nameAr || !srcForm.url) return toast.error("يرجى ملء الحقول المطلوبة");
    if (editingSource) {
      updateSource.mutate({ id: editingSource.id, ...srcForm });
    } else {
      createSource.mutate(srcForm);
    }
  };

  const handleSaveArticle = () => {
    if (!artForm.title || !artForm.sourceId) return toast.error("يرجى ملء الحقول المطلوبة");
    if (editingArticle) {
      updateArticle.mutate({ id: editingArticle.id, ...artForm });
    } else {
      createArticle.mutate({ ...artForm, url: artForm.url || undefined });
    }
  };

  const totalPages = articlesData ? Math.ceil(articlesData.total / 20) : 1;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">مركز الأخبار</h2>
          <p className="text-sm text-muted-foreground mt-1">إدارة أخبار الحج والعمرة من المصادر الرسمية</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAll.mutate()}
            disabled={fetchAll.isPending}
            className="gap-2"
          >
            {fetchAll.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            جلب جميع الأخبار
          </Button>
          <Button size="sm" onClick={() => { setEditingArticle(null); setShowArticleForm(true); }} className="gap-2 bg-[var(--teal-600)] hover:bg-[var(--teal-700)] text-white">
            <Plus className="w-4 h-4" />
            إضافة خبر يدوي
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">إجمالي الأخبار</p>
            <p className="text-2xl font-bold text-[var(--teal-700)]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">الأخبار المنشورة</p>
            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">المصادر الكلية</p>
            <p className="text-2xl font-bold text-blue-600">{stats.sources}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">المصادر النشطة</p>
            <p className="text-2xl font-bold text-amber-600">{stats.activeSources}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveTab("articles")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "articles" ? "bg-white shadow text-[var(--teal-700)]" : "text-gray-500 hover:text-gray-700"}`}>الأخبار ({articlesData?.total ?? 0})</button>
        <button onClick={() => setActiveTab("sources")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "sources" ? "bg-white shadow text-[var(--teal-700)]" : "text-gray-500 hover:text-gray-700"}`}>المصادر ({sources?.length ?? 0})</button>
      </div>

      {/* Articles Tab */}
      {activeTab === "articles" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl border p-4 shadow-sm flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث في الأخبار..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                className="w-full pr-9 pl-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)]"
              />
            </div>
            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value as any); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm focus:outline-none">
              {(["all", "hajj", "umrah", "general", "official"] as const).map(c => <option key={c} value={c}>{categoryLabels[c]}</option>)}
            </select>
            <select value={selectedSourceId ?? ""} onChange={(e) => { setSelectedSourceId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="">كل المصادر</option>
              {sources?.map(s => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
            </select>
            {selectedArticles.length > 0 && (
              <Button variant="destructive" size="sm" onClick={() => bulkDelete.mutate({ ids: selectedArticles })} disabled={bulkDelete.isPending} className="gap-1">
                <Trash2 className="w-4 h-4" />
                حذف ({selectedArticles.length})
              </Button>
            )}
          </div>

          {/* Articles List */}
          {articlesLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--teal-600)]" /></div>
          ) : articlesData?.articles.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Rss className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">لا توجد أخبار</p>
              <p className="text-gray-400 text-sm mt-1">اضغط "جلب جميع الأخبار" لبدء جلب الأخبار من المصادر</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-right w-8">
                      <input type="checkbox" onChange={(e) => {
                        if (e.target.checked) setSelectedArticles(articlesData?.articles.map(a => a.id) || []);
                        else setSelectedArticles([]);
                      }} checked={selectedArticles.length === articlesData?.articles.length && articlesData?.articles.length > 0} className="rounded" />
                    </th>
                    <th className="p-3 text-right font-semibold text-gray-700">العنوان</th>
                    <th className="p-3 text-right font-semibold text-gray-700 hidden md:table-cell">المصدر</th>
                    <th className="p-3 text-right font-semibold text-gray-700 hidden lg:table-cell">التصنيف</th>
                    <th className="p-3 text-right font-semibold text-gray-700 hidden lg:table-cell">التاريخ</th>
                    <th className="p-3 text-right font-semibold text-gray-700">الحالة</th>
                    <th className="p-3 text-right font-semibold text-gray-700">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {articlesData?.articles.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <input type="checkbox" checked={selectedArticles.includes(article.id)} onChange={(e) => {
                          if (e.target.checked) setSelectedArticles(prev => [...prev, article.id]);
                          else setSelectedArticles(prev => prev.filter(id => id !== article.id));
                        }} className="rounded" />
                      </td>
                      <td className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 line-clamp-2 leading-snug">{article.title}</p>
                            {article.summary && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{article.summary}</p>}
                          </div>
                          {article.url && (
                            <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-blue-500 hover:text-blue-700">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="text-xs text-gray-500">{article.sourceName}</span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[article.category] || "bg-gray-100 text-gray-700"}`}>{categoryLabels[article.category]}</span>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString("ar-SA")}</span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => togglePublish.mutate({ id: article.id, isPublished: !article.isPublished })}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${article.isPublished ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                          {article.isPublished ? <><CheckCircle className="w-3 h-3" />منشور</> : <><Clock className="w-3 h-3" />مخفي</>}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingArticle(article); setShowArticleForm(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { if (confirm("هل تريد حذف هذا الخبر؟")) deleteArticle.mutate({ id: article.id }); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-500">الصفحة {page} من {totalPages} | إجمالي {articlesData?.total} خبر</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sources Tab */}
      {activeTab === "sources" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => { setEditingSource(null); setShowSourceForm(true); }} className="gap-2 bg-[var(--teal-600)] hover:bg-[var(--teal-700)] text-white">
              <Plus className="w-4 h-4" />
              إضافة مصدر
            </Button>
          </div>
          {sourcesLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--teal-600)]" /></div>
          ) : (
            <div className="grid gap-4">
              {sources?.map(source => (
                <div key={source.id} className="bg-white rounded-xl border p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--teal-50)] flex items-center justify-center flex-shrink-0">
                      <Rss className="w-5 h-5 text-[var(--teal-600)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{source.nameAr}</h3>
                        {source.nameEn && <span className="text-xs text-gray-400">{source.nameEn}</span>}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[source.category] || "bg-gray-100 text-gray-700"}`}>{categoryLabels[source.category]}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">{typeLabels[source.type]}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{source.language === "ar" ? "عربي" : "إنجليزي"}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">{source.url}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>الأخبار: {source.articlesCount}</span>
                        <span>كل {source.fetchInterval} دقيقة</span>
                        {source.lastFetchedAt && <span>آخر جلب: {new Date(source.lastFetchedAt).toLocaleString("ar-SA")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleSource.mutate({ id: source.id, isActive: !source.isActive })}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${source.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {source.isActive ? <><CheckCircle className="w-3 h-3" />نشط</> : <><Clock className="w-3 h-3" />معطل</>}
                      </button>
                      {source.type === "rss" && (
                        <button
                          onClick={() => fetchSource.mutate({ sourceId: source.id })}
                          disabled={fetchSource.isPending}
                          className="p-1.5 rounded-lg hover:bg-[var(--teal-50)] text-[var(--teal-600)] transition-colors"
                          title="جلب الأخبار الآن"
                        >
                          {fetchSource.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button onClick={() => { setEditingSource(source); setShowSourceForm(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { if (confirm("هل تريد حذف هذا المصدر وجميع أخباره؟")) deleteSource.mutate({ id: source.id }); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Source Form Modal */}
      {showSourceForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowSourceForm(false); setEditingSource(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingSource ? "تعديل المصدر" : "إضافة مصدر جديد"}</h3>
              <button onClick={() => { setShowSourceForm(false); setEditingSource(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">الاسم بالعربية *</label>
                <input type="text" value={srcForm.nameAr} onChange={e => setSrcForm(f => ({...f, nameAr: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)]" placeholder="مثال: وكالة الأنباء السعودية" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">الاسم بالإنجليزية</label>
                <input type="text" value={srcForm.nameEn} onChange={e => setSrcForm(f => ({...f, nameEn: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)]" placeholder="e.g. Saudi Press Agency" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">النوع</label>
                  <select value={srcForm.type} onChange={e => setSrcForm(f => ({...f, type: e.target.value as any}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="rss">RSS</option>
                    <option value="scrape">استخراج</option>
                    <option value="manual">يدوي</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">اللغة</label>
                  <select value={srcForm.language} onChange={e => setSrcForm(f => ({...f, language: e.target.value as any}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="ar">عربي</option>
                    <option value="en">إنجليزي</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">رابط RSS / URL *</label>
                <input type="text" value={srcForm.url} onChange={e => setSrcForm(f => ({...f, url: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)]" placeholder="https://example.com/rss.xml" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">التصنيف</label>
                  <select value={srcForm.category} onChange={e => setSrcForm(f => ({...f, category: e.target.value as any}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="hajj">حج</option>
                    <option value="umrah">عمرة</option>
                    <option value="general">عام</option>
                    <option value="official">رسمي</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">فترة الجلب (دقيقة)</label>
                  <input type="number" value={srcForm.fetchInterval} onChange={e => setSrcForm(f => ({...f, fetchInterval: Number(e.target.value)}))} min={0} max={1440} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="srcActive" checked={srcForm.isActive} onChange={e => setSrcForm(f => ({...f, isActive: e.target.checked}))} className="rounded" />
                <label htmlFor="srcActive" className="text-sm text-gray-700">مصدر نشط</label>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button onClick={handleSaveSource} disabled={createSource.isPending || updateSource.isPending} className="flex-1 bg-[var(--teal-600)] hover:bg-[var(--teal-700)] text-white">
                {(createSource.isPending || updateSource.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingSource ? "حفظ التعديلات" : "إضافة المصدر"}
              </Button>
              <Button variant="outline" onClick={() => { setShowSourceForm(false); setEditingSource(null); }}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      {/* Article Form Modal */}
      {showArticleForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowArticleForm(false); setEditingArticle(null); }}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingArticle ? "تعديل الخبر" : "إضافة خبر يدوي"}</h3>
              <button onClick={() => { setShowArticleForm(false); setEditingArticle(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">المصدر *</label>
                <select value={artForm.sourceId} onChange={e => setArtForm(f => ({...f, sourceId: Number(e.target.value)}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {sources?.map(s => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">عنوان الخبر *</label>
                <input type="text" value={artForm.title} onChange={e => setArtForm(f => ({...f, title: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)]" placeholder="أدخل عنوان الخبر" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">ملخص الخبر</label>
                <textarea value={artForm.summary} onChange={e => setArtForm(f => ({...f, summary: e.target.value}))} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)] resize-none" placeholder="ملخص مختصر للخبر" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">رابط الخبر</label>
                <input type="url" value={artForm.url} onChange={e => setArtForm(f => ({...f, url: e.target.value}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--teal-500)]" placeholder="https://..." dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">التصنيف</label>
                  <select value={artForm.category} onChange={e => setArtForm(f => ({...f, category: e.target.value as any}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="hajj">حج</option>
                    <option value="umrah">عمرة</option>
                    <option value="general">عام</option>
                    <option value="official">رسمي</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">اللغة</label>
                  <select value={artForm.language} onChange={e => setArtForm(f => ({...f, language: e.target.value as any}))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="ar">عربي</option>
                    <option value="en">إنجليزي</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="artPublished" checked={artForm.isPublished} onChange={e => setArtForm(f => ({...f, isPublished: e.target.checked}))} className="rounded" />
                  <label htmlFor="artPublished" className="text-sm text-gray-700">منشور</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="artFeatured" checked={artForm.isFeatured} onChange={e => setArtForm(f => ({...f, isFeatured: e.target.checked}))} className="rounded" />
                  <label htmlFor="artFeatured" className="text-sm text-gray-700">مميز</label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button onClick={handleSaveArticle} disabled={createArticle.isPending || updateArticle.isPending} className="flex-1 bg-[var(--teal-600)] hover:bg-[var(--teal-700)] text-white">
                {(createArticle.isPending || updateArticle.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingArticle ? "حفظ التعديلات" : "إضافة الخبر"}
              </Button>
              <Button variant="outline" onClick={() => { setShowArticleForm(false); setEditingArticle(null); }}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  const renderSection = () => {
    switch (section) {
      case "overview": return <OverviewDashboard onNavigate={setSection} />;
      case "hajj": return <HajjAdmin />;
      case "umrah": return <UmrahAdmin />;
      case "hotels": return <HotelsAdmin />;
      case "flights": return <FlightsAdmin />;
      case "visa": return <VisaAdmin />;
      case "transport": return <TransportAdmin />;
      case "tours": return <ToursAdmin />;
      case "store": return <StoreAdmin />;
      case "bookings": return <BookingsAdmin />;
      case "users": return <UsersAdmin />;
      case "localization": return <LocalizationAdmin />;
      case "analytics": return <AnalyticsDashboard />;
      case "assets": return <AssetManager />;
      case "data-export": return <DataExport />;
      case "pricing": return <DynamicPricing />;
      case "reviews": return <ReviewsHub />;
      case "seo": return <SeoManager />;
      case "flexible-requests": return <FlexibleRequestsAdmin />;
      case "provider-applications": return <ProviderApplicationsAdmin />;
      case "roles-permissions": return <RolesPermissionsAdmin />;
      case "media-center": return <MediaCenterAdmin />;
      case "hero-ads": return <HeroAdsAdmin />;
      case "search-settings": return <SearchSettingsAdmin />;
      case "marketers": return <MarketersAdmin />;
      case "suppliers": return <SuppliersAdmin />;
      case "sales-orders": return <SalesOrdersAdmin />;
      case "sales-reports": return <SalesReportsAdmin />;
      case "site-settings": return <SiteSettingsAdmin />;
      case "news-center": return <NewsCenterAdmin />;
      case "payments": return <PaymentsAdmin />;
      case "subscriptions": return <SubscriptionsAdmin />;
      default: return <OverviewDashboard />;
    }
  };

  const currentSectionLabel = SIDEBAR_ITEMS.find(i => i.id === section)?.label || section;

  return (
    <div className="min-h-screen bg-[var(--background)] flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-[var(--teal-900)] text-white flex-shrink-0 flex flex-col transition-all duration-300 fixed h-full z-40 right-0`}>
        {/* Logo + Toggle */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 min-h-[64px]">
          {sidebarOpen ? (
            <>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png"
                alt="Go Umrah"
                className="h-9 w-auto object-contain brightness-0 invert"
                style={{ maxWidth: 110 }}
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="mr-auto w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
                title="طي القائمة"
              >
                <ChevronRight className="w-4 h-4 text-white/70" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-8 h-8 rounded-lg bg-[var(--gold)] flex items-center justify-center flex-shrink-0 mx-auto hover:opacity-90 transition-opacity"
              title="توسيع القائمة"
            >
              <span className="text-[#1B5E52] font-bold text-sm">G</span>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
          {SIDEBAR_ITEMS.map((item) => (
            <div key={item.id} className="relative group">
              <button
                onClick={() => setSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                  section === item.id
                    ? "bg-white/15 text-white border-r-2 border-[var(--gold)]"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${section === item.id ? "text-[var(--gold)]" : ""}`} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
                {sidebarOpen && section === item.id && (
                  <span className="mr-auto w-1.5 h-1.5 rounded-full bg-[var(--gold)] flex-shrink-0" />
                )}
              </button>
              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-[var(--teal-800)] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                  {item.label}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 border-4 border-transparent border-l-[var(--teal-800)]" />
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/">
            <button className={`w-full flex items-center gap-3 text-white/60 hover:text-white text-sm py-2 px-2 rounded-lg hover:bg-white/10 transition-colors ${!sidebarOpen ? "justify-center" : ""}`}>
              <Globe className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>عرض الموقع</span>}
            </button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? "mr-64" : "mr-16"} transition-all duration-300`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-[var(--border)] px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--teal-50)] transition-colors"
              title={sidebarOpen ? "طي القائمة" : "توسيع القائمة"}
            >
              <LayoutDashboard className="w-4 h-4 text-[var(--teal-600)]" />
            </button>
            <div className="text-sm text-[var(--muted-foreground)] flex items-center gap-1">
              <span className="text-[var(--teal-800)] font-medium">لوحة التحكم</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[var(--teal-700)] font-medium">{currentSectionLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-[var(--muted-foreground)] hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>مرحباً، <span className="font-medium text-[var(--teal-700)]">{user?.name || "مشرف"}</span></span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) || "م"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
