import { usdToSar } from "@shared/const";
import { useSEO, SEO_CONFIGS } from "@/hooks/useSEO";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import ProviderProgramsSection from "@/components/provider/ProviderProgramsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText, Clock, CheckCircle, ArrowRight, Upload,
  Shield, Globe, Users, Loader2, Search, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLocation } from "wouter";

const VISA_TYPES_DEMO = [
  {
    id: 1, name: "Umrah Visa", code: "UMRAH", processingDays: 3, fee: 150,
    description: "For Muslims performing Umrah pilgrimage. Valid for 30 days with multiple entry.",
    requirements: ["Valid passport (6+ months)", "Completed application form", "Passport photos", "Proof of accommodation", "Return flight ticket", "Mahram certificate (for women)"],
    color: "from-[var(--teal-600)] to-[var(--teal-800)]",
    icon: "🕌",
    validity: "30 days",
    entries: "Multiple",
    isActive: true,
  },
  {
    id: 2, name: "Hajj Visa", code: "HAJJ", processingDays: 7, fee: 200,
    description: "Exclusive visa for Hajj pilgrims. Issued only during Hajj season with strict quota.",
    requirements: ["Valid passport (6+ months)", "Hajj package confirmation", "Passport photos", "Medical certificate", "Vaccination records", "Mahram certificate (for women)"],
    color: "from-amber-500 to-amber-700",
    icon: "🌙",
    validity: "30 days",
    entries: "Single",
    isActive: true,
  },
  {
    id: 3, name: "Tourist Visa", code: "TOURIST", processingDays: 5, fee: 120,
    description: "For tourists visiting Saudi Arabia. Allows visits to historical and cultural sites.",
    requirements: ["Valid passport (6+ months)", "Travel itinerary", "Hotel bookings", "Bank statement", "Travel insurance"],
    color: "from-blue-500 to-blue-700",
    icon: "✈️",
    validity: "90 days",
    entries: "Multiple",
    isActive: true,
  },
  {
    id: 4, name: "Transit Visa", code: "TRANSIT", processingDays: 1, fee: 50,
    description: "For travelers transiting through Saudi Arabia. Valid for 96 hours.",
    requirements: ["Valid passport", "Onward ticket", "Destination visa (if required)"],
    color: "from-green-500 to-green-700",
    icon: "🔄",
    validity: "96 hours",
    entries: "Single",
    isActive: true,
  },
  {
    id: 5, name: "Business Visa", code: "BUSINESS", processingDays: 5, fee: 180,
    description: "For business travelers attending meetings, conferences, or commercial activities.",
    requirements: ["Valid passport", "Business invitation letter", "Company registration", "Bank statement", "Travel insurance"],
    color: "from-slate-500 to-slate-700",
    icon: "💼",
    validity: "90 days",
    entries: "Multiple",
    isActive: true,
  },
  {
    id: 6, name: "Family Visit Visa", code: "FAMILY", processingDays: 7, fee: 100,
    description: "For family members visiting Saudi residents. Requires sponsorship from Saudi resident.",
    requirements: ["Valid passport", "Sponsor's iqama copy", "Relationship proof", "Sponsor's salary certificate"],
    color: "from-rose-500 to-rose-700",
    icon: "👨‍👩‍👧‍👦",
    validity: "90 days",
    entries: "Multiple",
    isActive: true,
  },
];

