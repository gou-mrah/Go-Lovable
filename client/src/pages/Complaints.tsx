import { useState } from "react";
import { MessageSquare, CheckCircle, Clock, Users, ThumbsUp, Send, Phone, Mail, AlertCircle } from "lucide-react";

const steps = [
  { icon: Send, title: "استلام الطلب", desc: "نستلم طلبك ونرسل تأكيداً فورياً على بريدك الإلكتروني أو هاتفك", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { icon: Users, title: "دراسة الطلب", desc: "يراجع الفريق المختص طلبك بعناية ويجمع المعلومات اللازمة", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { icon: Clock, title: "التواصل خلال 48 ساعة", desc: "نتواصل معك خلال 48 ساعة عمل بحل أو تحديث عن حالة طلبك", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { icon: ThumbsUp, title: "الحل ومتابعة الرضا", desc: "نعمل على إيجاد حل مناسب ونتابع رضاك عن النتيجة", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

export default function Complaints() {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", bookingRef: "", type: "", subject: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white" dir="rtl">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/15 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 text-blue-400 text-sm mb-6">
            <MessageSquare className="w-4 h-4" />
            <span>صوتك مسموع ومقدر لدينا</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">الشكاوى والاقتراحات</h1>
          <p className="text-gray-400 text-lg">
            نرحب بملاحظاتكم وشكاواكم واقتراحاتكم التي تساعدنا على تحسين خدماتنا. كل رأي يُعدّ فرصة للتطوير.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-12 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-3 text-emerald-400">تم الإرسال بنجاح!</h2>
                <p className="text-gray-300 mb-6">شكراً لتواصلك معنا. سنراجع طلبك ونتواصل معك خلال 48 ساعة عمل.</p>
                <p className="text-gray-400 text-sm mb-8">تأكيد بالبريد الإلكتروني في طريقه إليك.</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", phone: "", email: "", bookingRef: "", type: "", subject: "", message: "" }); }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl transition-colors"
                >
                  إرسال طلب آخر
                </button>
              </div>
            ) : (
              <div className="bg-white/4 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  نموذج تقديم طلب
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">الاسم الكامل *</label>
                      <input
                        required
                        type="text"
                        placeholder="أدخل اسمك الكامل"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">رقم الجوال *</label>
                      <input
                        required
                        type="tel"
                        placeholder="+966 5X XXX XXXX"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">البريد الإلكتروني *</label>
                      <input
                        required
                        type="email"
                        placeholder="example@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">الرقم المرجعي للحجز (اختياري)</label>
                      <input
                        type="text"
                        placeholder="مثال: GU-2024-XXXXX"
                        value={form.bookingRef}
                        onChange={(e) => setForm({ ...form, bookingRef: e.target.value })}
                        className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">نوع الطلب *</label>
                    <select
                      required
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all"
                    >
                      <option value="" className="bg-[#0a1628]">اختر نوع الطلب</option>
                      <option value="complaint" className="bg-[#0a1628]">شكوى</option>
                      <option value="suggestion" className="bg-[#0a1628]">اقتراح</option>
                      <option value="inquiry" className="bg-[#0a1628]">استفسار</option>
                      <option value="compliment" className="bg-[#0a1628]">إشادة وتقدير</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">الموضوع *</label>
                    <input
                      required
                      type="text"
                      placeholder="عنوان مختصر لطلبك"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">تفاصيل الرسالة *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="اكتب تفاصيل طلبك هنا بوضوح..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        إرسال الطلب
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Process */}
            <div className="bg-white/4 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                ماذا يحدث بعد الإرسال؟
              </h3>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${step.bg} border ${step.border}`}>
                    <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0`}>
                      <step.icon className={`w-4 h-4 ${step.color}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1">{step.title}</div>
                      <div className="text-gray-400 text-xs leading-relaxed">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Contact */}
            <div className="bg-white/4 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-400" />
                تواصل مباشر
              </h3>
              <div className="space-y-3">
                <a href="https://wa.me/966557123435" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm font-medium">الهاتف / واتساب</div>
                    <div className="text-gray-400 text-xs">+966 55 712 3435</div>
                  </div>
                </a>
                <a href="mailto:admin@go-umrah.com" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-sm font-medium">البريد الإلكتروني</div>
                    <div className="text-gray-400 text-xs">admin@go-umrah.com</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Note */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-400 text-sm mb-1">تنبيه مهم</div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    في حالات الطوارئ أثناء الرحلة، تواصل مباشرة عبر الهاتف أو واتساب للحصول على مساعدة فورية. لا تنتظر الرد على البريد الإلكتروني في الحالات العاجلة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
