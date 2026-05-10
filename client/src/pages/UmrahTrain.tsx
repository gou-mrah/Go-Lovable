import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Train, MapPin, Clock, Users, Star, Wifi, Coffee, Crown,
  ArrowRight, CheckCircle, Loader2, Search, Calendar,
  ChevronRight, Zap, Shield, Phone,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

const BRAND_TEAL = "#1B5E52";
const BRAND_GOLD = "#C9A96E";

const STATIONS: Record<string, { nameAr: string; nameEn: string; city: string }> = {
  makkah: { nameAr: "مكة المكرمة", nameEn: "Makkah", city: "مكة المكرمة" },
  jeddah: { nameAr: "جدة (البلد)", nameEn: "Jeddah City", city: "جدة" },
  king_abdulaziz: { nameAr: "مطار الملك عبدالعزيز", nameEn: "King Abdulaziz Airport", city: "جدة" },
  madinah: { nameAr: "المدينة المنورة", nameEn: "Madinah", city: "المدينة المنورة" },
};

const CLASS_INFO: Record<string, { nameAr: string; nameEn: string; color: string; icon: React.ElementType; features: string[] }> = {
  economy: {
    nameAr: "درجة اقتصادية",
    nameEn: "Economy",
    color: "bg-blue-50 border-blue-200 text-blue-800",
    icon: Users,
    features: ["واي فاي مجاني", "مقاعد مريحة"],
  },
  business: {
    nameAr: "درجة رجال الأعمال",
    nameEn: "Business",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    icon: Star,
    features: ["واي فاي مجاني", "وجبات خفيفة", "أولوية الصعود"],
  },
  vip: {
    nameAr: "الدرجة الأولى VIP",
    nameEn: "VIP First Class",
    color: "bg-purple-50 border-purple-200 text-purple-800",
    icon: Crown,
    features: ["واي فاي مجاني", "وجبات كاملة", "أولوية الصعود", "صالة VIP"],
  },
};

interface TrainResult {
  trainId: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  trainClass: string;
  passengers: number;
  priceUSD: number;
  seatsAvailable: number;
  trainNumber: string;
  amenities: string[];
}

