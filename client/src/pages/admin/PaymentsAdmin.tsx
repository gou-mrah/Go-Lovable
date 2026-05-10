import { usdToSar } from "@shared/const";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreditCard, Search, RefreshCw, Loader2, CheckCircle,
  XCircle, Clock, DollarSign, ShoppingBag, FileText, Package,
  Eye, Download, Filter, TrendingUp, Calendar,
} from "lucide-react";
import { toast } from "sonner";

type PaymentFilter = "all" | "paid" | "unpaid" | "refunded";
type ServiceFilter = "all" | "booking" | "order" | "visa";

export default function PaymentsAdmin() {
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Fetch all bookings with payment data
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = trpc.bookings.listAll.useQuery(
    { limit: 100 },
    { staleTime: 30_000 }
  );

  // Fetch all orders
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = trpc.store.listOrders.useQuery(
    { limit: 100 },
    { staleTime: 30_000 }
  );

  // Fetch all visa applications
  const { data: visaData, isLoading: visaLoading, refetch: refetchVisas } = trpc.visa.listApplications.useQuery(
    { limit: 100, status: "all" },
    { staleTime: 30_000 }
  );

  const isLoading = bookingsLoading || ordersLoading || visaLoading;

  // Normalize all payment data into a unified list
  const allPayments = useMemo(() => {
    const payments: any[] = [];

    // Bookings
    const bookings = (bookingsData as any)?.bookings ?? bookingsData ?? [];
    (Array.isArray(bookings) ? bookings : []).forEach((b: any) => {
      payments.push({
        id: `booking-${b.id}`,
        serviceType: "booking",
        serviceId: b.id,
        reference: b.bookingNumber,
        serviceName: b.serviceName || b.serviceType,
        customerName: b.guestName,
        amount: usdToSar(Number(b.totalUSD || 0)),
        currency: "SAR",
        paymentStatus: b.paymentStatus || "unpaid",
        paymentIntentId: b.paymentIntentId || b.stripePaymentIntentId,
        paidAt: b.paidAt,
        createdAt: b.createdAt,
        status: b.status,
      });
    });

    // Orders
    const ordersList = (ordersData as any)?.orders ?? ordersData ?? [];
    (Array.isArray(ordersList) ? ordersList : []).forEach((o: any) => {
      payments.push({
        id: `order-${o.id}`,
        serviceType: "order",
        serviceId: o.id,
        reference: o.orderNumber,
        serviceName: "طلب من المتجر",
        customerName: o.shippingAddress?.name || "—",
        amount: usdToSar(Number(o.totalUSD || 0)),
        currency: "SAR",
        paymentStatus: o.paidAt ? "paid" : "unpaid",
        paymentIntentId: o.paymentIntentId,
        paidAt: o.paidAt,
        createdAt: o.createdAt,
        status: o.status,
      });
    });

    // Visa Applications
    const visaList = (visaData as any)?.applications ?? visaData ?? [];
    (Array.isArray(visaList) ? visaList : []).forEach((v: any) => {
      if (v.feeSAR && Number(v.feeSAR) > 0) {
        payments.push({
          id: `visa-${v.id}`,
          serviceType: "visa",
          serviceId: v.id,
          reference: `VISA-${v.id}`,
          serviceName: v.visaTypeName || "تأشيرة",
          customerName: v.applicantName,
          amount: Number(v.feeSAR || 0),
          currency: "SAR",
          paymentStatus: v.paymentStatus || "unpaid",
          paymentIntentId: v.paymentIntentId,
          paidAt: v.paidAt,
          createdAt: v.createdAt,
          status: v.status,
        });
      }
    });

    // Sort by createdAt desc
    payments.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da;
    });

    return payments;
  }, [bookingsData, ordersData, visaData]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return allPayments.filter((p) => {
      if (paymentFilter !== "all" && p.paymentStatus !== paymentFilter) return false;
      if (serviceFilter !== "all" && p.serviceType !== serviceFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          p.reference?.toLowerCase().includes(q) ||
          p.customerName?.toLowerCase().includes(q) ||
          p.serviceName?.toLowerCase().includes(q) ||
          p.paymentIntentId?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allPayments, paymentFilter, serviceFilter, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = allPayments.length;
    const paid = allPayments.filter(p => p.paymentStatus === "paid").length;
    const unpaid = allPayments.filter(p => p.paymentStatus === "unpaid").length;
    const totalRevenue = allPayments
      .filter(p => p.paymentStatus === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    return { total, paid, unpaid, totalRevenue };
  }, [allPayments]);

  const handleRefresh = () => {
    refetchBookings();
    refetchOrders();
    refetchVisas();
    toast.success("تم تحديث البيانات");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 ml-1" />مدفوع</Badge>;
      case "unpaid":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><Clock className="w-3 h-3 ml-1" />غير مدفوع</Badge>;
      case "refunded":
        return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="w-3 h-3 ml-1" />مسترجع</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "booking": return <Package className="w-4 h-4 text-blue-500" />;
      case "order": return <ShoppingBag className="w-4 h-4 text-purple-500" />;
      case "visa": return <FileText className="w-4 h-4 text-teal-500" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getServiceLabel = (type: string) => {
    switch (type) {
      case "booking": return "حجز";
      case "order": return "طلب";
      case "visa": return "تأشيرة";
      default: return type;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            إدارة المدفوعات
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            متابعة جميع المدفوعات عبر Moyasar لجميع الخدمات
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--teal-800)]">{stats.total}</div>
              <div className="text-xs text-[var(--muted-foreground)]">إجمالي العمليات</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">{stats.paid}</div>
              <div className="text-xs text-[var(--muted-foreground)]">مدفوعة</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-700">{stats.unpaid}</div>
              <div className="text-xs text-[var(--muted-foreground)]">في الانتظار</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700">{stats.totalRevenue.toFixed(0)} <span className="text-sm font-normal">ر.س</span></div>
              <div className="text-xs text-[var(--muted-foreground)]">إجمالي الإيرادات</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="بحث بالمرجع أو اسم العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="حالة الدفع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="paid">مدفوع</SelectItem>
              <SelectItem value="unpaid">غير مدفوع</SelectItem>
              <SelectItem value="refunded">مسترجع</SelectItem>
            </SelectContent>
          </Select>
          <Select value={serviceFilter} onValueChange={(v) => setServiceFilter(v as ServiceFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="نوع الخدمة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الخدمات</SelectItem>
              <SelectItem value="booking">حجوزات</SelectItem>
              <SelectItem value="order">طلبات المتجر</SelectItem>
              <SelectItem value="visa">تأشيرات</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد مدفوعات مطابقة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--teal-50)] border-b">
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">المرجع</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">النوع</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">الخدمة</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">العميل</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">المبلغ</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">حالة الدفع</th>
                  <th className="text-right px-4 py-3 font-semibold text-[var(--teal-800)]">التاريخ</th>
                  <th className="text-center px-4 py-3 font-semibold text-[var(--teal-800)]">تفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{payment.reference}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getServiceIcon(payment.serviceType)}
                        <span className="text-xs">{getServiceLabel(payment.serviceType)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs max-w-[150px] truncate">{payment.serviceName}</td>
                    <td className="px-4 py-3 text-xs">{payment.customerName}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--teal-800)]">
                      {payment.amount.toFixed(2)} <span className="text-xs font-normal text-[var(--muted-foreground)]">ر.س</span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(payment.paymentStatus)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{formatDate(payment.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                        className="text-[var(--primary)]"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              <CreditCard className="w-5 h-5 text-[var(--primary)]" />
              تفاصيل الدفع
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <DetailRow label="المرجع" value={selectedPayment.reference} />
                <DetailRow label="نوع الخدمة" value={getServiceLabel(selectedPayment.serviceType)} />
                <DetailRow label="الخدمة" value={selectedPayment.serviceName} />
                <DetailRow label="العميل" value={selectedPayment.customerName} />
                <DetailRow label="المبلغ" value={`${selectedPayment.amount.toFixed(2)} ر.س`} />
                <DetailRow label="حالة الدفع" value={selectedPayment.paymentStatus === "paid" ? "مدفوع" : selectedPayment.paymentStatus === "refunded" ? "مسترجع" : "غير مدفوع"} />
                {selectedPayment.paymentIntentId && (
                  <DetailRow label="معرف Moyasar" value={selectedPayment.paymentIntentId} />
                )}
                {selectedPayment.paidAt && (
                  <DetailRow label="تاريخ الدفع" value={formatDate(selectedPayment.paidAt)} />
                )}
                <DetailRow label="تاريخ الإنشاء" value={formatDate(selectedPayment.createdAt)} />
                <DetailRow label="حالة الخدمة" value={selectedPayment.status} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="font-medium text-[var(--teal-800)]">{value}</span>
    </div>
  );
}
