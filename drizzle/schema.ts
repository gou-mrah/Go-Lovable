import {
  bigint,
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  resetToken: varchar("resetToken", { length: 128 }),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  verificationToken: varchar("verificationToken", { length: 128 }),
  verificationTokenExpiry: timestamp("verificationTokenExpiry"),
  googleId: varchar("googleId", { length: 128 }),
  phone: varchar("phone", { length: 30 }),
  avatar: text("avatar"),
  bio: text("bio"),
  nationality: varchar("nationality", { length: 100 }),
  passportNumber: varchar("passportNumber", { length: 50 }),
  role: mysqlEnum("role", ["user", "admin", "provider", "marketer"]).default("user").notNull(),
  isBanned: boolean("isBanned").default(false).notNull(),
  banReason: text("banReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Hajj Programs ────────────────────────────────────────────────────────────
export const hajjPrograms = mysqlTable("hajj_programs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  portalType: mysqlEnum("portalType", ["internal", "external", "both"]).default("both").notNull(),
  category: varchar("category", { length: 100 }).notNull().default("standard"),
  nusukPackageType: varchar("nusukPackageType", { length: 50 }).default("standard"),
  priceSAR: decimal("priceSAR", { precision: 10, scale: 2 }),
  priceFromSAR: decimal("priceFromSAR", { precision: 10, scale: 2 }),
  priceToSAR: decimal("priceToSAR", { precision: 10, scale: 2 }),
  imageUrl: text("imageUrl"),
  galleryImages: json("galleryImages").$type<string[]>(),
  priceUSD: decimal("priceUSD", { precision: 10, scale: 2 }).notNull(),
  originalPriceUSD: decimal("originalPriceUSD", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  duration: int("duration").notNull().default(14),
  departureCity: varchar("departureCity", { length: 100 }),
  departureDate: timestamp("departureDate"),
  returnDate: timestamp("returnDate"),
  seatsTotal: int("seatsTotal").default(50),
  seatsAvailable: int("seatsAvailable").default(50),
  hotelMakkah: varchar("hotelMakkah", { length: 255 }),
  hotelMadinah: varchar("hotelMadinah", { length: 255 }),
  hotelStarRating: int("hotelStarRating").default(4),
  features: json("features").$type<string[]>(),
  inclusions: json("inclusions").$type<string[]>(),
  exclusions: json("exclusions").$type<string[]>(),
  itinerary: json("itinerary").$type<{ day: number; title: string; description: string }[]>(),
  isUrgent: boolean("isUrgent").default(false),
  isFeatured: boolean("isFeatured").default(false),
  isActive: boolean("isActive").default(true),
  badge: varchar("badge", { length: 100 }),
  sortOrder: int("sortOrder").default(0),
  // حقول الباقات الداخلية المطلوبة
  packageNumber: varchar("packageNumber", { length: 50 }),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  minyaSleeping: varchar("minyaSleeping", { length: 500 }),
  arafatSleeping: varchar("arafatSleeping", { length: 500 }),
  muzdalifaSleeping: varchar("muzdalifaSleeping", { length: 500 }),
  packageNotes: text("packageNotes"),
  ownerName: varchar("ownerName", { length: 255 }),
  branches: json("branches").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HajjProgram = typeof hajjPrograms.$inferSelect;
export type InsertHajjProgram = typeof hajjPrograms.$inferInsert;

// ─── Umrah Programs ───────────────────────────────────────────────────────────
export const umrahPrograms = mysqlTable("umrah_programs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  portalType: mysqlEnum("portalType", ["internal", "external", "both"]).default("both").notNull(),
  category: varchar("category", { length: 100 }).notNull().default("standard"),
  imageUrl: text("imageUrl"),
  galleryImages: json("galleryImages").$type<string[]>(),
  priceUSD: decimal("priceUSD", { precision: 10, scale: 2 }).notNull(),
  originalPriceUSD: decimal("originalPriceUSD", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  duration: int("duration").notNull().default(10),
  departureCity: varchar("departureCity", { length: 100 }),
  departureDate: timestamp("departureDate"),
  returnDate: timestamp("returnDate"),
  seatsTotal: int("seatsTotal").default(40),
  seatsAvailable: int("seatsAvailable").default(40),
  hotelMakkah: varchar("hotelMakkah", { length: 255 }),
  hotelMadinah: varchar("hotelMadinah", { length: 255 }),
  hotelStarRating: int("hotelStarRating").default(4),
  amenities: json("amenities").$type<string[]>(),
  features: json("features").$type<string[]>(),
  inclusions: json("inclusions").$type<string[]>(),
  exclusions: json("exclusions").$type<string[]>(),
  itinerary: json("itinerary").$type<{ day: number; title: string; description: string }[]>(),
  isUrgent: boolean("isUrgent").default(false),
  isFeatured: boolean("isFeatured").default(false),
  isActive: boolean("isActive").default(true),
  badge: varchar("badge", { length: 100 }),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UmrahProgram = typeof umrahPrograms.$inferSelect;
export type InsertUmrahProgram = typeof umrahPrograms.$inferInsert;

// ─── Hotels ───────────────────────────────────────────────────────────────────
export const hotels = mysqlTable("hotels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  city: mysqlEnum("city", ["makkah", "madinah", "jeddah", "other"]).notNull().default("makkah"),
  address: text("address"),
  distanceToHaram: decimal("distanceToHaram", { precision: 6, scale: 2 }),
  starRating: int("starRating").default(4),
  imageUrl: text("imageUrl"),
  galleryImages: json("galleryImages").$type<string[]>(),
  pricePerNightUSD: decimal("pricePerNightUSD", { precision: 10, scale: 2 }).notNull(),
  amenities: json("amenities").$type<string[]>(),
  roomTypes: json("roomTypes").$type<{ type: string; price: number; capacity: number; available: number }[]>(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  checkInTime: varchar("checkInTime", { length: 10 }).default("14:00"),
  checkOutTime: varchar("checkOutTime", { length: 10 }).default("12:00"),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("4.5"),
  reviewCount: int("reviewCount").default(0),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = typeof hotels.$inferInsert;

// ─── Flights ──────────────────────────────────────────────────────────────────
export const flights = mysqlTable("flights", {
  id: int("id").autoincrement().primaryKey(),
  airline: varchar("airline", { length: 255 }).notNull(),
  airlineCode: varchar("airlineCode", { length: 10 }),
  airlineLogo: text("airlineLogo"),
  flightNumber: varchar("flightNumber", { length: 20 }).notNull(),
  origin: varchar("origin", { length: 10 }).notNull(),
  originCity: varchar("originCity", { length: 100 }),
  destination: varchar("destination", { length: 10 }).notNull(),
  destinationCity: varchar("destinationCity", { length: 100 }),
  departureTime: timestamp("departureTime").notNull(),
  arrivalTime: timestamp("arrivalTime").notNull(),
  duration: int("duration").notNull(),
  stops: int("stops").default(0),
  stopCities: json("stopCities").$type<string[]>(),
  cabinClass: mysqlEnum("cabinClass", ["economy", "business", "first"]).default("economy").notNull(),
  priceUSD: decimal("priceUSD", { precision: 10, scale: 2 }).notNull(),
  seatsAvailable: int("seatsAvailable").default(50),
  baggage: varchar("baggage", { length: 100 }),
  amenities: json("amenities").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Flight = typeof flights.$inferSelect;
export type InsertFlight = typeof flights.$inferInsert;

// ─── Visas ────────────────────────────────────────────────────────────────────
export const visaTypes = mysqlTable("visa_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["umrah", "hajj", "tourist", "transit", "business", "family"]).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  priceUSD: decimal("priceUSD", { precision: 10, scale: 2 }).notNull(),
  processingDays: int("processingDays").default(5),
  validityDays: int("validityDays").default(30),
  maxStayDays: int("maxStayDays").default(30),
  requirements: json("requirements").$type<string[]>(),
  steps: json("steps").$type<{ step: number; title: string; description: string }[]>(),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const visaApplications = mysqlTable("visa_applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  visaTypeId: int("visaTypeId").notNull(),
  applicantName: varchar("applicantName", { length: 255 }).notNull(),
  passportNumber: varchar("passportNumber", { length: 50 }).notNull(),
  nationality: varchar("nationality", { length: 100 }).notNull(),
  dateOfBirth: timestamp("dateOfBirth"),
  status: mysqlEnum("status", ["pending", "processing", "approved", "rejected", "cancelled"]).default("pending").notNull(),
  documents: json("documents").$type<{ type: string; url: string; name: string }[]>(),
  notes: text("notes"),
  feeSAR: decimal("feeSAR", { precision: 10, scale: 2 }),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "refunded"]).default("unpaid").notNull(),
  paidAt: timestamp("paidAt"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VisaType = typeof visaTypes.$inferSelect;
export type VisaApplication = typeof visaApplications.$inferSelect;

// ─── Transportation ───────────────────────────────────────────────────────────
export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["vip_car", "sedan", "suv", "van", "minibus", "bus"]).notNull(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  capacity: int("capacity").notNull(),
  pricePerTripUSD: decimal("pricePerTripUSD", { precision: 10, scale: 2 }).notNull(),
  pricePerDayUSD: decimal("pricePerDayUSD", { precision: 10, scale: 2 }),
  features: json("features").$type<string[]>(),
  isAvailable: boolean("isAvailable").default(true),
  isFeatured: boolean("isFeatured").default(false),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = typeof vehicles.$inferInsert;

// ─── Ziyarat Tours ────────────────────────────────────────────────────────────
export const tours = mysqlTable("tours", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  location: mysqlEnum("location", ["makkah", "madinah", "taif", "jeddah", "other"]).notNull().default("makkah"),
  category: mysqlEnum("category", ["religious", "cultural", "historical", "combined"]).notNull().default("religious"),
  description: text("description"),
  imageUrl: text("imageUrl"),
  galleryImages: json("galleryImages").$type<string[]>(),
  priceUSD: decimal("priceUSD", { precision: 10, scale: 2 }).notNull(),
  pricePerGroupUSD: decimal("pricePerGroupUSD", { precision: 10, scale: 2 }),
  duration: int("duration").notNull().default(4),
  durationUnit: mysqlEnum("durationUnit", ["hours", "days"]).default("hours").notNull(),
  maxGroupSize: int("maxGroupSize").default(20),
  minGroupSize: int("minGroupSize").default(1),
  language: json("language").$type<string[]>(),
  sites: json("sites").$type<{ name: string; description: string; imageUrl?: string }[]>(),
  itinerary: json("itinerary").$type<{ time: string; activity: string; location: string }[]>(),
  includes: json("includes").$type<string[]>(),
  guideId: int("guideId"),
  guideName: varchar("guideName", { length: 255 }),
  guideImage: text("guideImage"),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("4.8"),
  reviewCount: int("reviewCount").default(0),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tour = typeof tours.$inferSelect;
export type InsertTour = typeof tours.$inferInsert;

// ─── E-commerce Products ──────────────────────────────────────────────────────
export const productCategories = mysqlTable("product_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId"),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  imageUrl: text("imageUrl"),
  galleryImages: json("galleryImages").$type<string[]>(),
  priceUSD: decimal("priceUSD", { precision: 10, scale: 2 }).notNull(),
  originalPriceUSD: decimal("originalPriceUSD", { precision: 10, scale: 2 }),
  sku: varchar("sku", { length: 100 }),
  stock: int("stock").default(100),
  weight: decimal("weight", { precision: 6, scale: 2 }),
  dimensions: json("dimensions").$type<{ length: number; width: number; height: number }>(),
  variants: json("variants").$type<{ name: string; options: string[] }[]>(),
  tags: json("tags").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("4.5"),
  reviewCount: int("reviewCount").default(0),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]).default("pending").notNull(),
  items: json("items").$type<{ productId: number; name: string; price: number; quantity: number; imageUrl?: string }[]>().notNull(),
  subtotalUSD: decimal("subtotalUSD", { precision: 10, scale: 2 }).notNull(),
  shippingUSD: decimal("shippingUSD", { precision: 10, scale: 2 }).default("0"),
  taxUSD: decimal("taxUSD", { precision: 10, scale: 2 }).default("0"),
  totalUSD: decimal("totalUSD", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),   // Moyasar payment ID
  paymentMethod: varchar("paymentMethod", { length: 50 }),          // creditcard | applepay | stcpay
  paidAt: timestamp("paidAt"),
  shippingAddress: json("shippingAddress").$type<{ name: string; address: string; city: string; country: string; zip: string }>(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  bookingNumber: varchar("bookingNumber", { length: 50 }).notNull().unique(),
  serviceType: mysqlEnum("serviceType", ["hajj", "umrah", "hotel", "flight", "visa", "transport", "tour"]).notNull(),
  serviceId: int("serviceId").notNull(),
  serviceName: varchar("serviceName", { length: 255 }),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed", "refunded"]).default("pending").notNull(),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 50 }),
  guestCount: int("guestCount").default(1),
  checkIn: timestamp("checkIn"),
  checkOut: timestamp("checkOut"),
  totalUSD: decimal("totalUSD", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "partial", "paid", "refunded"]).default("unpaid").notNull(),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),   // Moyasar payment ID
  paymentMethod: varchar("paymentMethod", { length: 50 }),          // creditcard | applepay | stcpay
  paidAt: timestamp("paidAt"),
  notes: text("notes"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;

// ─── Site Settings ────────────────────────────────────────────────────────────
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  type: mysqlEnum("type", ["string", "number", "boolean", "json"]).default("string").notNull(),
  category: varchar("category", { length: 100 }).default("general"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Train Bookings (Haramain High-Speed Railway) ─────────────────────────────
export const trainBookings = mysqlTable("train_bookings", {
  id: int("id").autoincrement().primaryKey(),
  bookingRef: varchar("bookingRef", { length: 50 }).notNull().unique(),
  userId: int("userId"),
  umrahProgramId: int("umrahProgramId"),
  passengerName: varchar("passengerName", { length: 255 }).notNull(),
  passengerEmail: varchar("passengerEmail", { length: 320 }),
  passengerPhone: varchar("passengerPhone", { length: 50 }),
  passportNumber: varchar("passportNumber", { length: 50 }),
  fromStation: mysqlEnum("fromStation", ["makkah", "jeddah", "madinah", "king_abdulaziz"]).notNull(),
  toStation: mysqlEnum("toStation", ["makkah", "jeddah", "madinah", "king_abdulaziz"]).notNull(),
  travelDate: timestamp("travelDate").notNull(),
  returnDate: timestamp("returnDate"),
  trainClass: mysqlEnum("trainClass", ["economy", "business", "vip"]).default("economy").notNull(),
  passengers: int("passengers").default(1).notNull(),
  priceUSD: decimal("priceUSD", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending").notNull(),
  seatNumbers: json("seatNumbers").$type<string[]>(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TrainBooking = typeof trainBookings.$inferSelect;
export type InsertTrainBooking = typeof trainBookings.$inferInsert;

// ─── Passport OCR Records ─────────────────────────────────────────────────────
export const passportRecords = mysqlTable("passport_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  bookingId: int("bookingId"),
  imageUrl: text("imageUrl"),
  passportNumber: varchar("passportNumber", { length: 50 }),
  fullName: varchar("fullName", { length: 255 }),
  nationality: varchar("nationality", { length: 100 }),
  dateOfBirth: varchar("dateOfBirth", { length: 20 }),
  expiryDate: varchar("expiryDate", { length: 20 }),
  gender: varchar("gender", { length: 10 }),
  placeOfBirth: varchar("placeOfBirth", { length: 100 }),
  mrz: text("mrz"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  rawOcrData: json("rawOcrData"),
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PassportRecord = typeof passportRecords.$inferSelect;

// ─── Dynamic Pricing Rules ────────────────────────────────────────────────────
export const dynamicPricingRules = mysqlTable("dynamic_pricing_rules", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: varchar("ruleId", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["seasonal", "early_bird", "last_minute", "group", "occupancy"]).notNull(),
  serviceType: mysqlEnum("serviceType", ["hajj", "umrah", "hotel", "flight", "all"]).default("all").notNull(),
  discountPercent: decimal("discountPercent", { precision: 5, scale: 2 }).notNull(),
  minDaysAhead: int("minDaysAhead"),
  maxDaysAhead: int("maxDaysAhead"),
  minGroupSize: int("minGroupSize"),
  minOccupancyPercent: decimal("minOccupancyPercent", { precision: 5, scale: 2 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true).notNull(),
  priority: int("priority").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DynamicPricingRule = typeof dynamicPricingRules.$inferSelect;

// ─── Hajj Companies (حجاج الداخل - شركات مرخصة) ──────────────────────────────
export const hajjCompanies = mysqlTable("hajj_companies", {
  id: int("id").autoincrement().primaryKey(),
  companyId: varchar("companyId", { length: 50 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 255 }).notNull(),
  nameEn: varchar("nameEn", { length: 255 }),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  logoUrl: text("logoUrl"),
  coverImageUrl: text("coverImageUrl"),
  galleryImages: json("galleryImages").$type<string[]>(),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  description: text("description"),
  descriptionEn: text("descriptionEn"),
  nusukProfileUrl: text("nusukProfileUrl"),
  specializations: json("specializations").$type<string[]>(),
  yearsExperience: int("yearsExperience").default(0),
  totalPilgrims: int("totalPilgrims").default(0),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: int("totalReviews").default(0),
  isVerified: boolean("isVerified").default(false),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HajjCompany = typeof hajjCompanies.$inferSelect;
export type InsertHajjCompany = typeof hajjCompanies.$inferInsert;

// ─── Hajj Company Reviews (تقييمات شركات الداخل) ─────────────────────────────
export const hajjCompanyReviews = mysqlTable("hajj_company_reviews", {
  id: int("id").autoincrement().primaryKey(),
  companyId: varchar("companyId", { length: 50 }).notNull(),
  userId: int("userId"),
  reviewerName: varchar("reviewerName", { length: 255 }).notNull(),
  reviewerEmail: varchar("reviewerEmail", { length: 255 }),
  // Verification: pilgrim must provide booking reference to post review
  bookingReference: varchar("bookingReference", { length: 100 }),
  isVerifiedPilgrim: boolean("isVerifiedPilgrim").default(false),
  rating: int("rating").notNull(), // 1-5
  ratingService: int("ratingService"), // خدمة
  ratingAccommodation: int("ratingAccommodation"), // إقامة
  ratingTransport: int("ratingTransport"), // نقل
  ratingFood: int("ratingFood"), // طعام
  reviewText: text("reviewText"),
  hajjYear: int("hajjYear"),
  isApproved: boolean("isApproved").default(false),
  isHidden: boolean("isHidden").default(false),
  adminNote: text("adminNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type HajjCompanyReview = typeof hajjCompanyReviews.$inferSelect;
export type InsertHajjCompanyReview = typeof hajjCompanyReviews.$inferInsert;

// ─── Customer Reviews (Platform Reviews from Zid) ─────────────────────────────
export const customerReviews = mysqlTable("customer_reviews", {
  id: int("id").autoincrement().primaryKey(),
  reviewerName: varchar("reviewerName", { length: 255 }).notNull(),
  rating: int("rating").notNull(),
  reviewText: text("reviewText"),
  productName: varchar("productName", { length: 500 }),
  productSku: varchar("productSku", { length: 100 }),
  status: mysqlEnum("status", ["approved", "pending", "hidden"]).default("approved").notNull(),
  source: varchar("source", { length: 50 }).default("zid"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CustomerReview = typeof customerReviews.$inferSelect;
export type InsertCustomerReview = typeof customerReviews.$inferInsert;

// ─── Hajj Notifications / News (إشعارات وأخبار حجاج الداخل) ─────────────────
export const hajjDomesticNotifications = mysqlTable("hajj_domestic_notifications", {
  id: int("id").autoincrement().primaryKey(),
  notifId: varchar("notifId", { length: 50 }).notNull().unique(),
  titleAr: varchar("titleAr", { length: 500 }).notNull(),
  titleEn: varchar("titleEn", { length: 500 }),
  contentAr: text("contentAr").notNull(),
  contentEn: text("contentEn"),
  category: mysqlEnum("category", ["news", "alert", "announcement", "article", "update"]).default("news").notNull(),
  imageUrl: text("imageUrl"),
  sourceUrl: text("sourceUrl"),
  isUrgent: boolean("isUrgent").default(false),
  isPinned: boolean("isPinned").default(false),
  isPublished: boolean("isPublished").default(true),
  // Email/WhatsApp send tracking
  sentViaEmail: boolean("sentViaEmail").default(false),
  sentViaWhatsapp: boolean("sentViaWhatsapp").default(false),
  emailSentAt: timestamp("emailSentAt"),
  whatsappSentAt: timestamp("whatsappSentAt"),
  recipientCount: int("recipientCount").default(0),
  publishedAt: timestamp("publishedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HajjDomesticNotification = typeof hajjDomesticNotifications.$inferSelect;
export type InsertHajjDomesticNotification = typeof hajjDomesticNotifications.$inferInsert;

// ─── Hajj International Packages (باقات حجاج الخارج) ─────────────────────────
export const hajjInternationalPackages = mysqlTable("hajj_international_packages", {
  id: int("id").autoincrement().primaryKey(),
  packageId: varchar("packageId", { length: 50 }).notNull().unique(),
  titleAr: varchar("titleAr", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  companyNameAr: varchar("companyNameAr", { length: 255 }),
  companyLogoUrl: text("companyLogoUrl"),
  // Country & City — required for filtering
  countryCode: varchar("countryCode", { length: 10 }).notNull(),
  countryAr: varchar("countryAr", { length: 100 }).notNull(),
  countryEn: varchar("countryEn", { length: 100 }).notNull(),
  cityAr: varchar("cityAr", { length: 100 }),
  cityEn: varchar("cityEn", { length: 100 }),
  imageUrl: text("imageUrl"),
  galleryImages: json("galleryImages").$type<string[]>(),
  priceUSD: decimal("priceUSD", { precision: 10, scale: 2 }).notNull(),
  priceSAR: decimal("priceSAR", { precision: 10, scale: 2 }),
  localCurrency: varchar("localCurrency", { length: 10 }),
  localPrice: decimal("localPrice", { precision: 12, scale: 2 }),
  duration: int("duration").default(21),
  departureDate: timestamp("departureDate"),
  returnDate: timestamp("returnDate"),
  seatsTotal: int("seatsTotal").default(50),
  seatsAvailable: int("seatsAvailable").default(50),
  hotelMakkah: varchar("hotelMakkah", { length: 255 }),
  hotelMadinah: varchar("hotelMadinah", { length: 255 }),
  hotelStarRating: int("hotelStarRating").default(4),
  features: json("features").$type<string[]>(),
  inclusions: json("inclusions").$type<string[]>(),
  contactPhone: varchar("contactPhone", { length: 50 }),
  contactWhatsapp: varchar("contactWhatsapp", { length: 50 }),
  contactEmail: varchar("contactEmail", { length: 255 }),
  category: varchar("category", { length: 100 }).default("standard"),
  // حقول حجاج الخارج المطلوبة
  packageLevel: varchar("packageLevel", { length: 100 }),
  airline: varchar("airline", { length: 255 }),
  makkahPeriod: int("makkahPeriod").default(0),
  trainHaramain: boolean("trainHaramain").default(false),
  packageNotes: text("packageNotes"),
  isUrgent: boolean("isUrgent").default(false),
  isFeatured: boolean("isFeatured").default(false),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HajjInternationalPackage = typeof hajjInternationalPackages.$inferSelect;
export type InsertHajjInternationalPackage = typeof hajjInternationalPackages.$inferInsert;

// ─── Notification Subscribers (مشتركو الإشعارات) ────────────────────────────
export const notificationSubscribers = mysqlTable("notification_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  subscriptionType: mysqlEnum("subscriptionType", ["email", "whatsapp", "both"]).default("email").notNull(),
  topics: json("topics").$type<string[]>(), // ["hajj_domestic", "hajj_international", "umrah", "general"]
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type NotificationSubscriber = typeof notificationSubscribers.$inferSelect;

// ─── Hajj Booking Requests (طلبات حجز الحج من الخارج) ────────────────────────
export const hajjBookingRequests = mysqlTable("hajj_booking_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("requestId", { length: 36 }).notNull().unique(),
  packageId: varchar("packageId", { length: 36 }),
  packageTitle: varchar("packageTitle", { length: 500 }),
  countryAr: varchar("countryAr", { length: 255 }),
  countryEn: varchar("countryEn", { length: 255 }),
  pilgrims: int("pilgrims").default(1),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 100 }),
  customerEmail: varchar("customerEmail", { length: 255 }),
  customerWhatsapp: varchar("customerWhatsapp", { length: 100 }),
  notes: text("notes"),
  // بيانات جواز السفر من OCR
  passportNumber: varchar("passportNumber", { length: 100 }),
  passportExpiry: varchar("passportExpiry", { length: 50 }),
  nationality: varchar("nationality", { length: 100 }),
  dateOfBirth: varchar("dateOfBirth", { length: 50 }),
  passportImageUrl: text("passportImageUrl"),
  // بيانات الدفع
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "refunded"]).default("unpaid").notNull(),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  paidAt: timestamp("paidAt"),
  totalSAR: decimal("totalSAR", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["new", "reviewing", "confirmed", "cancelled"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HajjBookingRequest = typeof hajjBookingRequests.$inferSelect;

// ─── Umrah Booking Requests (طلبات حجز العمرة) ────────────────────────────────
export const umrahBookingRequests = mysqlTable("umrah_booking_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("requestId", { length: 36 }).notNull().unique(),
  packageId: int("packageId"),
  packageTitle: varchar("packageTitle", { length: 500 }),
  portalType: mysqlEnum("portalType", ["domestic", "international"]).default("domestic").notNull(),
  departureCity: varchar("departureCity", { length: 255 }),
  countryAr: varchar("countryAr", { length: 255 }),
  pilgrims: int("pilgrims").default(1),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 100 }),
  customerEmail: varchar("customerEmail", { length: 255 }),
  customerWhatsapp: varchar("customerWhatsapp", { length: 100 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "reviewing", "confirmed", "cancelled"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UmrahBookingRequest = typeof umrahBookingRequests.$inferSelect;

// ─── Flexible Requests (الطلبات المرنة) ──────────────────────────────────────
export const flexibleRequests = mysqlTable("flexible_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("requestId", { length: 36 }).notNull().unique(),
  serviceType: mysqlEnum("serviceType", ["hajj", "umrah", "hotel", "flight", "visa", "transport", "tour", "other"]).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 100 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 255 }),
  customerWhatsapp: varchar("customerWhatsapp", { length: 100 }),
  nationality: varchar("nationality", { length: 100 }),
  departureCity: varchar("departureCity", { length: 255 }),
  destination: varchar("destination", { length: 255 }),
  travelDate: varchar("travelDate", { length: 50 }),
  returnDate: varchar("returnDate", { length: 50 }),
  adults: int("adults").default(1),
  children: int("children").default(0),
  budgetMin: decimal("budgetMin", { precision: 10, scale: 2 }),
  budgetMax: decimal("budgetMax", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  hotelStars: int("hotelStars"),
  specialRequirements: text("specialRequirements"),
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "reviewing", "quoted", "confirmed", "cancelled"]).default("new").notNull(),
  adminNotes: text("adminNotes"),
  quotedPrice: decimal("quotedPrice", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FlexibleRequest = typeof flexibleRequests.$inferSelect;

// ─── Provider Profiles (مزودو الخدمات) ────────────────────────────────────────
export const providerProfiles = mysqlTable("provider_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  companyNameAr: varchar("companyNameAr", { length: 255 }),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  licenseExpiry: varchar("licenseExpiry", { length: 50 }),
  contactPhone: varchar("contactPhone", { length: 100 }),
  contactWhatsapp: varchar("contactWhatsapp", { length: 100 }),
  contactEmail: varchar("contactEmail", { length: 255 }),
  website: varchar("website", { length: 500 }),
  logoUrl: text("logoUrl"),
  coverUrl: text("coverUrl"),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("SA"),
  serviceTypes: json("serviceTypes").$type<string[]>().default([]),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0.0"),
  reviewCount: int("reviewCount").default(0),
  totalBookings: int("totalBookings").default(0),
  isVerified: boolean("isVerified").default(false),
  isActive: boolean("isActive").default(true),
  status: mysqlEnum("status", ["pending", "approved", "suspended"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Provider Programs (برامج مزودي الخدمات) ──────────────────────────────────
export const providerPrograms = mysqlTable("provider_programs", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull(),
  programType: mysqlEnum("programType", ["hajj", "umrah", "hotel", "flight", "visa", "transport", "tour", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  imageUrl: text("imageUrl"),
  galleryImages: json("galleryImages").$type<string[]>().default([]),
  priceUSD: decimal("priceUSD", { precision: 10, scale: 2 }).notNull(),
  originalPriceUSD: decimal("originalPriceUSD", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  duration: varchar("duration", { length: 100 }),
  capacity: int("capacity").default(20),
  availableSlots: int("availableSlots").default(20),
  departureCity: varchar("departureCity", { length: 100 }),
  destination: varchar("destination", { length: 100 }).default("Makkah"),
  startDate: varchar("startDate", { length: 50 }),
  endDate: varchar("endDate", { length: 50 }),
  features: json("features").$type<string[]>().default([]),
  inclusions: json("inclusions").$type<string[]>().default([]),
  exclusions: json("exclusions").$type<string[]>().default([]),
  customFields: json("customFields").$type<{ key: string; label: string; value: string }[]>().default([]),
  tags: json("tags").$type<string[]>().default([]),
  isActive: boolean("isActive").default(true),
  isFeatured: boolean("isFeatured").default(false),
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0.0"),
  reviewCount: int("reviewCount").default(0),
  totalBookings: int("totalBookings").default(0),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Provider Bookings (حجوزات مزودي الخدمات) ─────────────────────────────────
export const providerBookings = mysqlTable("provider_bookings", {
  id: int("id").autoincrement().primaryKey(),
  bookingRef: varchar("bookingRef", { length: 36 }).notNull().unique(),
  programId: int("programId").notNull(),
  providerId: int("providerId").notNull(),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 255 }),
  customerPhone: varchar("customerPhone", { length: 100 }),
  customerWhatsapp: varchar("customerWhatsapp", { length: 100 }),
  adults: int("adults").default(1),
  children: int("children").default(0),
  totalUSD: decimal("totalUSD", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("SAR"),
  status: mysqlEnum("status", ["pending", "confirmed", "processing", "completed", "cancelled", "refunded"]).default("pending").notNull(),
  notes: text("notes"),
  providerNotes: text("providerNotes"),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "partial", "paid", "refunded"]).default("unpaid").notNull(),
  paidAmount: decimal("paidAmount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProviderProfile = typeof providerProfiles.$inferSelect;
export type ProviderProgram = typeof providerPrograms.$inferSelect;
export type ProviderBooking = typeof providerBookings.$inferSelect;

// ─── Provider Applications (طلبات الانضمام كمزود خدمة) ──────────────────────
export const providerApplications = mysqlTable("provider_applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Company Info
  companyName: varchar("companyName", { length: 255 }).notNull(),
  companyNameAr: varchar("companyNameAr", { length: 255 }),
  companyType: varchar("companyType", { length: 100 }), // travel_agency, hotel, airline, etc.
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  licenseExpiry: varchar("licenseExpiry", { length: 50 }),
  licenseAuthority: varchar("licenseAuthority", { length: 255 }), // الجهة المرخصة
  // Contact
  contactName: varchar("contactName", { length: 255 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 100 }).notNull(),
  contactWhatsapp: varchar("contactWhatsapp", { length: 100 }),
  contactEmail: varchar("contactEmail", { length: 255 }).notNull(),
  website: varchar("website", { length: 500 }),
  // Location
  country: varchar("country", { length: 100 }).default("SA"),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  // Services
  serviceTypes: json("serviceTypes").$type<string[]>().default([]),
  description: text("description"),
  // Documents
  licenseDocUrl: text("licenseDocUrl"),
  commercialRegUrl: text("commercialRegUrl"),
  // Status
  status: mysqlEnum("status", ["pending", "under_review", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Roles (الأدوار المخصصة) ─────────────────────────────────────────────────
export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  nameAr: varchar("nameAr", { length: 100 }),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#6B7280"),
  isSystem: boolean("isSystem").default(false), // system roles can't be deleted
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Permissions (الصلاحيات لكل قسم) ─────────────────────────────────────────
// Stores per-user or per-role permissions for each section
export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  // Target: either userId or roleId (one must be set)
  userId: int("userId"),
  roleId: int("roleId"),
  // Section being controlled
  section: varchar("section", { length: 100 }).notNull(), // hajj, umrah, hotels, flights, visa, transport, tours, store, bookings, users, analytics, settings, provider_programs, etc.
  // CRUD permissions
  canView: boolean("canView").default(true),
  canCreate: boolean("canCreate").default(false),
  canEdit: boolean("canEdit").default(false),
  canDelete: boolean("canDelete").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProviderApplication = typeof providerApplications.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;

// ─── Media Center (المركز الإعلامي) ──────────────────────────────────────────
export const mediaPosts = mysqlTable("media_posts", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["news", "alert", "article", "announcement"]).notNull().default("news"),
  category: mysqlEnum("category", ["hajj", "umrah", "hotels", "flights", "visa", "store", "tours", "transport", "general"]).notNull().default("general"),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary"),
  content: text("content"),
  imageUrl: varchar("image_url", { length: 1000 }),
  author: varchar("author", { length: 200 }),
  isPublished: boolean("is_published").notNull().default(false),
  isPinned: boolean("is_pinned").notNull().default(false),
  isBreaking: boolean("is_breaking").notNull().default(false),
  views: int("views").notNull().default(0),
  publishedAt: bigint("published_at", { mode: "number" }),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
export type MediaPost = typeof mediaPosts.$inferSelect;
export type InsertMediaPost = typeof mediaPosts.$inferInsert;

// ─── Hero Ads (إعلانات الهيرو) ─────────────────────────────────────────────
export const heroAds = mysqlTable("hero_ads", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  mediaUrl: varchar("media_url", { length: 1000 }).notNull(), // image or video URL
  mediaType: mysqlEnum("media_type", ["image", "video"]).notNull().default("image"),
  linkUrl: varchar("link_url", { length: 500 }),
  linkLabel: varchar("link_label", { length: 100 }),
  sortOrder: int("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
export type HeroAd = typeof heroAds.$inferSelect;
export type InsertHeroAd = typeof heroAds.$inferInsert;

// ─── Search Fields Config (إعدادات محرك البحث) ───────────────────────────────
export const searchFieldsConfig = mysqlTable("search_fields_config", {
  id: int("id").autoincrement().primaryKey(),
  serviceTab: varchar("service_tab", { length: 50 }).notNull(), // hajj, umrah, hotels, flights, visa, transport, tours
  fieldKey: varchar("field_key", { length: 100 }).notNull(),
  labelAr: varchar("label_ar", { length: 200 }).notNull(),
  labelEn: varchar("label_en", { length: 200 }).notNull(),
  fieldType: mysqlEnum("field_type", ["text", "select", "date", "number", "city"]).notNull().default("text"),
  placeholder: varchar("placeholder", { length: 200 }),
  options: text("options"), // JSON array for select options
  sortOrder: int("sort_order").notNull().default(0),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
export type SearchFieldConfig = typeof searchFieldsConfig.$inferSelect;

// ─── Marketers (المسوقون) ──────────────────────────────────────────────────────
export const marketers = mysqlTable("marketers", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(), // MKT-XXX
  userId: int("user_id"), // linked user account (after approval)
  approvalStatus: mysqlEnum("approval_status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvedAt: bigint("approved_at", { mode: "number" }),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  gender: mysqlEnum("gender", ["male", "female"]).default("male"),
  role: mysqlEnum("role", ["marketer", "employee"]).default("marketer").notNull(),
  jobTitle: varchar("job_title", { length: 255 }),
  education: varchar("education", { length: 255 }),
  skills: json("skills").$type<string[]>(),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  city: varchar("city", { length: 100 }),
  maritalStatus: mysqlEnum("marital_status", ["single", "married", "divorced", "widowed"]).default("single"),
  birthDate: varchar("birth_date", { length: 20 }),
  joinDate: varchar("join_date", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
export type Marketer = typeof marketers.$inferSelect;
export type InsertMarketer = typeof marketers.$inferInsert;

// ─── Suppliers (الموردون) ──────────────────────────────────────────────────────
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 30 }).notNull().unique(), // SUP-XXX reference code
  // Personal / Company Info
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("type", ["individual", "company"]).default("company").notNull(),
  gender: mysqlEnum("gender", ["male", "female"]).default("male"),
  companyName: varchar("company_name", { length: 255 }),
  licenseNumber: varchar("license_number", { length: 100 }),
  commercialRegisterNumber: varchar("commercial_register_number", { length: 100 }),
  // File uploads (S3 URLs)
  licenseFileUrl: text("license_file_url"),
  commercialRegisterUrl: text("commercial_register_url"),
  // Contact
  phone: varchar("phone", { length: 30 }),
  whatsapp: varchar("whatsapp", { length: 30 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  // Location
  country: varchar("country", { length: 100 }),
  countryCode: varchar("country_code", { length: 10 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  // Services
  services: json("services").$type<string[]>(),
  // Approval workflow
  approvalStatus: mysqlEnum("approval_status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  approvalNotes: text("approval_notes"),
  approvedAt: bigint("approved_at", { mode: "number" }),
  // Meta
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

// ─── Sales Customers (عملاء المبيعات) ─────────────────────────────────────────
export const salesCustomers = mysqlTable("sales_customers", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  city: varchar("city", { length: 100 }),
  notes: text("notes"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
export type SalesCustomer = typeof salesCustomers.$inferSelect;
export type InsertSalesCustomer = typeof salesCustomers.$inferInsert;

// ─── Sales Orders (الطلبات) ────────────────────────────────────────────────────
export const salesOrders = mysqlTable("sales_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: int("order_number").notNull().unique(), // auto-increment order number
  orderDate: varchar("order_date", { length: 20 }).notNull(),
  customerId: int("customer_id"),
  customerName: varchar("customer_name", { length: 255 }), // fallback if no customer record
  customerPhone: varchar("customer_phone", { length: 30 }),
  marketerId: int("marketer_id"),
  supplierId: int("supplier_id"),
  service: mysqlEnum("service", ["umrah", "visa", "hotel", "transport", "hajj", "tour", "other"]).notNull().default("umrah"),
  description: text("description"),
  paymentMethod: mysqlEnum("payment_method", ["bank_sar", "bank_egp", "electronic", "cash", "settlement"]).default("cash").notNull(),
  currency: mysqlEnum("currency", ["SAR", "EGP", "USD"]).default("SAR").notNull(),
  costPrice: decimal("cost_price", { precision: 12, scale: 2 }).default("0").notNull(),
  marketerCommission: decimal("marketer_commission", { precision: 12, scale: 2 }).default("0").notNull(),
  platformMargin: decimal("platform_margin", { precision: 12, scale: 2 }).default("0").notNull(),
  sellingPrice: decimal("selling_price", { precision: 12, scale: 2 }).default("0").notNull(),
  amountPaid: decimal("amount_paid", { precision: 12, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "completed", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = typeof salesOrders.$inferInsert;

// ─── Waitlist Emails (قائمة انتظار الإطلاق) ────────────────────────────────────
export const waitlistEmails = mysqlTable("waitlist_emails", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  source: varchar("source", { length: 100 }).default("maintenance_page"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
export type WaitlistEmail = typeof waitlistEmails.$inferSelect;
export type InsertWaitlistEmail = typeof waitlistEmails.$inferInsert;

// ─── News Sources (مصادر الأخبار) ──────────────────────────────────────────────
export const newsSources = mysqlTable("news_sources", {
  id: int("id").autoincrement().primaryKey(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }),
  type: mysqlEnum("type", ["rss", "scrape", "manual"]).default("rss").notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  logoUrl: text("logo_url"),
  category: mysqlEnum("category", ["hajj", "umrah", "general", "official"]).default("general").notNull(),
  language: mysqlEnum("language", ["ar", "en"]).default("ar").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  fetchInterval: int("fetch_interval").default(30).notNull(), // minutes
  lastFetchedAt: bigint("last_fetched_at", { mode: "number" }),
  articlesCount: int("articles_count").default(0).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});
export type NewsSource = typeof newsSources.$inferSelect;
export type InsertNewsSource = typeof newsSources.$inferInsert;

// ─── News Articles (مقالات الأخبار) ──────────────────────────────────────────
export const newsArticles = mysqlTable("news_articles", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("source_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary"),
  url: varchar("url", { length: 1000 }),
  imageUrl: text("image_url"),
  category: mysqlEnum("category", ["hajj", "umrah", "general", "official"]).default("general").notNull(),
  language: mysqlEnum("language", ["ar", "en"]).default("ar").notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  publishedAt: bigint("published_at", { mode: "number" }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;

// ─── Page Views / Visitor Analytics ──────────────────────────────────────────
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  page: varchar("page", { length: 255 }).notNull().default("/"),
  referrer: varchar("referrer", { length: 500 }),
  userAgent: varchar("user_agent", { length: 500 }),
  device: mysqlEnum("device", ["desktop", "mobile", "tablet"]).default("desktop"),
  ip: varchar("ip", { length: 64 }),
  country: varchar("country", { length: 100 }),
  countryCode: varchar("country_code", { length: 10 }),
  city: varchar("city", { length: 100 }),
  userId: int("user_id"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});
export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

// ─── Subscription Plans (باقات الاشتراك) ─────────────────────────────────────
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 50 }).notNull().unique(), // "free_trial" | "premium_basic" | "premium_plus"
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  monthlyPriceSAR: decimal("monthlyPriceSAR", { precision: 10, scale: 2 }).default("0").notNull(),
  annualPriceSAR: decimal("annualPriceSAR", { precision: 10, scale: 2 }).default("0").notNull(),
  trialDays: int("trialDays").default(0).notNull(), // 14 for free_trial, 0 for others
  maxPrograms: int("maxPrograms").default(3).notNull(), // -1 = unlimited
  featuresAr: json("featuresAr").$type<string[]>().default([]),
  featuresEn: json("featuresEn").$type<string[]>().default([]),
  isFeaturedInListings: boolean("isFeaturedInListings").default(false).notNull(), // Premium Plus only
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// ─── Plan Addons (إضافات الباقات) ─────────────────────────────────────────────
export const planAddons = mysqlTable("plan_addons", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 50 }).notNull().unique(), // "featured_listings" | "hero_ads"
  nameAr: varchar("nameAr", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  descriptionAr: text("descriptionAr"),
  descriptionEn: text("descriptionEn"),
  monthlyPriceSAR: decimal("monthlyPriceSAR", { precision: 10, scale: 2 }).notNull(),
  maxSlots: int("maxSlots").default(5).notNull(), // max programs per provider using this addon
  totalPlatformSlots: int("totalPlatformSlots").default(10).notNull(), // max providers who can use this addon simultaneously
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PlanAddon = typeof planAddons.$inferSelect;

// ─── Provider Subscriptions (اشتراكات المزودين) ───────────────────────────────
export const providerSubscriptions = mysqlTable("provider_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull(), // FK → provider_profiles.id
  planId: int("planId").notNull(),         // FK → subscription_plans.id
  billingCycle: mysqlEnum("billingCycle", ["trial", "monthly", "annual"]).default("trial").notNull(),
  status: mysqlEnum("status", ["active", "expired", "cancelled", "pending_payment"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate").notNull(),
  // Addons
  hasFeaturedListings: boolean("hasFeaturedListings").default(false).notNull(),
  featuredListingsExpiry: timestamp("featuredListingsExpiry"),
  hasHeroAds: boolean("hasHeroAds").default(false).notNull(),
  heroAdsExpiry: timestamp("heroAdsExpiry"),
  // Upgrade requests (manual payment flow)
  upgradeRequestedPlanId: int("upgradeRequestedPlanId"), // pending upgrade
  upgradeRequestedAt: timestamp("upgradeRequestedAt"),
  upgradeRequestedAddons: json("upgradeRequestedAddons").$type<string[]>().default([]),
  adminNotes: text("adminNotes"),
  activatedBy: int("activatedBy"), // admin userId who activated
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ProviderSubscription = typeof providerSubscriptions.$inferSelect;

// ─── Booking Reviews (تقييمات الحجوزات) ──────────────────────────────────────
export const bookingReviews = mysqlTable("booking_reviews", {
  id: int("id").autoincrement().primaryKey(),
  bookingRef: varchar("bookingRef", { length: 36 }).notNull(),
  providerId: int("providerId").notNull(),
  programId: int("programId"),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  providerReply: text("providerReply"),
  providerRepliedAt: timestamp("providerRepliedAt"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  isVerified: boolean("isVerified").default(false), // verified purchase
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BookingReview = typeof bookingReviews.$inferSelect;
export type InsertBookingReview = typeof bookingReviews.$inferInsert;

// ─── Provider Notifications (إشعارات مزودي الخدمات) ──────────────────────────
export const providerNotifications = mysqlTable("provider_notifications", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull(),
  type: mysqlEnum("type", [
    "new_booking",
    "booking_cancelled",
    "booking_completed",
    "new_review",
    "subscription_expiring",
    "subscription_expired",
    "upgrade_approved",
    "upgrade_rejected",
    "application_approved",
    "application_rejected",
    "system",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  relatedId: int("relatedId"), // bookingId, reviewId, etc.
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProviderNotification = typeof providerNotifications.$inferSelect;
export type InsertProviderNotification = typeof providerNotifications.$inferInsert;

// ─── Package Views Tracking ────────────────────────────────────────────────
export const packageViews = mysqlTable("package_views", {
  id: int("id").autoincrement().primaryKey(),
  serviceType: mysqlEnum("serviceType", ["hajj","umrah","hotel","flight","tour","transport"]).notNull(),
  serviceId: int("serviceId").notNull(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Wishlists ─────────────────────────────────────────────────────────────
export const wishlists = mysqlTable("wishlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  serviceType: mysqlEnum("serviceType", ["hajj","umrah","hotel","flight","tour"]).notNull(),
  serviceId: int("serviceId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Wishlist = typeof wishlists.$inferSelect;

// ─── Conversations & Messages ──────────────────────────────────────────────
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId"),
  customerId: int("customerId").notNull(),
  providerId: int("providerId").notNull(),
  subject: varchar("subject", { length: 255 }),
  status: mysqlEnum("status", ["open","closed"]).default("open").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  senderRole: mysqlEnum("senderRole", ["customer","provider","admin"]).notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Message = typeof messages.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;

// ─── Coupons ───────────────────────────────────────────────────────────────
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  discountType: mysqlEnum("discountType", ["percent","fixed"]).notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  minOrderUSD: decimal("minOrderUSD", { precision: 10, scale: 2 }).default("0"),
  maxDiscountUSD: decimal("maxDiscountUSD", { precision: 10, scale: 2 }),
  usageLimit: int("usageLimit"),
  usagePerUser: int("usagePerUser").default(1),
  usedCount: int("usedCount").default(0),
  serviceTypes: json("serviceTypes").$type<string[]>(),
  providerId: int("providerId"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const couponUsages = mysqlTable("coupon_usages", {
  id: int("id").autoincrement().primaryKey(),
  couponId: int("couponId").notNull(),
  userId: int("userId").notNull(),
  bookingId: int("bookingId"),
  discountUSD: decimal("discountUSD", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Coupon = typeof coupons.$inferSelect;

// ─── User Events (for recommendations & analytics) ─────────────────────────
export const userEvents = mysqlTable("user_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 64 }),
  eventType: mysqlEnum("eventType", ["view_package","search","add_wishlist","start_booking","complete_booking","share"]).notNull(),
  serviceType: varchar("serviceType", { length: 50 }),
  serviceId: int("serviceId"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Payments (Moyasar) ────────────────────────────────────────────────────
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingNumber: varchar("bookingNumber", { length: 50 }).notNull(),
  userId: int("userId").notNull(),
  moyasarPaymentId: varchar("moyasarPaymentId", { length: 100 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),       // بالريال
  amountHalala: int("amountHalala").notNull(),                             // بالهللات
  currency: varchar("currency", { length: 10 }).default("SAR").notNull(),
  status: mysqlEnum("status", ["initiated","paid","failed","authorized","captured","refunded"]).default("initiated").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),                 // creditcard | applepay | stcpay
  description: text("description"),
  callbackUrl: varchar("callbackUrl", { length: 500 }),
  metadata: json("metadata"),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type Payment = typeof payments.$inferSelect;
