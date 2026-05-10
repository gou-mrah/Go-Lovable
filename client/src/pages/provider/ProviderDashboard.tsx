import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Building2, LayoutDashboard, Package, Calendar, Settings,
  Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, Star, Users, DollarSign,
  AlertCircle, Loader2, Save, X, Upload, Globe, Phone,
  Mail, MapPin, FileText, Tag, List, ToggleLeft, ToggleRight,
  Crown, Zap, Shield, TrendingUp, BadgeCheck, Sparkles,
  Bell, MessageSquare, ThumbsUp, ThumbsDown, Reply, Trash,
} from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

const PROGRAM_TYPES = [
  { value: "hajj", label: "حج", labelEn: "Hajj", emoji: "🕌" },
  { value: "umrah", label: "عمرة", labelEn: "Umrah", emoji: "🌙" },
  { value: "hotel", label: "فندق", labelEn: "Hotel", emoji: "🏨" },
  { value: "flight", label: "طيران", labelEn: "Flight", emoji: "✈️" },
  { value: "visa", label: "تأشيرة", labelEn: "Visa", emoji: "📋" },
  { value: "transport", label: "نقل", labelEn: "Transport", emoji: "🚌" },
  { value: "tour", label: "جولات", labelEn: "Tours", emoji: "🗺️" },
  { value: "other", label: "أخرى", labelEn: "Other", emoji: "📦" },
];

const BOOKING_STATUSES = [
  { value: "pending", label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "مؤكد", color: "bg-green-100 text-green-800" },
  { value: "processing", label: "قيد المعالجة", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "مكتمل", color: "bg-teal-100 text-teal-800" },
  { value: "cancelled", label: "ملغي", color: "bg-red-100 text-red-800" },
  { value: "refunded", label: "مسترد", color: "bg-gray-100 text-gray-800" },
];

type Section = "overview" | "programs" | "bookings" | "profile" | "subscription" | "reviews" | "notifications";

