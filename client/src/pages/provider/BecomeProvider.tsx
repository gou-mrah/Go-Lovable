import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  Building2, CheckCircle, Crown, Zap, Shield, Star, ArrowRight,
  ArrowLeft, Loader2, Phone, Mail, Globe, MapPin, FileText,
  Upload, AlertCircle, BadgeCheck, Users, TrendingUp, Award,
  ChevronRight, X,
} from "lucide-react";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png";

const COMPANY_TYPES = [
  { value: "travel_agency", label: "وكالة سفر وسياحة" },
  { value: "hotel", label: "فندق أو منشأة إيواء" },
  { value: "airline", label: "شركة طيران" },
  { value: "transport", label: "شركة نقل وتنقلات" },
  { value: "visa_service", label: "خدمات التأشيرات" },
  { value: "tour_operator", label: "منظم جولات سياحية" },
  { value: "other", label: "أخرى" },
];

const SERVICE_TYPES = [
  { value: "hajj", label: "🕌 حج", desc: "برامج الحج الكاملة" },
  { value: "umrah", label: "🌙 عمرة", desc: "باقات العمرة" },
  { value: "hotel", label: "🏨 فنادق", desc: "حجوزات الفنادق" },
  { value: "flight", label: "✈️ طيران", desc: "تذاكر الطيران" },
  { value: "visa", label: "📋 تأشيرات", desc: "خدمات التأشيرات" },
  { value: "transport", label: "🚌 نقل", desc: "خدمات النقل" },
  { value: "tour", label: "🗺️ جولات", desc: "الجولات السياحية" },
];

const BENEFITS = [
  { icon: <Users className="w-5 h-5" />, title: "آلاف العملاء شهرياً", desc: "وصول مباشر لحجاج ومعتمرين من أكثر من 50 دولة" },
  { icon: <TrendingUp className="w-5 h-5" />, title: "نمو مضمون", desc: "أدوات تسويق وتحليلات لتعزيز مبيعاتك" },
  { icon: <Shield className="w-5 h-5" />, title: "منصة آمنة وموثوقة", desc: "نظام دفع آمن وحماية كاملة للمعاملات" },
  { icon: <Award className="w-5 h-5" />, title: "دعم فني متواصل", desc: "فريق متخصص لمساعدتك على مدار الساعة" },
];

const PLAN_COLORS: Record<string, string> = {
  free_trial: "from-slate-400 to-slate-500",
  premium_basic: "from-teal-500 to-teal-600",
  premium_plus: "from-amber-500 to-amber-600",
};
const PLAN_ICONS: Record<string, React.ReactNode> = {
  free_trial: <Shield className="w-6 h-6 text-white" />,
  premium_basic: <Zap className="w-6 h-6 text-white" />,
  premium_plus: <Crown className="w-6 h-6 text-white" />,
};

type Step = "plans" | "form" | "success";

