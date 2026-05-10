import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, TrendingUp, Users, DollarSign, ArrowRight, Loader2, Send } from "lucide-react";

const SKILLS_LIST = [
  "التسويق الرقمي",
  "وسائل التواصل الاجتماعي",
  "تصميم الإعلانات",
  "إدارة الحملات الإعلانية",
  "التسويق عبر البريد الإلكتروني",
  "تحسين محركات البحث (SEO)",
  "التسويق بالمحتوى",
  "العلاقات العامة",
  "خدمة العملاء",
  "المبيعات المباشرة",
  "التسويق الشبكي",
  "إدارة المجتمعات الإلكترونية",
];

function SuccessScreen({ code }: { code: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <Card className="max-w-md w-full text-center shadow-xl border-0">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-blue-800 mb-2">تم استلام طلبك!</h2>
          <p className="text-muted-foreground mb-6">
            شكراً لاهتمامك بالانضمام كمسوق في منصة جو عمرة. سيتم مراجعة طلبك من قِبل فريقنا وإخطارك بالنتيجة قريباً.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">رقمك المرجعي</p>
            <p className="text-2xl font-mono font-bold text-blue-700">{code}</p>
            <p className="text-xs text-muted-foreground mt-1">احتفظ بهذا الرقم لمتابعة حالة طلبك</p>
          </div>
          <Link href="/">
            <Button className="w-full gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinMarketer() {
  const { user } = useAuth();
  const [successCode, setSuccessCode] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [form, setForm] = useState({
    nameAr: "",
    nameEn: "",
    gender: "" as "male" | "female" | "",
    phone: "",
    email: "",
    city: "",
    notes: "",
  });

  const registerMutation = trpc.marketers.publicRegister.useMutation({
    onSuccess: (data) => {
      setSuccessCode(data.code);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    },
  });

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = () => {
    if (!form.nameAr.trim() || form.nameAr.length < 2) {
      toast.error("يرجى إدخال الاسم الكامل (حرفان على الأقل)");
      return;
    }
    registerMutation.mutate({
      ...form,
      gender: form.gender || undefined,
      skills: selectedSkills,
      userId: user?.id,
    });
  };

  if (successCode) return <SuccessScreen code={successCode} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ج</span>
              </div>
              <span className="font-bold text-lg">جو عمرة</span>
            </div>
          </Link>
          <div className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
            انضم كمسوق
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold mb-3">انضم كمسوق</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            حوّل شبكة علاقاتك إلى دخل مستدام من خلال تسويق خدمات الحج والعمرة مع منصة جو عمرة
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: DollarSign, title: "عمولات مجزية", desc: "نسبة تنافسية على كل عملية بيع" },
            { icon: Users, title: "دعم مستمر", desc: "فريق متخصص لمساعدتك في التسويق" },
            { icon: TrendingUp, title: "نمو مستمر", desc: "تتبع أدائك وعمولاتك لحظياً" },
          ].map(b => (
            <Card key={b.title} className="text-center border-0 bg-white/80 shadow-sm">
              <CardContent className="pt-4 pb-3">
                <b.icon className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-sm">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">نموذج الانضمام كمسوق</CardTitle>
            <CardDescription>يرجى تعبئة البيانات بدقة لتسريع عملية المراجعة والاعتماد</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>الاسم الكامل (بالعربية) *</Label>
                <Input
                  value={form.nameAr}
                  onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))}
                  placeholder="مثال: محمد أحمد العمري"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>الاسم (بالإنجليزية)</Label>
                <Input
                  value={form.nameEn}
                  onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))}
                  placeholder="Mohammed Ahmed Al-Omari"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>الجنس</Label>
                <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v as any }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="اختر الجنس" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>المدينة</Label>
                <Input
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  placeholder="مثال: جدة، القاهرة، دبي..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>رقم الهاتف / واتساب</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+966 5X XXX XXXX"
                  className="mt-1"
                  dir="ltr"
                />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="example@domain.com"
                  className="mt-1"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <Label className="text-base font-semibold mb-3 block">مهاراتك التسويقية</Label>
              <div className="flex flex-wrap gap-2">
                {SKILLS_LIST.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      selectedSkills.includes(skill)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-border hover:border-blue-400"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>نبذة عنك / تجربتك في التسويق</Label>
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="أخبرنا عن تجربتك في التسويق وما يميزك..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                onClick={handleSubmit}
                disabled={registerMutation.isPending}
                className="w-full h-12 text-base gap-2 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {registerMutation.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> جارٍ إرسال الطلب...</>
                ) : (
                  <><Send className="h-5 w-5" /> إرسال طلب الانضمام</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                بعد إرسال الطلب، سيتم مراجعته من فريق جو عمرة والتواصل معك في أقرب وقت
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Also join as supplier */}
        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            هل تريد الانضمام كمزود خدمة بدلاً من ذلك؟{" "}
            <Link href="/admin?section=suppliers">
              <span className="text-primary font-medium hover:underline cursor-pointer">انضم كمزود خدمة</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
