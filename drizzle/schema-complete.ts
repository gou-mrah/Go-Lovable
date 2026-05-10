import {
  mysqlTable,
  mysqlSchema,
  AnyMySqlColumn,
  primaryKey,
  unique,
  index,
  varchar,
  text,
  int,
  bigint,
  decimal,
  datetime,
  boolean,
  enum as mysqlEnum,
  json,
  timestamp,
  double,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================
// USERS & AUTHENTICATION
// ============================================

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    avatar: text("avatar"),
    password: varchar("password", { length: 255 }),
    role: mysqlEnum("role", ["user", "admin", "guide", "vendor"]).default("user"),
    status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active"),
    emailVerified: boolean("email_verified").default(false),
    phoneVerified: boolean("phone_verified").default(false),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    nationality: varchar("nationality", { length: 100 }),
    passportNumber: varchar("passport_number", { length: 50 }),
    dateOfBirth: datetime("date_of_birth"),
    gender: mysqlEnum("gender", ["male", "female", "other"]),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),
    preferences: json("preferences"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    roleIdx: index("role_idx").on(table.role),
    statusIdx: index("status_idx").on(table.status),
  })
);

export const userSessions = mysqlTable(
  "user_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    token: text("token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: datetime("expires_at").notNull(),
    deviceInfo: json("device_info"),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
  })
);

// ============================================
// HOTELS & ACCOMMODATIONS
// ============================================

export const hotels = mysqlTable(
  "hotels",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: mysqlEnum("category", ["luxury", "premium", "standard", "budget"]).notNull(),
    starRating: int("star_rating"),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    latitude: double("latitude"),
    longitude: double("longitude"),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 255 }),
    checkInTime: varchar("check_in_time", { length: 10 }),
    checkOutTime: varchar("check_out_time", { length: 10 }),
    totalRooms: int("total_rooms"),
    availableRooms: int("available_rooms"),
    amenities: json("amenities"),
    images: json("images"),
    policies: json("policies"),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewCount: int("review_count").default(0),
    status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    cityIdx: index("city_idx").on(table.city),
    categoryIdx: index("category_idx").on(table.category),
    ratingIdx: index("rating_idx").on(table.rating),
  })
);

export const hotelRooms = mysqlTable(
  "hotel_rooms",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    hotelId: varchar("hotel_id", { length: 36 }).notNull(),
    roomNumber: varchar("room_number", { length: 50 }).notNull(),
    roomType: mysqlEnum("room_type", ["single", "double", "suite", "deluxe", "presidential"]).notNull(),
    capacity: int("capacity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    bedType: varchar("bed_type", { length: 100 }),
    area: int("area"),
    amenities: json("amenities"),
    images: json("images"),
    status: mysqlEnum("status", ["available", "occupied", "maintenance"]).default("available"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    hotelIdIdx: index("hotel_id_idx").on(table.hotelId),
    roomTypeIdx: index("room_type_idx").on(table.roomType),
  })
);

export const hotelBookings = mysqlTable(
  "hotel_bookings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    hotelId: varchar("hotel_id", { length: 36 }).notNull(),
    roomId: varchar("room_id", { length: 36 }).notNull(),
    checkInDate: datetime("check_in_date").notNull(),
    checkOutDate: datetime("check_out_date").notNull(),
    numberOfGuests: int("number_of_guests").notNull(),
    numberOfRooms: int("number_of_rooms").notNull(),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending"),
    paymentStatus: mysqlEnum("payment_status", ["pending", "completed", "failed", "refunded"]).default("pending"),
    specialRequests: text("special_requests"),
    guestInfo: json("guest_info"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    hotelIdIdx: index("hotel_id_idx").on(table.hotelId),
    statusIdx: index("status_idx").on(table.status),
  })
);

// ============================================
// FLIGHTS
// ============================================

