import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ExternalLink, Bell, BookOpen, Calendar, Users, Star,
  MapPin, Clock, ChevronRight, AlertTriangle, Info,
  Newspaper, Shield, CheckCircle, Globe, Phone, Mail,
} from "lucide-react";

const BRAND_TEAL = "#1B5E52";
const BRAND_GOLD = "#C9A96E";
const BRAND_PEACH = "#F5EFE6";

// Nusuk local Hajj packages (read-only display, synced with Nusuk.sa)
const NUSUK_PACKAGES = [
  {
    id: "nusuk-1",
    titleAr: "باقة الحج الداخلي المميزة",
    title: "Premium Domestic Hajj Package",
    category: "مميز",
    price: "12,500 ريال",
    duration: "12 يوم",
    departure: "مكة المكرمة",
    hotel: "فندق 5 نجوم - المشاعر المقدسة",
    stars: 5,
    seats: 50,
    available: 12,
    features: ["نقل VIP", "فندق 5 نجوم", "وجبات كاملة", "مرشد متخصص", "طاقم طبي"],
    badge: "الأكثر طلباً",
    badgeColor: "bg-amber-100 text-amber-800",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-aerial_602acc80.jpg",
    nusukLink: "https://www.nusuk.sa/hajj/local-hajj",
  },
  {
    id: "nusuk-2",
    titleAr: "باقة الحج الداخلي الاقتصادية",
    title: "Economy Domestic Hajj Package",
    category: "اقتصادي",
    price: "7,800 ريال",
    duration: "10 أيام",
    departure: "الرياض",
    hotel: "فندق 3 نجوم - منى",
    stars: 3,
    seats: 100,
    available: 45,
    features: ["نقل جماعي", "فندق 3 نجوم", "وجبات رئيسية", "مرشد جماعي"],
    badge: "متاح",
    badgeColor: "bg-green-100 text-green-800",
    image: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800",
    nusukLink: "https://www.nusuk.sa/hajj/local-hajj",
  },
  {
    id: "nusuk-3",
    titleAr: "باقة الحج الداخلي الفاخرة",
    title: "Luxury Domestic Hajj Package",
    category: "فاخر",
    price: "22,000 ريال",
    duration: "15 يوم",
    departure: "جدة",
    hotel: "فندق 5 نجوم - الحرم المكي",
    stars: 5,
    seats: 30,
    available: 5,
    features: ["طائرة خاصة", "جناح فندقي", "خدمة كونسيرج", "طاقم طبي خاص", "جولات VIP"],
    badge: "آخر الأماكن",
    badgeColor: "bg-red-100 text-red-800",
    image: "https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=800",
    nusukLink: "https://www.nusuk.sa/hajj/local-hajj",
  },
  {
    id: "nusuk-4",
    titleAr: "باقة الحج الداخلي العائلية",
    title: "Family Domestic Hajj Package",
    category: "عائلي",
    price: "9,500 ريال",
    duration: "12 يوم",
    departure: "الدمام",
    hotel: "فندق 4 نجوم - عزيزية",
    stars: 4,
    seats: 80,
    available: 32,
    features: ["نقل عائلي", "غرف عائلية", "وجبات متنوعة", "أنشطة للأطفال"],
    badge: "مناسب للعائلات",
    badgeColor: "bg-blue-100 text-blue-800",
    image: "https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800",
    nusukLink: "https://www.nusuk.sa/hajj/local-hajj",
  },
];

const HAJJ_NEWS = [
  {
    id: 1,
    titleAr: "وزارة الحج تعلن عن فتح التسجيل لحج 1447هـ",
    date: "2026-03-01",
    category: "إعلان رسمي",
    urgent: true,
    source: "وزارة الحج والعمرة",
  },
  {
    id: 2,
    titleAr: "تحديثات منظومة نسك: خدمات جديدة للحجاج الداخليين",
    date: "2026-02-28",
    category: "تحديث تقني",
    urgent: false,
    source: "منصة نسك",
  },
  {
    id: 3,
    titleAr: "مشروع توسعة المشاعر المقدسة يستوعب 2 مليون حاج",
    date: "2026-02-25",
    category: "بنية تحتية",
    urgent: false,
    source: "الرئاسة العامة لشؤون الحرمين",
  },
  {
    id: 4,
    titleAr: "تطبيق نسك يطلق ميزة التتبع الفوري للحجاج",
    date: "2026-02-20",
    category: "تقنية",
    urgent: false,
    source: "منصة نسك",
  },
];

const HAJJ_REQUIREMENTS = [
  { icon: Shield, text: "الجنسية السعودية أو الإقامة النظامية", color: "text-teal-600" },
  { icon: Calendar, text: "عدم أداء فريضة الحج خلال الخمس سنوات الماضية", color: "text-blue-600" },
  { icon: Users, text: "العمر بين 18-65 سنة (استثناءات بموافقة طبية)", color: "text-purple-600" },
  { icon: CheckCircle, text: "اكتمال التطعيمات المطلوبة", color: "text-green-600" },
  { icon: BookOpen, text: "التسجيل عبر منصة نسك الرسمية فقط", color: "text-amber-600" },
];

