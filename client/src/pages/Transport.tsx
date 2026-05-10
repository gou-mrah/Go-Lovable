import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import ProviderProgramsSection from "@/components/provider/ProviderProgramsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car, Users, MapPin, ArrowRight, Clock, Star,
  Shield, CheckCircle, Wifi, Snowflake, Phone,
} from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import { useCurrency } from "@/contexts/CurrencyContext";

const VEHICLE_ICONS: Record<string, string> = {
  sedan: "🚗",
  suv: "🚙",
  van: "🚐",
  minibus: "🚌",
  bus: "🚍",
  vip: "🚘",
};

function VehicleCard({ vehicle, onBook }: { vehicle: any; onBook: (v: any) => void }) {
  const features = Array.isArray(vehicle.features) ? vehicle.features : [];
  const { format: formatPrice } = useCurrency();

  const typeGradients: Record<string, string> = {
    sedan: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)",
    suv: "linear-gradient(135deg, #14532d 0%, #052e16 100%)",
    van: "linear-gradient(135deg, #581c87 0%, #3b0764 100%)",
    minibus: "linear-gradient(135deg, #7c2d12 0%, #431407 100%)",
    bus: "linear-gradient(135deg, #991b1b 0%, #450a0a 100%)",
    vip: "linear-gradient(135deg, #92400e 0%, #451a03 100%)",
  };
  const typeLabels: Record<string, string> = {
    sedan: "سيدان", suv: "دفع رباعي", van: "فان", minibus: "ميني باص", bus: "حافلة", vip: "VIP فاخر",
  };
  const headerBg = typeGradients[vehicle.type] || typeGradients.sedan;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col">
      {/* Image with gradient overlay */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <img
          src={vehicle.imageUrl || "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80"}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        {vehicle.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-white shadow-lg" style={{ background: "#C9A96E" }}>★ مميز</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
            {typeLabels[vehicle.type] || vehicle.type}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-2xl">{VEHICLE_ICONS[vehicle.type] || "🚗"}</span>
                <h3 className="font-bold text-white text-base leading-tight" style={{ fontFamily: "'Tajawal', sans-serif" }}>{vehicle.name}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-xl border border-white/20">
              <Users className="w-3.5 h-3.5" />
              <span className="font-bold">{vehicle.capacity}</span>
              <span className="text-white/70">راكب</span>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{vehicle.description}</p>
        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {features.slice(0, 4).map((f: string, i: number) => (
              <span key={i} className="flex items-center gap-1 text-[11px] bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-2.5 h-2.5 text-green-500" />{f}
              </span>
            ))}
          </div>
        )}
        {/* Routes */}
        {vehicle.routes && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
            <span className="line-clamp-1">{vehicle.routes}</span>
          </div>
        )}
        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div>
            <div className="text-xl font-black" style={{ color: "#1B5E52", fontFamily: "'Tajawal', sans-serif" }}>
              {formatPrice(Number(vehicle.pricePerTripUSD))}
            </div>
            <div className="text-xs text-gray-400">لكل رحلة</div>
          </div>
          <Button
            onClick={() => onBook(vehicle)}
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

const DEMO_VEHICLES = [
  {
    id: 1, name: "VIP Mercedes S-Class", type: "vip", capacity: 3, isFeatured: true,
    pricePerTripUSD: "563", description: "Premium executive sedan with chauffeur service. Perfect for VIP transfers.",
    features: ["Chauffeur", "WiFi", "Water Bottles", "AC", "Meet & Greet"],
    routes: "Airport ↔ Hotel, Makkah ↔ Madinah",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80",
  },
  {
    id: 2, name: "Toyota Land Cruiser SUV", type: "suv", capacity: 6, isFeatured: true,
    pricePerTripUSD: "356", description: "Spacious SUV ideal for families and small groups with ample luggage space.",
    features: ["AC", "Luggage Space", "Child Seat Available", "GPS"],
    routes: "Makkah, Madinah, Jeddah",
    imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
  },
  {
    id: 3, name: "Toyota Hiace Van", type: "van", capacity: 12,
    pricePerTripUSD: "450", description: "Comfortable van for medium groups. Ideal for Ziyarat tours and airport transfers.",
    features: ["AC", "Luggage Rack", "USB Charging", "Comfortable Seats"],
    routes: "All Holy Sites, Airport Transfers",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  },
  {
    id: 4, name: "Luxury Minibus 20-Seater", type: "minibus", capacity: 20,
    pricePerTripUSD: "825", description: "Modern minibus with reclining seats for group transfers and Ziyarat tours.",
    features: ["Reclining Seats", "AC", "PA System", "Luggage Hold"],
    routes: "Group Tours, Airport Transfers",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80",
  },
  {
    id: 5, name: "Modern Coach Bus", type: "bus", capacity: 50,
    pricePerTripUSD: "1425", description: "Full-size luxury coach for large groups. Perfect for Hajj and Umrah groups.",
    features: ["AC", "Reclining Seats", "PA System", "Toilet", "WiFi"],
    routes: "Makkah, Madinah, Mina, Arafat",
    imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80",
  },
  {
    id: 6, name: "Economy Sedan", type: "sedan", capacity: 4,
    pricePerTripUSD: "169", description: "Budget-friendly sedan for individuals and couples. Clean and reliable.",
    features: ["AC", "GPS", "Clean Interior"],
    routes: "Local transfers, Airport",
    imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80",
  },
];

