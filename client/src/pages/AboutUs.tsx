import { Link } from "wouter";
import { Users, Target, Eye, Heart, Shield, Star, Award, Globe, Clock, CheckCircle, ArrowLeft, Phone, Mail, MapPin, Plane, Hotel, Navigation, FileText } from "lucide-react";

const stats = [
  { value: "+50,000", label: "حاج ومعتمر", icon: Users, color: "text-emerald-400" },
  { value: "+200", label: "مزود خدمة معتمد", icon: Award, color: "text-amber-400" },
  { value: "24/7", label: "دعم متواصل", icon: Clock, color: "text-blue-400" },
  { value: "98%", label: "نسبة رضا العملاء", icon: Star, color: "text-purple-400" },
];

const values = [
  {
    icon: Heart,
    title: "الإخلاص",
    desc: "نعمل بإخلاص وتفانٍ تام في خدمة ضيوف الرحمن، لأن خدمتكم شرف لنا وثواب عظيم.",
    color: "from-rose-500/20 to-rose-600/5",
    border: "border-rose-500/30",
    iconColor: "text-rose-400",
  },
  {
    icon: Shield,
    title: "الثقة والأمان",
    desc: "نضمن أعلى معايير الأمان والموثوقية في جميع خدماتنا، بياناتكم وأموالكم في أمان تام.",
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
  },
  {
    icon: Star,
    title: "التميز في الخدمة",
    desc: "نسعى دائماً لتقديم تجربة استثنائية تتجاوز توقعاتكم في كل جانب من جوانب رحلتكم.",
    color: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
  },
  {
    icon: Globe,
    title: "الشمولية",
    desc: "نخدم المسلمين من جميع أنحاء العالم بلا استثناء، بأكثر من 15 لغة ودعم متعدد العملات.",
    color: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
];

const services = [
  { icon: Plane, title: "باقات العمرة والحج", desc: "باقات متكاملة تناسب جميع الميزانيات والاحتياجات، من الاقتصادية إلى VIP الفاخرة.", link: "/umrah" },
  { icon: Hotel, title: "الفنادق والإقامة", desc: "أفضل الفنادق بالقرب من المسجد الحرام والمسجد النبوي بأسعار تنافسية.", link: "/hotels" },
  { icon: Navigation, title: "النقل والمواصلات", desc: "خدمات نقل آمنة ومريحة بين المشاعر المقدسة ومن وإلى المطارات.", link: "/transportation" },
  { icon: FileText, title: "التأشيرات والوثائق", desc: "مساعدة كاملة في إجراءات التأشيرات والوثائق الرسمية المطلوبة.", link: "/visas" },
];

const milestones = [
  { year: "2019", event: "تأسيس منصة جو عمرة بهدف تحويل تجربة الحج والعمرة رقمياً" },
  { year: "2020", event: "إطلاق أول نسخة من المنصة وخدمة أولى 1,000 معتمر" },
  { year: "2021", event: "التوسع لخدمة أكثر من 20 دولة وإضافة خدمات الفنادق والطيران" },
  { year: "2022", event: "الحصول على تراخيص وكيل سفر رسمي وتوثيق التجارة الإلكترونية" },
  { year: "2023", event: "تجاوز 25,000 حاج ومعتمر وإطلاق تطبيق الجوال" },
  { year: "2024", event: "تجاوز 50,000 ضيف رحمن وإطلاق نظام الذكاء الاصطناعي للتوصيات" },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 text-emerald-400 text-sm mb-6">
            <Heart className="w-4 h-4" />
            <span>شريكك الموثوق نحو بيت الله الحرام</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            من نحن
            <span className="block text-emerald-400 mt-2">منصة جو عمرة</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            بوابتكم الروحانية نحو الكعبة المشرفة. منصة رقمية متطورة تجمع بين التكنولوجيا الحديثة والخبرة العميقة في خدمة ضيوف الرحمن من جميع أنحاء العالم.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/8 transition-colors">
              <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-400">رؤيتنا</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              أن نكون المنصة الرائدة عالمياً في تنظيم رحلات الحج والعمرة، ونساهم في تحقيق حلم كل مسلم بأداء هذه الفريضة المقدسة بأفضل الطرق وأيسرها وأكثرها راحة وطمأنينة.
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-amber-400">رسالتنا</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              تقديم خدمات متكاملة وموثوقة تشمل جميع جوانب رحلة الحج والعمرة، من التخطيط والحجز إلى الإرشاد الديني والمتابعة الميدانية، مع ضمان أعلى معايير الجودة والأمان والراحة.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">قيمنا الأساسية</h2>
            <p className="text-gray-400 text-lg">المبادئ التي تحكم كل قرار نتخذه وكل خدمة نقدمها</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className={`bg-gradient-to-br ${v.color} border ${v.border} rounded-2xl p-6 hover:scale-105 transition-transform`}>
                <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4`}>
                  <v.icon className={`w-6 h-6 ${v.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">خدماتنا الشاملة</h2>
            <p className="text-gray-400 text-lg">كل ما تحتاجه لرحلة مباركة في مكان واحد</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((s) => (
              <Link key={s.title} href={s.link}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-emerald-500/30 transition-all cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-500/15 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/25 transition-colors">
                      <s.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors">{s.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-emerald-400 transition-colors mr-auto flex-shrink-0 mt-1 rotate-180" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">مسيرتنا</h2>
            <p className="text-gray-400 text-lg">رحلة نمو مستمرة في خدمة ضيوف الرحمن</p>
          </div>
          <div className="relative">
            <div className="absolute right-[7.5rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-emerald-500/50 to-transparent hidden md:block" />
            <div className="space-y-6">
              {milestones.map((m, i) => (
                <div key={m.year} className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-28 text-left">
                    <span className="text-emerald-400 font-bold text-lg">{m.year}</span>
                  </div>
                  <div className="hidden md:flex flex-shrink-0 w-4 h-4 bg-emerald-500 rounded-full mt-1 ring-4 ring-emerald-500/20 relative z-10" />
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1 hover:bg-white/8 transition-colors">
                    <p className="text-gray-300 leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-16 px-4 bg-gradient-to-b from-transparent to-emerald-900/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">التكنولوجيا في خدمة العبادة</h2>
            <p className="text-gray-400 text-lg">نستخدم أحدث التقنيات لضمان تجربة سلسة وآمنة</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "منصة حجز متطورة", desc: "واجهة سهلة وسريعة تتيح حجز جميع الخدمات في خطوات بسيطة" },
              { title: "دفع آمن متعدد الخيارات", desc: "بطاقات ائتمانية، محافظ إلكترونية، تحويل بنكي — كلها محمية بتشفير SSL" },
              { title: "تتبع الحجوزات لحظياً", desc: "تابع حالة حجزك وتأشيرتك ورحلتك في الوقت الفعلي" },
              { title: "دعم متعدد اللغات", desc: "واجهة بأكثر من 15 لغة لخدمة المسلمين في كل مكان" },
              { title: "ذكاء اصطناعي للتوصيات", desc: "نظام ذكي يقترح الباقات المناسبة بناءً على احتياجاتك وميزانيتك" },
              { title: "تطبيق جوال متكامل", desc: "إدارة رحلتك كاملاً من هاتفك — iOS وAndroid" },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-emerald-500/30 transition-colors">
                <CheckCircle className="w-6 h-6 text-emerald-400 mb-3" />
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-500/15 to-amber-500/10 border border-emerald-500/20 rounded-3xl p-10">
            <h2 className="text-3xl font-bold mb-4">تواصل معنا</h2>
            <p className="text-gray-300 mb-8 text-lg">نحن هنا لخدمتكم ومساعدتكم في تحقيق حلم الحج والعمرة. فريقنا متاح على مدار الساعة.</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a href="https://wa.me/966557123435" className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-5 py-3 transition-colors">
                <Phone className="w-5 h-5 text-emerald-400" />
                <span dir="ltr">+966 55 712 3435</span>
              </a>
              <a href="mailto:admin@go-umrah.com" className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-5 py-3 transition-colors">
                <Mail className="w-5 h-5 text-emerald-400" />
                <span>admin@go-umrah.com</span>
              </a>
              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-5 py-3">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>الرياض، المملكة العربية السعودية</span>
              </div>
            </div>
            <Link href="/complaints">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl transition-colors">
                أرسل لنا رسالة
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
