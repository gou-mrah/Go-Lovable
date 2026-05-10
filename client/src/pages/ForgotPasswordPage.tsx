import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Mail, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const forgotMutation = trpc.customAuth.forgotPassword.useMutation({
    onSuccess: (data) => {
      setSent(true);
      // In dev mode show the token
      if ((data as { devToken?: string }).devToken) {
        toast.info(`رمز إعادة التعيين (وضع التطوير): ${(data as { devToken?: string }).devToken}`, {
          duration: 30000,
        });
      }
    },
    onError: (err) => {
      toast.error("حدث خطأ", { description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotMutation.mutate({ email });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F5EFE6] px-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src={LOGO_URL} alt="Go Umrah" className="h-16 mx-auto cursor-pointer" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[#C9A96E]/20">
          {!sent ? (
            <>
              <div className="text-center mb-7">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, #1B5E52, #2d7a6a)" }}
                >
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h1
                  className="text-2xl font-bold text-[#1B5E52] mb-2"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  نسيت كلمة المرور؟
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[#1B5E52] font-medium text-sm">
                    البريد الإلكتروني
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      dir="ltr"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-10 border-gray-200 focus:border-[#1B5E52] rounded-xl h-12"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={forgotMutation.isPending}
                  className="w-full h-12 rounded-xl text-white font-bold text-base"
                  style={{ background: "linear-gradient(135deg, #1B5E52, #2d7a6a)" }}
                >
                  {forgotMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "إرسال رابط إعادة التعيين"
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </div>
              <h2
                className="text-xl font-bold text-[#1B5E52] mb-3"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                تم الإرسال بنجاح
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                إذا كان البريد الإلكتروني <strong dir="ltr">{email}</strong> مسجلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور خلال دقائق.
              </p>
              <p className="text-xs text-gray-400">
                لم تستلم الرسالة؟{" "}
                <button
                  onClick={() => setSent(false)}
                  className="text-[#1B5E52] font-medium hover:underline"
                >
                  أعد المحاولة
                </button>
              </p>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-[#1B5E52] hover:text-[#C9A96E] transition-colors font-medium"
            >
              <ArrowRight className="w-4 h-4" />
              العودة إلى تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
