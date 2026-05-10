import { useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: "hajj" | "umrah" | "hotels" | "tours" | "transport" | "visa" | "store" | "general";
  label?: string;
  placeholder?: string;
  className?: string;
  maxSizeMB?: number;
  aspectRatio?: string; // e.g. "16/9", "1/1", "4/3"
}

export default function ImageUpload({
  value,
  onChange,
  folder = "general",
  label,
  placeholder = "اسحب صورة هنا أو انقر للاختيار",
  className = "",
  maxSizeMB = 5,
  aspectRatio,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadMutation = trpc.assets.upload.useMutation({
    onSuccess: (data) => {
      onChange(data.url);
      setUploading(false);
      toast.success("تم رفع الصورة بنجاح");
    },
    onError: (err) => {
      setUploading(false);
      setPreview(null);
      toast.error(err.message || "فشل رفع الصورة");
    },
  });

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("يرجى اختيار ملف صورة صالح (JPG, PNG, WebP, GIF)");
        return;
      }
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error(`حجم الصورة يجب أن يكون أقل من ${maxSizeMB} ميجابايت`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        setUploading(true);
        // Strip data URI prefix for upload
        const base64Data = base64.replace(/^data:[^;]+;base64,/, "");
        uploadMutation.mutate({
          filename: file.name,
          contentType: file.type,
          base64Data,
          folder,
        });
      };
      reader.readAsDataURL(file);
    },
    [folder, maxSizeMB, uploadMutation]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemove = () => {
    onChange("");
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayImage = value || preview;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {displayImage && !uploading ? (
        /* Preview state */
        <div className="relative group rounded-xl overflow-hidden border border-border bg-muted"
          style={{ aspectRatio: aspectRatio || "16/9" }}>
          <img
            src={displayImage}
            alt="preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              className="gap-1.5 text-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              تغيير
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              className="gap-1.5 text-xs"
            >
              <X className="w-3.5 h-3.5" />
              حذف
            </Button>
          </div>
        </div>
      ) : (
        /* Upload drop zone */
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
            transition-all duration-200 cursor-pointer select-none
            ${isDragging
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/50 bg-muted/30"
            }
            ${uploading ? "pointer-events-none" : ""}
          `}
          style={{ minHeight: "120px", aspectRatio: aspectRatio || undefined }}
        >
          {uploading ? (
            <>
              {preview && (
                <img
                  src={preview}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-30"
                />
              )}
              <div className="relative flex flex-col items-center gap-2">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground font-medium">جاري الرفع...</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-foreground">{placeholder}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  JPG, PNG, WebP — حتى {maxSizeMB} ميجابايت
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs mt-1 bg-background"
              >
                <Upload className="w-3.5 h-3.5" />
                اختر صورة
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
