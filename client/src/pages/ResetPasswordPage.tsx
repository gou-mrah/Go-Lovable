import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png";

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // Get token from URL query params
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetMutation = trpc.customAuth.resetPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      await utils.customAuth.me.invalidate();
      toast.success("تم تغيير كلمة المرور بنجاح", {
        description: "تم تسجيل دخولك تلقائياً",
      });
      navigate("/");
    },
    onError: (err) => {
      toast.error("خطأ في إعادة التعيين", { description: err.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (!token) {
      toast.error("رابط إعادة التعيين غير صالح");
      return;
    }
    resetMutation.mutate({ token, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5EFE6] px-4" dir="rtl">
        <div className="text-center">
          <p className="text-red-500 mb-4">رابط إعادة التعيين غير صالح</p>
          <Link href="/forgot-password" className="text-[#1B5E52] hover:underline">
            طلب رابط جديد
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5EFE6] px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src={LOGO_URL} alt="Go Umrah" className="h-16 mx-auto cursor-pointer" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[#C9A96E]/20">
          <div className="text-center mb-7">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #1B5E52, #2d7a6a)" }}
            >
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1
              className="text-2xl font-bold text-[#1B5E52] mb-2"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              إعادة تعيين كلمة المرور
            </h1>
            <p className="text-gray-500 text-sm">أدخل كلمة مرور جديدة لحسابك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#1B5E52] font-medium text-sm">
                كلمة المرور الجديدة
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  placeholder="8 أحرف على الأقل"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10 border-gray-200 focus:border-[#1B5E52] rounded-xl h-12"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[#1B5E52] font-medium text-sm">
                تأكيد كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  dir="ltr"
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pr-10 pl-10 border-gray-200 focus:border-[#1B5E52] rounded-xl h-12 ${
                    confirmPassword && confirmPassword !== password ? "border-red-400" : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-500">كلمتا المرور غير متطابقتين</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full h-12 rounded-xl text-white font-bold text-base"
              style={{ background: "linear-gradient(135deg, #1B5E52, #2d7a6a)" }}
            >
              {resetMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "تعيين كلمة المرور الجديدة"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
