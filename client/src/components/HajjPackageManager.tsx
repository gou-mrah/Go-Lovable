import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface PackageFormData {
  packageName: string;
  packageLevel: 'economy' | 'standard' | 'premium' | 'luxury';
  packageNumber: string;
  description: string;
  arafatAccommodation: string;
  muzdalifaAccommodation: string;
  minaAccommodation: string;
  accommodationNotes: string;
  meals: string;
  transportation: string[];
  guide: boolean;
  guideLanguages: string[];
  additionalServices: string;
  priceFromSAR: number;
  priceToSAR: number;
  discountPercentage: number;
  duration: number;
  seatsTotal: number;
  seatsAvailable: number;
  isFeatured: boolean;
  isAvailable: boolean;
  imageUrl?: string;
}

const PACKAGE_LEVELS = [
  { value: 'economy', label: 'اقتصادية', color: 'bg-blue-100 text-blue-800' },
  { value: 'standard', label: 'متوسطة', color: 'bg-green-100 text-green-800' },
  { value: 'premium', label: 'فاخرة', color: 'bg-purple-100 text-purple-800' },
  { value: 'luxury', label: 'فاخرة جداً', color: 'bg-yellow-100 text-yellow-800' },
];

const ACCOMMODATION_OPTIONS = [
  { value: 'tent', label: 'خيمة' },
  { value: 'hotel', label: 'فندق' },
  { value: 'villa', label: 'فيلا' },
  { value: 'apartment', label: 'شقة' },
  { value: 'tower', label: 'برج' },
];

const MEALS_OPTIONS = [
  { value: 'breakfast', label: 'الإفطار فقط' },
  { value: 'breakfast-lunch', label: 'الإفطار والغداء' },
  { value: 'all', label: 'جميع الوجبات' },
  { value: 'none', label: 'بدون وجبات' },
];

const TRANSPORTATION_OPTIONS = [
  { value: 'airport-transfer', label: 'نقل المطار' },
  { value: 'internal-transport', label: 'النقل الداخلي' },
  { value: 'bus', label: 'حافلة' },
  { value: 'car', label: 'سيارة' },
  { value: 'train', label: 'قطار' },
];

const GUIDE_LANGUAGES = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'الإنجليزية' },
  { value: 'ur', label: 'الأردية' },
  { value: 'tr', label: 'التركية' },
  { value: 'id', label: 'الإندونيسية' },
];

