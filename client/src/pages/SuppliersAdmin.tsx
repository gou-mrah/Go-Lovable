import { useState, useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Building2, User, Plus, Search, Edit, Trash2, CheckCircle, XCircle,
  Clock, Phone, Mail, Globe, MapPin, FileText, Upload, Award,
  RefreshCw, Eye, ShieldCheck, ShieldX, AlertCircle,
} from "lucide-react";

// ─── World Countries & Cities ────────────────────────────────────────────────
const WORLD_COUNTRIES = [
  { code: "SA", name: "المملكة العربية السعودية", cities: ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الطائف", "تبوك", "أبها", "نجران"] },
  { code: "EG", name: "مصر", cities: ["القاهرة", "الإسكندرية", "الجيزة", "شرم الشيخ", "الأقصر", "أسوان", "الغردقة", "المنصورة", "طنطا", "الإسماعيلية"] },
  { code: "AE", name: "الإمارات العربية المتحدة", cities: ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين", "العين"] },
  { code: "KW", name: "الكويت", cities: ["مدينة الكويت", "الفروانية", "حولي", "الجهراء", "مبارك الكبير", "الأحمدي"] },
  { code: "QA", name: "قطر", cities: ["الدوحة", "الريان", "الوكرة", "الخور", "الشمال"] },
  { code: "BH", name: "البحرين", cities: ["المنامة", "المحرق", "الرفاع", "مدينة عيسى", "مدينة حمد"] },
  { code: "OM", name: "عُمان", cities: ["مسقط", "صلالة", "نزوى", "صحار", "مطرح", "صور"] },
  { code: "JO", name: "الأردن", cities: ["عمّان", "الزرقاء", "إربد", "العقبة", "المفرق", "الكرك"] },
  { code: "LB", name: "لبنان", cities: ["بيروت", "طرابلس", "صيدا", "صور", "زحلة", "جبيل"] },
  { code: "SY", name: "سوريا", cities: ["دمشق", "حلب", "حمص", "حماة", "اللاذقية", "دير الزور"] },
  { code: "IQ", name: "العراق", cities: ["بغداد", "البصرة", "الموصل", "أربيل", "النجف", "كربلاء"] },
  { code: "YE", name: "اليمن", cities: ["صنعاء", "عدن", "تعز", "الحديدة", "إب", "ذمار"] },
  { code: "LY", name: "ليبيا", cities: ["طرابلس", "بنغازي", "مصراتة", "الزاوية", "البيضاء"] },
  { code: "TN", name: "تونس", cities: ["تونس", "صفاقس", "سوسة", "القيروان", "بنزرت", "قابس"] },
  { code: "DZ", name: "الجزائر", cities: ["الجزائر", "وهران", "قسنطينة", "عنابة", "سطيف", "باتنة"] },
  { code: "MA", name: "المغرب", cities: ["الرباط", "الدار البيضاء", "فاس", "مراكش", "أكادير", "طنجة"] },
  { code: "SD", name: "السودان", cities: ["الخرطوم", "أم درمان", "بورتسودان", "كسلا", "الفاشر"] },
  { code: "SO", name: "الصومال", cities: ["مقديشو", "هرجيسا", "بوصاصو", "كسمايو"] },
  { code: "MR", name: "موريتانيا", cities: ["نواكشوط", "نواذيبو", "روصو", "كيفة"] },
  { code: "TR", name: "تركيا", cities: ["إسطنبول", "أنقرة", "إزمير", "بورصة", "أنطاليا", "أضنة", "قونية"] },
  { code: "PK", name: "باكستان", cities: ["كراتشي", "لاهور", "إسلام آباد", "فيصل آباد", "راولبندي"] },
  { code: "IN", name: "الهند", cities: ["نيودلهي", "مومباي", "بنغالور", "حيدر آباد", "تشيناي", "كولكاتا"] },
  { code: "ID", name: "إندونيسيا", cities: ["جاكرتا", "سورابايا", "باندونغ", "ميدان", "بالي"] },
  { code: "MY", name: "ماليزيا", cities: ["كوالالمبور", "جورج تاون", "إيبوه", "جوهور باهرو", "كوتا كينابالو"] },
  { code: "BD", name: "بنغلاديش", cities: ["دكا", "شيتاغونغ", "خولنا", "راجشاهي", "سيلهيت"] },
  { code: "NG", name: "نيجيريا", cities: ["لاغوس", "كانو", "إبادان", "أبوجا", "بورت هاركورت"] },
  { code: "SN", name: "السنغال", cities: ["داكار", "ثيس", "كاولاك", "زيغينشور"] },
  { code: "ML", name: "مالي", cities: ["باماكو", "سيكاسو", "كاتي", "كوليكورو"] },
  { code: "GH", name: "غانا", cities: ["أكرا", "كوماسي", "تامالي", "تيما"] },
  { code: "GB", name: "المملكة المتحدة", cities: ["لندن", "مانشستر", "برمنغهام", "ليدز", "غلاسكو", "ليفربول"] },
  { code: "US", name: "الولايات المتحدة", cities: ["نيويورك", "لوس أنجلوس", "شيكاغو", "هيوستن", "فينيكس"] },
  { code: "CA", name: "كندا", cities: ["تورنتو", "مونتريال", "كالغاري", "أوتاوا", "إدمونتون", "فانكوفر"] },
  { code: "FR", name: "فرنسا", cities: ["باريس", "مرسيليا", "ليون", "تولوز", "نيس", "نانت"] },
  { code: "DE", name: "ألمانيا", cities: ["برلين", "هامبورغ", "ميونيخ", "كولونيا", "فرانكفورت"] },
  { code: "AU", name: "أستراليا", cities: ["سيدني", "ملبورن", "بريسبان", "بيرث", "أديلايد"] },
  { code: "CN", name: "الصين", cities: ["بكين", "شنغهاي", "غوانغتشو", "شنتشن", "تشنغدو"] },
  { code: "RU", name: "روسيا", cities: ["موسكو", "سانت بطرسبرغ", "نوفوسيبيرسك", "يكاترينبورغ"] },
  { code: "IR", name: "إيران", cities: ["طهران", "مشهد", "أصفهان", "كرج", "تبريز", "شيراز"] },
  { code: "AF", name: "أفغانستان", cities: ["كابول", "قندهار", "هرات", "مزار شريف"] },
  { code: "ET", name: "إثيوبيا", cities: ["أديس أبابا", "دير داوا", "جيما", "غوندار"] },
  { code: "TZ", name: "تنزانيا", cities: ["دار السلام", "دودوما", "أروشا"] },
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

const APPROVAL_CONFIG = {
  pending: { label: "تحت المراجعة", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  approved: { label: "تم الاعتماد", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
};

type SupplierForm = {
  nameAr: string; nameEn: string;
  type: "individual" | "company";
  gender: "male" | "female";
  companyName: string;
  licenseNumber: string;
  commercialRegisterNumber: string;
  licenseFileUrl: string;
  commercialRegisterUrl: string;
  phone: string; whatsapp: string; email: string; website: string;
  country: string; countryCode: string; city: string; address: string;
  services: string[];
  notes: string;
};

const DEFAULT_FORM: SupplierForm = {
  nameAr: "", nameEn: "", type: "company", gender: "male",
  companyName: "", licenseNumber: "", commercialRegisterNumber: "",
  licenseFileUrl: "", commercialRegisterUrl: "",
  phone: "", whatsapp: "", email: "", website: "",
  country: "", countryCode: "", city: "", address: "",
  services: [], notes: "",
};

// ─── File Upload Field ────────────────────────────────────────────────────────
function FileUploadField({
  label, value, onChange, uploading, onUpload,
}: {
  label: string; value: string; onChange: (url: string) => void;
  uploading: boolean; onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
        {value ? (
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-700 font-medium">تم الرفع بنجاح</span>
            <a href={value} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">عرض الملف</a>
            <button type="button" onClick={() => onChange("")} className="text-xs text-red-500 hover:text-red-700">حذف</button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">PDF أو صورة (JPG, PNG)</p>
            <Button
              type="button" variant="outline" size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <RefreshCw className="h-4 w-4 animate-spin ml-1" /> : <Upload className="h-4 w-4 ml-1" />}
              {uploading ? "جاري الرفع..." : "اختر ملف"}
            </Button>
          </div>
        )}
        <input
          ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
        />
      </div>
    </div>
  );
}

// ─── Supplier Form Dialog ─────────────────────────────────────────────────────
function SupplierFormDialog({
  open, onClose, editing, onSaved,
}: { open: boolean; onClose: () => void; editing: any | null; onSaved: () => void }) {
  const [form, setForm] = useState<SupplierForm>(() =>
    editing ? {
      nameAr: editing.nameAr ?? "", nameEn: editing.nameEn ?? "",
      type: editing.type ?? "company", gender: editing.gender ?? "male",
      companyName: editing.companyName ?? "",
      licenseNumber: editing.licenseNumber ?? "",
      commercialRegisterNumber: editing.commercialRegisterNumber ?? "",
      licenseFileUrl: editing.licenseFileUrl ?? "",
      commercialRegisterUrl: editing.commercialRegisterUrl ?? "",
      phone: editing.phone ?? "", whatsapp: editing.whatsapp ?? "",
      email: editing.email ?? "", website: editing.website ?? "",
      country: editing.country ?? "", countryCode: editing.countryCode ?? "",
      city: editing.city ?? "", address: editing.address ?? "",
      services: (editing.services as string[]) ?? [],
      notes: editing.notes ?? "",
    } : DEFAULT_FORM
  );
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingRegister, setUploadingRegister] = useState(false);

  const utils = trpc.useUtils();
  const addMutation = trpc.suppliers.add.useMutation({
    onSuccess: (data) => {
      toast.success(`تم إضافة المورد بنجاح — الرمز المرجعي: ${data.code}`);
      utils.suppliers.list.invalidate();
      utils.suppliers.stats.invalidate();
      onSaved();
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.suppliers.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات المورد");
      utils.suppliers.list.invalidate();
      onSaved();
    },
    onError: (e) => toast.error(e.message),
  });
  const uploadMutation = trpc.suppliers.uploadFile.useMutation();

  const setF = useCallback((field: keyof SupplierForm, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);

  const handleUpload = async (file: File, category: "license" | "commercial_register") => {
    const setter = category === "license" ? setUploadingLicense : setUploadingRegister;
    setter(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        const result = await uploadMutation.mutateAsync({
          fileBase64: base64,
          fileName: file.name,
          fileType: file.type,
          fileCategory: category,
        });
        if (category === "license") setF("licenseFileUrl", result.url);
        else setF("commercialRegisterUrl", result.url);
        toast.success("تم رفع الملف بنجاح");
        setter(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("فشل رفع الملف");
      setter(false);
    }
  };

  const selectedCountry = WORLD_COUNTRIES.find(c => c.code === form.countryCode);
  const cities = selectedCountry?.cities ?? [];

  const toggleService = (svc: string) => {
    setF("services", form.services.includes(svc)
      ? form.services.filter(s => s !== svc)
      : [...form.services, svc]
    );
  };

  const handleSubmit = () => {
    if (!form.nameAr.trim()) { toast.error("الاسم بالعربية مطلوب"); return; }
    const payload = {
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
    };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else addMutation.mutate(payload);
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {form.type === "company" ? <Building2 className="h-5 w-5 text-blue-600" /> : <User className="h-5 w-5 text-purple-600" />}
            {editing ? `تعديل: ${editing.nameAr}` : "إضافة مورد / مزود جديد"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-2">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
            <TabsTrigger value="legal">الوثائق القانونية</TabsTrigger>
            <TabsTrigger value="contact">التواصل والموقع</TabsTrigger>
            <TabsTrigger value="services">الخدمات</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>نوع المورد *</Label>
                <Select value={form.type} onValueChange={v => setF("type", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">شركة / مؤسسة</SelectItem>
                    <SelectItem value="individual">فرد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.type === "individual" && (
                <div className="space-y-1">
                  <Label>الجنس</Label>
                  <Select value={form.gender} onValueChange={v => setF("gender", v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label>اسم الشركة / المؤسسة *</Label>
                <Input value={form.companyName} onChange={e => setF("companyName", e.target.value)} placeholder="الاسم الرسمي للشركة" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>{form.type === "company" ? "اسم المسؤول بالعربية *" : "الاسم بالعربية *"}</Label>
                <Input value={form.nameAr} onChange={e => setF("nameAr", e.target.value)} placeholder="الاسم الكامل" />
              </div>
              <div className="space-y-1">
                <Label>{form.type === "company" ? "اسم المسؤول بالإنجليزية" : "الاسم بالإنجليزية"}</Label>
                <Input value={form.nameEn} onChange={e => setF("nameEn", e.target.value)} placeholder="Full Name" dir="ltr" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>ملاحظات</Label>
              <Textarea value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="أي ملاحظات إضافية..." rows={3} />
            </div>
          </TabsContent>

          {/* Tab 2: Legal */}
          <TabsContent value="legal" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>رقم الترخيص</Label>
                <Input value={form.licenseNumber} onChange={e => setF("licenseNumber", e.target.value)} placeholder="رقم الترخيص الرسمي" dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label>رقم السجل التجاري</Label>
                <Input value={form.commercialRegisterNumber} onChange={e => setF("commercialRegisterNumber", e.target.value)} placeholder="رقم السجل التجاري" dir="ltr" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FileUploadField
                label="رفع الترخيص (PDF / صورة)"
                value={form.licenseFileUrl}
                onChange={url => setF("licenseFileUrl", url)}
                uploading={uploadingLicense}
                onUpload={f => handleUpload(f, "license")}
              />
              <FileUploadField
                label="رفع السجل التجاري (PDF / صورة)"
                value={form.commercialRegisterUrl}
                onChange={url => setF("commercialRegisterUrl", url)}
                uploading={uploadingRegister}
                onUpload={f => handleUpload(f, "commercial_register")}
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>بعد إضافة المورد، ستكون حالته <strong>"تحت المراجعة"</strong> حتى يتم اعتماده من الإدارة وتخصيص رمز مرجعي له.</span>
            </div>
          </TabsContent>

          {/* Tab 3: Contact */}
          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>رقم الهاتف</Label>
                <Input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="+966 5xx xxx xxxx" dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label>واتساب</Label>
                <Input value={form.whatsapp} onChange={e => setF("whatsapp", e.target.value)} placeholder="+966 5xx xxx xxxx" dir="ltr" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="email@example.com" dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label>الموقع الإلكتروني</Label>
                <Input value={form.website} onChange={e => setF("website", e.target.value)} placeholder="https://www.example.com" dir="ltr" />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>الدولة *</Label>
                <Select
                  value={form.countryCode}
                  onValueChange={v => {
                    const c = WORLD_COUNTRIES.find(x => x.code === v);
                    setF("countryCode", v);
                    setF("country", c?.name ?? "");
                    setF("city", "");
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="اختر الدولة" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {WORLD_COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>المدينة</Label>
                {cities.length > 0 ? (
                  <Select value={form.city} onValueChange={v => setF("city", v)}>
                    <SelectTrigger><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.city} onChange={e => setF("city", e.target.value)} placeholder="اختر الدولة أولاً أو اكتب المدينة" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>العنوان التفصيلي</Label>
              <Textarea value={form.address} onChange={e => setF("address", e.target.value)} placeholder="الشارع، الحي، الرمز البريدي..." rows={2} />
            </div>
          </TabsContent>

          {/* Tab 4: Services */}
          <TabsContent value="services" className="space-y-4 mt-4">
            <div>
              <Label className="text-base font-semibold">الخدمات المقدمة</Label>
              <p className="text-sm text-muted-foreground mt-1">اختر جميع الخدمات التي يقدمها هذا المورد</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SERVICES_LIST.map(svc => (
                <button
                  key={svc.value}
                  type="button"
                  onClick={() => toggleService(svc.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.services.includes(svc.value)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {form.services.includes(svc.value) && <CheckCircle className="h-4 w-4 inline ml-1 text-primary" />}
                  {svc.label}
                </button>
              ))}
            </div>
            {form.services.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-muted/30 rounded-lg">
                <span className="text-xs text-muted-foreground">المختار:</span>
                {form.services.map(s => (
                  <Badge key={s} variant="secondary" className="text-xs">
                    {SERVICES_LIST.find(x => x.value === s)?.label ?? s}
                  </Badge>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 justify-end mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <RefreshCw className="h-4 w-4 animate-spin ml-1" />}
            {editing ? "حفظ التعديلات" : "إضافة المورد"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Approval Dialog ──────────────────────────────────────────────────────────
function ApprovalDialog({
  open, onClose, supplier, action, onDone,
}: { open: boolean; onClose: () => void; supplier: any; action: "approve" | "reject"; onDone: () => void }) {
  const [notes, setNotes] = useState("");
  const utils = trpc.useUtils();

  const approveMutation = trpc.suppliers.approve.useMutation({
    onSuccess: () => {
      toast.success(`تم اعتماد المورد "${supplier?.nameAr}" — الرمز: ${supplier?.code}`);
      utils.suppliers.list.invalidate();
      utils.suppliers.stats.invalidate();
      onDone();
    },
    onError: e => toast.error(e.message),
  });
  const rejectMutation = trpc.suppliers.reject.useMutation({
    onSuccess: () => {
      toast.success(`تم رفض طلب "${supplier?.nameAr}"`);
      utils.suppliers.list.invalidate();
      utils.suppliers.stats.invalidate();
      onDone();
    },
    onError: e => toast.error(e.message),
  });

  const handleConfirm = () => {
    if (!supplier) return;
    if (action === "approve") approveMutation.mutate({ id: supplier.id, notes: notes || undefined });
    else rejectMutation.mutate({ id: supplier.id, notes: notes || undefined });
  };

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className={action === "approve" ? "text-green-700 flex items-center gap-2" : "text-red-700 flex items-center gap-2"}>
            {action === "approve" ? <><ShieldCheck className="h-5 w-5" />اعتماد المورد</> : <><ShieldX className="h-5 w-5" />رفض الطلب</>}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {action === "approve"
              ? `سيتم اعتماد المورد "${supplier?.nameAr}" وتفعيل رمزه المرجعي: ${supplier?.code}`
              : `سيتم رفض طلب انضمام "${supplier?.nameAr}"`
            }
          </p>
          <div className="space-y-1">
            <Label>ملاحظات {action === "reject" ? "(سبب الرفض)" : "(اختياري)"}</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="أضف ملاحظة..." rows={3} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className={action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {isPending && <RefreshCw className="h-4 w-4 animate-spin ml-1" />}
              {action === "approve" ? "تأكيد الاعتماد" : "تأكيد الرفض"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Supplier Detail Dialog ───────────────────────────────────────────────────
function SupplierDetailDialog({ open, onClose, supplier }: { open: boolean; onClose: () => void; supplier: any }) {
  if (!supplier) return null;
  const approval = APPROVAL_CONFIG[supplier.approvalStatus as keyof typeof APPROVAL_CONFIG] ?? APPROVAL_CONFIG.pending;
  const ApprovalIcon = approval.icon;
  const services = (supplier.services as string[]) ?? [];

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${supplier.type === "company" ? "bg-blue-100" : "bg-purple-100"}`}>
              {supplier.type === "company" ? <Building2 className="h-5 w-5 text-blue-600" /> : <User className="h-5 w-5 text-purple-600" />}
            </div>
            <div>
              <div>{supplier.companyName || supplier.nameAr}</div>
              <div className="text-sm font-normal text-muted-foreground font-mono">{supplier.code}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className={`flex items-center gap-2 p-3 rounded-lg border ${approval.color}`}>
            <ApprovalIcon className="h-5 w-5" />
            <span className="font-semibold">{approval.label}</span>
            {supplier.approvalStatus === "approved" && (
              <span className="mr-auto text-sm font-mono bg-white/50 px-2 py-0.5 rounded border">{supplier.code}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {supplier.companyName && <div><span className="text-muted-foreground">اسم الشركة:</span> <span className="font-medium">{supplier.companyName}</span></div>}
            {supplier.nameAr && <div><span className="text-muted-foreground">المسؤول:</span> <span className="font-medium">{supplier.nameAr}</span></div>}
            {supplier.nameEn && <div dir="ltr"><span className="text-muted-foreground">English Name:</span> <span className="font-medium">{supplier.nameEn}</span></div>}
            {supplier.licenseNumber && <div><span className="text-muted-foreground">رقم الترخيص:</span> <span className="font-mono">{supplier.licenseNumber}</span></div>}
            {supplier.commercialRegisterNumber && <div><span className="text-muted-foreground">السجل التجاري:</span> <span className="font-mono">{supplier.commercialRegisterNumber}</span></div>}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            {supplier.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{supplier.phone}</div>}
            {supplier.whatsapp && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-green-600" />واتساب: {supplier.whatsapp}</div>}
            {supplier.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{supplier.email}</div>}
            {supplier.website && <div className="flex items-center gap-2 col-span-2"><Globe className="h-4 w-4 text-muted-foreground" /><a href={supplier.website} target="_blank" rel="noreferrer" className="text-blue-600 underline">{supplier.website}</a></div>}
            {(supplier.country || supplier.city) && (
              <div className="flex items-center gap-2 col-span-2"><MapPin className="h-4 w-4 text-muted-foreground" />{[supplier.city, supplier.country].filter(Boolean).join("، ")}</div>
            )}
          </div>

          {services.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">الخدمات المقدمة:</p>
                <div className="flex flex-wrap gap-2">
                  {services.map(s => (
                    <Badge key={s} variant="secondary">{SERVICES_LIST.find(x => x.value === s)?.label ?? s}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {(supplier.licenseFileUrl || supplier.commercialRegisterUrl) && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">الوثائق المرفوعة:</p>
                <div className="flex gap-3 flex-wrap">
                  {supplier.licenseFileUrl && (
                    <a href={supplier.licenseFileUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline border border-blue-200 rounded px-3 py-1.5 bg-blue-50">
                      <FileText className="h-4 w-4" /> الترخيص
                    </a>
                  )}
                  {supplier.commercialRegisterUrl && (
                    <a href={supplier.commercialRegisterUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline border border-blue-200 rounded px-3 py-1.5 bg-blue-50">
                      <FileText className="h-4 w-4" /> السجل التجاري
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {supplier.notes && (
            <>
              <Separator />
              <div className="text-sm"><span className="font-medium">ملاحظات:</span> {supplier.notes}</div>
            </>
          )}
          {supplier.approvalNotes && (
            <div className="text-sm bg-muted/50 p-3 rounded-lg border">
              <span className="font-medium">ملاحظات المراجعة:</span> {supplier.approvalNotes}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SuppliersAdmin() {
  const [mainTab, setMainTab] = useState<"list" | "requests">("list");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "individual" | "company">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewSupplier, setViewSupplier] = useState<any | null>(null);
  const [approvalAction, setApprovalAction] = useState<{ supplier: any; action: "approve" | "reject" } | null>(null);

  const { data: suppliersList = [], isLoading } = trpc.suppliers.list.useQuery({
    search, type: filterType, approvalStatus: filterStatus,
  });
  const { data: stats } = trpc.suppliers.stats.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المورد");
      utils.suppliers.list.invalidate();
      utils.suppliers.stats.invalidate();
    },
    onError: e => toast.error(e.message),
  });

  const handleDelete = (s: any) => {
    if (confirm(`هل تريد حذف "${s.nameAr}"؟`)) deleteMutation.mutate({ id: s.id });
  };

  // Pending requests (for join requests tab)
  const pendingList = suppliersList.filter(s => s.approvalStatus === "pending");

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">إدارة الموردين والمزودين</h2>
          <p className="text-muted-foreground text-sm mt-1">إدارة شاملة مع نظام الاعتماد والوثائق القانونية</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> إضافة مورد جديد
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={v => setMainTab(v as "list" | "requests")}>
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="list">قائمة الموردين</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            طلبات الانضمام
            {(stats?.pending ?? 0) > 0 && (
              <span className="absolute -top-1 -left-1 bg-yellow-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {stats?.pending}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: List ── */}
        <TabsContent value="list" className="mt-4 space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: "الإجمالي", value: stats?.total ?? 0, color: "text-foreground", bg: "bg-muted/40" },
          { label: "شركات", value: stats?.companies ?? 0, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "أفراد", value: stats?.individuals ?? 0, color: "text-purple-700", bg: "bg-purple-50" },
          { label: "تحت المراجعة", value: stats?.pending ?? 0, color: "text-yellow-700", bg: "bg-yellow-50" },
          { label: "معتمدون", value: stats?.approved ?? 0, color: "text-green-700", bg: "bg-green-50" },
          { label: "مرفوضون", value: stats?.rejected ?? 0, color: "text-red-700", bg: "bg-red-50" },
        ].map(s => (
          <Card key={s.label} className={`${s.bg} border-0 shadow-none`}>
            <CardContent className="p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم، الرمز، الترخيص..." className="pr-9" />
        </div>
        <Select value={filterType} onValueChange={v => setFilterType(v as any)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            <SelectItem value="company">شركات</SelectItem>
            <SelectItem value="individual">أفراد</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={v => setFilterStatus(v as any)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">تحت المراجعة</SelectItem>
            <SelectItem value="approved">معتمدون</SelectItem>
            <SelectItem value="rejected">مرفوضون</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-52 bg-muted/50 rounded-xl animate-pulse" />)}
        </div>
      ) : suppliersList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">لا يوجد موردون</p>
          <p className="text-sm">ابدأ بإضافة أول مورد أو مزود</p>
          <Button className="mt-4" onClick={() => { setEditing(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 ml-1" /> إضافة مورد
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliersList.map(s => {
            const approval = APPROVAL_CONFIG[s.approvalStatus as keyof typeof APPROVAL_CONFIG] ?? APPROVAL_CONFIG.pending;
            const ApprovalIcon = approval.icon;
            const svcs = (s.services as string[]) ?? [];
            return (
              <Card key={s.id} className="overflow-hidden hover:shadow-md transition-shadow border">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className={`p-4 border-b ${s.type === "company" ? "bg-blue-50/60" : "bg-purple-50/60"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-full flex-shrink-0 ${s.type === "company" ? "bg-blue-100" : "bg-purple-100"}`}>
                          {s.type === "company" ? <Building2 className="h-4 w-4 text-blue-600" /> : <User className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{s.companyName || s.nameAr}</p>
                          {s.companyName && <p className="text-xs text-muted-foreground truncate">{s.nameAr}</p>}
                          <p className="text-xs font-mono text-primary mt-0.5">{s.code}</p>
                        </div>
                      </div>
                      <Badge className={`text-xs flex-shrink-0 border ${approval.color}`}>
                        <ApprovalIcon className="h-3 w-3 ml-1" />{approval.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-1.5 text-sm">
                    {s.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{s.phone}</div>}
                    {(s.country || s.city) && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{[s.city, s.country].filter(Boolean).join("، ")}</div>}
                    {s.licenseNumber && <div className="flex items-center gap-2 text-muted-foreground"><Award className="h-3.5 w-3.5" />ترخيص: {s.licenseNumber}</div>}
                    {svcs.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {svcs.slice(0, 3).map(svc => (
                          <Badge key={svc} variant="outline" className="text-xs py-0">{SERVICES_LIST.find(x => x.value === svc)?.label ?? svc}</Badge>
                        ))}
                        {svcs.length > 3 && <Badge variant="outline" className="text-xs py-0">+{svcs.length - 3}</Badge>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={() => setViewSupplier(s)}>
                      <Eye className="h-3.5 w-3.5 ml-1" /> عرض
                    </Button>
                    {s.approvalStatus === "pending" && (
                      <>
                        <Button size="sm" className="flex-1 text-xs h-8 bg-green-600 hover:bg-green-700" onClick={() => setApprovalAction({ supplier: s, action: "approve" })}>
                          <ShieldCheck className="h-3.5 w-3.5 ml-1" /> اعتماد
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1 text-xs h-8" onClick={() => setApprovalAction({ supplier: s, action: "reject" })}>
                          <ShieldX className="h-3.5 w-3.5 ml-1" /> رفض
                        </Button>
                      </>
                    )}
                    {s.approvalStatus !== "pending" && (
                      <>
                        <Button size="sm" variant="outline" className="text-xs px-2 h-8" onClick={() => { setEditing(s); setDialogOpen(true); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="destructive" className="text-xs px-2 h-8" onClick={() => handleDelete(s)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

        </TabsContent>

        {/* ── Tab: Join Requests ── */}
        <TabsContent value="requests" className="mt-4 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />)}
            </div>
          ) : pendingList.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">لا توجد طلبات انتظار</p>
              <p className="text-sm">جميع طلبات الانضمام تمت معالجتها</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingList.map(s => {
                const svcs = (s.services as string[]) ?? [];
                return (
                  <Card key={s.id} className="border-yellow-200 bg-yellow-50/30 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-2.5 rounded-full flex-shrink-0 ${s.type === "company" ? "bg-blue-100" : "bg-purple-100"}`}>
                            {s.type === "company" ? <Building2 className="h-5 w-5 text-blue-600" /> : <User className="h-5 w-5 text-purple-600" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold truncate">{s.companyName || s.nameAr}</p>
                            {s.companyName && <p className="text-sm text-muted-foreground truncate">{s.nameAr}</p>}
                            <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                              {s.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</span>}
                              {s.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</span>}
                              {(s.country || s.city) && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{[s.city, s.country].filter(Boolean).join("، ")}</span>}
                              {s.licenseNumber && <span className="flex items-center gap-1"><Award className="h-3 w-3" />ترخيص: {s.licenseNumber}</span>}
                            </div>
                            {svcs.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {svcs.map(svc => (
                                  <Badge key={svc} variant="outline" className="text-xs py-0 border-yellow-300">{SERVICES_LIST.find(x => x.value === svc)?.label ?? svc}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setViewSupplier(s)}>
                            <Eye className="h-3.5 w-3.5 ml-1" /> عرض
                          </Button>
                          <Button size="sm" className="text-xs h-8 bg-green-600 hover:bg-green-700" onClick={() => setApprovalAction({ supplier: s, action: "approve" })}>
                            <ShieldCheck className="h-3.5 w-3.5 ml-1" /> اعتماد
                          </Button>
                          <Button size="sm" variant="destructive" className="text-xs h-8" onClick={() => setApprovalAction({ supplier: s, action: "reject" })}>
                            <ShieldX className="h-3.5 w-3.5 ml-1" /> رفض
                          </Button>
                        </div>
                      </div>
                      {(s.licenseFileUrl || s.commercialRegisterUrl) && (
                        <div className="mt-3 pt-3 border-t border-yellow-200 flex gap-3 flex-wrap">
                          {s.licenseFileUrl && (
                            <a href={s.licenseFileUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-white border border-blue-200 rounded-md px-2 py-1">
                              <FileText className="h-3.5 w-3.5" /> عرض الترخيص
                            </a>
                          )}
                          {s.commercialRegisterUrl && (
                            <a href={s.commercialRegisterUrl} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-white border border-blue-200 rounded-md px-2 py-1">
                              <FileText className="h-3.5 w-3.5" /> عرض السجل التجاري
                            </a>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <SupplierFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        onSaved={() => setDialogOpen(false)}
      />
      <SupplierDetailDialog
        open={!!viewSupplier}
        onClose={() => setViewSupplier(null)}
        supplier={viewSupplier}
      />
      {approvalAction && (
        <ApprovalDialog
          open={!!approvalAction}
          onClose={() => setApprovalAction(null)}
          supplier={approvalAction.supplier}
          action={approvalAction.action}
          onDone={() => setApprovalAction(null)}
        />
      )}
    </div>
  );
}
