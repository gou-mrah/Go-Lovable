import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload, ScanLine, CheckCircle, AlertCircle, Loader2,
  FileImage, User, Calendar, Globe, Hash, RefreshCw,
} from "lucide-react";

interface PassportData {
  passportNumber: string | null;
  fullName: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  expiryDate: string | null;
  gender: string | null;
  placeOfBirth: string | null;
  mrz: string | null;
}

interface PassportUploadProps {
  onExtracted?: (data: PassportData) => void;
  userId?: number;
  bookingId?: number;
  className?: string;
}

export default function PassportUpload({ onExtracted, userId, bookingId, className = "" }: PassportUploadProps) {
  const [step, setStep] = useState<"idle" | "uploading" | "scanning" | "done" | "error">("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<PassportData | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.passport.uploadImage.useMutation();
  const ocrMutation = trpc.passport.extractOCR.useMutation();

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى رفع صورة جواز سفر صالحة");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف كبير جداً (الحد الأقصى 10 ميجابايت)");
      return;
    }
    setStep("uploading");
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      // Upload to S3
      const uploadResult = await uploadMutation.mutateAsync({
        base64,
        mimeType: file.type,
        userId,
      });
      setImageUrl(uploadResult.url);
      setStep("scanning");
      // Run OCR
      const ocrResult = await ocrMutation.mutateAsync({
        imageUrl: uploadResult.url,
        userId,
        bookingId,
      });
      if (ocrResult.success && ocrResult.data) {
        setExtracted(ocrResult.data);
        setStep("done");
        onExtracted?.(ocrResult.data);
        toast.success("تم استخراج بيانات جواز السفر بنجاح");
      } else {
        throw new Error("OCR failed");
      }
    } catch {
      setStep("error");
      toast.error("فشل استخراج البيانات. يرجى المحاولة بصورة أوضح.");
    }
  }, [uploadMutation, ocrMutation, userId, bookingId, onExtracted]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setStep("idle");
    setImageUrl(null);
    setExtracted(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      {step === "idle" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
            ${dragOver
              ? "border-[var(--primary)] bg-[var(--teal-50)]"
              : "border-[var(--border)] hover:border-[var(--teal-300)] hover:bg-[var(--teal-50)]"
            }
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[var(--teal-100)] flex items-center justify-center">
              <ScanLine className="w-8 h-8 text-[var(--teal-600)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--teal-800)] text-base">
                ارفع صورة جواز السفر
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                اسحب الصورة هنا أو انقر للاختيار
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                PNG, JPG, WEBP — حتى 10 ميجابايت
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-[var(--teal-300)] text-[var(--teal-700)]">
              <Upload className="w-4 h-4 mr-2" />
              اختر صورة
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Uploading State */}
      {step === "uploading" && (
        <div className="border-2 border-[var(--teal-200)] rounded-2xl p-8 text-center bg-[var(--teal-50)]">
          <Loader2 className="w-10 h-10 text-[var(--teal-600)] animate-spin mx-auto mb-3" />
          <p className="font-semibold text-[var(--teal-800)]">جاري رفع الصورة...</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">يرجى الانتظار</p>
        </div>
      )}

      {/* Scanning State */}
      {step === "scanning" && (
        <div className="border-2 border-amber-200 rounded-2xl p-8 text-center bg-amber-50">
          <div className="relative mx-auto w-16 h-16 mb-3">
            <FileImage className="w-16 h-16 text-amber-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-amber-500 animate-pulse" />
            </div>
          </div>
          <p className="font-semibold text-amber-800">جاري تحليل جواز السفر...</p>
          <p className="text-sm text-amber-600 mt-1">يستخدم الذكاء الاصطناعي لاستخراج البيانات</p>
        </div>
      )}

      {/* Error State */}
      {step === "error" && (
        <div className="border-2 border-red-200 rounded-2xl p-6 bg-red-50">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800">فشل استخراج البيانات</p>
              <p className="text-sm text-red-600">يرجى التأكد من وضوح الصورة وإعادة المحاولة</p>
            </div>
          </div>
          <Button onClick={reset} variant="outline" size="sm" className="border-red-300 text-red-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* Success — Extracted Data */}
      {step === "done" && extracted && (
        <div className="border-2 border-green-200 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-green-50 px-5 py-3 flex items-center justify-between border-b border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800 text-sm">تم استخراج البيانات بنجاح</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">مُتحقق بالذكاء الاصطناعي</Badge>
              <Button onClick={reset} variant="ghost" size="sm" className="h-7 text-xs text-green-700 hover:text-green-900">
                <RefreshCw className="w-3 h-3 mr-1" />
                تغيير
              </Button>
            </div>
          </div>
          {/* Passport Image Preview */}
          {imageUrl && (
            <div className="px-5 pt-4">
              <img src={imageUrl} alt="Passport" className="w-full max-h-32 object-cover rounded-xl border border-green-200" />
            </div>
          )}
          {/* Data Grid */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: User, label: "الاسم الكامل", value: extracted.fullName },
              { icon: Hash, label: "رقم الجواز", value: extracted.passportNumber },
              { icon: Globe, label: "الجنسية", value: extracted.nationality },
              { icon: Calendar, label: "تاريخ الميلاد", value: extracted.dateOfBirth },
              { icon: Calendar, label: "تاريخ الانتهاء", value: extracted.expiryDate },
              { icon: User, label: "الجنس", value: extracted.gender === "M" ? "ذكر" : extracted.gender === "F" ? "أنثى" : extracted.gender },
              { icon: Globe, label: "مكان الميلاد", value: extracted.placeOfBirth },
            ].map((field) => (
              <div key={field.label} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[var(--teal-50)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <field.icon className="w-3.5 h-3.5 text-[var(--teal-600)]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)]">{field.label}</p>
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                    {field.value || <span className="text-[var(--muted-foreground)] font-normal italic">غير متاح</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* MRZ */}
          {extracted.mrz && (
            <div className="px-5 pb-5">
              <p className="text-xs text-[var(--muted-foreground)] mb-1">المنطقة القابلة للقراءة آلياً (MRZ)</p>
              <code className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg block font-mono break-all">
                {extracted.mrz}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
