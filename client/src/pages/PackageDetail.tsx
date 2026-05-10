import { useParams, useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import BookingModal from "@/components/shared/BookingModal";
import {
  Heart, Star, MapPin, Calendar, Users, Clock, ChevronRight,
  ChevronDown, ChevronUp, Check, X, Hotel, Plane, Loader2,
  Share2, ArrowRight,
} from "lucide-react";

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ serviceType, title }: { serviceType: string; title: string }) {
  const [, navigate] = useLocation();
  const labels: Record<string, string> = {
    hajj: "الحج", umrah: "العمرة", hotels: "الفنادق", tours: "الجولات",
  };
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4" dir="rtl">
      <button onClick={() => navigate("/")} className="hover:text-teal-700">الرئيسية</button>
      <ChevronRight className="w-3 h-3 rotate-180" />
      <button onClick={() => navigate(`/${serviceType}`)} className="hover:text-teal-700">{labels[serviceType] ?? serviceType}</button>
      <ChevronRight className="w-3 h-3 rotate-180" />
      <span className="text-gray-800 font-medium truncate max-w-[200px]">{title}</span>
    </nav>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function Gallery({ images, mainImage }: { images?: string[] | null; mainImage?: string | null }) {
  const [active, setActive] = useState(0);
  const all = [mainImage, ...(images ?? [])].filter(Boolean) as string[];
  if (!all.length) return null;
  return (
    <div className="space-y-2">
      <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 bg-gray-100">
        <img src={all[active]} alt="صورة الباقة" className="w-full h-full object-cover" />
      </div>
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {all.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === active ? "border-teal-600" : "border-transparent"}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Itinerary Accordion ──────────────────────────────────────────────────────
function ItineraryAccordion({ itinerary }: { itinerary?: { day: number; title: string; description: string }[] | null }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!itinerary?.length) return <p className="text-gray-400 text-sm">لا يوجد برنامج يومي مفصّل.</p>;
  return (
    <div className="space-y-2">
      {itinerary.map((day, i) => (
        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-teal-50 text-right"
          >
            <span className="font-semibold text-teal-800">اليوم {day.day}: {day.title}</span>
            {open === i ? <ChevronUp className="w-4 h-4 text-teal-600" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {open === i && (
            <div className="px-4 py-3 text-gray-700 text-sm leading-relaxed">{day.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Reviews List ───────────────────────────────────────────────────────────────
function ReviewsList({ serviceId }: { serviceType: string; serviceId: number }) {
  const { data: result } = trpc.bookingReviews.getForProvider.useQuery({
    providerId: 0,
    limit: 5,
  }, { enabled: !!serviceId });

  const reviews = result?.reviews ?? [];
  const avgRating = result?.avgRating ?? 0;

  if (!reviews.length) return <p className="text-gray-400 text-sm">لا توجد تقييمات بعد.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
          ))}
        </div>
        <span className="font-bold text-teal-800">{avgRating.toFixed(1)}</span>
        <span className="text-gray-500 text-sm">({reviews.length} تقييم)</span>
      </div>
      {reviews.map((r: any) => (       <div key={r.id} className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">{r.reviewerName ?? "مجهول"}</span>
            <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString("ar-SA")}</span>
          </div>
          {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
          {r.providerReply && (
            <div className="mt-2 bg-teal-50 rounded-lg p-2 text-sm text-teal-800">
              <span className="font-semibold">رد المزود: </span>{r.providerReply}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({
  pkg, serviceType, onBook,
}: {
  pkg: any;
  serviceType: string;
  onBook: () => void;
}) {
  const [travelers, setTravelers] = useState(1);
  const price = parseFloat(pkg.priceUSD ?? pkg.pricePerNightUSD ?? "0");
  const originalPrice = parseFloat(pkg.originalPriceUSD ?? "0");
  const total = price * travelers;
  const seats = pkg.seatsAvailable ?? 99;
  const seatLabel = seats === 0 ? "ممتلئ" : seats < 5 ? `${seats} مقاعد فقط` : "متاح";
  const seatColor = seats === 0 ? "bg-red-100 text-red-700" : seats < 5 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700";

  return (
    <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-100 p-6" dir="rtl">
      <div className="mb-4">
        <div className="flex items-end gap-2 mb-1">
          <span className="text-3xl font-bold text-teal-800">${price.toLocaleString()}</span>
          <span className="text-gray-500 text-sm mb-1">/ شخص</span>
        </div>
        {originalPrice > price && (
          <span className="text-gray-400 line-through text-sm">${originalPrice.toLocaleString()}</span>
        )}
      </div>

      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${seatColor}`}>
        {seatLabel}
      </span>

      {seats > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">عدد المسافرين</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setTravelers(Math.max(1, travelers - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">−</button>
            <span className="w-8 text-center font-semibold">{travelers}</span>
            <button onClick={() => setTravelers(Math.min(seats, travelers + 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50">+</button>
          </div>
        </div>
      )}

      {travelers > 1 && (
        <div className="bg-teal-50 rounded-xl p-3 mb-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>${price.toLocaleString()} × {travelers}</span>
            <span className="font-bold text-teal-800">${total.toLocaleString()}</span>
          </div>
        </div>
      )}

      <Button
        onClick={onBook}
        disabled={seats === 0}
        className="w-full py-3 text-base font-bold rounded-xl"
        style={{ background: "#1B5E52", color: "white" }}
      >
        {seats === 0 ? "الباقة ممتلئة" : "احجز الآن"}
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PackageDetailPage() {
  const params = useParams<{ id: string }>();
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "inclusions" | "hotel" | "reviews">("overview");

  // Detect service type from URL path
  const serviceType = location.startsWith("/hajj") ? "hajj"
    : location.startsWith("/umrah") ? "umrah"
    : location.startsWith("/hotels") ? "hotels"
    : location.startsWith("/tours") ? "tours"
    : "umrah";

  const id = parseInt(params.id ?? "0");
  const sessionId = useMemo(() => {
    let s = localStorage.getItem("session-id");
    if (!s) { s = Math.random().toString(36).slice(2); localStorage.setItem("session-id", s); }
    return s;
  }, []);

  // Fetch package data — call each router separately to satisfy TypeScript
  const { data: hajjPkg, isLoading: hajjLoading } = trpc.hajj.getById.useQuery({ id }, { enabled: serviceType === "hajj" && !!id });
  const { data: umrahPkg, isLoading: umrahLoading } = trpc.umrah.getById.useQuery({ id }, { enabled: serviceType === "umrah" && !!id });
  const { data: hotelPkg, isLoading: hotelLoading } = trpc.hotels.getById.useQuery({ id }, { enabled: serviceType === "hotels" && !!id });
  const { data: tourPkg, isLoading: tourLoading } = trpc.tours.getById.useQuery({ id }, { enabled: serviceType === "tours" && !!id });
  const pkg = hajjPkg ?? umrahPkg ?? hotelPkg ?? tourPkg ?? null;
  const isLoading = hajjLoading || umrahLoading || hotelLoading || tourLoading;

  // Wishlist
  const { data: isWishlisted } = trpc.wishlist.check.useQuery(
    { serviceType: serviceType === "hotels" ? "hotel" : serviceType as any, serviceId: id },
    { enabled: isAuthenticated && !!id }
  );
  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: (data) => {
      toast.success(data.saved ? "تمت الإضافة للمفضلة ❤️" : "تمت الإزالة من المفضلة");
    },
  });

  // Track view
  const trackView = trpc.recommendations.track.useMutation();
  useEffect(() => {
    if (pkg && id) {
      trackView.mutate({
        eventType: "view_package",
        serviceType,
        serviceId: id,
        sessionId,
      });
    }
  }, [pkg?.id]);

  const handleWishlistToggle = () => {
    if (!isAuthenticated) { toast.error("يجب تسجيل الدخول أولاً"); return; }
    toggleWishlist.mutate({ serviceType: serviceType === "hotels" ? "hotel" : serviceType as any, serviceId: id });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: (pkg as any)?.title ?? (pkg as any)?.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("تم نسخ الرابط");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-700" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">الباقة غير موجودة</h2>
          <Button onClick={() => navigate(`/${serviceType}`)} variant="outline">العودة للقائمة</Button>
        </div>
      </div>
    );
  }

  const title = (pkg as any).title ?? (pkg as any).name ?? "باقة";
  const price = parseFloat((pkg as any).priceUSD ?? (pkg as any).pricePerNightUSD ?? "0");
  const inclusions = (pkg as any).inclusions ?? (pkg as any).includes ?? [];
  const exclusions = (pkg as any).exclusions ?? [];
  const itinerary = (pkg as any).itinerary ?? [];
  const galleryImages = (pkg as any).galleryImages ?? [];
  const imageUrl = (pkg as any).imageUrl;
  const duration = (pkg as any).duration;
  const departureCity = (pkg as any).departureCity;
  const departureDate = (pkg as any).departureDate;
  const hotelMakkah = (pkg as any).hotelMakkah;
  const hotelMadinah = (pkg as any).hotelMadinah;
  const hotelStarRating = (pkg as any).hotelStarRating ?? (pkg as any).starRating ?? 4;
  const seatsAvailable = (pkg as any).seatsAvailable;
  const badge = (pkg as any).badge;

  const tabs = [
    { id: "overview", label: "نظرة عامة" },
    { id: "itinerary", label: "البرنامج اليومي" },
    { id: "inclusions", label: "الشمولات" },
    ...(hotelMakkah || hotelMadinah ? [{ id: "hotel", label: "الفندق" }] : []),
    { id: "reviews", label: "التقييمات" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F5EFE6]" dir="rtl">
      {/* Hero */}
      <div className="relative h-64 md:h-80 bg-teal-900 overflow-hidden">
        {imageUrl && <img src={imageUrl} alt={title} className="w-full h-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 right-0 left-0 p-6">
          <div className="max-w-5xl mx-auto">
            {badge && <Badge className="mb-2 bg-yellow-500 text-yellow-900">{badge}</Badge>}
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{title}</h1>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              {duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{duration} أيام</span>}
              {departureCity && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{departureCity}</span>}
              {departureDate && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(departureDate).toLocaleDateString("ar-SA")}</span>}
            </div>
          </div>
        </div>
        {/* Action buttons */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button onClick={handleShare} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={handleWishlistToggle} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30">
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-400 text-red-400" : ""}`} />
          </button>
        </div>
        <button onClick={() => navigate(`/${serviceType}`)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Breadcrumb serviceType={serviceType} title={title} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            {galleryImages.length > 0 && <Gallery images={galleryImages} mainImage={imageUrl} />}

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex overflow-x-auto border-b border-gray-100">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "border-b-2 border-teal-600 text-teal-700 bg-teal-50"
                        : "text-gray-500 hover:text-teal-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    {(pkg as any).subtitle && <p className="text-gray-600 leading-relaxed">{(pkg as any).subtitle}</p>}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {duration && (
                        <div className="bg-teal-50 rounded-xl p-3 text-center">
                          <Clock className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                          <div className="text-lg font-bold text-teal-800">{duration}</div>
                          <div className="text-xs text-gray-500">يوم</div>
                        </div>
                      )}
                      {seatsAvailable !== undefined && (
                        <div className="bg-teal-50 rounded-xl p-3 text-center">
                          <Users className="w-5 h-5 text-teal-600 mx-auto mb-1" />
                          <div className="text-lg font-bold text-teal-800">{seatsAvailable}</div>
                          <div className="text-xs text-gray-500">مقعد متاح</div>
                        </div>
                      )}
                      {hotelStarRating && (
                        <div className="bg-teal-50 rounded-xl p-3 text-center">
                          <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                          <div className="text-lg font-bold text-teal-800">{hotelStarRating}</div>
                          <div className="text-xs text-gray-500">نجوم</div>
                        </div>
                      )}
                    </div>
                    {(pkg as any).features && (pkg as any).features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(pkg as any).features.map((f: string, i: number) => (
                          <span key={i} className="bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "itinerary" && <ItineraryAccordion itinerary={itinerary} />}

                {activeTab === "inclusions" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4" /> المشمول
                      </h3>
                      <ul className="space-y-2">
                        {inclusions.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                        {!inclusions.length && <li className="text-gray-400 text-sm">لا توجد تفاصيل.</li>}
                      </ul>
                    </div>
                    {exclusions.length > 0 && (
                      <div>
                        <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                          <X className="w-4 h-4" /> غير المشمول
                        </h3>
                        <ul className="space-y-2">
                          {exclusions.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "hotel" && (
                  <div className="space-y-4">
                    {hotelMakkah && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <Hotel className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-800">فندق مكة المكرمة</div>
                          <div className="text-gray-600 text-sm">{hotelMakkah}</div>
                          <div className="flex mt-1">
                            {Array.from({ length: hotelStarRating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {hotelMadinah && (
                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                        <Hotel className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-gray-800">فندق المدينة المنورة</div>
                          <div className="text-gray-600 text-sm">{hotelMadinah}</div>
                          <div className="flex mt-1">
                            {Array.from({ length: hotelStarRating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && <ReviewsList serviceType={serviceType} serviceId={id} />}
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div>
            <BookingCard pkg={pkg} serviceType={serviceType} onBook={() => {
              if (!isAuthenticated) { toast.error("يجب تسجيل الدخول أولاً"); return; }
              setBookingOpen(true);
            }} />
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingOpen && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          serviceType={serviceType === "hotels" ? "hotel" : serviceType as any}
          service={{ id, title, priceUSD: String(price) }}
        />
      )}
    </div>
  );
}