export function HajjPackageManager() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<PackageFormData>({
    packageName: '',
    packageLevel: 'economy',
    packageNumber: '',
    description: '',
    arafatAccommodation: 'tent',
    muzdalifaAccommodation: 'tent',
    minaAccommodation: 'tent',
    accommodationNotes: '',
    meals: 'breakfast-lunch',
    transportation: [],
    guide: true,
    guideLanguages: [],
    additionalServices: '',
    priceFromSAR: 0,
    priceToSAR: 0,
    discountPercentage: 0,
    duration: 5,
    seatsTotal: 50,
    seatsAvailable: 50,
    isFeatured: false,
    isAvailable: true,
    imageUrl: '',
  });

  const resetForm = () => {
    setFormData({
      packageName: '',
      packageLevel: 'economy',
      packageNumber: '',
      description: '',
      arafatAccommodation: 'tent',
      muzdalifaAccommodation: 'tent',
      minaAccommodation: 'tent',
      accommodationNotes: '',
      meals: 'breakfast-lunch',
      transportation: [],
      guide: true,
      guideLanguages: [],
      additionalServices: '',
      priceFromSAR: 0,
      priceToSAR: 0,
      discountPercentage: 0,
      duration: 5,
      seatsTotal: 50,
      seatsAvailable: 50,
      isFeatured: false,
      isAvailable: true,
      imageUrl: '',
    });
    setEditingId(null);
  };

  const toggleTransportation = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      transportation: prev.transportation.includes(value)
        ? prev.transportation.filter((t) => t !== value)
        : [...prev.transportation, value],
    }));
  };

  const toggleGuideLanguage = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      guideLanguages: prev.guideLanguages.includes(value)
        ? prev.guideLanguages.filter((l) => l !== value)
        : [...prev.guideLanguages, value],
    }));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة باقات الحج الداخلي</h2>
          <p className="text-gray-600 mt-1">إضافة وتعديل وحذف باقات الحج الداخلية</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة باقة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل الباقة' : 'إضافة باقة جديدة'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم الباقة *</Label>
                    <Input
                      value={formData.packageName}
                      onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                      placeholder="مثال: باقة الحج الاقتصادية"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label>مستوى الباقة *</Label>
                    <Select value={formData.packageLevel} onValueChange={(v) => setFormData({ ...formData, packageLevel: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PACKAGE_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>رقم الباقة</Label>
                    <Input
                      value={formData.packageNumber}
                      onChange={(e) => setFormData({ ...formData, packageNumber: e.target.value })}
                      placeholder="PKG-001"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label>المدة (أيام)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      min="1"
                      max="30"
                    />
                  </div>
                </div>
                <div>
                  <Label>الوصف</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف تفصيلي للباقة"
                    dir="rtl"
                    rows={3}
                  />
                </div>
              </div>

              {/* Accommodation */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">السكن</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>سكن عرفة *</Label>
                    <Select value={formData.arafatAccommodation} onValueChange={(v) => setFormData({ ...formData, arafatAccommodation: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOMMODATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>سكن مزدلفة *</Label>
                    <Select value={formData.muzdalifaAccommodation} onValueChange={(v) => setFormData({ ...formData, muzdalifaAccommodation: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOMMODATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>سكن منى *</Label>
                    <Select value={formData.minaAccommodation} onValueChange={(v) => setFormData({ ...formData, minaAccommodation: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOMMODATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>ملاحظات السكن</Label>
                  <Textarea
                    value={formData.accommodationNotes}
                    onChange={(e) => setFormData({ ...formData, accommodationNotes: e.target.value })}
                    placeholder="تفاصيل إضافية عن السكن"
                    dir="rtl"
                    rows={2}
                  />
                </div>
              </div>

              {/* Services */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">الخدمات</h3>
                <div>
                  <Label>الوجبات *</Label>
                  <Select value={formData.meals} onValueChange={(v) => setFormData({ ...formData, meals: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEALS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>المواصلات</Label>
                  <div className="space-y-2 mt-2">
                    {TRANSPORTATION_OPTIONS.map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={formData.transportation.includes(opt.value)}
                          onCheckedChange={() => toggleTransportation(opt.value)}
                        />
                        <label>{opt.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.guide} onCheckedChange={(v) => setFormData({ ...formData, guide: v as boolean })} />
                  <Label>مرشد متضمن</Label>
                </div>
                {formData.guide && (
                  <div>
                    <Label>لغات المرشد</Label>
                    <div className="space-y-2 mt-2">
                      {GUIDE_LANGUAGES.map((lang) => (
                        <div key={lang.value} className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.guideLanguages.includes(lang.value)}
                            onCheckedChange={() => toggleGuideLanguage(lang.value)}
                          />
                          <label>{lang.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label>خدمات إضافية</Label>
                  <Textarea
                    value={formData.additionalServices}
                    onChange={(e) => setFormData({ ...formData, additionalServices: e.target.value })}
                    placeholder="قائمة بالخدمات الإضافية المشمولة"
                    dir="rtl"
                    rows={2}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">التسعير</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>السعر من (ريال) *</Label>
                    <Input
                      type="number"
                      value={formData.priceFromSAR}
                      onChange={(e) => setFormData({ ...formData, priceFromSAR: parseFloat(e.target.value) })}
                      min="0"
                      step="100"
                    />
                  </div>
                  <div>
                    <Label>السعر إلى (ريال)</Label>
                    <Input
                      type="number"
                      value={formData.priceToSAR}
                      onChange={(e) => setFormData({ ...formData, priceToSAR: parseFloat(e.target.value) })}
                      min="0"
                      step="100"
                    />
                  </div>
                  <div>
                    <Label>الخصم (%)</Label>
                    <Input
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) })}
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div className="space-y-4 border-b pb-4">
                <h3 className="font-semibold text-lg">المخزون</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>إجمالي المقاعد *</Label>
                    <Input
                      type="number"
                      value={formData.seatsTotal}
                      onChange={(e) => setFormData({ ...formData, seatsTotal: parseInt(e.target.value) })}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label>المقاعد المتاحة *</Label>
                    <Input
                      type="number"
                      value={formData.seatsAvailable}
                      onChange={(e) => setFormData({ ...formData, seatsAvailable: parseInt(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">الحالة</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.isAvailable}
                      onCheckedChange={(v) => setFormData({ ...formData, isAvailable: v as boolean })}
                    />
                    <Label>متاحة</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.isFeatured}
                      onCheckedChange={(v) => setFormData({ ...formData, isFeatured: v as boolean })}
                    />
                    <Label>باقة مميزة</Label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  <Save className="w-4 h-4 ml-2" />
                  {editingId ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PACKAGE_LEVELS.map((level) => (
          <Card key={level.value} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{level.label}</CardTitle>
                  <CardDescription>باقة {level.label}</CardDescription>
                </div>
                <Badge className={level.color}>{level.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold text-green-600">3,500 - 4,500 ر.س</div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">المقاعد المتاحة:</span>
                  <span className="font-semibold mr-2">45 / 100</span>
                </div>
                <div>
                  <span className="text-gray-600">المدة:</span>
                  <span className="font-semibold mr-2">5 أيام</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingId(1);
                    setIsOpen(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" className="flex-1">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
