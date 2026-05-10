import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Edit, Trash2, Newspaper, Bell, Megaphone, Eye, EyeOff,
  Zap, Pin, PinOff, Search, Filter,
} from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "@/components/ui/ImageUpload";

// ─── Types ────────────────────────────────────────────────────────────────────
type PostType = "news" | "alert" | "article" | "announcement";
type PostCategory = "hajj" | "umrah" | "hotels" | "flights" | "visa" | "store" | "tours" | "transport" | "general";

const TYPE_OPTIONS = [
  { value: "news", label: "خبر", icon: Newspaper, color: "bg-blue-100 text-blue-700" },
  { value: "alert", label: "تنبيه", icon: Bell, color: "bg-red-100 text-red-700" },
  { value: "article", label: "مقال", icon: Newspaper, color: "bg-emerald-100 text-emerald-700" },
  { value: "announcement", label: "إعلان", icon: Megaphone, color: "bg-amber-100 text-amber-700" },
];

const CATEGORY_OPTIONS = [
  { value: "general", label: "عام" },
  { value: "hajj", label: "الحج" },
  { value: "umrah", label: "العمرة" },
  { value: "hotels", label: "الفنادق" },
  { value: "flights", label: "الطيران" },
  { value: "visa", label: "التأشيرات" },
  { value: "store", label: "المتجر" },
  { value: "tours", label: "الجولات" },
  { value: "transport", label: "المواصلات" },
];

const EMPTY_FORM = {
  type: "news" as PostType,
  category: "general" as PostCategory,
  title: "",
  summary: "",
  content: "",
  imageUrl: "",
  isPublished: true,
  isBreaking: false,
  isPinned: false,
  publishedAt: new Date().toISOString().slice(0, 16),
};