export const flights = mysqlTable(
  "flights",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    flightNumber: varchar("flight_number", { length: 20 }).notNull(),
    airline: varchar("airline", { length: 100 }).notNull(),
    departureCity: varchar("departure_city", { length: 100 }).notNull(),
    departureCode: varchar("departure_code", { length: 10 }).notNull(),
    arrivalCity: varchar("arrival_city", { length: 100 }).notNull(),
    arrivalCode: varchar("arrival_code", { length: 10 }).notNull(),
    departureTime: datetime("departure_time").notNull(),
    arrivalTime: datetime("arrival_time").notNull(),
    duration: int("duration"),
    stops: int("stops").default(0),
    aircraft: varchar("aircraft", { length: 100 }),
    economyPrice: decimal("economy_price", { precision: 10, scale: 2 }),
    businessPrice: decimal("business_price", { precision: 10, scale: 2 }),
    firstClassPrice: decimal("first_class_price", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    economySeats: int("economy_seats"),
    businessSeats: int("business_seats"),
    firstClassSeats: int("first_class_seats"),
    status: mysqlEnum("status", ["active", "cancelled", "delayed"]).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    flightNumberIdx: index("flight_number_idx").on(table.flightNumber),
    departureIdx: index("departure_idx").on(table.departureCode),
    arrivalIdx: index("arrival_idx").on(table.arrivalCode),
  })
);

export const flightBookings = mysqlTable(
  "flight_bookings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    flightId: varchar("flight_id", { length: 36 }).notNull(),
    passengers: json("passengers").notNull(),
    cabinClass: mysqlEnum("cabin_class", ["economy", "business", "firstClass"]).notNull(),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    status: mysqlEnum("status", ["pending", "confirmed", "cancelled"]).default("pending"),
    paymentStatus: mysqlEnum("payment_status", ["pending", "completed", "failed"]).default("pending"),
    bookingReference: varchar("booking_reference", { length: 50 }).unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    flightIdIdx: index("flight_id_idx").on(table.flightId),
  })
);

// ============================================
// PACKAGES & TOURS
// ============================================

export const packages = mysqlTable(
  "packages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    type: mysqlEnum("type", ["umrah", "hajj", "combined", "group"]).notNull(),
    duration: int("duration").notNull(),
    startDate: datetime("start_date"),
    endDate: datetime("end_date"),
    maxParticipants: int("max_participants"),
    currentParticipants: int("current_participants").default(0),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    includes: json("includes"),
    excludes: json("excludes"),
    itinerary: json("itinerary"),
    images: json("images"),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewCount: int("review_count").default(0),
    status: mysqlEnum("status", ["active", "inactive", "sold_out"]).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    typeIdx: index("type_idx").on(table.type),
    statusIdx: index("status_idx").on(table.status),
  })
);

export const packageBookings = mysqlTable(
  "package_bookings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    packageId: varchar("package_id", { length: 36 }).notNull(),
    numberOfParticipants: int("number_of_participants").notNull(),
    participants: json("participants").notNull(),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending"),
    paymentStatus: mysqlEnum("payment_status", ["pending", "completed", "failed"]).default("pending"),
    bookingReference: varchar("booking_reference", { length: 50 }).unique(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    packageIdIdx: index("package_id_idx").on(table.packageId),
  })
);

// ============================================
// TOURS & EXPERIENCES
// ============================================

export const tours = mysqlTable(
  "tours",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    duration: int("duration").notNull(),
    language: varchar("language", { length: 50 }).notNull(),
    guideId: varchar("guide_id", { length: 36 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    maxParticipants: int("max_participants"),
    currentParticipants: int("current_participants").default(0),
    images: json("images"),
    highlights: json("highlights"),
    schedule: json("schedule"),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewCount: int("review_count").default(0),
    status: mysqlEnum("status", ["active", "inactive"]).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    categoryIdx: index("category_idx").on(table.category),
    guideIdIdx: index("guide_id_idx").on(table.guideId),
  })
);

export const tourBookings = mysqlTable(
  "tour_bookings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    tourId: varchar("tour_id", { length: 36 }).notNull(),
    numberOfParticipants: int("number_of_participants").notNull(),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending"),
    paymentStatus: mysqlEnum("payment_status", ["pending", "completed", "failed"]).default("pending"),
    specialRequests: text("special_requests"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    tourIdIdx: index("tour_id_idx").on(table.tourId),
  })
);

