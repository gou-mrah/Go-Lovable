import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle2, Phone, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png";

const MADINAH_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/mecca-kaaba-portrait_80190fe8.jpg";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

const BENEFITS = [
  "تتبع حجوزاتك بسهولة",
  "عروض حصرية للأعضاء",
  "دعم مخصص على مدار الساعة",
  "إشعارات فورية بتحديثات رحلتك",
];

// Full countries list with Arabic names and phone codes
const COUNTRIES = [
  { code: "SA", nameAr: "المملكة العربية السعودية", dialCode: "+966", flag: "🇸🇦" },
  { code: "AE", nameAr: "الإمارات العربية المتحدة", dialCode: "+971", flag: "🇦🇪" },
  { code: "KW", nameAr: "الكويت", dialCode: "+965", flag: "🇰🇼" },
  { code: "QA", nameAr: "قطر", dialCode: "+974", flag: "🇶🇦" },
  { code: "BH", nameAr: "البحرين", dialCode: "+973", flag: "🇧🇭" },
  { code: "OM", nameAr: "عُمان", dialCode: "+968", flag: "🇴🇲" },
  { code: "EG", nameAr: "مصر", dialCode: "+20", flag: "🇪🇬" },
  { code: "JO", nameAr: "الأردن", dialCode: "+962", flag: "🇯🇴" },
  { code: "LB", nameAr: "لبنان", dialCode: "+961", flag: "🇱🇧" },
  { code: "SY", nameAr: "سوريا", dialCode: "+963", flag: "🇸🇾" },
  { code: "IQ", nameAr: "العراق", dialCode: "+964", flag: "🇮🇶" },
  { code: "YE", nameAr: "اليمن", dialCode: "+967", flag: "🇾🇪" },
  { code: "LY", nameAr: "ليبيا", dialCode: "+218", flag: "🇱🇾" },
  { code: "TN", nameAr: "تونس", dialCode: "+216", flag: "🇹🇳" },
  { code: "DZ", nameAr: "الجزائر", dialCode: "+213", flag: "🇩🇿" },
  { code: "MA", nameAr: "المغرب", dialCode: "+212", flag: "🇲🇦" },
  { code: "SD", nameAr: "السودان", dialCode: "+249", flag: "🇸🇩" },
  { code: "SO", nameAr: "الصومال", dialCode: "+252", flag: "🇸🇴" },
  { code: "MR", nameAr: "موريتانيا", dialCode: "+222", flag: "🇲🇷" },
  { code: "PS", nameAr: "فلسطين", dialCode: "+970", flag: "🇵🇸" },
  { code: "PK", nameAr: "باكستان", dialCode: "+92", flag: "🇵🇰" },
  { code: "IN", nameAr: "الهند", dialCode: "+91", flag: "🇮🇳" },
  { code: "BD", nameAr: "بنغلاديش", dialCode: "+880", flag: "🇧🇩" },
  { code: "ID", nameAr: "إندونيسيا", dialCode: "+62", flag: "🇮🇩" },
  { code: "MY", nameAr: "ماليزيا", dialCode: "+60", flag: "🇲🇾" },
  { code: "TR", nameAr: "تركيا", dialCode: "+90", flag: "🇹🇷" },
  { code: "IR", nameAr: "إيران", dialCode: "+98", flag: "🇮🇷" },
  { code: "AF", nameAr: "أفغانستان", dialCode: "+93", flag: "🇦🇫" },
  { code: "NG", nameAr: "نيجيريا", dialCode: "+234", flag: "🇳🇬" },
  { code: "SN", nameAr: "السنغال", dialCode: "+221", flag: "🇸🇳" },
  { code: "ML", nameAr: "مالي", dialCode: "+223", flag: "🇲🇱" },
  { code: "NE", nameAr: "النيجر", dialCode: "+227", flag: "🇳🇪" },
  { code: "TD", nameAr: "تشاد", dialCode: "+235", flag: "🇹🇩" },
  { code: "GN", nameAr: "غينيا", dialCode: "+224", flag: "🇬🇳" },
  { code: "GH", nameAr: "غانا", dialCode: "+233", flag: "🇬🇭" },
  { code: "ET", nameAr: "إثيوبيا", dialCode: "+251", flag: "🇪🇹" },
  { code: "KE", nameAr: "كينيا", dialCode: "+254", flag: "🇰🇪" },
  { code: "TZ", nameAr: "تنزانيا", dialCode: "+255", flag: "🇹🇿" },
  { code: "UG", nameAr: "أوغندا", dialCode: "+256", flag: "🇺🇬" },
  { code: "MZ", nameAr: "موزمبيق", dialCode: "+258", flag: "🇲🇿" },
  { code: "GB", nameAr: "المملكة المتحدة", dialCode: "+44", flag: "🇬🇧" },
  { code: "US", nameAr: "الولايات المتحدة الأمريكية", dialCode: "+1", flag: "🇺🇸" },
  { code: "CA", nameAr: "كندا", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", nameAr: "أستراليا", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", nameAr: "ألمانيا", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", nameAr: "فرنسا", dialCode: "+33", flag: "🇫🇷" },
  { code: "NL", nameAr: "هولندا", dialCode: "+31", flag: "🇳🇱" },
  { code: "SE", nameAr: "السويد", dialCode: "+46", flag: "🇸🇪" },
  { code: "NO", nameAr: "النرويج", dialCode: "+47", flag: "🇳🇴" },
  { code: "DK", nameAr: "الدنمارك", dialCode: "+45", flag: "🇩🇰" },
  { code: "IT", nameAr: "إيطاليا", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", nameAr: "إسبانيا", dialCode: "+34", flag: "🇪🇸" },
  { code: "PT", nameAr: "البرتغال", dialCode: "+351", flag: "🇵🇹" },
  { code: "BE", nameAr: "بلجيكا", dialCode: "+32", flag: "🇧🇪" },
  { code: "CH", nameAr: "سويسرا", dialCode: "+41", flag: "🇨🇭" },
  { code: "AT", nameAr: "النمسا", dialCode: "+43", flag: "🇦🇹" },
  { code: "RU", nameAr: "روسيا", dialCode: "+7", flag: "🇷🇺" },
  { code: "CN", nameAr: "الصين", dialCode: "+86", flag: "🇨🇳" },
  { code: "JP", nameAr: "اليابان", dialCode: "+81", flag: "🇯🇵" },
  { code: "KR", nameAr: "كوريا الجنوبية", dialCode: "+82", flag: "🇰🇷" },
  { code: "SG", nameAr: "سنغافورة", dialCode: "+65", flag: "🇸🇬" },
  { code: "TH", nameAr: "تايلاند", dialCode: "+66", flag: "🇹🇭" },
  { code: "PH", nameAr: "الفلبين", dialCode: "+63", flag: "🇵🇭" },
  { code: "VN", nameAr: "فيتنام", dialCode: "+84", flag: "🇻🇳" },
  { code: "NP", nameAr: "نيبال", dialCode: "+977", flag: "🇳🇵" },
  { code: "LK", nameAr: "سريلانكا", dialCode: "+94", flag: "🇱🇰" },
  { code: "MV", nameAr: "جزر المالديف", dialCode: "+960", flag: "🇲🇻" },
  { code: "BR", nameAr: "البرازيل", dialCode: "+55", flag: "🇧🇷" },
  { code: "AR", nameAr: "الأرجنتين", dialCode: "+54", flag: "🇦🇷" },
  { code: "MX", nameAr: "المكسيك", dialCode: "+52", flag: "🇲🇽" },
  { code: "ZA", nameAr: "جنوب أفريقيا", dialCode: "+27", flag: "🇿🇦" },
  { code: "AZ", nameAr: "أذربيجان", dialCode: "+994", flag: "🇦🇿" },
  { code: "KZ", nameAr: "كازاخستان", dialCode: "+7", flag: "🇰🇿" },
  { code: "UZ", nameAr: "أوزبكستان", dialCode: "+998", flag: "🇺🇿" },
  { code: "TJ", nameAr: "طاجيكستان", dialCode: "+992", flag: "🇹🇯" },
  { code: "KG", nameAr: "قيرغيزستان", dialCode: "+996", flag: "🇰🇬" },
  { code: "TM", nameAr: "تركمانستان", dialCode: "+993", flag: "🇹🇲" },
  { code: "AL", nameAr: "ألبانيا", dialCode: "+355", flag: "🇦🇱" },
  { code: "BA", nameAr: "البوسنة والهرسك", dialCode: "+387", flag: "🇧🇦" },
  { code: "MK", nameAr: "مقدونيا الشمالية", dialCode: "+389", flag: "🇲🇰" },
  { code: "XK", nameAr: "كوسوفو", dialCode: "+383", flag: "🇽🇰" },
  { code: "GE", nameAr: "جورجيا", dialCode: "+995", flag: "🇬🇪" },
  { code: "AM", nameAr: "أرمينيا", dialCode: "+374", flag: "🇦🇲" },
  { code: "DJ", nameAr: "جيبوتي", dialCode: "+253", flag: "🇩🇯" },
  { code: "ER", nameAr: "إريتريا", dialCode: "+291", flag: "🇪🇷" },
  { code: "CM", nameAr: "الكاميرون", dialCode: "+237", flag: "🇨🇲" },
  { code: "CI", nameAr: "ساحل العاج", dialCode: "+225", flag: "🇨🇮" },
  { code: "BF", nameAr: "بوركينا فاسو", dialCode: "+226", flag: "🇧🇫" },
  { code: "GM", nameAr: "غامبيا", dialCode: "+220", flag: "🇬🇲" },
  { code: "SL", nameAr: "سيراليون", dialCode: "+232", flag: "🇸🇱" },
  { code: "LR", nameAr: "ليبيريا", dialCode: "+231", flag: "🇱🇷" },
  { code: "TG", nameAr: "توغو", dialCode: "+228", flag: "🇹🇬" },
  { code: "BJ", nameAr: "بنين", dialCode: "+229", flag: "🇧🇯" },
  { code: "GW", nameAr: "غينيا بيساو", dialCode: "+245", flag: "🇬🇼" },
  { code: "CV", nameAr: "الرأس الأخضر", dialCode: "+238", flag: "🇨🇻" },
  { code: "ST", nameAr: "ساو تومي وبرينسيبي", dialCode: "+239", flag: "🇸🇹" },
  { code: "GQ", nameAr: "غينيا الاستوائية", dialCode: "+240", flag: "🇬🇶" },
  { code: "GA", nameAr: "الغابون", dialCode: "+241", flag: "🇬🇦" },
  { code: "CG", nameAr: "الكونغو", dialCode: "+242", flag: "🇨🇬" },
  { code: "CD", nameAr: "جمهورية الكونغو الديمقراطية", dialCode: "+243", flag: "🇨🇩" },
  { code: "CF", nameAr: "جمهورية أفريقيا الوسطى", dialCode: "+236", flag: "🇨🇫" },
  { code: "AO", nameAr: "أنغولا", dialCode: "+244", flag: "🇦🇴" },
  { code: "ZM", nameAr: "زامبيا", dialCode: "+260", flag: "🇿🇲" },
  { code: "ZW", nameAr: "زيمبابوي", dialCode: "+263", flag: "🇿🇼" },
  { code: "BW", nameAr: "بوتسوانا", dialCode: "+267", flag: "🇧🇼" },
  { code: "NA", nameAr: "ناميبيا", dialCode: "+264", flag: "🇳🇦" },
  { code: "LS", nameAr: "ليسوتو", dialCode: "+266", flag: "🇱🇸" },
  { code: "SZ", nameAr: "إسواتيني", dialCode: "+268", flag: "🇸🇿" },
  { code: "MW", nameAr: "مالاوي", dialCode: "+265", flag: "🇲🇼" },
  { code: "MG", nameAr: "مدغشقر", dialCode: "+261", flag: "🇲🇬" },
  { code: "MU", nameAr: "موريشيوس", dialCode: "+230", flag: "🇲🇺" },
  { code: "SC", nameAr: "سيشل", dialCode: "+248", flag: "🇸🇨" },
  { code: "KM", nameAr: "جزر القمر", dialCode: "+269", flag: "🇰🇲" },
  { code: "RW", nameAr: "رواندا", dialCode: "+250", flag: "🇷🇼" },
  { code: "BI", nameAr: "بوروندي", dialCode: "+257", flag: "🇧🇮" },
  { code: "SS", nameAr: "جنوب السودان", dialCode: "+211", flag: "🇸🇸" },
  { code: "NZ", nameAr: "نيوزيلندا", dialCode: "+64", flag: "🇳🇿" },
  { code: "FJ", nameAr: "فيجي", dialCode: "+679", flag: "🇫🇯" },
  { code: "PG", nameAr: "بابوا غينيا الجديدة", dialCode: "+675", flag: "🇵🇬" },
  { code: "SB", nameAr: "جزر سليمان", dialCode: "+677", flag: "🇸🇧" },
  { code: "VU", nameAr: "فانواتو", dialCode: "+678", flag: "🇻🇺" },
  { code: "WS", nameAr: "ساموا", dialCode: "+685", flag: "🇼🇸" },
  { code: "TO", nameAr: "تونغا", dialCode: "+676", flag: "🇹🇴" },
  { code: "KI", nameAr: "كيريباتي", dialCode: "+686", flag: "🇰🇮" },
  { code: "FM", nameAr: "ميكرونيزيا", dialCode: "+691", flag: "🇫🇲" },
  { code: "MH", nameAr: "جزر مارشال", dialCode: "+692", flag: "🇲🇭" },
  { code: "PW", nameAr: "بالاو", dialCode: "+680", flag: "🇵🇼" },
  { code: "NR", nameAr: "ناورو", dialCode: "+674", flag: "🇳🇷" },
  { code: "TV", nameAr: "توفالو", dialCode: "+688", flag: "🇹🇻" },
];

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<typeof COUNTRIES[0] | null>(null);
  const [phone, setPhone] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const filteredCountries = useMemo(() =>
    countrySearch.trim()
      ? COUNTRIES.filter(c => c.nameAr.includes(countrySearch) || c.dialCode.includes(countrySearch))
      : COUNTRIES,
    [countrySearch]
  );

  // Progress bar calculation
  const progressFields = [
    !!name.trim(),
    !!email.trim(),
    password.length >= 8,
    confirmPassword === password && confirmPassword.length > 0,
    !!selectedCountry,
    !!phone.trim(),
  ];
  const progressPercent = Math.round((progressFields.filter(Boolean).length / progressFields.length) * 100);
  const progressColor =
    progressPercent < 40 ? "#ef4444" :
    progressPercent < 70 ? "#f59e0b" :
    progressPercent < 100 ? "#3b82f6" : "#22c55e";

  const registerMutation = trpc.customAuth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      await utils.customAuth.me.invalidate();
      toast.success("تم إنشاء الحساب بنجاح", { description: "مرحباً بك في عائلة جو عمرة!" });
      navigate("/");
    },
    onError: (err) => {
      toast.error("خطأ في إنشاء الحساب", { description: err.message });
    },
  });

  const googleLoginMutation = trpc.profile.googleLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("تم إنشاء الحساب بنجاح عبر Google");
      navigate("/");
    },
    onError: (err) => toast.error("خطأ في إنشاء الحساب بـ Google", { description: err.message }),
  });

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.info("تسجيل الدخول بـ Google يتطلب إعداد VITE_GOOGLE_CLIENT_ID");
      return;
    }
    const client = (window as any).google?.accounts?.id;
    if (!client) {
      toast.error("لم يتم تحميل Google SDK");
      return;
    }
    client.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        googleLoginMutation.mutate({ idToken: response.credential, clientId: GOOGLE_CLIENT_ID });
      },
    });
    client.prompt();
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!countryDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#country-dropdown-container")) setCountryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [countryDropdownOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    const fullPhone = selectedCountry && phone.trim()
      ? `${selectedCountry.dialCode}${phone.trim()}`
      : phone.trim() || undefined;
    registerMutation.mutate({
      name,
      email,
      password,
      phone: fullPhone,
      nationality: selectedCountry?.nameAr,
    });
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"];
  const strengthLabels = ["", "ضعيفة", "متوسطة", "قوية"];

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex lg:w-5/12 relative flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0d2b24 0%, #1B5E52 60%, #0d2b24 100%)" }}
      >
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${MADINAH_BG})` }} />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23C9A96E' stroke-width='0.9'><path d='M 100,54 A 55.744,55.744 0 0,0 146,100 A 55.744,55.744 0 0,0 100,146 A 55.744,55.744 0 0,0 54,100 A 55.744,55.744 0 0,0 100,54 Z'/><path d='M 0,-46 A 55.744,55.744 0 0,0 46,0 A 55.744,55.744 0 0,0 0,46 A 55.744,55.744 0 0,0 -46,0 A 55.744,55.744 0 0,0 0,-46 Z'/><path d='M 200,-46 A 55.744,55.744 0 0,0 246,0 A 55.744,55.744 0 0,0 200,46 A 55.744,55.744 0 0,0 154,0 A 55.744,55.744 0 0,0 200,-46 Z'/><path d='M 0,154 A 55.744,55.744 0 0,0 46,200 A 55.744,55.744 0 0,0 0,246 A 55.744,55.744 0 0,0 -46,200 A 55.744,55.744 0 0,0 0,154 Z'/><path d='M 200,154 A 55.744,55.744 0 0,0 246,200 A 55.744,55.744 0 0,0 200,246 A 55.744,55.744 0 0,0 154,200 A 55.744,55.744 0 0,0 200,154 Z'/><path d='M 100,-7 L 107,0 L 100,7 L 93,0 Z'/><path d='M 100,193 L 107,200 L 100,207 L 93,200 Z'/><path d='M -7,100 L 0,107 L 7,100 L 0,93 Z'/><path d='M 193,100 L 200,107 L 207,100 L 200,93 Z'/><path d='M 50,43 L 57,50 L 50,57 L 43,50 Z'/><path d='M 150,43 L 157,50 L 150,57 L 143,50 Z'/><path d='M 50,143 L 57,150 L 50,157 L 43,150 Z'/><path d='M 150,143 L 157,150 L 150,157 L 143,150 Z'/></g></svg>")`,
            backgroundSize: "80px 80px",
          }}
        />
        <div className="relative z-10 text-center px-8">
          <img src={LOGO_URL} alt="Go Umrah" className="h-20 mx-auto mb-8 drop-shadow-2xl" />
          <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            انضم إلى عائلة جو عمرة
          </h2>
          <div className="space-y-3 text-right">
            {BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 text-white/80">
                <CheckCircle2 className="w-5 h-5 text-[#C9A96E] flex-shrink-0" />
                <span className="text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>{benefit}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-px w-16 bg-[#C9A96E]/50" />
            <span className="text-[#C9A96E] text-xl">✦</span>
            <div className="h-px w-16 bg-[#C9A96E]/50" />
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5EFE6] px-6 py-10 overflow-y-auto">
        <div className="lg:hidden mb-6">
          <img src={LOGO_URL} alt="Go Umrah" className="h-14 mx-auto" />
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[#C9A96E]/20">
            <div className="text-center mb-5">
              <h1 className="text-2xl font-bold text-[#1B5E52] mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                إنشاء حساب جديد
              </h1>
              <p className="text-gray-500 text-sm">أدخل بياناتك لإنشاء حسابك</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">اكتمال البيانات</span>
                <span className="text-xs font-bold" style={{ color: progressColor }}>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%`, background: progressColor }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                {progressFields.map((filled, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${filled ? "scale-110" : "opacity-40"}`}
                    style={{ background: filled ? progressColor : "#d1d5db" }}
                  />
                ))}
              </div>
            </div>

            {/* Google Sign-Up */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 gap-3 mb-4 font-medium text-gray-700"
              onClick={handleGoogleLogin}
              disabled={googleLoginMutation.isPending}
            >
              {googleLoginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              إنشاء حساب بـ Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">أو بالبريد الإلكتروني</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-[#1B5E52] font-medium text-sm">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="محمد عبدالله"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pr-10 border-gray-200 focus:border-[#1B5E52] rounded-xl h-12"
                    required
                  />
                  {name.trim().length >= 2 && (
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#1B5E52] font-medium text-sm">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    dir="ltr"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10 border-gray-200 focus:border-[#1B5E52] rounded-xl h-12"
                    required
                  />
                  {email.includes("@") && email.includes(".") && (
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              {/* Country Dropdown */}
              <div className="space-y-1.5" id="country-dropdown-container">
                <Label className="text-[#1B5E52] font-medium text-sm">الدولة</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen(v => !v)}
                    className={`w-full h-12 px-3 flex items-center justify-between rounded-xl border text-sm transition-all ${
                      selectedCountry
                        ? "border-[#1B5E52] text-gray-800"
                        : "border-gray-200 text-gray-400"
                    } bg-white hover:border-[#1B5E52] focus:outline-none`}
                  >
                    <span className="flex items-center gap-2">
                      {selectedCountry ? (
                        <>
                          <span className="text-lg">{selectedCountry.flag}</span>
                          <span className="font-medium text-gray-800">{selectedCountry.nameAr}</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4" />
                          <span>اختر دولتك</span>
                        </>
                      )}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {countryDropdownOpen && (
                    <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <input
                          type="text"
                          placeholder="ابحث عن دولة..."
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#1B5E52]"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {filteredCountries.map(country => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country);
                              setCountryDropdownOpen(false);
                              setCountrySearch("");
                            }}
                            className={`w-full px-3 py-2.5 flex items-center gap-3 text-sm hover:bg-[#F5EFE6] transition-colors text-right ${
                              selectedCountry?.code === country.code ? "bg-[#1B5E52]/5 font-medium" : ""
                            }`}
                          >
                            <span className="text-lg shrink-0">{country.flag}</span>
                            <span className="flex-1 text-right">{country.nameAr}</span>
                            <span className="text-gray-400 text-xs shrink-0 font-mono" dir="ltr">{country.dialCode}</span>
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <p className="text-center text-gray-400 text-sm py-4">لا توجد نتائج</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone with auto dial code */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-[#1B5E52] font-medium text-sm">
                  رقم الجوال
                  {!selectedCountry && <span className="text-gray-400 text-xs mr-1">(اختر الدولة أولاً لظهور المفتاح)</span>}
                </Label>
                <div className="flex gap-2">
                  {/* Dial code badge */}
                  <div
                    className={`flex items-center gap-1.5 px-3 h-12 rounded-xl border text-sm font-mono shrink-0 transition-all ${
                      selectedCountry
                        ? "border-[#1B5E52] bg-[#1B5E52]/5 text-[#1B5E52] font-bold"
                        : "border-gray-200 bg-gray-50 text-gray-400"
                    }`}
                    style={{ minWidth: "80px", direction: "ltr" }}
                  >
                    {selectedCountry ? (
                      <>
                        <span className="text-base">{selectedCountry.flag}</span>
                        <span>{selectedCountry.dialCode}</span>
                      </>
                    ) : (
                      <span className="text-gray-300">+---</span>
                    )}
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      dir="ltr"
                      placeholder="5XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="pr-10 border-gray-200 focus:border-[#1B5E52] rounded-xl h-12"
                    />
                    {phone.trim().length >= 7 && (
                      <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[#1B5E52] font-medium text-sm">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    dir="ltr"
                    placeholder="8 أحرف على الأقل"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10 border-gray-200 focus:border-[#1B5E52] rounded-xl h-12"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i <= passwordStrength ? strengthColors[passwordStrength] : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      قوة كلمة المرور: <span className="font-medium">{strengthLabels[passwordStrength]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[#1B5E52] font-medium text-sm">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    dir="ltr"
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pr-10 pl-10 border-gray-200 focus:border-[#1B5E52] rounded-xl h-12 ${
                      confirmPassword && confirmPassword !== password ? "border-red-400" : ""
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500">كلمتا المرور غير متطابقتين</p>
                )}
                {confirmPassword && confirmPassword === password && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> كلمتا المرور متطابقتان
                  </p>
                )}
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center">
                بإنشاء حساب، أنت توافق على{" "}
                <span className="text-[#1B5E52] font-medium cursor-pointer">شروط الاستخدام</span>{" "}
                و{" "}
                <span className="text-[#1B5E52] font-medium cursor-pointer">سياسة الخصوصية</span>
              </p>

              {/* Submit */}
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full h-12 rounded-xl text-white font-bold text-base"
                style={{ background: "linear-gradient(135deg, #1B5E52, #2d7a6a)" }}
              >
                {registerMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "إنشاء الحساب"
                )}
              </Button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">لديك حساب؟</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <p className="text-center text-sm text-gray-600">
              <Link href="/login" className="text-[#1B5E52] font-bold hover:text-[#C9A96E] transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-[#1B5E52] transition-colors">
              ← العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