// ─── Reviews Section ──────────────────────────────────────────────────────────
function ReviewsSection() {
  const [statusFilter, setStatusFilter] = React.useState<"pending" | "approved" | "rejected" | undefined>(undefined);
  const [replyingTo, setReplyingTo] = React.useState<number | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const utils = trpc.useUtils();

  const { data: reviews, isLoading } = trpc.bookingReviews.getMyReviews.useQuery(
    { status: statusFilter, limit: 30, offset: 0 },
    { enabled: true }
  );

  const replyMutation = trpc.bookingReviews.reply.useMutation({
    onSuccess: () => {
      utils.bookingReviews.getMyReviews.invalidate();
      setReplyingTo(null);
      setReplyText("");
    },
  });

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
      ))}
    </div>
  );

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  const statusLabels: Record<string, string> = {
    pending: "قيد المراجعة",
    approved: "معتمد",
    rejected: "مرفوض",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">التقييمات</h1>
        <p className="text-gray-500 text-sm mt-1">تقييمات العملاء على برامجك وخدماتك</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: undefined, label: "الكل" },
          { value: "pending" as const, label: "قيد المراجعة" },
          { value: "approved" as const, label: "معتمدة" },
          { value: "rejected" as const, label: "مرفوضة" },
        ].map(f => (
          <button key={String(f.value)} onClick={() => setStatusFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === f.value ? "bg-teal-600 text-white" : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-white/80 rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800 text-sm">{review.customerName}</span>
                    {review.isVerified && (
                      <span className="flex items-center gap-0.5 text-xs text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" /> حجز موثق
                      </span>
                    )}
                  </div>
                  {renderStars(review.rating)}
                  {review.title && <p className="text-sm font-semibold text-gray-700 mt-1">{review.title}</p>}
                  {review.comment && <p className="text-sm text-gray-500 mt-1">{review.comment}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[review.status]}`}>
                  {statusLabels[review.status]}
                </span>
              </div>

              {/* Provider Reply */}
              {review.providerReply ? (
                <div className="mt-3 bg-teal-50 border border-teal-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-teal-700 mb-1">ردك:</p>
                  <p className="text-sm text-teal-800">{review.providerReply}</p>
                </div>
              ) : review.status === "approved" && (
                <div className="mt-3">
                  {replyingTo === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="اكتب ردك هنا..."
                        rows={3}
                        className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => replyMutation.mutate({ reviewId: review.id, reply: replyText })}
                          disabled={replyMutation.isPending || !replyText.trim()}
                          className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors">
                          {replyMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Reply className="w-3 h-3" />}
                          إرسال الرد
                        </button>
                        <button onClick={() => { setReplyingTo(null); setReplyText(""); }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setReplyingTo(review.id)}
                      className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium">
                      <Reply className="w-3 h-3" /> الرد على التقييم
                    </button>
                  )}
                </div>
              )}

              <div className="mt-2 text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("ar-SA")}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/60 rounded-2xl border border-dashed border-gray-200">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-500 mb-2">لا توجد تقييمات بعد</h3>
          <p className="text-sm text-gray-400">ستظهر هنا تقييمات عملائك بعد إتمام حجوزاتهم</p>
        </div>
      )}
    </div>
  );
}

// ─── Notifications Section ────────────────────────────────────────────────────
function NotificationsSection() {
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.providerNotifications.list.useQuery(
    { unreadOnly, limit: 30, offset: 0 },
    { enabled: true }
  );

  const markRead = trpc.providerNotifications.markRead.useMutation({
    onSuccess: () => utils.providerNotifications.list.invalidate(),
  });
  const deleteNotif = trpc.providerNotifications.delete.useMutation({
    onSuccess: () => utils.providerNotifications.list.invalidate(),
  });

  const typeIcons: Record<string, React.ReactNode> = {
    new_booking: <Calendar className="w-4 h-4 text-blue-500" />,
    booking_cancelled: <XCircle className="w-4 h-4 text-red-500" />,
    booking_completed: <CheckCircle className="w-4 h-4 text-green-500" />,
    new_review: <Star className="w-4 h-4 text-amber-500" />,
    subscription_expiring: <AlertCircle className="w-4 h-4 text-orange-500" />,
    subscription_expired: <AlertCircle className="w-4 h-4 text-red-500" />,
    upgrade_approved: <Crown className="w-4 h-4 text-teal-500" />,
    upgrade_rejected: <XCircle className="w-4 h-4 text-red-500" />,
    application_approved: <BadgeCheck className="w-4 h-4 text-green-500" />,
    application_rejected: <XCircle className="w-4 h-4 text-red-500" />,
    system: <Bell className="w-4 h-4 text-gray-500" />,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الإشعارات</h1>
          <p className="text-gray-500 text-sm mt-1">آخر التنبيهات والتحديثات</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              unreadOnly ? "bg-teal-600 text-white" : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}>
            غير مقروءة فقط
          </button>
          {data && data.unreadCount > 0 && (
            <button onClick={() => markRead.mutate({})}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
              تحديد الكل كمقروء
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        </div>
      ) : data && data.notifications.length > 0 ? (
        <div className="space-y-2">
          {data.notifications.map((notif: any) => (
            <div key={notif.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${
                !notif.isRead ? "bg-teal-50/60 border-teal-100" : "bg-white/80 border-gray-100"
              }`}>
              <div className="mt-0.5 flex-shrink-0">
                {typeIcons[notif.type] || <Bell className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${!notif.isRead ? "text-gray-900" : "text-gray-700"}`}>
                    {notif.title}
                  </p>
                  {!notif.isRead && <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />}
                </div>
                {notif.message && <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString("ar-SA")}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!notif.isRead && (
                  <button onClick={() => markRead.mutate({ notificationId: notif.id })}
                    className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors" title="تحديد كمقروء">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => deleteNotif.mutate({ notificationId: notif.id })}
                  className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors" title="حذف">
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/60 rounded-2xl border border-dashed border-gray-200">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-500 mb-2">لا توجد إشعارات</h3>
          <p className="text-sm text-gray-400">ستظهر هنا إشعارات الحجوزات والتقييمات والاشتراكات</p>
        </div>
      )}
    </div>
  );
}

// ─── Subscription Overview Banner (shown on overview page) ───────────────────
function SubscriptionOverviewBanner({ onUpgrade }: { onUpgrade: () => void }) {
  const { data: mySub, isLoading } = trpc.subscriptions.getMySubscription.useQuery();
  if (isLoading || !mySub) return null;
  const plan = mySub.plan;
  const daysLeft = mySub.endDate ? Math.max(0, Math.ceil((new Date(mySub.endDate).getTime() - Date.now()) / 86400000)) : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7;
  const isExpired = mySub.status !== "active";
  const planColors: Record<string, string> = {
    free_trial: "border-gray-200 bg-gray-50",
    premium_basic: "border-teal-200 bg-teal-50",
    premium_plus: "border-amber-200 bg-amber-50",
  };
  const planIconColors: Record<string, string> = {
    free_trial: "text-gray-500",
    premium_basic: "text-teal-600",
    premium_plus: "text-amber-600",
  };
  const slug = plan?.slug || "free_trial";
  if (isExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-red-800 text-sm">انتهى اشتراكك</div>
            <div className="text-xs text-red-600">قم بتجديد اشتراكك للاستمرار في نشر البرامج</div>
          </div>
        </div>
        <button onClick={onUpgrade} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors">
          تجديد الاشتراك
        </button>
      </div>
    );
  }
  return (
    <div className={`rounded-2xl border p-4 flex items-center justify-between ${planColors[slug] || "border-gray-200 bg-gray-50"}`}>
      <div className="flex items-center gap-3">
        {slug === "premium_plus" ? <Crown className={`w-5 h-5 ${planIconColors[slug]}`} /> :
         slug === "premium_basic" ? <Zap className={`w-5 h-5 ${planIconColors[slug]}`} /> :
         <Shield className={`w-5 h-5 ${planIconColors[slug]}`} />}
        <div>
          <div className="font-semibold text-gray-800 text-sm">
            باقة {plan?.nameAr || "التجريبية"}
            {isExpiringSoon && <span className="mr-2 text-xs text-amber-600 font-normal">⚠️ تنتهي خلال {daysLeft} أيام</span>}
          </div>
          <div className="text-xs text-gray-500">
            {daysLeft !== null ? `متبقي ${daysLeft} يوم` : "اشتراك نشط"}
            {" · "}
            {plan?.maxPrograms === -1 ? "برامج غير محدودة" : `${plan?.maxPrograms ?? 0} برامج كحد أقصى`}
          </div>
        </div>
      </div>
      {slug !== "premium_plus" && (
        <button onClick={onUpgrade} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          ترقية الباقة
        </button>
      )}
    </div>
  );
}

// ─── Subscription Section ─────────────────────────────────────────────────────
function SubscriptionSection() {
  const { data: plans, isLoading: plansLoading } = trpc.subscriptions.listPlans.useQuery();
  const { data: mySub, isLoading: subLoading } = trpc.subscriptions.getMySubscription.useQuery();
  const requestUpgrade = trpc.subscriptions.requestUpgrade.useMutation({
    onSuccess: () => { alert("تم إرسال طلب الترقية بنجاح! سيقوم الفريق بمراجعته والتواصل معك."); },
    onError: (e) => { alert(`خطأ: ${e.message}`); },
  });

  if (plansLoading || subLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );

  const currentPlan = mySub?.plan;
  const isActive = mySub?.status === "active";
  const expiresAt = mySub?.endDate ? new Date(mySub.endDate) : null;
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86400000)) : null;

  const planColors: Record<string, string> = {
    free_trial: "from-gray-400 to-gray-500",
    basic: "from-blue-500 to-blue-600",
    growth: "from-teal-500 to-teal-600",
    professional: "from-amber-500 to-amber-600",
    // legacy slugs
    premium_basic: "from-teal-500 to-teal-600",
    premium_plus: "from-amber-500 to-amber-600",
  };
  const planIcons: Record<string, React.ReactNode> = {
    free_trial: <Shield className="w-6 h-6 text-white" />,
    basic: <Zap className="w-6 h-6 text-white" />,
    growth: <TrendingUp className="w-6 h-6 text-white" />,
    professional: <Crown className="w-6 h-6 text-white" />,
    // legacy slugs
    premium_basic: <Zap className="w-6 h-6 text-white" />,
    premium_plus: <Crown className="w-6 h-6 text-white" />,
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">اشتراكي</h1>
        <p className="text-gray-500 text-sm mt-1">إدارة باقة الاشتراك والترقية</p>
      </div>

      {/* Current Plan Card */}
      <div className={`bg-gradient-to-br ${planColors[currentPlan?.slug || "free_trial"]} rounded-2xl p-6 text-white shadow-lg`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {planIcons[currentPlan?.slug || "free_trial"]}
              <span className="text-lg font-bold">{currentPlan?.nameAr || "التجريبة المجانية"}</span>
            </div>
            <p className="text-white/80 text-sm">{currentPlan?.descriptionAr || "ابدأ تجربتك مجاناً"}</p>
          </div>
          <div className="text-right">
            {isActive ? (
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">نشط</span>
            ) : (
              <span className="bg-red-400/40 text-white text-xs px-3 py-1 rounded-full">منتهي</span>
            )}
            {daysLeft !== null && (
              <p className="text-white/70 text-xs mt-1">يتبقى {daysLeft} يوم</p>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{currentPlan?.maxPrograms === -1 ? "غير محدود" : (currentPlan?.maxPrograms ?? 5)}</div>
            <div className="text-white/70 text-xs">أقصى برامج</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{currentPlan?.trialDays ?? 0} يوم</div>
            <div className="text-white/70 text-xs">فترة التجربة</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{currentPlan?.isFeaturedInListings ? "نعم" : "لا"}</div>
            <div className="text-white/70 text-xs">برامج مميزة</div>
          </div>
        </div>
      </div>

      {/* Upgrade Plans */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">الباقات المتاحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {(plans || []).map((plan: any) => {
            const isCurrent = plan.slug === currentPlan?.slug;
            const isHigher = (plans || []).indexOf(plan) > (plans || []).findIndex((p: any) => p.slug === currentPlan?.slug);
            const monthlyPrice = parseFloat(plan.monthlyPriceSAR ?? "0");
            const annualPrice = parseFloat(plan.annualPriceSAR ?? "0");
            return (
              <div key={plan.id} className={`bg-white rounded-2xl border-2 p-5 transition-all relative ${
                plan.slug === "professional" ? "border-amber-400 shadow-md" :
                plan.slug === "growth" ? "border-teal-400 shadow-sm" :
                isCurrent ? "border-teal-500 shadow-md" : "border-gray-100 hover:border-teal-200"
              }`}>
                {plan.slug === "professional" && (
                  <div className="absolute -top-3 right-4 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-bold">الأكثر شعبية</div>
                )}
                {plan.slug === "growth" && (
                  <div className="absolute -top-3 right-4 bg-teal-600 text-white text-xs px-3 py-1 rounded-full font-bold">الأفضل قيمة</div>
                )}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${planColors[plan.slug] || "from-gray-400 to-gray-500"}`}>
                    {planIcons[plan.slug] || <Shield className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{plan.nameAr}</div>
                    {isCurrent && <span className="text-xs text-teal-600">باقتك الحالية</span>}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-0.5">
                  {monthlyPrice === 0 ? "مجاني" : `${monthlyPrice.toLocaleString("ar-SA")} ر.س`}
                </div>
                {monthlyPrice > 0 && (
                  <div className="text-xs text-gray-400 mb-1">شهريًا • أو {annualPrice.toLocaleString("ar-SA")} ر.س/سنة</div>
                )}
                <p className="text-gray-500 text-xs mb-4">{plan.descriptionAr}</p>
                <ul className="space-y-1.5 mb-4">
                  <li className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                    <span>{plan.maxPrograms === -1 ? "برامج غير محدودة" : `حتى ${plan.maxPrograms} برامج`}</span>
                  </li>
                  {plan.isFeaturedInListings && (
                    <li className="flex items-center gap-2 text-xs text-gray-600">
                      <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>ظهور مميز في القوائم</span>
                    </li>
                  )}
                  {plan.trialDays > 0 && (
                    <li className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                      <span>تجربة مجانية {plan.trialDays} يوم</span>
                    </li>
                  )}
                </ul>
                {isCurrent ? (
                  <div className="w-full py-2 text-center text-sm text-teal-600 font-medium bg-teal-50 rounded-xl">باقتك الحالية ✔</div>
                ) : isHigher ? (
                  <button
                    onClick={() => requestUpgrade.mutate({ planId: plan.id, billingCycle: "monthly" })}
                    disabled={requestUpgrade.isPending}
                    className="w-full py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all disabled:opacity-50"
                  >
                    {requestUpgrade.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "طلب الترقية"}
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-sm text-gray-400 bg-gray-50 rounded-xl">باقة أعلى</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current subscription details */}
      {mySub && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-800 mb-3">تفاصيل الاشتراك</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500 text-xs">تاريخ البدء</div>
              <div className="font-medium">{new Date(mySub.startDate).toLocaleDateString("ar-SA")}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">تاريخ الانتهاء</div>
              <div className="font-medium">{expiresAt ? expiresAt.toLocaleDateString("ar-SA") : "-"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">دورة الفوترة</div>
              <div className="font-medium">{mySub.billingCycle === "trial" ? "تجريبي" : mySub.billingCycle === "monthly" ? "شهري" : "سنوي"}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">الحالة</div>
              <div className="font-medium">{mySub.status === "active" ? "نشط" : mySub.status === "expired" ? "منتهي" : mySub.status === "cancelled" ? "ملغي" : mySub.status}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs">البرامج المستخدمة</div>
              <div className="font-medium">{currentPlan?.maxPrograms === -1 ? "غير محدود" : currentPlan?.maxPrograms}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-white/60 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function ProgramForm({ program, onSave, onCancel }: { program?: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    programType: program?.programType || "umrah",
    title: program?.title || "",
    titleAr: program?.titleAr || "",
    description: program?.description || "",
    descriptionAr: program?.descriptionAr || "",
    priceUSD: program?.priceUSD || "",
    originalPriceUSD: program?.originalPriceUSD || "",
    duration: program?.duration || "",
    capacity: program?.capacity || "",
    availableSlots: program?.availableSlots || "",
    departureCity: program?.departureCity || "",
    destination: program?.destination || "",
    startDate: program?.startDate || "",
    endDate: program?.endDate || "",
    imageUrl: program?.imageUrl || "",
    isActive: program?.isActive ?? true,
    features: (program?.features || []).join("\n"),
    inclusions: (program?.inclusions || []).join("\n"),
    exclusions: (program?.exclusions || []).join("\n"),
    tags: (program?.tags || []).join(", "),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
      availableSlots: form.availableSlots ? parseInt(form.availableSlots) : undefined,
      features: form.features ? form.features.split("\n").filter(Boolean) : [],
      inclusions: form.inclusions ? form.inclusions.split("\n").filter(Boolean) : [],
      exclusions: form.exclusions ? form.exclusions.split("\n").filter(Boolean) : [],
      tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    });
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>نوع البرنامج *</label>
          <select className={inputClass} value={form.programType} onChange={e => setForm({ ...form, programType: e.target.value })}>
            {PROGRAM_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.emoji} {t.label} / {t.labelEn}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className={labelClass}>الحالة</label>
            <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${form.isActive ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-500"}`}>
              {form.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              {form.isActive ? "نشط" : "غير نشط"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>العنوان (عربي) *</label>
          <input className={inputClass} value={form.titleAr} onChange={e => setForm({ ...form, titleAr: e.target.value })} placeholder="عنوان البرنامج بالعربية" dir="rtl" />
        </div>
        <div>
          <label className={labelClass}>Title (English)</label>
          <input className={inputClass} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Program title in English" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>السعر (ريال سعودي) *</label>
          <input type="number" className={inputClass} value={form.priceUSD} onChange={e => setForm({ ...form, priceUSD: e.target.value })} placeholder="0.00" required />
        </div>
        <div>
          <label className={labelClass}>السعر الأصلي قبل الخصم (ريال سعودي)</label>
          <input type="number" className={inputClass} value={form.originalPriceUSD} onChange={e => setForm({ ...form, originalPriceUSD: e.target.value })} placeholder="0.00" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>المدة</label>
          <input className={inputClass} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="مثال: 10 أيام" />
        </div>
        <div>
          <label className={labelClass}>السعة الكلية</label>
          <input type="number" className={inputClass} value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="50" />
        </div>
        <div>
          <label className={labelClass}>المقاعد المتاحة</label>
          <input type="number" className={inputClass} value={form.availableSlots} onChange={e => setForm({ ...form, availableSlots: e.target.value })} placeholder="20" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>مدينة المغادرة</label>
          <input className={inputClass} value={form.departureCity} onChange={e => setForm({ ...form, departureCity: e.target.value })} placeholder="الرياض" />
        </div>
        <div>
          <label className={labelClass}>الوجهة</label>
          <input className={inputClass} value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} placeholder="مكة المكرمة" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>تاريخ البداية</label>
          <input type="date" className={inputClass} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>تاريخ النهاية</label>
          <input type="date" className={inputClass} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
        </div>
      </div>

      <div>
        <ImageUpload
          value={form.imageUrl}
          onChange={(url) => setForm({ ...form, imageUrl: url })}
          folder="general"
          label="صورة البرنامج"
          aspectRatio="16/9"
          placeholder="ارفع صورة البرنامج"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>الوصف (عربي)</label>
          <textarea className={inputClass} rows={3} value={form.descriptionAr} onChange={e => setForm({ ...form, descriptionAr: e.target.value })} placeholder="وصف البرنامج..." dir="rtl" />
        </div>
        <div>
          <label className={labelClass}>Description (English)</label>
          <textarea className={inputClass} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Program description..." />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>المميزات (سطر لكل ميزة)</label>
          <textarea className={inputClass} rows={4} value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="إقامة فندقية&#10;وجبات كاملة&#10;مواصلات" dir="rtl" />
        </div>
        <div>
          <label className={labelClass}>يشمل (سطر لكل بند)</label>
          <textarea className={inputClass} rows={4} value={form.inclusions} onChange={e => setForm({ ...form, inclusions: e.target.value })} placeholder="تذاكر الطيران&#10;الفيزا&#10;التأمين" dir="rtl" />
        </div>
        <div>
          <label className={labelClass}>لا يشمل (سطر لكل بند)</label>
          <textarea className={inputClass} rows={4} value={form.exclusions} onChange={e => setForm({ ...form, exclusions: e.target.value })} placeholder="المصروف الشخصي&#10;المشتريات" dir="rtl" />
        </div>
      </div>

      <div>
        <label className={labelClass}>الوسوم (مفصولة بفاصلة)</label>
        <input className={inputClass} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="عمرة, رمضان, مكة, عائلي" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors">
          <Save className="w-4 h-4" />
          {program ? "حفظ التغييرات" : "إضافة البرنامج"}
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors">
          <X className="w-4 h-4" />
          إلغاء
        </button>
      </div>
    </form>
  );
}

function ProfileForm({ profile, onSave }: { profile: any; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    companyName: profile?.companyName || "",
    companyNameAr: profile?.companyNameAr || "",
    licenseNumber: profile?.licenseNumber || "",
    contactPhone: profile?.contactPhone || "",
    contactWhatsapp: profile?.contactWhatsapp || "",
    contactEmail: profile?.contactEmail || "",
    website: profile?.website || "",
    description: profile?.description || "",
    descriptionAr: profile?.descriptionAr || "",
    address: profile?.address || "",
    city: profile?.city || "",
    country: profile?.country || "SA",
  });
  const [saving, setSaving] = useState(false);

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>اسم الشركة (عربي) *</label>
          <input className={inputClass} value={form.companyNameAr} onChange={e => setForm({ ...form, companyNameAr: e.target.value })} placeholder="اسم الشركة بالعربية" dir="rtl" />
        </div>
        <div>
          <label className={labelClass}>Company Name (English) *</label>
          <input className={inputClass} value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} placeholder="Company name in English" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>رقم الترخيص</label>
          <input className={inputClass} value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} placeholder="رقم الترخيص التجاري" />
        </div>
        <div>
          <label className={labelClass}>الموقع الإلكتروني</label>
          <input className={inputClass} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>رقم الهاتف</label>
          <input className={inputClass} value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} placeholder="+966..." />
        </div>
        <div>
          <label className={labelClass}>واتساب</label>
          <input className={inputClass} value={form.contactWhatsapp} onChange={e => setForm({ ...form, contactWhatsapp: e.target.value })} placeholder="+966..." />
        </div>
        <div>
          <label className={labelClass}>البريد الإلكتروني</label>
          <input className={inputClass} value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} placeholder="info@..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>المدينة</label>
          <input className={inputClass} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="الرياض" />
        </div>
        <div>
          <label className={labelClass}>الدولة</label>
          <input className={inputClass} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="SA" />
        </div>
      </div>
      <div>
        <label className={labelClass}>العنوان</label>
        <input className={inputClass} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="العنوان التفصيلي" dir="rtl" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>نبذة عن الشركة (عربي)</label>
          <textarea className={inputClass} rows={3} value={form.descriptionAr} onChange={e => setForm({ ...form, descriptionAr: e.target.value })} dir="rtl" placeholder="نبذة مختصرة..." />
        </div>
        <div>
          <label className={labelClass}>About (English)</label>
          <textarea className={inputClass} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
        </div>
      </div>
      <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        حفظ الملف التعريفي
      </button>
    </form>
  );
}

export default function ProviderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [section, setSection] = useState<Section>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [bookingFilter, setBookingFilter] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: stats } = trpc.provider.getStats.useQuery(undefined, { enabled: !!user });
  const { data: profile } = trpc.provider.getProfile.useQuery(undefined, { enabled: !!user });
  const { data: programs, isLoading: programsLoading } = trpc.provider.listPrograms.useQuery({}, { enabled: !!user });
  const { data: bookings, isLoading: bookingsLoading } = trpc.provider.listBookings.useQuery(
    { status: bookingFilter || undefined },
    { enabled: !!user }
  );

  const upsertProfile = trpc.provider.upsertProfile.useMutation({
    onSuccess: () => utils.provider.getProfile.invalidate(),
  });
  const createProgram = trpc.provider.createProgram.useMutation({
    onSuccess: () => { utils.provider.listPrograms.invalidate(); utils.provider.getStats.invalidate(); setShowProgramForm(false); },
  });
  const updateProgram = trpc.provider.updateProgram.useMutation({
    onSuccess: () => { utils.provider.listPrograms.invalidate(); setEditingProgram(null); },
  });
  const deleteProgram = trpc.provider.deleteProgram.useMutation({
    onSuccess: () => { utils.provider.listPrograms.invalidate(); utils.provider.getStats.invalidate(); setDeleteConfirm(null); },
  });
  const updateBookingStatus = trpc.provider.updateBookingStatus.useMutation({
    onSuccess: () => utils.provider.listBookings.invalidate(),
  });

  // Must be called before any conditional returns (React rules of hooks)
  const { data: notifData } = trpc.providerNotifications.list.useQuery(
    { unreadOnly: true, limit: 5, offset: 0 },
    { enabled: !!user && (user.role === "provider" || user.role === "admin"), refetchInterval: 60000 }
  );
  const unreadCount = notifData?.unreadCount ?? 0;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 rounded-2xl shadow-lg max-w-md">
          <Building2 className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">لوحة تحكم مزود الخدمة</h2>
          <p className="text-gray-500 mb-6">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
          <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors">
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  if (user.role !== "provider" && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-amber-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">صلاحية محدودة</h2>
          <p className="text-gray-500 mb-6">هذه الصفحة مخصصة لمزودي الخدمات فقط. تواصل معنا لتفعيل حسابك كمزود خدمة.</p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors">
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "programs", label: "برامجي", icon: <Package className="w-4 h-4" /> },
    { id: "bookings", label: "الحجوزات", icon: <Calendar className="w-4 h-4" /> },
    { id: "reviews", label: "التقييمات", icon: <Star className="w-4 h-4" /> },
    { id: "notifications", label: "الإشعارات", icon: <Bell className="w-4 h-4" />, badge: unreadCount },
    { id: "profile", label: "ملفي التعريفي", icon: <Settings className="w-4 h-4" /> },
    { id: "subscription", label: "الاشتراك", icon: <Crown className="w-4 h-4" /> },
  ] as const;

  const handleSaveProgram = (data: any) => {
    if (editingProgram) {
      updateProgram.mutate({ id: editingProgram.id, ...data });
    } else {
      createProgram.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50" dir="rtl">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="text-teal-600 hover:text-teal-700">
              <span className="text-lg font-bold">🕌 Go Umrah</span>
            </a>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-600">لوحة مزود الخدمة</span>
          </div>
          <div className="flex items-center gap-3">
            {profile?.status === "approved" && (
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" /> معتمد
              </span>
            )}
            {profile?.status === "pending" && (
              <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" /> قيد المراجعة
              </span>
            )}
            <span className="text-sm text-gray-600">{user.name}</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? "w-16" : "w-56"} min-h-[calc(100vh-57px)] bg-white/80 backdrop-blur border-l border-gray-100 transition-all duration-300 flex-shrink-0 sticky top-[57px] h-[calc(100vh-57px)]`}>
          <div className="p-3">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors mb-2">
              {sidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <nav className="space-y-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setSection(item.id as Section)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${section === item.id ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                  <div className="relative">
                    {item.icon}
                    {(item as any).badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {(item as any).badge > 9 ? "9+" : (item as any).badge}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && <span className="flex-1 text-right">{item.label}</span>}
                  {!sidebarCollapsed && (item as any).badge > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {(item as any).badge > 9 ? "9+" : (item as any).badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Overview */}
          {section === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">مرحباً، {profile?.companyNameAr || profile?.companyName || user.name} 👋</h1>
                <p className="text-gray-500 text-sm mt-1">إليك ملخص نشاطك على منصة Go Umrah</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Package className="w-5 h-5 text-teal-600" />} label="إجمالي البرامج" value={stats?.totalPrograms || 0} color="bg-teal-50" />
                <StatCard icon={<CheckCircle className="w-5 h-5 text-green-600" />} label="البرامج النشطة" value={stats?.activePrograms || 0} color="bg-green-50" />
                <StatCard icon={<Calendar className="w-5 h-5 text-blue-600" />} label="إجمالي الحجوزات" value={stats?.totalBookings || 0} color="bg-blue-50" />
                <StatCard icon={<Clock className="w-5 h-5 text-amber-600" />} label="حجوزات معلقة" value={stats?.pendingBookings || 0} color="bg-amber-50" />
              </div>

              {!profile && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">أكمل ملفك التعريفي</h3>
                    <p className="text-sm text-amber-700 mb-3">يرجى إكمال ملفك التعريفي لبدء إضافة البرامج وقبول الحجوزات.</p>
                    <button onClick={() => setSection("profile")} className="text-sm font-semibold text-amber-700 underline">
                      إكمال الملف التعريفي ←
                    </button>
                  </div>
                </div>
              )}

              {/* Subscription Status Banner */}
              <SubscriptionOverviewBanner onUpgrade={() => setSection("subscription")} />

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button onClick={() => { setSection("programs"); setShowProgramForm(true); }}
                  className="flex items-center gap-3 p-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl transition-colors">
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold text-sm">إضافة برنامج جديد</span>
                </button>
                <button onClick={() => setSection("bookings")}
                  className="flex items-center gap-3 p-4 bg-white/80 hover:bg-white border border-gray-200 text-gray-700 rounded-2xl transition-colors">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-sm">عرض الحجوزات</span>
                </button>
                <button onClick={() => setSection("profile")}
                  className="flex items-center gap-3 p-4 bg-white/80 hover:bg-white border border-gray-200 text-gray-700 rounded-2xl transition-colors">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-sm">إعدادات الحساب</span>
                </button>
              </div>

              {/* Recent Bookings */}
              {bookings && bookings.length > 0 && (
                <div className="bg-white/80 rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-4">آخر الحجوزات</h3>
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((b: any) => {
                      const statusInfo = BOOKING_STATUSES.find(s => s.value === b.status);
                      return (
                        <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <div>
                            <div className="font-semibold text-sm text-gray-800">{b.customerName}</div>
                            <div className="text-xs text-gray-400">#{b.bookingRef}</div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo?.color || "bg-gray-100 text-gray-600"}`}>
                              {statusInfo?.label || b.status}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">﷼{b.totalUSD}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Programs */}
          {section === "programs" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">برامجي</h1>
                  <p className="text-gray-500 text-sm mt-1">إدارة برامجك وعروضك السياحية</p>
                </div>
                <button onClick={() => { setShowProgramForm(true); setEditingProgram(null); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors">
                  <Plus className="w-4 h-4" />
                  إضافة برنامج
                </button>
              </div>

              {(showProgramForm || editingProgram) && (
                <div className="bg-white/90 rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4">{editingProgram ? "تعديل البرنامج" : "إضافة برنامج جديد"}</h3>
                  <ProgramForm
                    program={editingProgram}
                    onSave={handleSaveProgram}
                    onCancel={() => { setShowProgramForm(false); setEditingProgram(null); }}
                  />
                </div>
              )}

              {programsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                </div>
              ) : programs && programs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {programs.map((prog: any) => {
                    const typeInfo = PROGRAM_TYPES.find(t => t.value === prog.programType);
                    return (
                      <div key={prog.id} className="bg-white/80 rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{typeInfo?.emoji}</span>
                            <div>
                              <h3 className="font-bold text-gray-800 text-sm">{prog.titleAr || prog.title}</h3>
                              <p className="text-xs text-gray-400">{typeInfo?.label}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${prog.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {prog.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-gray-500">
                          <div><span className="font-semibold text-teal-700">﷼{prog.priceUSD}</span><br />السعر</div>
                          <div><span className="font-semibold">{prog.duration || "-"}</span><br />المدة</div>
                          <div><span className="font-semibold">{prog.availableSlots ?? "-"}</span><br />متاح</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingProgram(prog); setShowProgramForm(false); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors">
                            <Edit className="w-3 h-3" /> تعديل
                          </button>
                          <button onClick={() => updateProgram.mutate({ id: prog.id, isActive: !prog.isActive })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-medium transition-colors">
                            {prog.isActive ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                            {prog.isActive ? "إيقاف" : "تفعيل"}
                          </button>
                          {deleteConfirm === prog.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => deleteProgram.mutate({ id: prog.id })}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium">
                                تأكيد الحذف
                              </button>
                              <button onClick={() => setDeleteConfirm(null)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                                إلغاء
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirm(prog.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors">
                              <Trash2 className="w-3 h-3" /> حذف
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/60 rounded-2xl border border-dashed border-gray-200">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-500 mb-2">لا توجد برامج بعد</h3>
                  <p className="text-sm text-gray-400 mb-4">ابدأ بإضافة برنامجك الأول لاستقبال الحجوزات</p>
                  <button onClick={() => setShowProgramForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-colors">
                    <Plus className="w-4 h-4" /> إضافة برنامج
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Bookings */}
          {section === "bookings" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">الحجوزات</h1>
                <p className="text-gray-500 text-sm mt-1">إدارة حجوزات عملائك</p>
              </div>

              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                {[{ value: "", label: "الكل" }, ...BOOKING_STATUSES].map(s => (
                  <button key={s.value} onClick={() => setBookingFilter(s.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${bookingFilter === s.value ? "bg-teal-600 text-white" : "bg-white/80 border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {bookingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                </div>
              ) : bookings && bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.map((booking: any) => {
                    const statusInfo = BOOKING_STATUSES.find(s => s.value === booking.status);
                    return (
                      <div key={booking.id} className="bg-white/80 rounded-2xl border border-gray-100 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-gray-800">{booking.customerName}</div>
                            <div className="text-xs text-gray-400 mt-0.5">#{booking.bookingRef} · {booking.customerPhone || booking.customerEmail || ""}</div>
                          </div>
                          <div className="text-left">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo?.color || "bg-gray-100 text-gray-600"}`}>
                              {statusInfo?.label || booking.status}
                            </span>
                            <div className="text-sm font-bold text-teal-700 mt-1">﷼{booking.totalUSD}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500">تغيير الحالة:</span>
                          {BOOKING_STATUSES.map(s => (
                            <button key={s.value} onClick={() => updateBookingStatus.mutate({ id: booking.id, status: s.value as any })}
                              disabled={booking.status === s.value}
                              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${s.color}`}>
                              {s.label}
                            </button>
                          ))}
                        </div>
                        {booking.notes && (
                          <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{booking.notes}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/60 rounded-2xl border border-dashed border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-500 mb-2">لا توجد حجوزات</h3>
                  <p className="text-sm text-gray-400">ستظهر هنا حجوزات عملائك بمجرد نشر برامجك</p>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {section === "reviews" && <ReviewsSection />}

          {/* Notifications */}
          {section === "notifications" && <NotificationsSection />}

          {/* Subscription */}
          {section === "subscription" && (
            <SubscriptionSection />
          )}

          {/* Profile */}
          {section === "profile" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">الملف التعريفي</h1>
                <p className="text-gray-500 text-sm mt-1">معلومات شركتك وبيانات التواصل</p>
              </div>
              {profile?.status === "pending" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">ملفك التعريفي قيد المراجعة من قِبل الإدارة. سيتم إشعارك عند الموافقة.</p>
                </div>
              )}
              <div className="bg-white/80 rounded-2xl border border-gray-100 p-6">
                <ProfileForm
                  profile={profile}
                  onSave={(data) => upsertProfile.mutateAsync(data)}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
