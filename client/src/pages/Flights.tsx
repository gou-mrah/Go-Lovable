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
  Plane, Clock, ArrowRight, ArrowLeftRight, Luggage, Users,
  Search, Star, ChevronRight, Wifi,
} from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";

function FlightCard({ flight, onBook }: { flight: any; onBook: (f: any) => void }) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const deptTime = flight.departureTime ? new Date(flight.departureTime) : null;
  const arrTime = flight.arrivalTime ? new Date(flight.arrivalTime) : null;

  const formatTime = (d: Date | null) => d ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--";
  const formatDuration = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

  const cabinGradients: Record<string, string> = {
    economy: "linear-gradient(135deg, #1B5E52 0%, #0d3d3d 100%)",
    business: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)",
    first: "linear-gradient(135deg, #92400e 0%, #78350f 100%)",
  };
  const cabinLabels: Record<string, string> = {
    economy: "اقتصادي",
    business: "أعمال",
    first: "درجة أولى",
  };
  const headerBg = cabinGradients[flight.cabinClass] || cabinGradients.economy;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1">
      {/* Gradient Header */}
      <div className="p-5 relative overflow-hidden" style={{ background: headerBg }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>{flight.airline}</div>
              <div className="text-white/60 text-xs">{flight.flightNumber}</div>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 text-white border border-white/25">
            {cabinLabels[flight.cabinClass] || flight.cabinClass}
          </span>
        </div>
        {/* Route */}
        <div className="relative flex items-center gap-2">
          <div className="text-center flex-1">
            <div className="text-3xl font-black text-white" style={{ fontFamily: "'Tajawal', sans-serif" }}>{formatTime(deptTime)}</div>
            <div className="text-white font-bold text-sm mt-0.5">{flight.origin}</div>
            <div className="text-white/55 text-xs">{flight.originCity || ""}</div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <div className="text-white/60 text-xs font-medium">{formatDuration(flight.duration)}</div>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-white/30" />
              <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                <Plane className="w-4 h-4 text-white rotate-90" />
              </div>
              <div className="flex-1 h-px bg-white/30" />
            </div>
            <div className="text-white/60 text-xs">
              {flight.stops === 0 ? "مباشر" : `${flight.stops} توقف`}
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="text-3xl font-black text-white" style={{ fontFamily: "'Tajawal', sans-serif" }}>{formatTime(arrTime)}</div>
            <div className="text-white font-bold text-sm mt-0.5">{flight.destination}</div>
            <div className="text-white/55 text-xs">{flight.destinationCity || ""}</div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {flight.baggage && (
            <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              <Luggage className="w-3 h-3" />{flight.baggage}
            </span>
          )}
          {flight.seatsAvailable !== null && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-semibold ${
              flight.seatsAvailable < 5 ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
            }`}>
              <Users className="w-3 h-3" />{flight.seatsAvailable} {t("common.available")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xl font-black" style={{ color: "#1B5E52", fontFamily: "'Tajawal', sans-serif" }}>
              {format(Number(flight.priceUSD))}
            </div>
            <div className="text-xs text-gray-400">{t("common.perPerson")}</div>
          </div>
          <Button
            onClick={() => onBook(flight)}
            size="sm"
            className="font-bold gap-1.5 rounded-xl px-4"
            style={{ background: "#1B5E52", color: "#fff" }}
          >
            {t("common.bookNow")} <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const DEMO_FLIGHTS = [
  {
    id: 1, airline: "Saudi Arabian Airlines", airlineCode: "SV", flightNumber: "SV-301",
    origin: "LHR", originCity: "London", destination: "JED", destinationCity: "Jeddah",
    departureTime: new Date("2025-06-01T08:00:00"), arrivalTime: new Date("2025-06-01T19:30:00"),
    duration: 450, stops: 0, cabinClass: "economy", priceUSD: "2325", seatsAvailable: 42, baggage: "23kg",
  },
  {
    id: 2, airline: "Emirates", airlineCode: "EK", flightNumber: "EK-009",
    origin: "DXB", originCity: "Dubai", destination: "MED", destinationCity: "Madinah",
    departureTime: new Date("2025-06-01T14:00:00"), arrivalTime: new Date("2025-06-01T16:30:00"),
    duration: 150, stops: 0, cabinClass: "business", priceUSD: "6938", seatsAvailable: 8, baggage: "30kg",
  },
  {
    id: 3, airline: "Qatar Airways", airlineCode: "QR", flightNumber: "QR-041",
    origin: "DOH", originCity: "Doha", destination: "JED", destinationCity: "Jeddah",
    departureTime: new Date("2025-06-02T06:30:00"), arrivalTime: new Date("2025-06-02T08:45:00"),
    duration: 135, stops: 0, cabinClass: "economy", priceUSD: "1800", seatsAvailable: 65, baggage: "23kg",
  },
  {
    id: 4, airline: "Turkish Airlines", airlineCode: "TK", flightNumber: "TK-780",
    origin: "IST", originCity: "Istanbul", destination: "MED", destinationCity: "Madinah",
    departureTime: new Date("2025-06-03T10:15:00"), arrivalTime: new Date("2025-06-03T14:45:00"),
    duration: 270, stops: 0, cabinClass: "economy", priceUSD: "2025", seatsAvailable: 28, baggage: "23kg",
  },
  {
    id: 5, airline: "Etihad Airways", airlineCode: "EY", flightNumber: "EY-101",
    origin: "AUH", originCity: "Abu Dhabi", destination: "JED", destinationCity: "Jeddah",
    departureTime: new Date("2025-06-04T07:00:00"), arrivalTime: new Date("2025-06-04T09:15:00"),
    duration: 135, stops: 0, cabinClass: "first", priceUSD: "12000", seatsAvailable: 4, baggage: "40kg",
  },
  {
    id: 6, airline: "flydubai", airlineCode: "FZ", flightNumber: "FZ-1701",
    origin: "DXB", originCity: "Dubai", destination: "JED", destinationCity: "Jeddah",
    departureTime: new Date("2025-06-05T22:00:00"), arrivalTime: new Date("2025-06-06T00:30:00"),
    duration: 150, stops: 0, cabinClass: "economy", priceUSD: "1163", seatsAvailable: 90, baggage: "20kg",
  },
];

export default function FlightsPage() {
  useSEO(SEO_CONFIGS.flights);
  const { t } = useLanguage();
  const { format } = useCurrency();
  const [tripType, setTripType] = useState<"one-way" | "round-trip" | "multi-city">("round-trip");
  const [cabinClass, setCabinClass] = useState<"economy" | "business" | "first" | "all">("all");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const { data: flights, isLoading } = trpc.flights.list.useQuery({
    origin: origin || undefined,
    destination: destination || undefined,
    cabinClass,
    limit: 20,
  });

  const displayFlights = flights && flights.length > 0 ? flights : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="islamic-pattern bg-[var(--teal-900)] py-16 pt-28">
        <div className="container text-center">
          <Badge className="mb-4 bg-[var(--gold)]/20 text-[var(--gold-light)] border-[var(--gold)]/30 text-xs tracking-widest uppercase px-4 py-1.5">
            {t("flights.title")}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            {t("flights.title")}
          </h1>
          <p className="text-white/70 text-base max-w-xl mx-auto mb-8">
            {t("flights.subtitle")}
          </p>

          {/* Trip Type Selector */}
          <div className="flex justify-center gap-2 mb-6">
            {[
              { value: "round-trip", label: t("flights.return").includes("Return") ? "Round Trip" : t("flights.return") },
              { value: "one-way", label: t("flights.depart") },
              { value: "multi-city", label: "Multi-City" },
            ].map((trip) => (
              <button
                key={trip.value}
                onClick={() => setTripType(trip.value as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tripType === trip.value
                    ? "bg-white text-[var(--teal-800)] shadow-md"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {trip.label}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative md:col-span-1">
                <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">{t("flights.from")}</label>
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--teal-500)]" />
                  <Input
                    placeholder="City or airport"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex items-end justify-center md:col-span-1">
                <button
                  onClick={() => { const tmp = origin; setOrigin(destination); setDestination(tmp); }}
                  className="p-2 rounded-full border border-[var(--border)] hover:bg-[var(--teal-50)] transition-colors mb-1"
                >
                  <ArrowLeftRight className="w-4 h-4 text-[var(--teal-600)]" />
                </button>
              </div>

              <div className="relative md:col-span-1">
                <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">{t("flights.to")}</label>
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--teal-500)] rotate-90" />
                  <Input
                    placeholder="Jeddah, Madinah..."
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">{t("flights.depart")}</label>
                <Input type="date" />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">{t("flights.return")}</label>
                <Input type="date" disabled={tripType === "one-way"} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-3 pt-3 border-t border-[var(--border)]">
              <Select value={cabinClass} onValueChange={(v) => setCabinClass(v as any)}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Cabin Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.filter")} {t("flights.cabin")}</SelectItem>
                  <SelectItem value="economy">{t("flights.economy")}</SelectItem>
                  <SelectItem value="business">{t("flights.business")}</SelectItem>
                  <SelectItem value="first">{t("flights.first")}</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="1">
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Passengers" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} Adult{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button className="flex-1 bg-[var(--primary)] text-white font-semibold gap-2">
                <Search className="w-4 h-4" /> {t("common.search")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container py-8">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <span className="text-sm font-medium text-[var(--muted-foreground)] self-center">{t("common.filter")}:</span>
          {["Direct Only", "Morning Flights", "Evening Flights", "Under $500", "Under $1000"].map((f) => (
            <button
              key={f}
              className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-white text-sm text-[var(--teal-700)] hover:border-[var(--teal-300)] hover:bg-[var(--teal-50)] transition-colors"
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="luxury-card p-5">
                <div className="flex gap-4">
                  <div className="w-40 h-12 shimmer rounded" />
                  <div className="flex-1 h-12 shimmer rounded" />
                  <div className="w-36 h-12 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : displayFlights ? (
          <>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              <strong>{displayFlights.length}</strong> {t("flights.title").toLowerCase()}
            </p>
            <div className="space-y-4">
              {displayFlights.map((f: any) => (
                <FlightCard key={f.id} flight={f} onBook={(f) => { setSelectedFlight(f); setBookingOpen(true); }} />
              ))}
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 text-sm">📋 {t("common.noResults")} — {t("admin.dashboard")}</span>
            </div>
            <div className="space-y-4">
              {DEMO_FLIGHTS.map((f) => (
                <FlightCard key={f.id} flight={f} onBook={(f) => { setSelectedFlight(f); setBookingOpen(true); }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedFlight && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          service={{ ...selectedFlight, title: `${selectedFlight.airline} ${selectedFlight.flightNumber}` }}
          serviceType="flight"
        />
      )}
      {/* Provider Flight Programs */}
      <ProviderProgramsSection
        programType="flight"
        titleAr="رحلات جوية من مزودي الخدمات المعتمدين"
        title="Flights from Certified Providers"
        maxItems={6}
      />
    </div>
  );
}