function VisaCard({ visa, onApply }: { visa: any; onApply: (v: any) => void }) {
  const [expanded, setExpanded] = useState(false);
  const requirements = Array.isArray(visa.requirements) ? visa.requirements : [];
  const { t } = useLanguage();
  const { format } = useCurrency();

  const visaGradients: Record<string, string> = {
    UMRAH: "linear-gradient(135deg, #1B5E52 0%, #0d3d3d 100%)",
    HAJJ: "linear-gradient(135deg, #92400e 0%, #451a03 100%)",
    TOURIST: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 100%)",
    TRANSIT: "linear-gradient(135deg, #14532d 0%, #052e16 100%)",
    BUSINESS: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    FAMILY: "linear-gradient(135deg, #881337 0%, #4c0519 100%)",
  };
  const headerBg = visaGradients[visa.code] || "linear-gradient(135deg, #1B5E52 0%, #0d3d3d 100%)";

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col">
      {/* Header gradient */}
      <div className="p-6 text-white relative overflow-hidden" style={{ background: headerBg }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 10% 20%, white 1px, transparent 1px), radial-gradient(circle at 90% 80%, white 1px, transparent 1px)", backgroundSize: "25px 25px" }} />
        <div className="relative flex items-start justify-between mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-3xl">
            {visa.icon || "📄"}
          </div>
          <div className="text-right">
            <div className="text-3xl font-black" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {format(visa.fee || 0)}
            </div>
            <div className="text-white/60 text-xs mt-0.5">{t("visa.processingFee")}</div>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-1.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>
          {visa.name}
        </h3>
        <p className="text-white/75 text-sm line-clamp-2 leading-relaxed">{visa.description}</p>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-1">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2.5 bg-teal-50 rounded-xl border border-teal-100">
            <Clock className="w-4 h-4 text-teal-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-teal-800">{visa.processingDays} {t("common.days")}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{t("visa.processing")}</div>
          </div>
          <div className="text-center p-2.5 bg-teal-50 rounded-xl border border-teal-100">
            <Globe className="w-4 h-4 text-teal-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-teal-800">{visa.validity || "30 days"}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{t("visa.validity")}</div>
          </div>
          <div className="text-center p-2.5 bg-teal-50 rounded-xl border border-teal-100">
            <ArrowRight className="w-4 h-4 text-teal-600 mx-auto mb-1" />
            <div className="text-xs font-bold text-teal-800">{visa.entries || "Single"}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{t("visa.entry")}</div>
          </div>
        </div>

        {/* Requirements toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-teal-600 font-semibold flex items-center gap-1.5 mb-3 hover:text-teal-800 transition-colors bg-teal-50 hover:bg-teal-100 rounded-lg px-3 py-2 border border-teal-100 w-full"
        >
          <FileText className="w-3.5 h-3.5" />
          {expanded ? t("common.hide") : t("common.view")} {t("visa.requirements")} ({requirements.length})
          <ArrowRight className={`w-3 h-3 mr-auto transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>

        {expanded && requirements.length > 0 && (
          <div className="mb-4 space-y-1.5 bg-gray-50 rounded-xl p-3 border border-gray-100">
            {requirements.map((req: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                {req}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={() => onApply(visa)}
          className="w-full font-bold gap-2 rounded-xl mt-auto"
          style={{ background: "#1B5E52", color: "#fff" }}
        >
          {t("visa.applyNow")} <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function ApplicationForm({ visa, onClose }: { visa: any; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    applicantName: "",
    passportNumber: "",
    nationality: "",
    email: "",
    phone: "",
    travelDate: "",
    notes: "",
  });

  const visaFee = visa.fee || Number(visa.priceUSD || 0);
  const feeSAR = usdToSar(visaFee);

  const submitApplication = trpc.visa.submitApplication.useMutation({
    onSuccess: (data) => {
      if (feeSAR > 0 && data.applicationId) {
        // Redirect to payment page
        toast.success("تم تقديم الطلب بنجاح! جاري التحويل للدفع...");
        navigate(`/pay/visa/${data.applicationId}?amount=${feeSAR.toFixed(2)}&type=${encodeURIComponent(visa.name)}`);
      } else {
        setSubmitted(true);
        toast.success("Visa application submitted successfully!");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Submission failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication.mutate({
      visaTypeId: visa.id,
      visaTypeName: visa.name,
      applicantName: form.applicantName,
      passportNumber: form.passportNumber,
      nationality: form.nationality,
      email: form.email || undefined,
      phone: form.phone || undefined,
      travelDate: form.travelDate || undefined,
      notes: form.notes || undefined,
      feeSAR: feeSAR > 0 ? feeSAR : undefined,
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-[var(--teal-800)] mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
          Application Submitted!
        </h3>
        <p className="text-[var(--muted-foreground)] text-sm mb-6">
          Your <strong>{visa.name}</strong> application has been received. You'll receive a confirmation email within 24 hours.
        </p>
        <div className="bg-[var(--teal-50)] rounded-xl p-4 mb-6 text-left">
          <h4 className="font-semibold text-[var(--teal-800)] text-sm mb-2">What happens next?</h4>
          <div className="space-y-2">
            {[
              "Our visa team reviews your application",
              "You'll receive an email with document checklist",
              "Submit required documents via our secure portal",
              "Visa processed within " + visa.processingDays + " business days",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
                <span className="w-4 h-4 rounded-full bg-[var(--teal-600)] text-white text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>
        <Button onClick={onClose} className="bg-[var(--primary)] text-white">Close</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-[var(--teal-50)] rounded-xl p-3 border border-[var(--teal-200)] flex items-center gap-3">
        <span className="text-2xl">{visa.icon}</span>
        <div>
          <div className="font-semibold text-[var(--teal-800)] text-sm">{visa.name}</div>
          <div className="text-xs text-[var(--muted-foreground)]">Processing: {visa.processingDays} days · Fee: ${visa.fee}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-sm font-medium">Full Name (as in passport) *</Label>
          <Input
            value={form.applicantName}
            onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
            placeholder="John Smith"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Passport Number *</Label>
          <Input
            value={form.passportNumber}
            onChange={(e) => setForm({ ...form, passportNumber: e.target.value })}
            placeholder="AB1234567"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Nationality *</Label>
          <Input
            value={form.nationality}
            onChange={(e) => setForm({ ...form, nationality: e.target.value })}
            placeholder="British"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@email.com"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-sm font-medium">Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+44 7700 900000"
            className="mt-1"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-sm font-medium">Intended Travel Date</Label>
          <Input
            type="date"
            value={form.travelDate}
            onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
            className="mt-1"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-sm font-medium">Additional Notes</Label>
          <Input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any special requirements..."
            className="mt-1"
          />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Documents will be requested via email after submission. Ensure your passport has at least 6 months validity.
        </p>
      </div>

      <Button
        type="submit"
        disabled={submitApplication.isPending}
        className="w-full bg-[var(--primary)] hover:bg-[var(--teal-600)] text-white font-semibold"
      >
        {submitApplication.isPending ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
}

export default function VisaPage() {
  useSEO(SEO_CONFIGS.visa);
  const [selectedVisa, setSelectedVisa] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trackingRef, setTrackingRef] = useState("");

  const { data: visaTypes, isLoading } = trpc.visa.listTypes.useQuery();

  const displayTypes = visaTypes && visaTypes.length > 0 ? visaTypes : VISA_TYPES_DEMO;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600&q=85"
          alt="Visa Services"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--teal-900)]/80 to-[var(--teal-900)]/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16">
          <Badge className="mb-4 bg-[var(--gold)]/20 text-[var(--gold-light)] border-[var(--gold)]/30 text-xs tracking-widest uppercase px-4 py-1.5">
            Visa Issuance Hub
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            Saudi Arabia Visas
          </h1>
          <p className="text-white/70 text-base max-w-xl">
            Fast, reliable visa processing for Umrah, Hajj, tourism, and business travel to the Kingdom
          </p>
        </div>
      </div>

      {/* Process Steps */}
      <div className="bg-white border-b border-[var(--border)]">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: "01", icon: FileText, title: "Choose Visa", desc: "Select the visa type that suits your purpose" },
              { step: "02", icon: Upload, title: "Submit Application", desc: "Fill in your details and upload documents" },
              { step: "03", icon: Clock, title: "Processing", desc: "We process your application within the stated timeframe" },
              { step: "04", icon: CheckCircle, title: "Receive Visa", desc: "Get your visa delivered electronically or by mail" },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--teal-50)] border-2 border-[var(--teal-200)] flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-[var(--teal-600)]" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--gold)] text-white text-[10px] font-bold flex items-center justify-center">
                    {s.step.slice(1)}
                  </span>
                </div>
                <h4 className="font-semibold text-[var(--teal-800)] text-sm mb-1">{s.title}</h4>
                <p className="text-xs text-[var(--muted-foreground)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-10">
        {/* Tracking */}
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6 mb-10">
          <h3 className="font-bold text-[var(--teal-800)] mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            Track Your Application
          </h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Enter your application reference number..."
                value={trackingRef}
                onChange={(e) => setTrackingRef(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-[var(--primary)] text-white gap-2">
              <Search className="w-4 h-4" /> Track
            </Button>
          </div>
        </div>

        {/* Visa Types Gallery */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--teal-800)] mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            Available Visa Types
          </h2>
          <div className="gold-divider" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="luxury-card overflow-hidden">
                <div className="h-40 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-5 shimmer rounded w-3/4" />
                  <div className="h-4 shimmer rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTypes.map((v: any) => (
              <VisaCard
                key={v.id}
                visa={v}
                onApply={(v) => { setSelectedVisa(v); setDialogOpen(true); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Application Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              Visa Application
            </DialogTitle>
            <DialogDescription>
              Complete the form below to begin your visa application process.
            </DialogDescription>
          </DialogHeader>
          {selectedVisa && (
            <ApplicationForm visa={selectedVisa} onClose={() => setDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
      {/* Provider Visa Programs */}
      <ProviderProgramsSection
        programType="visa"
        titleAr="خدمات التأشيرة من مزودي الخدمات المعتمدين"
        title="Visa Services from Certified Providers"
        maxItems={6}
      />
    </div>
  );
}
