import React, { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User, Mail, Phone, Globe, Lock, BookOpen,
  CheckCircle, AlertCircle, RefreshCw, LogOut, ArrowRight,
  Calendar, CreditCard, Plane, Hotel, Bus, Loader2, MessageSquare, Star
} from "lucide-react";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:    { label: "قيد الانتظار",  color: "bg-yellow-100 text-yellow-800" },
  confirmed:  { label: "مؤكد",          color: "bg-green-100 text-green-800" },
  cancelled:  { label: "ملغي",          color: "bg-red-100 text-red-800" },
  completed:  { label: "مكتمل",         color: "bg-blue-100 text-blue-800" },
  refunded:   { label: "مسترد",         color: "bg-gray-100 text-gray-800" },
  new:        { label: "جديد",          color: "bg-teal-100 text-teal-800" },
  reviewing:  { label: "قيد المراجعة",  color: "bg-orange-100 text-orange-800" },
};

const SERVICE_ICONS: Record<string, typeof Plane> = {
  hajj:      Plane,
  umrah:     Plane,
  hotel:     Hotel,
  flight:    Plane,
  transport: Bus,
  tour:      Globe,
  visa:      CreditCard,
};

// ─── BookingCard with inline review submission ───────────────────────────────
function BookingCard({ booking: b, userName }: { booking: any; userName: string }) {
  const Icon = SERVICE_ICONS[b.serviceType] ?? Plane;
  const st = STATUS_LABELS[b.status] ?? { label: b.status, color: "bg-gray-100 text-gray-800" };
  const [showReview, setShowReview] = React.useState(false);
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const submitReview = trpc.bookingReviews.submit.useMutation({
    onSuccess: () => { setSubmitted(true); setShowReview(false); },
    onError: (err) => { if (err.message.includes("مسبقاً")) setSubmitted(true); },
  });

  const canReview = b.status === "completed" && !submitted;

  return (
    <div className="p-3 bg-[#1a3520]/50 rounded-lg border border-[#C9A96E]/10 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#C9A96E]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">{b.serviceName ?? b.serviceType}</p>
            <p className="text-white/40 text-xs">#{b.bookingNumber}</p>
          </div>
        </div>
        <div className="text-left flex flex-col items-end gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
          <span className="text-[#C9A96E] text-xs">{b.totalUSD} {b.currency}</span>
        </div>
      </div>

      {/* Review CTA */}
      {canReview && !showReview && (
        <button onClick={() => setShowReview(true)}
          className="flex items-center gap-1.5 text-xs text-[#C9A96E] hover:text-[#b8935a] font-medium transition-colors">
          <Star className="w-3.5 h-3.5" /> قيّم هذه الخدمة
        </button>
      )}

      {submitted && (
        <p className="text-xs text-green-400 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" /> شكراً! تم إرسال تقييمك وسيظهر بعد المراجعة.
        </p>
      )}

      {/* Review Form */}
      {showReview && (
        <div className="bg-[#0d2010] border border-[#C9A96E]/20 rounded-xl p-4 space-y-3">
          <p className="text-white/80 text-sm font-semibold">تقييمك يهمنا</p>

          {/* Star Rating */}
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <button key={i}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i)}
                className="transition-transform hover:scale-110">
                <Star className={`w-6 h-6 ${
                  i <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-white/20"
                }`} />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="شاركنا تجربتك... (اختياري)"
            rows={3}
            className="w-full text-sm bg-[#1a3520] border border-[#C9A96E]/30 text-white rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#C9A96E] resize-none placeholder:text-white/30"
          />

          <div className="flex gap-2">
            <button
              onClick={() => submitReview.mutate({
                bookingRef: b.bookingNumber ?? String(b.id),
                providerId: b.providerId ?? 1,
                customerName: userName,
                rating,
                comment: comment || undefined,
              })}
              disabled={submitReview.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#C9A96E] hover:bg-[#b8935a] disabled:opacity-50 text-[#0a1a0f] rounded-xl text-sm font-semibold transition-colors">
              {submitReview.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
              إرسال التقييم
            </button>
            <button onClick={() => setShowReview(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl text-sm font-medium transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // ── Profile form state ─────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", bio: "", nationality: "", passportNumber: "" });

  // ── Password form state ────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = trpc.profile.get.useQuery(undefined, {
    enabled: !!user,
  });

  // Sync form when profile loads
  useState(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        phone: profile.phone ?? "",
        bio: profile.bio ?? "",
        nationality: profile.nationality ?? "",
        passportNumber: profile.passportNumber ?? "",
      });
    }
  });

  const { data: bookingsData, isLoading: bookingsLoading } = trpc.profile.getBookings.useQuery(undefined, {
    enabled: !!user,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const updateProfile = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الملف الشخصي بنجاح");
      setEditMode(false);
      utils.profile.get.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const changePassword = trpc.profile.changePassword.useMutation({
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور بنجاح");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const sendVerification = trpc.profile.sendVerification.useMutation({
    onSuccess: () => toast.success("تم إرسال رابط التحقق إلى بريدك الإلكتروني"),
    onError: (e) => toast.error(e.message),
  });

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => { utils.auth.me.invalidate(); navigate("/"); },
  });

  // ── Avatar upload ──────────────────────────────────────────────────────────────────────────────────
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const uploadAvatar = trpc.profile.uploadAvatar.useMutation({
    onSuccess: (data) => {
      toast.success("تم تحديث صورة الملف الشخصي بنجاح");
      setAvatarPreview(null);
      utils.profile.get.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة كبير جداً. الحد الأقصى 5 ميغابايت.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setAvatarPreview(base64);
      uploadAvatar.mutate({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  }, [uploadAvatar]);

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#0a1a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSaveProfile = () => {
    updateProfile.mutate({
      name: form.name || undefined,
      phone: form.phone || null,
      bio: form.bio || null,
      nationality: form.nationality || null,
      passportNumber: form.passportNumber || null,
    });
  };

  const handleChangePassword = () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("كلمات المرور الجديدة غير متطابقة");
      return;
    }
    changePassword.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
  };

  const initials = (profile?.name ?? user?.name ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalBookings =
    (bookingsData?.bookings.length ?? 0) +
    (bookingsData?.hajjRequests.length ?? 0) +
    (bookingsData?.umrahRequests.length ?? 0);

  return (
    <div className="min-h-screen bg-[#0a1a0f]" dir="rtl">
      {/* ── Navbar ── */}
      <nav className="bg-[#0d2010]/95 backdrop-blur border-b border-[#C9A96E]/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Go Umrah" className="h-10 w-auto" />
          </a>
          <div className="flex items-center gap-3">
            <span className="text-[#C9A96E] text-sm hidden sm:block">{profile?.name ?? user.name}</span>
            <Button
              variant="outline"
              size="sm"
              className="border-[#C9A96E]/40 text-[#C9A96E] hover:bg-[#C9A96E]/10 gap-2"
              onClick={() => logout.mutate()}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white/70 hover:bg-white/10 gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">الرئيسية</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ── Header card ── */}
        <Card className="bg-gradient-to-l from-[#1a3520] to-[#0d2010] border-[#C9A96E]/30 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <Avatar className="w-20 h-20 border-2 border-[#C9A96E]/50">
                  <AvatarImage src={avatarPreview ?? profile?.avatar ?? undefined} />
                  <AvatarFallback className="bg-[#C9A96E]/20 text-[#C9A96E] text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadAvatar.isPending ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <span className="text-white text-xs text-center font-arabic">تغيير<br/>الصورة</span>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="flex-1 text-center sm:text-right">
                <h1 className="text-2xl font-bold text-white">{profile?.name ?? "المستخدم"}</h1>
                <p className="text-[#C9A96E]/80 text-sm mt-1">{profile?.email}</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                  <Badge className={profile?.emailVerified ? "bg-green-900/50 text-green-300 border-green-700" : "bg-yellow-900/50 text-yellow-300 border-yellow-700"}>
                    {profile?.emailVerified ? (
                      <><CheckCircle className="w-3 h-3 ml-1" /> بريد محقق</>
                    ) : (
                      <><AlertCircle className="w-3 h-3 ml-1" /> بريد غير محقق</>
                    )}
                  </Badge>
                  <Badge className="bg-[#C9A96E]/20 text-[#C9A96E] border-[#C9A96E]/30">
                    {profile?.role === "admin" ? "مشرف" : profile?.role === "provider" ? "مزود خدمة" : "عضو"}
                  </Badge>
                  <Badge className="bg-white/10 text-white/60 border-white/20">
                    <BookOpen className="w-3 h-3 ml-1" /> {totalBookings} حجز
                  </Badge>
                </div>
              </div>
              {!profile?.emailVerified && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-900/20 gap-2 whitespace-nowrap"
                  onClick={() => sendVerification.mutate()}
                  disabled={sendVerification.isPending}
                >
                  {sendVerification.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  تحقق من البريد
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Tabs ── */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="bg-[#0d2010] border border-[#C9A96E]/20 p-1 w-full sm:w-auto">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#C9A96E] data-[state=active]:text-[#0a1a0f] text-white/70 gap-2">
              <User className="w-4 h-4" /> الملف الشخصي
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-[#C9A96E] data-[state=active]:text-[#0a1a0f] text-white/70 gap-2">
              <BookOpen className="w-4 h-4" /> حجوزاتي
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-[#C9A96E] data-[state=active]:text-[#0a1a0f] text-white/70 gap-2">
              <Lock className="w-4 h-4" /> الأمان
            </TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile">
            <Card className="bg-[#0d2010] border-[#C9A96E]/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-lg">البيانات الشخصية</CardTitle>
                {!editMode ? (
                  <Button size="sm" onClick={() => setEditMode(true)}
                    className="bg-[#C9A96E] hover:bg-[#b8935a] text-[#0a1a0f] gap-2">
                    تعديل
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"
                      className="border-white/20 text-white/60 hover:bg-white/10"
                      onClick={() => setEditMode(false)}>إلغاء</Button>
                    <Button size="sm"
                      className="bg-[#C9A96E] hover:bg-[#b8935a] text-[#0a1a0f]"
                      onClick={handleSaveProfile}
                      disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-white/70 flex items-center gap-2"><User className="w-4 h-4" /> الاسم الكامل</Label>
                    {editMode ? (
                      <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        className="bg-[#1a3520] border-[#C9A96E]/30 text-white" placeholder="الاسم الكامل" />
                    ) : (
                      <p className="text-white py-2 px-3 bg-[#1a3520]/50 rounded-md">{profile?.name ?? "—"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/70 flex items-center gap-2"><Mail className="w-4 h-4" /> البريد الإلكتروني</Label>
                    <p className="text-white/60 py-2 px-3 bg-[#1a3520]/30 rounded-md text-sm">{profile?.email ?? "—"} <span className="text-xs text-white/30">(لا يمكن تغييره)</span></p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/70 flex items-center gap-2"><Phone className="w-4 h-4" /> رقم الهاتف</Label>
                    {editMode ? (
                      <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="bg-[#1a3520] border-[#C9A96E]/30 text-white" placeholder="+966 5X XXX XXXX" />
                    ) : (
                      <p className="text-white py-2 px-3 bg-[#1a3520]/50 rounded-md">{profile?.phone ?? "—"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/70 flex items-center gap-2"><Globe className="w-4 h-4" /> الجنسية</Label>
                    {editMode ? (
                      <Input value={form.nationality} onChange={(e) => setForm(f => ({ ...f, nationality: e.target.value }))}
                        className="bg-[#1a3520] border-[#C9A96E]/30 text-white" placeholder="مثال: سعودي، مصري..." />
                    ) : (
                      <p className="text-white py-2 px-3 bg-[#1a3520]/50 rounded-md">{profile?.nationality ?? "—"}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-white/70 flex items-center gap-2"><CreditCard className="w-4 h-4" /> رقم جواز السفر</Label>
                    {editMode ? (
                      <Input value={form.passportNumber} onChange={(e) => setForm(f => ({ ...f, passportNumber: e.target.value }))}
                        className="bg-[#1a3520] border-[#C9A96E]/30 text-white" placeholder="رقم جواز السفر" />
                    ) : (
                      <p className="text-white py-2 px-3 bg-[#1a3520]/50 rounded-md">{profile?.passportNumber ?? "—"}</p>
                    )}
                  </div>
                </div>
                {editMode && (
                  <div className="space-y-1">
                    <Label className="text-white/70">نبذة شخصية</Label>
                    <Textarea value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                      className="bg-[#1a3520] border-[#C9A96E]/30 text-white resize-none" rows={3} placeholder="اكتب نبذة مختصرة عنك..." />
                  </div>
                )}
                {!editMode && profile?.bio && (
                  <div className="space-y-1">
                    <Label className="text-white/70">نبذة شخصية</Label>
                    <p className="text-white/80 py-2 px-3 bg-[#1a3520]/50 rounded-md text-sm">{profile.bio}</p>
                  </div>
                )}
                <Separator className="bg-[#C9A96E]/10" />
                <div className="text-xs text-white/30 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  عضو منذ: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("ar-SA") : "—"}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Bookings Tab ── */}
          <TabsContent value="bookings">
            <div className="space-y-4">
              {bookingsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" />
                </div>
              ) : totalBookings === 0 ? (
                <Card className="bg-[#0d2010] border-[#C9A96E]/20">
                  <CardContent className="py-16 text-center">
                    <BookOpen className="w-12 h-12 text-[#C9A96E]/30 mx-auto mb-4" />
                    <p className="text-white/50 text-lg">لا توجد حجوزات بعد</p>
                    <p className="text-white/30 text-sm mt-1">ابدأ رحلتك الروحانية الآن</p>
                    <Button className="mt-4 bg-[#C9A96E] hover:bg-[#b8935a] text-[#0a1a0f]" onClick={() => navigate("/")}>
                      استعرض الباقات
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Main bookings */}
                  {(bookingsData?.bookings.length ?? 0) > 0 && (
                    <Card className="bg-[#0d2010] border-[#C9A96E]/20">
                      <CardHeader><CardTitle className="text-white text-base">الحجوزات المؤكدة</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {bookingsData?.bookings.map((b) => (
                          <BookingCard key={b.id} booking={b} userName={profile?.name ?? user?.name ?? ""} />
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Hajj requests */}
                  {(bookingsData?.hajjRequests.length ?? 0) > 0 && (
                    <Card className="bg-[#0d2010] border-[#C9A96E]/20">
                      <CardHeader><CardTitle className="text-white text-base">طلبات الحج</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {bookingsData?.hajjRequests.map((r) => {
                          const st = STATUS_LABELS[r.status] ?? { label: r.status, color: "bg-gray-100 text-gray-800" };
                          return (
                            <div key={r.id} className="flex items-center justify-between p-3 bg-[#1a3520]/50 rounded-lg border border-[#C9A96E]/10">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-green-900/40 flex items-center justify-center">
                                  <Plane className="w-4 h-4 text-green-400" />
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{r.packageTitle ?? "باقة حج"}</p>
                                  <p className="text-white/40 text-xs">{new Date(r.createdAt).toLocaleDateString("ar-SA")}</p>
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {/* Umrah requests */}
                  {(bookingsData?.umrahRequests.length ?? 0) > 0 && (
                    <Card className="bg-[#0d2010] border-[#C9A96E]/20">
                      <CardHeader><CardTitle className="text-white text-base">طلبات العمرة</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {bookingsData?.umrahRequests.map((r) => {
                          const st = STATUS_LABELS[r.status] ?? { label: r.status, color: "bg-gray-100 text-gray-800" };
                          return (
                            <div key={r.id} className="flex items-center justify-between p-3 bg-[#1a3520]/50 rounded-lg border border-[#C9A96E]/10">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-teal-900/40 flex items-center justify-center">
                                  <Plane className="w-4 h-4 text-teal-400" />
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{r.packageTitle ?? "باقة عمرة"}</p>
                                  <p className="text-white/40 text-xs">{new Date(r.createdAt).toLocaleDateString("ar-SA")}</p>
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* ── Security Tab ── */}
          <TabsContent value="security">
            <Card className="bg-[#0d2010] border-[#C9A96E]/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#C9A96E]" /> تغيير كلمة المرور
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-w-md">
                {profile?.loginMethod === "google" ? (
                  <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg text-blue-300 text-sm">
                    حسابك مرتبط بـ Google. لا يمكن تغيير كلمة المرور.
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <Label className="text-white/70">كلمة المرور الحالية</Label>
                      <Input type="password" value={pwForm.currentPassword}
                        onChange={(e) => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                        className="bg-[#1a3520] border-[#C9A96E]/30 text-white" placeholder="••••••••" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-white/70">كلمة المرور الجديدة</Label>
                      <Input type="password" value={pwForm.newPassword}
                        onChange={(e) => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                        className="bg-[#1a3520] border-[#C9A96E]/30 text-white" placeholder="8 أحرف على الأقل" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-white/70">تأكيد كلمة المرور الجديدة</Label>
                      <Input type="password" value={pwForm.confirmPassword}
                        onChange={(e) => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        className="bg-[#1a3520] border-[#C9A96E]/30 text-white" placeholder="••••••••" />
                    </div>
                    <Button
                      className="bg-[#C9A96E] hover:bg-[#b8935a] text-[#0a1a0f] w-full"
                      onClick={handleChangePassword}
                      disabled={changePassword.isPending || !pwForm.currentPassword || !pwForm.newPassword}
                    >
                      {changePassword.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                      تغيير كلمة المرور
                    </Button>
                  </>
                )}

                <Separator className="bg-[#C9A96E]/10" />

                <div className="space-y-2">
                  <h3 className="text-white/70 text-sm font-medium">تحقق البريد الإلكتروني</h3>
                  {profile?.emailVerified ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" /> بريدك الإلكتروني محقق
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-yellow-400 text-sm">
                        <AlertCircle className="w-4 h-4" /> بريدك الإلكتروني غير محقق
                      </div>
                      <Button variant="outline" size="sm"
                        className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-900/20 gap-2"
                        onClick={() => sendVerification.mutate()}
                        disabled={sendVerification.isPending}>
                        {sendVerification.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        إرسال رابط التحقق
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
