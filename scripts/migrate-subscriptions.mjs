import mysql from "mysql2/promise";
import { config } from "dotenv";
config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Create tables
await conn.execute(`CREATE TABLE IF NOT EXISTS subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  nameAr VARCHAR(100) NOT NULL,
  nameEn VARCHAR(100) NOT NULL,
  descriptionAr TEXT,
  descriptionEn TEXT,
  monthlyPriceSAR DECIMAL(10,2) NOT NULL DEFAULT 0,
  annualPriceSAR DECIMAL(10,2) NOT NULL DEFAULT 0,
  trialDays INT NOT NULL DEFAULT 0,
  maxPrograms INT NOT NULL DEFAULT 3,
  featuresAr JSON,
  featuresEn JSON,
  isFeaturedInListings BOOLEAN NOT NULL DEFAULT FALSE,
  sortOrder INT NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
)`);
console.log("✅ subscription_plans created");

await conn.execute(`CREATE TABLE IF NOT EXISTS plan_addons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  nameAr VARCHAR(100) NOT NULL,
  nameEn VARCHAR(100) NOT NULL,
  descriptionAr TEXT,
  descriptionEn TEXT,
  monthlyPriceSAR DECIMAL(10,2) NOT NULL,
  maxSlots INT NOT NULL DEFAULT 5,
  totalPlatformSlots INT NOT NULL DEFAULT 10,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
)`);
console.log("✅ plan_addons created");

await conn.execute(`CREATE TABLE IF NOT EXISTS provider_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  providerId INT NOT NULL,
  planId INT NOT NULL,
  billingCycle ENUM('trial','monthly','annual') NOT NULL DEFAULT 'trial',
  status ENUM('active','expired','cancelled','pending_payment') NOT NULL DEFAULT 'active',
  startDate TIMESTAMP NOT NULL DEFAULT NOW(),
  endDate TIMESTAMP NOT NULL,
  hasFeaturedListings BOOLEAN NOT NULL DEFAULT FALSE,
  featuredListingsExpiry TIMESTAMP NULL,
  hasHeroAds BOOLEAN NOT NULL DEFAULT FALSE,
  heroAdsExpiry TIMESTAMP NULL,
  upgradeRequestedPlanId INT NULL,
  upgradeRequestedAt TIMESTAMP NULL,
  upgradeRequestedAddons JSON,
  adminNotes TEXT,
  activatedBy INT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
)`);
console.log("✅ provider_subscriptions created");

// Seed default plans
const plans = [
  {
    slug: "free_trial",
    nameAr: "تجربة مجانية",
    nameEn: "Free Trial",
    descriptionAr: "جرب المنصة مجاناً لمدة 14 يوماً",
    descriptionEn: "Try the platform free for 14 days",
    monthlyPriceSAR: 0,
    annualPriceSAR: 0,
    trialDays: 14,
    maxPrograms: 3,
    featuresAr: JSON.stringify(["3 برامج كحد أقصى", "دعم أساسي", "ظهور في القوائم العامة"]),
    featuresEn: JSON.stringify(["Up to 3 programs", "Basic support", "Appear in public listings"]),
    isFeaturedInListings: false,
    sortOrder: 1,
  },
  {
    slug: "premium_basic",
    nameAr: "بريميوم أساسي",
    nameEn: "Premium Basic",
    descriptionAr: "باقة مثالية للشركات الصغيرة",
    descriptionEn: "Perfect for small companies",
    monthlyPriceSAR: 299,
    annualPriceSAR: 2990,
    trialDays: 0,
    maxPrograms: 10,
    featuresAr: JSON.stringify(["10 برامج كحد أقصى", "دعم متقدم", "شارة موثوق", "إحصائيات تفصيلية"]),
    featuresEn: JSON.stringify(["Up to 10 programs", "Advanced support", "Verified badge", "Detailed analytics"]),
    isFeaturedInListings: false,
    sortOrder: 2,
  },
  {
    slug: "premium_plus",
    nameAr: "بريميوم بلس",
    nameEn: "Premium Plus",
    descriptionAr: "الباقة الأشمل للشركات الكبرى",
    descriptionEn: "The most comprehensive plan for large companies",
    monthlyPriceSAR: 599,
    annualPriceSAR: 5990,
    trialDays: 0,
    maxPrograms: -1,
    featuresAr: JSON.stringify(["برامج غير محدودة", "دعم VIP", "ظهور مميز في القوائم", "إعلانات Hero", "أولوية في نتائج البحث"]),
    featuresEn: JSON.stringify(["Unlimited programs", "VIP support", "Featured in listings", "Hero ads", "Priority in search results"]),
    isFeaturedInListings: true,
    sortOrder: 3,
  },
];

for (const p of plans) {
  await conn.execute(
    `INSERT IGNORE INTO subscription_plans (slug, nameAr, nameEn, descriptionAr, descriptionEn, monthlyPriceSAR, annualPriceSAR, trialDays, maxPrograms, featuresAr, featuresEn, isFeaturedInListings, sortOrder) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [p.slug, p.nameAr, p.nameEn, p.descriptionAr, p.descriptionEn, String(p.monthlyPriceSAR), String(p.annualPriceSAR), p.trialDays, p.maxPrograms, p.featuresAr, p.featuresEn, p.isFeaturedInListings ? 1 : 0, p.sortOrder]
  );
}
console.log("✅ Seeded 3 subscription plans");

const addons = [
  {
    slug: "featured_listings",
    nameAr: "إدراج مميز",
    nameEn: "Featured Listings",
    descriptionAr: "ظهور برامجك في قسم البرامج المميزة",
    descriptionEn: "Your programs appear in the featured section",
    monthlyPriceSAR: 199,
    maxSlots: 5,
    totalPlatformSlots: 20,
  },
  {
    slug: "hero_ads",
    nameAr: "إعلانات Hero",
    nameEn: "Hero Ads",
    descriptionAr: "ظهور برامجك في أعلى الصفحة الرئيسية",
    descriptionEn: "Your programs appear at the top of the homepage",
    monthlyPriceSAR: 499,
    maxSlots: 2,
    totalPlatformSlots: 5,
  },
];

for (const a of addons) {
  await conn.execute(
    `INSERT IGNORE INTO plan_addons (slug, nameAr, nameEn, descriptionAr, descriptionEn, monthlyPriceSAR, maxSlots, totalPlatformSlots) VALUES (?,?,?,?,?,?,?,?)`,
    [a.slug, a.nameAr, a.nameEn, a.descriptionAr, a.descriptionEn, a.monthlyPriceSAR, a.maxSlots, a.totalPlatformSlots]
  );
}
console.log("✅ Seeded 2 plan addons");

await conn.end();
console.log("✅ Migration complete");
