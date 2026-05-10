import { Shield, Award, FileText, CheckCircle, ExternalLink } from "lucide-react";

const PATTERN_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/islamic-pattern-transparent_77cebfa3.png";

const licenses = [
  {
    id: "travel-agent",
    title: "وكيل سفر وسياحة",
    number: "73104943",
    issuer: "الهيئة السعودية للسياحة",
    description: "ترخيص رسمي من الهيئة السعودية للسياحة يخوّل المنصة تقديم خدمات السفر والسياحة في المملكة العربية السعودية.",
    icon: Award,
    color: "#C9A84C",
  },
  {
    id: "ecommerce",
    title: "توثيق التجارة الإلكترونية",
    number: "30637",
    issuer: "المركز السعودي للأعمال",
    description: "شهادة توثيق التجارة الإلكترونية من المركز السعودي للأعمال، تضمن حقوق المستهلك وموثوقية المعاملات الإلكترونية.",
    icon: Shield,
    color: "#3B82F6",
  },
  {
    id: "media",
    title: "ترخيص إعلامي",
    number: "150283",
    issuer: "وزارة الإعلام السعودية",
    description: "ترخيص إعلامي رسمي من وزارة الإعلام يتيح نشر المحتوى الرقمي والإعلاني المتعلق بخدمات الحج والعمرة.",
    icon: FileText,
    color: "#10B981",
  },
  {
    id: "commercial",
    title: "السجل التجاري",
    number: "4650260256",
    issuer: "وزارة التجارة السعودية",
    description: "سجل تجاري رسمي يثبت الوجود القانوني للشركة ويخوّلها ممارسة النشاط التجاري في المملكة العربية السعودية.",
    icon: Award,
    color: "#8B5CF6",
  },
  {
    id: "tax",
    title: "الرقم الضريبي",
    number: "311722780600003",
    issuer: "هيئة الزكاة والضريبة والجمارك",
    description: "رقم تسجيل ضريبي صادر من هيئة الزكاة والضريبة والجمارك، يؤكد الامتثال الكامل للأنظمة الضريبية السعودية.",
    icon: CheckCircle,
    color: "#F59E0B",
  },
  {
    id: "maroof",
    title: "شهادة معروف الإلكترونية",
    number: "343974",
    issuer: "وزارة الموارد البشرية والتنمية الاجتماعية",
    description: "شهادة معروف الإلكترونية تعكس التزام المنصة بمعايير التجارة الإلكترونية السعودية وتوفر حماية إضافية للمستهلكين في المعاملات الرقمية.",
    icon: Shield,
    color: "#06B6D4",
  },
];

const trustBadges = [
  { label: "SSL محمي", desc: "جميع البيانات مشفرة بتقنية SSL 256-bit" },
  { label: "دفع آمن", desc: "بوابات دفع معتمدة ومؤمّنة بالكامل" },
  { label: "خصوصية محمية", desc: "لا نشارك بياناتك مع أي طرف ثالث" },
  { label: "دعم 24/7", desc: "فريق دعم متاح على مدار الساعة" },
];

export default function LicensesPage() {
  return (
    <div
      className="min-h-screen"
      dir="rtl"
      style={{ background: "linear-gradient(180deg, #0a1f0f 0%, #061409 60%, #0a1f0f 100%)" }}
    >
      {/* Islamic pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url('${PATTERN_URL}')`,
          backgroundSize: "180px 104px",
          backgroundRepeat: "repeat",
          opacity: 0.04,
          zIndex: 0,
        }}
      />

      <div className="relative z-10">
        {/* Hero */}
        <div className="py-20 text-center px-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6"
            style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", color: "#C9A84C" }}
          >
            <Shield className="w-4 h-4" />
            التراخيص والاعتمادات الرسمية
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            موثوقون ومرخّصون رسمياً
          </h1>
          <p
            className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            جو عمرة منصة مرخصة ومعتمدة من الجهات الحكومية السعودية المختصة، نلتزم بأعلى معايير الشفافية والأمان لضمان تجربة موثوقة لضيوف الرحمن.
          </p>
        </div>

        {/* Licenses grid */}
        <div className="container max-w-5xl pb-16 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {licenses.map((lic) => {
              const Icon = lic.icon;
              return (
                <div
                  key={lic.id}
                  className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.border = `1px solid ${lic.color}40`;
                    (e.currentTarget as HTMLElement).style.background = `rgba(255,255,255,0.06)`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.border = "1px solid rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${lic.color}20`, border: `1px solid ${lic.color}40` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: lic.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3
                          className="text-white font-bold text-base"
                          style={{ fontFamily: "'Tajawal', sans-serif" }}
                        >
                          {lic.title}
                        </h3>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                          style={{ background: `${lic.color}20`, color: lic.color, border: `1px solid ${lic.color}40` }}
                        >
                          ✓ فعّال
                        </span>
                      </div>
                      <p
                        className="text-xs mb-3"
                        style={{ color: lic.color, fontFamily: "'Tajawal', sans-serif" }}
                      >
                        {lic.issuer}
                      </p>
                      <p
                        className="text-white/55 text-sm leading-relaxed mb-4"
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        {lic.description}
                      </p>
                      <div
                        className="flex items-center justify-between rounded-lg px-3 py-2"
                        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <span className="text-white/40 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                          رقم الترخيص
                        </span>
                        <span
                          className="font-mono font-bold text-sm tracking-wider"
                          style={{ color: lic.color, direction: "ltr" }}
                        >
                          {lic.number}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust badges */}
          <div
            className="rounded-2xl p-8 mb-10"
            style={{
              background: "rgba(201,168,76,0.06)",
              border: "1px solid rgba(201,168,76,0.2)",
            }}
          >
            <h2
              className="text-xl font-bold text-white text-center mb-8"
              style={{ fontFamily: "'Tajawal', sans-serif", color: "#C9A84C" }}
            >
              معايير الأمان والثقة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)" }}
                  >
                    <CheckCircle className="w-6 h-6" style={{ color: "#C9A84C" }} />
                  </div>
                  <p
                    className="text-white font-semibold text-sm mb-1"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {badge.label}
                  </p>
                  <p
                    className="text-white/45 text-xs leading-relaxed"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    {badge.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Official links */}
          <div className="text-center">
            <p
              className="text-white/40 text-sm mb-4"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              يمكنك التحقق من تراخيصنا مباشرة عبر المواقع الرسمية للجهات الحكومية
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "الهيئة السعودية للسياحة", href: "https://www.sta.gov.sa" },
                { label: "وزارة التجارة", href: "https://www.mc.gov.sa" },
                { label: "هيئة الزكاة والضريبة", href: "https://zatca.gov.sa" },
              { label: "منصة معروف", href: "https://maroof.sa" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:text-white"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
