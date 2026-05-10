import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "@/contexts/CurrencyContext";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  refunded: "bg-purple-100 text-purple-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "معلّق",
  confirmed: "مؤكد",
  cancelled: "ملغي",
  completed: "مكتمل",
  refunded: "مسترد",
};

interface Props {
  serviceType: string; // "hajj" | "umrah" | "hotel" | "flight" | "visa" | "transport" | "tour"
  title: string;
}

export default function SectionBookingsTab({ serviceType, title }: Props) {
  const utils = trpc.useUtils();
  const { format } = useCurrency();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: bookings = [], isLoading, refetch } = trpc.bookings.listAll.useQuery({
    serviceType,
    limit: 100,
  });

  const updateStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      utils.bookings.listAll.invalidate();
      toast.success("تم تحديث حالة الحجز");
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = (bookings as any[]).filter((b: any) => {
    const matchSearch = !search || 
      b.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      b.customerEmail?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--teal-800)]" style={{ fontFamily: "'Tajawal', sans-serif" }}>
          طلبات {title}
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filtered.length} طلب</Badge>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1">
            <RefreshCw className="w-3 h-3" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="بحث بالاسم أو رقم الحجز..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">معلّق</SelectItem>
            <SelectItem value="confirmed">مؤكد</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
            <SelectItem value="refunded">مسترد</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--teal-500)]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)] bg-white rounded-xl border border-[var(--border)]">
          لا توجد طلبات {search || statusFilter !== "all" ? "تطابق البحث" : "حتى الآن"}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--teal-50)] border-b border-[var(--border)]">
                  {["رقم الحجز", "العميل", "الاتصال", "الإجمالي", "الحالة", "التاريخ", "تحديث الحالة"].map(h => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-[var(--teal-700)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b: any, i: number) => (
                  <tr key={b.id} className={`border-b border-[var(--border)] hover:bg-[var(--teal-50)]/30 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--teal-700)]">{b.bookingReference || `#${b.id}`}</td>
                    <td className="px-4 py-3 font-medium">{b.customerName || "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                      {b.customerEmail && <div>{b.customerEmail}</div>}
                      {b.customerPhone && <div>{b.customerPhone}</div>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--teal-700)]">
                      {b.totalUSD ? format(Number(b.totalUSD)) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${STATUS_COLORS[b.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[b.status] || b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString("ar-SA") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={b.status}
                        onValueChange={(v) => updateStatusMutation.mutate({ id: b.id, status: v as any })}
                      >
                        <SelectTrigger className="h-7 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">معلّق</SelectItem>
                          <SelectItem value="confirmed">مؤكد</SelectItem>
                          <SelectItem value="completed">مكتمل</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                          <SelectItem value="refunded">مسترد</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
