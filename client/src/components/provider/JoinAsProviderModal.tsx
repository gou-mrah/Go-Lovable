import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Building2, CheckCircle, Clock, XCircle, ChevronRight, ChevronLeft,
  Phone, Mail, Globe, MapPin, FileText, Star, Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const SERVICE_TYPES = [
  { value: "hajj", label: "باقات الحج" },
  { value: "umrah", label: "باقات العمرة" },
  { value: "hotels", label: "الفنادق والإقامة" },
  { value: "flights", label: "الرحلات الجوية" },
  { value: "visa", label: "التأشيرات" },
  { value: "transport", label: "المواصلات والنقل" },
  { value: "tours", label: "الجولات السياحية" },
  { value: "store", label: "متجر المستلزمات" },
];

const COMPANY_TYPES = [
  { value: "travel_agency", label: "وكالة سفر وسياحة" },
  { value: "hotel", label: "فندق أو شقة مفروشة" },
  { value: "airline", label: "شركة طيران" },
  { value: "transport", label: "شركة نقل ومواصلات" },
  { value: "tour_operator", label: "منظم جولات سياحية" },
  { value: "visa_agency", label: "وكالة تأشيرات" },
  { value: "other", label: "أخرى" },
];

interface JoinAsProviderModalProps {
  open: boolean;
  onClose: () => void;
}

