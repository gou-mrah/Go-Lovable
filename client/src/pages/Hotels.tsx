import { useState, useEffect } from "react";
import { Building2, Search, Users, MapPin, Star, Clock, AlertCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";


export default function Hotels() {

  const [city, setCity] = useState("makkah");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [rooms, setRooms] = useState("1");
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  // useSEO hook can be added if SEO_CONFIGS is available
  
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Search hotels from liteAPI
  const searchQuery = trpc.hotels.searchLiteAPI.useQuery(
    {
      checkIn: checkin || today,
      checkOut: checkout || tomorrow,
      occupancies: Array(parseInt(rooms)).fill(null).map(() => ({
        paxes: [
          ...Array(parseInt(adults)).fill(null).map(() => ({ age: 30 })),
          ...Array(parseInt(children)).fill(null).map(() => ({ age: 8 })),
        ],
      })),
      currency: "SAR",
      guestNationality: "SA",
    },
    { enabled: searchPerformed }
  );

  const handleSearch = () => {
    if (!checkin || !checkout) {
      alert("يرجى اختيار تاريخ الدخول والخروج");
      return;
    }
    if (new Date(checkin) >= new Date(checkout)) {
      alert("تاريخ الخروج يجب أن يكون بعد تاريخ الدخول");
      return;
    }
    setSearchPerformed(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* ── Hero ── */}
      <div className="relative h-72 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1400&q=80"
          alt="فنادق الحرمين"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1B5E52]/75" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-12">
          <p className="text-amber-300 text-xs mb-2 tracking-wider uppercase">
            أسعار حية · تأكيد فوري · حجز مباشر
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            فنادق الحرمين الشريفين
          </h1>
          <p className="text-white/70 text-sm">
            ابحث عن أفضل الفنادق في مكة المكرمة والمدينة المنورة
          </p>
        </div>
      </div>

      {/* ── شريط البحث ── */}
      <div className="bg-white border-b shadow-sm sticky top-16 z-30">
        <div className="container py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {/* المدينة */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">المدينة</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="makkah">🕌 مكة المكرمة</SelectItem>
                  <SelectItem value="madinah">🌙 المدينة المنورة</SelectItem>
                  <SelectItem value="jeddah">🌊 جدة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* تاريخ الدخول */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">الدخول</label>
              <Input
                type="date"
                value={checkin || today}
                onChange={e => {
                  setCheckin(e.target.value);
                  if (checkout && e.target.value >= checkout) setCheckout("");
                }}
                min={today}
                className="w-full text-sm"
              />
            </div>

            {/* تاريخ الخروج */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">الخروج</label>
              <Input
                type="date"
                value={checkout || tomorrow}
                onChange={e => setCheckout(e.target.value)}
                min={checkin || today}
                className="w-full text-sm"
              />
            </div>

            {/* عدد الضيوف */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">الضيوف</label>
              <Select value={adults} onValueChange={setAdults}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} بالغ</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* عدد الأطفال */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">الأطفال</label>
              <Select value={children} onValueChange={setChildren}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* عدد الغرف */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">الغرف</label>
              <Select value={rooms} onValueChange={setRooms}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* زر البحث */}
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={searchQuery.isLoading}
                style={{ background: "#1B5E52", color: "white" }}
                className="w-full gap-2"
              >
                {searchQuery.isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {searchQuery.isLoading ? "جاري البحث..." : "بحث"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12" dir="rtl">
        {/* ── رسالة الخطأ ── */}
        {searchQuery.error && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">خطأ في البحث</p>
              <p className="text-red-700 text-sm">{searchQuery.error.message}</p>
            </div>
          </div>
        )}

        {/* ── نتائج البحث ── */}
        {searchPerformed && searchQuery.data && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1B5E52]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                نتائج البحث
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {checkin} إلى {checkout} • {rooms} غرفة • {parseInt(adults) + parseInt(children)} ضيف
              </p>
            </div>

            {searchQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-[#1B5E52]" />
              </div>
            ) : searchQuery.data?.options && searchQuery.data.options.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchQuery.data.options.map((option: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    {/* صورة الفندق */}
                    <div className="relative h-48 bg-gray-200">
                      {option.hotel?.image ? (
                        <img
                          src={option.hotel.image}
                          alt={option.hotel.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* معلومات الفندق */}
                    <div className="p-4">
                      <h3 className="font-bold text-[#1B5E52] text-base mb-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        {option.hotel?.name || "فندق"}
                      </h3>

                      {/* التقييم */}
                      {option.hotel?.rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-0.5">
                            {Array(Math.round(option.hotel.rating)).fill(null).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">{option.hotel.rating}/5</span>
                        </div>
                      )}

                      {/* السعر */}
                      <div className="mb-3 p-2 bg-amber-50 rounded">
                        <p className="text-xs text-gray-600">السعر لكل ليلة</p>
                        <p className="text-xl font-bold text-[#1B5E52]">
                          {option.price?.net ? `${option.price.net} ${option.price.currency || "SAR"}` : "غير محدد"}
                        </p>
                      </div>

                      {/* سياسة الإلغاء */}
                      {option.cancelPolicy && (
                        <p className="text-xs text-green-600 mb-3">
                          {option.cancelPolicy.refundable ? "✓ قابل للإلغاء" : "✗ غير قابل للإلغاء"}
                        </p>
                      )}

                      {/* زر الحجز */}
                      <Button
                        onClick={() => setSelectedHotel(option)}
                        style={{ background: "#1B5E52", color: "white" }}
                        className="w-full text-sm"
                      >
                        اختيار الفندق
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">لم يتم العثور على فنادق متاحة</p>
              </div>
            )}
          </div>
        )}

        {/* ── رسالة البداية ── */}
        {!searchPerformed && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="w-16 h-16 bg-[#1B5E52]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#1B5E52]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B5E52] mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              ابدأ البحث عن الفندق المثالي
            </h2>
            <p className="text-gray-600">
              حدد المدينة والتواريخ وعدد الضيوف، ثم اضغط بحث للعثور على أفضل الفنادق المتاحة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
