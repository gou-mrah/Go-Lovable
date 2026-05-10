import { useSearch, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, MapPin, Clock, Star, SlidersHorizontal } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  all: "الكل", hajj: "الحج", umrah: "العمرة", hotel: "الفنادق", tour: "الجولات",
};

function ResultCard({ item, type }: { item: any; type: string }) {
  const [, navigate] = useLocation();
  const routeMap: Record<string, string> = {
    hajj: "hajj", umrah: "umrah", hotel: "hotels", tour: "tours",
  };
  const route = routeMap[type] ?? type;
  const price = item.priceUSD ?? item.pricePerNightUSD ?? "—";
  const title = item.title ?? item.name ?? "—";
  const subtitle = item.subtitle ?? item.description ?? "";
  const image = item.imageUrl;
  const duration = item.duration;
  const starRating = item.hotelStarRating ?? item.starRating;

  return (
    <div
      onClick={() => navigate(`/${route}/${item.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      {image ? (
        <img src={image} alt={title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-4xl">
          {type === "hajj" ? "🕋" : type === "umrah" ? "🕌" : type === "hotel" ? "🏨" : "🗺️"}
        </div>
      )}
      <div className="p-4" dir="rtl">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">{title}</h3>
          <Badge variant="outline" className="text-xs shrink-0">{TYPE_LABELS[type] ?? type}</Badge>
        </div>
        {subtitle && <p className="text-gray-500 text-xs line-clamp-2 mb-2">{subtitle}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration} أيام</span>}
          {starRating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{starRating}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-teal-800 font-bold">${parseFloat(price).toLocaleString()}</span>
          <Button size="sm" className="text-xs h-7 px-3" style={{ background: "#1B5E52", color: "white" }}>
            احجز الآن
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialQuery = params.get("q") ?? "";
  const initialType = (params.get("type") ?? "all") as "all" | "hajj" | "umrah" | "hotel" | "tour";

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState(initialType);
  const [, navigate] = useLocation();

  const { data, isLoading } = trpc.search.search.useQuery(
    { query: query || " ", type: activeType, limit: 30 },
    { enabled: true }
  );

  const allResults = useMemo(() => {
    if (!data) return [];
    return [
      ...(data.hajj ?? []),
      ...(data.umrah ?? []),
      ...(data.hotels ?? []),
      ...(data.tours ?? []),
    ];
  }, [data]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}&type=${activeType}`);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6]" dir="rtl">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن باقات الحج والعمرة والفنادق..."
                className="pr-10 text-right"
              />
            </div>
            <Button type="submit" style={{ background: "#1B5E52", color: "white" }}>بحث</Button>
          </form>

          {/* Type Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveType(key as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeType === key
                    ? "bg-teal-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
          </div>
        ) : allResults.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج</h2>
            <p className="text-gray-500">جرّب كلمات بحث مختلفة أو تصفّح الفئات</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 text-sm">
                <span className="font-bold text-teal-800">{allResults.length}</span> نتيجة
                {query && <> لـ "<span className="font-medium">{query}</span>"</>}
              </p>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <SlidersHorizontal className="w-4 h-4" /> تصفية
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allResults.map((item: any) => (
                <ResultCard key={`${item._type}-${item.id}`} item={item} type={item._type} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
