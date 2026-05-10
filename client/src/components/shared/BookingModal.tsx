import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle, Loader2, QrCode, FileText, ScanLine, ChevronDown, ChevronUp,
} from "lucide-react";
import PassportUpload from "./PassportUpload";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usdToSar } from "@shared/const";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  service: {
    id: number;
    title?: string;
    name?: string;
    priceUSD?: string;
    pricePerNightUSD?: string;
    pricePerTripUSD?: string;
  };
  serviceType: "hajj" | "umrah" | "hotel" | "flight" | "visa" | "transport" | "tour";
  requiresPassport?: boolean;
}

interface PassportData {
  passportNumber: string | null;
  fullName: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  expiryDate: string | null;
  gender: string | null;
  placeOfBirth: string | null;
  mrz: string | null;
}

export default function BookingModal({ open, onClose, service, serviceType, requiresPassport = false }: BookingModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [bookingNumber, setBookingNumber] = useState<string>("");
  const [showPassport, setShowPassport] = useState(requiresPassport);
  const [passportData, setPassportData] = useState<PassportData | null>(null);
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestCount: "1",
    checkIn: "",
    checkOut: "",
    notes: "",
    nationality: "",
    passportNumber: "",
  });

  const { format: formatPrice } = useCurrency();
  const { isRTL } = useLanguage();
  const price = service.priceUSD || service.pricePerNightUSD || service.pricePerTripUSD || "0";
  const guestCountNum = parseInt(form.guestCount || "1");
  const baseTotal = Number(price) * guestCountNum;

  // Dynamic pricing calculation
  const { data: pricingResult } = trpc.dynamicPricing.calculate.useQuery(
    {
      basePrice: baseTotal,
      serviceType: (serviceType === "visa" || serviceType === "transport" || serviceType === "tour" ? "all" : serviceType) as "hajj" | "umrah" | "hotel" | "flight" | "all",
      groupSize: guestCountNum,
    },
    { enabled: baseTotal > 0 }
  );
  const discounts = pricingResult?.discounts ?? [];

  const [, navigate] = useLocation();
  const [couponCode, setCouponCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ discount: number; discountType: string; code: string } | null>(null);
  const [couponError, setCouponError] = useState("");

  const { refetch: fetchCoupon, isFetching: couponLoading, data: couponResult, error: couponQueryError } = trpc.coupon.validate.useQuery(
    { code: couponInput || "_", serviceType, totalUSD: pricingResult?.finalPrice ?? baseTotal },
    { enabled: false, retry: false }
  );

  // Handle coupon query result
  useEffect(() => {
    if (!couponInput) return;
    if (couponResult) {
      setCouponApplied({ discount: couponResult.discount, discountType: couponResult.discountType, code: couponInput });
      setCouponError("");
      toast.success("تم تطبيق الكوبون");
    }
    if (couponQueryError) {
      setCouponApplied(null);
      setCouponError((couponQueryError as any).message || "كوبون غير صالح");
    }
  }, [couponResult, couponQueryError]);

  const priceBeforeCoupon = pricingResult?.finalPrice ?? baseTotal;
  const couponDiscount = couponApplied
    ? couponApplied.discountType === "percent"
      ? priceBeforeCoupon * couponApplied.discount / 100
      : Math.min(couponApplied.discount, priceBeforeCoupon)
    : 0;
  const totalPrice = Math.max(0, priceBeforeCoupon - couponDiscount);

  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: (data) => {
      setBookingNumber(data.bookingNumber);
      setStep("success");
      toast.success(`تم تأكيد الحجز! الرقم المرجعي: ${data.bookingNumber}`);
    },
    onError: (err) => {
      toast.error(err.message || "فشل الحجز. يرجى المحاولة مرة أخرى.");
    },
  });

  const handlePayNow = () => {
    if (!bookingNumber) return;
    navigate(`/payment/${bookingNumber}`);
  };

  const serviceName = service.title || service.name || "Service";

  const handlePassportExtracted = (data: PassportData) => {
    setPassportData(data);
    setForm(prev => ({
      ...prev,
      guestName: data.fullName || prev.guestName,
      nationality: data.nationality || prev.nationality,
      passportNumber: data.passportNumber || prev.passportNumber,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createBooking.isPending) return; // prevent double submit
    if (!form.guestName.trim()) {
      toast.error("يرجى إدخال اسمك");
      return;
    }
    if (form.guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) {
      toast.error("بريد إلكتروني غير صالح");
      return;
    }
    if (form.guestPhone && !/^[+\d\s\-()]{5,30}$/.test(form.guestPhone)) {
      toast.error("رقم هاتف غير صالح");
      return;
    }
    const guestNum = parseInt(form.guestCount);
    if (!Number.isFinite(guestNum) || guestNum < 1 || guestNum > 50) {
      toast.error("عدد المسافرين يجب أن يكون بين 1 و 50");
      return;
    }
    if (serviceType === "hotel" && (!form.checkIn || !form.checkOut)) {
      toast.error("يرجى تحديد تاريخي الوصول والمغادرة");
      return;
    }
    if (serviceType === "hotel" && form.checkIn && form.checkOut &&
        new Date(form.checkOut) <= new Date(form.checkIn)) {
      toast.error("تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول");
      return;
    }
    if ((serviceType === "hajj" || serviceType === "umrah") && !form.passportNumber.trim()) {
      toast.error("رقم جواز السفر مطلوب لرحلات الحج والعمرة");
      return;
    }
    createBooking.mutate({
      serviceType,
      serviceId: service.id,
      serviceName,
      guestName: form.guestName.trim(),
      guestEmail: form.guestEmail.trim() || undefined,
      guestPhone: form.guestPhone.trim() || undefined,
      guestCount: guestNum,
      checkIn: form.checkIn || undefined,
      checkOut: form.checkOut || undefined,
      // NOTE: server now computes total from authoritative DB price.
      // Client-side `totalPrice` is for display only and is no longer sent.
      couponCode: couponApplied?.code,
      notes: [
        form.notes,
        form.nationality ? `الجنسية: ${form.nationality}` : "",
        form.passportNumber ? `رقم الجواز: ${form.passportNumber}` : "",
        passportData ? "✓ تم التحقق من جواز السفر" : "",
      ].filter(Boolean).join(" | ") || undefined,
    });
  };

  const handleClose = () => {
    setStep("form");
    setBookingNumber("");
    setPassportData(null);
    setShowPassport(requiresPassport);
    setForm({
      guestName: "", guestEmail: "", guestPhone: "",
      guestCount: "1", checkIn: "", checkOut: "",
      notes: "", nationality: "", passportNumber: "",
    });
    onClose();
  };

  const voucherUrl = bookingNumber
    ? `/voucher?ref=${bookingNumber}&type=${serviceType}&name=${encodeURIComponent(serviceName)}&price=${totalPrice}`
    : "";
  const qrUrl = bookingNumber
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + voucherUrl)}&color=1B5E52&bgcolor=F5EFE6`
    : "";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={`sm:max-w-lg max-h-[90vh] overflow-y-auto ${isRTL ? "text-right" : "text-left"}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {step === "success" ? (
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--teal-800)] mb-1">تم تأكيد الحجز!</h3>
            <p className="text-[var(--muted-foreground)] text-sm mb-2">رقم الحجز المرجعي:</p>
            <div className="inline-flex items-center gap-2 bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-xl px-4 py-2 mb-4">
              <span className="font-mono font-bold text-[var(--teal-800)] text-lg tracking-wider">{bookingNumber}</span>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">مؤكد</Badge>
            </div>
            <p className="text-[var(--muted-foreground)] text-sm mb-6">
              تم حجز <strong>{serviceName}</strong> بنجاح. سيتواصل معك فريقنا خلال 24 ساعة.
            </p>
            {/* QR Code */}
            {qrUrl && (
              <div className="bg-[var(--teal-50)] rounded-2xl p-4 mb-4 border border-[var(--teal-200)]">
                <p className="text-xs text-[var(--teal-700)] font-semibold mb-3 flex items-center justify-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  رمز QR للقسيمة
                </p>
                <img src={qrUrl} alt="QR Code" className="w-32 h-32 mx-auto rounded-xl border-2 border-[var(--teal-200)]" />
                <p className="text-xs text-[var(--muted-foreground)] mt-2">امسح الرمز للوصول إلى قسيمتك</p>
              </div>
            )}
            {/* Payment CTA */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-center">
              <p className="text-amber-800 text-sm font-semibold mb-2">⚡ أكمل الدفع الآن لتأكيد حجزك فوراً</p>
              <Button
                onClick={handlePayNow}
                className="w-full bg-[var(--primary)] hover:bg-[var(--teal-600)] text-white font-bold"
              >
                {false ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />جاري التحويل...</>
                ) : (
                  <>💳 ادفع الآن ({usdToSar(totalPrice).toFixed(0)} ريال)</>
                )}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => window.open(voucherUrl, "_blank")}
                variant="outline"
                className="flex-1 border-[var(--teal-300)] text-[var(--teal-700)]"
              >
                <FileText className="w-4 h-4 mr-2" />
                عرض القسيمة
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-[var(--teal-300)] text-[var(--teal-700)]"
              >
                إغلاق
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[var(--teal-800)] text-lg">حجز: {serviceName}</DialogTitle>
              <DialogDescription className="text-sm">
                أدخل بياناتك لإتمام الحجز. سيتم التأكيد خلال 24 ساعة.
              </DialogDescription>
            </DialogHeader>

            {/* Price Summary */}
            <div className="bg-[var(--teal-50)] rounded-xl p-4 border border-[var(--teal-200)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--teal-700)]">السعر للشخص</span>
                <span className="font-bold text-[var(--teal-800)]">{formatPrice(Number(price))}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Passport OCR Section (Hajj/Umrah only) */}
              {(serviceType === "hajj" || serviceType === "umrah") && (
                <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowPassport(!showPassport)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[var(--teal-50)] hover:bg-[var(--teal-100)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ScanLine className="w-4 h-4 text-[var(--teal-600)]" />
                      <span className="text-sm font-semibold text-[var(--teal-800)]">مسح جواز السفر (اختياري)</span>
                      {passportData && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">✓ تم المسح</Badge>
                      )}
                    </div>
                    {showPassport ? <ChevronUp className="w-4 h-4 text-[var(--teal-600)]" /> : <ChevronDown className="w-4 h-4 text-[var(--teal-600)]" />}
                  </button>
                  {showPassport && (
                    <div className="p-4">
                      <p className="text-xs text-[var(--muted-foreground)] mb-3">
                        ارفع صورة جواز سفرك وسيقوم الذكاء الاصطناعي باستخراج البيانات تلقائياً
                      </p>
                      <PassportUpload onExtracted={handlePassportExtracted} />
                    </div>
                  )}
                </div>
              )}

              {/* Full Name */}
              <div>
                <Label htmlFor="guestName" className="text-sm font-medium">الاسم الكامل *</Label>
                <Input
                  id="guestName"
                  placeholder="اسمك الكامل كما في جواز السفر"
                  value={form.guestName}
                  onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="guestEmail" className="text-sm font-medium">البريد الإلكتروني</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={form.guestEmail}
                    onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="guestPhone" className="text-sm font-medium">رقم الهاتف</Label>
                  <Input
                    id="guestPhone"
                    placeholder="+966 5X XXX XXXX"
                    value={form.guestPhone}
                    onChange={(e) => setForm({ ...form, guestPhone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Nationality & Passport for Hajj/Umrah */}
              {(serviceType === "hajj" || serviceType === "umrah") && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">الجنسية</Label>
                    <Input
                      placeholder="مثال: سعودي، مصري"
                      value={form.nationality}
                      onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">رقم جواز السفر</Label>
                    <Input
                      placeholder="A12345678"
                      value={form.passportNumber}
                      onChange={(e) => setForm({ ...form, passportNumber: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Number of Travelers */}
              <div>
                <Label htmlFor="guestCount" className="text-sm font-medium">عدد المسافرين</Label>
                <Input
                  id="guestCount"
                  type="number"
                  min="1"
                  max="50"
                  value={form.guestCount}
                  onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Check-in/Check-out for hotels */}
              {serviceType === "hotel" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">تاريخ الوصول</Label>
                    <Input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">تاريخ المغادرة</Label>
                    <Input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="mt-1" />
                  </div>
                </div>
              )}

              {/* Coupon Code */}
              <div>
                <Label className="text-sm font-medium">كوبون الخصم (اختياري)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="أدخل كود الخصم"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponApplied(null); setCouponError(""); }}
                    className={couponApplied ? "border-green-400" : couponError ? "border-red-400" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={!couponCode.trim() || couponLoading}
                    onClick={() => { setCouponInput(couponCode); setTimeout(() => fetchCoupon(), 50); }}
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق"}
                  </Button>
                </div>
                {couponApplied && <p className="text-green-600 text-xs mt-1">✓ تم تطبيق الخصم</p>}
                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">ملاحظات خاصة</Label>
                <Textarea
                  id="notes"
                  placeholder="أي متطلبات خاصة..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  maxLength={2000}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Total with dynamic pricing */}
              <div className="bg-[var(--teal-50)] rounded-xl p-4 border border-[var(--teal-200)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--teal-700)]">السعر الأساسي ({form.guestCount} × {formatPrice(Number(price))})</span>
                  <span className="text-sm text-[var(--teal-800)]">{formatPrice(baseTotal)}</span>
                </div>
                {couponApplied && (
                  <div className="flex items-center justify-between text-green-700">
                    <span className="text-xs">كوبون: {couponApplied.code}</span>
                    <span className="text-xs font-semibold">- {formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {discounts.map((d: { name: string; percent: number; type: string }, i: number) => (
                  <div key={i} className="flex items-center justify-between text-green-700">
                    <span className="text-xs">{d.name} ({d.percent}%)</span>
                    <span className="text-xs font-semibold">- {formatPrice(baseTotal * d.percent / 100)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-[var(--teal-200)] pt-2">
                  <span className="text-sm font-bold text-[var(--teal-700)]">الإجمالي</span>
                  <span className="text-xl font-bold text-[var(--teal-800)]">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={createBooking.isPending}
                className="w-full bg-[var(--primary)] hover:bg-[var(--teal-600)] text-white font-semibold py-3"
              >
                {createBooking.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> جاري المعالجة...</>
                ) : (
                  "تأكيد الحجز"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
