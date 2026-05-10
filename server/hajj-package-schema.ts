/**
 * Dynamic Hajj Package Field Schema System
 * Allows flexible field definitions for different package types
 */

export type PackageFieldType = 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'date' | 'currency';

export interface PackageField {
  id: string;
  label: string;
  labelAr: string;
  type: PackageFieldType;
  required: boolean;
  placeholder?: string;
  placeholderAr?: string;
  description?: string;
  descriptionAr?: string;
  options?: Array<{ value: string; label: string; labelAr: string }>;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  category?: 'basic' | 'accommodation' | 'services' | 'pricing' | 'details';
}

export interface PackageSchema {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  fields: PackageField[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Predefined schemas for different Hajj package types
 */
export const HAJJ_PACKAGE_SCHEMAS = {
  DOMESTIC: {
    id: 'domestic-hajj',
    name: 'Domestic Hajj Package',
    nameAr: 'باقة الحج الداخلية',
    description: 'Schema for domestic hajj packages',
    descriptionAr: 'مخطط باقات الحج الداخلية',
    fields: [
      // Basic Information
      {
        id: 'packageName',
        label: 'Package Name',
        labelAr: 'اسم الباقة',
        type: 'text' as const,
        required: true,
        placeholder: 'e.g., Economy Hajj Package',
        placeholderAr: 'مثال: باقة الحج الاقتصادية',
        category: 'basic' as const,
      },
      {
        id: 'packageLevel',
        label: 'Package Level',
        labelAr: 'مستوى الباقة',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'economy', label: 'Economy', labelAr: 'اقتصادية' },
          { value: 'standard', label: 'Standard', labelAr: 'متوسطة' },
          { value: 'premium', label: 'Premium', labelAr: 'فاخرة' },
          { value: 'luxury', label: 'Luxury', labelAr: 'فاخرة جداً' },
        ],
        category: 'basic' as const,
      },
      {
        id: 'packageNumber',
        label: 'Package Number',
        labelAr: 'رقم الباقة',
        type: 'text' as const,
        required: false,
        placeholder: 'PKG-001',
        placeholderAr: 'PKG-001',
        category: 'basic' as const,
      },
      {
        id: 'description',
        label: 'Description',
        labelAr: 'الوصف',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Detailed description of the package',
        placeholderAr: 'وصف تفصيلي للباقة',
        category: 'basic' as const,
      },

      // Accommodation
      {
        id: 'arafatAccommodation',
        label: 'Arafat Accommodation',
        labelAr: 'سكن عرفة',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'tent', label: 'Tent', labelAr: 'خيمة' },
          { value: 'hotel', label: 'Hotel', labelAr: 'فندق' },
          { value: 'villa', label: 'Villa', labelAr: 'فيلا' },
          { value: 'apartment', label: 'Apartment', labelAr: 'شقة' },
        ],
        category: 'accommodation' as const,
      },
      {
        id: 'muzdalifaAccommodation',
        label: 'Muzdalifa Accommodation',
        labelAr: 'سكن مزدلفة',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'tent', label: 'Tent', labelAr: 'خيمة' },
          { value: 'hotel', label: 'Hotel', labelAr: 'فندق' },
          { value: 'villa', label: 'Villa', labelAr: 'فيلا' },
          { value: 'apartment', label: 'Apartment', labelAr: 'شقة' },
        ],
        category: 'accommodation' as const,
      },
      {
        id: 'minaAccommodation',
        label: 'Mina Accommodation',
        labelAr: 'سكن منى',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'tent', label: 'Tent', labelAr: 'خيمة' },
          { value: 'hotel', label: 'Hotel', labelAr: 'فندق' },
          { value: 'villa', label: 'Villa', labelAr: 'فيلا' },
          { value: 'apartment', label: 'Apartment', labelAr: 'شقة' },
          { value: 'tower', label: 'Tower', labelAr: 'برج' },
        ],
        category: 'accommodation' as const,
      },
      {
        id: 'accommodationNotes',
        label: 'Accommodation Notes',
        labelAr: 'ملاحظات السكن',
        type: 'textarea' as const,
        required: false,
        placeholder: 'Additional accommodation details',
        placeholderAr: 'تفاصيل إضافية عن السكن',
        category: 'accommodation' as const,
      },

      // Services
      {
        id: 'meals',
        label: 'Meals Included',
        labelAr: 'الوجبات المشمولة',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'breakfast', label: 'Breakfast Only', labelAr: 'الإفطار فقط' },
          { value: 'breakfast-lunch', label: 'Breakfast & Lunch', labelAr: 'الإفطار والغداء' },
          { value: 'all', label: 'All Meals', labelAr: 'جميع الوجبات' },
          { value: 'none', label: 'No Meals', labelAr: 'بدون وجبات' },
        ],
        category: 'services' as const,
      },
      {
        id: 'transportation',
        label: 'Transportation',
        labelAr: 'المواصلات',
        type: 'multiselect' as const,
        required: true,
        options: [
          { value: 'airport-transfer', label: 'Airport Transfer', labelAr: 'نقل المطار' },
          { value: 'internal-transport', label: 'Internal Transport', labelAr: 'النقل الداخلي' },
          { value: 'bus', label: 'Bus', labelAr: 'حافلة' },
          { value: 'car', label: 'Car', labelAr: 'سيارة' },
          { value: 'train', label: 'Train', labelAr: 'قطار' },
        ],
        category: 'services' as const,
      },
      {
        id: 'guide',
        label: 'Guide Included',
        labelAr: 'المرشد مشمول',
        type: 'boolean' as const,
        required: true,
        defaultValue: true,
        category: 'services' as const,
      },
      {
        id: 'guideLanguages',
        label: 'Guide Languages',
        labelAr: 'لغات المرشد',
        type: 'multiselect' as const,
        required: false,
        options: [
          { value: 'ar', label: 'Arabic', labelAr: 'العربية' },
          { value: 'en', label: 'English', labelAr: 'الإنجليزية' },
          { value: 'ur', label: 'Urdu', labelAr: 'الأردية' },
          { value: 'tr', label: 'Turkish', labelAr: 'التركية' },
          { value: 'id', label: 'Indonesian', labelAr: 'الإندونيسية' },
        ],
        category: 'services' as const,
      },
      {
        id: 'additionalServices',
        label: 'Additional Services',
        labelAr: 'خدمات إضافية',
        type: 'textarea' as const,
        required: false,
        placeholder: 'List additional services included',
        placeholderAr: 'قائمة بالخدمات الإضافية المشمولة',
        category: 'services' as const,
      },

      // Pricing
      {
        id: 'priceFromSAR',
        label: 'Price From (SAR)',
        labelAr: 'السعر من (ريال)',
        type: 'currency' as const,
        required: true,
        min: 0,
        step: 100,
        category: 'pricing' as const,
      },
      {
        id: 'priceToSAR',
        label: 'Price To (SAR)',
        labelAr: 'السعر إلى (ريال)',
        type: 'currency' as const,
        required: false,
        min: 0,
        step: 100,
        category: 'pricing' as const,
      },
      {
        id: 'discountPercentage',
        label: 'Discount (%)',
        labelAr: 'الخصم (%)',
        type: 'number' as const,
        required: false,
        min: 0,
        max: 100,
        step: 1,
        category: 'pricing' as const,
      },

      // Details
      {
        id: 'duration',
        label: 'Duration (Days)',
        labelAr: 'المدة (أيام)',
        type: 'number' as const,
        required: true,
        min: 1,
        max: 30,
        step: 1,
        category: 'details' as const,
      },
      {
        id: 'seatsTotal',
        label: 'Total Seats',
        labelAr: 'إجمالي المقاعد',
        type: 'number' as const,
        required: true,
        min: 1,
        step: 1,
        category: 'details' as const,
      },
      {
        id: 'seatsAvailable',
        label: 'Available Seats',
        labelAr: 'المقاعد المتاحة',
        type: 'number' as const,
        required: true,
        min: 0,
        step: 1,
        category: 'details' as const,
      },
      {
        id: 'isFeatured',
        label: 'Featured Package',
        labelAr: 'باقة مميزة',
        type: 'boolean' as const,
        required: false,
        defaultValue: false,
        category: 'details' as const,
      },
      {
        id: 'isAvailable',
        label: 'Available',
        labelAr: 'متاحة',
        type: 'boolean' as const,
        required: true,
        defaultValue: true,
        category: 'details' as const,
      },
      {
        id: 'imageUrl',
        label: 'Package Image',
        labelAr: 'صورة الباقة',
        type: 'text' as const,
        required: false,
        placeholder: 'Image URL',
        placeholderAr: 'رابط الصورة',
        category: 'details' as const,
      },
    ],
  },
};

/**
 * Get schema fields grouped by category
 */
export function getFieldsByCategory(schema: PackageSchema) {
  const grouped: Record<string, PackageField[]> = {};
  schema.fields.forEach((field) => {
    const category = field.category || 'details';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(field);
  });
  return grouped;
}

/**
 * Validate package data against schema
 */
export function validatePackageData(data: Record<string, any>, schema: PackageSchema): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  schema.fields.forEach((field) => {
    const value = data[field.id];

    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field.labelAr} مطلوب`);
    }

    if (value !== undefined && value !== null) {
      if (field.type === 'number' || field.type === 'currency') {
        if (typeof value !== 'number') {
          errors.push(`${field.labelAr} يجب أن يكون رقماً`);
        }
        if (field.min !== undefined && value < field.min) {
          errors.push(`${field.labelAr} يجب أن يكون على الأقل ${field.min}`);
        }
        if (field.max !== undefined && value > field.max) {
          errors.push(`${field.labelAr} يجب ألا يتجاوز ${field.max}`);
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
