import { useState, useEffect, useRef, useMemo } from "react";
import NewsTickerBar from "@/components/NewsTickerBar";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CheckCircle, X, MessageCircle, Mail, TrendingUp, Building2, User, CheckCircle2, Upload, FileText, Loader2, Timer, Volume2, VolumeX, Play, Pause, Users, SkipForward, SkipBack, ListMusic, ChevronDown, ChevronUp } from "lucide-react";


const KAABA_VIDEO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-4k-user_c2891b5c.mp4";
const KAABA_PHOTO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/kaaba-aerial_939892ab.jpg";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png";

const DHIKR_LIST = [
  "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
  "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
  "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
  "سُبْحَانَ اللَّهِ الْعَظِيمِ",
  "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
  "اللَّهُ أَكْبَرُ كَبِيرًا وَالْحَمْدُ لِلَّهِ كَثِيرًا",
  "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ",
  "اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي",
  "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
  "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
];

const WORLD_COUNTRIES = [
  { code: "SA", name: "المملكة العربية السعودية", cities: ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الطائف", "تبوك", "أبها"] },
  { code: "EG", name: "مصر", cities: ["القاهرة", "الإسكندرية", "الجيزة", "شرم الشيخ", "الأقصر", "أسوان"] },
  { code: "AE", name: "الإمارات العربية المتحدة", cities: ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة"] },
  { code: "KW", name: "الكويت", cities: ["مدينة الكويت", "الفروانية", "حولي", "الجهراء"] },
  { code: "QA", name: "قطر", cities: ["الدوحة", "الريان", "الوكرة"] },
  { code: "BH", name: "البحرين", cities: ["المنامة", "المحرق", "الرفاع"] },
  { code: "OM", name: "عُمان", cities: ["مسقط", "صلالة", "نزوى", "صحار"] },
  { code: "JO", name: "الأردن", cities: ["عمّان", "الزرقاء", "إربد", "العقبة"] },
  { code: "LB", name: "لبنان", cities: ["بيروت", "طرابلس", "صيدا"] },
  { code: "TR", name: "تركيا", cities: ["إسطنبول", "أنقرة", "إزمير"] },
  { code: "PK", name: "باكستان", cities: ["كراتشي", "لاهور", "إسلام آباد"] },
  { code: "IN", name: "الهند", cities: ["نيودلهي", "مومباي", "بنغالور"] },
  { code: "ID", name: "إندونيسيا", cities: ["جاكرتا", "سورابايا", "باندونغ"] },
  { code: "MY", name: "ماليزيا", cities: ["كوالالمبور", "جورج تاون", "إيبوه"] },
  { code: "BD", name: "بنغلاديش", cities: ["دكا", "شيتاغونغ", "خولنا"] },
  { code: "GB", name: "المملكة المتحدة", cities: ["لندن", "مانشستر", "برمنغهام"] },
  { code: "US", name: "الولايات المتحدة", cities: ["نيويورك", "لوس أنجلوس", "شيكاغو"] },
  { code: "FR", name: "فرنسا", cities: ["باريس", "مرسيليا", "ليون"] },
  { code: "DE", name: "ألمانيا", cities: ["برلين", "هامبورغ", "ميونيخ"] },
];

const SERVICES_LIST = [
  { value: "umrah", label: "عمرة" },
  { value: "hajj", label: "حج" },
  { value: "hotel", label: "فنادق" },
  { value: "transport", label: "نقل" },
  { value: "visa", label: "تأشيرات" },
  { value: "tour", label: "جولات سياحية" },
  { value: "flight", label: "رحلات جوية" },
  { value: "catering", label: "تموين وضيافة" },
  { value: "other", label: "أخرى" },
];

// ─── Marketer Form (matches admin panel exactly) ──────────────────────────────
const MARKETER_INITIAL = {
  nameAr: "", nameEn: "", gender: "male" as "male" | "female",
  maritalStatus: "single" as "single" | "married" | "divorced" | "widowed",
  phone: "", email: "", city: "", birthDate: "",
  jobTitle: "", education: "", skills: "", joinDate: "", notes: "",
};

function MarketerForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState(MARKETER_INITIAL);
  const [success, setSuccess] = useState(false);
  const setF = (k: keyof typeof MARKETER_INITIAL, v: string) => setForm(p => ({ ...p, [k]: v }));
  const utils = trpc.useUtils();
  const mutation = trpc.marketers.publicRegister.useMutation({
    onSuccess: () => {
      setSuccess(true);
      utils.marketers.listPending.invalidate();
    },
    onError: (e) => toast.error(e.message || "حدث خطأ، يرجى المحاولة مرة أخرى"),
  });

  const handleSubmit = () => {
    if (!form.nameAr.trim()) { toast.error("الاسم بالعربية مطلوب"); return; }
    mutation.mutate({
      nameAr: form.nameAr,
      nameEn: form.nameEn || undefined,
      gender: form.gender,
      phone: form.phone || undefined,
      email: form.email || undefined,
      city: form.city || undefined,
      skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      notes: form.notes || undefined,
    });
  };

  if (success) return (
    <div className="text-center py-10">
      <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-white mb-2">تم استلام طلبك!</h3>
      <p className="text-white/60 mb-6">سيتم مراجعة طلبك والتواصل معك قريباً</p>
      <button onClick={onClose} className="px-8 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all">إغلاق</button>
    </div>
  );

  return (
    <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          إضافة مسوق جديد
        </h2>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
      <Tabs defaultValue="personal" className="mt-2">
        <TabsList className="grid grid-cols-2 w-full bg-white/10">
          <TabsTrigger value="job" className="text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">تفاصيل الوظيفة</TabsTrigger>
          <TabsTrigger value="personal" className="text-white data-[state=active]:bg-amber-500 data-[state=active]:text-black">المعلومات الشخصية</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">الاسم بالعربية *</Label>
              <Input value={form.nameAr} onChange={e => setF("nameAr", e.target.value)} placeholder="الاسم الكامل" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">الاسم بالإنجليزية</Label>
              <Input value={form.nameEn} onChange={e => setF("nameEn", e.target.value)} placeholder="Full Name" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">الجنس</Label>
              <Select value={form.gender} onValueChange={v => setF("gender", v as any)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">الحالة الاجتماعية</Label>
              <Select value={form.maritalStatus} onValueChange={v => setF("maritalStatus", v as any)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">أعزب</SelectItem>
                  <SelectItem value="married">متزوج</SelectItem>
                  <SelectItem value="divorced">مطلق</SelectItem>
                  <SelectItem value="widowed">أرمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">رقم الهاتف</Label>
              <Input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="+966 5xx xxx xxxx" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">البريد الإلكتروني</Label>
              <Input value={form.email} onChange={e => setF("email", e.target.value)} placeholder="email@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">المدينة</Label>
              <Input value={form.city} onChange={e => setF("city", e.target.value)} placeholder="القاهرة، جدة..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">تاريخ الميلاد</Label>
              <Input type="date" value={form.birthDate} onChange={e => setF("birthDate", e.target.value)} className="bg-white/10 border-white/20 text-white" dir="ltr" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="job" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">المسمى الوظيفي</Label>
              <Input value={form.jobTitle} onChange={e => setF("jobTitle", e.target.value)} placeholder="مدير مبيعات، مسؤول حجوزات..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">المؤهل التعليمي</Label>
              <Input value={form.education} onChange={e => setF("education", e.target.value)} placeholder="بكالوريوس، دبلوم..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-white/80">المهارات (مفصولة بفاصلة)</Label>
            <Input value={form.skills} onChange={e => setF("skills", e.target.value)} placeholder="تسويق رقمي، خدمة عملاء، مبيعات..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
          </div>
          <div className="space-y-1">
            <Label className="text-white/80">ملاحظات</Label>
            <Textarea value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="أي ملاحظات إضافية..." rows={3} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 pt-4 mt-2 border-t border-white/10">
        <Button onClick={handleSubmit} disabled={!form.nameAr || mutation.isPending} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold">
          {mutation.isPending ? "جاري الإرسال..." : "إضافة المسوق"}
        </Button>
        <Button variant="outline" onClick={onClose} className="border-white/30 text-white hover:bg-white/10 bg-transparent">إلغاء</Button>
      </div>
    </div>
  );
}

// ─── Supplier Form (matches admin panel exactly) ──────────────────────────────
const SUPPLIER_INITIAL = {
  type: "company" as "company" | "individual",
  gender: "male" as "male" | "female",
  companyName: "",
  nameAr: "", nameEn: "",
  licenseNumber: "", commercialRegisterNumber: "",
  licenseFileUrl: "", commercialRegisterUrl: "",
  phone: "", whatsapp: "", email: "", website: "",
  countryCode: "", country: "", city: "", address: "",
  services: [] as string[],
  notes: "",
};

function SupplierForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState(SUPPLIER_INITIAL);
  const [success, setSuccess] = useState(false);
  const setF = (k: keyof typeof SUPPLIER_INITIAL, v: any) => setForm(p => ({ ...p, [k]: v }));
  const cities = useMemo(() => WORLD_COUNTRIES.find(c => c.code === form.countryCode)?.cities ?? [], [form.countryCode]);
  const selectedCountry = useMemo(() => WORLD_COUNTRIES.find(c => c.code === form.countryCode), [form.countryCode]);

  const toggleService = (val: string) => {
    setForm(p => ({
      ...p,
      services: p.services.includes(val) ? p.services.filter(s => s !== val) : [...p.services, val],
    }));
  };

  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingCommercial, setUploadingCommercial] = useState(false);

  const uploadMutation = trpc.suppliers.publicUploadFile.useMutation();

  const handleFileUpload = async (file: File, category: "license" | "commercial_register", field: "licenseFileUrl" | "commercialRegisterUrl") => {
    if (file.size > 10 * 1024 * 1024) { toast.error("حجم الملف يجب أن يكون أقل من 10MB"); return; }
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowed.includes(file.type)) { toast.error("يُسمح فقط بملفات PDF أو صور JPG/PNG"); return; }
    const setter = category === "license" ? setUploadingLicense : setUploadingCommercial;
    setter(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const result = await uploadMutation.mutateAsync({ fileBase64: base64, fileName: file.name, fileType: file.type, fileCategory: category });
        setF(field, result.url);
        toast.success("تم رفع الملف بنجاح");
        setter(false);
      };
      reader.onerror = () => { toast.error("فشل قراءة الملف"); setter(false); };
    } catch { toast.error("فشل رفع الملف، يرجى المحاولة مرة أخرى"); setter(false); }
  };

  const utils = trpc.useUtils();
  const mutation = trpc.suppliers.publicRegister.useMutation({
    onSuccess: () => {
      setSuccess(true);
      utils.suppliers.list.invalidate();
    },
    onError: (e) => toast.error(e.message || "حدث خطأ، يرجى المحاولة مرة أخرى"),
  });

  const handleSubmit = () => {
    if (!form.nameAr.trim()) { toast.error("الاسم مطلوب"); return; }
    if (form.type === "company" && !form.companyName.trim()) { toast.error("اسم الشركة مطلوب"); return; }
    mutation.mutate({
      nameAr: form.nameAr,
      nameEn: form.nameEn || undefined,
      type: form.type,
      gender: form.gender,
      companyName: form.companyName || undefined,
      licenseNumber: form.licenseNumber || undefined,
      commercialRegisterNumber: form.commercialRegisterNumber || undefined,
      licenseFileUrl: form.licenseFileUrl || undefined,
      commercialRegisterUrl: form.commercialRegisterUrl || undefined,
      phone: form.phone || undefined,
      whatsapp: form.whatsapp || undefined,
      email: form.email || undefined,
      website: form.website || undefined,
      country: selectedCountry?.name || form.country || undefined,
      countryCode: form.countryCode || undefined,
      city: form.city || undefined,
      address: form.address || undefined,
      services: form.services,
      notes: form.notes || undefined,
    });
  };

  if (success) return (
    <div className="text-center py-10">
      <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-white mb-2">تم استلام طلبك!</h3>
      <p className="text-white/60 mb-6">سيتم مراجعة طلبك والتواصل معك قريباً</p>
      <button onClick={onClose} className="px-8 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all">إغلاق</button>
    </div>
  );

  return (
    <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-3xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
          {form.type === "company" ? <Building2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
          إضافة مورد / مزود جديد
        </h2>
        <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <Tabs defaultValue="basic" className="mt-2">
        <TabsList className="grid grid-cols-4 w-full bg-white/10">
          <TabsTrigger value="services" className="text-white text-xs data-[state=active]:bg-green-600 data-[state=active]:text-white">الخدمات</TabsTrigger>
          <TabsTrigger value="contact" className="text-white text-xs data-[state=active]:bg-green-600 data-[state=active]:text-white">التواصل والموقع</TabsTrigger>
          <TabsTrigger value="legal" className="text-white text-xs data-[state=active]:bg-green-600 data-[state=active]:text-white">الوثائق القانونية</TabsTrigger>
          <TabsTrigger value="basic" className="text-white text-xs data-[state=active]:bg-green-600 data-[state=active]:text-white">المعلومات الأساسية</TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">نوع المورد *</Label>
              <Select value={form.type} onValueChange={v => setF("type", v as any)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">شركة / مؤسسة</SelectItem>
                  <SelectItem value="individual">فرد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.type === "individual" && (
              <div className="space-y-1">
                <Label className="text-white/80">الجنس</Label>
                <Select value={form.gender} onValueChange={v => setF("gender", v as any)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {form.type === "company" && (
            <div className="space-y-1">
              <Label className="text-white/80">اسم الشركة / المؤسسة *</Label>
              <Input value={form.companyName} onChange={e => setF("companyName", e.target.value)} placeholder="الاسم الرسمي للشركة" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">{form.type === "company" ? "اسم المسؤول بالعربية *" : "الاسم بالعربية *"}</Label>
              <Input value={form.nameAr} onChange={e => setF("nameAr", e.target.value)} placeholder="الاسم الكامل" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">{form.type === "company" ? "اسم المسؤول بالإنجليزية" : "الاسم بالإنجليزية"}</Label>
              <Input value={form.nameEn} onChange={e => setF("nameEn", e.target.value)} placeholder="Full Name" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" dir="ltr" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-white/80">ملاحظات</Label>
            <Textarea value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="أي ملاحظات إضافية..." rows={3} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
          </div>
        </TabsContent>

        {/* Tab 2: Legal */}
        <TabsContent value="legal" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">رقم الترخيص</Label>
              <Input value={form.licenseNumber} onChange={e => setF("licenseNumber", e.target.value)} placeholder="رقم الترخيص الرسمي" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">رقم السجل التجاري</Label>
              <Input value={form.commercialRegisterNumber} onChange={e => setF("commercialRegisterNumber", e.target.value)} placeholder="رقم السجل التجاري" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" dir="ltr" />
            </div>
          </div>
          {/* License file upload */}
          <div className="space-y-1">
            <Label className="text-white/80">ملف الترخيص (PDF / صورة)</Label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  form.licenseFileUrl ? "bg-green-500/20 border-green-500/40 text-green-300" : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
                }`}>
                  {uploadingLicense ? <Loader2 className="h-4 w-4 animate-spin" /> : form.licenseFileUrl ? <FileText className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  <span className="text-sm">{uploadingLicense ? "جاري الرفع..." : form.licenseFileUrl ? "تم رفع ملف الترخيص" : "اختر ملف الترخيص"}</span>
                </div>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" disabled={uploadingLicense}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "license", "licenseFileUrl"); e.target.value = ""; }} />
              </label>
              {form.licenseFileUrl && (
                <button onClick={() => setF("licenseFileUrl", "")} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          {/* Commercial register file upload */}
          <div className="space-y-1">
            <Label className="text-white/80">ملف السجل التجاري (PDF / صورة)</Label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                  form.commercialRegisterUrl ? "bg-green-500/20 border-green-500/40 text-green-300" : "bg-white/5 border-white/20 text-white/60 hover:bg-white/10"
                }`}>
                  {uploadingCommercial ? <Loader2 className="h-4 w-4 animate-spin" /> : form.commercialRegisterUrl ? <FileText className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                  <span className="text-sm">{uploadingCommercial ? "جاري الرفع..." : form.commercialRegisterUrl ? "تم رفع السجل التجاري" : "اختر ملف السجل التجاري"}</span>
                </div>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" disabled={uploadingCommercial}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, "commercial_register", "commercialRegisterUrl"); e.target.value = ""; }} />
              </label>
              {form.commercialRegisterUrl && (
                <button onClick={() => setF("commercialRegisterUrl", "")} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-white/40 text-xs">الحد الأقصى لحجم الملف: 10MB | الصيغ المقبولة: PDF, JPG, PNG</p>
        </TabsContent>

        {/* Tab 3: Contact */}
        <TabsContent value="contact" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">رقم الهاتف</Label>
              <Input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="+966 5xx xxx xxxx" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">واتساب</Label>
              <Input value={form.whatsapp} onChange={e => setF("whatsapp", e.target.value)} placeholder="+966 5xx xxx xxxx" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">البريد الإلكتروني</Label>
              <Input value={form.email} onChange={e => setF("email", e.target.value)} placeholder="email@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">الموقع الإلكتروني</Label>
              <Input value={form.website} onChange={e => setF("website", e.target.value)} placeholder="https://www.example.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" dir="ltr" />
            </div>
          </div>
          <Separator className="bg-white/10" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-white/80">الدولة *</Label>
              <Select value={form.countryCode} onValueChange={v => {
                const c = WORLD_COUNTRIES.find(x => x.code === v);
                setF("countryCode", v);
                setF("country", c?.name ?? "");
                setF("city", "");
              }}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="اختر الدولة" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {WORLD_COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-white/80">المدينة</Label>
              {cities.length > 0 ? (
                <Select value={form.city} onValueChange={v => setF("city", v)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {cities.map((city: string) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={form.city} onChange={e => setF("city", e.target.value)} placeholder="اختر الدولة أولاً أو اكتب المدينة" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-white/80">العنوان التفصيلي</Label>
            <Textarea value={form.address} onChange={e => setF("address", e.target.value)} placeholder="الشارع، الحي، الرمز البريدي..." rows={2} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
          </div>
        </TabsContent>

        {/* Tab 4: Services */}
        <TabsContent value="services" className="space-y-4 mt-4">
          <div>
            <Label className="text-white text-base font-semibold">الخدمات المقدمة</Label>
            <p className="text-sm text-white/50 mt-1">اختر جميع الخدمات التي تقدمها</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {SERVICES_LIST.map(svc => (
              <button
                key={svc.value}
                type="button"
                onClick={() => toggleService(svc.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  form.services.includes(svc.value)
                    ? "border-green-400 bg-green-400/20 text-green-300"
                    : "border-white/20 hover:border-white/40 text-white/60 hover:text-white"
                }`}
              >
                {form.services.includes(svc.value) && <CheckCircle className="h-4 w-4 inline ml-1 text-green-400" />}
                {svc.label}
              </button>
            ))}
          </div>
          {form.services.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 p-3 bg-white/5 rounded-lg">
              <span className="text-xs text-white/50">المختار:</span>
              {form.services.map(s => (
                <Badge key={s} variant="secondary" className="text-xs bg-green-400/20 text-green-300 border-green-400/30">
                  {SERVICES_LIST.find(x => x.value === s)?.label ?? s}
                </Badge>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-white/10">
        <Button variant="outline" onClick={onClose} className="border-white/30 text-white hover:bg-white/10 bg-transparent">إلغاء</Button>
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="bg-green-600 hover:bg-green-700 text-white">
          {mutation.isPending ? "جاري الإرسال..." : "إضافة المورد"}
        </Button>
      </div>
    </div>
  );
}

// ─── Full Islamic Audio Playlist ─────────────────────────────────────────────
type Track = { id: number; title: string; sheikh: string; url: string; duration?: string };

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU";

const PLAYLIST: Track[] = [
  // ── رحلة المشتاق — الشيخ خالد أبو شادي (29 حلقة) ──
  { id: 1,  title: "رحلة المشتاق — الحلقة ١",  sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_01_5c5f38ca.mp3` },
  { id: 2,  title: "رحلة المشتاق — الحلقة ٢",  sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_02_72982993.mp3` },
  { id: 3,  title: "رحلة المشتاق — الحلقة ٣",  sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_03_e6bf21e9.mp3` },
  { id: 4,  title: "رحلة المشتاق — الحلقة ٤",  sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_04_15202444.mp3` },
  { id: 5,  title: "رحلة المشتاق — الحلقة ٥",  sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_05_34a6dced.mp3` },
  { id: 6,  title: "رحلة المشتاق — الحلقة ٦",  sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_06_23b1cca3.mp3` },
  { id: 7,  title: "رحلة المشتاق — الحلقة ٧",  sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_07_0d3cd382.mp3` },
  { id: 8,  title: "رحلة المشتاق — الحلقة ٨",  sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_08_ee2b4ca8.mp3` },
  { id: 9,  title: "رحلة المشتاق — الحلقة ٩",  sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_09_a0097216.mp3` },
  { id: 10, title: "رحلة المشتاق — الحلقة ١٠", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_10_e732066c.mp3` },
  { id: 11, title: "رحلة المشتاق — الحلقة ١١", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_11_50111dd4.mp3` },
  { id: 12, title: "رحلة المشتاق — الحلقة ١٢", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_12_57a479d0.mp3` },
  { id: 13, title: "رحلة المشتاق — الحلقة ١٣", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_13_abb44b09.mp3` },
  { id: 14, title: "رحلة المشتاق — الحلقة ١٤", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_14_15a2d300.mp3` },
  { id: 15, title: "رحلة المشتاق — الحلقة ١٥", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_15_5b76130b.mp3` },
  { id: 16, title: "رحلة المشتاق — الحلقة ١٦", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_16_4d6fd4bb.mp3` },
  { id: 17, title: "رحلة المشتاق — الحلقة ١٧", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_17_fe6ad7ca.mp3` },
  { id: 18, title: "رحلة المشتاق — الحلقة ١٨", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_18_b7543d9e.mp3` },
  { id: 19, title: "رحلة المشتاق — الحلقة ١٩", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_19_294f300f.mp3` },
  { id: 20, title: "رحلة المشتاق — الحلقة ٢٠", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_20_b06aa517.mp3` },
  { id: 21, title: "رحلة المشتاق — الحلقة ٢١", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_21_5a835cdc.mp3` },
  { id: 22, title: "رحلة المشتاق — الحلقة ٢٢", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_22_4bf09b1f.mp3` },
  { id: 23, title: "رحلة المشتاق — الحلقة ٢٣", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_23_4b4fd33f.mp3` },
  { id: 24, title: "رحلة المشتاق — الحلقة ٢٤", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_24_ffd7f71e.mp3` },
  { id: 25, title: "رحلة المشتاق — الحلقة ٢٥", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_25_0388cd55.mp3` },
  { id: 26, title: "رحلة المشتاق — الحلقة ٢٦", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_26_e60b824a.mp3` },
  { id: 27, title: "رحلة المشتاق — الحلقة ٢٧", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_27_8df8149b.mp3` },
  { id: 28, title: "رحلة المشتاق — الحلقة ٢٨", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_28_b233dce5.mp3` },
  { id: 29, title: "رحلة المشتاق — الحلقة ٢٩", sheikh: "خالد أبو شادي", url: `${CDN}/rihlat_mushtaq_29_a0ce086c.mp3` },
  // ── الشيخ خالد السبت — حج السلف (9 حلقات عن الحج) ──
  { id: 30, title: "حج السلف — الحلقة ١", sheikh: "خالد السبت", url: `${CDN}/hajj_salaf_01_1c4bb166.mp3` },
  { id: 31, title: "حج السلف — الحلقة ٢", sheikh: "خالد السبت", url: `${CDN}/hajj_salaf_02_c29ee285.mp3` },
  { id: 32, title: "حج السلف — الحلقة ٣", sheikh: "خالد السبت", url: `${CDN}/hajj_salaf_03_6a332343.mp3` },
  { id: 33, title: "حج السلف — الحلقة ٤", sheikh: "خالد السبت", url: `${CDN}/hajj_salaf_04_a335abb5.mp3` },
  { id: 34, title: "حج السلف — الحلقة ٥", sheikh: "خالد السبت", url: `${CDN}/hajj_salaf_05_773c6b84.mp3` },
  { id: 35, title: "حج السلف — الحلقة ٦", sheikh: "خالد السبت", url: `${CDN}/hajj_salaf_06_68826d5b.mp3` },
  { id: 36, title: "حج السلف — الحلقة ٧", sheikh: "خالد السبت", url: `${CDN}/hajj_salaf_07_d526dfef.mp3` },
  { id: 37, title: "حج السلف — الحلقة ٨", sheikh: "خالد السبت", url: `${CDN}/hajj_salaf_08_a3993402.mp3` },
  { id: 38, title: "حج السلف — الحلقة ٩", sheikh: "خالد السبت", url: `${CDN}/hajj_salaf_09_409a6278.mp3` },
  // ── أحمد عبد المنعم — موسم الحج ──
  { id: 39, title: "موسم الحج", sheikh: "أحمد عبد المنعم", url: "https://media.islamway.net/lessons/4363/922_Elmnem_Elhg.mp3", duration: "36:23" },
  // ── الشيخ خالد أبو شادي — فضل الحج والعمرة ──
  { id: 40, title: "فضل الحج والعمرة", sheikh: "خالد أبو شادي", url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/fadl-hajj-umrah_d1ecce2f.mp3", duration: "5:47" },
];

// ─── Animated Registration Counter ───────────────────────────────────────
function AnimatedCounter() {
  const BASE = 1247;
  const [count, setCount] = useState(BASE);

  useEffect(() => {
    // Increment by 1-3 every 8-18 seconds
    const tick = () => {
      setCount(c => c + Math.floor(Math.random() * 3) + 1);
      const next = 8000 + Math.random() * 10000;
      setTimeout(tick, next);
    };
    const t = setTimeout(tick, 12000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      dir="rtl"
      className="flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-amber-400/30 rounded-2xl px-5 py-2.5"
    >
      <Users className="w-4 h-4 text-amber-400 flex-shrink-0" />
      <span className="text-white/80 text-sm">
        انضم{" "}
        <span className="text-amber-300 font-black text-base tabular-nums">
          {count.toLocaleString("ar-SA")}
        </span>
        {" "}شخص بالفعل
      </span>
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
    </div>
  );
}

// ─── Full Playlist Audio Player ──────────────────────────────────────────────
function SheikhAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playlistRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const track = PLAYLIST[currentIndex];

  // Auto-play on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.55;
    const tryPlay = () => {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    const t = setTimeout(tryPlay, 1200);
    return () => clearTimeout(t);
  }, []);

  // When track changes (key prop forces re-mount), auto-play new track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    // Small delay to ensure audio element is ready after key-remount
    const t = setTimeout(() => {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }, 200);
    return () => clearTimeout(t);
  }, [currentIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  const skipNext = () => setCurrentIndex(i => (i + 1) % PLAYLIST.length);
  const skipPrev = () => setCurrentIndex(i => (i - 1 + PLAYLIST.length) % PLAYLIST.length);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setCurrentTime(audio.currentTime);
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const sheikhs = Array.from(new Set(PLAYLIST.map(t => t.sheikh)));

  return (
    <div dir="rtl" className="fixed bottom-4 right-4 z-50" style={{ width: 300 }}>
      <audio
        key={track.url}
        ref={audioRef}
        src={track.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={skipNext}
        preload="metadata"
      />

      {/* Playlist Panel */}
      {showPlaylist && (
        <div
          ref={playlistRef}
          className="mb-2 rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: "rgba(10,10,20,0.95)", border: "1px solid rgba(251,191,36,0.3)", maxHeight: 320, overflowY: "auto" }}
        >
          {sheikhs.map(sheikh => (
            <div key={sheikh}>
              <div className="px-3 py-1.5 text-xs font-bold text-amber-400/70 bg-amber-400/5 sticky top-0">
                🎙️ {sheikh}
              </div>
              {PLAYLIST.filter(t => t.sheikh === sheikh).map((t) => {
                const idx = PLAYLIST.indexOf(t);
                const active = idx === currentIndex;
                return (
                  <button
                    key={t.id}
                    onClick={() => setCurrentIndex(idx)}
                    className="w-full text-right px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors"
                    style={{ background: active ? "rgba(251,191,36,0.12)" : undefined }}
                  >
                    <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                      {active && playing
                        ? <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        : <span className="text-white/30 text-xs">{idx + 1}</span>
                      }
                    </span>
                    <span className={`flex-1 text-xs leading-snug truncate ${active ? "text-amber-300 font-semibold" : "text-white/70"}`}>
                      {t.title}
                    </span>
                    {t.duration && <span className="text-white/30 text-xs flex-shrink-0">{t.duration}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Player Card */}
      <div
        className="rounded-2xl px-4 py-3 shadow-2xl"
        style={{ background: "rgba(10,10,20,0.92)", border: "1px solid rgba(251,191,36,0.35)", backdropFilter: "blur(16px)" }}
      >
        {/* Track info */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)" }}
          >
            🎙️
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-300 font-bold text-xs leading-tight truncate">{track.title}</p>
            <p className="text-white/45 text-xs">{track.sheikh}</p>
          </div>
          {playing && !muted && (
            <div className="flex items-end gap-0.5 h-4 flex-shrink-0">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-0.5 bg-amber-400 rounded-full"
                  style={{ animation: `sound-bar-${i} ${0.5 + i * 0.1}s ease-in-out infinite alternate`, height: `${4 + i * 3}px` }} />
              ))}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full mb-2 cursor-pointer overflow-hidden" onClick={handleSeek}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #f59e0b, #fbbf24)" }} />
        </div>

        {/* Time + Controls */}
        <div className="flex items-center justify-between">
          <span className="text-white/40 text-xs tabular-nums" dir="ltr">{fmt(currentTime)} / {fmt(duration)}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowPlaylist(v => !v)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: showPlaylist ? "#fbbf24" : "rgba(255,255,255,0.5)" }}
              title="قائمة التشغيل">
              <ListMusic className="w-3.5 h-3.5" />
            </button>
            <button onClick={skipPrev} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-amber-300 hover:bg-white/10 transition-all" title="السابق">
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button onClick={togglePlay}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold transition-all hover:scale-110"
              style={{ background: "rgba(251,191,36,0.9)", color: "#000" }}
              title={playing ? "إيقاف" : "تشغيل"}>
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button onClick={skipNext} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-amber-300 hover:bg-white/10 transition-all" title="التالي">
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button onClick={toggleMute} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-amber-300 hover:bg-white/10 transition-all" title={muted ? "إلغاء كتم الصوت" : "كتم الصوت"}>
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Track counter + playlist toggle */}
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-white/25 text-xs">{currentIndex + 1} / {PLAYLIST.length} مقطع</span>
          <button onClick={() => setShowPlaylist(v => !v)} className="text-white/30 hover:text-amber-300 text-xs flex items-center gap-0.5 transition-colors">
            {showPlaylist ? <><ChevronDown className="w-3 h-3" /> إخفاء</> : <><ChevronUp className="w-3 h-3" /> القائمة كاملة</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Social Proof Toast Notifications ───────────────────────────────────────
const SOCIAL_PROOF_EVENTS = [
  // مزودو خدمات
  { type: "provider", icon: "🏢", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "شركة نور الحرمين للسياحة", sub: "انضمت كمزود خدمات عمرة", country: "🇸🇦 الرياض" },
  { type: "provider", icon: "✈️", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Al-Aqsa Travel & Tours", sub: "سجّلت كمزود رحلات جوية", country: "🇯🇴 عمّان" },
  { type: "provider", icon: "🏨", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Zamzam Hotels Group", sub: "انضمت كمزود فنادق", country: "🇪🇬 القاهرة" },
  { type: "provider", icon: "🚌", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "شركة الرحلة الميمونة", sub: "سجّلت كمزود نقل وتنقلات", country: "🇲🇦 الدار البيضاء" },
  { type: "provider", icon: "🏢", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Makkah Concierge Services", sub: "انضمت كمزود خدمات فاخرة", country: "🇬🇧 لندن" },
  { type: "provider", icon: "🗺️", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Huda Islamic Tours", sub: "سجّلت كمزود جولات دينية", country: "🇺🇸 نيويورك" },
  { type: "provider", icon: "🏨", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Baitullah Hospitality", sub: "انضمت كمزود إقامة وضيافة", country: "🇵🇰 كراتشي" },
  { type: "provider", icon: "✈️", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Ihram Airways Partners", sub: "سجّلت كمزود تذاكر طيران", country: "🇮🇩 جاكرتا" },
  { type: "provider", icon: "🏢", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Safa & Marwa Travel", sub: "انضمت كمزود باقات عمرة", country: "🇩🇪 برلين" },
  { type: "provider", icon: "🚌", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "شركة الكوثر للنقل السياحي", sub: "سجّلت كمزود مواصلات", country: "🇹🇷 إسطنبول" },
  { type: "provider", icon: "🗺️", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Nile Hajj & Umrah Co.", sub: "انضمت كمزود باقات حج", country: "🇪🇬 الإسكندرية" },
  { type: "provider", icon: "🏢", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Gulf Premium Travels", sub: "سجّلت كمزود خدمات VIP", country: "🇦🇪 دبي" },
  { type: "provider", icon: "🏨", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Medina Star Hotels", sub: "انضمت كمزود فنادق المدينة", country: "🇸🇦 المدينة المنورة" },
  { type: "provider", icon: "🏢", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Tawaf Digital Agency", sub: "سجّلت كمزود خدمات رقمية", country: "🇫🇷 باريس" },
  { type: "provider", icon: "✈️", color: "#ff8080", borderColor: "rgba(255,128,128,0.4)", text: "Blessed Journey Travels", sub: "انضمت كمزود رحلات مجمّعة", country: "🇲🇾 كوالالمبور" },
  // مسوقون
  { type: "marketer", icon: "📊", color: "#00fffb", borderColor: "rgba(0,255,251,0.35)", text: "أحمد الشريف", sub: "انضم كمسوّق رقمي", country: "🇸🇦 جدة" },
  { type: "marketer", icon: "📱", color: "#00fffb", borderColor: "rgba(0,255,251,0.35)", text: "Fatima Al-Rashidi", sub: "سجّلت كمسوّقة محتوى", country: "🇰🇼 الكويت" },
  { type: "marketer", icon: "📊", color: "#00fffb", borderColor: "rgba(0,255,251,0.35)", text: "محمد عبد الرحمن", sub: "انضم كمسوّق عمولة", country: "🇪🇬 القاهرة" },
  { type: "marketer", icon: "🎯", color: "#00fffb", borderColor: "rgba(0,255,251,0.35)", text: "Yusuf Ibrahim", sub: "سجّل كمسوّق وسائل تواصل", country: "🇬🇧 مانشستر" },
  { type: "marketer", icon: "📱", color: "#00fffb", borderColor: "rgba(0,255,251,0.35)", text: "سارة الحمدان", sub: "انضمت كمسوّقة تابعة", country: "🇶🇦 الدوحة" },
  { type: "marketer", icon: "🎯", color: "#00fffb", borderColor: "rgba(0,255,251,0.35)", text: "Omar Khalil", sub: "سجّل كمسوّق إلكتروني", country: "🇺🇸 شيكاغو" },
  { type: "marketer", icon: "📊", color: "#00fffb", borderColor: "rgba(0,255,251,0.35)", text: "نورة السبيعي", sub: "انضمت كمسوّقة مؤثِّرة", country: "🇸🇦 الرياض" },
  { type: "marketer", icon: "📱", color: "#00fffb", borderColor: "rgba(0,255,251,0.35)", text: "Bilal Hussain", sub: "سجّل كمسوّق تابع", country: "🇵🇰 لاهور" },
  { type: "marketer", icon: "🎯", color: "#00fffb", borderColor: "rgba(0,255,251,0.35)", text: "Aisha Bint Nasser", sub: "انضمت كمسوّقة محتوى ديني", country: "🇮🇩 باندونغ" },
  { type: "marketer", icon: "📊", color: "#00fffb", borderColor: "rgba(0,255,251,0.35)", text: "خالد المطيري", sub: "سجّل كمسوّق عمولة", country: "🇸🇦 الدمام" },
  // مشتركو القائمة البريدية
  { type: "waitlist", icon: "📧", color: "#a3e635", borderColor: "rgba(163,230,53,0.35)", text: "a***@gmail.com", sub: "سجّل بريده لاستقبال إشعار الإطلاق", country: "🇸🇦 مكة المكرمة" },
  { type: "waitlist", icon: "📧", color: "#a3e635", borderColor: "rgba(163,230,53,0.35)", text: "m***@hotmail.com", sub: "انضم لقائمة الانتظار", country: "🇦🇪 أبوظبي" },
  { type: "waitlist", icon: "📧", color: "#a3e635", borderColor: "rgba(163,230,53,0.35)", text: "f***@yahoo.com", sub: "سجّل بريده لاستقبال إشعار الإطلاق", country: "🇪🇬 الجيزة" },
  { type: "waitlist", icon: "📧", color: "#a3e635", borderColor: "rgba(163,230,53,0.35)", text: "h***@outlook.com", sub: "انضم لقائمة الانتظار", country: "🇬🇧 لندن" },
  { type: "waitlist", icon: "📧", color: "#a3e635", borderColor: "rgba(163,230,53,0.35)", text: "k***@gmail.com", sub: "سجّل بريده لاستقبال إشعار الإطلاق", country: "🇹🇷 إسطنبول" },
  { type: "waitlist", icon: "📧", color: "#a3e635", borderColor: "rgba(163,230,53,0.35)", text: "n***@icloud.com", sub: "انضم لقائمة الانتظار", country: "🇺🇸 لوس أنجلوس" },
  { type: "waitlist", icon: "📧", color: "#a3e635", borderColor: "rgba(163,230,53,0.35)", text: "r***@gmail.com", sub: "سجّل بريده لاستقبال إشعار الإطلاق", country: "🇲🇾 كوالالمبور" },
  { type: "waitlist", icon: "📧", color: "#a3e635", borderColor: "rgba(163,230,53,0.35)", text: "s***@proton.me", sub: "انضم لقائمة الانتظار", country: "🇩🇪 برلين" },
  { type: "waitlist", icon: "📧", color: "#a3e635", borderColor: "rgba(163,230,53,0.35)", text: "y***@gmail.com", sub: "سجّل بريده لاستقبال إشعار الإطلاق", country: "🇵🇰 إسلام آباد" },
  { type: "waitlist", icon: "📧", color: "#a3e635", borderColor: "rgba(163,230,53,0.35)", text: "z***@yahoo.com", sub: "انضم لقائمة الانتظار", country: "🇫🇷 باريس" },
];

type SocialProofItem = typeof SOCIAL_PROOF_EVENTS[number];

function SocialProofToast({ item, onClose }: { item: SocialProofItem; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      dir="rtl"
      className="flex items-start gap-3 bg-black/75 backdrop-blur-md rounded-2xl px-4 py-3 shadow-2xl"
      style={{
        border: `1px solid ${item.borderColor}`,
        minWidth: 260,
        maxWidth: 320,
        animation: "sp-slide-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
      }}
    >
      {/* Icon bubble */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${item.color}18`, border: `1px solid ${item.borderColor}` }}
      >
        {item.icon}
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{item.text}</p>
        <p className="text-white/55 text-xs mt-0.5 leading-snug">{item.sub}</p>
        <p className="text-xs mt-1 font-medium" style={{ color: item.color }}>{item.country}</p>
      </div>
      {/* Close */}
      <button
        onClick={onClose}
        className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl"
        style={{ background: item.color, animation: "sp-progress 5s linear forwards", transformOrigin: "right" }}
      />
    </div>
  );
}

function SocialProofContainer() {
  const [queue, setQueue] = useState<(SocialProofItem & { id: number })[]>([]);
  const counterRef = { current: 0 };

  useEffect(() => {
    // Shuffle events for randomness
    const shuffled = [...SOCIAL_PROOF_EVENTS].sort(() => Math.random() - 0.5);
    let idx = 0;

    const show = () => {
      const item = shuffled[idx % shuffled.length];
      idx++;
      const id = ++counterRef.current;
      setQueue(q => [...q.slice(-2), { ...item, id }]); // keep max 3 visible
    };

    // First toast after 3s, then every 6-12s randomly
    const firstTimer = setTimeout(() => {
      show();
      const schedule = () => {
        const delay = 6000 + Math.random() * 6000;
        return setTimeout(() => { show(); schedule(); }, delay);
      };
      schedule();
    }, 3000);

    return () => clearTimeout(firstTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = (id: number) => setQueue(q => q.filter(x => x.id !== id));

  if (queue.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-4 z-50 flex flex-col gap-2 items-start"
      style={{ pointerEvents: "none" }}
    >
      {queue.map(item => (
        <div key={item.id} style={{ pointerEvents: "auto" }}>
          <SocialProofToast item={item} onClose={() => dismiss(item.id)} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Maintenance Page ────────────────────────────────────────────────────
// ─── Countdown Timer Component ──────────────────────────────────────────────────────────
function CountdownTimer({ launchDate }: { launchDate: string | null }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    if (!launchDate) return;
    const target = new Date(launchDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [launchDate]);

  if (!launchDate) return null;

  if (timeLeft.expired) {
    return (
      <div className="text-center py-3">
        <p className="text-amber-300 font-bold text-xl">✨ انطلقنا! مرحباً بكم ✨</p>
      </div>
    );
  }

  const units = [
    { label: "يوم", value: timeLeft.days },
    { label: "ساعة", value: timeLeft.hours },
    { label: "دقيقة", value: timeLeft.minutes },
    { label: "ثانية", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 text-amber-400/70 text-sm">
        <Timer className="h-4 w-4" />
        <span>ينطلق الموقع خلال</span>
      </div>
      <div className="flex gap-3 justify-center">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center">
            <div className="bg-black/40 backdrop-blur-sm border border-amber-400/30 rounded-xl w-16 h-16 flex items-center justify-center">
              <span className="text-3xl font-black text-amber-300 tabular-nums">
                {String(value).padStart(2, "0")}
              </span>
            </div>
            <span className="text-white/50 text-xs mt-1">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { data: countData } = trpc.waitlist.count.useQuery(undefined, { refetchOnWindowFocus: false });
  const mutation = trpc.waitlist.subscribe.useMutation({
    onSuccess: () => setSubscribed(true),
    onError: (e) => {
      if (e.message === "هذا البريد مسجّل بالفعل") {
        toast.error("هذا البريد مسجّل بالفعل 😊");
      } else {
        toast.error(e.message || "حدث خطأ، يرجى المحاولة مرة أخرى");
      }
    },
  });

  if (subscribed) {
    return (
      <div className="text-center py-3 px-6 bg-amber-500/10 border border-amber-400/30 rounded-2xl backdrop-blur-sm">
        <CheckCircle className="h-8 w-8 text-amber-400 mx-auto mb-2" />
        <p className="text-amber-300 font-semibold text-lg">تم تسجيلك بنجاح!</p>
        <p className="text-white/60 text-sm mt-1">سيصلك إشعار عند الإطلاق</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-amber-400/20 rounded-2xl px-6 py-5 w-full max-w-md mx-auto">
      <p className="text-amber-300 font-semibold text-center mb-1">كن أول من يعلم</p>
      <p className="text-white/50 text-sm text-center mb-4">سجّل بريدك لتصلك إشعار فور الإطلاق{countData && countData.count > 0 ? ` • ${countData.count.toLocaleString("ar")} شخص مسجّل` : ""}</p>
      <div className="flex flex-col gap-2">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="اسمك (اختياري)"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-right"
          dir="rtl"
        />
        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && email && mutation.mutate({ email, name: name || undefined })}
            placeholder="بريدك الإلكتروني"
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            dir="ltr"
          />
          <button
            onClick={() => email && mutation.mutate({ email, name: name || undefined })}
            disabled={mutation.isPending || !email}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold rounded-lg transition-all whitespace-nowrap"
          >
            {mutation.isPending ? "جاري..." : "أبلغني"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reviews Marquee Strip ───────────────────────────────────────────────────
function ReviewsMarqueeStrip({ reviews, stats }: {
  reviews: Array<{ id: number; reviewerName?: string | null; rating?: number | null; reviewText?: string | null; productName?: string | null }>;
  stats?: { average: number; total: number; distribution?: Record<number, number> } | null;
}) {
  const [paused, setPaused] = useState(false);

  const filtered = reviews.filter(r => r.reviewText && r.reviewText.length > 5);
  // 2x duplication: translateX(-50%) moves exactly one full set — perfect seamless loop
  const doubled = [...filtered, ...filtered];

  if (filtered.length === 0) return null;

  const CARD_W = 240;
  const CARD_GAP = 12;
  const trackWidth = filtered.length * (CARD_W + CARD_GAP);
  const durationSec = Math.max(30, trackWidth / 80);

  return (
    <div style={{ padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12, padding: '0 16px' }}>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.3))' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="12" height="12" viewBox="0 0 20 20" fill="#fbbf24">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
          <span style={{ color: '#fbbf24', fontSize: 11, fontWeight: 700 }}>{stats?.average ?? '4.94'}/5</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>— {stats?.total ?? filtered.length}+ تقييم حقيقي</span>
          <button
            onClick={() => setPaused(p => !p)}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999, padding: '2px 10px', color: 'rgba(255,255,255,0.6)', fontSize: 10, cursor: 'pointer' }}
          >
            {paused ? '▶ تشغيل' : '⏸ إيقاف'}
          </button>
        </div>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(to left, transparent, rgba(251,191,36,0.3))' }} />
      </div>
      {/* Bulletproof marquee: translateX(-50%) on doubled array = perfect seamless loop */}
      <div
        className="go-marquee-wrapper"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, zIndex: 2, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(0,0,0,0.7), transparent)' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, zIndex: 2, pointerEvents: 'none', background: 'linear-gradient(to left, rgba(0,0,0,0.7), transparent)' }} />
        {/* Track: 2x cards, animation moves -50% = exactly one full set */}
        <div
          className={`go-marquee-track${paused ? ' paused' : ''}`}
          style={{
            gap: CARD_GAP,
            padding: '8px 16px',
            '--marquee-duration': `${durationSec}s`,
          } as React.CSSProperties}
        >
          {doubled.map((r, idx) => (
            <div key={`mr-${idx}`} style={{ flexShrink: 0, width: CARD_W, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="10" height="10" viewBox="0 0 20 20" fill={s <= (r.rating ?? 5) ? '#fbbf24' : 'rgba(255,255,255,0.2)'}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, lineHeight: 1.5, fontStyle: 'italic', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                "{r.reviewText && r.reviewText.length > 100 ? r.reviewText.substring(0, 100) + '…' : r.reviewText}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                  {(r.reviewerName ?? 'ع')[0]}
                </div>
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.reviewerName ?? 'عميل كريم'}</div>
                  {r.productName && <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.productName}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const [activeForm, setActiveForm] = useState<"marketer" | "supplier" | null>(null);

  const { data: settings } = trpc.siteSettings.getStatus.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { data: zidReviews } = trpc.reviews.getZidReviews.useQuery({ limit: 500, minRating: 1 });
  const { data: reviewStats } = trpc.reviews.getStats.useQuery();

  const dhikrText = DHIKR_LIST.join("   ✦   ");

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" dir="rtl">
      {/* Social Proof Toasts */}
      <SocialProofContainer />
      {/* Sheikh Audio Player */}
      <SheikhAudioPlayer />
      {/* Background: Kaaba Tawaf video with photo fallback */}
      <div className="fixed inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={KAABA_PHOTO}
          className="w-full h-full object-cover object-center"
          style={{ filter: "brightness(0.65)" }}
        >
          <source src={KAABA_VIDEO} type="video/mp4" />
        </video>
        {/* Radial glow overlay */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(255,200,50,0.08) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.8) 100%)"
        }} />
      </div>

      {/* Dhikr ticker */}
      <div className="relative z-10 bg-black/60 backdrop-blur-sm border-b border-amber-500/30 py-2 overflow-hidden" dir="ltr">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee-rtl 35s linear infinite" }}>
          <span className="text-amber-300 text-[23px] font-bold text-center px-8">{dhikrText}</span>
          <span className="text-amber-300 text-[23px] font-bold text-center px-8">{dhikrText}</span>
          <span className="text-amber-300 text-[23px] font-bold text-center px-8">{dhikrText}</span>
        </div>
      </div>

      {/* News Ticker — below dhikr */}
      <div className="relative z-10">
        <NewsTickerBar
          bgClass="bg-black/70 backdrop-blur-sm"
          textClass="text-white/85"
          labelBgClass="bg-amber-500"
          labelTextClass="text-black"
          heightClass="h-8"
          speed={55}
          language="ar"
          category="all"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-[calc(100vh-60px)]">

        {/* Top section: Logo + Brand + Slogan */}
        <div className="flex flex-col items-center justify-center pt-10 pb-6 px-4">
          {/* Logo with glow pulse animation */}
          <div className="mb-4" style={{ animation: "logo-pulse 3s ease-in-out infinite" }}>
            <img
              src={LOGO_URL}
              alt="جو عمرة"
              className="object-contain"
              style={{
                width: "140px",
                height: "140px",
                opacity: 1,
                filter: "drop-shadow(0 0 24px rgba(251,191,36,1)) drop-shadow(0 0 60px rgba(251,191,36,0.6)) brightness(1.15)"
              }}
            />
          </div>

          {/* Brand name with shimmer glow */}
          <h1
            className="text-6xl md:text-8xl font-black text-amber-400 drop-shadow-2xl mb-2 tracking-wide"
            style={{ animation: "text-shimmer 4s ease-in-out infinite" }}
          >
            جو عمرة
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-light">شريكك الموثوق نحو بيت الله الحرام</p>
        </div>

        {/* Middle section: Main message */}
        <div className="flex justify-center px-4 py-4">
          <div className="text-center max-w-2xl w-full">
            <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6">
              <p className="text-2xl md:text-3xl font-bold text-amber-300 mb-3">
                انتظروا منصة جو عمرة في حلتها الجديدة
              </p>
              {settings?.message && settings.message !== "انتظروا منصة جو عمرة في حلتها الجديدة" && (
                <p className="text-white/70 text-lg">
                  {settings.message}
                </p>
              )}
              {!settings?.message && (
                <p className="text-white/70 text-lg">
                  نعمل على تطوير منصتنا لتقديم أفضل تجربة لخدمة ضيوف الرحمن
                </p>
              )}
              {settings?.launchDate && (
                <div className="mt-5 pt-5 border-t border-white/10">
                  <CountdownTimer launchDate={settings.launchDate} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form area */}
        {activeForm === "marketer" && (
          <div className="flex justify-center px-4 py-4">
            <div className="w-full max-w-2xl">
              <MarketerForm onClose={() => setActiveForm(null)} />
            </div>
          </div>
        )}
        {activeForm === "supplier" && (
          <div className="flex justify-center px-4 py-4">
            <div className="w-full max-w-3xl">
              <SupplierForm onClose={() => setActiveForm(null)} />
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!activeForm && (
          <div className="flex justify-center px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveForm("marketer")}
                className="flex items-center justify-center gap-2 w-60 bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/60 font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
                style={{ color: "#00fffb" }}
              >
                <TrendingUp className="h-5 w-5" />
                انضم لفرق المسوقين
              </button>
              <button
                onClick={() => setActiveForm("supplier")}
                className="flex items-center justify-center gap-2 w-60 font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 bg-red-500/20 hover:bg-red-500/35 border border-red-400/60"
                style={{ color: "#ff8080" }}
              >
                <Building2 className="h-5 w-5" />
                انضم لمقدمي الخدمات
              </button>
            </div>
          </div>
        )}

        {/* Email waitlist */}
        {!activeForm && (
          <div className="flex justify-center px-4 py-4">
            <WaitlistForm />
          </div>
        )}

        {/* Contact buttons */}
        <div className="flex justify-center px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/966557123435"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-60 bg-[#00ff5e]/20 hover:bg-[#00ff5e]/30 border border-[#00ff5e]/50 font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
              style={{ color: "#00ff5e" }}
            >
              <MessageCircle className="h-5 w-5" />
              تواصل عبر واتساب
            </a>
            <a
              href="mailto:admin@go-umrah.com"
              className="flex items-center justify-center gap-2 w-60 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
            >
              <Mail className="h-5 w-5" />
              admin@go-umrah.com
            </a>
          </div>
        </div>

        {/* Subtle Reviews Strip — infinite JS marquee */}
        {zidReviews && zidReviews.length > 0 && (
          <ReviewsMarqueeStrip reviews={zidReviews} stats={reviewStats} />
        )}

        {/* Footer */}
        <div className="flex-1 flex flex-col items-center justify-end pb-4 gap-3">
          <AnimatedCounter />
          <p className="text-white/30 text-sm">© {new Date().getFullYear()} جو عمرة — جميع الحقوق محفوظة</p>
        </div>
      </div>

      <style>{`
        @keyframes marquee-rtl {
          0% { transform: translateX(-33.33%); }
          100% { transform: translateX(0%); }
        }
        @keyframes logo-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes text-shimmer {
          0%, 100% { text-shadow: 0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(251,191,36,0.3); }
          50% { text-shadow: 0 0 60px rgba(251,191,36,1), 0 0 120px rgba(251,191,36,0.6), 0 0 180px rgba(251,191,36,0.3); }
        }
        @keyframes sp-slide-in {
          0%   { opacity: 0; transform: translateX(-40px) scale(0.92); }
          100% { opacity: 1; transform: translateX(0)   scale(1); }
        }
        @keyframes sp-progress {
          0%   { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }
        @keyframes sound-bar-1 { 0% { height: 4px; } 100% { height: 12px; } }
        @keyframes sound-bar-2 { 0% { height: 7px; } 100% { height: 16px; } }
        @keyframes sound-bar-3 { 0% { height: 10px; } 100% { height: 8px;  } }
        @keyframes sound-bar-4 { 0% { height: 5px;  } 100% { height: 14px; } }
      `}</style>
    </div>
  );
}
