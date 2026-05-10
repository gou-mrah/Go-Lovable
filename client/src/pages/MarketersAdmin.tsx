import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users, UserPlus, Search, Edit, Trash2, Phone, Mail, MapPin,
  Briefcase, GraduationCap, Calendar, Tag, TrendingUp, UserCheck, UserX,
  CheckCircle2, XCircle, Clock
} from "lucide-react";

const GENDER_LABELS: Record<string, string> = { male: "ذكر", female: "أنثى" };
const ROLE_LABELS: Record<string, string> = { marketer: "مسوق", employee: "موظف" };
const MARITAL_LABELS: Record<string, string> = { single: "أعزب", married: "متزوج", divorced: "مطلق", widowed: "أرمل" };

type MarketerForm = {
  nameAr: string; nameEn: string; gender: "male" | "female"; role: "marketer" | "employee";
  jobTitle: string; education: string; skills: string; phone: string; email: string;
  city: string; maritalStatus: "single" | "married" | "divorced" | "widowed";
  birthDate: string; joinDate: string; notes: string;
};

const DEFAULT_FORM: MarketerForm = {
  nameAr: "", nameEn: "", gender: "male", role: "marketer",
  jobTitle: "", education: "", skills: "", phone: "", email: "",
  city: "", maritalStatus: "single", birthDate: "", joinDate: "", notes: "",
};

