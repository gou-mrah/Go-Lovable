/**
 * ProviderProgramsSection
 * Reusable component to display approved provider programs on any service page.
 * Shows a "مزود معتمد" badge and provider company name alongside each program card.
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";

import {
  Building2, CheckCircle2, Star, Clock, MapPin, Users,
  Calendar, ChevronRight, Phone, Mail, Loader2,
} from "lucide-react";
import { toast } from "sonner";

type ProgramType = "hajj" | "umrah" | "hotel" | "flight" | "visa" | "transport" | "tour" | "other";

interface ProviderProgramsSectionProps {
  programType: ProgramType;
  title?: string;
  titleAr?: string;
  maxItems?: number;
}

export default function ProviderProgramsSection({
  programType,
  title,
  titleAr,
  maxItems = 6,
}: ProviderProgramsSectionProps) {
  const { isRTL, language } = useLanguage();
  const { currencyConfig, currency, convert, symbol } = useCurrency();
  const { isAuthenticated, user } = useAuth();
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    customerName: user?.name || "",
    customerEmail: "",
    customerPhone: "",
    adults: 1,
    children: 0,
    notes: "",
  });

  const { data: programs, isLoading } = trpc.provider.listPublicPrograms.useQuery({
    programType,
    limit: maxItems,
  });

  const bookMutation = trpc.provider.bookProgram.useMutation({
    onSuccess: (data) => {
      toast.success(`تم تأكيد الحجز! رقم الحجز: ${data.bookingRef}`);
      setBookingOpen(false);
      setSelectedProgram(null);
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#1B5E52]" />
      </div>
    );
  }

  if (!programs || programs.length === 0) return null;

  const formatPrice = (priceUSD: string | number) => {
    const converted = convert(priceUSD);
    return `${symbol}${converted.toLocaleString("ar-SA", { maximumFractionDigits: 0 })}`;
  };

  const sectionTitle = isRTL ? (titleAr || "برامج مزودي الخدمات المعتمدين") : (title || "Certified Provider Programs");

  return (
    <section className="py-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1B5E52]/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#1B5E52]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1B5E52]">{sectionTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {isRTL ? "برامج مقدمة من شركاء معتمدين لدى جو عمرة" : "Programs from Go Umrah certified partners"}
            </p>
          </div>
          <div className="mr-auto flex items-center gap-1.5 bg-[#1B5E52]/5 border border-[#1B5E52]/20 rounded-full px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1B5E52]" />
            <span className="text-xs font-medium text-[#1B5E52]">{isRTL ? "مزودون معتمدون" : "Certified Providers"}</span>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {programs.map((prog) => (
            <Card
              key={prog.id}
              className="group overflow-hidden border border-[#C9A96E]/20 hover:border-[#C9A96E]/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => { setSelectedProgram(prog); setBookingOpen(true); }}
            >
              {/* Image */}
              <div className="relative h-44 bg-gradient-to-br from-[#1B5E52]/10 to-[#C9A96E]/10 overflow-hidden">
                {prog.imageUrl ? (
                  <img src={prog.imageUrl} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-[#1B5E52]/30" />
                  </div>
                )}
                {/* Certified Badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-[#1B5E52] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                  <CheckCircle2 className="w-3 h-3" />
                  {isRTL ? "مزود معتمد" : "Certified"}
                </div>
                {/* Subscription tier badge — shows for professional and growth plans */}
                {((prog as any).providerPlanSlug === "professional" || (prog as any).providerPlanSlug === "premium_plus") && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    <Star className="w-3 h-3 fill-white" />
                    {isRTL ? "احترافي" : "Pro"}
                  </div>
                )}
                {((prog as any).providerPlanSlug === "growth" || (prog as any).providerPlanSlug === "premium_basic") && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                    <Star className="w-3 h-3" />
                    {isRTL ? "نمو" : "Growth"}
                  </div>
                )}
                {(prog as any).providerPlanSlug === "basic" && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                    <Star className="w-3 h-3" />
                    {isRTL ? "أساسي" : "Basic"}
                  </div>
                )}
                {prog.isFeatured && (
                  <div className="absolute bottom-2 left-2 bg-[#C9A96E] text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                    {isRTL ? "مميز" : "Featured"}
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                {/* Provider Name */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span className="text-xs text-[#C9A96E] font-medium">
                    {isRTL && prog.providerCompanyNameAr ? prog.providerCompanyNameAr : (prog.providerCompanyName || "مزود معتمد")}
                  </span>
                  {prog.providerIsVerified && (
                    <CheckCircle2 className="w-3 h-3 text-[#1B5E52]" />
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-[#1B5E52] text-sm mb-2 line-clamp-2 group-hover:text-[#C9A96E] transition-colors">
                  {isRTL && prog.titleAr ? prog.titleAr : prog.title}
                </h3>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {prog.duration && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {prog.duration}
                    </span>
                  )}
                  {prog.departureCity && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" /> {prog.departureCity}
                    </span>
                  )}
                  {prog.availableSlots !== null && prog.availableSlots !== undefined && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" /> {prog.availableSlots} {isRTL ? "مقعد" : "seats"}
                    </span>
                  )}
                </div>

                {/* Rating */}
                {prog.rating && parseFloat(String(prog.rating)) > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-3.5 h-3.5 fill-[#C9A96E] text-[#C9A96E]" />
                    <span className="text-xs font-semibold text-[#C9A96E]">{parseFloat(String(prog.rating)).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({prog.reviewCount})</span>
                  </div>
                )}

                {/* Price + CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-[#C9A96E]/10">
                  <div>
                    <span className="text-lg font-bold text-[#1B5E52]">{formatPrice(prog.priceUSD)}</span>
                    {prog.originalPriceUSD && parseFloat(String(prog.originalPriceUSD)) > parseFloat(String(prog.priceUSD)) && (
                      <span className="text-xs text-muted-foreground line-through mr-1">{formatPrice(prog.originalPriceUSD)}</span>
                    )}
                    <span className="text-xs text-muted-foreground block">{isRTL ? "للفرد" : "per person"}</span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#1B5E52] hover:bg-[#1B5E52]/90 text-white h-8 px-3 text-xs gap-1"
                    onClick={(e) => { e.stopPropagation(); setSelectedProgram(prog); setBookingOpen(true); }}
                  >
                    {isRTL ? "احجز الآن" : "Book Now"}
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-[#1B5E52]">
              {isRTL ? "حجز البرنامج" : "Book Program"}
            </DialogTitle>
          </DialogHeader>
          {selectedProgram && (
            <div className="space-y-4">
              {/* Program Summary */}
              <div className="bg-[#F5EFE6] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-[#C9A96E]" />
                  <span className="text-xs text-[#C9A96E] font-medium">
                    {isRTL && selectedProgram.providerCompanyNameAr ? selectedProgram.providerCompanyNameAr : (selectedProgram.providerCompanyName || "مزود معتمد")}
                  </span>
                </div>
                <p className="font-bold text-[#1B5E52] text-sm">
                  {isRTL && selectedProgram.titleAr ? selectedProgram.titleAr : selectedProgram.title}
                </p>
                <p className="text-[#C9A96E] font-bold">{formatPrice(selectedProgram.priceUSD)} {isRTL ? "للفرد" : "/ person"}</p>
              </div>

              {!isAuthenticated ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {isRTL ? "يجب تسجيل الدخول للحجز" : "Please login to book"}
                  </p>
                  <a href="/login">
                    <Button className="bg-[#1B5E52] text-white">
                      {isRTL ? "تسجيل الدخول" : "Login"}
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{isRTL ? "الاسم الكامل *" : "Full Name *"}</Label>
                      <Input
                        value={bookingForm.customerName}
                        onChange={e => setBookingForm(f => ({ ...f, customerName: e.target.value }))}
                        placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{isRTL ? "رقم الهاتف" : "Phone"}</Label>
                      <Input
                        value={bookingForm.customerPhone}
                        onChange={e => setBookingForm(f => ({ ...f, customerPhone: e.target.value }))}
                        placeholder="+966..."
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                    <Input
                      value={bookingForm.customerEmail}
                      onChange={e => setBookingForm(f => ({ ...f, customerEmail: e.target.value }))}
                      placeholder="email@example.com"
                      className="h-8 text-sm mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{isRTL ? "عدد البالغين" : "Adults"}</Label>
                      <Input
                        type="number" min={1}
                        value={bookingForm.adults}
                        onChange={e => setBookingForm(f => ({ ...f, adults: parseInt(e.target.value) || 1 }))}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{isRTL ? "عدد الأطفال" : "Children"}</Label>
                      <Input
                        type="number" min={0}
                        value={bookingForm.children}
                        onChange={e => setBookingForm(f => ({ ...f, children: parseInt(e.target.value) || 0 }))}
                        className="h-8 text-sm mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">{isRTL ? "ملاحظات إضافية" : "Notes"}</Label>
                    <Textarea
                      value={bookingForm.notes}
                      onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder={isRTL ? "أي متطلبات خاصة..." : "Any special requirements..."}
                      className="text-sm mt-1 h-20"
                    />
                  </div>
                  <div className="bg-[#1B5E52]/5 rounded-lg p-3 text-sm">
                    <div className="flex justify-between">
                      <span>{isRTL ? "السعر الإجمالي" : "Total Price"}</span>
                      <span className="font-bold text-[#1B5E52]">
                        {formatPrice(parseFloat(String(selectedProgram.priceUSD)) * (bookingForm.adults + bookingForm.children * 0.5))}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-[#1B5E52] hover:bg-[#1B5E52]/90 text-white"
                    disabled={!bookingForm.customerName || bookMutation.isPending}
                    onClick={() => {
                      const total = parseFloat(String(selectedProgram.priceUSD)) * (bookingForm.adults + bookingForm.children * 0.5);
                      bookMutation.mutate({
                        programId: selectedProgram.id,
                        customerName: bookingForm.customerName,
                        customerEmail: bookingForm.customerEmail || undefined,
                        customerPhone: bookingForm.customerPhone || undefined,
                        adults: bookingForm.adults,
                        children: bookingForm.children,
                        totalUSD: total.toFixed(2),
                        notes: bookingForm.notes || undefined,
                      });
                    }}
                  >
                    {bookMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> {isRTL ? "جاري الحجز..." : "Booking..."}</>
                    ) : (
                      isRTL ? "تأكيد الحجز" : "Confirm Booking"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