export default function UmrahTrainPage() {
  const { format: formatPrice } = useCurrency();

  const [searchParams, setSearchParams] = useState({
    fromStation: "jeddah" as keyof typeof STATIONS,
    toStation: "makkah" as keyof typeof STATIONS,
    travelDate: "",
    passengers: "1",
    trainClass: "economy" as "economy" | "business" | "vip",
  });
  const [searched, setSearched] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<TrainResult | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<"form" | "success">("form");
  const [bookingRef, setBookingRef] = useState("");
  const [bookingForm, setBookingForm] = useState({
    passengerName: "",
    passengerEmail: "",
    passengerPhone: "",
    passportNumber: "",
  });

  type StationType = "makkah" | "jeddah" | "king_abdulaziz" | "madinah";
  const { data: trains, isLoading, refetch } = trpc.train.search.useQuery(
    {
      fromStation: searchParams.fromStation as StationType,
      toStation: searchParams.toStation as StationType,
      travelDate: searchParams.travelDate || new Date().toISOString().split("T")[0],
      passengers: parseInt(searchParams.passengers) || 1,
      trainClass: searchParams.trainClass,
    },
    { enabled: searched }
  );

  const bookMutation = trpc.train.book.useMutation({
    onSuccess: (data) => {
      setBookingRef(data.bookingRef);
      setBookingStep("success");
      toast.success(`تم تأكيد حجز القطار! الرقم: ${data.bookingRef}`);
    },
    onError: (err) => {
      toast.error(err.message || "فشل الحجز. يرجى المحاولة مرة أخرى.");
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchParams.fromStation === searchParams.toStation) {
      toast.error("يرجى اختيار محطتين مختلفتين");
      return;
    }
    if (!searchParams.travelDate) {
      toast.error("يرجى اختيار تاريخ السفر");
      return;
    }
    setSearched(true);
    refetch();
  };

  const handleBook = (train: TrainResult) => {
    setSelectedTrain(train);
    setBookingStep("form");
    setBookingOpen(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.passengerName.trim()) {
      toast.error("يرجى إدخال اسم المسافر");
      return;
    }
    if (!selectedTrain) return;
    bookMutation.mutate({
      fromStation: searchParams.fromStation as "makkah" | "jeddah" | "king_abdulaziz" | "madinah",
      toStation: searchParams.toStation as "makkah" | "jeddah" | "king_abdulaziz" | "madinah",
      travelDate: searchParams.travelDate,
      trainClass: searchParams.trainClass,
      passengers: parseInt(searchParams.passengers) || 1,
      priceUSD: selectedTrain.priceUSD.toString(),
      passengerName: bookingForm.passengerName,
      passengerEmail: bookingForm.passengerEmail || undefined,
      passengerPhone: bookingForm.passengerPhone || undefined,
      passportNumber: bookingForm.passportNumber || undefined,
    });
  };

  const voucherUrl = bookingRef
    ? `/voucher?ref=${bookingRef}&type=train&name=${encodeURIComponent(`قطار الحرمين: ${STATIONS[searchParams.fromStation].nameAr} → ${STATIONS[searchParams.toStation].nameAr}`)}&price=${selectedTrain?.priceUSD || 0}`
    : "";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=85"
          alt="Haramain High Speed Railway"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B5E52]/80 to-[#1B5E52]/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16">
          <Badge className="mb-3 bg-[#C9A96E]/20 text-[#C9A96E] border-[#C9A96E]/30 text-xs tracking-widest uppercase px-4 py-1.5">
            قطار الحرمين السريع
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            حجز قطار العمرة الداخلي
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-lg">
            سافر بين مكة المكرمة والمدينة المنورة وجدة بسرعة وراحة على متن قطار الحرمين السريع
          </p>
        </div>
      </div>

      {/* Route Map Visual */}
      <div className="bg-white border-b border-[var(--border)]">
        <div className="container py-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {Object.entries(STATIONS).map(([key, station], i, arr) => (
              <div key={key} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-full px-3 py-1.5">
                  <Train className="w-3.5 h-3.5 text-[var(--teal-600)]" />
                  <span className="text-xs font-semibold text-[var(--teal-800)]">{station.nameAr}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)]" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Search Form */}
        <Card className="luxury-card mb-8">
          <CardHeader>
            <CardTitle className="text-[var(--teal-800)] flex items-center gap-2">
              <Search className="w-5 h-5" />
              البحث عن رحلات القطار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* From */}
              <div>
                <Label className="text-sm font-medium text-[var(--teal-700)] mb-1 block">من محطة</Label>
                <Select
                  value={searchParams.fromStation}
                  onValueChange={(v) => setSearchParams({ ...searchParams, fromStation: v as any })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATIONS).map(([key, s]) => (
                      <SelectItem key={key} value={key}>{s.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To */}
              <div>
                <Label className="text-sm font-medium text-[var(--teal-700)] mb-1 block">إلى محطة</Label>
                <Select
                  value={searchParams.toStation}
                  onValueChange={(v) => setSearchParams({ ...searchParams, toStation: v as any })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATIONS).map(([key, s]) => (
                      <SelectItem key={key} value={key}>{s.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <Label className="text-sm font-medium text-[var(--teal-700)] mb-1 block">تاريخ السفر</Label>
                <Input
                  type="date"
                  value={searchParams.travelDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSearchParams({ ...searchParams, travelDate: e.target.value })}
                  className="bg-white"
                />
              </div>

              {/* Passengers */}
              <div>
                <Label className="text-sm font-medium text-[var(--teal-700)] mb-1 block">عدد المسافرين</Label>
                <Select
                  value={searchParams.passengers}
                  onValueChange={(v) => setSearchParams({ ...searchParams, passengers: v })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} مسافر{n > 1 ? "ين" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class */}
              <div>
                <Label className="text-sm font-medium text-[var(--teal-700)] mb-1 block">الدرجة</Label>
                <Select
                  value={searchParams.trainClass}
                  onValueChange={(v) => setSearchParams({ ...searchParams, trainClass: v as any })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">اقتصادية</SelectItem>
                    <SelectItem value="business">رجال الأعمال</SelectItem>
                    <SelectItem value="vip">VIP الأولى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 lg:col-span-5">
                <Button
                  type="submit"
                  className="w-full md:w-auto bg-[var(--primary)] hover:bg-[var(--teal-600)] text-white px-8"
                >
                  <Search className="w-4 h-4 mr-2" />
                  البحث عن الرحلات
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Class Info Cards */}
        {!searched && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {Object.entries(CLASS_INFO).map(([key, cls]) => (
              <div key={key} className={`luxury-card p-5 border-2 ${cls.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <cls.icon className="w-5 h-5" />
                  <h3 className="font-bold text-sm">{cls.nameAr}</h3>
                </div>
                <ul className="space-y-1">
                  {cls.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs">
                      <CheckCircle className="w-3 h-3 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {searched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--teal-800)]">
                الرحلات المتاحة: {STATIONS[searchParams.fromStation].nameAr} → {STATIONS[searchParams.toStation].nameAr}
              </h2>
              <Badge className="bg-[var(--teal-50)] text-[var(--teal-700)] border-[var(--teal-200)]">
                {searchParams.travelDate}
              </Badge>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-[var(--teal-600)] animate-spin" />
              </div>
            ) : trains && trains.length > 0 ? (
              <div className="space-y-4">
                {trains.map((train) => {
                  const cls = CLASS_INFO[train.trainClass];
                  return (
                    <Card key={train.trainId} className="luxury-card hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Train Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-xl bg-[var(--teal-100)] flex items-center justify-center">
                                <Train className="w-5 h-5 text-[var(--teal-600)]" />
                              </div>
                              <div>
                                <p className="font-bold text-[var(--teal-800)] text-sm">{train.trainNumber}</p>
                                <Badge className={`text-xs border ${cls.color}`}>{cls.nameAr}</Badge>
                              </div>
                            </div>

                            {/* Route & Time */}
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-[var(--teal-800)]">{train.departureTime}</p>
                                <p className="text-xs text-[var(--muted-foreground)]">{STATIONS[searchParams.fromStation].nameAr}</p>
                              </div>
                              <div className="flex-1 flex flex-col items-center">
                                <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-1">
                                  <Clock className="w-3 h-3" />
                                  {train.duration}
                                </div>
                                <div className="w-full h-px bg-[var(--border)] relative">
                                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    <Zap className="w-3 h-3 text-[var(--gold)]" />
                                  </div>
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-[var(--teal-800)]">{train.departureTime}</p>
                                <p className="text-xs text-[var(--muted-foreground)]">{STATIONS[searchParams.toStation].nameAr}</p>
                              </div>
                            </div>

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {train.amenities.map((a) => (
                                <span key={a} className="text-xs bg-[var(--teal-50)] text-[var(--teal-700)] border border-[var(--teal-200)] rounded-full px-2 py-0.5">
                                  {a}
                                </span>
                              ))}
                              <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">
                                {train.seatsAvailable} مقعد متاح
                              </span>
                            </div>
                          </div>

                          {/* Price & Book */}
                          <div className="flex flex-col items-end gap-3 min-w-[140px]">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[var(--teal-800)]">
                                {formatPrice(train.priceUSD)}
                              </p>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                {searchParams.passengers} مسافر
                              </p>
                            </div>
                            <Button
                              onClick={() => handleBook(train)}
                              className="bg-[var(--primary)] hover:bg-[var(--teal-600)] text-white w-full"
                            >
                              احجز الآن
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Train className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4 opacity-30" />
                <p className="text-[var(--muted-foreground)]">لا توجد رحلات متاحة لهذا المسار</p>
              </div>
            )}
          </div>
        )}

        {/* Why Haramain Train */}
        {!searched && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-[var(--teal-800)] text-center mb-6" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              لماذا قطار الحرمين؟
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Zap, title: "سرعة 300 كم/ساعة", desc: "أسرع وسيلة نقل بين المدن المقدسة" },
                { icon: Shield, title: "أمان عالي", desc: "أحدث معايير السلامة الدولية" },
                { icon: Wifi, title: "واي فاي مجاني", desc: "اتصال إنترنت عالي السرعة طوال الرحلة" },
                { icon: Phone, title: "دعم 24/7", desc: "خدمة عملاء متاحة على مدار الساعة" },
              ].map((f) => (
                <div key={f.title} className="text-center p-4 luxury-card">
                  <div className="w-12 h-12 rounded-xl bg-[var(--teal-50)] flex items-center justify-center mx-auto mb-3">
                    <f.icon className="w-6 h-6 text-[var(--teal-600)]" />
                  </div>
                  <h3 className="font-semibold text-[var(--teal-800)] text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={() => { setBookingOpen(false); setBookingStep("form"); }}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          {bookingStep === "success" ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-[var(--teal-800)] mb-2">تم تأكيد حجز القطار!</h3>
              <div className="inline-flex items-center gap-2 bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-xl px-4 py-2 mb-4">
                <Train className="w-4 h-4 text-[var(--teal-600)]" />
                <span className="font-mono font-bold text-[var(--teal-800)] tracking-wider">{bookingRef}</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">
                تذكرة القطار: {STATIONS[searchParams.fromStation].nameAr} → {STATIONS[searchParams.toStation].nameAr}
              </p>
              {/* QR */}
              <div className="bg-[var(--teal-50)] rounded-xl p-4 mb-4 border border-[var(--teal-200)]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(window.location.origin + voucherUrl)}&color=1B5E52&bgcolor=F5EFE6`}
                  alt="QR"
                  className="w-28 h-28 mx-auto rounded-lg"
                />
                <p className="text-xs text-[var(--muted-foreground)] mt-2">امسح الرمز للوصول إلى التذكرة</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => window.open(voucherUrl, "_blank")} className="flex-1 bg-[var(--primary)] text-white">
                  عرض التذكرة
                </Button>
                <Button variant="outline" onClick={() => setBookingOpen(false)} className="flex-1">
                  إغلاق
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-[var(--teal-800)] text-right">
                  حجز تذكرة القطار
                </DialogTitle>
                <DialogDescription className="text-right text-sm">
                  {selectedTrain && (
                    <span>
                      {selectedTrain.trainNumber} — {STATIONS[searchParams.fromStation].nameAr} → {STATIONS[searchParams.toStation].nameAr}
                      <br />
                      <strong>{formatPrice(selectedTrain.priceUSD)}</strong> — {CLASS_INFO[selectedTrain.trainClass].nameAr}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">اسم المسافر الرئيسي *</Label>
                  <Input
                    placeholder="الاسم الكامل كما في الهوية"
                    value={bookingForm.passengerName}
                    onChange={(e) => setBookingForm({ ...bookingForm, passengerName: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={bookingForm.passengerEmail}
                      onChange={(e) => setBookingForm({ ...bookingForm, passengerEmail: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">رقم الهاتف</Label>
                    <Input
                      placeholder="+966 5X XXX XXXX"
                      value={bookingForm.passengerPhone}
                      onChange={(e) => setBookingForm({ ...bookingForm, passengerPhone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">رقم الهوية / جواز السفر</Label>
                  <Input
                    placeholder="رقم الهوية الوطنية أو جواز السفر"
                    value={bookingForm.passportNumber}
                    onChange={(e) => setBookingForm({ ...bookingForm, passportNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={bookMutation.isPending}
                  className="w-full bg-[var(--primary)] hover:bg-[var(--teal-600)] text-white"
                >
                  {bookMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> جاري الحجز...</>
                  ) : (
                    "تأكيد الحجز"
                  )}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