// ============================================
// VISAS
// ============================================

export const visas = mysqlTable(
  "visas",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    country: varchar("country", { length: 100 }).notNull(),
    visaType: varchar("visa_type", { length: 100 }).notNull(),
    processingTime: int("processing_time"),
    validityDays: int("validity_days"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    requirements: json("requirements"),
    documents: json("documents"),
    description: text("description"),
    status: mysqlEnum("status", ["active", "inactive"]).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    countryIdx: index("country_idx").on(table.country),
  })
);

export const visaApplications = mysqlTable(
  "visa_applications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    visaId: varchar("visa_id", { length: 36 }).notNull(),
    applicationNumber: varchar("application_number", { length: 50 }).unique(),
    status: mysqlEnum("status", ["pending", "approved", "rejected", "processing"]).default("pending"),
    documents: json("documents"),
    notes: text("notes"),
    approvedDate: datetime("approved_date"),
    expiryDate: datetime("expiry_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    statusIdx: index("status_idx").on(table.status),
  })
);

// ============================================
// TRANSPORTATION
// ============================================

export const transportation = mysqlTable(
  "transportation",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    type: mysqlEnum("type", ["car", "bus", "van", "luxury"]).notNull(),
    capacity: int("capacity").notNull(),
    pricePerKm: decimal("price_per_km", { precision: 10, scale: 2 }).notNull(),
    pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    driver: json("driver"),
    amenities: json("amenities"),
    images: json("images"),
    status: mysqlEnum("status", ["available", "booked", "maintenance"]).default("available"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    typeIdx: index("type_idx").on(table.type),
    statusIdx: index("status_idx").on(table.status),
  })
);

export const transportationBookings = mysqlTable(
  "transportation_bookings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    transportationId: varchar("transportation_id", { length: 36 }).notNull(),
    pickupLocation: text("pickup_location").notNull(),
    dropoffLocation: text("dropoff_location").notNull(),
    pickupTime: datetime("pickup_time").notNull(),
    dropoffTime: datetime("dropoff_time"),
    distance: decimal("distance", { precision: 10, scale: 2 }),
    duration: int("duration"),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]).default("pending"),
    paymentStatus: mysqlEnum("payment_status", ["pending", "completed", "failed"]).default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    statusIdx: index("status_idx").on(table.status),
  })
);

// ============================================
// GUIDES
// ============================================

export const guides = mysqlTable(
  "guides",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    bio: text("bio"),
    experience: int("experience"),
    languages: json("languages"),
    certifications: json("certifications"),
    hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
    dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    availability: json("availability"),
    rating: decimal("rating", { precision: 3, scale: 2 }),
    reviewCount: int("review_count").default(0),
    totalBookings: int("total_bookings").default(0),
    images: json("images"),
    status: mysqlEnum("status", ["active", "inactive"]).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    ratingIdx: index("rating_idx").on(table.rating),
  })
);

export const guideBookings = mysqlTable(
  "guide_bookings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    guideId: varchar("guide_id", { length: 36 }).notNull(),
    startDate: datetime("start_date").notNull(),
    endDate: datetime("end_date").notNull(),
    numberOfDays: int("number_of_days"),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending"),
    paymentStatus: mysqlEnum("payment_status", ["pending", "completed", "failed"]).default("pending"),
    specialRequests: text("special_requests"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    guideIdIdx: index("guide_id_idx").on(table.guideId),
  })
);

// ============================================
// PAYMENTS & TRANSACTIONS
// ============================================

