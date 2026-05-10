import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png";
const MECCA_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/mecca-night-aerial_27b583b6.jpg";

export default function VerifyEmailPage() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">("loading");
  const [message, setMessage] = useState("");
  const utils = trpc.useUtils();

  const verifyEmail = trpc.profile.verifyEmail.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setMessage(`مرحباً ${data.name ?? ""}! تم تحقق بريدك الإلكتروني بنجاح.`);
      utils.auth.me.invalidate();
      setTimeout(() => navigate("/profile"), 3000);
    },
    onError: (e) => {
      setStatus("error");
      setMessage(e.message);
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("no-token");
      return;
    }
    verifyEmail.mutate({ token });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1a0f] flex items-center justify-center p-4" dir="rtl">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: `url(${MECCA_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a0f]/80 via-transparent to-[#0a1a0f]/90" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Go Umrah" className="h-16 w-auto mx-auto mb-4" />
        </div>

        {/* Card */}
        <div className="bg-[#0d2010]/95 backdrop-blur border border-[#C9A96E]/30 rounded-2xl p-8 text-center shadow-2xl">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-[#C9A96E] animate-spin mx-auto mb-4" />
              <h2 className="text-white text-xl font-bold mb-2">جاري التحقق...</h2>
              <p className="text-white/50 text-sm">يرجى الانتظار بينما نتحقق من بريدك الإلكتروني</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-20 h-20 rounded-full bg-green-900/40 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">تم التحقق بنجاح!</h2>
              <p className="text-white/70 text-sm mb-6">{message}</p>
              <p className="text-[#C9A96E]/60 text-xs mb-4">سيتم توجيهك إلى ملفك الشخصي خلال ثوانٍ...</p>
              <Button
                className="bg-[#C9A96E] hover:bg-[#b8935a] text-[#0a1a0f] w-full"
                onClick={() => navigate("/profile")}
              >
                الذهاب إلى الملف الشخصي
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-20 h-20 rounded-full bg-red-900/40 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">فشل التحقق</h2>
              <p className="text-white/70 text-sm mb-6">{message}</p>
              <div className="space-y-2">
                <Button
                  className="bg-[#C9A96E] hover:bg-[#b8935a] text-[#0a1a0f] w-full"
                  onClick={() => navigate("/profile")}
                >
                  طلب رابط جديد من الملف الشخصي
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 text-white/60 hover:bg-white/10 w-full"
                  onClick={() => navigate("/")}
                >
                  العودة للرئيسية
                </Button>
              </div>
            </>
          )}

          {status === "no-token" && (
            <>
              <div className="w-20 h-20 rounded-full bg-yellow-900/40 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-yellow-400" />
              </div>
              <h2 className="text-white text-xl font-bold mb-2">رابط غير صالح</h2>
              <p className="text-white/70 text-sm mb-6">
                لم يتم العثور على رمز التحقق. يرجى استخدام الرابط المرسل إلى بريدك الإلكتروني.
              </p>
              <Button
                className="bg-[#C9A96E] hover:bg-[#b8935a] text-[#0a1a0f] w-full"
                onClick={() => navigate("/profile")}
              >
                الذهاب إلى الملف الشخصي
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
