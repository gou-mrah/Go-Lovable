/**
 * Four Complete Hajj Domestic Packages
 * Economy, Standard, Premium, and Luxury
 */

export interface HajjPackageData {
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

export const HAJJ_PACKAGES: HajjPackageData[] = [
  {
    packageName: 'باقة الحج الاقتصادية',
    packageLevel: 'economy',
    packageNumber: 'PKG-ECON-001',
    description: 'باقة اقتصادية موفرة للحجاج الذين يبحثون عن تجربة حج بسيطة وميسورة التكلفة مع الخدمات الأساسية',
    arafatAccommodation: 'tent',
    muzdalifaAccommodation: 'tent',
    minaAccommodation: 'tent',
    accommodationNotes: 'خيام معيارية مع تكييف هواء، سعة 4-6 أشخاص لكل خيمة، مرافق صحية مشتركة',
    meals: 'breakfast-lunch',
    transportation: ['airport-transfer', 'internal-transport', 'bus'],
    guide: true,
    guideLanguages: ['ar', 'en'],
    additionalServices: 'توزيع ماء زمزم، مصحف ملون، شنطة الحاج، تأمين صحي أساسي',
    priceFromSAR: 3500,
    priceToSAR: 4500,
    discountPercentage: 0,
    duration: 5,
    seatsTotal: 100,
    seatsAvailable: 45,
    isFeatured: false,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1591684612531-b34b7be5cf38?w=500',
  },
  {
    packageName: 'باقة الحج المتوسطة',
    packageLevel: 'standard',
    packageNumber: 'PKG-STD-002',
    description: 'باقة متوسطة توفر توازناً بين الراحة والسعر، مع خدمات محسّنة وسكن أفضل',
    arafatAccommodation: 'hotel',
    muzdalifaAccommodation: 'hotel',
    minaAccommodation: 'villa',
    accommodationNotes: 'فنادق 3 نجوم في عرفة والمزدلفة، فيلات مشتركة في منى، سعة 2-3 أشخاص لكل غرفة، مرافق صحية خاصة',
    meals: 'all',
    transportation: ['airport-transfer', 'internal-transport', 'bus', 'car'],
    guide: true,
    guideLanguages: ['ar', 'en', 'ur', 'id'],
    additionalServices: 'وجبات خفيفة يومية، قنوات فضائية في الغرفة، خدمة الغسيل، مصحف ملون، شنطة حاج فاخرة، تأمين صحي شامل',
    priceFromSAR: 6500,
    priceToSAR: 8500,
    discountPercentage: 5,
    duration: 5,
    seatsTotal: 80,
    seatsAvailable: 32,
    isFeatured: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
  },
  {
    packageName: 'باقة الحج الفاخرة',
    packageLevel: 'premium',
    packageNumber: 'PKG-PREM-003',
    description: 'باقة فاخرة توفر راحة عالية وخدمات متميزة مع سكن فندقي 4 نجوم وخدمات شاملة',
    arafatAccommodation: 'hotel',
    muzdalifaAccommodation: 'hotel',
    minaAccommodation: 'tower',
    accommodationNotes: 'فنادق 4 نجوم بمرافق كاملة في عرفة والمزدلفة، أبراج حديثة في منى، سعة 1-2 شخص لكل غرفة، مرافق صحية خاصة فاخرة',
    meals: 'all',
    transportation: ['airport-transfer', 'internal-transport', 'car', 'train'],
    guide: true,
    guideLanguages: ['ar', 'en', 'ur', 'tr', 'id'],
    additionalServices: 'وجبات خفيفة فاخرة طوال اليوم، خدمة غرفة 24 ساعة، مرشد متخصص، قنوات فضائية وإنترنت عالي السرعة، شنطة حاج فاخرة جداً، تأمين صحي شامل مع تغطية طبية كاملة، خدمة نقل VIP',
    priceFromSAR: 12000,
    priceToSAR: 15000,
    discountPercentage: 8,
    duration: 5,
    seatsTotal: 50,
    seatsAvailable: 18,
    isFeatured: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=500',
  },
  {
    packageName: 'باقة الحج الفاخرة جداً',
    packageLevel: 'luxury',
    packageNumber: 'PKG-LUX-004',
    description: 'باقة فاخرة جداً توفر أعلى مستويات الراحة والخدمات الشاملة مع سكن فندقي 5 نجوم وخدمات حصرية',
    arafatAccommodation: 'hotel',
    muzdalifaAccommodation: 'hotel',
    minaAccommodation: 'tower',
    accommodationNotes: 'فنادق 5 نجوم فاخرة جداً بمرافق عالمية في عرفة والمزدلفة، أبراج فاخرة جداً في منى، سعة 1 شخص لكل غرفة أو أجنحة، مرافق صحية خاصة فاخرة جداً',
    meals: 'all',
    transportation: ['airport-transfer', 'internal-transport', 'car', 'train'],
    guide: true,
    guideLanguages: ['ar', 'en', 'ur', 'tr', 'id'],
    additionalServices: 'وجبات فاخرة جداً من طهاة عالميين، خدمة كونسيرج 24 ساعة، مرشد متخصص حاصل على شهادات عالمية، قنوات فضائية وإنترنت فائق السرعة، شنطة حاج من الجلد الفاخر، تأمين صحي شامل مع تغطية طبية كاملة وعلاج في الخارج، خدمة نقل VIP مع سائق خاص، حمام بخار وساونا، مكتب عمل في الغرفة',
    priceFromSAR: 22000,
    priceToSAR: 28000,
    discountPercentage: 10,
    duration: 5,
    seatsTotal: 30,
    seatsAvailable: 8,
    isFeatured: true,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1631049307038-da0ec9d70304?w=500',
  },
];

/**
 * Helper function to get package by level
 */
export function getPackageByLevel(level: 'economy' | 'standard' | 'premium' | 'luxury'): HajjPackageData | undefined {
  return HAJJ_PACKAGES.find((pkg) => pkg.packageLevel === level);
}

/**
 * Helper function to get all available packages
 */
export function getAvailablePackages(): HajjPackageData[] {
  return HAJJ_PACKAGES.filter((pkg) => pkg.isAvailable);
}

/**
 * Helper function to get featured packages
 */
export function getFeaturedPackages(): HajjPackageData[] {
  return HAJJ_PACKAGES.filter((pkg) => pkg.isFeatured && pkg.isAvailable);
}

/**
 * Helper function to calculate total price with discount
 */
export function calculatePackagePrice(priceFromSAR: number, discountPercentage: number): number {
  return Math.round(priceFromSAR * (1 - discountPercentage / 100));
}
