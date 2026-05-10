import { usdToSar } from "@shared/const";
import { useSearch, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Download, Printer, Share2, CheckCircle, Calendar,
  Users, Phone, Mail, Globe, QrCode, Shield,
  Loader2, Plane, Hotel, Car, FileText, Map, ShoppingBag,
  CreditCard, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

const BRAND_TEAL = "#1B5E52";
const BRAND_GOLD = "#C9A96E";
const BRAND_PEACH = "#F5EFE6";

// Service type config
const SERVICE_CONFIG: Record<string, { icon: React.ElementType; label: string; emoji: string; color: string; inclusions: string[] }> = {
  hajj: {
    icon: Globe,
    label: "حج",
    emoji: "🕋",
    color: "#1B5E52",
    inclusions: ["تذاكر طيران ذهاباً وإياباً", "إقامة فندقية 5 نجوم بمكة المكرمة", "إقامة فندقية بالمدينة المنورة", "نقل مكيف من وإلى المطار", "وجبات كاملة طوال الرحلة", "مرشد حج متخصص", "تأمين سفر شامل"],
  },
  umrah: {
    icon: Globe,
    label: "عمرة",
    emoji: "🕌",
    color: "#1B5E52",
    inclusions: ["تذاكر طيران ذهاباً وإياباً", "إقامة فندقية قريبة من الحرم", "نقل مكيف من وإلى المطار", "وجبات كاملة", "جولات زيارة مواقع دينية", "تأمين سفر شامل"],
  },
  hotel: {
    icon: Hotel,
    label: "فندق",
    emoji: "🏨",
    color: "#0369a1",
    inclusions: ["إقامة في الغرفة المحددة", "إفطار يومي مجاني", "خدمة الغرفة على مدار الساعة", "واي فاي مجاني", "موقف سيارات مجاني"],
  },
  hotels: {
    icon: Hotel,
    label: "فندق",
    emoji: "🏨",
    color: "#0369a1",
    inclusions: ["إقامة في الغرفة المحددة", "إفطار يومي مجاني", "خدمة الغرفة على مدار الساعة", "واي فاي مجاني", "موقف سيارات مجاني"],
  },
  flight: {
    icon: Plane,
    label: "رحلة جوية",
    emoji: "✈️",
    color: "#7c3aed",
    inclusions: ["تذكرة طيران ذهاباً وإياباً", "وجبة على متن الطائرة", "حقيبة أمتعة مسموح بها", "مقعد مؤكد"],
  },
  flights: {
    icon: Plane,
    label: "رحلة جوية",
    emoji: "✈️",
    color: "#7c3aed",
    inclusions: ["تذكرة طيران ذهاباً وإياباً", "وجبة على متن الطائرة", "حقيبة أمتعة مسموح بها", "مقعد مؤكد"],
  },
  visa: {
    icon: FileText,
    label: "تأشيرة",
    emoji: "📋",
    color: "#b45309",
    inclusions: ["معالجة طلب التأشيرة", "مراجعة المستندات", "متابعة الطلب حتى الاستلام", "ضمان استرداد في حالة الرفض"],
  },
  transport: {
    icon: Car,
    label: "مواصلات",
    emoji: "🚐",
    color: "#0f766e",
    inclusions: ["نقل مكيف من وإلى الوجهة", "سائق محترف ومرخص", "سيارة نظيفة ومريحة", "دعم على مدار الساعة"],
  },
  tour: {
    icon: Map,
    label: "جولة",
    emoji: "🗺️",
    color: "#0369a1",
    inclusions: ["مرشد سياحي متخصص", "نقل مريح بين المواقع", "وجبة خفيفة", "تصوير تذكاري"],
  },
  tours: {
    icon: Map,
    label: "جولة",
    emoji: "🗺️",
    color: "#0369a1",
    inclusions: ["مرشد سياحي متخصص", "نقل مريح بين المواقع", "وجبة خفيفة", "تصوير تذكاري"],
  },
  store: {
    icon: ShoppingBag,
    label: "طلب متجر",
    emoji: "🛍️",
    color: "#be185d",
    inclusions: ["منتجات أصلية مضمونة", "تغليف احترافي", "شحن مؤمّن", "ضمان الاسترجاع خلال 7 أيام"],
  },
};

// ─── ZATCA QR Component ──────────────────────────────────────────────────────
function ZatcaQRCode({ base64TLV }: { base64TLV: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(base64TLV, {
      width: 120,
      margin: 1,
      color: { dark: "#1B5E52", light: "#F5EFE6" },
    }).then(setQrDataUrl).catch(() => {});
  }, [base64TLV]);

  if (!qrDataUrl) return <div className="w-[120px] h-[120px] bg-gray-100 rounded-lg animate-pulse" />;
  return <img src={qrDataUrl} alt="ZATCA QR" width={120} height={120} className="rounded-lg border-2 border-teal-100" />;
}

