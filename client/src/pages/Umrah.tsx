import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import PilgrimAIAssistant from "@/components/PilgrimAIAssistant";
import ProviderProgramsSection from "@/components/provider/ProviderProgramsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star, MapPin, Clock, Users, Hotel, CheckCircle,
  Search, ArrowRight, Moon, Sun, Heart, Globe, Home,
  Phone, Mail, MessageCircle, Train, Send,
} from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import { useCurrency } from "@/contexts/CurrencyContext";
import { toast } from "sonner";

const BRAND_TEAL = "#1B5E52";
const BRAND_GOLD = "#C9A96E";

// ─── Umrah Card ───────────────────────────────────────────────────────────────
function UmrahCard({ program, onBook }: { program: any; onBook: (p: any) => void }) {
  const features = Array.isArray(program.features) ? program.features : [];
  const amenities = Array.isArray(program.amenities) ? program.amenities : features;
  const inclusions = Array.isArray(program.inclusions) ? program.inclusions : [];
  const { format: formatPrice } = useCurrency();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative h-56 overflow-hidden flex-shrink-0">
        <img
          src={program.imageUrl || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80"}
          alt={program.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {program.isUrgent && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500 text-white shadow-lg animate-pulse">مقاعد محدودة</span>
          )}
          {program.isFeatured && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-lg" style={{ background: "#C9A96E" }}>
              <Star className="w-3 h-3 fill-white" />مميز
            </span>
          )}
          {program.badge && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-[var(--teal-800)] shadow">{program.badge}</span>
          )}
        </div>
        {/* Star rating top-left */}
        {program.hotelStarRating && (
          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-0.5">
            {Array.from({ length: program.hotelStarRating }).map((_: any, i: number) => (
              <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
        )}
        {/* Bottom overlay */}
        <div className="absolute bottom-0 right-0 left-0 p-4">
          <h3 className="font-bold text-white text-base leading-snug line-clamp-2 mb-1.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>{program.title}</h3>
          <div className="flex items-center gap-3 text-white/75 text-xs">
            {program.departureCity && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{program.departureCity}</span>
            )}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{program.duration} ليلة</span>
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {program.subtitle && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{program.subtitle}</p>
        )}
        {/* Hotel info */}
        {(program.hotelMakkah || program.hotelMadinah) && (
          <div className="flex flex-col gap-1 mb-3">
            {program.hotelMakkah && (
              <div className="flex items-center gap-1.5 text-xs bg-teal-50 text-teal-700 rounded-lg px-2.5 py-1.5">
                <Hotel className="w-3 h-3 flex-shrink-0" />
                <span className="font-medium">مكة:</span>
                <span className="truncate">{program.hotelMakkah}</span>
              </div>
            )}
            {program.hotelMadinah && (
              <div className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg px-2.5 py-1.5">
                <Hotel className="w-3 h-3 flex-shrink-0" />
                <span className="font-medium">المدينة:</span>
                <span className="truncate">{program.hotelMadinah}</span>
              </div>
            )}
          </div>
        )}
        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {amenities.slice(0, 4).map((a: string, i: number) => (
              <span key={i} className="flex items-center gap-1 text-[11px] bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-2.5 h-2.5 text-green-500" />{a}
              </span>
            ))}
            {amenities.length > 4 && (
              <span className="text-[11px] text-gray-400 flex items-center">+{amenities.length - 4} أخرى</span>
            )}
          </div>
        )}
        {/* Inclusions */}
        {inclusions.length > 0 && (
          <div className="mb-3 space-y-1">
            {inclusions.slice(0, 3).map((inc: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                {inc}
              </div>
            ))}
          </div>
        )}
        {/* Seats bar */}
        {program.seatsAvailable !== null && program.seatsAvailable !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" />المقاعد</span>
              <span className={`font-semibold ${program.seatsAvailable < 10 ? "text-red-500" : "text-green-600"}`}>
                {program.seatsAvailable} متبقي
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (program.seatsAvailable / 50) * 100)}%`, background: program.seatsAvailable < 10 ? "#ef4444" : "#1B5E52" }} />
            </div>
          </div>
        )}
        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div>
            {program.originalPriceUSD && (
              <div className="text-xs text-gray-400 line-through">
                {formatPrice(Number(program.originalPriceUSD))}
              </div>
            )}
            <div className="text-xl font-bold" style={{ color: "#1B5E52", fontFamily: "'Tajawal', sans-serif" }}>
              {formatPrice(Number(program.priceUSD))}
              <span className="text-xs font-normal text-gray-400"> /شخص</span>
            </div>
          </div>
          <Button
            onClick={() => onBook(program)}
            className="gap-1.5 font-semibold rounded-xl px-4"
            style={{ background: "#1B5E52", color: "#fff" }}
          >
            احجز الآن <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Demo programs ────────────────────────────────────────────────────────────
const DEMO_DOMESTIC = [
  {
    id: 1, title: "باقة عمرة الرياض - مكة المكرمة", subtitle: "برنامج 5 أيام بالحافلة الفاخرة من الرياض",
    priceUSD: "1688", duration: 5, isFeatured: true, portalType: "domestic",
    amenities: ["فندق 4 نجوم", "حافلة مكيفة", "مرشد ديني", "وجبات"],
    inclusions: ["الإقامة في مكة", "النقل ذهاباً وإياباً", "الإفطار يومياً"],
    hotelMakkah: "فندق دار التوحيد", hotelStarRating: 4,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-night_9e554532.jpg",
    departureCity: "الرياض", seatsTotal: 50, seatsAvailable: 18,
  },
  {
    id: 2, title: "باقة عمرة جدة - مكة والمدينة", subtitle: "برنامج 7 أيام يشمل مكة والمدينة المنورة",
    priceUSD: "2438", duration: 7, isFeatured: true, portalType: "domestic",
    amenities: ["فندق 5 نجوم", "سيارة خاصة", "مرشد خاص", "وجبات كاملة"],
    inclusions: ["الإقامة في مكة والمدينة", "النقل الداخلي", "الوجبات الثلاث"],
    hotelMakkah: "فيرمونت مكة", hotelMadinah: "أنوار المدينة", hotelStarRating: 5,
    imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80",
    departureCity: "جدة", seatsTotal: 30, seatsAvailable: 8,
  },
  {
    id: 3, title: "باقة عمرة الدمام - اقتصادية", subtitle: "برنامج اقتصادي 4 أيام من الدمام",
    priceUSD: "1050", duration: 4, badge: "اقتصادي", portalType: "domestic",
    amenities: ["فندق 3 نجوم", "حافلة مشتركة", "مرشد جماعي"],
    inclusions: ["الإقامة في مكة", "النقل بالحافلة", "الإفطار"],
    hotelMakkah: "فندق الصفوة", hotelStarRating: 3,
    imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80",
    departureCity: "الدمام", seatsTotal: 80, seatsAvailable: 45,
  },
];

const DEMO_INTERNATIONAL = [
  {
    id: 10, title: "Luxury Umrah Package", subtitle: "5-star hotels, private transport, and personalized guidance",
    priceUSD: "10500", originalPriceUSD: "12000", duration: 10, isUrgent: true, isFeatured: true,
    portalType: "international",
    amenities: ["5-Star Hotel", "Private Car", "Visa Included", "Expert Guide"],
    inclusions: ["Return flights", "Visa processing", "Private airport transfer", "Daily breakfast"],
    hotelMakkah: "Fairmont Makkah", hotelMadinah: "Oberoi Madinah", hotelStarRating: 5,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-night_9e554532.jpg",
    departureCity: "London", seatsTotal: 40, seatsAvailable: 7,
  },
  {
    id: 11, title: "Family Umrah Special", subtitle: "Designed for families with children — family rooms & kids meals",
    priceUSD: "6750", duration: 7, isFeatured: true, badge: "Family Deal", portalType: "international",
    amenities: ["Family Rooms", "Kids Meals", "Family Guide", "Safe Transport"],
    inclusions: ["Family accommodation", "Children's activities", "Family-friendly guide"],
    hotelMakkah: "Swissotel Makkah", hotelMadinah: "Dar Al Iman", hotelStarRating: 4,
    imageUrl: "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80",
    departureCity: "Manchester", seatsTotal: 50, seatsAvailable: 28,
  },
  {
    id: 12, title: "Economy Umrah Package", subtitle: "Affordable Umrah with quality 3-star accommodation",
    priceUSD: "3563", duration: 7, badge: "Best Value", portalType: "international",
    amenities: ["3-Star Hotel", "Shared Bus", "Group Guide", "Breakfast"],
    inclusions: ["Return flights", "Visa processing", "Group transport", "Breakfast daily"],
    hotelMakkah: "Al Safwah Royale", hotelMadinah: "Al Shohada Hotel", hotelStarRating: 3,
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-night_9e554532.jpg",
    departureCity: "Cairo", seatsTotal: 100, seatsAvailable: 65,
  },
];

// ─── Domestic Umrah Section ───────────────────────────────────────────────────
function DomesticUmrahSection({ onBook }: { onBook: (p: any) => void }) {
  const [departureCity, setDepartureCity] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: programs, isLoading } = trpc.umrah.list.useQuery({
    portal: "internal" as any,
    search: debouncedSearch || undefined,
    limit: 30,
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    setTimeout(() => setDebouncedSearch(val), 400);
  };

  const filtered = (programs || DEMO_DOMESTIC).filter((p: any) => {
    if (departureCity !== "all" && p.departureCity !== departureCity) return false;
    return true;
  });

  const cities = ["الرياض", "جدة", "الدمام", "القصيم", "أبها", "تبوك", "حائل", "الطائف"];

  return (
    <div>
      {/* Info Banner */}
      <div className="mb-6 p-4 rounded-xl border border-[#1B5E52]/20 bg-[#1B5E52]/5 flex items-start gap-3">
        <Home className="w-5 h-5 text-[#1B5E52] mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-[#1B5E52] text-sm mb-1">برامج عمرة المقيمين والمواطنين داخل المملكة</p>
          <p className="text-xs text-gray-600 leading-relaxed">
            باقات عمرة مصممة خصيصاً للمسافرين من داخل المملكة العربية السعودية، تشمل النقل من مدن الانطلاق المختلفة والإقامة في مكة المكرمة والمدينة المنورة.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="ابحث عن باقة عمرة..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={departureCity} onValueChange={setDepartureCity}>
          <SelectTrigger className="w-full sm:w-52 bg-white">
            <SelectValue placeholder="مدينة الانطلاق" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المدن</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Programs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="luxury-card overflow-hidden"><div className="h-52 shimmer" /><div className="p-5 space-y-3"><div className="h-5 shimmer rounded w-3/4" /></div></div>)}
        </div>
      ) : (
        <>
          {(!programs || programs.length === 0) && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 text-sm">📋 برامج توضيحية. أضف برامجك الحقيقية من لوحة التحكم.</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p: any) => (
              <UmrahCard key={p.id} program={p} onBook={onBook} />
            ))}
          </div>
        </>
      )}

      {/* Train Section */}
      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-[#1B5E52] to-[#2d7a6a] text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Train className="w-5 h-5" />
            <Badge className="bg-[#C9A96E]/20 text-[#C9A96E] border-[#C9A96E]/30 text-xs">جديد</Badge>
          </div>
          <h3 className="text-xl font-bold mb-1">قطار الحرمين السريع</h3>
          <p className="text-white/70 text-sm">احجز تذاكر قطار الحرمين بين مكة والمدينة وجدة بسهولة وسرعة</p>
        </div>
        <a href="/umrah/train">
          <Button className="bg-[#C9A96E] hover:bg-[#b8935a] text-white font-bold px-6">احجز القطار ←</Button>
        </a>
      </div>
    </div>
  );
}

// ─── International Umrah Section ──────────────────────────────────────────────
function InternationalUmrahSection({ onBook }: { onBook: (p: any) => void }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [category, setCategory] = useState("all");

  // Request booking form state
  const [reqOpen, setReqOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [reqForm, setReqForm] = useState({ customerName: "", customerPhone: "", customerEmail: "", customerWhatsapp: "", countryAr: "", pilgrims: "1", notes: "" });

  const { format: formatPrice } = useCurrency();
  const { data: programs, isLoading } = trpc.umrah.list.useQuery({
    portal: "external" as any,
    search: debouncedSearch || undefined,
    limit: 30,
  });

  const requestMutation = trpc.umrahBooking.create.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال طلبك بنجاح! سيتواصل معك فريقنا قريباً.");
      setReqOpen(false);
      setReqForm({ customerName: "", customerPhone: "", customerEmail: "", customerWhatsapp: "", countryAr: "", pilgrims: "1", notes: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    setTimeout(() => setDebouncedSearch(val), 400);
  };

  const displayPrograms = programs && programs.length > 0 ? programs : DEMO_INTERNATIONAL;
  const filtered = displayPrograms.filter((p: any) => {
    if (category !== "all" && p.category !== category) return false;
    return true;
  });

  const handleRequestBooking = (pkg: any) => {
    setSelectedPkg(pkg);
    setReqOpen(true);
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    requestMutation.mutate({
      packageId: selectedPkg?.id,
      packageTitle: selectedPkg?.title,
      portalType: "international",
      countryAr: reqForm.countryAr,
      pilgrims: Number(reqForm.pilgrims) || 1,
      customerName: reqForm.customerName,
      customerPhone: reqForm.customerPhone,
      customerEmail: reqForm.customerEmail,
      customerWhatsapp: reqForm.customerWhatsapp,
      notes: reqForm.notes,
    });
  };

  const countries = ["المملكة المتحدة", "فرنسا", "ألمانيا", "تركيا", "باكستان", "إندونيسيا", "ماليزيا", "مصر", "المغرب", "نيجيريا", "الولايات المتحدة", "كندا", "أستراليا"];

  return (
    <div>
      {/* Info Banner */}
      <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50 flex items-start gap-3">
        <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-blue-800 text-sm mb-1">برامج عمرة للمعتمرين القادمين من جميع دول العالم</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            باقات شاملة تتضمن الاستقبال في المطار، الإقامة في مكة والمدينة، المواصلات الداخلية، والجولات الدينية. يمكن إضافة خدمة التأشيرة عبر شركائنا المعتمدين.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="ابحث عن باقة عمرة دولية..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full sm:w-52 bg-white">
            <SelectValue placeholder="الدولة / القارة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الدول</SelectItem>
            {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44 bg-white">
            <SelectValue placeholder="الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            <SelectItem value="economy">اقتصادي</SelectItem>
            <SelectItem value="standard">عادي</SelectItem>
            <SelectItem value="premium">مميز</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Programs Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="luxury-card overflow-hidden"><div className="h-52 shimmer" /><div className="p-5 space-y-3"><div className="h-5 shimmer rounded w-3/4" /></div></div>)}
        </div>
      ) : (
        <>
          {(!programs || programs.length === 0) && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 text-sm">📋 برامج توضيحية. أضف برامجك الدولية من لوحة التحكم.</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p: any) => (
              <div key={p.id} className="luxury-card group overflow-hidden flex flex-col">
                <div className="relative h-52 overflow-hidden">
                  <img src={p.imageUrl || "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600&q=80"} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {p.isUrgent && <span className="badge-urgent">مقاعد محدودة</span>}
                    {p.isFeatured && <span className="badge-featured">مميز</span>}
                  </div>
                  {p.departureCity && (
                    <div className="absolute bottom-3 left-3 text-white/80 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{p.departureCity}
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-[var(--teal-800)] text-base leading-tight mb-1">{p.title}</h3>
                  {p.subtitle && <p className="text-xs text-[var(--muted-foreground)] mb-3 line-clamp-2">{p.subtitle}</p>}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(Array.isArray(p.amenities) ? p.amenities : []).slice(0, 4).map((a: string, i: number) => (
                      <span key={i} className="amenity-chip text-[10px]">{a}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] mt-auto">
                    <div>
                      <div className="text-xl font-bold text-[var(--teal-700)]">
                        {formatPrice(Number(p.priceUSD))}
                        <span className="text-xs font-normal text-[var(--muted-foreground)]"> /شخص</span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {p.duration} ليلة
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => onBook(p)} variant="outline" size="sm" className="border-[var(--primary)] text-[var(--primary)] text-xs">
                        احجز مباشرة
                      </Button>
                      <Button onClick={() => handleRequestBooking(p)} size="sm" className="bg-[var(--primary)] text-white text-xs">
                        طلب عرض سعر
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Request Booking Modal */}
      {reqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#1B5E52] mb-1">طلب حجز عمرة</h2>
            {selectedPkg && <p className="text-sm text-gray-500 mb-4">{selectedPkg.title}</p>}
            <form onSubmit={handleSubmitRequest} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">الاسم الكامل *</label>
                <Input value={reqForm.customerName} onChange={e => setReqForm({ ...reqForm, customerName: e.target.value })} required placeholder="الاسم الكامل" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">الدولة</label>
                <Select value={reqForm.countryAr} onValueChange={v => setReqForm({ ...reqForm, countryAr: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر دولتك" /></SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">عدد المعتمرين</label>
                <Input type="number" min="1" value={reqForm.pilgrims} onChange={e => setReqForm({ ...reqForm, pilgrims: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">رقم الجوال / واتساب</label>
                <Input value={reqForm.customerWhatsapp} onChange={e => setReqForm({ ...reqForm, customerWhatsapp: e.target.value })} placeholder="+966..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">البريد الإلكتروني</label>
                <Input type="email" value={reqForm.customerEmail} onChange={e => setReqForm({ ...reqForm, customerEmail: e.target.value })} placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">ملاحظات إضافية</label>
                <textarea className="w-full border border-gray-200 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1B5E52]/30" rows={3} value={reqForm.notes} onChange={e => setReqForm({ ...reqForm, notes: e.target.value })} placeholder="أي متطلبات خاصة..." />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setReqOpen(false)}>إلغاء</Button>
                <Button type="submit" className="flex-1 bg-[#1B5E52] text-white" disabled={requestMutation.isPending}>
                  {requestMutation.isPending ? "جاري الإرسال..." : <><Send className="w-4 h-4 mr-1" />إرسال الطلب</>}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Umrah Page ──────────────────────────────────────────────────────────
export default function UmrahPage() {
  useSEO(SEO_CONFIGS.umrah);
  const [mainTab, setMainTab] = useState<"domestic" | "international">("domestic");
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const handleBook = (program: any) => {
    setSelectedProgram(program);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-hero_cc30eaae.jpg"
          alt="برامج العمرة"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--teal-900)]/80 to-[var(--teal-900)]/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16">
          <Badge className="mb-4 bg-[var(--gold)]/20 text-[var(--gold-light)] border-[var(--gold)]/30 text-xs tracking-widest uppercase px-4 py-1.5">
            برامج العمرة — طوال العام
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            برامج العمرة
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl">
            ابدأ رحلتك المباركة مع باقاتنا المتنوعة لكل الميزانيات والتفضيلات
          </p>
        </div>
      </div>

      <div className="container py-10">
        {/* Main Tabs: Domestic / International */}
        <div className="flex gap-2 mb-8 border-b border-[var(--border)] pb-0">
          {[
            { key: "domestic", label: "معتمرو الداخل", icon: <Home className="w-4 h-4" />, desc: "من داخل المملكة" },
            { key: "international", label: "معتمرو الخارج", icon: <Globe className="w-4 h-4" />, desc: "من جميع دول العالم" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setMainTab(t.key as any)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                mainTab === t.key
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-gray-500 hover:text-[var(--primary)]"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              <span className="hidden sm:inline text-xs font-normal opacity-70">— {t.desc}</span>
            </button>
          ))}
        </div>

        {mainTab === "domestic" && <DomesticUmrahSection onBook={handleBook} />}
        {mainTab === "international" && <InternationalUmrahSection onBook={handleBook} />}
      </div>

      {/* Seasonal Highlights */}
      <section className="py-16 bg-white border-t border-[var(--border)]">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[var(--teal-800)]">باقات المواسم الخاصة</h2>
            <div className="gold-divider mx-auto mt-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Moon, title: "عمرة رمضان", desc: "اختبر أعلى درجات الروحانية في شهر رمضان المبارك في المدينتين المقدستين", color: "bg-purple-50", iconColor: "text-purple-600", iconBg: "bg-purple-100" },
              { icon: Star, title: "ليلة القدر", desc: "كن حاضراً في ليلة القدر — أبرك ليلة في العام", color: "bg-amber-50", iconColor: "text-amber-600", iconBg: "bg-amber-100" },
              { icon: Sun, title: "عمرة الصيف", desc: "باقات صيفية مريحة بمواصلات مكيفة وفنادق فاخرة", color: "bg-orange-50", iconColor: "text-orange-600", iconBg: "bg-orange-100" },
            ].map((s) => (
              <div key={s.title} className={`luxury-card p-6 ${s.color} border-0`}>
                <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>
                  <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                </div>
                <h3 className="font-bold text-[var(--teal-800)] mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedProgram && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          service={selectedProgram}
          serviceType="umrah"
        />
      )}
      {/* Provider Programs Section */}
      <ProviderProgramsSection
        programType="umrah"
        titleAr="برامج العمرة من مزودي الخدمات المعتمدين"
        title="Umrah Programs from Certified Providers"
        maxItems={6}
      />
      {/* AI Assistant */}
      <PilgrimAIAssistant context="umrah" />
    </div>
  );
}
