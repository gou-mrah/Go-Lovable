import { FileText, CheckCircle, CreditCard, User, AlertTriangle, Scale, RefreshCw, Mail } from "lucide-react";

const sections = [
  {
    id: 1,
    icon: CheckCircle,
    title: "القبول بالشروط",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    content: `باستخدامك لمنصة "جو عمرة" أو حجز أي خدمة من خلالها، فإنك تقر بأنك قرأت هذه الشروط والأحكام وفهمتها ووافقت على الالتزام بها بالكامل. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.

هذه الشروط تُطبَّق على جميع المستخدمين بما في ذلك الزوار وأصحاب الحسابات والمزودين. نحتفظ بحق تعديل هذه الشروط في أي وقت مع إشعار مسبق.`,
  },
  {
    id: 2,
    icon: User,
    title: "حساب المستخدم ومسؤولياته",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    content: `**إنشاء الحساب:** يجب أن يكون عمرك 18 سنة أو أكثر لإنشاء حساب. أنت مسؤول عن دقة جميع المعلومات التي تقدمها عند التسجيل.

**أمان الحساب:** أنت مسؤول عن الحفاظ على سرية كلمة المرور وجميع الأنشطة التي تتم من خلال حسابك. أخطرنا فوراً عند الاشتباه في أي استخدام غير مصرح به.

**دقة المعلومات:** أنت مسؤول عن صحة جميع بيانات المسافرين (جوازات السفر، الأسماء، تواريخ الميلاد). أي خطأ في هذه البيانات قد يؤدي إلى رفض التأشيرة أو الصعود للطائرة ولا تتحمل المنصة مسؤولية ذلك.`,
  },
  {
    id: 3,
    icon: CreditCard,
    title: "الحجوزات والمدفوعات",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    content: `**تأكيد الحجز:** يُعدّ الحجز مؤكداً فقط بعد استلام رسالة التأكيد الرسمية ودفع المبلغ المطلوب. الحجز المؤقت لا يضمن الأسعار أو التوفر.

**الأسعار:** جميع الأسعار المعروضة شاملة للضرائب والرسوم المحددة. قد تتغير الأسعار حتى لحظة إتمام الدفع. نسعى لعرض الأسعار الدقيقة لكن لا نضمن ثباتها.

**طرق الدفع:** نقبل الدفع بالبطاقات الائتمانية والمدفوعة مسبقاً، المحافظ الإلكترونية، والتحويل البنكي. يجب أن تكون صاحب وسيلة الدفع المستخدمة.

**الفوترة:** ستصلك فاتورة إلكترونية رسمية على بريدك الإلكتروني بعد إتمام كل معاملة.`,
  },
  {
    id: 4,
    icon: FileText,
    title: "الخدمات والمحتوى",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    content: `**توفر الخدمات:** جميع الخدمات تخضع لمدى التوفر. لا نضمن توفر باقة أو غرفة فندقية أو مقعد طيران بعينه حتى يتم تأكيد الحجز.

**دقة المعلومات:** نسعى لتقديم معلومات دقيقة ومحدثة، لكن قد تحدث أخطاء أو تغييرات من مزودي الخدمة. نتحمل المسؤولية فقط عن الأخطاء الناتجة عن إهمالنا المباشر.

**حقوق الملكية الفكرية:** جميع محتويات المنصة (نصوص، صور، شعارات، تصاميم، كود برمجي) هي ملك لجو عمرة ومحمية بموجب قوانين الملكية الفكرية. يُحظر نسخها أو استخدامها دون إذن كتابي مسبق.`,
  },
  {
    id: 5,
    icon: AlertTriangle,
    title: "تحديد المسؤولية",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    content: `**نطاق المسؤولية:** تعمل جو عمرة كوسيط بين المستخدمين ومزودي الخدمات. لا نتحمل المسؤولية عن أفعال أو إخفاقات مزودي الخدمة (شركات الطيران، الفنادق، شركات النقل).

**القوة القاهرة:** لا نتحمل المسؤولية عن التأخيرات أو الإلغاءات الناتجة عن ظروف خارجة عن إرادتنا: كوارث طبيعية، قرارات حكومية، أوبئة، حروب، أو اضطرابات مدنية.

**الحد الأقصى للتعويض:** في جميع الأحوال، لا تتجاوز مسؤوليتنا المالية قيمة الخدمة التي دفعتها فعلياً عبر منصتنا.`,
  },
  {
    id: 6,
    icon: Scale,
    title: "القانون الحاكم وتسوية النزاعات",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    content: `**القانون المطبق:** تخضع هذه الشروط وتُفسَّر وفقاً لأنظمة المملكة العربية السعودية، بما في ذلك نظام التجارة الإلكترونية ونظام حماية المستهلك.

**تسوية النزاعات:** في حال نشوء أي نزاع، نشجع على حله ودياً أولاً عبر التواصل مع فريق الدعم. إذا تعذر الحل الودي، يُحال النزاع إلى المحاكم المختصة في المملكة العربية السعودية.

**الاختصاص القضائي:** تختص محاكم مدينة الرياض بالنظر في أي نزاعات تنشأ عن هذه الشروط أو استخدام المنصة.`,
  },
  {
    id: 7,
    icon: RefreshCw,
    title: "تعديل الشروط",
    color: "text-gray-400",
    bg: "bg-white/5",
    border: "border-white/10",
    content: `نحتفظ بحق تعديل هذه الشروط والأحكام في أي وقت. سنخطرك بالتغييرات الجوهرية عبر البريد الإلكتروني أو إشعار على المنصة قبل 30 يوماً من تطبيقها.

استمرارك في استخدام المنصة بعد تطبيق التغييرات يُعدّ قبولاً ضمنياً للشروط المحدثة. إذا لم توافق على التغييرات، يحق لك إغلاق حسابك قبل تاريخ التطبيق.

آخر تحديث لهذه الشروط: مارس 2025.`,
  },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white" dir="rtl">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-slate-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-2 text-gray-300 text-sm mb-6">
            <FileText className="w-4 h-4" />
            <span>يرجى القراءة بعناية قبل الاستخدام</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">الشروط والأحكام</h1>
          <p className="text-gray-400 text-lg mb-4">
            هذه الشروط تحكم استخدامك لمنصة جو عمرة وجميع خدماتها. باستخدام المنصة، فإنك توافق على هذه الشروط.
          </p>
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <RefreshCw className="w-4 h-4" />
            <span>آخر تحديث: مارس 2025</span>
          </div>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-3 font-medium">محتويات الشروط:</p>
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <a key={s.id} href={`#term-${s.id}`}
                  className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
                  {s.id}. {s.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-5">
          {sections.map((section) => (
            <div key={section.id} id={`term-${section.id}`} className={`${section.bg} border ${section.border} rounded-2xl p-7`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <section.icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <h2 className={`text-xl font-bold ${section.color}`}>
                  {section.id}. {section.title}
                </h2>
              </div>
              <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm">
                {section.content.split("**").map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : <span key={i}>{part}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white/4 border border-white/10 rounded-2xl p-8">
            <Scale className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-3">استفسارات قانونية؟</h2>
            <p className="text-gray-400 mb-6">للاستفسار عن أي بند من هذه الشروط أو للتواصل مع الفريق القانوني:</p>
            <a href="mailto:admin@go-umrah.com"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              <Mail className="w-5 h-5" />
              admin@go-umrah.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