export default function TransportPage() {
  useSEO(SEO_CONFIGS.transport);
  const [vehicleType, setVehicleType] = useState<"all" | "sedan" | "suv" | "van" | "minibus" | "bus" | "vip_car">("all");
  const [minCapacity, setMinCapacity] = useState<number | undefined>();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const { data: vehicles, isLoading } = trpc.transport.list.useQuery({
    type: vehicleType,
    minCapacity,
    limit: 20,
  });

  const displayVehicles = vehicles && vehicles.length > 0 ? vehicles : null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=85"
          alt="Transportation"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--teal-900)]/80 to-[var(--teal-900)]/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16">
          <Badge className="mb-4 bg-[var(--gold)]/20 text-[var(--gold-light)] border-[var(--gold)]/30 text-xs tracking-widest uppercase px-4 py-1.5">
            Transportation Services
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            Private Transportation
          </h1>
          <p className="text-white/70 text-base max-w-xl">
            VIP cars, family vans, and modern buses for all your travel needs in the Holy Cities
          </p>
        </div>
      </div>

      {/* Route Calculator */}
      <div className="bg-white border-b border-[var(--border)] shadow-sm">
        <div className="container py-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">From</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--teal-500)]" />
                <Input placeholder="Pickup location" className="pl-9" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">To</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--teal-500)]" />
                <Input placeholder="Drop-off location" className="pl-9" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1">Date & Time</Label>
              <Input type="datetime-local" />
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-[var(--primary)] text-white gap-2">
                <Car className="w-4 h-4" /> Find Vehicles
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Vehicle Type Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: "all", label: "All Vehicles", icon: "🚗" },
              { value: "vip_car", label: "VIP / Luxury", icon: "🚘" },
            { value: "sedan", label: "Sedan", icon: "🚗" },
            { value: "suv", label: "SUV", icon: "🚙" },
            { value: "van", label: "Van", icon: "🚐" },
            { value: "minibus", label: "Minibus", icon: "🚌" },
            { value: "bus", label: "Coach Bus", icon: "🚍" },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setVehicleType(t.value as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                vehicleType === t.value
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                  : "border-[var(--border)] bg-white text-[var(--teal-700)] hover:border-[var(--teal-300)]"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Capacity Filter */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          <span className="text-sm text-[var(--muted-foreground)]">Min. capacity:</span>
          {[undefined, 4, 6, 12, 20, 50].map((cap) => (
            <button
              key={String(cap)}
              onClick={() => setMinCapacity(cap)}
              className={`px-3 py-1 rounded-lg border text-sm transition-all ${
                minCapacity === cap
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--teal-700)] hover:border-[var(--teal-300)]"
              }`}
            >
              {cap ? `${cap}+` : "Any"}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="luxury-card overflow-hidden">
                <div className="h-48 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-5 shimmer rounded w-3/4" />
                  <div className="h-4 shimmer rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayVehicles ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayVehicles.map((v: any) => (
              <VehicleCard key={v.id} vehicle={v} onBook={(v) => { setSelectedVehicle(v); setBookingOpen(true); }} />
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 text-sm">📋 Sample vehicles shown. Add real vehicles via the Admin Dashboard.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_VEHICLES
                .filter((v: any) => vehicleType === "all" || v.type === vehicleType || (vehicleType === "vip_car" && v.type === "vip"))
                .filter((v: any) => !minCapacity || v.capacity >= minCapacity)
                .map((v) => (
                  <VehicleCard key={v.id} vehicle={v} onBook={(v) => { setSelectedVehicle(v); setBookingOpen(true); }} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Why Choose Our Transport */}
      <section className="py-12 bg-white border-t border-[var(--border)]">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Licensed Drivers", desc: "All drivers are licensed and background-checked" },
              { icon: Clock, title: "On-Time Guarantee", desc: "Punctual pickups with real-time tracking" },
              { icon: Snowflake, title: "AC Vehicles", desc: "All vehicles are fully air-conditioned" },
              { icon: Phone, title: "24/7 Support", desc: "Round-the-clock customer support" },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-[var(--teal-50)] flex items-center justify-center mx-auto mb-3">
                  <f.icon className="w-6 h-6 text-[var(--teal-600)]" />
                </div>
                <h3 className="font-semibold text-[var(--teal-800)] text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedVehicle && (
        <BookingModal
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          service={selectedVehicle}
          serviceType="transport"
        />
      )}
      {/* Provider Transport Programs */}
      <ProviderProgramsSection
        programType="transport"
        titleAr="خدمات النقل من مزودي الخدمات المعتمدين"
        title="Transport Services from Certified Providers"
        maxItems={6}
      />
    </div>
  );
}