export default function HajjLocalPage() {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [alertDismissed, setAlertDismissed] = useState(false);

  const categories = ["all", "مميز", "اقتصادي", "فاخر", "عائلي"];
  const filteredPackages = selectedCategory === "all"
    ? NUSUK_PACKAGES
    : NUSUK_PACKAGES.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen" style={{ background: BRAND_PEACH }}>
      {/* Urgent Alert Banner */}
      {!alertDismissed && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
              <p className="text-sm font-medium text-amber-800">
                🔔 تنبيه: فتح التسجيل لحج 1447هـ — سارع بالتسجيل عبر منصة نسك الرسمية قبل نفاد الأماكن
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href="https://www.nusuk.sa/hajj/local-hajj" target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="text-xs" style={{ background: BRAND_TEAL, color: "white" }}>
                  سجّل الآن <ExternalLink className="w-3 h-3 mr-1" />
                </Button>
              </a>
              <button onClick={() => setAlertDismissed(true)} className="text-amber-600 hover:text-amber-800 text-lg leading-none">×</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4" style={{ background: `linear-gradient(135deg, ${BRAND_TEAL} 0%, #0f3d35 100%)` }}>
        {/* Islamic geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23C9A96E' stroke-width='0.9'><path d='M 100,54 A 55.744,55.744 0 0,0 146,100 A 55.744,55.744 0 0,0 100,146 A 55.744,55.744 0 0,0 54,100 A 55.744,55.744 0 0,0 100,54 Z'/><path d='M 0,-46 A 55.744,55.744 0 0,0 46,0 A 55.744,55.744 0 0,0 0,46 A 55.744,55.744 0 0,0 -46,0 A 55.744,55.744 0 0,0 0,-46 Z'/><path d='M 200,-46 A 55.744,55.744 0 0,0 246,0 A 55.744,55.744 0 0,0 200,46 A 55.744,55.744 0 0,0 154,0 A 55.744,55.744 0 0,0 200,-46 Z'/><path d='M 0,154 A 55.744,55.744 0 0,0 46,200 A 55.744,55.744 0 0,0 0,246 A 55.744,55.744 0 0,0 -46,200 A 55.744,55.744 0 0,0 0,154 Z'/><path d='M 200,154 A 55.744,55.744 0 0,0 246,200 A 55.744,55.744 0 0,0 200,246 A 55.744,55.744 0 0,0 154,200 A 55.744,55.744 0 0,0 200,154 Z'/><path d='M 100,-7 L 107,0 L 100,7 L 93,0 Z'/><path d='M 100,193 L 107,200 L 100,207 L 93,200 Z'/><path d='M -7,100 L 0,107 L 7,100 L 0,93 Z'/><path d='M 193,100 L 200,107 L 207,100 L 200,93 Z'/><path d='M 50,43 L 57,50 L 50,57 L 43,50 Z'/><path d='M 150,43 L 157,50 L 150,57 L 143,50 Z'/><path d='M 50,143 L 57,150 L 50,157 L 43,150 Z'/><path d='M 150,143 L 157,150 L 150,157 L 143,150 Z'/></g></svg>")`,
        }} />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge className="mb-4 text-sm px-4 py-1" style={{ background: BRAND_GOLD, color: "#1a1a1a" }}>
            🕋 بوابة الحج الداخلي — مزامنة مع نسك
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: "Tajawal, Cairo, sans-serif" }}>
            الحج الداخلي 1447هـ
          </h1>
          <p className="text-xl text-white/80 mb-2" style={{ fontFamily: "Tajawal, sans-serif" }}>
            باقات الحج للمقيمين في المملكة العربية السعودية
          </p>
          <p className="text-sm text-white/60 mb-8">
            هذه البوابة للعرض والمعلومات فقط — التسجيل الرسمي عبر منصة نسك
          </p>

          {/* Info Notice */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white/90 text-sm border border-white/20">
            <Info className="w-4 h-4 text-amber-300" />
            <span>بوابة معلوماتية — لا تتضمن عملية دفع مباشرة</span>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي الباقات المتاحة", value: "4 باقات", icon: BookOpen, color: BRAND_TEAL },
            { label: "الأماكن المتبقية", value: "94 مكان", icon: Users, color: "#e67e22" },
            { label: "آخر تحديث", value: "اليوم", icon: Clock, color: "#27ae60" },
            { label: "مصدر البيانات", value: "نسك الرسمية", icon: Shield, color: BRAND_GOLD },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `${stat.color}20` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Package Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-600">تصفية حسب:</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "text-white shadow-md"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                  style={selectedCategory === cat ? { background: BRAND_TEAL } : {}}
                >
                  {cat === "all" ? "جميع الباقات" : cat}
                </button>
              ))}
            </div>

            {/* Packages Grid */}
            <div className="space-y-6">
              {filteredPackages.map((pkg) => (
                <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  {/* Islamic geometric border top */}
                  <div className="h-1" style={{ background: `linear-gradient(90deg, ${BRAND_TEAL}, ${BRAND_GOLD}, ${BRAND_TEAL})` }} />
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-64 h-48 md:h-auto relative shrink-0">
                      <img src={pkg.image} alt={pkg.titleAr} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-3 right-3">
                        <Badge className={`text-xs ${pkg.badgeColor}`}>{pkg.badge}</Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Tajawal, sans-serif" }}>
                            {pkg.titleAr}
                          </h3>
                          <div className="flex items-center gap-2">
                            {Array.from({ length: pkg.stars }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-sm text-gray-500">({pkg.stars} نجوم)</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold" style={{ color: BRAND_TEAL }}>{pkg.price}</p>
                          <p className="text-xs text-gray-500">للفرد الواحد</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{pkg.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{pkg.departure}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{pkg.available} مكان متبقي</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-gray-400" />
                          <span>{pkg.hotel}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pkg.features.map((f, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                            ✓ {f}
                          </span>
                        ))}
                      </div>

                      {/* CTA - Read Only */}
                      <div className="flex items-center gap-3">
                        <a href={pkg.nusukLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button className="w-full gap-2" style={{ background: BRAND_TEAL, color: "white" }}>
                            <ExternalLink className="w-4 h-4" />
                            التسجيل عبر منصة نسك الرسمية
                          </Button>
                        </a>
                        <div className="text-xs text-gray-400 text-center">
                          <Shield className="w-4 h-4 mx-auto mb-1 text-green-500" />
                          آمن ورسمي
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Requirements Section */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <h2 className="text-xl font-bold mb-4" style={{ color: BRAND_TEAL, fontFamily: "Tajawal, sans-serif" }}>
                🔖 شروط الحج الداخلي
              </h2>
              <div className="space-y-3">
                {HAJJ_REQUIREMENTS.map((req, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <req.icon className={`w-5 h-5 shrink-0 ${req.color}`} />
                    <span className="text-sm text-gray-700">{req.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nusuk Integration Notice */}
            <div className="rounded-2xl p-6 border-2 border-dashed" style={{ borderColor: BRAND_GOLD, background: `${BRAND_GOLD}10` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: BRAND_GOLD }}>
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: BRAND_TEAL, fontFamily: "Tajawal, sans-serif" }}>
                    بوابة نسك الرسمية للحج الداخلي
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    جميع الباقات المعروضة مستقاة من منصة نسك الرسمية التابعة لوزارة الحج والعمرة. التسجيل والدفع يتم حصراً عبر المنصة الرسمية.
                  </p>
                  <a href="https://www.nusuk.sa/hajj/local-hajj" target="_blank" rel="noopener noreferrer">
                    <Button style={{ background: BRAND_GOLD, color: "#1a1a1a" }} className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      زيارة منصة نسك الرسمية
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live News Feed */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100" style={{ background: BRAND_TEAL }}>
                <div className="flex items-center gap-2 text-white">
                  <Newspaper className="w-5 h-5" />
                  <h3 className="font-bold" style={{ fontFamily: "Tajawal, sans-serif" }}>أخبار الحج الداخلي</h3>
                  <span className="mr-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">مباشر</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {HAJJ_NEWS.map((news) => (
                  <div key={news.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      {news.urgent && (
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 leading-relaxed mb-1" style={{ fontFamily: "Tajawal, sans-serif" }}>
                          {news.titleAr}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{news.date}</span>
                          <span>•</span>
                          <span className="text-teal-600">{news.category}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">المصدر: {news.source}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100">
                <a href="https://www.nusuk.sa" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                    <ExternalLink className="w-3 h-3" />
                    المزيد من الأخبار على نسك
                  </Button>
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
              <h3 className="font-bold mb-4" style={{ color: BRAND_TEAL, fontFamily: "Tajawal, sans-serif" }}>
                📞 تواصل معنا
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span dir="ltr">+966 12 345 6789</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4 text-teal-600" />
                  <span>hajj@go-umrah.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>السبت - الخميس: 8ص - 10م</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
              <h3 className="font-bold mb-4" style={{ color: BRAND_TEAL, fontFamily: "Tajawal, sans-serif" }}>
                🔗 روابط مفيدة
              </h3>
              <div className="space-y-2">
                {[
                  { label: "منصة نسك الرسمية", url: "https://www.nusuk.sa" },
                  { label: "وزارة الحج والعمرة", url: "https://www.haj.gov.sa" },
                  { label: "الرئاسة العامة للحرمين", url: "https://www.gph.gov.sa" },
                  { label: "الدفاع المدني - الحج", url: "https://www.998.gov.sa" },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 transition-colors group"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-teal-700">{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
