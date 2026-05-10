import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Star, Globe, Hotel, Plane, FileText, Car, MapPin, Search,
  Calendar, Users, ChevronDown, ArrowRight,
} from "lucide-react";

const TABS = [
  { id: "hajj", label: "الحج", icon: Star, color: "text-amber-600", bg: "bg-amber-500" },
  { id: "umrah", label: "العمرة", icon: Globe, color: "text-teal-600", bg: "bg-teal-500" },
  { id: "hotels", label: "الفنادق", icon: Hotel, color: "text-blue-600", bg: "bg-blue-500" },
  { id: "flights", label: "الرحلات", icon: Plane, color: "text-purple-600", bg: "bg-purple-500" },
  { id: "visa", label: "التأشيرة", icon: FileText, color: "text-green-600", bg: "bg-green-500" },
  { id: "transport", label: "المواصلات", icon: Car, color: "text-orange-600", bg: "bg-orange-500" },
  { id: "tours", label: "الجولات", icon: MapPin, color: "text-rose-600", bg: "bg-rose-500" },
];

function SelectField({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex-1 min-w-[130px]">
      <label className="text-[10px] font-semibold text-[var(--teal-700)] uppercase tracking-wider block mb-1 px-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent text-sm text-[var(--teal-900)] font-medium outline-none cursor-pointer pr-6 py-1"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--teal-500)] pointer-events-none" />
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1 min-w-[130px]">
      <label className="text-[10px] font-semibold text-[var(--teal-700)] uppercase tracking-wider block mb-1 px-1">{label}</label>
      <div className="flex items-center gap-1.5">
        <Calendar className="w-3.5 h-3.5 text-[var(--teal-500)] flex-shrink-0" />
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[var(--teal-900)] font-medium outline-none cursor-pointer"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        />
      </div>
    </div>
  );
}

function GuestsField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex-1 min-w-[100px]">
      <label className="text-[10px] font-semibold text-[var(--teal-700)] uppercase tracking-wider block mb-1 px-1">الأشخاص</label>
      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-[var(--teal-500)] flex-shrink-0" />
        <div className="flex items-center gap-2">
          <button onClick={() => onChange(Math.max(1, value - 1))} className="w-5 h-5 rounded-full bg-[var(--teal-100)] text-[var(--teal-700)] text-xs font-bold flex items-center justify-center hover:bg-[var(--teal-200)]">-</button>
          <span className="text-sm font-semibold text-[var(--teal-900)] min-w-[20px] text-center">{value}</span>
          <button onClick={() => onChange(value + 1)} className="w-5 h-5 rounded-full bg-[var(--teal-100)] text-[var(--teal-700)] text-xs font-bold flex items-center justify-center hover:bg-[var(--teal-200)]">+</button>
        </div>
      </div>
    </div>
  );
}

const SAUDI_CITIES = ["مكة المكرمة", "المدينة المنورة", "جدة", "الرياض", "الدمام", "أبها"];
const INTL_CITIES = ["لندن", "دبي", "القاهرة", "إسطنبول", "كوالالمبور", "جاكرتا", "باكستان", "نيودلهي"];
const HAJJ_PACKAGES = ["باقة مميزة 5 نجوم", "باقة مميزة 4 نجوم", "باقة اقتصادية", "باقة عائلية", "جميع الباقات"];
const UMRAH_PACKAGES = ["عمرة رمضان", "عمرة شعبان", "عمرة ذو القعدة", "عمرة مفتوحة", "جميع الباقات"];
const HOTEL_CITIES = ["مكة المكرمة", "المدينة المنورة", "جدة"];
const HOTEL_STARS = ["5 نجوم", "4 نجوم", "3 نجوم", "جميع التصنيفات"];
const FLIGHT_ORIGINS = ["الرياض", "جدة", "الدمام", "أبوظبي", "دبي", "القاهرة", "لندن", "إسطنبول"];
const FLIGHT_DEST = ["مكة المكرمة (جدة)", "المدينة المنورة"];
const VISA_TYPES = ["تأشيرة عمرة", "تأشيرة حج", "تأشيرة سياحية", "تأشيرة عمل", "تأشيرة عبور"];
const NATIONALITIES = ["سعودي", "مصري", "باكستاني", "هندي", "إندونيسي", "تركي", "بريطاني", "أمريكي"];
const VEHICLE_TYPES = ["سيارة VIP", "فان", "حافلة صغيرة", "حافلة كبيرة"];
const TOUR_TYPES = ["جولة مكة المكرمة", "جولة المدينة المنورة", "جولة الطائف", "جولة بدر", "جولة أُحد", "جميع الجولات"];