export default function VoucherPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bookingRef = params.get("ref") || "";
  const paidParam = params.get("paid"); // "1" = paid, "0" = failed, null = unknown

  const { user } = useAuth();

  const { data: booking, isLoading } = trpc.bookings.getByRef.useQuery(
    { ref: bookingRef },
    { enabled: !!bookingRef }
  );

  // ZATCA invoice query (only for paid bookings and logged-in users)
  const isPaid = (booking as any)?.paymentStatus === "paid";
  const { data: invoice } = trpc.invoice.getInvoice.useQuery(
    { bookingNumber: bookingRef },
    { enabled: !!bookingRef && isPaid && !!user }
  );

  const [, navigate] = useLocation();

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: `قسيمة حجز Go Umrah - ${bookingRef}`, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("تم نسخ الرابط");
    }
  };

  const handlePayNow = () => {
    if (!bookingRef) return;
    navigate(`/payment/${bookingRef}`);
  };

  const verificationUrl = `${window.location.origin}/verify/${bookingRef}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f4f3" }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: BRAND_TEAL }} />
          <p className="text-gray-600" style={{ fontFamily: "Tajawal, sans-serif" }}>جاري تحميل قسيمة الحجز...</p>
        </div>
      </div>
    );
  }

  if (bookingRef && !booking && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f0f4f3" }}>
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl" style={{ fontFamily: "Tajawal, sans-serif" }} dir="rtl">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على الحجز</h2>
          <p className="text-gray-500 mb-4">رقم الحجز <span className="font-mono font-bold text-teal-700">{bookingRef}</span> غير موجود أو غير صحيح.</p>
          <p className="text-sm text-gray-400">للمساعدة: <a href="mailto:admin@go-umrah.com" className="text-teal-600 underline">admin@go-umrah.com</a></p>
          <a href="/" className="mt-6 inline-block px-6 py-2 rounded-lg text-white text-sm" style={{ background: BRAND_TEAL }}>العودة للرئيسية</a>
        </div>
      </div>
    );
  }

  const serviceType = (booking as any)?.serviceType || params.get("type") || "umrah";
  const svcConfig = SERVICE_CONFIG[serviceType] || SERVICE_CONFIG.umrah;
  const ServiceIcon = svcConfig.icon;

  const paymentStatus = (booking as any)?.paymentStatus || "unpaid";
  const paymentStatusLabels: Record<string, string> = {
    paid: "مدفوع",
    unpaid: "غير مدفوع",
    partial: "مدفوع جزئياً",
    refunded: "مسترد",
  };
  const paymentStatusColors: Record<string, string> = {
    paid: "#22c55e",
    unpaid: "#f59e0b",
    partial: "#3b82f6",
    refunded: "#8b5cf6",
  };

  const voucherData = {
    bookingRef: (booking as any)?.bookingNumber || bookingRef || "GU-DEMO-001",
    serviceName: (booking as any)?.serviceName || `باقة ${svcConfig.label} المميزة 2025`,
    customerName: (booking as any)?.guestName || "Ahmed Mohammed",
    customerNameAr: (booking as any)?.guestName || "أحمد محمد",
    customerEmail: (booking as any)?.guestEmail || "guest@example.com",
    customerPhone: (booking as any)?.guestPhone || "+966 5X XXX XXXX",
    guestCount: (booking as any)?.guestCount || 1,
    checkIn: (booking as any)?.checkIn ? new Date((booking as any).checkIn).toLocaleDateString("ar-SA") : "—",
    checkOut: (booking as any)?.checkOut ? new Date((booking as any).checkOut).toLocaleDateString("ar-SA") : "—",
    totalUSD: (booking as any)?.totalUSD || "—",
    status: (booking as any)?.status || "confirmed",
    createdAt: (booking as any)?.createdAt ? new Date((booking as any).createdAt).toLocaleDateString("ar-SA") : new Date().toLocaleDateString("ar-SA"),
    notes: (booking as any)?.notes || "",
  };

  const statusColors: Record<string, string> = {
    confirmed: "#22c55e",
    pending: "#f59e0b",
    cancelled: "#ef4444",
    completed: "#3b82f6",
    refunded: "#8b5cf6",
  };
  const statusLabels: Record<string, string> = {
    confirmed: "مؤكد",
    pending: "قيد المراجعة",
    cancelled: "ملغي",
    completed: "مكتمل",
    refunded: "مسترد",
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#f0f4f3" }}>
      {/* Action Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between gap-4 print:hidden">
        <h1 className="text-xl font-bold" style={{ color: BRAND_TEAL, fontFamily: "Tajawal, sans-serif" }}>
          قسيمة الحجز الرسمية
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" />
            مشاركة
          </Button>
          <Button size="sm" onClick={handlePrint} className="gap-2" style={{ background: BRAND_TEAL, color: "white" }}>
            <Printer className="w-4 h-4" />
            طباعة / PDF
          </Button>
        </div>
      </div>

      {/* Payment Status Banner */}
      {paidParam === "1" && (
        <div className="max-w-3xl mx-auto mb-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 print:hidden" dir="rtl">
          <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
          <div>
            <p className="font-bold text-green-800">تم الدفع بنجاح! 🎉</p>
            <p className="text-sm text-green-700">تم تأكيد حجزك وسيتواصل معك فريقنا قريباً.</p>
          </div>
        </div>
      )}
      {paidParam === "0" && (
        <div className="max-w-3xl mx-auto mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 print:hidden" dir="rtl">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-red-800">لم يكتمل الدفع</p>
            <p className="text-sm text-red-700">يمكنك المحاولة مرة أخرى أدناه.</p>
          </div>
        </div>
      )}
      {paymentStatus === "unpaid" && !paidParam && (
        <div className="max-w-3xl mx-auto mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 print:hidden" dir="rtl">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold text-amber-800">لم يتم الدفع بعد</p>
              <p className="text-sm text-amber-700">أكمل الدفع الآن لتأكيد حجزك فوراً.</p>
            </div>
          </div>
          <Button
            onClick={handlePayNow}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white"
          >
            💳 ادفع الآن
          </Button>
        </div>
      )}

      {/* Voucher Document */}
      <div
        id="voucher-document"
        className="max-w-3xl mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl print:shadow-none print:rounded-none"
        style={{ fontFamily: "Tajawal, sans-serif" }}
        dir="rtl"
      >
        {/* Header */}
        <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${BRAND_TEAL} 0%, #0f3d35 100%)` }}>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23C9A96E' stroke-width='0.9'><path d='M 100,54 A 55.744,55.744 0 0,0 146,100 A 55.744,55.744 0 0,0 100,146 A 55.744,55.744 0 0,0 54,100 A 55.744,55.744 0 0,0 100,54 Z'/></g></svg>")`,
          }} />
          <div className="relative z-10 p-8 flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white mb-1">جو عمرة</div>
              <div className="text-sm text-white/70">Go Umrah — Premium Islamic Travel</div>
              <div className="text-xs text-white/50 mt-1">go-umrah.com | +966 12 345 6789</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60 mb-1">رقم الحجز</div>
              <div className="text-2xl font-bold text-amber-300 tracking-wider">{voucherData.bookingRef}</div>
              <div className="flex gap-2 mt-2 justify-end">
                <Badge className="text-xs" style={{ background: statusColors[voucherData.status] || "#22c55e", color: "white" }}>
                  <CheckCircle className="w-3 h-3 ml-1" />
                  {statusLabels[voucherData.status] || voucherData.status}
                </Badge>
                <Badge className="text-xs" style={{ background: paymentStatusColors[paymentStatus] || "#f59e0b", color: "white" }}>
                  <CreditCard className="w-3 h-3 ml-1" />
                  {paymentStatusLabels[paymentStatus] || paymentStatus}
                </Badge>
              </div>
            </div>
          </div>
          <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${BRAND_GOLD}, transparent)` }} />
        </div>

        {/* Bismillah */}
        <div className="text-center py-4 border-b border-gray-100" style={{ background: BRAND_PEACH }}>
          <p className="text-lg text-gray-600">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
        </div>

        {/* Service Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: BRAND_PEACH }}>
              {svcConfig.emoji}
            </div>
            <div>
              <p className="text-xs text-gray-500">نوع الخدمة</p>
              <p className="font-bold text-lg" style={{ color: BRAND_TEAL }}>{voucherData.serviceName}</p>
              <Badge variant="outline" className="text-xs mt-0.5" style={{ borderColor: svcConfig.color, color: svcConfig.color }}>
                {svcConfig.label}
              </Badge>
            </div>
            <div className="mr-auto text-right">
              <p className="text-xs text-gray-500">تاريخ الإصدار</p>
              <p className="text-sm font-medium">{voucherData.createdAt}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: "تاريخ البدء", value: voucherData.checkIn },
              { icon: Calendar, label: "تاريخ الانتهاء", value: voucherData.checkOut },
              { icon: Users, label: "عدد الأشخاص", value: `${voucherData.guestCount} شخص` },
              { icon: Shield, label: "إجمالي المبلغ", value: voucherData.totalUSD !== "—" ? `﷼${Number(voucherData.totalUSD).toLocaleString("ar-SA")}` : "—" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <item.icon className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
                <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            بيانات العميل
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">الاسم</p>
              <p className="font-bold text-gray-800">{voucherData.customerNameAr}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
              <p className="font-bold text-gray-800 text-sm">{voucherData.customerEmail}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
              <p className="font-bold text-gray-800 font-mono text-sm" dir="ltr">{voucherData.customerPhone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">إجمالي المبلغ المدفوع</p>
              <p className="font-bold text-xl" style={{ color: BRAND_TEAL }}>
                {voucherData.totalUSD !== "—" ? `﷼${(usdToSar(Number(voucherData.totalUSD))).toLocaleString("ar-SA")} ريال سعودي` : "—"}
              </p>
            </div>
          </div>
          {voucherData.notes && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-xs text-amber-700 font-semibold mb-1">ملاحظات</p>
              <p className="text-sm text-amber-800">{voucherData.notes}</p>
            </div>
          )}
        </div>

        {/* Inclusions + QR */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex gap-6">
            <div className="flex-1">
              <h3 className="font-bold text-gray-700 mb-3">✅ الخدمات المشمولة</h3>
              <div className="space-y-2">
                {svcConfig.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <p className="text-xs text-gray-500 text-center">رمز التحقق</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verificationUrl)}&color=1B5E52&bgcolor=F5EFE6`}
                alt="QR Code"
                width={120}
                height={120}
                className="rounded-lg border-2 border-teal-100"
              />
              <p className="text-xs text-gray-400 text-center max-w-[120px]">امسح للتحقق من الحجز</p>
            </div>
          </div>
        </div>

        {/* ZATCA Invoice Section — shown only for paid bookings */}
        {invoice && (
          <div className="p-6 border-b border-gray-100 bg-emerald-50">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" />
              الفاتورة الضريبية الإلكترونية (ZATCA)
            </h3>
            <div className="flex gap-6 items-start">
              <div className="flex-1 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">رقم الفاتورة</p>
                    <p className="font-mono font-bold text-gray-800">{invoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">تاريخ الإصدار</p>
                    <p className="font-bold text-gray-800">{new Date(invoice.issueDate).toLocaleDateString("ar-SA")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">اسم المورد</p>
                    <p className="font-bold text-gray-800">{invoice.sellerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">الرقم الضريبي</p>
                    <p className="font-mono font-bold text-gray-800">{invoice.vatNumber}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-3 border border-emerald-200">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">المبلغ قبل الضريبة</span>
                    <span className="font-bold">{Number(invoice.amountBeforeVat).toLocaleString("ar-SA")} ريال</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">ضريبة القيمة المضافة (15%)</span>
                    <span className="font-bold text-amber-700">{Number(invoice.vatAmount).toLocaleString("ar-SA")} ريال</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-emerald-200 pt-2 mt-2">
                    <span style={{ color: BRAND_TEAL }}>الإجمالي شامل الضريبة</span>
                    <span style={{ color: BRAND_TEAL }}>{Number(invoice.totalWithVat).toLocaleString("ar-SA")} ريال</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 shrink-0">
                <p className="text-xs text-gray-500 text-center">رمز ZATCA</p>
                <ZatcaQRCode base64TLV={invoice.zatcaQR} />
                <p className="text-xs text-gray-400 text-center max-w-[120px]">امسح للتحقق من الفاتورة</p>
              </div>
            </div>
          </div>
        )}

        {/* Agent Info */}
        <div className="p-6 border-b border-gray-100" style={{ background: BRAND_PEACH }}>
          <h3 className="font-bold text-gray-700 mb-3">🏢 بيانات الوكالة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Globe className="w-4 h-4 text-teal-600" />
              <span>Go Umrah Travel Agency</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-teal-600" />
              <span dir="ltr">+966 12 345 6789</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-teal-600" />
              <span>bookings@go-umrah.com</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-xs text-gray-400 border-t border-gray-100">
          <p>هذه القسيمة وثيقة رسمية صادرة من جو عمرة للسياحة والسفر</p>
          <p className="mt-1">للتحقق من صحة الحجز: {verificationUrl}</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Shield className="w-3 h-3 text-green-500" />
            <span className="text-green-600">محمي ومشفر — Go Umrah © {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          #voucher-document { box-shadow: none !important; border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
