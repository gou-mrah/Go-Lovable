import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, TrendingUp, ShoppingBag, DollarSign, Clock, CheckCircle2,
  XCircle, AlertCircle, LogIn, Link2, Copy, Check, Star, Phone, Mail,
  MapPin, Calendar, Award, BarChart3, Package, Wallet
} from "lucide-react";
import { toast } from "sonner";

const SERVICE_LABELS: Record<string, string> = {
  umrah: "عمرة", visa: "تأشيرة", hotel: "فندق",
  transport: "مواصلات", hajj: "حج", tour: "جولة", other: "أخرى",
};

const STATUS_CONFIG = {
  pending: { label: "معلق", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "مقبول", color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-800", icon: XCircle },
};

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace("-700", "-100").replace("-600", "-100")}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LinkAccountPanel({ onLinked }: { onLinked: () => void }) {
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const linkMutation = trpc.marketers.linkUserAccount.useMutation({
    onSuccess: () => {
      toast.success("تم ربط حسابك بنجاح!");
      onLinked();
    },
    onError: (e) => toast.error(e.message || "رمز غير صحيح"),
  });

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-[#C9A96E]/20">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1B5E52]/10 flex items-center justify-center mx-auto mb-3">
            <Link2 className="w-8 h-8 text-[#1B5E52]" />
          </div>
          <CardTitle className="text-xl text-[#1B5E52]">ربط حساب المسوق</CardTitle>
          <p className="text-sm text-muted-foreground">
            أدخل رمز المسوق (MKT-XXX) الذي حصلت عليه عند التسجيل لربطه بحسابك
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mkt-code">رمز المسوق</Label>
            <Input
              id="mkt-code"
              placeholder="MKT-123"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center font-mono text-lg tracking-widest"
            />
          </div>
          <Button
            className="w-full bg-[#1B5E52] hover:bg-[#1B5E52]/90 text-white"
            onClick={() => linkMutation.mutate({ marketerCode: code })}
            disabled={!code || linkMutation.isPending}
          >
            {linkMutation.isPending ? "جاري الربط..." : "ربط الحساب"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            لم تسجل بعد؟{" "}
            <a href="/join-marketer" className="text-[#1B5E52] font-medium hover:underline">
              سجّل الآن
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PendingApprovalPanel({ profile }: { profile: any }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(profile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-yellow-200 bg-yellow-50/30">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-yellow-800 mb-2">طلبك قيد المراجعة</h2>
          <p className="text-sm text-yellow-700 mb-5">
            تم استلام طلب انضمامك. سيتم مراجعته خلال 24-48 ساعة وستصلك إشعار بالنتيجة.
          </p>
          <div className="bg-white rounded-xl border border-yellow-200 p-4 mb-4">
            <p className="text-xs text-muted-foreground mb-1">رمز المسوق الخاص بك</p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-2xl font-bold text-[#1B5E52]">{profile.code}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyCode}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">احتفظ بهذا الرمز لربط حسابك لاحقاً</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {profile.nameAr && <div className="bg-white rounded-lg p-3 border"><p className="text-xs text-muted-foreground">الاسم</p><p className="font-medium">{profile.nameAr}</p></div>}
            {profile.phone && <div className="bg-white rounded-lg p-3 border"><p className="text-xs text-muted-foreground">الهاتف</p><p className="font-medium">{profile.phone}</p></div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RejectedPanel() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-red-200 bg-red-50/30">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-800 mb-2">تم رفض طلبك</h2>
          <p className="text-sm text-red-700 mb-5">
            للأسف، لم يتم قبول طلب انضمامك في هذه المرة. يمكنك التواصل مع فريق الدعم لمزيد من التفاصيل.
          </p>
          <Button variant="outline" className="border-red-300 text-red-700" asChild>
            <a href="/join-marketer">إعادة التقديم</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MarketerDashboard({ profile }: { profile: any }) {
  const { data: orders = [] } = trpc.marketers.getMyOrders.useQuery();

  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === "completed").length;
  const totalCommission = orders.reduce((s, o) => s + Number(o.marketerCommission ?? 0), 0);
  const pendingCommission = orders
    .filter(o => o.status === "pending" || o.status === "approved")
    .reduce((s, o) => s + Number(o.marketerCommission ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF6F0]" dir="rtl">
      {/* Header */}
      <div className="bg-[#1B5E52] text-white">
        <div className="container py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  مرحباً، {profile.nameAr}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-[#C9A96E] text-white border-0 text-xs">{profile.code}</Badge>
                  <Badge className="bg-green-500/20 text-green-200 border-green-500/30 text-xs">
                    <CheckCircle2 className="w-3 h-3 ml-1" /> مسوق معتمد
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
              <a href="/">العودة للرئيسية</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={ShoppingBag} label="إجمالي الطلبات" value={totalOrders} color="text-blue-600" />
          <StatCard icon={CheckCircle2} label="طلبات مكتملة" value={completedOrders} color="text-green-600" />
          <StatCard icon={DollarSign} label="إجمالي العمولات" value={`${totalCommission.toFixed(0)} ر.س`} color="text-[#C9A96E]" />
          <StatCard icon={Wallet} label="عمولات معلقة" value={`${pendingCommission.toFixed(0)} ر.س`} color="text-orange-600" />
        </div>

        <Tabs defaultValue="orders" dir="rtl">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="orders" className="gap-2"><Package className="w-4 h-4" />طلباتي</TabsTrigger>
            <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" />بياناتي</TabsTrigger>
            <TabsTrigger value="commissions" className="gap-2"><BarChart3 className="w-4 h-4" />حساباتي</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">سجل الطلبات</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">لا توجد طلبات بعد</p>
                    <p className="text-sm">ستظهر هنا طلباتك عند إضافتها من قبل الإدارة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => {
                      const st = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                      const StIcon = st.icon;
                      return (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-[#1B5E52]/10 flex items-center justify-center flex-shrink-0">
                              <ShoppingBag className="w-5 h-5 text-[#1B5E52]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {order.customerName || `طلب #${order.orderNumber}`}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">{SERVICE_LABELS[order.service] || order.service}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{order.orderDate}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-left">
                              <p className="text-sm font-bold text-[#C9A96E]">
                                {Number(order.marketerCommission).toFixed(0)} {order.currency}
                              </p>
                              <p className="text-xs text-muted-foreground">عمولة</p>
                            </div>
                            <Badge className={`${st.color} border-0 text-xs gap-1`}>
                              <StIcon className="w-3 h-3" />
                              {st.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">بياناتي الشخصية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: User, label: "الاسم بالعربي", value: profile.nameAr },
                    { icon: User, label: "الاسم بالإنجليزي", value: profile.nameEn },
                    { icon: Phone, label: "رقم الهاتف", value: profile.phone },
                    { icon: Mail, label: "البريد الإلكتروني", value: profile.email },
                    { icon: MapPin, label: "المدينة", value: profile.city },
                    { icon: Award, label: "رمز المسوق", value: profile.code },
                    { icon: Calendar, label: "تاريخ الانضمام", value: profile.joinDate || new Date(profile.createdAt).toLocaleDateString("ar-SA") },
                    { icon: Star, label: "الحالة", value: profile.isActive ? "نشط" : "غير نشط" },
                  ].filter(f => f.value).map((field, i) => {
                    const FIcon = field.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-[#1B5E52]/10 flex items-center justify-center flex-shrink-0">
                          <FIcon className="w-4 h-4 text-[#1B5E52]" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{field.label}</p>
                          <p className="text-sm font-medium">{field.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {profile.skills && (profile.skills as string[]).length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">المهارات التسويقية</p>
                    <div className="flex flex-wrap gap-2">
                      {(profile.skills as string[]).map((s: string) => (
                        <Badge key={s} variant="outline" className="text-xs border-[#1B5E52]/30 text-[#1B5E52]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">حساباتي وعمولاتي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-green-700 mb-1">عمولات محصّلة</p>
                    <p className="text-2xl font-bold text-green-700">
                      {orders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.marketerCommission ?? 0), 0).toFixed(0)} ر.س
                    </p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-yellow-700 mb-1">عمولات معلقة</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {pendingCommission.toFixed(0)} ر.س
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-700 mb-1">إجمالي العمولات</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {totalCommission.toFixed(0)} ر.س
                    </p>
                  </div>
                </div>

                {/* Commission breakdown by service */}
                {orders.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-3">تفصيل العمولات حسب الخدمة</p>
                    <div className="space-y-2">
                      {Object.entries(
                        orders.reduce((acc, o) => {
                          const svc = SERVICE_LABELS[o.service] || o.service;
                          acc[svc] = (acc[svc] || 0) + Number(o.marketerCommission ?? 0);
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([svc, amount]) => (
                        <div key={svc} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium">{svc}</span>
                          <span className="text-sm font-bold text-[#C9A96E]">{amount.toFixed(0)} ر.س</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {orders.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">لا توجد عمولات بعد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function MarketerPortal() {
  const { user, isAuthenticated, loading: isLoading } = useAuth();

  const { data: profile, isLoading: profileLoading, refetch } = trpc.marketers.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md shadow-lg border-[#C9A96E]/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1B5E52]/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-[#1B5E52]" />
            </div>
            <h2 className="text-xl font-bold text-[#1B5E52] mb-2">تسجيل الدخول مطلوب</h2>
            <p className="text-sm text-muted-foreground mb-5">
              يجب تسجيل الدخول للوصول إلى بوابة المسوق
            </p>
            <Button
              className="w-full bg-[#1B5E52] hover:bg-[#1B5E52]/90 text-white"
              onClick={() => window.location.href = '/login'}
            >
              <LogIn className="w-4 h-4 ml-2" />
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1B5E52] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // No marketer profile linked — show link account panel
  if (!profile) {
    return <LinkAccountPanel onLinked={() => refetch()} />;
  }

  // Profile exists but pending
  if (profile.approvalStatus === "pending") {
    return <PendingApprovalPanel profile={profile} />;
  }

  // Profile rejected
  if (profile.approvalStatus === "rejected") {
    return <RejectedPanel />;
  }

  // Approved marketer — show full dashboard
  return <MarketerDashboard profile={profile} />;
}
