import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Star, Globe, Hotel, Plane, FileText, Car, MapPin, Package,
  CheckCircle, HeartHandshake, Clock, Shield, Sparkles, Users,
  Phone, Mail, MessageCircle, Calendar, DollarSign,
  ArrowRight, Send,
} from "lucide-react";

const SERVICE_TYPES = [
  { id: "hajj", label: "الحج", icon: Star, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "باقات الحج المميزة" },
  { id: "umrah", label: "العمرة", icon: Globe, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", desc: "برامج العمرة" },
  { id: "hotel", label: "الفنادق", icon: Hotel, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", desc: "حجوزات الفنادق" },
  { id: "flight", label: "الرحلات", icon: Plane, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", desc: "تذاكر الطيران" },
  { id: "visa", label: "التأشيرة", icon: FileText, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", desc: "خدمات التأشيرة" },
  { id: "transport", label: "المواصلات", icon: Car, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", desc: "خدمات النقل" },
  { id: "tour", label: "الجولات", icon: MapPin, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", desc: "جولات الزيارة" },
  { id: "other", label: "أخرى", icon: Package, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", desc: "خدمات أخرى" },
];

const NATIONALITIES = ["سعودي", "مصري", "باكستاني", "هندي", "إندونيسي", "تركي", "بريطاني", "أمريكي", "إماراتي", "كويتي", "أردني", "مغربي", "جزائري", "تونسي", "ليبي", "سوداني", "يمني", "عراقي", "سوري", "لبناني", "أخرى"];
const CITIES = ["الرياض", "جدة", "الدمام", "أبها", "مكة المكرمة", "المدينة المنورة", "القاهرة", "الإسكندرية", "دبي", "أبوظبي", "لندن", "مانشستر", "باريس", "إسطنبول", "كراتشي", "لاهور", "مومباي", "دلهي", "جاكرتا", "كوالالمبور", "أخرى"];
const CURRENCIES = ["SAR", "USD", "EUR", "GBP", "EGP", "PKR", "INR"];

export default function FlexibleRequest() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [form, setForm] = useState({
    serviceType: "" as any,
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerWhatsapp: "",
    nationality: "",
    departureCity: "",
    destination: "",
    travelDate: "",
    returnDate: "",
    adults: 1,
    children: 0,
    budgetMin: "",
    budgetMax: "",
    currency: "SAR",
    hotelStars: "",
    specialRequirements: "",
    notes: "",
  });

  const createMutation = trpc.flexibleRequest.create.useMutation({
    onSuccess: (data) => {
      setRequestId(data.requestId);
      setSubmitted(true);
      toast.success("تم إرسال طلبك بنجاح!");
    },
    onError: (e) => toast.error(e.message),
  });

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.customerName || !form.customerPhone || !form.serviceType) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }
    createMutation.mutate({
      ...form,
      adults: Number(form.adults),
      children: Number(form.children),
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      hotelStars: form.hotelStars ? Number(form.hotelStars) : undefined,
    } as any);
  };

  const resetForm = () => {
    setSubmitted(false);
    setStep(1);
    setForm({
      serviceType: "" as any,
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerWhatsapp: "",
      nationality: "",
      departureCity: "",
      destination: "",
      travelDate: "",
      returnDate: "",
      adults: 1,
      children: 0,
      budgetMin: "",
      budgetMax: "",
      currency: "SAR",
      hotelStars: "",
      specialRequirements: "",
      notes: "",
    });
  };

  // ─── Confirmation / Thank-you page ───────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        dir="rtl"
        style={{ background: "linear-gradient(135deg, #0d3d3d 0%, #1B5E52 50%, #0d3d3d 100%)" }}
      >
        {/* Decorative pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23C9A96E' stroke-width='0.9'><path d='M 100,54 A 55.744,55.744 0 0,0 146,100 A 55.744,55.744 0 0,0 100,146 A 55.744,55.744 0 0,0 54,100 A 55.744,55.744 0 0,0 100,54 Z'/><path d='M 0,-46 A 55.744,55.744 0 0,0 46,0 A 55.744,55.744 0 0,0 0,46 A 55.744,55.744 0 0,0 -46,0 A 55.744,55.744 0 0,0 0,-46 Z'/><path d='M 200,-46 A 55.744,55.744 0 0,0 246,0 A 55.744,55.744 0 0,0 200,46 A 55.744,55.744 0 0,0 154,0 A 55.744,55.744 0 0,0 200,-46 Z'/><path d='M 0,154 A 55.744,55.744 0 0,0 46,200 A 55.744,55.744 0 0,0 0,246 A 55.744,55.744 0 0,0 -46,200 A 55.744,55.744 0 0,0 0,154 Z'/><path d='M 200,154 A 55.744,55.744 0 0,0 246,200 A 55.744,55.744 0 0,0 200,246 A 55.744,55.744 0 0,0 154,200 A 55.744,55.744 0 0,0 200,154 Z'/><path d='M 100,-7 L 107,0 L 100,7 L 93,0 Z'/><path d='M 100,193 L 107,200 L 100,207 L 93,200 Z'/><path d='M -7,100 L 0,107 L 7,100 L 0,93 Z'/><path d='M 193,100 L 200,107 L 207,100 L 200,93 Z'/><path d='M 50,43 L 57,50 L 50,57 L 43,50 Z'/><path d='M 150,43 L 157,50 L 150,57 L 143,50 Z'/><path d='M 50,143 L 57,150 L 50,157 L 43,150 Z'/><path d='M 150,143 L 157,150 L 150,157 L 143,150 Z'/></g></svg>")`,
            backgroundRepeat: "repeat",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #1B5E52, #C9A96E, #1B5E52)" }} />
          <div className="p-8 text-center">
            {/* Success icon with star badge */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                <Star className="w-4 h-4 fill-white text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2" style={{ color: "#1B5E52", fontFamily: "'Tajawal', sans-serif" }}>
              تم إرسال طلبك بنجاح!
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              سيتواصل معك فريقنا المتخصص خلال <strong>24 ساعة</strong> لتقديم أفضل عرض يناسب احتياجاتك
            </p>

            {/* Reference number card */}
            <div
              className="rounded-2xl p-5 mb-6 border-2 border-dashed"
              style={{ background: "#f0faf8", borderColor: "#1B5E52" }}
            >
              <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-widest">رقم طلبك المرجعي</div>
              <div className="font-mono font-bold text-lg tracking-widest" style={{ color: "#1B5E52" }}>{requestId}</div>
              <div className="text-[11px] text-gray-400 mt-1">احتفظ بهذا الرقم لمتابعة طلبك</div>
            </div>

            {/* Steps timeline */}
            <div className="text-right mb-6">
              <div className="text-sm font-bold mb-3" style={{ color: "#1B5E52", fontFamily: "'Tajawal', sans-serif" }}>
                خطوات ما بعد الإرسال
              </div>
              <div className="space-y-3">
                {[
                  { step: "1", title: "مراجعة طلبك", desc: "يقوم فريقنا بمراجعة تفاصيل طلبك خلال ساعتين", color: "bg-blue-500" },
                  { step: "2", title: "إعداد العرض", desc: "نصمم لك باقة مخصصة تناسب ميزانيتك ومتطلباتك", color: "bg-amber-500" },
                  { step: "3", title: "التواصل معك", desc: "نتصل بك عبر الهاتف أو واتساب لتأكيد التفاصيل", color: "bg-green-500" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full ${item.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {item.step}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-800">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact channels */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { icon: Phone, label: "اتصال مباشر", desc: "خلال ساعة", color: "bg-blue-50 border-blue-100 text-blue-600" },
                { icon: MessageCircle, label: "واتساب", desc: "رد فوري", color: "bg-green-50 border-green-100 text-green-600" },
                { icon: Mail, label: "بريد إلكتروني", desc: "خلال 24 ساعة", color: "bg-purple-50 border-purple-100 text-purple-600" },
                { icon: Clock, label: "دعم 24/7", desc: "دائماً هنا", color: "bg-amber-50 border-amber-100 text-amber-600" },
              ].map((item) => (
                <div key={item.label} className={`flex items-center gap-2 p-3 rounded-xl border ${item.color}`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] opacity-70">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="flex-1 rounded-xl border-gray-200"
              >
                الصفحة الرئيسية
              </Button>
              <Button
                onClick={resetForm}
                className="flex-1 rounded-xl text-white"
                style={{ background: "#1B5E52" }}
              >
                طلب جديد
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-[var(--teal-900)] via-[var(--teal-800)] to-[var(--teal-900)] overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23C9A96E' stroke-width='0.9'><path d='M 100,54 A 55.744,55.744 0 0,0 146,100 A 55.744,55.744 0 0,0 100,146 A 55.744,55.744 0 0,0 54,100 A 55.744,55.744 0 0,0 100,54 Z'/><path d='M 0,-46 A 55.744,55.744 0 0,0 46,0 A 55.744,55.744 0 0,0 0,46 A 55.744,55.744 0 0,0 -46,0 A 55.744,55.744 0 0,0 0,-46 Z'/><path d='M 200,-46 A 55.744,55.744 0 0,0 246,0 A 55.744,55.744 0 0,0 200,46 A 55.744,55.744 0 0,0 154,0 A 55.744,55.744 0 0,0 200,-46 Z'/><path d='M 0,154 A 55.744,55.744 0 0,0 46,200 A 55.744,55.744 0 0,0 0,246 A 55.744,55.744 0 0,0 -46,200 A 55.744,55.744 0 0,0 0,154 Z'/><path d='M 200,154 A 55.744,55.744 0 0,0 246,200 A 55.744,55.744 0 0,0 200,246 A 55.744,55.744 0 0,0 154,200 A 55.744,55.744 0 0,0 200,154 Z'/><path d='M 100,-7 L 107,0 L 100,7 L 93,0 Z'/><path d='M 100,193 L 107,200 L 100,207 L 93,200 Z'/><path d='M -7,100 L 0,107 L 7,100 L 0,93 Z'/><path d='M 193,100 L 200,107 L 207,100 L 200,93 Z'/><path d='M 50,43 L 57,50 L 50,57 L 43,50 Z'/><path d='M 150,43 L 157,50 L 150,57 L 143,50 Z'/><path d='M 50,143 L 57,150 L 50,157 L 43,150 Z'/><path d='M 150,143 L 157,150 L 150,157 L 143,150 Z'/></g></svg>")`,
          backgroundRepeat: "repeat", backgroundSize: "60px 60px",
        }} />
        <div className="container relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--gold)]/20 border border-[var(--gold)]/30 flex items-center justify-center mx-auto mb-6">
            <HeartHandshake className="w-8 h-8 text-[var(--gold)]" />
          </div>
          <Badge className="mb-4 bg-[var(--gold)]/20 text-[var(--gold-light)] border-[var(--gold)]/30 text-xs tracking-widest uppercase px-4 py-1.5">
            خدمة مخصصة
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            طلبك المرن
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
            لم تجد ما تبحث عنه؟ أخبرنا بتفاصيل رحلتك وسنصمم لك الباقة المثالية وفق ميزانيتك واحتياجاتك
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { icon: Sparkles, label: "تصميم مخصص" },
              { icon: Clock, label: "رد خلال 24 ساعة" },
              { icon: Shield, label: "ضمان الجودة" },
              { icon: HeartHandshake, label: "دعم كامل" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 border border-white/20">
                <f.icon className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-white text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-3xl">
          {/* Progress steps */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {[
              { n: 1, label: "نوع الخدمة" },
              { n: 2, label: "بياناتك" },
              { n: 3, label: "تفاصيل الرحلة" },
            ].map((s, idx) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step >= s.n ? "text-white shadow-md" : "bg-gray-200 text-gray-400"
                    }`}
                    style={step >= s.n ? { background: "#1B5E52" } : {}}
                  >
                    {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${step >= s.n ? "text-gray-700" : "text-gray-400"}`}>{s.label}</span>
                </div>
                {idx < 2 && <div className={`w-12 h-0.5 ${step > s.n ? "bg-teal-600" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            {/* Step 1: Service Type */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "#1B5E52", fontFamily: "'Tajawal', sans-serif" }}>
                  ما الخدمة التي تبحث عنها؟
                </h2>
                <p className="text-gray-500 text-sm mb-6">اختر نوع الخدمة التي تحتاجها وسنقدم لك أفضل العروض</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {SERVICE_TYPES.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => update("serviceType", svc.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all hover:shadow-md ${
                        form.serviceType === svc.id
                          ? `${svc.bg} ${svc.border} shadow-md`
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <svc.icon className={`w-6 h-6 mx-auto mb-2 ${form.serviceType === svc.id ? svc.color : "text-gray-400"}`} />
                      <div className={`text-sm font-semibold ${form.serviceType === svc.id ? svc.color : "text-gray-600"}`}>{svc.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{svc.desc}</div>
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => { if (!form.serviceType) { toast.error("يرجى اختيار نوع الخدمة"); return; } setStep(2); }}
                  className="w-full rounded-xl text-white gap-2"
                  style={{ background: "#1B5E52" }}
                >
                  التالي <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "#1B5E52", fontFamily: "'Tajawal', sans-serif" }}>
                  بياناتك الشخصية
                </h2>
                <p className="text-gray-500 text-sm mb-6">سنستخدم هذه البيانات للتواصل معك وتقديم العرض المناسب</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الاسم الكامل *</Label>
                    <Input value={form.customerName} onChange={e => update("customerName", e.target.value)} placeholder="أدخل اسمك الكامل" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">رقم الهاتف *</Label>
                    <Input value={form.customerPhone} onChange={e => update("customerPhone", e.target.value)} placeholder="+966 5X XXX XXXX" className="rounded-xl" dir="ltr" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">البريد الإلكتروني</Label>
                    <Input value={form.customerEmail} onChange={e => update("customerEmail", e.target.value)} placeholder="example@email.com" className="rounded-xl" dir="ltr" type="email" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">واتساب</Label>
                    <Input value={form.customerWhatsapp} onChange={e => update("customerWhatsapp", e.target.value)} placeholder="+966 5X XXX XXXX" className="rounded-xl" dir="ltr" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">الجنسية</Label>
                    <select value={form.nationality} onChange={e => update("nationality", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">اختر الجنسية</option>
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 block">مدينة الانطلاق</Label>
                    <select value={form.departureCity} onChange={e => update("departureCity", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">اختر المدينة</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">السابق</Button>
                  <Button
                    onClick={() => { if (!form.customerName || !form.customerPhone) { toast.error("يرجى ملء الاسم ورقم الهاتف"); return; } setStep(3); }}
                    className="flex-1 rounded-xl text-white gap-2"
                    style={{ background: "#1B5E52" }}
                  >
                    التالي <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Trip Details */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: "#1B5E52", fontFamily: "'Tajawal', sans-serif" }}>
                  تفاصيل الرحلة
                </h2>
                <p className="text-gray-500 text-sm mb-6">كلما أضفت تفاصيل أكثر، كان عرضنا أدق وأنسب لك</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5 block">
                      <Calendar className="w-3.5 h-3.5" />تاريخ السفر
                    </Label>
                    <Input value={form.travelDate} onChange={e => update("travelDate", e.target.value)} type="date" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5 block">
                      <Calendar className="w-3.5 h-3.5" />تاريخ العودة
                    </Label>
                    <Input value={form.returnDate} onChange={e => update("returnDate", e.target.value)} type="date" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5 block">
                      <Users className="w-3.5 h-3.5" />عدد البالغين
                    </Label>
                    <Input value={form.adults} onChange={e => update("adults", e.target.value)} type="number" min="1" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5 block">
                      <Users className="w-3.5 h-3.5" />عدد الأطفال
                    </Label>
                    <Input value={form.children} onChange={e => update("children", e.target.value)} type="number" min="0" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5 block">
                      <DollarSign className="w-3.5 h-3.5" />الميزانية (من)
                    </Label>
                    <Input value={form.budgetMin} onChange={e => update("budgetMin", e.target.value)} type="number" placeholder="0" className="rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5 block">
                      <DollarSign className="w-3.5 h-3.5" />الميزانية (إلى)
                    </Label>
                    <div className="flex gap-2">
                      <Input value={form.budgetMax} onChange={e => update("budgetMax", e.target.value)} type="number" placeholder="غير محدد" className="rounded-xl flex-1" />
                      <select value={form.currency} onChange={e => update("currency", e.target.value)} className="rounded-xl border border-gray-200 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-20">
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  {(form.serviceType === "hotel" || form.serviceType === "hajj" || form.serviceType === "umrah") && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-1.5 block">تصنيف الفندق (نجوم)</Label>
                      <select value={form.hotelStars} onChange={e => update("hotelStars", e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">أي تصنيف</option>
                        {[3, 4, 5].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">متطلبات خاصة</Label>
                  <Textarea
                    value={form.specialRequirements}
                    onChange={e => update("specialRequirements", e.target.value)}
                    placeholder="أخبرنا بأي متطلبات خاصة مثل: غرف مزدوجة، احتياجات طبية، تفضيلات الطعام..."
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                </div>
                <div className="mb-6">
                  <Label className="text-sm font-medium text-gray-700 mb-1.5 block">ملاحظات إضافية</Label>
                  <Textarea
                    value={form.notes}
                    onChange={e => update("notes", e.target.value)}
                    placeholder="أي معلومات إضافية تريد إضافتها..."
                    className="rounded-xl resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl">السابق</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending}
                    className="flex-1 rounded-xl text-white gap-2"
                    style={{ background: "#1B5E52" }}
                  >
                    {createMutation.isPending ? "جاري الإرسال..." : <><Send className="w-4 h-4" />إرسال الطلب</>}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
