import { Shield, Lock, Eye, Database, Users, Bell, RefreshCw, Mail } from "lucide-react";

const sections = [
  {
    id: 1,
    icon: Database,
    title: "المعلومات التي نجمعها",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    content: [
      {
        subtitle: "معلومات الهوية الشخصية",
        text: "نجمع الاسم الكامل، تاريخ الميلاد، الجنسية، رقم جواز السفر وتاريخ انتهائه، والصور الشخصية — وذلك حصراً لأغراض إجراءات الحجز والتأشيرة.",
      },
      {
        subtitle: "معلومات الاتصال",
        text: "البريد الإلكتروني، رقم الهاتف، وعنوان الإقامة لأغراض التواصل وإرسال تأكيدات الحجز والتحديثات.",
      },
      {
        subtitle: "معلومات الدفع",
        text: "نجمع بيانات الدفع الضرورية لإتمام المعاملات. لا نحتفظ ببيانات البطاقة الكاملة على خوادمنا — يتم معالجتها عبر بوابات دفع معتمدة ومتوافقة مع معايير PCI DSS.",
      },
      {
        subtitle: "بيانات الاستخدام",
        text: "نجمع بيانات تقنية مثل عنوان IP، نوع المتصفح، الصفحات المزارة، ومدة الجلسة لتحسين أداء المنصة وتجربة المستخدم.",
      },
    ],
  },
  {
    id: 2,
    icon: Eye,
    title: "كيف نستخدم معلوماتك",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    content: [
      {
        subtitle: "تقديم الخدمات",
        text: "معالجة حجوزات العمرة والحج والطيران والفنادق، استخراج التأشيرات، وتنسيق خدمات النقل والإرشاد الديني.",
      },
      {
        subtitle: "التواصل والدعم",
        text: "إرسال تأكيدات الحجز، تحديثات الرحلة، والرد على استفساراتك وشكاواك عبر القنوات المفضلة لديك.",
      },
      {
        subtitle: "التحسين المستمر",
        text: "تحليل أنماط الاستخدام لتحسين تجربة المنصة، تطوير خدمات جديدة، وتخصيص التوصيات بناءً على اهتماماتك.",
      },
      {
        subtitle: "الامتثال القانوني",
        text: "الوفاء بالمتطلبات القانونية والتنظيمية في المملكة العربية السعودية والدول التي نعمل فيها.",
      },
    ],
  },
  {
    id: 3,
    icon: Lock,
    title: "أمن البيانات",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    content: [
      {
        subtitle: "التشفير",
        text: "جميع البيانات المنقولة بين متصفحك وخوادمنا مشفرة بتقنية TLS 1.3 / SSL 256-bit. البيانات المخزنة مشفرة بمعايير AES-256.",
      },
      {
        subtitle: "التحكم في الوصول",
        text: "يقتصر الوصول إلى بياناتك الشخصية على الموظفين الذين يحتاجون إليها لأداء مهامهم، ويخضعون لاتفاقيات سرية صارمة.",
      },
      {
        subtitle: "المراقبة والاختبار",
        text: "نجري اختبارات أمنية دورية واختبارات اختراق لضمان سلامة أنظمتنا. لدينا فريق متخصص لمراقبة الأمن على مدار الساعة.",
      },
    ],
  },
  {
    id: 4,
    icon: Users,
    title: "مشاركة البيانات مع أطراف ثالثة",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    content: [
      {
        subtitle: "شركاء الخدمة",
        text: "نشارك البيانات الضرورية فقط مع شركاء الخدمة (شركات الطيران، الفنادق، شركات النقل) لإتمام حجوزاتك. جميع الشركاء ملزمون باتفاقيات حماية البيانات.",
      },
      {
        subtitle: "الجهات الحكومية",
        text: "قد نشارك بيانات جواز السفر مع الجهات الحكومية السعودية والسفارات لأغراض استخراج التأشيرات وفق المتطلبات القانونية.",
      },
      {
        subtitle: "ما لن نفعله أبداً",
        text: "لن نبيع بياناتك لأطراف ثالثة، ولن نشاركها لأغراض تسويقية دون موافقتك الصريحة، ولن نستخدمها بطريقة تتعارض مع هذه السياسة.",
      },
    ],
  },
  {
    id: 5,
    icon: Bell,
    title: "ملفات تعريف الارتباط (Cookies)",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    content: [
      {
        subtitle: "الكوكيز الأساسية",
        text: "ضرورية لعمل المنصة بشكل صحيح (تسجيل الدخول، سلة الحجز). لا يمكن تعطيلها.",
      },
      {
        subtitle: "كوكيز التحليل",
        text: "تساعدنا على فهم كيفية استخدام المنصة لتحسينها. يمكنك الاختيار بعدم قبولها.",
      },
      {
        subtitle: "كوكيز التخصيص",
        text: "تحفظ تفضيلاتك (اللغة، العملة، إعدادات البحث) لتجربة أكثر راحة. يمكنك تعطيلها من إعدادات المتصفح.",
      },
    ],
  },
  {
    id: 6,
    icon: Shield,
    title: "حقوقك",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    content: [
      {
        subtitle: "حق الوصول",
        text: "يحق لك طلب نسخة من جميع البيانات الشخصية التي نحتفظ بها عنك.",
      },
      {
        subtitle: "حق التصحيح",
        text: "يمكنك تحديث أو تصحيح بياناتك الشخصية في أي وقت من خلال حسابك أو بالتواصل معنا.",
      },
      {
        subtitle: "حق الحذف",
        text: "يحق لك طلب حذف بياناتك الشخصية، مع مراعاة الالتزامات القانونية التي قد تستوجب الاحتفاظ ببعض البيانات.",
      },
      {
        subtitle: "حق الاعتراض",
        text: "يمكنك الاعتراض على معالجة بياناتك لأغراض التسويق المباشر في أي وقت.",
      },
    ],
  },
  {
    id: 7,
    icon: RefreshCw,
    title: "تحديثات السياسة",
    color: "text-gray-400",
    bg: "bg-white/5",
    border: "border-white/10",
    content: [
      {
        subtitle: "إشعار التغييرات",
        text: "سنخطرك بأي تغييرات جوهرية على هذه السياسة عبر البريد الإلكتروني أو إشعار بارز على المنصة قبل 30 يوماً من تطبيقها.",
      },
      {
        subtitle: "تاريخ آخر تحديث",
        text: "آخر تحديث لهذه السياسة: مارس 2025. يمكنك دائماً الاطلاع على النسخة الأحدث على هذه الصفحة.",
      },
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white" dir="rtl">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/15 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-purple-400 text-sm mb-6">
            <Shield className="w-4 h-4" />
            <span>خصوصيتك تهمنا</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">سياسة الخصوصية</h1>
          <p className="text-gray-400 text-lg mb-4">
            تلتزم منصة جو عمرة بحماية واحترام خصوصيتك. هذه السياسة توضح كيف نجمع بياناتك ونستخدمها ونحميها.
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
            <p className="text-gray-400 text-sm mb-3 font-medium">محتويات السياسة:</p>
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <a key={s.id} href={`#section-${s.id}`}
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
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((section) => (
            <div key={section.id} id={`section-${section.id}`} className={`${section.bg} border ${section.border} rounded-2xl p-7`}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <section.icon className={`w-5 h-5 ${section.color}`} />
                </div>
                <h2 className={`text-xl font-bold ${section.color}`}>
                  {section.id}. {section.title}
                </h2>
              </div>
              <div className="space-y-4">
                {section.content.map((item, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-white mb-1">{item.subtitle}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="px-4 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white/4 border border-white/10 rounded-2xl p-8">
            <Mail className="w-10 h-10 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-3">أسئلة حول الخصوصية؟</h2>
            <p className="text-gray-400 mb-6">إذا كان لديك أي استفسار حول سياسة الخصوصية أو رغبت في ممارسة حقوقك، تواصل مع مسؤول حماية البيانات لدينا.</p>
            <a href="mailto:admin@go-umrah.com"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              <Mail className="w-5 h-5" />
              admin@go-umrah.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
