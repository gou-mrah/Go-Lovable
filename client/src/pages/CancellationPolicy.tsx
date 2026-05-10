import { XCircle, Clock, CreditCard, AlertTriangle, Phone, CheckCircle, RefreshCw } from "lucide-react";

const refundTiers = [
  {
    days: "أكثر من 30 يوماً",
    label: "قبل الرحلة بأكثر من 30 يوماً",
    refund: "90%",
    refundNum: 90,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    note: "يُخصم 10% رسوم إدارية",
  },
  {
    days: "15 – 30 يوماً",
    label: "قبل الرحلة بـ 15 إلى 30 يوماً",
    refund: "70%",
    refundNum: 70,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    note: "يُخصم 30% رسوم إدارية وحجز",
  },
  {
    days: "7 – 14 يوماً",
    label: "قبل الرحلة بـ 7 إلى 14 يوماً",
    refund: "50%",
    refundNum: 50,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    note: "يُخصم 50% رسوم إدارية وحجز",
  },
  {
    days: "3 – 6 أيام",
    label: "قبل الرحلة بـ 3 إلى 6 أيام",
    refund: "25%",
    refundNum: 25,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    note: "يُخصم 75% رسوم إدارية وحجز",
  },
  {
    days: "أقل من 3 أيام",
    label: "أقل من 3 أيام قبل الرحلة",
    refund: "0%",
    refundNum: 0,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    note: "لا يوجد استرداد — الحجز غير قابل للإلغاء",
  },
];

const exceptions = [
  {
    icon: AlertTriangle,
    title: "وفاة أحد المسافرين أو ذويه",
    desc: "استرداد كامل 100% مع تقديم وثيقة الوفاة الرسمية",
    color: "text-rose-400",
  },
  {
    icon: AlertTriangle,
    title: "مرض خطير يمنع السفر",
    desc: "استرداد يصل إلى 90% مع تقديم تقرير طبي معتمد",
    color: "text-amber-400",
  },
  {
    icon: AlertTriangle,
    title: "رفض التأشيرة من الجهات الرسمية",
    desc: "استرداد كامل للمبلغ عدا رسوم التأشيرة الحكومية غير القابلة للاسترداد",
    color: "text-blue-400",
  },
  {
    icon: AlertTriangle,
    title: "إلغاء من جانب المنصة",
    desc: "استرداد كامل 100% أو إعادة جدولة مجانية حسب رغبة العميل",
    color: "text-emerald-400",
  },
];

const steps = [
  { num: "01", title: "تقديم طلب الإلغاء", desc: "سجّل دخولك وتوجه إلى 'حجوزاتي' ثم اختر 'إلغاء الحجز'، أو تواصل مع الدعم مباشرة." },
  { num: "02", title: "مراجعة الطلب", desc: "يراجع فريقنا طلبك خلال 24 ساعة ويتحقق من تاريخ الإلغاء ونسبة الاسترداد المستحقة." },
  { num: "03", title: "تأكيد الإلغاء", desc: "تصلك رسالة تأكيد بالبريد الإلكتروني تتضمن المبلغ المسترد وموعد الإيداع المتوقع." },
  { num: "04", title: "استرداد المبلغ", desc: "يُعاد المبلغ على نفس وسيلة الدفع الأصلية خلال 7-14 يوم عمل." },
];

export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white" dir="rtl">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-900/15 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-rose-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-full px-4 py-2 text-rose-400 text-sm mb-6">
            <XCircle className="w-4 h-4" />
            <span>سياسة الإلغاء والاسترداد</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">سياسة الإلغاء والاسترداد</h1>
          <p className="text-gray-400 text-lg">
            نؤمن بالشفافية الكاملة. إليك سياستنا الواضحة للإلغاء واسترداد المبالغ حتى تحجز بثقة واطمئنان.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-20 space-y-12">
        {/* Refund Tiers */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            جدول الاسترداد حسب وقت الإلغاء
          </h2>
          <div className="space-y-3">
            {refundTiers.map((tier, i) => (
              <div key={i} className={`${tier.bg} border ${tier.border} rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4`}>
                <div className="flex-1">
                  <div className="font-bold text-base mb-1">{tier.label}</div>
                  <div className="text-gray-400 text-sm">{tier.note}</div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Visual bar */}
                  <div className="hidden md:block w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${tier.refundNum}%`,
                        background: tier.refundNum >= 70 ? "#10b981" : tier.refundNum >= 40 ? "#f59e0b" : "#f43f5e",
                      }}
                    />
                  </div>
                  <div className={`text-3xl font-black ${tier.color} min-w-[70px] text-center`}>
                    {tier.refund}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-xs mt-3 text-center">
            * تُحسب المدة من تاريخ تقديم طلب الإلغاء الرسمي وليس من تاريخ الحجز.
          </p>
        </section>

        {/* Exceptions */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-blue-400" />
            استثناءات الاسترداد الكامل
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {exceptions.map((ex, i) => (
              <div key={i} className="bg-white/4 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-colors">
                <div className="flex items-start gap-3">
                  <ex.icon className={`w-5 h-5 ${ex.color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <div className="font-semibold mb-1">{ex.title}</div>
                    <div className="text-gray-400 text-sm">{ex.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Non-refundable items */}
        <section>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-7">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              عناصر غير قابلة للاسترداد
            </h2>
            <ul className="space-y-2 text-gray-300 text-sm">
              {[
                "رسوم التأشيرة الحكومية المدفوعة للسفارات والجهات الرسمية",
                "تذاكر الطيران المصدرة (تخضع لسياسة شركة الطيران المعنية)",
                "الليالي الفندقية المستهلكة بالفعل",
                "رسوم الخدمات الإضافية التي تم تقديمها (نقل، جولات، إرشاد ديني)",
                "رسوم المعالجة الإدارية (10% من إجمالي الحجز)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How to Cancel */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-purple-400" />
            كيفية طلب الإلغاء
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="bg-white/4 border border-white/10 rounded-2xl p-5 relative">
                <div className="text-4xl font-black text-white/10 mb-3">{step.num}</div>
                <div className="font-bold mb-2">{step.title}</div>
                <div className="text-gray-400 text-sm leading-relaxed">{step.desc}</div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -left-2 w-4 h-0.5 bg-white/20" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border border-emerald-500/20 rounded-3xl p-10 text-center">
            <Phone className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">تريد إلغاء حجزك؟</h2>
            <p className="text-gray-300 mb-8">فريقنا جاهز لمساعدتك في إجراءات الإلغاء والإجابة على أسئلتك.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://wa.me/966557123435" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                <Phone className="w-5 h-5" />
                واتساب — رد فوري
              </a>
              <a href="tel:+966557123435"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                <Phone className="w-5 h-5" />
                +966 55 712 3435
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
