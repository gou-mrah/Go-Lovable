import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail, Trash2, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";

export default function WaitlistPage() {
  const [deleting, setDeleting] = useState<number | null>(null);

  const { data: list = [], isLoading, refetch } = trpc.waitlist.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const deleteMutation = trpc.waitlist.delete.useMutation({
    onSuccess: () => {
      toast.success("تم الحذف");
      refetch();
      setDeleting(null);
    },
    onError: () => {
      toast.error("فشل الحذف");
      setDeleting(null);
    },
  });

  const handleExportCSV = () => {
    if (!list.length) return;
    const rows = [
      ["الاسم", "البريد الإلكتروني", "تاريخ الاشتراك"],
      ...list.map(r => [
        r.name ?? "",
        r.email,
        new Date(r.createdAt).toLocaleString("ar-SA"),
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl">
              <Mail className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">قائمة انتظار الإطلاق</h1>
              <p className="text-muted-foreground text-sm">المشتركون في إشعار الإطلاق من صفحة الغلق</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-base px-3 py-1">
              <Users className="h-4 w-4 ml-1" />
              {list.length} مشترك
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!list.length}>
              <Download className="h-4 w-4 ml-1" />
              تصدير CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">المشتركون</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
            ) : list.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>لا يوجد مشتركون بعد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-right px-4 py-3 font-medium">#</th>
                      <th className="text-right px-4 py-3 font-medium">الاسم</th>
                      <th className="text-right px-4 py-3 font-medium">البريد الإلكتروني</th>
                      <th className="text-right px-4 py-3 font-medium">تاريخ الاشتراك</th>
                      <th className="text-right px-4 py-3 font-medium">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((row, i) => (
                      <tr key={row.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{row.name ?? <span className="text-muted-foreground italic">—</span>}</td>
                        <td className="px-4 py-3 dir-ltr text-left font-mono text-xs">{row.email}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(row.createdAt).toLocaleString("ar-SA")}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            disabled={deleting === row.id}
                            onClick={() => {
                              setDeleting(row.id);
                              deleteMutation.mutate({ id: row.id });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
