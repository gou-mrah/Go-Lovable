import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Home } from "lucide-react";

export function DomesticPackageCard({ pkg, accentColor }: { pkg: any; accentColor: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* البطاقة */}
      <div
        onClick={() => setOpen(true)}
        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer hover:-translate-y-0.5"
      >
        {/* الصورة أو الخلفية اللونية */}
        <div className="relative h-40 overflow-hidden">
          {pkg.imageUrl ? (
            <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)` }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <Home className="w-24 h-24 text-white" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* شارة الحالة */}
          <div className="absolute top-3 right-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${pkg.isAvailable ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
              {pkg.isAvailable ? "متاحة" : "غير متاحة"}
            </span>
          </div>

          {/* رقم الباقة */}
          {pkg.packageNumber && (
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              باقة #{pkg.packageNumber}
            </div>
          )}
        </div>

        {/* التفاصيل */}
        <div className="p-4">
          <h4 className="font-bold mb-2" style={{ color: accentColor, fontFamily: "'Tajawal', sans-serif" }}>
            {pkg.title}
          </h4>
          {pkg.description && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{pkg.description}</p>
          )}

          {/* نطاق السعر */}
          {(pkg.priceFromSAR || pkg.priceToSAR) && (
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-gray-400 mb-0.5">نطاق السعر</p>
              <p className="font-bold text-sm" style={{ color: accentColor }}>
                {pkg.priceFromSAR ? Number(pkg.priceFromSAR).toLocaleString("ar-SA") : "—"}
                {" — "}
                {pkg.priceToSAR ? Number(pkg.priceToSAR).toLocaleString("ar-SA") : "—"}
                <span className="text-xs font-normal"> ر.س</span>
              </p>
            </div>
          )}

          <p className="text-xs text-center mt-3" style={{ color: accentColor }}>
            اضغط لعرض التفاصيل الكاملة
          </p>
        </div>
      </div>

      {/* Dialog التفاصيل */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle style={{ color: accentColor, fontFamily: "'Tajawal', sans-serif" }}>
              {pkg.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* الوصف */}
            {pkg.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">الوصف</p>
                <p className="text-sm text-gray-700">{pkg.description}</p>
              </div>
            )}
            {/* سكن منى */}
            {pkg.minyaSleeping && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-600 mb-1">🏕️ سكن منى</p>
                <p className="text-sm text-blue-800">{pkg.minyaSleeping}</p>
              </div>
            )}
            {/* سكن عرفة */}
            {pkg.arafatSleeping && (
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-green-600 mb-1">⛺ سكن عرفة</p>
                <p className="text-sm text-green-800">{pkg.arafatSleeping}</p>
              </div>
            )}
            {/* السعر */}
            {(pkg.priceFromSAR || pkg.priceToSAR) && (
              <div className="border rounded-xl p-3 text-center" style={{ borderColor: accentColor + "40" }}>
                <p className="text-xs text-gray-400 mb-1">نطاق السعر</p>
                <p className="text-lg font-bold" style={{ color: accentColor }}>
                  {pkg.priceFromSAR ? Number(pkg.priceFromSAR).toLocaleString("ar-SA") : "—"}
                  {" — "}
                  {pkg.priceToSAR ? Number(pkg.priceToSAR).toLocaleString("ar-SA") : "—"}
                  <span className="text-sm font-normal"> ر.س</span>
                </p>
              </div>
            )}
            {/* ملاحظات */}
            {pkg.packageNotes && (
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-600 mb-1">📝 ملاحظات</p>
                <p className="text-sm text-amber-800">{pkg.packageNotes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
