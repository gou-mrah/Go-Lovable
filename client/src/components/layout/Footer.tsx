import { Link } from "wouter";
import {
  Facebook, Twitter, Instagram, Youtube, Linkedin,
  Phone, Mail, MapPin, Shield, FileText, HelpCircle,
  AlertCircle, MessageSquare, Award, ChevronLeft
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_2564fd9d.png";
const PATTERN_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/islamic-pattern-transparent_77cebfa3.png";

const socialLinks = [
  { icon: Facebook,  href: "https://facebook.com/GoUmrahOfficial",      label: "Facebook",  color: "#1877F2" },
  { icon: Twitter,   href: "https://twitter.com/GoUmrahOfficial",       label: "Twitter/X", color: "#1DA1F2" },
  { icon: Instagram, href: "https://instagram.com/GoUmrahOfficial",     label: "Instagram", color: "#E1306C" },
  { icon: Linkedin,  href: "https://linkedin.com/company/GoUmrahOfficial", label: "LinkedIn", color: "#0A66C2" },
  { icon: Youtube,   href: "https://youtube.com/GoUmrahOfficial",       label: "YouTube",   color: "#FF0000" },
];

// WhatsApp, Snapchat, TikTok as SVG icons
const extraSocials = [
  {
    label: "WhatsApp",
    href: "https://wa.me/966557123435",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    label: "Snapchat",
    href: "https://snapchat.com/add/GoUmrahOfficial",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@GoUmrahOfficial",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const { t, language } = useLanguage();
  const isRTL = language === "ar" || language === "ur";

  const services = [
    { label: "باقات العمرة",  href: "/umrah" },
    { label: "باقات الحج",    href: "/hajj" },
    { label: "الطيران",       href: "/flights" },
    { label: "الفنادق",       href: "/hotels" },
    { label: "التأشيرات",     href: "/visa" },
    { label: "النقل",         href: "/transport" },
    { label: "السياحة",       href: "/tours" },
    { label: "المتجر",        href: "/store" },
  ];

  const infoLinks = [
    { label: "من نحن",                href: "/about",    icon: HelpCircle },
    { label: "الأسئلة الشائعة",       href: "/faq",      icon: HelpCircle },
    { label: "التراخيص الرسمية",      href: "/licenses", icon: Award },
    { label: "الشكاوى والاقتراحات",   href: "/complaints",  icon: MessageSquare },
  ];

  const legalLinks = [
    { label: "سياسة الخصوصية",  href: "/privacy-policy",        icon: Shield },
    { label: "الشروط والأحكام", href: "/terms-and-conditions",   icon: FileText },
    { label: "سياسة الإلغاء",   href: "/cancellation",          icon: AlertCircle },
  ];

  const licenses = [
    { label: "وكيل سفر وسياحة",          value: "73104943" },
    { label: "توثيق التجارة الإلكترونية", value: "30637" },
    { label: "ترخيص إعلامي",             value: "150283" },
    { label: "السجل التجاري",            value: "4650260256" },
    { label: "الرقم الضريبي",            value: "311722780600003" },
    { label: "شهادة معروف الإلكترونية",  value: "343974" },
  ];

  return (
    <footer dir="rtl" className="relative overflow-hidden text-white" style={{ background: "linear-gradient(180deg, #0a1f0f 0%, #061409 100%)" }}>
      {/* Islamic pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url('${PATTERN_URL}')`,
          backgroundSize: "180px 104px",
          backgroundRepeat: "repeat",
          opacity: 0.07,
        }}
      />

      {/* Gold top border */}
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, transparent 0%, #C9A84C 30%, #F0D060 50%, #C9A84C 70%, transparent 100%)" }} />

      {/* Main footer content */}
      <div className="relative z-10 container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Column 1: Brand + Description + Social ── */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <div className="mb-5">
              <img
                src={LOGO_URL}
                alt="Go Umrah"
                className="h-24 w-auto object-contain"
                style={{ mixBlendMode: "screen", filter: "brightness(1.1) contrast(1.05)" }}
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  const fallback = el.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="w-12 h-12 rounded-xl items-center justify-center shadow-md hidden"
                style={{ background: "linear-gradient(135deg, #C9A84C, #F0D060)", display: "none" }}
              >
                <span className="text-white font-bold text-xl" style={{ fontFamily: "'Tajawal', sans-serif" }}>G</span>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-white/65 text-sm leading-relaxed mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              في جو عمرة، نصمم لك تجربة إيمانية متكاملة وسلسة. اكتشف باقات العمرة والحج، احجز طيرانك وفنادقك، ودعنا نهتم بكل التفاصيل لتتفرغ لعبادتك.
            </p>
            <p className="text-sm mb-6" style={{ color: "#C9A84C", fontFamily: "'Tajawal', sans-serif" }}>
              لأن خدمتك شرف لنا وثواب.
            </p>

            {/* Social media */}
            <div className="flex flex-wrap gap-2 mb-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.2)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.5)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
                >
                  <Icon className="w-4 h-4 text-white/70" />
                </a>
              ))}
              {extraSocials.map(({ label, href, svg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 text-white/70"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.2)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.5)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"; }}
                >
                  {svg}
                </a>
              ))}
            </div>

            {/* Contact quick */}
            <div className="space-y-2 mt-4">
              <a href="https://wa.me/966557123435" className="flex items-center gap-2 text-white/60 hover:text-white text-xs transition-colors group">
                <Phone className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
                <span dir="ltr">+966 55 712 3435</span>
              </a>
              <a href="mailto:admin@go-umrah.com" className="flex items-center gap-2 text-white/60 hover:text-white text-xs transition-colors">
                <Mail className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />
                <span>admin@go-umrah.com</span>
              </a>
              <div className="flex items-start gap-2 text-white/60 text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                <span>المملكة العربية السعودية</span>
              </div>
            </div>
          </div>

          {/* ── Column 2: Services ── */}
          <div>
            <h4
              className="font-bold text-white mb-5 text-base pb-3 border-b"
              style={{ fontFamily: "'Tajawal', sans-serif", borderColor: "rgba(201,168,76,0.3)" }}
            >
              <span style={{ color: "#C9A84C" }}>خدماتنا</span>
            </h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-white/65 hover:text-white text-sm transition-all duration-200 flex items-center gap-2 group"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" style={{ color: "#C9A84C" }} />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Info + Legal ── */}
          <div>
            <h4
              className="font-bold text-white mb-5 text-base pb-3 border-b"
              style={{ fontFamily: "'Tajawal', sans-serif", borderColor: "rgba(201,168,76,0.3)" }}
            >
              <span style={{ color: "#C9A84C" }}>معلومات</span>
            </h4>
            <ul className="space-y-2.5 mb-7">
              {infoLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/65 hover:text-white text-sm transition-all duration-200 flex items-center gap-2 group"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" style={{ color: "#C9A84C" }} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h4
              className="font-bold text-white mb-5 text-base pb-3 border-b"
              style={{ fontFamily: "'Tajawal', sans-serif", borderColor: "rgba(201,168,76,0.3)" }}
            >
              <span style={{ color: "#C9A84C" }}>قانوني</span>
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/65 hover:text-white text-sm transition-all duration-200 flex items-center gap-2 group"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" style={{ color: "#C9A84C" }} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Licenses ── */}
          <div>
            <h4
              className="font-bold text-white mb-5 text-base pb-3 border-b"
              style={{ fontFamily: "'Tajawal', sans-serif", borderColor: "rgba(201,168,76,0.3)" }}
            >
              <span style={{ color: "#C9A84C" }}>التراخيص والاعتمادات</span>
            </h4>
            <div className="space-y-3">
              {licenses.map((lic) => (
                <div
                  key={lic.label}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <span className="text-white/55 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>{lic.label}</span>
                  <span className="text-xs font-mono font-semibold" style={{ color: "#C9A84C", direction: "ltr" }}>{lic.value}</span>
                </div>
              ))}
            </div>

            {/* Payment methods badge */}
            <div className="mt-6 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-white/40 text-xs mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>وسائل الدفع المقبولة</p>
              <div className="flex flex-wrap gap-2">
                {["Visa", "Mastercard", "Mada", "Apple Pay", "STC Pay"].map((pm) => (
                  <span
                    key={pm}
                    className="px-2.5 py-1 rounded text-xs font-medium"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
                  >
                    {pm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t" style={{ borderColor: "rgba(201,168,76,0.2)" }}>
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3" dir="rtl">
          <p className="text-white/45 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            © {new Date().getFullYear()} جو عمرة. جميع الحقوق محفوظة.
          </p>
          <p className="text-white/30 text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            خدمتكم... شرف وأجر
          </p>
        </div>
      </div>
    </footer>
  );
}