function MarketerFormDialog({
  open, onClose, editing, onSaved,
}: {
  open: boolean; onClose: () => void; editing: any | null; onSaved: () => void;
}) {
  const [form, setForm] = useState<MarketerForm>(() =>
    editing ? {
      nameAr: editing.nameAr ?? "", nameEn: editing.nameEn ?? "",
      gender: editing.gender ?? "male", role: editing.role ?? "marketer",
      jobTitle: editing.jobTitle ?? "", education: editing.education ?? "",
      skills: (editing.skills ?? []).join(", "), phone: editing.phone ?? "",
      email: editing.email ?? "", city: editing.city ?? "",
      maritalStatus: editing.maritalStatus ?? "single",
      birthDate: editing.birthDate ?? "", joinDate: editing.joinDate ?? "",
      notes: editing.notes ?? "",
    } : DEFAULT_FORM
  );
  const utils = trpc.useUtils();
  const addMutation = trpc.marketers.add.useMutation({
    onSuccess: (data) => {
      toast.success(`تم إضافة المسوق — الكود: ${data.code}`);
      utils.marketers.list.invalidate();
      utils.marketers.stats.invalidate();
      onSaved();
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.marketers.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات المسوق");
      utils.marketers.list.invalidate();
      onSaved();
    },
    onError: (e) => toast.error(e.message),
  });

  const setF = useCallback((field: keyof MarketerForm, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);

  const handleSubmit = () => {
    const payload = {
      nameAr: form.nameAr, nameEn: form.nameEn || undefined,
      gender: form.gender, role: form.role,
      jobTitle: form.jobTitle || undefined, education: form.education || undefined,
      skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      phone: form.phone || undefined, email: form.email || undefined,
      city: form.city || undefined, maritalStatus: form.maritalStatus,
      birthDate: form.birthDate || undefined, joinDate: form.joinDate || undefined,
      notes: form.notes || undefined,
    };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else addMutation.mutate(payload);
  };

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل بيانات المسوق" : "إضافة مسوق جديد"}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="personal">
          <TabsList className="w-full">
            <TabsTrigger value="personal" className="flex-1">المعلومات الشخصية</TabsTrigger>
            <TabsTrigger value="job" className="flex-1">تفاصيل الوظيفة</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>الاسم بالعربية *</Label>
                <Input value={form.nameAr} onChange={e => setF("nameAr", e.target.value)} placeholder="الاسم الكامل" />
              </div>
              <div className="space-y-1">
                <Label>الاسم بالإنجليزية</Label>
                <Input value={form.nameEn} onChange={e => setF("nameEn", e.target.value)} placeholder="Full Name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>الجنس</Label>
                <Select value={form.gender} onValueChange={v => setF("gender", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>الحالة الاجتماعية</Label>
                <Select value={form.maritalStatus} onValueChange={v => setF("maritalStatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label>رقم الهاتف</Label>
                <Input value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="+966 5xx xxx xxxx" dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label>البريد الإلكتروني</Label>
                <Input value={form.email} onChange={e => setF("email", e.target.value)} placeholder="email@example.com" dir="ltr" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>المدينة</Label>
                <Input value={form.city} onChange={e => setF("city", e.target.value)} placeholder="القاهرة، جدة..." />
              </div>
              <div className="space-y-1">
                <Label>تاريخ الميلاد</Label>
                <Input type="date" value={form.birthDate} onChange={e => setF("birthDate", e.target.value)} dir="ltr" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="job" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>الدور</Label>
                <Select value={form.role} onValueChange={v => setF("role", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketer">مسوق</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>المسمى الوظيفي</Label>
                <Input value={form.jobTitle} onChange={e => setF("jobTitle", e.target.value)} placeholder="مدير مبيعات، مسؤول حجوزات..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>المؤهل التعليمي</Label>
                <Input value={form.education} onChange={e => setF("education", e.target.value)} placeholder="بكالوريوس، دبلوم..." />
              </div>
              <div className="space-y-1">
                <Label>تاريخ الانضمام</Label>
                <Input type="date" value={form.joinDate} onChange={e => setF("joinDate", e.target.value)} dir="ltr" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>المهارات (مفصولة بفاصلة)</Label>
              <Input value={form.skills} onChange={e => setF("skills", e.target.value)} placeholder="تسويق رقمي، خدمة عملاء، مبيعات..." />
            </div>
            <div className="space-y-1">
              <Label>ملاحظات</Label>
              <Textarea value={form.notes} onChange={e => setF("notes", e.target.value)} placeholder="أي ملاحظات إضافية..." rows={3} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} disabled={!form.nameAr || isPending} className="flex-1">
            {isPending ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة المسوق"}
          </Button>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MarketersAdmin() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "marketer" | "employee">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [mainTab, setMainTab] = useState<"list" | "requests">("list");

  const { data: stats } = trpc.marketers.stats.useQuery();
  const { data: list = [], isLoading } = trpc.marketers.list.useQuery({ search, role: roleFilter });
  const { data: pendingList = [], isLoading: pendingLoading } = trpc.marketers.listPending.useQuery();
  const utils = trpc.useUtils();

  const approveMutation = trpc.marketers.approveMarketer.useMutation({
    onSuccess: () => {
      toast.success("تم اعتماد المسوق بنجاح");
      utils.marketers.listPending.invalidate();
      utils.marketers.list.invalidate();
      utils.marketers.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const rejectMutation = trpc.marketers.rejectMarketer.useMutation({
    onSuccess: () => {
      toast.success("تم رفض طلب المسوق");
      utils.marketers.listPending.invalidate();
      utils.marketers.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.marketers.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المسوق");
      utils.marketers.list.invalidate();
      utils.marketers.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMutation = trpc.marketers.update.useMutation({
    onSuccess: () => utils.marketers.list.invalidate(),
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`هل تريد حذف المسوق "${name}"؟`)) deleteMutation.mutate({ id });
  };

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (m: any) => { setEditing(m); setDialogOpen(true); };
  const onSaved = () => setDialogOpen(false);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة المسوقين والموظفين</h2>
          <p className="text-muted-foreground text-sm mt-1">إدارة فريق المبيعات وتتبع أداء المسوقين</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <UserPlus className="w-4 h-4" />
          إضافة مسوق
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي المسوقين", value: stats?.total ?? 0, icon: Users, color: "text-blue-600" },
          { label: "مسوقون نشطون", value: stats?.active ?? 0, icon: UserCheck, color: "text-green-600" },
          { label: "موظفون", value: stats?.employees ?? 0, icon: Briefcase, color: "text-purple-600" },
          { label: "غير نشطين", value: stats?.inactive ?? 0, icon: UserX, color: "text-red-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color}`} />
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={v => setMainTab(v as "list" | "requests")}>
        <TabsList className="grid grid-cols-2 w-full max-w-sm">
          <TabsTrigger value="list">قائمة المسوقين</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            طلبات الانضمام
            {pendingList.length > 0 && (
              <span className="absolute -top-1 -left-1 bg-yellow-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {pendingList.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الكود أو الهاتف..."
                className="pr-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={v => setRoleFilter(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="marketer">مسوقون</SelectItem>
                <SelectItem value="employee">موظفون</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : list.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">لا يوجد مسوقون. أضف أول مسوق الآن.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-right p-3 font-medium">الكود</th>
                    <th className="text-right p-3 font-medium">الاسم</th>
                    <th className="text-right p-3 font-medium">الجنس</th>
                    <th className="text-right p-3 font-medium">الدور / الوظيفة</th>
                    <th className="text-right p-3 font-medium">الاتصال</th>
                    <th className="text-right p-3 font-medium">تاريخ الانضمام</th>
                    <th className="text-right p-3 font-medium">الحالة</th>
                    <th className="text-right p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(m => (
                    <tr key={m.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <Badge variant="outline" className="font-mono text-xs">{m.code}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{m.nameAr}</div>
                        {m.nameEn && <div className="text-xs text-muted-foreground">{m.nameEn}</div>}
                      </td>
                      <td className="p-3 text-muted-foreground">{GENDER_LABELS[m.gender ?? "male"]}</td>
                      <td className="p-3">
                        <Badge variant={m.role === "marketer" ? "default" : "secondary"} className="text-xs">
                          {ROLE_LABELS[m.role ?? "marketer"]}
                        </Badge>
                        {m.jobTitle && <div className="text-xs text-muted-foreground mt-0.5">{m.jobTitle}</div>}
                      </td>
                      <td className="p-3">
                        {m.phone && (
                          <div className="flex items-center gap-1 text-xs">
                            <Phone className="w-3 h-3" />{m.phone}
                          </div>
                        )}
                        {m.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />{m.email}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground text-xs">{m.joinDate ?? "—"}</td>
                      <td className="p-3">
                        <Switch
                          checked={m.isActive}
                          onCheckedChange={v => toggleMutation.mutate({ id: m.id, isActive: v })}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(m)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(m.id, m.nameAr)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </CardContent>
          </Card>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="mt-4 space-y-4">
          {pendingLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : pendingList.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-muted-foreground">لا توجد طلبات انتظار حالياً</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingList.map(m => (
                <Card key={m.id} className="border-yellow-200 bg-yellow-50/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-2.5 rounded-full bg-orange-100 flex-shrink-0">
                          <TrendingUp className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold truncate">{m.nameAr}</p>
                            <Badge variant="outline" className="font-mono text-xs border-orange-300">{m.code}</Badge>
                          </div>
                          {m.nameEn && <p className="text-sm text-muted-foreground">{m.nameEn}</p>}
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                            {m.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>}
                            {m.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>}
                            {m.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{m.city}</span>}
                          </div>
                          {m.skills && (m.skills as string[]).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(m.skills as string[]).map((s: string) => (
                                <Badge key={s} variant="outline" className="text-xs py-0 border-orange-300">{s}</Badge>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            تاريخ الطلب: {new Date(m.createdAt).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          className="text-xs h-8 bg-green-600 hover:bg-green-700"
                          onClick={() => approveMutation.mutate({ id: m.id })}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 ml-1" /> اعتماد
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-xs h-8"
                          onClick={() => rejectMutation.mutate({ id: m.id })}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-3.5 w-3.5 ml-1" /> رفض
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <MarketerFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        onSaved={onSaved}
      />
    </div>
  );
}
