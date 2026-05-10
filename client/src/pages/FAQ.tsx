import { useState } from "react";
import { ChevronDown, Search, MessageCircle, Phone, Mail, HelpCircle, Plane, Hotel, FileText, CreditCard, Shield, Users, Clock } from "lucide-react";
import { Link } from "wouter";

const categories = [
  { id: "general", label: "عام", icon: HelpCircle },
  { id: "booking", label: "الحجز والباقات", icon: Plane },
  { id: "hotels", label: "الفنادق والإقامة", icon: Hotel },
  { id: "visas", label: "التأشيرات", icon: FileText },
  { id: "payment", label: "الدفع والأسعار", icon: CreditCard },
  { id: "support", label: "الدعم والمساعدة", icon: Users },
];

const faqs = [
  // General
  {
    category: "general",
    q: "ما هي منصة جو عمرة؟",
    a: "منصة جو عمرة هي منصة رقمية متطورة تهدف إلى تسهيل وتنظيم رحلات الحج والعمرة للمسلمين من جميع أنحاء العالم. نجمع بين التكنولوجيا الحديثة والخبرة العميقة في خدمة ضيوف الرحمن، ونوفر حلاً شاملاً يضم الباقات، الطيران، الفنادق، التأشيرات، والنقل في مكان واحد.",
  },
  {
    category: "general",
    q: "هل منصة جو عمرة مرخصة رسمياً؟",
    a: "نعم، منصة جو عمرة حاصلة على جميع التراخيص الرسمية: رخصة وكيل سفر وسياحة (73104943)، توثيق التجارة الإلكترونية (30637)، ترخيص إعلامي (150283)، سجل تجاري (4650260256)، ورقم ضريبي (311722780600003). يمكنك التحقق من جميع التراخيص على صفحة التراخيص الرسمية.",
  },
  {
    category: "general",
    q: "في أي دول تعملون؟",
    a: "نخدم المسلمين من أكثر من 50 دولة حول العالم. المنصة متاحة بأكثر من 15 لغة وتدعم عملات متعددة لتسهيل الحجز من أي مكان في العالم.",
  },
  // Booking
  {
    category: "booking",
    q: "كيف يمكنني حجز باقة عمرة أو حج؟",
    a: "الحجز بسيط جداً: (1) تصفح الباقات المتاحة واختر ما يناسبك، (2) حدد تاريخ السفر وعدد الأشخاص، (3) أضف الخدمات الإضافية التي تحتاجها، (4) أكمل بيانات الحجز، (5) ادفع بأمان. ستصلك رسالة تأكيد فورية على بريدك الإلكتروني.",
  },
  {
    category: "booking",
    q: "هل يمكنني تخصيص الباقة لتناسب احتياجاتي؟",
    a: "بالطبع! نقدم باقات مرنة قابلة للتخصيص الكامل. يمكنك اختيار مستوى الفندق (2-5 نجوم)، نوع الغرفة، وسيلة النقل، المدة، وإضافة خدمات إرشاد ديني أو جولات سياحية. فريقنا جاهز لمساعدتك في تصميم باقة مثالية تناسب ميزانيتك.",
  },
  {
    category: "booking",
    q: "ما الفرق بين باقات العمرة وباقات الحج؟",
    a: "باقات العمرة متاحة طوال العام وتشمل أداء مناسك العمرة (الطواف والسعي). أما باقات الحج فهي موسمية (ذو الحجة) وتشمل جميع مناسك الحج الكاملة من الوقوف بعرفة إلى رمي الجمرات. الحج يتطلب تصريحاً رسمياً من الحكومة السعودية.",
  },
  {
    category: "booking",
    q: "كم مدة الرحلة في الباقات المتاحة؟",
    a: "تتراوح مدة باقات العمرة من 7 أيام إلى 21 يوماً حسب اختيارك. باقات الحج عادةً من 14 إلى 21 يوماً تشمل فترة الحج الرسمية (8-13 ذو الحجة) بالإضافة لأيام قبل وبعد.",
  },
  // Hotels
  {
    category: "hotels",
    q: "ما مدى قرب الفنادق من المسجد الحرام؟",
    a: "نقدم فنادق على مسافات متعددة: فنادق مجاورة (أقل من 200 متر)، فنادق قريبة (200م - 500م)، وفنادق متوسطة (500م - 1كم). جميع الفنادق في شبكتنا تم التحقق منها ومراجعتها للتأكد من الجودة والنظافة.",
  },
  {
    category: "hotels",
    q: "هل تشمل الباقات وجبات الطعام؟",
    a: "يعتمد ذلك على الباقة المختارة. بعض الباقات تشمل الإفطار فقط، وأخرى تشمل نصف إقامة (إفطار وعشاء)، وبعضها إقامة كاملة. يمكنك الاطلاع على تفاصيل كل باقة بوضوح قبل الحجز.",
  },
  // Visas
  {
    category: "visas",
    q: "هل تساعدون في استخراج تأشيرة العمرة؟",
    a: "نعم، نقدم خدمة شاملة لاستخراج تأشيرة العمرة. فريقنا المتخصص يساعدك في جمع الوثائق المطلوبة وتقديم الطلب وتتبعه حتى الحصول على التأشيرة. عادةً تستغرق التأشيرة 3-7 أيام عمل.",
  },
  {
    category: "visas",
    q: "ما الوثائق المطلوبة للتأشيرة؟",
    a: "المطلوب عادةً: جواز سفر ساري (6 أشهر على الأقل)، صورة شخصية حديثة، عقد الزواج للمرأة المتزوجة، وثيقة المحرم للمرأة غير المتزوجة، شهادة الميلاد للأطفال. قد تختلف المتطلبات حسب جنسيتك.",
  },
  {
    category: "visas",
    q: "ماذا يحدث إذا رُفض طلب التأشيرة؟",
    a: "في حالة رفض التأشيرة من الجهات الرسمية، نقوم بمراجعة الأسباب ومساعدتك في تصحيح الوضع وإعادة التقديم. رسوم الخدمة قابلة للاسترداد جزئياً حسب سياسة الإلغاء، أما رسوم التأشيرة الحكومية فلا يمكن استردادها.",
  },
  // Payment
  {
    category: "payment",
    q: "ما طرق الدفع المتاحة؟",
    a: "نقبل: بطاقات Visa وMastercard وAmerican Express، مدى، Apple Pay، STC Pay، تحويل بنكي، وبعض المحافظ الإلكترونية. جميع المعاملات مشفرة بتقنية SSL 256-bit.",
  },
  {
    category: "payment",
    q: "هل بياناتي المالية آمنة؟",
    a: "نعم، أمان بياناتك أولويتنا القصوى. نستخدم تشفير SSL 256-bit، ونتوافق مع معايير PCI DSS لأمن بيانات بطاقات الدفع. لا نحتفظ ببيانات بطاقتك الائتمانية على خوادمنا.",
  },
  {
    category: "payment",
    q: "هل يمكنني الدفع بالتقسيط؟",
    a: "نعم، نوفر خيارات دفع مرنة تشمل التقسيط على 3 أو 6 أشهر عبر بعض البطاقات الائتمانية المعتمدة. تواصل مع فريق المبيعات لمعرفة الخيارات المتاحة لباقتك.",
  },
  // Support
  {
    category: "support",
    q: "كيف أتواصل مع فريق الدعم؟",
    a: "فريق الدعم متاح 24/7 عبر: الهاتف (+966 55 712 3435)، واتساب، البريد الإلكتروني (admin@go-umrah.com)، أو الدردشة المباشرة على المنصة. متوسط وقت الرد أقل من 5 دقائق.",
  },
  {
    category: "support",
    q: "ماذا أفعل إذا واجهت مشكلة أثناء رحلتي؟",
    a: "تواصل فوراً مع فريق الدعم الميداني عبر الرقم المخصص للطوارئ الموجود في وثائق سفرك. فريقنا موجود على أرض المملكة ويمكنه الوصول إليك خلال ساعات.",
  },
  {
    category: "support",
    q: "هل يوجد مرشد ديني مع الرحلة؟",
    a: "نعم، جميع باقاتنا تشمل مرشداً دينياً متخصصاً يرافق المجموعة طوال الرحلة. المرشد يساعد في شرح المناسك وتوجيه الحجاج والمعتمرين لأداء العبادات بالشكل الصحيح.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${open ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/10 bg-white/3 hover:border-white/20"}`}>
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-right"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-base leading-relaxed">{q}</span>
        <ChevronDown className={`w-5 h-5 flex-shrink-0 text-emerald-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <div className="border-t border-white/10 pt-4">
            <p className="text-gray-300 leading-relaxed">{a}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = faqs.filter((f) => {
    const matchCat = activeCategory === "all" || f.category === activeCategory;
    const matchSearch = !searchQuery || f.q.includes(searchQuery) || f.a.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0a1628] text-white" dir="rtl">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-400 text-sm mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>نجيب على كل تساؤلاتك</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">الأسئلة الشائعة</h1>
          <p className="text-gray-400 text-lg mb-8">تجد هنا إجابات شاملة لأكثر الأسئلة شيوعاً حول خدماتنا ومنصتنا</p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث في الأسئلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl pr-12 pl-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white/15 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-emerald-600 text-white"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">لم يتم العثور على نتائج لبحثك</p>
              <button onClick={() => { setSearchQuery(""); setActiveCategory("general"); }} className="mt-4 text-emerald-400 hover:text-emerald-300 underline">
                مسح البحث
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((f, i) => (
                <FAQItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-500/10 to-amber-500/5 border border-emerald-500/20 rounded-3xl p-10 text-center">
            <MessageCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">لا تزال لديك أسئلة؟</h2>
            <p className="text-gray-300 mb-8">فريق الدعم لدينا متاح على مدار الساعة لمساعدتك. لا تتردد في التواصل معنا.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://wa.me/966557123435" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                <Phone className="w-5 h-5" />
                واتساب
              </a>
              <a href="mailto:admin@go-umrah.com"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                <Mail className="w-5 h-5" />
                البريد الإلكتروني
              </a>
              <Link href="/complaints">
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  نموذج التواصل
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
