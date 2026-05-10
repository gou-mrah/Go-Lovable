import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import {
  DollarSign, TrendingUp, TrendingDown, ShoppingCart, Users, Building2, Award
} from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

const today = new Date().toISOString().split("T")[0];
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

export default function SalesReportsAdmin() {
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);

  const { data: stats } = trpc.salesOrders.stats.useQuery({ dateFrom, dateTo });
  const { data: marketerStats = [] } = trpc.salesOrders.marketerStats.useQuery({ dateFrom, dateTo });
  const { data: supplierStats = [] } = trpc.salesOrders.supplierStats.useQuery({ dateFrom, dateTo });

  const totalOrders = stats?.totalOrders ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalProfit = stats?.totalProfit ?? 0;
  const totalCommissions = stats?.totalCommissions ?? 0;
  const remaining = stats?.remaining ?? 0;

  // Chart data
  const marketerChartData = marketerStats.slice(0, 8).map(m => ({
    name: m.name.length > 12 ? m.name.slice(0, 12) + "…" : m.name,
    مبيعات: m.totalSales,
    عمولة: m.totalCommission,
  }));

  const commissionPieData = marketerStats
    .filter(m => m.totalCommission > 0)
    .slice(0, 6)
    .map(m => ({ name: m.name, value: m.totalCommission }));

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">التقارير المالية</h2>
          <p className="text-muted-foreground text-sm mt-1">تحليل الإيرادات والأرباح وأداء المسوقين</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <Label className="text-xs">من</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36" dir="ltr" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">إلى</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36" dir="ltr" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "إجمالي الطلبات", value: totalOrders, icon: ShoppingCart, color: "text-blue-600", format: false },
          { label: "إجمالي المبيعات", value: totalRevenue, icon: DollarSign, color: "text-green-600", format: true },
          { label: "صافي الأرباح", value: totalProfit, icon: TrendingUp, color: "text-purple-600", format: true },
          { label: "إجمالي العمولات", value: totalCommissions, icon: TrendingDown, color: "text-orange-500", format: true },
          { label: "المبالغ المتبقية", value: remaining, icon: Award, color: "text-red-500", format: true },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <s.icon className={`w-7 h-7 ${s.color} shrink-0`} />
                <div className="min-w-0">
                  <div className="text-xl font-bold truncate">
                    {s.format ? s.value.toLocaleString() : s.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="marketers">
        <TabsList>
          <TabsTrigger value="marketers" className="gap-2"><Users className="w-4 h-4" />المسوقون</TabsTrigger>
          <TabsTrigger value="suppliers" className="gap-2"><Building2 className="w-4 h-4" />الموردون</TabsTrigger>
        </TabsList>

        {/* Marketers Tab */}
        <TabsContent value="marketers" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">المبيعات والعمولات لكل مسوق</CardTitle>
              </CardHeader>
              <CardContent>
                {marketerChartData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={marketerChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => v.toLocaleString()} />
                      <Legend />
                      <Bar dataKey="مبيعات" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="عمولة" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">توزيع العمولات</CardTitle>
              </CardHeader>
              <CardContent>
                {commissionPieData.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={commissionPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {commissionPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => v.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Marketers Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">أداء المسوقين التفصيلي</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {marketerStats.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">لا توجد بيانات في هذه الفترة</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr>
                        <th className="text-right p-3 font-medium">#</th>
                        <th className="text-right p-3 font-medium">الكود</th>
                        <th className="text-right p-3 font-medium">الاسم</th>
                        <th className="text-right p-3 font-medium">عدد الطلبات</th>
                        <th className="text-right p-3 font-medium">إجمالي المبيعات</th>
                        <th className="text-right p-3 font-medium">إجمالي العمولة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketerStats.map((m, i) => (
                        <tr key={m.id} className="border-b hover:bg-muted/20">
                          <td className="p-3 text-muted-foreground">{i + 1}</td>
                          <td className="p-3"><Badge variant="outline" className="font-mono text-xs">{m.code}</Badge></td>
                          <td className="p-3 font-medium">{m.name}</td>
                          <td className="p-3">{m.totalOrders}</td>
                          <td className="p-3 font-semibold text-green-600">{m.totalSales.toLocaleString()}</td>
                          <td className="p-3 font-semibold text-orange-500">{m.totalCommission.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">أداء الموردين</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {supplierStats.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">لا توجد بيانات في هذه الفترة</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/30">
                      <tr>
                        <th className="text-right p-3 font-medium">#</th>
                        <th className="text-right p-3 font-medium">الكود</th>
                        <th className="text-right p-3 font-medium">الاسم</th>
                        <th className="text-right p-3 font-medium">النوع</th>
                        <th className="text-right p-3 font-medium">الخدمات</th>
                        <th className="text-right p-3 font-medium">عدد الطلبات</th>
                        <th className="text-right p-3 font-medium">إجمالي التكلفة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierStats.map((s, i) => (
                        <tr key={s.id} className="border-b hover:bg-muted/20">
                          <td className="p-3 text-muted-foreground">{i + 1}</td>
                          <td className="p-3"><Badge variant="outline" className="font-mono text-xs">{s.code}</Badge></td>
                          <td className="p-3 font-medium">{s.name}</td>
                          <td className="p-3">
                            <Badge variant={s.type === "company" ? "default" : "secondary"} className="text-xs">
                              {s.type === "company" ? "شركة" : "فرد"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {(s.services as string[] ?? []).slice(0, 3).map(svc => (
                                <Badge key={svc} variant="outline" className="text-xs">{svc}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">{s.totalOrders}</td>
                          <td className="p-3 font-semibold">{s.totalCost.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