function StatusBanner({ application }: { application: any }) {
  const statusConfig = {
    pending: {
      icon: <Clock className="w-5 h-5" />,
      color: "bg-amber-50 border-amber-200 text-amber-800",
      iconColor: "text-amber-500",
      title: "طلبك قيد الانتظار",
      desc: "تم استلام طلبك وسيتم مراجعته خلال 24-48 ساعة",
    },
    under_review: {
      icon: <AlertCircle className="w-5 h-5" />,
      color: "bg-blue-50 border-blue-200 text-blue-800",
      iconColor: "text-blue-500",
      title: "طلبك قيد المراجعة",
      desc: "فريقنا يراجع طلبك الآن. سنتواصل معك قريباً",
    },
    approved: {
      icon: <CheckCircle className="w-5 h-5" />,
      color: "bg-green-50 border-green-200 text-green-800",
      iconColor: "text-green-500",
      title: "تمت الموافقة على طلبك!",
      desc: "مبروك! يمكنك الآن الوصول إلى لوحة مزود الخدمة وإضافة برامجك",
    },
    rejected: {
      icon: <XCircle className="w-5 h-5" />,
      color: "bg-red-50 border-red-200 text-red-800",
      iconColor: "text-red-500",
      title: "تم رفض طلبك",
      desc: application.adminNotes || "للأسف لم نتمكن من قبول طلبك في الوقت الحالي",
    },
  };
  const cfg = statusConfig[application.status as keyof typeof statusConfig];
  return (
    <div className={`border rounded-xl p-4 flex gap-3 ${cfg.color}`}>
      <div className={cfg.iconColor}>{cfg.icon}</div>
      <div>
        <p className="font-semibold text-sm">{cfg.title}</p>
        <p className="text-xs mt-0.5 opacity-80">{cfg.desc}</p>
        {application.status === "approved" && (
          <a href="/provider" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-green-700 hover:underline">
            الذهاب للوحة المزود <ChevronRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function JoinAsProviderModal({ open, onClose }: JoinAsProviderModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [form, setForm] = useState({
    companyName: "",
    companyNameAr: "",
    companyType: "",
    licenseNumber: "",
    licenseExpiry: "",
    licenseAuthority: "",
    contactName: user?.name || "",
    contactPhone: "",
    contactWhatsapp: "",
    contactEmail: user?.email || "",
    website: "",
    country: "SA",
    city: "",
    address: "",
    description: "",
  });

  const { data: existingApplication, isLoading: loadingApp } = trpc.providerApplication.getMyApplication.useQuery(
    undefined,
    { enabled: open && !!user }
  );

  const utils = trpc.useUtils();
  const submitMutation = trpc.providerApplication.submitApplication.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.providerApplication.getMyApplication.invalidate();
      setStep(4); // success step
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleService = (val: string) => {
    setSelectedServices(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  };

  const handleSubmit = () => {
    if (!form.companyName || !form.contactName || !form.contactPhone || !form.contactEmail) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    submitMutation.mutate({
      ...form,
      serviceTypes: selectedServices,
    });
  };

  const totalSteps = 3;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1B5E52] text-xl" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            <Building2 className="w-6 h-6" />
            انضم إلينا كمزود خدمة
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            قدّم طلبك للانضمام إلى منصة جو عمرة كمزود خدمة معتمد
          </DialogDescription>
        </DialogHeader>

        {loadingApp ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B5E52]" />
          </div>
        ) : existingApplication && step !== 4 ? (
          <div className="py-4">
            <StatusBanner application={existingApplication} />
            {existingApplication.status === "rejected" && (
              <div className="mt-4">
                <Button
                  onClick={() => {
                    setStep(1);
                    // Pre-fill form with existing data
                    setForm({
                      companyName: existingApplication.companyName || "",
                      companyNameAr: existingApplication.companyNameAr || "",
                      companyType: existingApplication.companyType || "",
                      licenseNumber: existingApplication.licenseNumber || "",
                      licenseExpiry: existingApplication.licenseExpiry || "",
                      licenseAuthority: existingApplication.licenseAuthority || "",
                      contactName: existingApplication.contactName || "",
                      contactPhone: existingApplication.contactPhone || "",
                      contactWhatsapp: existingApplication.contactWhatsapp || "",
                      contactEmail: existingApplication.contactEmail || "",
                      website: existingApplication.website || "",
                      country: existingApplication.country || "SA",
                      city: existingApplication.city || "",
                      address: existingApplication.address || "",
                      description: existingApplication.description || "",
                    });
                    setSelectedServices(existingApplication.serviceTypes as string[] || []);
                  }}
                  className="w-full bg-[#1B5E52] text-white"
                >
                  إعادة تقديم الطلب
                </Button>
              </div>
            )}
          </div>
        ) : step === 4 ? (
          // Success step
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-[#1B5E52] mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              تم تقديم طلبك بنجاح!
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              سيقوم فريقنا بمراجعة طلبك خلال 24-48 ساعة. ستتلقى إشعاراً بنتيجة الطلب.
            </p>
            <Button onClick={onClose} className="bg-[#1B5E52] text-white">
              حسناً، شكراً
            </Button>
          </div>
        ) : (
          <>
            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                    step > s ? "bg-green-500 text-white" :
                    step === s ? "bg-[#1B5E52] text-white" :
                    "bg-gray-100 text-gray-400"
                  }`}>
                    {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  {s < totalSteps && (
                    <div className={`flex-1 h-1 rounded-full transition-all ${step > s ? "bg-green-500" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-6 -mt-4">
              <span className={step >= 1 ? "text-[#1B5E52] font-medium" : ""}>بيانات الشركة</span>
              <span className={step >= 2 ? "text-[#1B5E52] font-medium" : ""}>معلومات التواصل</span>
              <span className={step >= 3 ? "text-[#1B5E52] font-medium" : ""}>الخدمات والتفاصيل</span>
            </div>

            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">اسم الشركة (بالإنجليزية) *</Label>
                    <Input
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      placeholder="Company Name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">اسم الشركة (بالعربية)</Label>
                    <Input
                      value={form.companyNameAr}
                      onChange={(e) => setForm({ ...form, companyNameAr: e.target.value })}
                      placeholder="اسم الشركة"
                      className="mt-1"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">نوع الشركة *</Label>
                  <Select value={form.companyType} onValueChange={(v) => setForm({ ...form, companyType: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر نوع الشركة" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">رقم الترخيص</Label>
                    <Input
                      value={form.licenseNumber}
                      onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                      placeholder="رقم الترخيص التجاري"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">تاريخ انتهاء الترخيص</Label>
                    <Input
                      type="date"
                      value={form.licenseExpiry}
                      onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">الجهة المرخصة</Label>
                  <Input
                    value={form.licenseAuthority}
                    onChange={(e) => setForm({ ...form, licenseAuthority: e.target.value })}
                    placeholder="مثال: وزارة السياحة، هيئة الطيران المدني"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">اسم المسؤول *</Label>
                    <Input
                      value={form.contactName}
                      onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                      placeholder="الاسم الكامل"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">البريد الإلكتروني *</Label>
                    <Input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                      placeholder="email@company.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">رقم الهاتف *</Label>
                    <Input
                      value={form.contactPhone}
                      onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                      placeholder="+966 5X XXX XXXX"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">واتساب</Label>
                    <Input
                      value={form.contactWhatsapp}
                      onChange={(e) => setForm({ ...form, contactWhatsapp: e.target.value })}
                      placeholder="+966 5X XXX XXXX"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">الموقع الإلكتروني</Label>
                  <Input
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://www.company.com"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">الدولة</Label>
                    <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SA">المملكة العربية السعودية</SelectItem>
                        <SelectItem value="EG">مصر</SelectItem>
                        <SelectItem value="AE">الإمارات</SelectItem>
                        <SelectItem value="KW">الكويت</SelectItem>
                        <SelectItem value="QA">قطر</SelectItem>
                        <SelectItem value="BH">البحرين</SelectItem>
                        <SelectItem value="OM">عُمان</SelectItem>
                        <SelectItem value="JO">الأردن</SelectItem>
                        <SelectItem value="GB">المملكة المتحدة</SelectItem>
                        <SelectItem value="US">الولايات المتحدة</SelectItem>
                        <SelectItem value="OTHER">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">المدينة</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="مثال: الرياض، جدة، مكة"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">العنوان التفصيلي</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="الشارع، الحي، المبنى"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Services & Description */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium mb-2 block">الخدمات التي تقدمها *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICE_TYPES.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => toggleService(s.value)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium text-right transition-all ${
                          selectedServices.includes(s.value)
                            ? "border-[#1B5E52] bg-[#1B5E52]/10 text-[#1B5E52]"
                            : "border-border hover:border-[#1B5E52]/40 text-muted-foreground"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selectedServices.includes(s.value) ? "border-[#1B5E52] bg-[#1B5E52]" : "border-gray-300"
                        }`}>
                          {selectedServices.includes(s.value) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {selectedServices.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">يرجى اختيار خدمة واحدة على الأقل</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium">نبذة عن شركتك</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="اكتب نبذة مختصرة عن شركتك وخدماتك وخبرتك في مجال السياحة الدينية..."
                    className="mt-1 min-h-[100px]"
                    dir="rtl"
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  <p className="font-semibold mb-1">ملاحظة مهمة:</p>
                  <p>بتقديم هذا الطلب، أنت تؤكد أن جميع المعلومات المقدمة صحيحة ودقيقة. سيتم التحقق من بيانات الترخيص قبل الموافقة.</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {step > 1 ? "السابق" : "إلغاء"}
              </Button>
              {step < totalSteps ? (
                <Button
                  onClick={() => {
                    if (step === 1 && !form.companyName) {
                      toast.error("يرجى إدخال اسم الشركة");
                      return;
                    }
                    if (step === 2 && (!form.contactName || !form.contactPhone || !form.contactEmail)) {
                      toast.error("يرجى ملء جميع حقول التواصل المطلوبة");
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="bg-[#1B5E52] text-white gap-2"
                >
                  التالي
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || selectedServices.length === 0}
                  className="bg-[#1B5E52] text-white gap-2"
                >
                  {submitMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> جاري الإرسال...</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> تقديم الطلب</>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
