import { useEffect, useState } from "react";
import { useParams, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Shield, CreditCard, CheckCircle, XCircle,
  ArrowRight, ExternalLink, RefreshCw, ShoppingBag, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

type PageStatus = "idle" | "loading" | "redirecting" | "success" | "failed";

export default function UnifiedPaymentPage() {
  const params = useParams<{ serviceType: string; serviceId: string }>();
  const serviceType = params.serviceType as "order" | "visa";
  const serviceId = Number(params.serviceId);
  const [, navigate] = useLocation();
  const search = useSearch();
  const { user } = useAuth();

  const [status, setStatus] = useState<PageStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");

  // Check if returning from payment
  const searchParams = new URLSearchParams(search);
  const paidParam = searchParams.get("paid");

  // If paid=1, show success
  useEffect(() => {
    if (paidParam === "1") {
      setStatus("success");
    } else if (paidParam === "0") {
      setStatus("failed");
      setErrorMsg("فشلت عملية الدفع. يرجى المحاولة مرة أخرى.");
    }
  }, [paidParam]);

  const createPayment = trpc.payment.createUnifiedPayment.useMutation();

  const handlePay = (amount: number, description: string) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    createPayment.mutate(
      {
        serviceType,
        serviceId,
        amount,
        description,
        origin: window.location.origin,
      },
      {
        onSuccess: (data) => {
          if (!data.checkoutUrl) {
            setStatus("failed");
            setErrorMsg("لم يتم إنشاء رابط الدفع");
            return;
          }
          setCheckoutUrl(data.checkoutUrl);
          setStatus("redirecting");
          window.location.href = data.checkoutUrl;
        },
        onError: (err) => {
          setStatus("failed");
          setErrorMsg(err.message || "حدث خطأ أثناء إنشاء جلسة الدفع");
        },
      }
    );
  };

  if (serviceType === "order") {
    return <OrderPayment serviceId={serviceId} status={status} errorMsg={errorMsg} checkoutUrl={checkoutUrl} onPay={handlePay} onRetry={() => { setStatus("idle"); setErrorMsg(""); }} navigate={navigate} />;
  }

  if (serviceType === "visa") {
    return <VisaPayment serviceId={serviceId} status={status} errorMsg={errorMsg} checkoutUrl={checkoutUrl} onPay={handlePay} onRetry={() => { setStatus("idle"); setErrorMsg(""); }} navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
      <div className="text-white text-center">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">نوع الخدمة غير صالح</h2>
        <Button onClick={() => navigate("/")} className="mt-4 bg-emerald-600 text-white">
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
}

// ─── Order Payment ─────────────────────────────────────────────────────────────
function OrderPayment({
  serviceId, status, errorMsg, checkoutUrl, onPay, onRetry, navigate,
}: {
  serviceId: number;
  status: PageStatus;
  errorMsg: string;
  checkoutUrl: string;
  onPay: (amount: number, desc: string) => void;
  onRetry: () => void;
  navigate: (path: string) => void;
}) {
  // We don't have a direct getById for orders, so we show a simple payment page
  // The amount was already calculated on the store page

  // Get amount from URL params
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const amountSAR = parseFloat(searchParams.get("amount") || "0");
  const orderNumber = searchParams.get("ref") || "";

  if (status === "success") {
    return (
      <PaymentStatusScreen
        icon={<CheckCircle className="w-16 h-16 text-emerald-400" />}
        title="تم الدفع بنجاح!"
        subtitle="تم تأكيد طلبك وسيتم معالجته قريباً"
        action={<Button onClick={() => navigate("/store")} className="bg-emerald-600 text-white w-full">العودة للمتجر</Button>}
      />
    );
  }

  if (status === "failed") {
    return (
      <PaymentStatusScreen
        icon={<XCircle className="w-16 h-16 text-red-400" />}
        title="فشل الدفع"
        subtitle={errorMsg}
        action={
          <div className="flex flex-col gap-3 w-full">
            <Button onClick={onRetry} className="bg-emerald-600 text-white w-full">
              <RefreshCw className="w-4 h-4 ml-2" /> المحاولة مرة أخرى
            </Button>
            <Button variant="ghost" onClick={() => navigate("/store")} className="text-white/70 w-full">
              العودة للمتجر
            </Button>
          </div>
        }
      />
    );
  }

  if (status === "redirecting") {
    return (
      <PaymentStatusScreen
        icon={<ExternalLink className="w-12 h-12 text-emerald-300" />}
        title="جاري التحويل لصفحة الدفع..."
        subtitle="سيتم تحويلك لصفحة الدفع الآمنة من Moyasar"
        action={
          checkoutUrl ? (
            <a href={checkoutUrl} className="text-emerald-300 underline text-sm">
              اضغط هنا إذا لم يتم التحويل تلقائياً
            </a>
          ) : <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-300" />
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">دفع آمن ومشفر</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">إتمام دفع الطلب</h1>
          {orderNumber && <p className="text-emerald-200 text-sm">رقم الطلب: {orderNumber}</p>}
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="font-semibold">طلب من المتجر</div>
              <div className="text-emerald-200 text-xs">في انتظار الدفع</div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between items-center">
            <span className="text-emerald-200 text-sm">المبلغ الإجمالي</span>
            <span className="text-2xl font-bold text-emerald-300">
              {amountSAR.toFixed(2)} <span className="text-sm">ريال</span>
            </span>
          </div>
        </div>

        <PaymentMethodsInfo />

        <Button
          onClick={() => onPay(amountSAR, `طلب متجر - ${orderNumber}`)}
          disabled={status === "loading" || amountSAR <= 0}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 text-lg rounded-xl shadow-lg shadow-emerald-900/50 disabled:opacity-60"
        >
          {status === "loading" ? (
            <><Loader2 className="w-5 h-5 animate-spin ml-2" /> جاري التحضير...</>
          ) : (
            <><ArrowRight className="w-5 h-5 ml-2" /> الانتقال لصفحة الدفع الآمنة</>
          )}
        </Button>

        <p className="text-center text-emerald-300/60 text-xs mt-4">
          ستُحوَّل لصفحة الدفع الآمنة من Moyasar لإتمام العملية
        </p>
      </div>
    </div>
  );
}

// ─── Visa Payment ──────────────────────────────────────────────────────────────
function VisaPayment({
  serviceId, status, errorMsg, checkoutUrl, onPay, onRetry, navigate,
}: {
  serviceId: number;
  status: PageStatus;
  errorMsg: string;
  checkoutUrl: string;
  onPay: (amount: number, desc: string) => void;
  onRetry: () => void;
  navigate: (path: string) => void;
}) {
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const amountSAR = parseFloat(searchParams.get("amount") || "0");
  const visaType = searchParams.get("type") || "تأشيرة";

  if (status === "success") {
    return (
      <PaymentStatusScreen
        icon={<CheckCircle className="w-16 h-16 text-emerald-400" />}
        title="تم الدفع بنجاح!"
        subtitle="تم استلام رسوم التأشيرة وسيتم معالجة طلبك"
        action={<Button onClick={() => navigate("/visa")} className="bg-emerald-600 text-white w-full">العودة للتأشيرات</Button>}
      />
    );
  }

  if (status === "failed") {
    return (
      <PaymentStatusScreen
        icon={<XCircle className="w-16 h-16 text-red-400" />}
        title="فشل الدفع"
        subtitle={errorMsg}
        action={
          <div className="flex flex-col gap-3 w-full">
            <Button onClick={onRetry} className="bg-emerald-600 text-white w-full">
              <RefreshCw className="w-4 h-4 ml-2" /> المحاولة مرة أخرى
            </Button>
            <Button variant="ghost" onClick={() => navigate("/visa")} className="text-white/70 w-full">
              العودة للتأشيرات
            </Button>
          </div>
        }
      />
    );
  }

  if (status === "redirecting") {
    return (
      <PaymentStatusScreen
        icon={<ExternalLink className="w-12 h-12 text-emerald-300" />}
        title="جاري التحويل لصفحة الدفع..."
        subtitle="سيتم تحويلك لصفحة الدفع الآمنة من Moyasar"
        action={
          checkoutUrl ? (
            <a href={checkoutUrl} className="text-emerald-300 underline text-sm">
              اضغط هنا إذا لم يتم التحويل تلقائياً
            </a>
          ) : <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-300" />
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span className="text-emerald-300 text-sm font-medium">دفع آمن ومشفر</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">دفع رسوم التأشيرة</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="font-semibold">{visaType}</div>
              <div className="text-emerald-200 text-xs">رسوم معالجة التأشيرة</div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between items-center">
            <span className="text-emerald-200 text-sm">رسوم التأشيرة</span>
            <span className="text-2xl font-bold text-emerald-300">
              {amountSAR.toFixed(2)} <span className="text-sm">ريال</span>
            </span>
          </div>
        </div>

        <PaymentMethodsInfo />

        <Button
          onClick={() => onPay(amountSAR, `رسوم ${visaType}`)}
          disabled={status === "loading" || amountSAR <= 0}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 text-lg rounded-xl shadow-lg shadow-emerald-900/50 disabled:opacity-60"
        >
          {status === "loading" ? (
            <><Loader2 className="w-5 h-5 animate-spin ml-2" /> جاري التحضير...</>
          ) : (
            <><ArrowRight className="w-5 h-5 ml-2" /> الانتقال لصفحة الدفع الآمنة</>
          )}
        </Button>

        <p className="text-center text-emerald-300/60 text-xs mt-4">
          ستُحوَّل لصفحة الدفع الآمنة من Moyasar لإتمام العملية
        </p>
      </div>
    </div>
  );
}

// ─── Shared Components ─────────────────────────────────────────────────────────
function PaymentStatusScreen({ icon, title, subtitle, action }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 text-center text-white max-w-sm w-full">
        {icon}
        <h2 className="text-2xl font-bold mb-2 mt-4">{title}</h2>
        <p className="text-emerald-200 mb-6 text-sm">{subtitle}</p>
        {action}
      </div>
    </div>
  );
}

function PaymentMethodsInfo() {
  return (
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
  );
}