export default function UniversalSearch() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("hajj");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [from, setFrom] = useState(INTL_CITIES[0]);
  const [to, setTo] = useState(HOTEL_CITIES[0]);
  const [packageType, setPackageType] = useState(HAJJ_PACKAGES[HAJJ_PACKAGES.length - 1]);
  const [hotelCity, setHotelCity] = useState(HOTEL_CITIES[0]);
  const [hotelStars, setHotelStars] = useState(HOTEL_STARS[HOTEL_STARS.length - 1]);
  const [flightFrom, setFlightFrom] = useState(FLIGHT_ORIGINS[0]);
  const [flightTo, setFlightTo] = useState(FLIGHT_DEST[0]);
  const [visaType, setVisaType] = useState(VISA_TYPES[0]);
  const [nationality, setNationality] = useState(NATIONALITIES[0]);
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [vehicleFrom, setVehicleFrom] = useState(SAUDI_CITIES[0]);
  const [vehicleTo, setVehicleTo] = useState(SAUDI_CITIES[1]);
  const [tourType, setTourType] = useState(TOUR_TYPES[TOUR_TYPES.length - 1]);

  const handleSearch = () => {
    if (activeTab === "hotels") {
      // Build White Label URL with search params
      const cityMap: Record<string, string> = {
        "مكة المكرمة": "Makkah",
        "المدينة المنورة": "Madinah",
        "جدة": "Jeddah",
        "الرياض": "Riyadh",
        "الطائف": "Taif",
      };
      const dest = cityMap[hotelCity] || "Makkah";
      const params = new URLSearchParams({
        destination: dest,
        ...(date ? { checkin: date } : {}),
        ...(returnDate ? { checkout: returnDate } : {}),
        adults: String(guests),
        rooms: "1",
        currency: "SAR",
        lang: "ar",
      });
      navigate(`/hotels?${params.toString()}`);
      return;
    }
    const routes: Record<string, string> = {
      hajj: "/hajj", umrah: "/umrah",
      flights: "/flights", visa: "/visa", transport: "/transport", tours: "/tours",
    };
    navigate(routes[activeTab] || "/");
  };

  const renderFields = () => {
    switch (activeTab) {
      case "hajj":
        return (
          <>
            <SelectField label="نوع الباقة" options={HAJJ_PACKAGES} value={packageType} onChange={setPackageType} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <SelectField label="مدينة الانطلاق" options={INTL_CITIES} value={from} onChange={setFrom} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <DateField label="تاريخ السفر" value={date} onChange={setDate} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <GuestsField value={guests} onChange={setGuests} />
          </>
        );
      case "umrah":
        return (
          <>
            <SelectField label="نوع الباقة" options={UMRAH_PACKAGES} value={packageType} onChange={setPackageType} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <SelectField label="مدينة الانطلاق" options={[...SAUDI_CITIES, ...INTL_CITIES]} value={from} onChange={setFrom} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <DateField label="تاريخ العمرة" value={date} onChange={setDate} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <GuestsField value={guests} onChange={setGuests} />
          </>
        );
      case "hotels":
        return null; // rendered separately below
      case "flights":
        return (
          <>
            <SelectField label="من" options={FLIGHT_ORIGINS} value={flightFrom} onChange={setFlightFrom} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <SelectField label="إلى" options={FLIGHT_DEST} value={flightTo} onChange={setFlightTo} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <DateField label="تاريخ الذهاب" value={date} onChange={setDate} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <DateField label="تاريخ العودة" value={returnDate} onChange={setReturnDate} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <GuestsField value={guests} onChange={setGuests} />
          </>
        );
      case "visa":
        return (
          <>
            <SelectField label="نوع التأشيرة" options={VISA_TYPES} value={visaType} onChange={setVisaType} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <SelectField label="الجنسية" options={NATIONALITIES} value={nationality} onChange={setNationality} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <DateField label="تاريخ السفر المتوقع" value={date} onChange={setDate} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <GuestsField value={guests} onChange={setGuests} />
          </>
        );
      case "transport":
        return (
          <>
            <SelectField label="من" options={SAUDI_CITIES} value={vehicleFrom} onChange={setVehicleFrom} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <SelectField label="إلى" options={SAUDI_CITIES} value={vehicleTo} onChange={setVehicleTo} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <SelectField label="نوع المركبة" options={VEHICLE_TYPES} value={vehicleType} onChange={setVehicleType} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <DateField label="تاريخ الرحلة" value={date} onChange={setDate} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <GuestsField value={guests} onChange={setGuests} />
          </>
        );
      case "tours":
        return (
          <>
            <SelectField label="نوع الجولة" options={TOUR_TYPES} value={tourType} onChange={setTourType} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <DateField label="تاريخ الجولة" value={date} onChange={setDate} />
            <div className="w-px h-10 bg-[var(--border)] hidden sm:block" />
            <GuestsField value={guests} onChange={setGuests} />
          </>
        );
      default:
        return null;
    }
  };

  const activeTabData = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="w-full max-w-4xl mx-auto" dir="rtl">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-2xl p-1.5 mb-3 border border-white/20 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? "bg-white text-[var(--teal-800)] shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? tab.color : ""}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/50">
          <div className={`h-1 w-full ${activeTabData.bg}`} />
          <div className="p-4 flex flex-wrap items-end gap-4">
            {renderFields()}
            <Button
              onClick={handleSearch}
              className={`${activeTabData.bg} hover:opacity-90 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 flex-shrink-0 shadow-lg`}
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              <Search className="w-4 h-4" />
              بحث
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
    </div>
  );
}
