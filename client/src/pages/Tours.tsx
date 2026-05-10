import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
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
  MapPin, Clock, Users, Star, ArrowRight, Camera,
  Calendar, BookOpen, Globe, CheckCircle, Search,
} from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import { useCurrency } from "@/contexts/CurrencyContext";

function TourCard({ tour, onBook }: { tour: any; onBook: (t: any) => void }) {
  const highlights = Array.isArray(tour.sites) ? tour.sites : (Array.isArray(tour.highlights) ? tour.highlights : []);
  const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];
  const { format: formatPrice } = useCurrency();

  const categoryGradients: Record<string, string> = {
    religious: "linear-gradient(135deg, #1B5E52 0%, #0d3d3d 100%)",
    historical: "linear-gradient(135deg, #92400e 0%, #451a03 100%)",
    cultural: "linear-gradient(135deg, #581c87 0%, #3b0764 100%)",
    combined: "linear-gradient(135deg, #14532d 0%, #052e16 100%)",
  };
  const categoryLabels: Record<string, string> = {
    religious: "دينية", historical: "تاريخية", cultural: "ثقافية", combined: "متكاملة",
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <img
          src={tour.imageUrl || "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80"}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-1.5">
          {tour.isFeatured && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-lg" style={{ background: "#C9A96E" }}>★ مميز</span>}
          {tour.isUrgent && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500 text-white shadow-lg">⚠ أماكن محدودة</span>}
        </div>
        <div className="absolute top-3 left-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
            {categoryLabels[tour.category] || tour.category}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-base leading-tight mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>{tour.title}</h3>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-white/80 text-xs"><MapPin className="w-3 h-3" />{tour.location}</span>
            <span className="flex items-center gap-1 text-white/80 text-xs"><Clock className="w-3 h-3" />{tour.duration}ساعة</span>
            <span className="flex items-center gap-1 text-white/80 text-xs"><Users className="w-3 h-3" />حد أقصى {tour.maxGroupSize || 20}</span>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {tour.subtitle && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{tour.subtitle}</p>
        )}
        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {highlights.slice(0, 3).map((h: string, i: number) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                <CheckCircle className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
                {h}
              </div>
            ))}
          </div>
        )}
        {/* Itinerary preview */}
        {itinerary.length > 0 && (
          <div className="mb-3 bg-teal-50 rounded-xl p-3 border border-teal-100">
            <div className="text-xs font-semibold text-teal-700 mb-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> برنامج الجولة
            </div>
            <div className="space-y-1.5">
              {itinerary.slice(0, 3).map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-teal-600">
                  <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-700 text-[10px] flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Guide info */}
        {tour.guideName && (
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-[10px]">
              {tour.guideName.charAt(0)}
            </div>
            مرشد: <span className="font-semibold text-teal-700">{tour.guideName}</span>
          </div>
        )}
        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div>
            {tour.originalPriceUSD && (
              <div className="text-xs text-gray-400 line-through">{formatPrice(Number(tour.originalPriceUSD))}</div>
            )}
            <div className="text-xl font-black" style={{ color: "#1B5E52", fontFamily: "'Tajawal', sans-serif" }}>
              {formatPrice(Number(tour.priceUSD))}
              <span className="text-xs font-normal text-gray-400"> /شخص</span>
            </div>
          </div>
          <Button
            onClick={() => onBook(tour)}
            className="gap-1.5 font-semibold rounded-xl px-4"
            style={{ background: "#1B5E52", color: "#fff" }}
          >
            احجز الجولة <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const DEMO_TOURS = [
  {
    id: 1, title: "Makkah Historical Ziyarat", subtitle: "Visit the most sacred sites in Makkah with expert Islamic scholar guide",
    location: "makkah", category: "religious", duration: 6, priceUSD: "319", isFeatured: true,
    maxGroupSize: 20, guideName: "Sheikh Abdullah Al-Rashid",
    highlights: ["Jabal al-Nour (Cave of Hira)", "Jabal Thawr", "Masjid al-Jinn", "Birthplace of Prophet Muhammad"],
    itinerary: ["Morning: Jabal al-Nour ascent", "Midday: Historical Old Makkah tour", "Afternoon: Jabal Thawr visit"],
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80",
  },
  {
    id: 2, title: "Madinah Ziyarat Full Day", subtitle: "Comprehensive tour of Madinah's sacred mosques and historical sites",
    location: "madinah", category: "religious", duration: 8, priceUSD: "356", isFeatured: true,
    maxGroupSize: 25, guideName: "Sheikh Omar Al-Farouq",
    highlights: ["Masjid Quba (first mosque in Islam)", "Masjid al-Qiblatayn", "Uhud Mountain", "Masjid al-Nabawi"],
    itinerary: ["Morning: Masjid Quba visit", "Midday: Uhud Mountain tour", "Afternoon: Madinah city sites"],
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    id: 3, title: "Battlefield of Badr", subtitle: "Journey to the historic site of the Battle of Badr with scholarly commentary",
    location: "madinah", category: "historical", duration: 10, priceUSD: "450", isUrgent: true,
    maxGroupSize: 30, guideName: "Dr. Khalid Al-Mansouri",
    highlights: ["Wells of Badr", "Graves of the Martyrs", "Historical battlefield tour", "Scholarly lecture"],
    itinerary: ["Early morning departure", "Arrive Badr: wells and graves", "Battlefield tour with lecture", "Return to Madinah"],
    imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80",
  },
  {
    id: 4, title: "Taif Mountain Excursion", subtitle: "Day trip to the beautiful mountain city of Taif, known for roses and honey",
    location: "makkah", category: "cultural", duration: 8, priceUSD: "281",
    maxGroupSize: 20,
    highlights: ["Al-Rudaf Park", "Rose gardens", "Local honey market", "Shafa and Al-Hada mountains"],
    itinerary: ["Drive to Taif via mountain road", "Rose garden visit", "Honey market tour", "Mountain viewpoints"],
    imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&q=80",
  },
  {
    id: 5, title: "Makkah & Madinah Combined", subtitle: "The ultimate Ziyarat experience covering both holy cities in 2 days",
    location: "both", category: "combined", duration: 48, priceUSD: "250", isFeatured: true,
    originalPriceUSD: "300", maxGroupSize: 15, guideName: "Sheikh Yusuf Al-Qaradawi",
    highlights: ["All major Makkah sites", "All major Madinah sites", "Expert scholar guide", "Luxury transport"],
    itinerary: ["Day 1: Full Makkah Ziyarat", "Day 2: Full Madinah Ziyarat"],
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80",
  },
  {
    id: 6, title: "Jeddah Heritage Walk", subtitle: "Explore the UNESCO-listed Al-Balad historic district of Jeddah",
    location: "jeddah", category: "cultural", duration: 4, priceUSD: "55",
    maxGroupSize: 20,
    highlights: ["Al-Balad UNESCO district", "Traditional coral houses", "Old souks", "Floating mosque"],
    itinerary: ["Al-Balad walking tour", "Traditional market visit", "Floating mosque", "Corniche walk"],
    imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80",
  },
];

export default function ToursPage() {
  useSEO(SEO_CONFIGS.tours);
  const [location, setLocation] = useState<"all" | "makkah" | "madinah" | "jeddah" | "other">("all");
  const [category, setCategory] = useState<"all" | "religious" | "historical" | "cultural" | "combined">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const { data: tours, isLoading } = trpc.tours.list.useQuery({
    location,
    category,
    search: debouncedSearch || undefined,
    limit: 20,
  });

  const handleSearch = (val: string) => {
    setSearch(val);
    setTimeout(() => setDebouncedSearch(val), 400);
  };

  const displayTours = tours && tours.length > 0 ? tours : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=85"
          alt="Ziyarat Tours"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--teal-900)]/80 to-[var(--teal-900)]/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16">
          <Badge className="mb-4 bg-[var(--gold)]/20 text-[var(--gold-light)] border-[var(--gold)]/30 text-xs tracking-widest uppercase px-4 py-1.5">
            Ziyarat & Tours Hub
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            Sacred Site Tours
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-xl">
            Guided religious and cultural tours of Makkah, Madinah, and beyond with expert Islamic scholars
          </p>
        </div>
      </div>

      <div className="container py-10">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search tours and Ziyarat..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <Select value={location} onValueChange={(v) => setLocation(v as any)}>
            <SelectTrigger className="w-full sm:w-44 bg-white">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="makkah">Makkah</SelectItem>
              <SelectItem value="madinah">Madinah</SelectItem>
              <SelectItem value="jeddah">Jeddah</SelectItem>
              <SelectItem value="other">Other Locations</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(v) => setCategory(v as any)}>
            <SelectTrigger className="w-full sm:w-44 bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="religious">Religious</SelectItem>
              <SelectItem value="historical">Historical</SelectItem>
              <SelectItem value="cultural">Cultural</SelectItem>
              <SelectItem value="combined">Combined</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Quick Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { value: "all", label: "All Tours", icon: "🌐" },
            { value: "religious", label: "Religious Ziyarat", icon: "🕌" },
            { value: "historical", label: "Historical Sites", icon: "🏛️" },
            { value: "cultural", label: "Cultural Tours", icon: "🎭" },
            { value: "combined", label: "Combined Packages", icon: "✨" },
          ].map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                category === c.value
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                  : "border-[var(--border)] bg-white text-[var(--teal-700)] hover:border-[var(--teal-300)]"
              }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="luxury-card overflow-hidden">
                <div className="h-52 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-5 shimmer rounded w-3/4" />
                  <div className="h-4 shimmer rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayTours ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTours.map((t: any) => (
              <TourCard key={t.id} tour={t} onBook={(t) => { setSelectedTour(t); setBookingOpen(true); }} />
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 text-sm">📋 Sample tours shown. Add real tours via the Admin Dashboard.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_TOURS
                .filter((t) => location === "all" || t.location === location || (location === "other" && t.location === "both"))
                .filter((t) => category === "all" || t.category === category)
                .map((t) => (
                  <TourCard key={t.id} tour={t} onBook={(t) => { setSelectedTour(t); setBookingOpen(true); }} />
                ))}
            </div>
          </div>
        )}
      </div>

      {selectedTour && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          service={selectedTour}
          serviceType="tour"
        />
      )}
      {/* Provider Tour Programs */}
      <ProviderProgramsSection
        programType="tour"
        titleAr="جولات وزيارات من مزودي الخدمات المعتمدين"
        title="Tours & Ziyarat from Certified Providers"
        maxItems={6}
      />
    </div>
  );
}
