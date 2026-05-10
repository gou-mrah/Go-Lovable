import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Crown, Package, Users, CheckCircle, Clock, XCircle,
  Edit, RefreshCw, Plus, Star, Zap, TrendingUp,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function statusBadge(status: string, endDate?: string | Date | null) {
  const isExpired = endDate && new Date(endDate) < new Date();
  if (status === "active" && !isExpired) return <Badge className="bg-green-100 text-green-700 border-green-200">نشط</Badge>;
  if (status === "active" && isExpired) return <Badge className="bg-red-100 text-red-700 border-red-200">منتهي</Badge>;
  if (status === "pending_payment") return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">بانتظار الدفع</Badge>;
  if (status === "cancelled") return <Badge className="bg-gray-100 text-gray-600 border-gray-200">ملغى</Badge>;
  if (status === "expired") return <Badge className="bg-red-100 text-red-700 border-red-200">منتهي</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────
function StatsCards() {
  const { data: stats } = trpc.subscriptions.adminSubscriptionStats.useQuery();
  const cards = [
    { label: "إجمالي الاشتراكات", value: stats?.total ?? 0, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "اشتراكات نشطة", value: stats?.active ?? 0, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "بانتظار الدفع", value: stats?.pendingPayment ?? 0, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
    { label: "منتهية الصلاحية", value: stats?.expired ?? 0, icon: XCircle, color: "text-red-600 bg-red-50" },
    { label: "مع قوائم مميزة", value: stats?.withFeatured ?? 0, icon: Star, color: "text-purple-600 bg-purple-50" },
    { label: "مع إعلانات هيرو", value: stats?.withHeroAds ?? 0, icon: Zap, color: "text-orange-600 bg-orange-50" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.color}`}>
            <c.icon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{c.value}</div>
          <div className="text-xs text-gray-500">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Activate Subscription Dialog ─────────────────────────────────────────────
function ActivateDialog({
  sub,
  plans,
  onClose,
}: {
  sub: any;
  plans: any[];
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    planId: String(sub.planId ?? plans[0]?.id ?? ""),
    billingCycle: sub.billingCycle ?? "monthly",
    durationDays: "30",
    hasFeaturedListings: String(sub.hasFeaturedListings ?? false),
    hasHeroAds: String(sub.hasHeroAds ?? false),
    adminNotes: sub.adminNotes ?? "",
  });

  const activate = trpc.subscriptions.adminActivateSubscription.useMutation({
    onSuccess: () => {
      toast.success("تم تفعيل الاشتراك بنجاح");
      utils.subscriptions.adminListSubscriptions.invalidate();
      utils.subscriptions.adminSubscriptionStats.invalidate();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[var(--gold)]" />
            تفعيل الاشتراك
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>الباقة</Label>
            <Select value={form.planId} onValueChange={(v) => setForm((f) => ({ ...f, planId: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>دورة الفوترة</Label>
            <Select value={form.billingCycle} onValueChange={(v) => setForm((f) => ({ ...f, billingCycle: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="trial">تجريبي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
                <SelectItem value="annual">سنوي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>مدة الاشتراك (أيام)</Label>
            <Input type="number" value={form.durationDays} onChange={(e) => setForm((f) => ({ ...f, durationDays: e.target.value }))} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.hasFeaturedListings === "true"} onChange={(e) => setForm((f) => ({ ...f, hasFeaturedListings: String(e.target.checked) }))} />
              <span className="text-sm">قوائم مميزة</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.hasHeroAds === "true"} onChange={(e) => setForm((f) => ({ ...f, hasHeroAds: String(e.target.checked) }))} />
              <span className="text-sm">إعلانات هيرو</span>
            </label>
          </div>
          <div>
            <Label>ملاحظات الأدمن</Label>
            <Input value={form.adminNotes} onChange={(e) => setForm((f) => ({ ...f, adminNotes: e.target.value }))} placeholder="اختياري..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button
            className="bg-[var(--teal-700)] text-white hover:bg-[var(--teal-800)]"
            disabled={activate.isPending}
            onClick={() => activate.mutate({
              subscriptionId: sub.id,
              planId: Number(form.planId),
              billingCycle: form.billingCycle as any,
              durationDays: Number(form.durationDays),
              hasFeaturedListings: form.hasFeaturedListings === "true",
              hasHeroAds: form.hasHeroAds === "true",
              adminNotes: form.adminNotes || undefined,
            })}
          >
            {activate.isPending ? "جاري التفعيل..." : "تفعيل الاشتراك"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Subscriptions List ───────────────────────────────────────────────────────
function SubscriptionsList() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "cancelled" | "pending_payment">("all");
  const [activateSub, setActivateSub] = useState<any | null>(null);
  const { data: subs, isLoading } = trpc.subscriptions.adminListSubscriptions.useQuery({ status: statusFilter });
  const { data: plans } = trpc.subscriptions.listPlans.useQuery();

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الاشتراكات</SelectItem>
            <SelectItem value="active">نشطة</SelectItem>
            <SelectItem value="pending_payment">بانتظار الدفع</SelectItem>
            <SelectItem value="expired">منتهية</SelectItem>
            <SelectItem value="cancelled">ملغاة</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">{subs?.length ?? 0} اشتراك</span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin ml-2" /> جاري التحميل...
        </div>
      ) : !subs?.length ? (
        <div className="text-center py-12 text-gray-400">لا توجد اشتراكات</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs">
                <th className="text-right py-2 px-3">المزود</th>
                <th className="text-right py-2 px-3">الباقة</th>
                <th className="text-right py-2 px-3">الحالة</th>
                <th className="text-right py-2 px-3">تاريخ الانتهاء</th>
                <th className="text-right py-2 px-3">الإضافات</th>
                <th className="text-right py-2 px-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s: any) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-gray-900">{s.provider?.companyNameAr ?? s.provider?.companyNameEn ?? `مزود #${s.providerId}`}</div>
                    {s.upgradeRequestedPlanId && s.upgradeRequestedPlanId !== s.planId && (
                      <div className="text-xs text-yellow-600 mt-0.5">طلب ترقية معلق</div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium">{s.plan?.nameAr ?? `باقة #${s.planId}`}</div>
                    <div className="text-xs text-gray-400">{s.billingCycle === "trial" ? "تجريبي" : s.billingCycle === "monthly" ? "شهري" : "سنوي"}</div>
                  </td>
                  <td className="py-3 px-3">{statusBadge(s.status, s.endDate)}</td>
                  <td className="py-3 px-3 text-gray-600">{formatDate(s.endDate)}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1 flex-wrap">
                      {s.hasFeaturedListings && <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">مميزة</Badge>}
                      {s.hasHeroAds && <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs">هيرو</Badge>}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      onClick={() => setActivateSub(s)}
                    >
                      <Edit className="w-3 h-3 ml-1" />
                      تفعيل / تعديل
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activateSub && plans && (
        <ActivateDialog sub={activateSub} plans={plans} onClose={() => setActivateSub(null)} />
      )}
    </div>
  );
}

// ─── Plans Management ─────────────────────────────────────────────────────────
function PlansManagement() {
  const { data: plans, isLoading, refetch } = trpc.subscriptions.listPlans.useQuery();
  const [editPlan, setEditPlan] = useState<any | null>(null);
  const updatePlan = trpc.subscriptions.adminUpdatePlan.useMutation({
    onSuccess: () => { toast.success("تم تحديث الباقة"); refetch(); setEditPlan(null); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex items-center justify-center h-32 text-gray-400"><RefreshCw className="w-5 h-5 animate-spin ml-2" /> جاري التحميل...</div>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans?.map((plan) => (
          <div key={plan.id} className={`rounded-xl border-2 p-5 relative ${
            plan.slug === "professional" ? "border-[var(--gold)] bg-gradient-to-br from-amber-50 to-white" :
            plan.slug === "growth" ? "border-[var(--teal-400)] bg-gradient-to-br from-teal-50 to-white" :
            plan.slug === "basic" ? "border-blue-300 bg-gradient-to-br from-blue-50 to-white" :
            "border-gray-200 bg-white"
          }`}>
            {plan.slug === "professional" && (
              <div className="absolute -top-3 right-4 bg-[var(--gold)] text-white text-xs px-3 py-1 rounded-full font-bold">الأكثر شعبية</div>
            )}
            {plan.slug === "growth" && (
              <div className="absolute -top-3 right-4 bg-[var(--teal-600)] text-white text-xs px-3 py-1 rounded-full font-bold">الأفضل قيمة</div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{plan.nameAr}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{plan.descriptionAr}</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditPlan({ ...plan })}>
                <Edit className="w-3 h-3 ml-1" /> تعديل
              </Button>
            </div>
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">شهري:</span>
                <span className="font-bold">{plan.monthlyPriceSAR} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">سنوي:</span>
                <span className="font-bold">{plan.annualPriceSAR} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">أيام تجريبية:</span>
                <span className="font-bold">{plan.trialDays} يوم</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">حد البرامج:</span>
                <span className="font-bold">{plan.maxPrograms === -1 ? "غير محدود" : plan.maxPrograms}</span>
              </div>
            </div>
            <div className="space-y-1">
              {(plan.featuresAr as string[])?.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Plan Dialog */}
      {editPlan && (
        <Dialog open onOpenChange={() => setEditPlan(null)}>
          <DialogContent className="max-w-lg" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل الباقة: {editPlan.nameAr}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>السعر الشهري (ر.س)</Label>
                  <Input type="number" value={editPlan.monthlyPriceSAR} onChange={(e) => setEditPlan((p: any) => ({ ...p, monthlyPriceSAR: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>السعر السنوي (ر.س)</Label>
                  <Input type="number" value={editPlan.annualPriceSAR} onChange={(e) => setEditPlan((p: any) => ({ ...p, annualPriceSAR: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>أيام تجريبية</Label>
                  <Input type="number" value={editPlan.trialDays} onChange={(e) => setEditPlan((p: any) => ({ ...p, trialDays: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>حد البرامج (-1 = غير محدود)</Label>
                  <Input type="number" value={editPlan.maxPrograms} onChange={(e) => setEditPlan((p: any) => ({ ...p, maxPrograms: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <Label>الوصف (عربي)</Label>
                <Input value={editPlan.descriptionAr ?? ""} onChange={(e) => setEditPlan((p: any) => ({ ...p, descriptionAr: e.target.value }))} />
              </div>
              <div>
                <Label>المميزات (عربي) — سطر لكل ميزة</Label>
                <textarea
                  className="w-full border rounded-md p-2 text-sm min-h-[80px] resize-none"
                  value={(editPlan.featuresAr as string[])?.join("\n") ?? ""}
                  onChange={(e) => setEditPlan((p: any) => ({ ...p, featuresAr: e.target.value.split("\n") }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditPlan(null)}>إلغاء</Button>
              <Button
                className="bg-[var(--teal-700)] text-white hover:bg-[var(--teal-800)]"
                disabled={updatePlan.isPending}
                onClick={() => updatePlan.mutate({ id: editPlan.id, ...editPlan })}
              >
                {updatePlan.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Addons Management ────────────────────────────────────────────────────────
function AddonsManagement() {
  const { data: addons, isLoading, refetch } = trpc.subscriptions.listAddons.useQuery();
  const [editAddon, setEditAddon] = useState<any | null>(null);
  const updateAddon = trpc.subscriptions.adminUpdateAddon.useMutation({
    onSuccess: () => { toast.success("تم تحديث الإضافة"); refetch(); setEditAddon(null); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex items-center justify-center h-32 text-gray-400"><RefreshCw className="w-5 h-5 animate-spin ml-2" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addons?.map((addon) => (
        <div key={addon.id} className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900">{addon.nameAr}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{addon.descriptionAr}</p>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditAddon({ ...addon })}>
              <Edit className="w-3 h-3 ml-1" /> تعديل
            </Button>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">السعر الشهري:</span>
              <span className="font-bold">{addon.monthlyPriceSAR} ر.س</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">حد الفتحات لكل مزود:</span>
              <span className="font-bold">{addon.maxSlots}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">إجمالي فتحات المنصة:</span>
              <span className="font-bold">{addon.totalPlatformSlots}</span>
            </div>
          </div>
        </div>
      ))}

      {editAddon && (
        <Dialog open onOpenChange={() => setEditAddon(null)}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل الإضافة: {editAddon.nameAr}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>السعر الشهري (ر.س)</Label>
                <Input type="number" value={editAddon.monthlyPriceSAR} onChange={(e) => setEditAddon((a: any) => ({ ...a, monthlyPriceSAR: Number(e.target.value) }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>حد الفتحات لكل مزود</Label>
                  <Input type="number" value={editAddon.maxSlots} onChange={(e) => setEditAddon((a: any) => ({ ...a, maxSlots: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label>إجمالي فتحات المنصة</Label>
                  <Input type="number" value={editAddon.totalPlatformSlots} onChange={(e) => setEditAddon((a: any) => ({ ...a, totalPlatformSlots: Number(e.target.value) }))} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditAddon(null)}>إلغاء</Button>
              <Button
                className="bg-[var(--teal-700)] text-white hover:bg-[var(--teal-800)]"
                disabled={updateAddon.isPending}
                onClick={() => updateAddon.mutate({ id: editAddon.id, ...editAddon })}
              >
                {updateAddon.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SubscriptionsAdmin() {
  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gold)] to-amber-500 flex items-center justify-center">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">إدارة الاشتراكات</h1>
          <p className="text-sm text-gray-500">إدارة باقات المزودين والاشتراكات والإضافات</p>
        </div>
      </div>

      <StatsCards />

      <Tabs defaultValue="subscriptions" dir="rtl">
        <TabsList className="mb-6">
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> اشتراكات المزودين
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Package className="w-4 h-4" /> إدارة الباقات
          </TabsTrigger>
          <TabsTrigger value="addons" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> الإضافات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <SubscriptionsList />
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <PlansManagement />
        </TabsContent>

        <TabsContent value="addons">
          <AddonsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