export default function BecomeProvider() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [form, setForm] = useState({
    companyName: "",
    companyNameAr: "",
    companyType: "travel_agency",
    licenseNumber: "",
    licenseExpiry: "",
    licenseAuthority: "",
    contactName: user?.name || "",
    contactPhone: "",
    contactWhatsapp: "",
    contactEmail: user?.email || "",
    website: "",
    country: "SA",
    city: "",
    address: "",
    description: "",
  });

  const { data: plans, isLoading: plansLoading } = trpc.subscriptions.listPlans.useQuery();
  const { data: myApp } = trpc.providerApplication.getMyApplication.useQuery(
    undefined,
    { enabled: !!user }
  );

  const applyMutation = trpc.providerApplication.submitApplication.useMutation({
    onSuccess: () => {
      setStep("success");
    },
    onError: (e) => {
      toast.error(`خطأ: ${e.message}`);
    },
  });

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setStep("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = getLoginUrl("/become-provider");
      return;
    }
    if (selectedServices.length === 0) {
      toast.error("يرجى اختيار نوع الخدمة المقدمة");
      return;
    }
    applyMutation.mutate({
      ...form,
      serviceTypes: selectedServices,
    } as any);
  };

  const toggleService = (val: string) => {
    setSelectedServices(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-600 mb-1.5";

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-amber-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // Already applied
  if (myApp) {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: "قيد الانتظار", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <Loader2 className="w-5 h-5 animate-spin" /> },
      under_review: { label: "قيد المراجعة", color: "text-blue-600 bg-blue-50 border-blue-200", icon: <FileText className="w-5 h-5" /> },
      approved: { label: "تمت الموافقة ✅", color: "text-green-600 bg-green-50 border-green-200", icon: <CheckCircle className="w-5 h-5" /> },
      rejected: { label: "مرفوض", color: "text-red-600 bg-red-50 border-red-200", icon: <X className="w-5 h-5" /> },
    };
    const statusInfo = statusMap[myApp.status] || statusMap.pending;
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <img src={LOGO_URL} alt="Go Umrah" className="h-12 mx-auto mb-6" />
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold mb-4 ${statusInfo.color}`}>
            {statusInfo.icon}
            {statusInfo.label}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">طلبك قيد المعالجة</h2>
          <p className="text-gray-500 text-sm mb-2">
            تم استلام طلبك للانضمام كمزود خدمة لـ <strong>{myApp.companyName}</strong>.
          </p>
          {myApp.status === "pending" && (
            <p className="text-gray-400 text-xs mb-6">سيتم مراجعة طلبك خلال 24-48 ساعة وسيتم إشعارك بالنتيجة.</p>
          )}
          {myApp.status === "approved" && (
            <div className="mt-4">
              <p className="text-green-600 text-sm mb-4">تهانينا! تم قبول طلبك. يمكنك الآن الوصول إلى لوحة تحكم المزود.</p>
              <Link href="/provider">
                <button className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-colors">
                  الذهاب إلى لوحة التحكم ←
                </button>
              </Link>
            </div>
          )}
          {myApp.status === "rejected" && myApp.adminNotes && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
              <strong>سبب الرفض:</strong> {myApp.adminNotes}
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link href="/">
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                ← العودة للرئيسية
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50" dir="rtl">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <img src={LOGO_URL} alt="Go Umrah" className="h-9" />
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={() => step === "form" ? setStep("plans") : null}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${step === "plans" ? "bg-teal-600 text-white" : "text-gray-400"}`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">1</span>
              اختر الباقة
            </button>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${step === "form" ? "bg-teal-600 text-white" : "text-gray-400"}`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">2</span>
              بيانات الشركة
            </button>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${step === "success" ? "bg-teal-600 text-white" : "text-gray-400"}`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">3</span>
              تأكيد الطلب
            </button>
          </div>
          {user ? (
            <span className="text-sm text-gray-600">{user.name}</span>
          ) : (
            <a href={getLoginUrl("/become-provider")} className="text-sm text-teal-600 font-medium hover:text-teal-700">
              تسجيل الدخول
            </a>
          )}
        </div>
      </header>

      {/* Step 1: Plan Selection */}
      {step === "plans" && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              <Building2 className="w-4 h-4" />
              انضم كمزود خدمة
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              ابدأ رحلتك مع جو عمرة
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              اختر الباقة المناسبة لنشاطك التجاري وابدأ في عرض خدماتك لآلاف الحجاج والمعتمرين
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-white/80 rounded-2xl p-4 border border-gray-100 text-center">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mx-auto mb-3">
                  {b.icon}
                </div>
                <div className="font-semibold text-gray-800 text-sm mb-1">{b.title}</div>
                <div className="text-gray-400 text-xs">{b.desc}</div>
              </div>
            ))}
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setSelectedBillingCycle("monthly")}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${selectedBillingCycle === "monthly" ? "bg-teal-600 text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}
            >
              شهري
            </button>
            <button
              onClick={() => setSelectedBillingCycle("annual")}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${selectedBillingCycle === "annual" ? "bg-teal-600 text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}
            >
              سنوي
              <span className="mr-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">وفر 17%</span>
            </button>
          </div>

          {/* Plans Grid */}
          {plansLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {(plans || []).map((plan: any, idx: number) => {
                const price = selectedBillingCycle === "annual"
                  ? (parseFloat(plan.annualPriceSAR) / 12).toFixed(0)
                  : parseFloat(plan.monthlyPriceSAR).toFixed(0);
                const isPopular = plan.slug === "premium_basic";
                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-3xl border-2 p-6 transition-all hover:shadow-lg ${
                      isPopular ? "border-teal-500 shadow-md scale-105" : "border-gray-100 hover:border-teal-200"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                        الأكثر شيوعاً
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${PLAN_COLORS[plan.slug] || "from-gray-400 to-gray-500"} mb-4`}>
                      {PLAN_ICONS[plan.slug]}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{plan.nameAr}</h3>
                    <p className="text-gray-400 text-sm mb-4">{plan.descriptionAr}</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-gray-800">
                        {parseFloat(plan.monthlyPriceSAR) === 0 ? "مجاني" : `${price} ﷼`}
                      </span>
                      {parseFloat(plan.monthlyPriceSAR) > 0 && (
                        <span className="text-gray-400 text-sm">/شهر</span>
                      )}
                      {selectedBillingCycle === "annual" && parseFloat(plan.annualPriceSAR) > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          يُدفع سنوياً: {parseFloat(plan.annualPriceSAR).toFixed(0)} ﷼
                        </div>
                      )}
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                        {plan.maxPrograms === -1 ? "برامج غير محدودة" : `حتى ${plan.maxPrograms} برامج`}
                      </li>
                      {plan.trialDays > 0 && (
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          تجربة مجانية {plan.trialDays} يوم
                        </li>
                      )}
                      {plan.isFeaturedInListings && (
                        <li className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          ظهور مميز في نتائج البحث
                        </li>
                      )}
                      {(plan.featuresAr || []).slice(0, 3).map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                        isPopular
                          ? "bg-teal-600 hover:bg-teal-700 text-white"
                          : "bg-gray-50 hover:bg-teal-50 text-gray-700 hover:text-teal-700 border border-gray-200 hover:border-teal-300"
                      }`}
                    >
                      {parseFloat(plan.monthlyPriceSAR) === 0 ? "ابدأ مجاناً" : "ابدأ الآن"}
                      <ArrowLeft className="w-4 h-4 inline mr-2" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* FAQ */}
          <div className="bg-white/80 rounded-3xl border border-gray-100 p-8 max-w-3xl mx-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">أسئلة شائعة</h3>
            <div className="space-y-4">
              {[
                { q: "هل يمكنني الترقية لاحقاً؟", a: "نعم، يمكنك الترقية في أي وقت من لوحة تحكم المزود." },
                { q: "ما هي مدة مراجعة الطلب؟", a: "يتم مراجعة الطلبات خلال 24-48 ساعة عمل." },
                { q: "هل يمكنني إلغاء الاشتراك؟", a: "نعم، يمكنك إلغاء الاشتراك في أي وقت دون رسوم إضافية." },
              ].map((item, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="font-semibold text-gray-700 text-sm mb-1">{item.q}</div>
                  <div className="text-gray-400 text-sm">{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Application Form */}
      {step === "form" && (
        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Selected Plan Banner */}
          {selectedPlan && (
            <div className={`bg-gradient-to-r ${PLAN_COLORS[selectedPlan.slug] || "from-teal-500 to-teal-600"} rounded-2xl p-4 mb-8 text-white flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {PLAN_ICONS[selectedPlan.slug]}
                <div>
                  <div className="font-bold">{selectedPlan.nameAr}</div>
                  <div className="text-white/70 text-xs">
                    {parseFloat(selectedPlan.monthlyPriceSAR) === 0
                      ? "مجاني"
                      : selectedBillingCycle === "annual"
                        ? `${(parseFloat(selectedPlan.annualPriceSAR) / 12).toFixed(0)} ﷼/شهر (سنوي)`
                        : `${parseFloat(selectedPlan.monthlyPriceSAR).toFixed(0)} ﷼/شهر`
                    }
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep("plans")}
                className="text-white/70 hover:text-white text-sm underline"
              >
                تغيير الباقة
              </button>
            </div>
          )}

          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-800 text-sm">تسجيل الدخول مطلوب</div>
                <div className="text-amber-700 text-xs mt-1">
                  يرجى{" "}
                  <a href={getLoginUrl("/become-provider")} className="underline font-medium">
                    تسجيل الدخول أو إنشاء حساب
                  </a>{" "}
                  لإكمال الطلب.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                معلومات الشركة
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>اسم الشركة (عربي) *</label>
                  <input
                    className={inputClass}
                    value={form.companyNameAr}
                    onChange={e => setForm({ ...form, companyNameAr: e.target.value })}
                    placeholder="اسم الشركة بالعربية"
                    dir="rtl"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Company Name (English) *</label>
                  <input
                    className={inputClass}
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                    placeholder="Company name in English"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>نوع الشركة *</label>
                  <select
                    className={inputClass}
                    value={form.companyType}
                    onChange={e => setForm({ ...form, companyType: e.target.value })}
                  >
                    {COMPANY_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>رقم الترخيص التجاري</label>
                  <input
                    className={inputClass}
                    value={form.licenseNumber}
                    onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
                    placeholder="رقم السجل التجاري"
                  />
                </div>
                <div>
                  <label className={labelClass}>تاريخ انتهاء الترخيص</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.licenseExpiry}
                    onChange={e => setForm({ ...form, licenseExpiry: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>الجهة المرخصة</label>
                  <input
                    className={inputClass}
                    value={form.licenseAuthority}
                    onChange={e => setForm({ ...form, licenseAuthority: e.target.value })}
                    placeholder="مثال: وزارة السياحة"
                  />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4">الخدمات المقدمة *</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SERVICE_TYPES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleService(s.value)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      selectedServices.includes(s.value)
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-100 hover:border-teal-200 text-gray-600"
                    }`}
                  >
                    <div className="text-lg mb-1">{s.label.split(" ")[0]}</div>
                    <div className="text-xs font-medium">{s.label.split(" ").slice(1).join(" ")}</div>
                    <div className="text-xs text-gray-400">{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-teal-600" />
                معلومات التواصل
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>اسم المسؤول *</label>
                  <input
                    className={inputClass}
                    value={form.contactName}
                    onChange={e => setForm({ ...form, contactName: e.target.value })}
                    placeholder="الاسم الكامل"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>البريد الإلكتروني *</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={form.contactEmail}
                    onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="email@company.com"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>رقم الهاتف *</label>
                  <input
                    className={inputClass}
                    value={form.contactPhone}
                    onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="+966 5X XXX XXXX"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>واتساب</label>
                  <input
                    className={inputClass}
                    value={form.contactWhatsapp}
                    onChange={e => setForm({ ...form, contactWhatsapp: e.target.value })}
                    placeholder="+966 5X XXX XXXX"
                  />
                </div>
                <div>
                  <label className={labelClass}>الموقع الإلكتروني</label>
                  <input
                    className={inputClass}
                    value={form.website}
                    onChange={e => setForm({ ...form, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className={labelClass}>المدينة</label>
                  <input
                    className={inputClass}
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    placeholder="الرياض"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass}>نبذة عن الشركة</label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="اكتب نبذة مختصرة عن شركتك وخدماتها..."
                  dir="rtl"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="bg-teal-50 rounded-2xl border border-teal-100 p-4 text-sm text-teal-800">
              <div className="flex items-start gap-2">
                <BadgeCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  بتقديم هذا الطلب، أوافق على{" "}
                  <a href="/terms" className="underline font-medium">شروط الاستخدام</a>{" "}
                  و{" "}
                  <a href="/privacy" className="underline font-medium">سياسة الخصوصية</a>{" "}
                  لمنصة جو عمرة.
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={applyMutation.isPending || !user}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
              >
                {applyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    تقديم الطلب
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep("plans")}
                className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-colors"
              >
                رجوع
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Success */}
      {step === "success" && (
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">تم استلام طلبك بنجاح!</h1>
          <p className="text-gray-500 mb-2">
            شكراً لاهتمامك بالانضمام إلى منصة جو عمرة كمزود خدمة.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            سيتم مراجعة طلبك خلال 24-48 ساعة عمل وسيتم التواصل معك على البريد الإلكتروني المسجل.
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-8 text-right">
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">الباقة المطلوبة:</span>{" "}
              {selectedPlan?.nameAr}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">الخطوة التالية:</span>{" "}
              انتظر رسالة تأكيد على بريدك الإلكتروني
            </div>
          </div>
          <Link href="/">
            <button className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors">
              العودة للرئيسية
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
