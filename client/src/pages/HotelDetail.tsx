import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Clock, MapPin, Star } from "lucide-react";

// ─── TBO Holidays API — قيد التطوير ──────────────────────────────────────────
// سيتم ربط TBO Holidays API هنا بعد الحصول على بيانات الاعتماد
// ─────────────────────────────────────────────────────────────────────────────

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16" dir="rtl">
      <div className="max-w-lg w-full text-center">

        <div className="w-20 h-20 bg-[#1B5E52]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-[#1B5E52]" />
        </div>

        <h1
          className="text-2xl font-bold text-[#1B5E52] mb-3"
          style={{ fontFamily: "'Tajawal', sans-serif" }}
        >
          تفاصيل الفندق
        </h1>

        {id && (
          <p className="text-gray-400 text-sm mb-4 font-mono bg-gray-100 rounded-lg px-3 py-1.5 inline-block">
            معرف الفندق: {id}
          </p>
        )}

        <div className="bg-gradient-to-br from-[#1B5E52] to-[#2d8a7a] rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-lg" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              قادم قريباً
            </span>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            نعمل على ربط منظومة حجز الفنادق عبر TBO Holidays API لتوفير أسعار حية وتأكيد فوري.
            سيتوفر هذا القسم قريباً.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: "📍", label: "موقع مميز", sub: "قريب من الحرم" },
            { icon: "⭐", label: "تقييمات حقيقية", sub: "من المعتمرين" },
            { icon: "⚡", label: "تأكيد فوري", sub: "24/7" },
          ].map(f => (
            <div key={f.label} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="font-medium text-xs text-gray-700">{f.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{f.sub}</p>
            </div>
          ))}
        </div>

        <Button
          onClick={() => navigate("/hotels")}
          style={{ background: "#1B5E52", color: "white" }}
          className="gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لقائمة الفنادق
        </Button>
      </div>
    </div>
  );
}