export const payments = mysqlTable(
  "payments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    bookingId: varchar("booking_id", { length: 36 }).notNull(),
    bookingType: varchar("booking_type", { length: 50 }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    paymentMethod: mysqlEnum("payment_method", ["card", "bank_transfer", "wallet", "apple_pay", "google_pay"]).notNull(),
    paymentGateway: varchar("payment_gateway", { length: 50 }),
    transactionId: varchar("transaction_id", { length: 100 }).unique(),
    status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export const invoices = mysqlTable(
  "invoices",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    invoiceNumber: varchar("invoice_number", { length: 50 }).unique(),
    paymentId: varchar("payment_id", { length: 36 }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("SAR"),
    items: json("items"),
    tax: decimal("tax", { precision: 10, scale: 2 }),
    discount: decimal("discount", { precision: 10, scale: 2 }),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
    dueDate: datetime("due_date"),
    paidDate: datetime("paid_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    statusIdx: index("status_idx").on(table.status),
  })
);

// ============================================
// REVIEWS & RATINGS
// ============================================

export const reviews = mysqlTable(
  "reviews",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    targetId: varchar("target_id", { length: 36 }).notNull(),
    targetType: mysqlEnum("target_type", ["hotel", "flight", "tour", "guide", "package"]).notNull(),
    rating: int("rating").notNull(),
    title: varchar("title", { length: 255 }),
    comment: text("comment"),
    images: json("images"),
    verified: boolean("verified").default(false),
    helpful: int("helpful").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    targetIdx: index("target_idx").on(table.targetId),
  })
);

// ============================================
// NOTIFICATIONS
// ============================================

export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    type: mysqlEnum("type", ["booking", "payment", "promotion", "system", "support"]).notNull(),
    relatedId: varchar("related_id", { length: 36 }),
    read: boolean("read").default(false),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    readIdx: index("read_idx").on(table.read),
  })
);

// ============================================
// SUPPORT & TICKETS
// ============================================

export const supportTickets = mysqlTable(
  "support_tickets",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    ticketNumber: varchar("ticket_number", { length: 50 }).unique(),
    subject: varchar("subject", { length: 255 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
    status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open"),
    assignedTo: varchar("assigned_to", { length: 36 }),
    attachments: json("attachments"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export const supportMessages = mysqlTable(
  "support_messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    ticketId: varchar("ticket_id", { length: 36 }).notNull(),
    senderId: varchar("sender_id", { length: 36 }).notNull(),
    message: text("message").notNull(),
    attachments: json("attachments"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    ticketIdIdx: index("ticket_id_idx").on(table.ticketId),
  })
);

// ============================================
// ANALYTICS & TRACKING
// ============================================

export const analytics = mysqlTable(
  "analytics",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    eventData: json("event_data"),
    page: varchar("page", { length: 255 }),
    referrer: varchar("referrer", { length: 255 }),
    userAgent: text("user_agent"),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    eventTypeIdx: index("event_type_idx").on(table.eventType),
  })
);

// ============================================
// ADMIN & SETTINGS
// ============================================

export const adminSettings = mysqlTable(
  "admin_settings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    key: varchar("key", { length: 100 }).unique().notNull(),
    value: text("value"),
    description: text("description"),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  }
);

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    adminId: varchar("admin_id", { length: 36 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    targetType: varchar("target_type", { length: 100 }),
    targetId: varchar("target_id", { length: 36 }),
    changes: json("changes"),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    adminIdIdx: index("admin_id_idx").on(table.adminId),
    actionIdx: index("action_idx").on(table.action),
  })
);

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(userSessions),
  hotelBookings: many(hotelBookings),
  flightBookings: many(flightBookings),
  packageBookings: many(packageBookings),
  tourBookings: many(tourBookings),
  visaApplications: many(visaApplications),
  transportationBookings: many(transportationBookings),
  guideBookings: many(guideBookings),
  payments: many(payments),
  reviews: many(reviews),
  notifications: many(notifications),
  supportTickets: many(supportTickets),
}));

export const hotelsRelations = relations(hotels, ({ many }) => ({
  rooms: many(hotelRooms),
  bookings: many(hotelBookings),
  reviews: many(reviews),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
  bookings: many(packageBookings),
  reviews: many(reviews),
}));

export const toursRelations = relations(tours, ({ many }) => ({
  bookings: many(tourBookings),
  reviews: many(reviews),
}));

export const guidesRelations = relations(guides, ({ many }) => ({
  bookings: many(guideBookings),
  reviews: many(reviews),
}));

export const supportTicketsRelations = relations(supportTickets, ({ many }) => ({
  messages: many(supportMessages),
}));
