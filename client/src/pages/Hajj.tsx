import { usdToSar } from "@shared/const";
import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import PilgrimAIAssistant from "@/components/PilgrimAIAssistant";
import ProviderProgramsSection from "@/components/provider/ProviderProgramsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Star, MapPin, Phone, Mail, Globe, ExternalLink, Search,
  Bell, Newspaper, AlertTriangle, BookOpen, Users, Award,
  Shield, Filter, Send, CheckCircle, Building2, Clock,
  Plane, Home, Info, FileText, X, Loader2, ChevronRight,
  MessageCircle, Eye
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const BRAND_TEAL = "#1a5c5c";
const BRAND_GOLD = "#c9a84c";

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({ value, onChange, readonly = false, size = "md" }: {
  value: number; onChange?: (v: number) => void; readonly?: boolean; size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`${sz} transition-colors ${readonly ? "" : "cursor-pointer hover:scale-110"} ${s <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          onClick={() => !readonly && onChange?.(s)} />
      ))}
    </div>
  );
}

// ─── DOMESTIC: Hajj Package Card ────────────────────────────────────────────
function NusukPackageCard({ pkg, onBook }: { pkg: any; onBook?: (pkg: any) => void }) {
  const { convert, symbol } = useCurrency();
  const features = Array.isArray(pkg.features) ? pkg.features : [];
  const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions : [];
  const priceSAR = parseFloat(pkg.priceSAR || pkg.priceFromSAR || "0");
  const priceToSAR = parseFloat(pkg.priceToSAR || "0");
  const seatsTotal = pkg.seatsTotal || 50;
  const seatsAvailable = pkg.seatsAvailable ?? 0;
  const seatsPct = Math.min(100, (seatsAvailable / seatsTotal) * 100);
  const isUnavailable = !pkg.isActive;
  return (
    <div className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border flex flex-col ${isUnavailable ? 'border-red-200 opacity-75' : 'border-gray-100 hover:-translate-y-1'}`}>
      {/* Image */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        {pkg.imageUrl ? (
          <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${BRAND_TEAL} 0%, #0d3d3d 100%)` }}>
            <Home className="w-20 h-20 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {isUnavailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <div className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
              <AlertTriangle className="w-4 h-4" />
              غير متاحة حالياً
            </div>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {pkg.badge && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-lg" style={{ background: BRAND_GOLD }}>
              <Award className="w-3 h-3" />{pkg.badge}
            </span>
          )}
          {pkg.isUrgent && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500 text-white shadow-lg animate-pulse">مقاعد محدودة!</span>
          )}
          {pkg.packageNumber && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 text-white/80">{pkg.packageNumber}</span>
          )}
        </div>
        {/* Bottom info overlay */}
        <div className="absolute bottom-0 right-0 left-0 p-4">
          <h3 className="font-bold text-white text-lg leading-snug line-clamp-2 mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>{pkg.title}</h3>
          {pkg.subtitle && <p className="text-white/70 text-xs line-clamp-1 mb-1">{pkg.subtitle}</p>}
          <div className="flex items-center gap-3 text-white/75 text-xs">
            {pkg.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pkg.duration} يوم</span>}
            {pkg.departureCity && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{pkg.departureCity}</span>}
          </div>
        </div>
      </div>
      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Sleeping info - عرفة / مزدلفة / منى */}
        <div className="space-y-1.5 mb-3">
          {pkg.arafatSleeping && (
            <div className="flex items-start gap-2 text-xs">
              <span className="font-semibold text-teal-700 whitespace-nowrap">سكن عرفة:</span>
              <span className="text-gray-600 line-clamp-1">{pkg.arafatSleeping}</span>
            </div>
          )}
          {pkg.minyaSleeping && (
            <div className="flex items-start gap-2 text-xs">
              <span className="font-semibold text-teal-700 whitespace-nowrap">سكن منى:</span>
              <span className="text-gray-600 line-clamp-1">{pkg.minyaSleeping}</span>
            </div>
          )}
          {pkg.muzdalifaSleeping && (
            <div className="flex items-start gap-2 text-xs">
              <span className="font-semibold text-teal-700 whitespace-nowrap">سكن مزدلفة:</span>
              <span className="text-gray-600 line-clamp-1">{pkg.muzdalifaSleeping}</span>
            </div>
          )}
        </div>
        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {features.slice(0, 4).map((f: string, i: number) => (
              <span key={i} className="flex items-center gap-1 text-[11px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">
                <CheckCircle className="w-2.5 h-2.5" />{f}
              </span>
            ))}
            {features.length > 4 && <span className="text-[11px] text-gray-400">+{features.length - 4}</span>}
          </div>
        )}

        {/* Price */}
        <div className="pt-3 border-t border-gray-100 mt-auto">
          <p className="text-[11px] text-gray-400 mb-0.5">السعر يبدأ من</p>
          <p className="text-xl font-bold" style={{ color: BRAND_TEAL, fontFamily: "'Tajawal', sans-serif" }}>
            {symbol}{convert(priceSAR).toLocaleString()}
          </p>
          {priceToSAR > priceSAR && (
            <p className="text-[10px] text-gray-400">حتى {symbol}{convert(priceToSAR).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DOMESTIC: Company Card ───────────────────────────────────────────────────
function CompanyCard({ company, onSelect }: { company: any; onSelect: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group" onClick={onSelect}>
      <div className="h-32 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${BRAND_TEAL}, #0d3d3d)` }}>
        {company.coverImageUrl ? (
          <img src={company.coverImageUrl} alt={company.nameAr} className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Building2 className="w-12 h-12 text-white/20" /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {company.isVerified && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" />موثّق
          </div>
        )}
        {company.isFeatured && (
          <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full text-white" style={{ background: BRAND_GOLD }}>مميز</div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3 -mt-8 relative z-10 mb-3">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow bg-white flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-xl border-2 border-white shadow flex items-center justify-center flex-shrink-0" style={{ background: BRAND_TEAL }}>
              <Building2 className="w-7 h-7 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-6">
            <h3 className="font-bold text-gray-900 text-sm truncate">{company.nameAr}</h3>
            {company.city && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{company.city}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <StarRating value={Math.round(Number(company.averageRating) || 0)} readonly size="sm" />
          <span className="text-sm font-bold text-gray-700">{Number(company.averageRating || 0).toFixed(1)}</span>
          <span className="text-xs text-gray-400">({company.totalReviews || 0})</span>
        </div>
        <div className="flex gap-3 text-xs text-gray-500 mb-3">
          {company.yearsExperience > 0 && <span className="flex items-center gap-1"><Award className="w-3 h-3" />{company.yearsExperience} سنة</span>}
          {company.totalPilgrims > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />+{company.totalPilgrims.toLocaleString()}</span>}
        </div>
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {company.phone && (
            <a href={`tel:${company.phone}`} onClick={e => e.stopPropagation()} className="flex-1">
              <Button size="sm" variant="outline" className="w-full text-xs gap-1 h-8"><Phone className="w-3 h-3" />اتصال</Button>
            </a>
          )}
          {company.whatsapp && (
            <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex-1">
              <Button size="sm" className="w-full text-xs gap-1 h-8 bg-green-600 hover:bg-green-700 text-white"><MessageCircle className="w-3 h-3" />واتساب</Button>
            </a>
          )}
          <Button size="sm" variant="outline" className="text-xs gap-1 h-8 px-3" onClick={onSelect}>
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── DOMESTIC: Company Detail Modal ──────────────────────────────────────────
function CompanyDetailModal({ company, onClose }: { company: any; onClose: () => void }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    reviewerName: "", reviewerEmail: "", bookingReference: "",
    rating: 0, ratingService: 0, ratingAccommodation: 0, ratingTransport: 0, ratingFood: 0,
    reviewText: "", hajjYear: new Date().getFullYear(),
  });
  const { data: reviewsData } = trpc.hajjDomestic.getReviews.useQuery({ companyId: company.companyId, limit: 20 });
  const submitReview = trpc.hajjDomestic.submitReview.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      setShowReviewForm(false);
      setReviewData({ reviewerName: "", reviewerEmail: "", bookingReference: "", rating: 0, ratingService: 0, ratingAccommodation: 0, ratingTransport: 0, ratingFood: 0, reviewText: "", hajjYear: new Date().getFullYear() });
    },
    onError: () => toast.error("حدث خطأ في إرسال التقييم"),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-base">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: BRAND_TEAL }}>
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span>{company.nameAr}</span>
                {company.isVerified && <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 font-normal"><Shield className="w-3 h-3 ml-1" />موثّق</Badge>}
              </div>
              {company.city && <p className="text-xs text-gray-500 font-normal mt-0.5">{company.city}</p>}
            </div>
          </DialogTitle>
        </DialogHeader>

        {company.coverImageUrl && <img src={company.coverImageUrl} alt="" className="w-full h-40 object-cover rounded-xl" />}

        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl text-center">
          <div>
            <StarRating value={Math.round(Number(company.averageRating) || 0)} readonly size="sm" />
            <p className="text-lg font-bold text-gray-800 mt-1">{Number(company.averageRating || 0).toFixed(1)}</p>
            <p className="text-xs text-gray-500">{company.totalReviews || 0} تقييم</p>
          </div>
          {company.yearsExperience > 0 && (
            <div>
              <Award className="w-6 h-6 mx-auto mb-1 text-amber-500" />
              <p className="text-lg font-bold text-gray-800">{company.yearsExperience}</p>
              <p className="text-xs text-gray-500">سنة خبرة</p>
            </div>
          )}
          {company.totalPilgrims > 0 && (
            <div>
              <Users className="w-6 h-6 mx-auto mb-1" style={{ color: BRAND_TEAL }} />
              <p className="text-lg font-bold text-gray-800">+{company.totalPilgrims.toLocaleString()}</p>
              <p className="text-xs text-gray-500">حاج</p>
            </div>
          )}
        </div>

        {company.description && <p className="text-sm text-gray-600 leading-relaxed">{company.description}</p>}

        <div className="flex flex-wrap gap-2">
          {company.phone && <a href={`tel:${company.phone}`}><Button size="sm" variant="outline" className="gap-1 text-xs"><Phone className="w-3 h-3" />{company.phone}</Button></a>}
          {company.whatsapp && <a href={`https://wa.me/${company.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"><Button size="sm" className="gap-1 text-xs bg-green-600 hover:bg-green-700 text-white"><MessageCircle className="w-3 h-3" />واتساب</Button></a>}
          {company.email && <a href={`mailto:${company.email}`}><Button size="sm" variant="outline" className="gap-1 text-xs"><Mail className="w-3 h-3" />{company.email}</Button></a>}
          {company.nusukProfileUrl && <a href={company.nusukProfileUrl} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="gap-1 text-xs"><Globe className="w-3 h-3" />ملف نسك</Button></a>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-800 text-sm">تقييمات الحجاج ({reviewsData?.total ?? 0})</h4>
            <Button size="sm" onClick={() => setShowReviewForm(!showReviewForm)} className="text-xs gap-1" style={{ background: BRAND_TEAL, color: "#fff" }}>
              <Star className="w-3 h-3" />أضف تقييمك
            </Button>
          </div>

          {showReviewForm && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4 space-y-3 border border-blue-100">
              <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-100 rounded-lg p-2">
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>تقييمات الحجاج المتحقق منهم (برقم الحجز) تُنشر فوراً. التقييمات الأخرى تخضع للمراجعة لضمان الأمانة.</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="اسمك الكريم *" value={reviewData.reviewerName} onChange={e => setReviewData(p => ({ ...p, reviewerName: e.target.value }))} />
                <Input placeholder="البريد الإلكتروني" value={reviewData.reviewerEmail} onChange={e => setReviewData(p => ({ ...p, reviewerEmail: e.target.value }))} />
              </div>
              <Input placeholder="رقم الحجز (للتحقق من أنك حاج فعلي)" value={reviewData.bookingReference} onChange={e => setReviewData(p => ({ ...p, bookingReference: e.target.value }))} />
              <div>
                <label className="text-xs text-gray-600 mb-1 block font-medium">التقييم العام *</label>
                <StarRating value={reviewData.rating} onChange={v => setReviewData(p => ({ ...p, rating: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {([["ratingService", "الخدمة"], ["ratingAccommodation", "الإقامة"], ["ratingTransport", "النقل"], ["ratingFood", "الطعام"]] as [string, string][]).map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <StarRating value={(reviewData as any)[key]} onChange={v => setReviewData(p => ({ ...p, [key]: v }))} size="sm" />
                  </div>
                ))}
              </div>
              <Textarea placeholder="شاركنا تجربتك مع هذه الشركة..." value={reviewData.reviewText} onChange={e => setReviewData(p => ({ ...p, reviewText: e.target.value }))} rows={3} />
              <div className="flex gap-2">
                <Button className="flex-1 gap-1" style={{ background: BRAND_TEAL, color: "#fff" }}
                  disabled={!reviewData.reviewerName || reviewData.rating < 1 || submitReview.isPending}
                  onClick={() => submitReview.mutate({ companyId: company.companyId, ...reviewData })}>
                  {submitReview.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />جاري الإرسال...</> : <><Send className="w-4 h-4" />إرسال التقييم</>}
                </Button>
                <Button variant="outline" onClick={() => setShowReviewForm(false)}>إلغاء</Button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {reviewsData?.reviews.map((r: any) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">{r.reviewerName}</span>
                      {r.isVerifiedPilgrim && <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 font-normal"><CheckCircle className="w-3 h-3 ml-1" />موثّق</Badge>}
                    </div>
                    <StarRating value={r.rating} readonly size="sm" />
                  </div>
                  {r.hajjYear && <span className="text-xs text-gray-400">حج {r.hajjYear}</span>}
                </div>
                {r.reviewText && <p className="text-sm text-gray-600 leading-relaxed">{r.reviewText}</p>}
              </div>
            ))}
            {!reviewsData?.reviews.length && (
              <div className="text-center py-8 text-gray-400">
                <Star className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                <p className="text-sm">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── DOMESTIC: News Card ──────────────────────────────────────────────────────
function NotifCard({ item }: { item: any }) {
  const catColors: Record<string, string> = {
    alert: "bg-red-100 text-red-700 border-red-200",
    announcement: "bg-blue-100 text-blue-700 border-blue-200",
    news: "bg-teal-100 text-teal-700 border-teal-200",
    article: "bg-purple-100 text-purple-700 border-purple-200",
    update: "bg-amber-100 text-amber-700 border-amber-200",
  };
  const catLabels: Record<string, string> = { alert: "تنبيه", announcement: "إعلان", news: "خبر", article: "مقال", update: "تحديث" };
  return (
    <div className={`bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow ${item.isPinned ? "border-amber-300" : "border-gray-100"}`}>
      {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-36 object-cover rounded-xl mb-3" />}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {item.isUrgent && <span className="flex items-center gap-1 text-xs text-red-600 font-medium"><AlertTriangle className="w-3 h-3" />عاجل</span>}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${catColors[item.category] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
          {catLabels[item.category] || item.category}
        </span>
        {item.isPinned && <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">مثبّت</span>}
        <span className="text-xs text-gray-400 mr-auto">{new Date(item.createdAt).toLocaleDateString("ar-SA")}</span>
      </div>
      <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2">{item.titleAr}</h3>
      <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed">{item.contentAr}</p>
      {item.sourceUrl && (
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs mt-2 hover:underline" style={{ color: BRAND_TEAL }}>
          <ExternalLink className="w-3 h-3" />اقرأ المزيد
        </a>
      )}
    </div>
  );
}

// ─── DOMESTIC: Subscribe Form ─────────────────────────────────────────────────
function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [type, setType] = useState<"email" | "whatsapp" | "both">("email");
  const subscribe = trpc.hajjDomestic.subscribe.useMutation({
    onSuccess: () => { toast.success("تم الاشتراك بنجاح! ستصلك آخر أخبار الحج."); setEmail(""); setWhatsapp(""); },
    onError: () => toast.error("حدث خطأ في الاشتراك"),
  });
  return (
    <div className="rounded-2xl p-6" style={{ background: `linear-gradient(135deg, ${BRAND_TEAL}12, ${BRAND_GOLD}08)`, border: `1px solid ${BRAND_TEAL}20` }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BRAND_TEAL }}>
          <Bell className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">اشترك في أخبار الحج</h3>
          <p className="text-xs text-gray-500">احصل على آخر الأخبار والإشعارات المتعلقة بحجاج الداخل</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select value={type} onValueChange={(v) => setType(v as "email" | "whatsapp" | "both")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="email">بريد إلكتروني</SelectItem>
            <SelectItem value="whatsapp">واتساب</SelectItem>
            <SelectItem value="both">كلاهما</SelectItem>
          </SelectContent>
        </Select>
        {(type === "email" || type === "both") && (
          <Input placeholder="البريد الإلكتروني" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        )}
        {(type === "whatsapp" || type === "both") && (
          <Input placeholder="رقم الواتساب (مع رمز الدولة)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
        )}
        <Button className="gap-1" style={{ background: BRAND_TEAL, color: "#fff" }}
          disabled={subscribe.isPending || (!email && !whatsapp)}
          onClick={() => subscribe.mutate({ email: email || undefined, whatsapp: whatsapp || undefined, subscriptionType: type })}>
          {subscribe.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Bell className="w-4 h-4" />اشترك</>}
        </Button>
      </div>
    </div>
  );
}

// ─── INTERNATIONAL: Package Card ──────────────────────────────────────────────
function IntlPackageCard({ pkg, onBook }: { pkg: any; onBook: (p: any) => void }) {
  const { convert, symbol } = useCurrency();
  const priceSAR = Number(pkg.priceSAR || 0);
  const priceUSD = Number(pkg.priceUSD || 0);
  const displayPrice = priceSAR > 0 ? convert(priceSAR) : convert(usdToSar(priceUSD));
  const categoryLabel = pkg.category === "vip" ? "VIP" : pkg.category === "economy" ? "اقتصادي" : "قياسي";
  const categoryColor = pkg.category === "vip" ? "bg-amber-500" : pkg.category === "economy" ? "bg-blue-500" : "bg-gray-500";
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        {pkg.imageUrl ? (
          <img src={pkg.imageUrl} alt={pkg.titleAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
            <Plane className="w-20 h-20 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        {/* Top badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {pkg.isFeatured && (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-lg" style={{ background: BRAND_GOLD }}>
              <Award className="w-3 h-3" />مميز
            </span>
          )}
          {pkg.category && (
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-lg ${categoryColor}`}>{categoryLabel}</span>
          )}
        </div>
        {/* Country flag area */}
        <div className="absolute top-3 left-3">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
            <Globe className="w-3 h-3 text-white/70" />
            <span className="text-white text-[11px] font-medium">{pkg.countryAr}</span>
          </div>
        </div>
        {/* Bottom overlay */}
        <div className="absolute bottom-0 right-0 left-0 p-4">
          {(pkg.companyNameAr || pkg.companyName) && (
            <div className="flex items-center gap-1.5 mb-1.5">
              {pkg.companyLogoUrl && <img src={pkg.companyLogoUrl} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />}
              <span className="text-white/70 text-[11px] truncate">{pkg.companyNameAr || pkg.companyName}</span>
            </div>
          )}
          <h3 className="font-bold text-white text-base leading-snug line-clamp-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>{pkg.titleAr}</h3>
        </div>
      </div>
      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {pkg.duration && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg"><Clock className="w-3 h-3" />{pkg.duration} يوم</span>}
          {pkg.seatsAvailable > 0 && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg ${pkg.seatsAvailable < 10 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
              <Users className="w-3 h-3" />{pkg.seatsAvailable} مقعد
            </span>
          )}
          {pkg.hotelStarRating && (
            <span className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg">
              {Array.from({ length: pkg.hotelStarRating }).map((_: any, i: number) => (
                <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              ))}
            </span>
          )}
        </div>
        {/* Hotel info */}
        {(pkg.hotelMakkah || pkg.hotelMadinah) && (
          <div className="flex flex-col gap-1 mb-3">
            {pkg.hotelMakkah && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <MapPin className="w-3 h-3 text-teal-600 flex-shrink-0" />
                <span className="text-[11px] font-medium text-teal-700">مكة:</span>
                <span className="truncate">{pkg.hotelMakkah}</span>
              </div>
            )}
            {pkg.hotelMadinah && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <span className="text-[11px] font-medium text-blue-700">المدينة:</span>
                <span className="truncate">{pkg.hotelMadinah}</span>
              </div>
            )}
          </div>
        )}
        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">السعر يبدأ من</p>
            <p className="text-xl font-bold" style={{ color: BRAND_TEAL, fontFamily: "'Tajawal', sans-serif" }}>
              {symbol}{displayPrice.toLocaleString()}
            </p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs font-semibold rounded-xl px-4" style={{ background: BRAND_TEAL, color: "#fff" }} onClick={() => onBook(pkg)}>
            <FileText className="w-3.5 h-3.5" />طلب حجز
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── INTERNATIONAL: Booking Request Form ─────────────────────────────────────
function IntlBookingRequestForm({ pkg, onClose }: { pkg: any; onClose: () => void }) {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", whatsapp: "", country: "", pilgrims: 1, notes: "" });
  const createRequest = trpc.hajjBooking.create.useMutation({
    onSuccess: (res) => { toast.success(`تم إرسال طلبك بنجاح! رقم الطلب: ${res.requestId}`); onClose(); },
    onError: () => toast.error("حدث خطأ في إرسال الطلب"),
  });
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 flex-shrink-0" style={{ color: BRAND_TEAL }} />
            <span className="line-clamp-1">طلب حجز — {pkg.titleAr}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: BRAND_TEAL }} />
          <span>{pkg.countryAr}{pkg.cityAr ? ` — ${pkg.cityAr}` : ""} · {pkg.companyNameAr || pkg.companyName}</span>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">الاسم الكامل *</label>
              <Input placeholder="الاسم الكامل" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">رقم الجوال *</label>
              <Input placeholder="+966..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">البريد الإلكتروني</label>
              <Input placeholder="example@email.com" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">رقم الواتساب</label>
              <Input placeholder="+966..." value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">الدولة / الجنسية *</label>
              <Input placeholder="مثال: مصر، باكستان..." value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">عدد الحجاج</label>
              <Input type="number" min={1} max={50} value={form.pilgrims} onChange={e => setForm(p => ({ ...p, pilgrims: parseInt(e.target.value) || 1 }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block font-medium">ملاحظات إضافية</label>
            <Textarea placeholder="أي متطلبات خاصة أو استفسارات..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
          </div>
          <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg p-3">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>سيتواصل معك فريقنا خلال 24 ساعة لتأكيد الحجز وإتمام الإجراءات.</span>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 gap-1" style={{ background: BRAND_TEAL, color: "#fff" }}
              disabled={!form.fullName || !form.phone || !form.country || createRequest.isPending}
              onClick={() => createRequest.mutate({ packageId: pkg.packageId, packageTitle: pkg.titleAr, countryAr: form.country, pilgrims: form.pilgrims, customerName: form.fullName, customerPhone: form.phone, customerEmail: form.email || undefined, customerWhatsapp: form.whatsapp || undefined, notes: form.notes || undefined })}>
              {createRequest.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />جاري الإرسال...</> : <><Send className="w-4 h-4" />إرسال الطلب</>}
            </Button>
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── DOMESTIC: Booking Request Form ───────────────────────────────────────────────────────
function DomesticBookingRequestForm({ pkg, onClose }: { pkg: any; onClose: () => void }) {
  const { convert, symbol } = useCurrency();
  const priceSAR = parseFloat(pkg.priceSAR || pkg.priceFromSAR || "0");
  const [form, setForm] = useState({
    fullName: "", nationalId: "", phone: "", email: "", whatsapp: "",
    pilgrims: 1, notes: ""
  });
  const createRequest = trpc.hajjBooking.create.useMutation({
    onSuccess: (res) => { toast.success(`تم إرسال طلبك بنجاح! رقم الطلب: ${res.requestId}`); onClose(); },
    onError: () => toast.error("حدث خطأ في إرسال الطلب"),
  });
  const totalPrice = priceSAR * form.pilgrims;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="w-5 h-5 flex-shrink-0" style={{ color: BRAND_TEAL }} />
            <span className="line-clamp-1">طلب حجز — {pkg.title}</span>
          </DialogTitle>
        </DialogHeader>
        {/* Package Summary */}
        <div className="bg-teal-50 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-teal-800">{pkg.title}</span>
            <span className="text-sm font-bold" style={{ color: BRAND_TEAL }}>{symbol}{convert(priceSAR).toLocaleString()} / حاج</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-teal-700">
            {pkg.minyaSleeping && <span className="bg-white px-2 py-0.5 rounded-full">سكن منى: {pkg.minyaSleeping}</span>}
            {pkg.arafatSleeping && <span className="bg-white px-2 py-0.5 rounded-full">سكن عرفة: {pkg.arafatSleeping}</span>}
            {pkg.duration && <span className="bg-white px-2 py-0.5 rounded-full">{pkg.duration} يوم</span>}
          </div>
        </div>
        {/* Form */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">الاسم الكامل *</label>
              <Input placeholder="الاسم الرباعي" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">رقم الهوية / الإقامة *</label>
              <Input placeholder="10 أرقام" value={form.nationalId} onChange={e => setForm(p => ({ ...p, nationalId: e.target.value }))} maxLength={10} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">رقم الجوال *</label>
              <Input placeholder="+966..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">رقم الواتساب</label>
              <Input placeholder="+966..." value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">البريد الإلكتروني</label>
              <Input placeholder="example@email.com" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">عدد الحجاج</label>
              <Input type="number" min={1} max={50} value={form.pilgrims} onChange={e => setForm(p => ({ ...p, pilgrims: parseInt(e.target.value) || 1 }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block font-medium">ملاحظات إضافية</label>
            <Textarea placeholder="أي متطلبات خاصة أو استفسارات..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} />
          </div>
          {/* Price Summary */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">السعر للحاج الواحد</span>
              <span className="font-semibold">{symbol}{convert(priceSAR).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">عدد الحجاج</span>
              <span className="font-semibold">{form.pilgrims}</span>
            </div>
            <div className="border-t border-gray-200 my-2" />
            <div className="flex justify-between text-base font-bold">
              <span style={{ color: BRAND_TEAL }}>الإجمالي</span>
              <span style={{ color: BRAND_TEAL }}>{symbol}{convert(totalPrice).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg p-3">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>سيتواصل معك فريقنا خلال 24 ساعة لتأكيد الحجز وإتمام الدفع.</span>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 gap-1" style={{ background: BRAND_TEAL, color: "#fff" }}
              disabled={!form.fullName || !form.phone || !form.nationalId || createRequest.isPending}
              onClick={() => createRequest.mutate({
                packageId: String(pkg.id),
                packageTitle: pkg.title,
                countryAr: "السعودية",
                pilgrims: form.pilgrims,
                customerName: form.fullName,
                customerPhone: form.phone,
                customerEmail: form.email || undefined,
                customerWhatsapp: form.whatsapp || undefined,
                notes: form.notes ? `رقم الهوية: ${form.nationalId}\n${form.notes}` : `رقم الهوية: ${form.nationalId}`,
              })}>
              {createRequest.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />جاري الإرسال...</> : <><Send className="w-4 h-4" />إرسال طلب الحجز</>}
            </Button>
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Hajj Page ─────────────────────────────────────────────────────────────────────────
export default function HajjPage() { useSEO(SEO_CONFIGS.hajj);
  const [tab, setTab] = useState<"domestic" | "international">("domestic");
  const [domesticSubTab, setDomesticSubTab] = useState<"packages" | "companies" | "news">("packages");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [bookingRequestPkg, setBookingRequestPkg] = useState<any>(null);
  const [companySearch, setCompanySearch] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [newsCategory, setNewsCategory] = useState<"all" | "news" | "alert" | "announcement" | "article" | "update">("all");
  const [intlCountry, setIntlCountry] = useState("");
  const [intlCity, setIntlCity] = useState("");

  const { data: hajjPackages, isLoading: loadingPackages } = trpc.hajj.list.useQuery({ portal: "internal", limit: 12, includeInactive: true });
  const { data: companiesData, isLoading: loadingCompanies } = trpc.hajjDomestic.listCompanies.useQuery({ search: companySearch || undefined, city: companyCity || undefined, limit: 20 });
  const { data: notifsData, isLoading: loadingNotifs } = trpc.hajjDomestic.listNotifications.useQuery({ category: newsCategory, limit: 20 });
  const { data: intlData, isLoading: loadingIntl } = trpc.hajjInternational.list.useQuery({ countryAr: intlCountry || undefined, cityAr: intlCity || undefined, limit: 20 });
  const { data: countriesList } = trpc.hajjInternational.listCountries.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${BRAND_TEAL} 0%, #0d3d3d 100%)` }}>
        <div className="container mx-auto px-4 py-10 relative z-10">
          <span className="text-xs px-3 py-1 rounded-full text-white font-medium mb-3 inline-block" style={{ background: `${BRAND_GOLD}80` }}>برامج الحج</span>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 leading-tight">رحلتك إلى بيت الله</h1>
          <p className="text-white/80 text-base max-w-xl leading-relaxed">
            اكتشف برامج الحج لحجاج الداخل عبر منصة نسك، وباقات الحج الدولية من شركات معتمدة حول العالم.
          </p>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex">
            {([
              ["domestic", "حجاج الداخل", <Home key="h" className="w-4 h-4" />],
              ["international", "حجاج الخارج", <Plane key="p" className="w-4 h-4" />]
            ] as [string, string, React.ReactNode][]).map(([key, label, icon]) => (
              <button key={key} onClick={() => setTab(key as "domestic" | "international")}
                className={`flex-1 md:flex-none px-6 py-4 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${tab === key ? "border-teal-700 text-teal-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                style={tab === key ? { borderColor: BRAND_TEAL, color: BRAND_TEAL } : {}}>
                {icon}{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DOMESTIC ─────────────────────────────────────────────────────── */}
      {tab === "domestic" && (
        <div className="container mx-auto px-4 py-8">
          {/* Info Banner */}
          <div className="rounded-2xl p-5 mb-8 flex items-start gap-4" style={{ background: `linear-gradient(135deg, ${BRAND_TEAL}10, ${BRAND_GOLD}08)`, border: `1px solid ${BRAND_TEAL}20` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: BRAND_TEAL }}>
              <Home className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-1" style={{ color: BRAND_TEAL }}>بوابة حجاج الداخل</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                خصصت المملكة العربية السعودية حصصاً لحجاج الداخل يتم الإعلان عنها عبر منصة نسك. اطلع على الباقات المتاحة وشركات الحج المرخصة وآخر الأخبار والإشعارات.
              </p>
              <a href="https://www.nusuk.sa/hajj/local-hajj" target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-1 text-xs" style={{ background: BRAND_TEAL, color: "#fff" }}>
                  <ExternalLink className="w-3 h-3" />زيارة منصة نسك الرسمية
                </Button>
              </a>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit overflow-x-auto">
            {([
              ["packages", "الباقات", <BookOpen key="b" className="w-4 h-4" />],
              ["companies", "شركات الحج", <Building2 key="c" className="w-4 h-4" />],
              ["news", "الأخبار والإشعارات", <Newspaper key="n" className="w-4 h-4" />]
            ] as [string, string, React.ReactNode][]).map(([key, label, icon]) => (
              <button key={key} onClick={() => setDomesticSubTab(key as "packages" | "companies" | "news")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${domesticSubTab === key ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                style={domesticSubTab === key ? { color: BRAND_TEAL } : {}}>
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Packages */}
          {domesticSubTab === "packages" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: BRAND_TEAL }}>باقات حج الداخل</h2>
                <a href="https://www.nusuk.sa/hajj/local-hajj" target="_blank" rel="noopener noreferrer" className="text-sm flex items-center gap-1 hover:underline" style={{ color: BRAND_TEAL }}>
                  عرض الكل على نسك <ChevronRight className="w-4 h-4" />
                </a>
              </div>
              {loadingPackages ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
              ) : !hajjPackages?.length ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-500 mb-2">لا توجد باقات مضافة حالياً</h3>
                  <p className="text-gray-400 text-sm mb-4">يمكنك الاطلاع على الباقات الرسمية مباشرة على منصة نسك</p>
                  <a href="https://www.nusuk.sa/hajj/local-hajj" target="_blank" rel="noopener noreferrer">
                    <Button style={{ background: BRAND_TEAL, color: "#fff" }} className="gap-1"><ExternalLink className="w-4 h-4" />زيارة منصة نسك</Button>
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {hajjPackages.map((pkg: any) => <NusukPackageCard key={pkg.id} pkg={pkg} onBook={setBookingRequestPkg} />)}
                </div>
              )}
            </div>
          )}

          {/* Companies */}
          {domesticSubTab === "companies" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: BRAND_TEAL }}>شركات الحج المرخصة</h2>
                {companiesData && <span className="text-sm text-gray-400">{companiesData.total} شركة</span>}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pr-9" placeholder="ابحث عن شركة..." value={companySearch} onChange={e => setCompanySearch(e.target.value)} />
                  </div>
                  <Input placeholder="المدينة (مكة، المدينة، جدة...)" value={companyCity} onChange={e => setCompanyCity(e.target.value)} />
                </div>
              </div>
              {loadingCompanies ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
              ) : !companiesData?.companies.length ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-500 mb-2">لا توجد شركات مضافة حالياً</h3>
                  <p className="text-gray-400 text-sm">يمكن للمسؤول إضافة شركات الحج من لوحة التحكم</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {companiesData.companies.map((c: any) => <CompanyCard key={c.companyId} company={c} onSelect={() => setSelectedCompany(c)} />)}
                </div>
              )}
            </div>
          )}

          {/* News */}
          {domesticSubTab === "news" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: BRAND_TEAL }}>أخبار وإشعارات حجاج الداخل</h2>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {([["all", "الكل"], ["alert", "تنبيهات"], ["announcement", "إعلانات"], ["news", "أخبار"], ["article", "مقالات"], ["update", "تحديثات"]] as [string, string][]).map(([key, label]) => (
                  <button key={key} onClick={() => setNewsCategory(key as any)}
                    className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
                    style={newsCategory === key ? { background: BRAND_TEAL, color: "#fff" } : { background: "#f3f4f6", color: "#4b5563" }}>
                    {label}
                  </button>
                ))}
              </div>
              {loadingNotifs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
              ) : !notifsData?.items.length ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Newspaper className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-500 mb-2">لا توجد أخبار حالياً</h3>
                  <p className="text-gray-400 text-sm">سيتم نشر آخر أخبار الحج هنا</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {notifsData.items.map((item: any) => <NotifCard key={item.id} item={item} />)}
                </div>
              )}
              <div className="mt-10"><SubscribeForm /></div>
            </div>
          )}
        </div>
      )}

      {/* ─── INTERNATIONAL ────────────────────────────────────────────────── */}
      {tab === "international" && (
        <div className="container mx-auto px-4 py-8">
          {/* Info Banner */}
          <div className="rounded-2xl p-5 mb-8 flex items-start gap-4 bg-blue-50 border border-blue-100">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-600">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg mb-1 text-blue-800">بوابة حجاج الخارج</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                باقات الحج من شركات معتمدة حول العالم. يمكنك الفلترة حسب الدولة والمدينة، ثم إرسال طلب حجز وسيتواصل معك فريقنا لإتمام الإجراءات.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-700 text-sm">فلتر الباقات</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select value={intlCountry || "all"} onValueChange={v => setIntlCountry(v === "all" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="اختر الدولة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الدول</SelectItem>
                  {countriesList?.map((c: any) => <SelectItem key={c.countryCode} value={c.countryAr || ""}>{c.countryAr}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="المدينة..." value={intlCity} onChange={e => setIntlCity(e.target.value)} />
              <Button variant="outline" onClick={() => { setIntlCountry(""); setIntlCity(""); }} className="text-sm gap-1">
                <X className="w-4 h-4" />مسح الفلاتر
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold" style={{ color: BRAND_TEAL }}>
              الباقات المتاحة{intlCountry && <span className="text-base font-normal text-gray-500 mr-2">— {intlCountry}</span>}
            </h2>
            {intlData && <span className="text-sm text-gray-400">{intlData.total} باقة</span>}
          </div>

          {loadingIntl ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
          ) : !intlData?.packages.length ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Plane className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-500 mb-2">لا توجد باقات{intlCountry ? ` من ${intlCountry}` : ""} حالياً</h3>
              <p className="text-gray-400 text-sm">يمكن للمسؤول إضافة باقات حجاج الخارج من لوحة التحكم</p>
              {intlCountry && <Button variant="outline" className="mt-4" onClick={() => setIntlCountry("")}>عرض جميع الدول</Button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {intlData.packages.map((pkg: any) => <IntlPackageCard key={pkg.id} pkg={pkg} onBook={p => setBookingRequestPkg(p)} />)}
            </div>
          )}

          {/* Countries Quick Filter */}
          {countriesList && countriesList.length > 0 && (
            <div className="mt-10">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: BRAND_GOLD }} />تصفح حسب الدولة
              </h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setIntlCountry("")} className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={!intlCountry ? { background: BRAND_TEAL, color: "#fff" } : { background: "#f3f4f6", color: "#4b5563" }}>
                  جميع الدول
                </button>
                {countriesList.map((c: any) => (
                  <button key={c.countryCode} onClick={() => setIntlCountry(c.countryAr || "")}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={intlCountry === c.countryAr ? { background: BRAND_TEAL, color: "#fff" } : { background: "#f3f4f6", color: "#4b5563" }}>
                    {c.countryAr}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedCompany && <CompanyDetailModal company={selectedCompany} onClose={() => setSelectedCompany(null)} />}
      {bookingRequestPkg && (
        bookingRequestPkg.portalType === "internal" || bookingRequestPkg.portalType === "both" && !bookingRequestPkg.countryAr
          ? <DomesticBookingRequestForm pkg={bookingRequestPkg} onClose={() => setBookingRequestPkg(null)} />
          : <IntlBookingRequestForm pkg={bookingRequestPkg} onClose={() => setBookingRequestPkg(null)} />
      )}
      {/* Provider Programs Section */}
      <ProviderProgramsSection
        programType="hajj"
        titleAr="برامج الحج من مزودي الخدمات المعتمدين"
        title="Hajj Programs from Certified Providers"
        maxItems={6}
      />
      {/* AI Assistant */}
      <PilgrimAIAssistant context="hajj" />
    </div>
  );
}
