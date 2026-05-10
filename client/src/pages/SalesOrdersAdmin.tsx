import { useState, useCallback, useEffect } from "react";
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
import { toast } from "sonner";
import {
  ShoppingCart, Plus, Search, Edit, Trash2, Phone, User,
  DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";

const SERVICE_LABELS: Record<string, string> = {
  umrah: "عمرة", visa: "تأشيرات", hotel: "فنادق",
  transport: "نقل", hajj: "حج", tour: "جولات", other: "أخرى",
};
const PAYMENT_LABELS: Record<string, string> = {
  bank_sar: "تحويل بنكي (ريال)", bank_egp: "تحويل بنكي (جنيه)",
  electronic: "إلكتروني", cash: "نقدي", settlement: "تسوية",
};
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "معلق", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "معتمد", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  completed: { label: "مكتمل", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-800", icon: XCircle },
};

type OrderForm = {
  orderDate: string; customerId: number | ""; customerName: string; customerPhone: string;
  marketerId: number | ""; supplierId: number | "";
  service: string; description: string;
  paymentMethod: string; currency: string;
  costPrice: number; marketerCommission: number; platformMargin: number;
  sellingPrice: number; amountPaid: number;
  status: string; notes: string;
};

const today = new Date().toISOString().split("T")[0];
const DEFAULT_FORM: OrderForm = {
  orderDate: today, customerId: "", customerName: "", customerPhone: "",
  marketerId: "", supplierId: "",
  service: "umrah", description: "",
  paymentMethod: "cash", currency: "SAR",
  costPrice: 0, marketerCommission: 0, platformMargin: 0,
  sellingPrice: 0, amountPaid: 0,
  status: "pending", notes: "",
};

function OrderFormDialog({
  open, onClose, editing, onSaved,
}: {
  open: boolean; onClose: () => void; editing: any | null; onSaved: () => void;
}) {
  const [form, setForm] = useState<OrderForm>(() =>
    editing ? {
      orderDate: editing.orderDate ?? today,
      customerId: editing.customerId ?? "",
      customerName: editing.customerName ?? "",
      customerPhone: editing.customerPhone ?? "",
      marketerId: editing.marketerId ?? "",
      supplierId: editing.supplierId ?? "",
      service: editing.service ?? "umrah",
      description: editing.description ?? "",
      paymentMethod: editing.paymentMethod ?? "cash",
      currency: editing.currency ?? "SAR",
      costPrice: Number(editing.costPrice ?? 0),
      marketerCommission: Number(editing.marketerCommission ?? 0),
      platformMargin: Number(editing.platformMargin ?? 0),
      sellingPrice: Number(editing.sellingPrice ?? 0),
      amountPaid: Number(editing.amountPaid ?? 0),
      status: editing.status ?? "pending",
      notes: editing.notes ?? "",
    } : DEFAULT_FORM
  );

  const { data: marketersList = [] } = trpc.marketers.list.useQuery({ role: "all" });
  const { data: suppliersList = [] } = trpc.suppliers.list.useQuery({ type: "all" });
  const { data: customersList = [] } = trpc.salesCustomers.list.useQuery({ search: "" });
  const utils = trpc.useUtils();

  // Auto-calc selling price
  useEffect(() => {
    const selling = form.costPrice + form.marketerCommission + form.platformMargin;
    setForm(f => ({ ...f, sellingPrice: selling }));
  }, [form.costPrice, form.marketerCommission, form.platformMargin]);

  const addMutation = trpc.salesOrders.add.useMutation({
    onSuccess: (data) => {
      toast.success(`تم إنشاء الطلب رقم #${data.orderNumber}`);
      utils.salesOrders.list.invalidate();
      utils.salesOrders.stats.invalidate();
      onSaved();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.salesOrders.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الطلب");
      utils.salesOrders.list.invalidate();
      utils.salesOrders.stats.invalidate();
      onSaved();
    },
    onError: (e) => toast.error(e.message),
  });

  const setF = useCallback((field: keyof OrderForm, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  }, []);

  const handleSubmit = () => {
    const payload = {
      orderDate: form.orderDate,
      customerId: form.customerId !== "" ? Number(form.customerId) : undefined,
      customerName: form.customerName || undefined,
      customerPhone: form.customerPhone || undefined,
      marketerId: form.marketerId !== "" ? Number(form.marketerId) : undefined,
      supplierId: form.supplierId !== "" ? Number(form.supplierId) : undefined,
      service: form.service as any,
      description: form.description || undefined,
      paymentMethod: form.paymentMethod as any,
      currency: form.currency as any,
      costPrice: form.costPrice,
      marketerCommission: form.marketerCommission,
      platformMargin: form.platformMargin,
      sellingPrice: form.sellingPrice,
      amountPaid: form.amountPaid,
      status: form.status as any,
      notes: form.notes || undefined,
    };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else addMutation.mutate(payload);
  };

  const isPending = addMutation.isPending || updateMutation.isPending;
  const remaining = form.sellingPrice - form.amountPaid;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editing ? `تعديل الطلب #${editing.orderNumber}` : "طلب جديد"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>تاريخ الطلب *</Label>
              <Input type="date" value={form.orderDate} onChange={e => setF("orderDate", e.target.value)} dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label>الخدمة *</Label>
              <Select value={form.service} onValueChange={v => setF("service", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>اسم العميل</Label>
              <Input value={form.customerName} onChange={e => setF("customerName", e.target.value)} placeholder="اسم العميل الكامل" />
            </div>
            <div className="space-y-1">
              <Label>هاتف العميل</Label>
              <Input value={form.customerPhone} onChange={e => setF("customerPhone", e.target.value)} placeholder="+966 5xx xxx xxxx" dir="ltr" />
            </div>
          </div>

          {/* Marketer & Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>المسوق</Label>
              <Select value={form.marketerId === "" ? "none" : String(form.marketerId)} onValueChange={v => setF("marketerId", v === "none" ? "" : Number(v))}>
                <SelectTrigger><SelectValue placeholder="اختر المسوق" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— بدون مسوق —</SelectItem>
                  {marketersList.map(m => (
                    <SelectItem key={m.id} value={String(m.id)}>{m.nameAr} ({m.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>المورد</Label>
              <Select value={form.supplierId === "" ? "none" : String(form.supplierId)} onValueChange={v => setF("supplierId", v === "none" ? "" : Number(v))}>
                <SelectTrigger><SelectValue placeholder="اختر المورد" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— بدون مورد —</SelectItem>
                  {suppliersList.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.nameAr} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Method & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>طريقة الدفع</Label>
              <Select value={form.paymentMethod} onValueChange={v => setF("paymentMethod", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_LABELS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>العملة</Label>
              <Select value={form.currency} onValueChange={v => setF("currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Financial Breakdown */}
          <div className="space-y-1">
            <Label className="text-base font-semibold">التفاصيل المالية</Label>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">سعر التكلفة</Label>
              <Input type="number" min="0" value={form.costPrice}
                onChange={e => setF("costPrice", Number(e.target.value))} dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">عمولة المسوق</Label>
              <Input type="number" min="0" value={form.marketerCommission}
                onChange={e => setF("marketerCommission", Number(e.target.value))} dir="ltr" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">هامش المنصة</Label>
              <Input type="number" min="0" value={form.platformMargin}
                onChange={e => setF("platformMargin", Number(e.target.value))} dir="ltr" />
            </div>
          </div>

          {/* Auto-calculated selling price */}
          <div className="bg-muted/30 rounded-lg p-3 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">سعر البيع (محسوب)</div>
              <div className="text-xl font-bold text-primary">{form.sellingPrice.toLocaleString()} {form.currency}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">المبلغ المدفوع</div>
              <Input type="number" min="0" value={form.amountPaid}
                onChange={e => setF("amountPaid", Number(e.target.value))}
                className="text-center text-lg font-bold mt-1" dir="ltr" />
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">المتبقي</div>
              <div className={`text-xl font-bold ${remaining > 0 ? "text-red-500" : "text-green-600"}`}>
                {remaining.toLocaleString()} {form.currency}
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>الحالة</Label>
              <Select value={form.status} onValueChange={v => setF("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                    <SelectItem key={v} value={v}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>الوصف / الملاحظات</Label>
              <Input value={form.description} onChange={e => setF("description", e.target.value)} placeholder="تفاصيل الطلب..." />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
            {isPending ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إنشاء الطلب"}
          </Button>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SalesOrdersAdmin() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const { data: stats } = trpc.salesOrders.stats.useQuery({});
  const { data: list = [], isLoading } = trpc.salesOrders.list.useQuery({ search, status: statusFilter as any });
  const utils = trpc.useUtils();

  const deleteMutation = trpc.salesOrders.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الطلب");
      utils.salesOrders.list.invalidate();
      utils.salesOrders.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleDelete = (id: number, num: number) => {
    if (confirm(`هل تريد حذف الطلب #${num}؟`)) deleteMutation.mutate({ id });
  };

  const openAdd = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (o: any) => { setEditing(o); setDialogOpen(true); };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة الطلبات</h2>
          <p className="text-muted-foreground text-sm mt-1">تتبع المبيعات والعمولات والأرباح</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          طلب جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-blue-600", isNum: false },
          { label: "إجمالي المبيعات", value: (stats?.totalRevenue ?? 0).toLocaleString(), icon: DollarSign, color: "text-green-600", isNum: true },
          { label: "صافي الأرباح", value: (stats?.totalProfit ?? 0).toLocaleString(), icon: TrendingUp, color: "text-purple-600", isNum: true },
          { label: "العمولات", value: (stats?.totalCommissions ?? 0).toLocaleString(), icon: TrendingDown, color: "text-orange-500", isNum: true },
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

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث باسم العميل أو رقم الطلب..." className="pr-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([v, c]) => (
              <SelectItem key={v} value={v}>{c.label}</SelectItem>
            ))}
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
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">لا توجد طلبات. أنشئ أول طلب الآن.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-right p-3 font-medium">#</th>
                    <th className="text-right p-3 font-medium">التاريخ</th>
                    <th className="text-right p-3 font-medium">العميل</th>
                    <th className="text-right p-3 font-medium">الخدمة</th>
                    <th className="text-right p-3 font-medium">سعر البيع</th>
                    <th className="text-right p-3 font-medium">الربح</th>
                    <th className="text-right p-3 font-medium">الحالة</th>
                    <th className="text-right p-3 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(o => {
                    const sc = STATUS_CONFIG[o.status ?? "pending"];
                    const StatusIcon = sc?.icon ?? AlertCircle;
                    const remaining = Number(o.sellingPrice) - Number(o.amountPaid);
                    return (
                      <tr key={o.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-mono font-bold text-primary">#{o.orderNumber}</td>
                        <td className="p-3 text-muted-foreground text-xs">{o.orderDate}</td>
                        <td className="p-3">
                          <div className="font-medium">{o.customerName ?? "—"}</div>
                          {o.customerPhone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />{o.customerPhone}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs">{SERVICE_LABELS[o.service ?? "other"]}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold">{Number(o.sellingPrice).toLocaleString()} {o.currency}</div>
                          {remaining > 0 && (
                            <div className="text-xs text-red-500">متبقي: {remaining.toLocaleString()}</div>
                          )}
                        </td>
                        <td className="p-3 font-medium text-green-600">
                          {Number(o.platformMargin).toLocaleString()} {o.currency}
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc?.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc?.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(o)}><Edit className="w-3.5 h-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(o.id, o.orderNumber)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        onSaved={() => setDialogOpen(false)}
      />
    </div>
  );
}
