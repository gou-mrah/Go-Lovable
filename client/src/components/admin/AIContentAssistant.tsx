import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Wand2, Image as ImageIcon, RefreshCw, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ContentType =
  | "umrah_package"
  | "hajj_package"
  | "hotel"
  | "tour"
  | "transport"
  | "product"
  | "media_post"
  | "visa_package";

interface AIContentAssistantProps {
  contentType: ContentType;
  hints?: string;
  onApply: (data: {
    title?: string;
    subtitle?: string;
    description?: string;
    features?: string[];
    price_suggestion?: string;
    tags?: string[];
    seo_description?: string;
    imageUrl?: string;
  }) => void;
  className?: string;
}

const TYPE_LABELS: Record<ContentType, string> = {
  umrah_package: "باقة عمرة",
  hajj_package: "باقة حج",
  hotel: "فندق",
  tour: "جولة سياحية",
  transport: "خدمة نقل",
  product: "منتج",
  media_post: "مقال / خبر",
  visa_package: "باقة تأشيرة",
};

interface GeneratedContent {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  price_suggestion: string;
  tags: string[];
  seo_description: string;
}

export default function AIContentAssistant({ contentType, hints, onApply, className }: AIContentAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const generateContentMutation = trpc.aiContent.generateContent.useMutation({
    onSuccess: (data) => {
      setGenerated(data as GeneratedContent);
      toast.success("تم توليد المحتوى بنجاح!");
    },
    onError: (err) => {
      toast.error("فشل توليد المحتوى: " + err.message);
    },
  });

  const generateImageMutation = trpc.aiContent.generateImage.useMutation({
    onSuccess: (data) => {
      setGeneratedImageUrl(data.url ?? null);
      toast.success("تم توليد الصورة بنجاح!");
    },
    onError: (err) => {
      toast.error("فشل توليد الصورة: " + err.message);
    },
  });

  const handleGenerateContent = () => {
    generateContentMutation.mutate({ type: contentType, hints, language: "ar" });
  };

  const handleGenerateImage = () => {
    generateImageMutation.mutate({ type: contentType, title: generated?.title });
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null as string | null), 2000);
  };

  const handleApplyAll = () => {
    if (!generated) return;
    onApply({
      title: generated.title,
      subtitle: generated.subtitle,
      description: generated.description,
      features: generated.features,
      price_suggestion: generated.price_suggestion,
      tags: generated.tags,
      seo_description: generated.seo_description,
      imageUrl: generatedImageUrl || undefined,
    });
    toast.success("تم تطبيق المحتوى على النموذج!");
  };

  return (
    <div className={cn("border border-dashed border-amber-500/40 rounded-xl overflow-hidden", className)}>
      {/* Header toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            مساعد الذكاء الاصطناعي — {TYPE_LABELS[contentType]}
          </span>
          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 py-0">
            AI
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-amber-500/60" />
        ) : (
          <ChevronDown className="w-4 h-4 text-amber-500/60" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 bg-amber-500/3">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleGenerateContent}
              disabled={generateContentMutation.isPending}
              className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 gap-1.5"
            >
              {generateContentMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5" />
              )}
              <span style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {generated ? "إعادة التوليد" : "توليد المحتوى"}
              </span>
            </Button>

            {generated && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateImage}
                  disabled={generateImageMutation.isPending}
                  className="border-amber-500/40 text-amber-600 hover:bg-amber-500/10 gap-1.5"
                >
                  {generateImageMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5" />
                  )}
                  <span style={{ fontFamily: "'Tajawal', sans-serif" }}>توليد صورة</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyAll}
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span style={{ fontFamily: "'Tajawal', sans-serif" }}>تطبيق الكل</span>
                </Button>
              </>
            )}
          </div>

          {/* Generated content preview */}
          {generated && (
            <div className="space-y-3 text-sm" dir="rtl">
              {/* Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Tajawal', sans-serif" }}>العنوان</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(generated.title, "title")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedField === "title" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onApply({ title: generated.title })}
                      className="text-[10px] text-amber-600 hover:underline"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    >
                      تطبيق
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-foreground bg-background/50 rounded-lg px-3 py-2 border border-border/50" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  {generated.title}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Tajawal', sans-serif" }}>الوصف</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(generated.description, "description")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedField === "description" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onApply({ description: generated.description })}
                      className="text-[10px] text-amber-600 hover:underline"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    >
                      تطبيق
                    </button>
                  </div>
                </div>
                <p className="text-muted-foreground bg-background/50 rounded-lg px-3 py-2 border border-border/50 leading-relaxed" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  {generated.description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Tajawal', sans-serif" }}>المميزات</span>
                  <button
                    type="button"
                    onClick={() => onApply({ features: generated.features })}
                    className="text-[10px] text-amber-600 hover:underline"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    تطبيق
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {generated.features.map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                      ✓ {f}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price suggestion */}
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <div>
                  <span className="text-xs text-muted-foreground block" style={{ fontFamily: "'Tajawal', sans-serif" }}>السعر المقترح</span>
                  <span className="font-semibold text-green-700 dark:text-green-400" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    {generated.price_suggestion}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(generated.price_suggestion, "price")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copiedField === "price" ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* Generated Image */}
              {generatedImageUrl && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: "'Tajawal', sans-serif" }}>الصورة المولّدة</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={handleGenerateImage}
                        disabled={generateImageMutation.isPending}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {generateImageMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onApply({ imageUrl: generatedImageUrl })}
                        className="text-[10px] text-amber-600 hover:underline"
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        استخدام
                      </button>
                    </div>
                  </div>
                  <img
                    src={generatedImageUrl}
                    alt="AI generated"
                    className="w-full h-32 object-cover rounded-lg border border-border/50"
                  />
                </div>
              )}
            </div>
          )}

          {/* Loading state */}
          {(generateContentMutation.isPending || generateImageMutation.isPending) && (
            <div className="flex items-center gap-2 text-amber-600 text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{generateContentMutation.isPending ? "جاري توليد المحتوى..." : "جاري توليد الصورة..."}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
