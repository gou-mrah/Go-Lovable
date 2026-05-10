import { usdToSar } from "@shared/const";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Shield, CreditCard, CheckCircle, XCircle,
  ArrowRight, ExternalLink, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
type PageStatus = "idle" | "loading" | "redirecting" | "verifying" | "success" | "failed";

export default function PaymentPage() {
  const params = useParams<{ bookingNumber: string }>();
  const bookingNumber = params.bookingNumber;
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [status, setStatus] = useState<PageStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");
  const [amountSAR, setAmountSAR] = useState<number>(0);  // ─── Load booking info ───────────────────────────────────────────────────────
  const { data: booking, isLoading: bookingLoading } = trpc.bookings.getByRef.useQuery(
    { ref: bookingNumber },
    { enabled: !!bookingNumber }
  );

  // ─── Check if returning from Moyasar callback ─────────────────────────────
  const verifyPayment = trpc.payment.verifyPayment.useMutation();

  useEffect(() => {
    const url = new URL(window.location.href);
    const paymentId = url.searchParams.get("id");
    const paymentStatus = url.searchParams.get("status");

    if (paymentId && paymentStatus) {
      // Returning from Moyasar checkout
      setStatus("verifying");
      verifyPayment.mutate(
        { paymentId, bookingNumber },
        {
          onSuccess: (result) => {
            if (result.success) {
              setStatus("success");
              toast.success("تم الدفع بنجاح!");
              setTimeout(() => navigate(`/voucher/${bookingNumber}?paid=1`), 2000);
            } else {
              setStatus("failed");
              setErrorMsg(
                result.status === "failed"
                  ? "فشلت عملية الدفع. يرجى المحاولة مرة أخرى."
                  : `حالة الدفع: ${result.status}`
              );
            }
          },
          onError: (err) => {
            setStatus("failed");
            setErrorMsg(err.message || "حدث خطأ أثناء التحقق من الدفع");
          },
        }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Create invoice and redirect ──────────────────────────────────────────
  const createPayment = trpc.payment.createBookingPayment.useMutation();

  const handlePay = () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    createPayment.mutate(
      {
        bookingNumber,
        origin: window.location.origin,
      },
      {
        onSuccess: (data) => {
          if (!data.checkoutUrl) {
            setStatus("failed");
            setErrorMsg("لم يتم إنشاء رابط الدفع. يرجى المحاولة مرة أخرى.");
            return;
          }
          setAmountSAR(data.amount);
          setCheckoutUrl(data.checkoutUrl);
          setStatus("redirecting");
          // Redirect to Moyasar hosted checkout page
          window.location.href = data.checkoutUrl;
        },
        onError: (err) => {
          setStatus("failed");
          setErrorMsg(err.message || "حدث خطأ أثناء إنشاء جلسة الدفع");
          toast.error("فشل إنشاء جلسة الدفع");
        },
      }
    );
  };

  // ─── Render: verifying ────────────────────────────────────────────────────
  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 text-center text-white max-w-sm w-full">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-300" />
          <p className="text-lg font-semibold">جاري التحقق من الدفع...</p>
        </div>
      </div>
    );
  }

  // ─── Render: success ──────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 text-center text-white max-w-sm w-full">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">تم الدفع بنجاح!</h2>
          <p className="text-emerald-200 mb-6">جاري تحويلك للقسيمة...</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-300" />
        </div>
      </div>
    );
  }

  // ─── Render: failed ───────────────────────────────────────────────────────
  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 text-center text-white max-w-sm w-full">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">فشل الدفع</h2>
          <p className="text-red-200 mb-6 text-sm">{errorMsg}</p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => { setStatus("idle"); setErrorMsg(""); }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white w-full"
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              المحاولة مرة أخرى
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate(`/voucher/${bookingNumber}`)}
              className="text-white/70 hover:text-white w-full"
            >
              العودة للقسيمة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: redirecting ──────────────────────────────────────────────────
  if (status === "redirecting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 text-center text-white max-w-sm w-full">
          <ExternalLink className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">جاري التحويل لصفحة الدفع...</h2>
          <p className="text-emerald-200 text-sm mb-6">سيتم تحويلك لصفحة الدفع الآمنة من Moyasar</p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-300 mb-4" />
          {checkoutUrl && (
            <a
              href={checkoutUrl}
              className="text-emerald-300 underline text-sm"
            >
              اضغط هنا إذا لم يتم التحويل تلقائياً
            </a>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: main payment page ────────────────────────────────────────────
  const isLoading = status === "loading" || bookingLoading;
  const amountDisplay = booking
    ? usdToSar(parseFloat(booking.totalUSD as string)).toFixed(2)
    : amountSAR.toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">دفع آمن ومشفر</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">إتمام الدفع</h1>
          <p className="text-emerald-200 text-sm">رقم الحجز: {bookingNumber}</p>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          {bookingLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-300" />
            </div>
          ) : booking ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-emerald-200 text-sm">الخدمة</span>
                <span className="font-semibold">{booking.serviceName ?? booking.serviceType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-200 text-sm">الحالة</span>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                  {booking.paymentStatus === "paid" ? "مدفوع" : "في انتظار الدفع"}
                </Badge>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                <span className="text-emerald-200 text-sm">المبلغ الإجمالي</span>
                <span className="text-2xl font-bold text-emerald-300">
                  {amountDisplay} <span className="text-sm">ريال</span>
                </span>
              </div>
            </div>
          ) : (
            <p className="text-center text-emerald-200 text-sm">جاري تحميل بيانات الحجز...</p>
          )}
        </div>

        {/* Payment Methods Info */}
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <p className="text-emerald-200 text-xs text-center mb-3">وسائل الدفع المتاحة</p>
          <div className="flex justify-center gap-4 text-white/60 text-xs">
            <div className="flex items-center gap-1">
              <CreditCard className="w-4 h-4" />
              <span>بطاقة ائتمان</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-emerald-400">STC</span>
              <span>Pay</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-purple-400">مدى</span>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <Button
          onClick={handlePay}
          disabled={isLoading || booking?.paymentStatus === "paid"}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 text-lg rounded-xl shadow-lg shadow-emerald-900/50 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin ml-2" />
              جاري التحضير...
            </>
          ) : booking?.paymentStatus === "paid" ? (
            <>
              <CheckCircle className="w-5 h-5 ml-2" />
              تم الدفع مسبقاً
            </>
          ) : (
            <>
              <ArrowRight className="w-5 h-5 ml-2" />
              الانتقال لصفحة الدفع الآمنة
            </>
          )}
        </Button>

        {/* Security note */}
        <p className="text-center text-emerald-300/60 text-xs mt-4">
          ستُحوَّل لصفحة الدفع الآمنة من Moyasar لإتمام العملية
        </p>

        {/* Back link */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate(`/voucher/${bookingNumber}`)}
            className="text-emerald-300/70 hover:text-emerald-300 text-sm underline"
          >
            العودة للقسيمة
          </button>
        </div>
      </div>
    </div>
  );
}