// ─── MediaCenterAdmin Component ───────────────────────────────────────────────
export default function MediaCenterAdmin() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const utils = trpc.useUtils();
  const { data: posts = [], isLoading } = trpc.media.adminList.useQuery({
    type: (typeFilter === "all" ? "all" : typeFilter) as any,
    category: (catFilter === "all" ? "all" : catFilter) as any,
  });

  const createMutation = trpc.media.create.useMutation({
    onSuccess: () => { utils.media.adminList.invalidate(); utils.media.list.invalidate(); utils.media.getBreaking.invalidate(); toast.success("تم إنشاء المنشور بنجاح"); setDialogOpen(false); setSaving(false); },
    onError: (e) => { toast.error(e.message); setSaving(false); },
  });
  const updateMutation = trpc.media.update.useMutation({
    onSuccess: () => { utils.media.adminList.invalidate(); utils.media.list.invalidate(); utils.media.getBreaking.invalidate(); toast.success("تم تحديث المنشور"); setDialogOpen(false); setSaving(false); },
    onError: (e) => { toast.error(e.message); setSaving(false); },
  });
  const deleteMutation = trpc.media.delete.useMutation({
    onSuccess: () => { utils.media.adminList.invalidate(); utils.media.list.invalidate(); utils.media.getBreaking.invalidate(); toast.success("تم حذف المنشور"); },
    onError: (e) => toast.error(e.message),
  });
  const togglePublishMutation = trpc.media.togglePublish.useMutation({
    onSuccess: () => { utils.media.adminList.invalidate(); utils.media.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const toggleBreakingMutation = trpc.media.toggleBreaking.useMutation({
    onSuccess: () => { utils.media.adminList.invalidate(); utils.media.getBreaking.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const togglePinnedMutation = trpc.media.togglePin.useMutation({
    onSuccess: () => { utils.media.adminList.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditingPost(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (post: any) => {
    setEditingPost(post);
    setForm({
      type: post.type,
      category: post.category,
      title: post.title,
      summary: post.summary || "",
      content: post.content || "",
      imageUrl: post.imageUrl || "",
      isPublished: post.isPublished,
      isBreaking: post.isBreaking,
      isPinned: post.isPinned,
      publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("العنوان مطلوب"); return; }
    setSaving(true);
    const payload = {
      ...form,
      publishedAt: new Date(form.publishedAt).getTime(),
    };
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return;
    deleteMutation.mutate({ id });
  };

  // Filter by search
  const filtered = posts.filter((p: any) => {
    if (searchQ && !p.title.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const getTypeInfo = (type: string) => TYPE_OPTIONS.find(t => t.value === type) || TYPE_OPTIONS[0];
  const getCatLabel = (cat: string) => CATEGORY_OPTIONS.find(c => c.value === cat)?.label || cat;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            المركز الإعلامي
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">إدارة الأخبار والتنبيهات والمقالات والإعلانات</p>
        </div>
        <Button onClick={openCreate} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white gap-2">
          <Plus className="w-4 h-4" />
          منشور جديد
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TYPE_OPTIONS.map(t => {
          const count = posts.filter((p: any) => p.type === t.value).length;
          const Icon = t.icon;
          return (
            <div key={t.value} className="bg-white rounded-xl border border-[var(--border)] p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--teal-800)]">{count}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{t.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white rounded-xl border border-[var(--border)] p-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="بحث في المنشورات..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="pr-9 text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 text-sm">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {TYPE_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-36 text-sm">
            <SelectValue placeholder="القسم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأقسام</SelectItem>
            {CATEGORY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-[var(--muted-foreground)]">
            <div className="animate-spin w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full ml-3" />
            جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)]">
            <Newspaper className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">لا توجد منشورات</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={openCreate}>إنشاء أول منشور</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)]/30 border-b border-[var(--border)]">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">العنوان</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">النوع</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">القسم</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">التاريخ</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filtered.map((post: any) => {
                  const typeInfo = getTypeInfo(post.type);
                  const TypeIcon = typeInfo.icon;
                  return (
                    <tr key={post.id} className="hover:bg-[var(--muted)]/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {post.imageUrl && (
                            <img src={post.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          )}
                          <div>
                            <div className="font-medium text-[var(--teal-800)] line-clamp-1 max-w-xs">{post.title}</div>
                            {post.summary && <div className="text-xs text-[var(--muted-foreground)] line-clamp-1 max-w-xs">{post.summary}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)]/30 px-2 py-0.5 rounded-full">
                          {getCatLabel(post.category)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${post.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {post.isPublished ? "منشور" : "مسودة"}
                          </span>
                          {post.isBreaking && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-0.5">
                              <Zap className="w-3 h-3" />عاجل
                            </span>
                          )}
                          {post.isPinned && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-0.5">
                              <Pin className="w-3 h-3" />مثبت
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                        {new Date(post.createdAt).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 hover:bg-amber-50 hover:text-amber-600"
                            onClick={() => toggleBreakingMutation.mutate({ id: post.id })}
                            title={post.isBreaking ? "إلغاء العاجل" : "تعيين كعاجل"}
                          >
                            <Zap className={`w-3.5 h-3.5 ${post.isBreaking ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 hover:bg-amber-50 hover:text-amber-600"
                            onClick={() => togglePinnedMutation.mutate({ id: post.id as number })}
                            title={post.isPinned ? "إلغاء التثبيت" : "تثبيت"}
                          >
                            {post.isPinned ? <PinOff className="w-3.5 h-3.5 text-amber-500" /> : <Pin className="w-3.5 h-3.5 text-gray-400" />}
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600"
                            onClick={() => togglePublishMutation.mutate({ id: post.id })}
                            title={post.isPublished ? "إخفاء" : "نشر"}
                          >
                            {post.isPublished ? <Eye className="w-3.5 h-3.5 text-green-500" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => openEdit(post)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {editingPost ? "تعديل المنشور" : "منشور جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Type & Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>نوع المنشور *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as PostType }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>القسم</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as PostCategory }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label>العنوان *</Label>
              <Input
                placeholder="عنوان المنشور..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <Label>الملخص</Label>
              <Input
                placeholder="ملخص قصير يظهر في القوائم..."
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label>المحتوى الكامل</Label>
              <Textarea
                placeholder="اكتب محتوى المنشور هنا..."
                value={form.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, content: e.target.value }))}
                rows={5}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label>صورة المنشور</Label>
              <ImageUpload
                value={form.imageUrl}
                onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
                folder="general"
                label="رفع صورة المنشور"
              />
            </div>

            {/* Published At */}
            <div className="space-y-1.5">
              <Label>تاريخ النشر</Label>
              <Input
                type="datetime-local"
                value={form.publishedAt}
                onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))}
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "isPublished", label: "منشور", icon: Eye, color: "text-green-600" },
                { key: "isBreaking", label: "عاجل", icon: Zap, color: "text-red-600" },
                { key: "isPinned", label: "مثبت", icon: Pin, color: "text-amber-600" },
              ].map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                    form[key as keyof typeof form]
                      ? `border-current ${color} bg-current/5`
                      : "border-[var(--border)] text-[var(--muted-foreground)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white gap-2"
            >
              {saving && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
              {editingPost ? "حفظ التعديلات" : "إنشاء المنشور"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
