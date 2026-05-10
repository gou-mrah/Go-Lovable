import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Building2, User, Upload, ArrowRight, Loader2, Star } from "lucide-react";

// ─── Countries & Cities ────────────────────────────────────────────────────
const WORLD_COUNTRIES_CITIES: Record<string, { nameAr: string; code: string; cities: string[] }> = {
  SA: { nameAr: "المملكة العربية السعودية", code: "SA", cities: ["مكة المكرمة", "المدينة المنورة", "الرياض", "جدة", "الدمام", "الطائف", "تبوك", "أبها", "القصيم", "حائل"] },
  EG: { nameAr: "مصر", code: "EG", cities: ["القاهرة", "الإسكندرية", "الجيزة", "شرم الشيخ", "الأقصر", "أسوان", "الغردقة", "المنصورة", "طنطا", "الإسماعيلية"] },
  AE: { nameAr: "الإمارات العربية المتحدة", code: "AE", cities: ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين"] },
  JO: { nameAr: "الأردن", code: "JO", cities: ["عمّان", "الزرقاء", "إربد", "العقبة", "السلط", "المفرق", "الكرك"] },
  KW: { nameAr: "الكويت", code: "KW", cities: ["مدينة الكويت", "حولي", "الفروانية", "الجهراء", "مبارك الكبير", "الأحمدي"] },
  BH: { nameAr: "البحرين", code: "BH", cities: ["المنامة", "المحرق", "الرفاع", "مدينة عيسى", "مدينة حمد", "سترة"] },
  QA: { nameAr: "قطر", code: "QA", cities: ["الدوحة", "الريان", "الوكرة", "الخور", "الشمال", "أم صلال"] },
  OM: { nameAr: "عُمان", code: "OM", cities: ["مسقط", "صلالة", "نزوى", "صحار", "صور", "البريمي", "مطرح"] },
  YE: { nameAr: "اليمن", code: "YE", cities: ["صنعاء", "عدن", "تعز", "الحديدة", "إب", "ذمار", "المكلا"] },
  IQ: { nameAr: "العراق", code: "IQ", cities: ["بغداد", "البصرة", "الموصل", "أربيل", "كركوك", "النجف", "كربلاء", "السليمانية"] },
  SY: { nameAr: "سوريا", code: "SY", cities: ["دمشق", "حلب", "حمص", "اللاذقية", "حماة", "دير الزور", "الرقة"] },
  LB: { nameAr: "لبنان", code: "LB", cities: ["بيروت", "طرابلس", "صيدا", "صور", "زحلة", "جبيل"] },
  MA: { nameAr: "المغرب", code: "MA", cities: ["الرباط", "الدار البيضاء", "فاس", "مراكش", "أكادير", "طنجة", "مكناس", "وجدة"] },
  DZ: { nameAr: "الجزائر", code: "DZ", cities: ["الجزائر العاصمة", "وهران", "قسنطينة", "عنابة", "بليدة", "سطيف", "تلمسان"] },
  TN: { nameAr: "تونس", code: "TN", cities: ["تونس", "صفاقس", "سوسة", "القيروان", "بنزرت", "قابس", "أريانة"] },
  LY: { nameAr: "ليبيا", code: "LY", cities: ["طرابلس", "بنغازي", "مصراتة", "الزاوية", "البيضاء", "سبها"] },
  SD: { nameAr: "السودان", code: "SD", cities: ["الخرطوم", "أم درمان", "بورتسودان", "كسلا", "الأبيض", "الفاشر"] },
  PK: { nameAr: "باكستان", code: "PK", cities: ["كراتشي", "لاهور", "إسلام آباد", "فيصل آباد", "راولبندي", "ملتان", "حيدر آباد"] },
  IN: { nameAr: "الهند", code: "IN", cities: ["نيودلهي", "مومباي", "بنغالور", "حيدر آباد", "أحمد آباد", "كولكاتا", "تشيناي"] },
  ID: { nameAr: "إندونيسيا", code: "ID", cities: ["جاكرتا", "سورابايا", "باندونغ", "ميدان", "سيمارانغ", "ماكاسار", "يوغياكارتا"] },
  MY: { nameAr: "ماليزيا", code: "MY", cities: ["كوالالمبور", "جورج تاون", "إيبوه", "جوهور بهرو", "كوتا كينابالو", "كوتشينغ"] },
  TR: { nameAr: "تركيا", code: "TR", cities: ["إسطنبول", "أنقرة", "إزمير", "بورصة", "أنطاليا", "أضنة", "قونية"] },
  IR: { nameAr: "إيران", code: "IR", cities: ["طهران", "مشهد", "أصفهان", "شيراز", "تبريز", "الأهواز", "قم"] },
  NG: { nameAr: "نيجيريا", code: "NG", cities: ["لاغوس", "أبوجا", "كانو", "إبادان", "بنين سيتي", "بورت هاركورت"] },
  SN: { nameAr: "السنغال", code: "SN", cities: ["داكار", "ثيس", "كاولاك", "زيغينشور", "سانت لويس"] },
  ML: { nameAr: "مالي", code: "ML", cities: ["باماكو", "سيكاسو", "ماوبتي", "كيدال", "غاو", "تمبكتو"] },
  MR: { nameAr: "موريتانيا", code: "MR", cities: ["نواكشوط", "نواذيبو", "روصو", "كيفة", "زويرات"] },
  SO: { nameAr: "الصومال", code: "SO", cities: ["مقديشو", "هرجيسا", "كيسمايو", "بربرة", "بوصاصو"] },
  ET: { nameAr: "إثيوبيا", code: "ET", cities: ["أديس أبابا", "دير داوا", "مكلي", "غوندر", "أواسا"] },
  TZ: { nameAr: "تنزانيا", code: "TZ", cities: ["دار السلام", "دودوما", "مواتزا", "أروشا", "مبيا"] },
  KE: { nameAr: "كينيا", code: "KE", cities: ["نيروبي", "مومباسا", "كيسومو", "ناكورو", "إلدوريت"] },
  UG: { nameAr: "أوغندا", code: "UG", cities: ["كمبالا", "غولو", "لويرو", "جينجا", "مباراره"] },
  GH: { nameAr: "غانا", code: "GH", cities: ["أكرا", "كوماسي", "تامالي", "سيكوندي", "كيب كوست"] },
  GB: { nameAr: "المملكة المتحدة", code: "GB", cities: ["لندن", "برمنغهام", "مانشستر", "ليدز", "غلاسكو", "ليفربول", "برستول"] },
  US: { nameAr: "الولايات المتحدة", code: "US", cities: ["نيويورك", "لوس أنجلوس", "شيكاغو", "هيوستن", "فينيكس", "فيلادلفيا", "سان أنطونيو"] },
  CA: { nameAr: "كندا", code: "CA", cities: ["تورنتو", "مونتريال", "كالغاري", "أوتاوا", "إدمونتون", "فانكوفر"] },
  AU: { nameAr: "أستراليا", code: "AU", cities: ["سيدني", "ملبورن", "بريزبين", "بيرث", "أديلايد", "كانبيرا"] },
  FR: { nameAr: "فرنسا", code: "FR", cities: ["باريس", "مرسيليا", "ليون", "تولوز", "نيس", "نانت", "ستراسبورغ"] },
  DE: { nameAr: "ألمانيا", code: "DE", cities: ["برلين", "هامبورغ", "ميونيخ", "كولونيا", "فرانكفورت", "شتوتغارت"] },
};

const SERVICES_LIST = [
  { value: "hajj_packages", label: "باقات الحج" },
  { value: "umrah_packages", label: "باقات العمرة" },
  { value: "hotels", label: "الفنادق والإقامة" },
  { value: "transport", label: "النقل والمواصلات" },
  { value: "flights", label: "الرحلات الجوية" },
  { value: "visas", label: "التأشيرات" },
  { value: "tours", label: "الجولات السياحية" },
  { value: "catering", label: "الخدمات الغذائية" },
  { value: "medical", label: "الخدمات الطبية" },
  { value: "other", label: "خدمات أخرى" },
];

// ─── Success Screen ────────────────────────────────────────────────────────
function SuccessScreen({ code }: { code: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4" dir="rtl">
      <Card className="max-w-md w-full text-center shadow-xl border-0">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">تم استلام طلبك!</h2>
          <p className="text-muted-foreground mb-6">
            شكراً لاهتمامك بالانضمام كمزود خدمة في منصة جو عمرة. سيتم مراجعة طلبك من قِبل فريقنا وإخطارك بالنتيجة.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">رقمك المرجعي</p>
            <p className="text-2xl font-mono font-bold text-green-700">{code}</p>
            <p className="text-xs text-muted-foreground mt-1">احتفظ بهذا الرقم لمتابعة حالة طلبك</p>
          </div>
          <Link href="/">
            <Button className="w-full gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function JoinSupplier() {
  const [step, setStep] = useState(1);
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [form, setForm] = useState({
    type: "company" as "company" | "individual",
    nameAr: "",
    nameEn: "",
    gender: "" as "male" | "female" | "",
    companyName: "",
    licenseNumber: "",
    commercialRegisterNumber: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    city: "",
    address: "",
    notes: "",
  });

  const registerMutation = trpc.suppliers.publicRegister.useMutation({
    onSuccess: (data) => {
      setSuccessCode(data.code);
    },
    onError: (err) => {
      toast.error("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    },
  });

  const selectedCountry = WORLD_COUNTRIES_CITIES[selectedCountryCode];
  const cities = selectedCountry?.cities ?? [];

  const toggleService = (val: string) => {
    setSelectedServices(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  };

  const handleSubmit = () => {
    if (!form.nameAr.trim() || form.nameAr.length < 2) {
      toast.error("يرجى إدخال الاسم الكامل (حرفان على الأقل)");
      return;
    }
    registerMutation.mutate({
      ...form,
      gender: form.gender || undefined,
      country: selectedCountry?.nameAr,
      countryCode: selectedCountryCode || undefined,
      services: selectedServices,
    });
  };

  if (successCode) return <SuccessScreen code={successCode} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-green-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ج</span>
              </div>
              <span className="font-bold text-lg">جو عمرة</span>
            </div>
          </Link>
          <Badge variant="outline" className="text-sm">انضم كمزود خدمة</Badge>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">انضم كمزود خدمة</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            كن جزءاً من منظومة جو عمرة وقدّم خدماتك لآلاف الحجاج والمعتمرين من جميع أنحاء العالم
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Star, title: "وصول واسع", desc: "آلاف العملاء يومياً" },
            { icon: CheckCircle2, title: "دعم متكامل", desc: "فريق متخصص لمساعدتك" },
            { icon: Building2, title: "شراكة موثوقة", desc: "عقود واضحة وشفافة" },
          ].map(b => (
            <Card key={b.title} className="text-center border-0 bg-white/80 shadow-sm">
              <CardContent className="pt-4 pb-3">
                <b.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-semibold text-sm">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">نموذج الانضمام</CardTitle>
            <CardDescription>يرجى تعبئة البيانات بدقة لتسريع عملية المراجعة والاعتماد</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Type */}
            <div>
              <Label className="text-base font-semibold mb-3 block">نوع المزود</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "company", icon: Building2, label: "شركة / مؤسسة" },
                  { val: "individual", icon: User, label: "فرد / مستقل" },
                ].map(t => (
                  <button
                    key={t.val}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t.val as any }))}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right ${
                      form.type === t.val
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <t.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>الاسم الكامل (بالعربية) *</Label>
                <Input
                  value={form.nameAr}
                  onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                  placeholder="مثال: أحمد محمد العمري"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>الاسم (بالإنجليزية)</Label>
                <Input
                  value={form.nameEn}
                  onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                  placeholder="Ahmed Mohammed Al-Omari"
                  className="mt-1"
                />
              </div>
              {form.type === "company" && (
                <div className="md:col-span-2">
                  <Label>اسم الشركة / المؤسسة</Label>
                  <Input
                    value={form.companyName}
                    onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                    placeholder="مثال: شركة النور للخدمات السياحية"
                    className="mt-1"
                  />
                </div>
              )}
              {form.type === "individual" && (
                <div>
                  <Label>الجنس</Label>
                  <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v as any }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="اختر الجنس" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Legal */}
            {form.type === "company" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>رقم الترخيص</Label>
                  <Input
                    value={form.licenseNumber}
                    onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
                    placeholder="رقم ترخيص مزاولة النشاط"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>رقم السجل التجاري</Label>
                  <Input
                    value={form.commercialRegisterNumber}
                    onChange={e => setForm(f => ({ ...f, commercialRegisterNumber: e.target.value }))}
                    placeholder="رقم السجل التجاري"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>رقم الهاتف</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+966 5X XXX XXXX"
                  className="mt-1"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>واتساب</Label>
                <Input
                  value={form.whatsapp}
                  onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="+966 5X XXX XXXX"
                  className="mt-1"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="example@domain.com"
                  className="mt-1"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>الموقع الإلكتروني</Label>
                <Input
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://www.example.com"
                  className="mt-1"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>الدولة</Label>
                <Select value={selectedCountryCode} onValueChange={v => { setSelectedCountryCode(v); setForm(f => ({ ...f, city: "" })); }}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="اختر الدولة" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(WORLD_COUNTRIES_CITIES).map(([code, c]) => (
                      <SelectItem key={code} value={code}>{c.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>المدينة</Label>
                {cities.length > 0 ? (
                  <Select value={form.city} onValueChange={v => setForm(f => ({ ...f, city: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                    <SelectContent>
                      {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="اختر الدولة أولاً أو اكتب المدينة"
                    className="mt-1"
                  />
                )}
              </div>
            </div>

            {/* Services */}
            <div>
              <Label className="text-base font-semibold mb-3 block">الخدمات المقدمة</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICES_LIST.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleService(s.value)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      selectedServices.includes(s.value)
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-border hover:border-primary/50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>ملاحظات إضافية</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="أي معلومات إضافية تودّ إضافتها..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                onClick={handleSubmit}
                disabled={registerMutation.isPending}
                className="w-full h-12 text-base gap-2"
                size="lg"
              >
                {registerMutation.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> جارٍ إرسال الطلب...</>
                ) : (
                  <><Upload className="h-5 w-5" /> إرسال طلب الانضمام</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                بعد إرسال الطلب، ستكون حالته <strong>تحت المراجعة</strong> حتى يتم اعتماده من فريق جو عمرة
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Also join as marketer */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            هل تريد الانضمام كمسوق بدلاً من ذلك؟{" "}
            <Link href="/join-marketer">
              <span className="text-primary font-medium hover:underline cursor-pointer">انضم كمسوق</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
