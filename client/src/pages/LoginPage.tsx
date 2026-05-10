import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png";

const MECCA_BG =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/mecca-night-aerial_27b583b6.jpg";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = trpc.customAuth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      await utils.customAuth.me.invalidate();
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      navigate(returnTo || "/");
    },
    onError: (err) => {
      toast.error("خطأ في تسجيل الدخول", { description: err.message });
    },
  });

  const googleLoginMutation = trpc.profile.googleLogin.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      navigate(returnTo || "/");
    },
    onError: (err) => toast.error("خطأ في تسجيل الدخول بـ Google", { description: err.message }),
  });

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.info("تسجيل الدخول بـ Google يتطلب إعداد VITE_GOOGLE_CLIENT_ID");
      return;
    }
    const client = (window as any).google?.accounts?.id;
    if (!client) {
      toast.error("لم يتم تحميل Google SDK");
      return;
    }
    client.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        googleLoginMutation.mutate({ idToken: response.credential, clientId: GOOGLE_CLIENT_ID });
      },
    });
    client.prompt();
  };

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0d2b24 0%, #1B5E52 60%, #0d2b24 100%)",
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${MECCA_BG})` }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'><g fill='none' stroke='%23C9A96E' stroke-width='0.9'><path d='M 100,54 A 55.744,55.744 0 0,0 146,100 A 55.744,55.744 0 0,0 100,146 A 55.744,55.744 0 0,0 54,100 A 55.744,55.744 0 0,0 100,54 Z'/><path d='M 0,-46 A 55.744,55.744 0 0,0 46,0 A 55.744,55.744 0 0,0 0,46 A 55.744,55.744 0 0,0 -46,0 A 55.744,55.744 0 0,0 0,-46 Z'/><path d='M 200,-46 A 55.744,55.744 0 0,0 246,0 A 55.744,55.744 0 0,0 200,46 A 55.744,55.744 0 0,0 154,0 A 55.744,55.744 0 0,0 200,-46 Z'/><path d='M 0,154 A 55.744,55.744 0 0,0 46,200 A 55.744,55.744 0 0,0 0,246 A 55.744,55.744 0 0,0 -46,200 A 55.744,55.744 0 0,0 0,154 Z'/><path d='M 200,154 A 55.744,55.744 0 0,0 246,200 A 55.744,55.744 0 0,0 200,246 A 55.744,55.744 0 0,0 154,200 A 55.744,55.744 0 0,0 200,154 Z'/><path d='M 100,-7 L 107,0 L 100,7 L 93,0 Z'/><path d='M 100,193 L 107,200 L 100,207 L 93,200 Z'/><path d='M -7,100 L 0,107 L 7,100 L 0,93 Z'/><path d='M 193,100 L 200,107 L 207,100 L 200,93 Z'/><path d='M 50,43 L 57,50 L 50,57 L 43,50 Z'/><path d='M 150,43 L 157,50 L 150,57 L 143,50 Z'/><path d='M 50,143 L 57,150 L 50,157 L 43,150 Z'/><path d='M 150,143 L 157,150 L 150,157 L 143,150 Z'/></g></svg>")`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 text-center px-8">
          <img src={LOGO_URL} alt="Go Umrah" className="h-24 mx-auto mb-8 drop-shadow-2xl" />
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            مرحباً بك في جو عمرة
          </h2>
          <p className="text-white/70 text-lg leading-relaxed" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            شريكك الموثوق لكل خطوة نحو بيت الله الحرام
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="h-px w-16 bg-[#C9A96E]/50" />
            <span className="text-[#C9A96E] text-xl">✦</span>
            <div className="h-px w-16 bg-[#C9A96E]/50" />
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { num: "+50K", label: "حاج ومعتمر" },
              { num: "24/7", label: "دعم متواصل" },
              { num: "15+", label: "سنة خبرة" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="text-[#C9A96E] text-2xl font-bold">{stat.num}</div>
                <div className="text-white/70 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5EFE6] px-6 py-12">
        <div className="lg:hidden mb-8">
          <img src={LOGO_URL} alt="Go Umrah" className="h-16 mx-auto" />
        </div>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-[#C9A96E]/20">
            <div className="text-center mb-8">
              <h1
                className="text-2xl font-bold text-[#1B5E52] mb-2"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                تسجيل الدخول
              </h1>
              <p className="text-gray-500 text-sm">أدخل بياناتك للوصول إلى حسابك</p>
            </div>

            {/* Google Sign-In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 gap-3 mb-5 font-medium text-gray-700"
              onClick={handleGoogleLogin}
              disabled={googleLoginMutation.isPending}
            >
              {googleLoginMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              تسجيل الدخول بـ Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">أو بالبريد الإلكتروني</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
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
                    className="pr-10 border-gray-200 focus:border-[#1B5E52] focus:ring-[#1B5E52]/20 rounded-xl h-12"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#1B5E52] font-medium text-sm">
                    كلمة المرور
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#C9A96E] hover:text-[#1B5E52] transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    dir="ltr"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10 border-gray-200 focus:border-[#1B5E52] focus:ring-[#1B5E52]/20 rounded-xl h-12"
                    required
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

              {/* Submit */}
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-12 rounded-xl text-white font-bold text-base mt-2"
                style={{ background: "linear-gradient(135deg, #1B5E52, #2d7a6a)" }}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </form>

            {/* Register link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="text-[#1B5E52] font-bold hover:text-[#C9A96E] transition-colors"
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-gray-500 hover:text-[#1B5E52] transition-colors">
              ← العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
