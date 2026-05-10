import { Plane, Calendar } from "lucide-react";

export function IntlPackageCard({ pkg, onSelect }: { pkg: any; onSelect: () => void }) {
  const makkahPeriod = pkg.makkahPeriod ?? 0;
  const madinahPeriod = (pkg.duration ?? 21) - makkahPeriod;

  return (
    <div onClick={onSelect} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 hover:-translate-y-0.5">
      <div className="relative h-48 overflow-hidden">
        <img
          src={pkg.imageUrl || "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80"}
          alt={pkg.titleAr}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-1.5 flex-wrap">
          {pkg.isFeatured && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">مميز</span>}
          {pkg.packageLevel && <span className="bg-[#1B5E52]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pkg.packageLevel}</span>}
          {pkg.trainHaramain && <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🚄 قطار الحرمين</span>}
        </div>
        <div className="absolute bottom-3 right-3 text-white">
          <p className="font-bold text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>{pkg.titleAr}</p>
          <p className="text-xs text-white/80">{pkg.companyNameAr ?? pkg.companyName} · {pkg.countryAr}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500">
          {pkg.airline && <div className="flex items-center gap-1"><Plane className="w-3 h-3" />{pkg.airline}</div>}
          {pkg.departureDate && <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(pkg.departureDate).toLocaleDateString("ar-SA")}</div>}
          {makkahPeriod > 0 && <div className="flex items-center gap-1">🕌 مكة: {makkahPeriod} أيام</div>}
          {madinahPeriod > 0 && <div className="flex items-center gap-1">🌙 المدينة: {madinahPeriod} أيام</div>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            {pkg.priceSAR ? (
              <>
                <span className="text-xl font-bold text-[#1B5E52]">{Number(pkg.priceSAR).toLocaleString("ar-SA")}</span>
                <span className="text-xs text-gray-400"> ر.س / شخص</span>
              </>
            ) : <span className="text-sm text-gray-400">السعر عند الطلب</span>}
          </div>
          <span className="text-xs text-[#1B5E52]">{pkg.duration} يوم</span>
        </div>
      </div>
    </div>
  );
}
