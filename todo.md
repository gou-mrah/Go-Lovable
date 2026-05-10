# Go Umrah - Project TODO

## Foundation
- [x] Database schema for all 8 modules (15 tables)
- [x] Global CSS with luxury Islamic brand identity (Dark Teal, Gold, Peach-Beige)
- [x] Islamic geometric pattern SVG background texture
- [x] Google Fonts (Arabic + English typography: Playfair Display, Noto Naskh Arabic, Inter)
- [x] tRPC routers for all modules

## Homepage & Navigation
- [x] Top navigation with logo, all 8 module links, auth
- [x] Hero section with cinematic imagery and search CTA
- [x] Services grid showcasing all 8 pillars
- [x] Featured packages section
- [x] Testimonials section
- [x] Footer with links and contact info

## Hajj Programs Module
- [x] Hajj programs listing page with interactive cards
- [x] Dual portal (Internal/External) tab system
- [x] Dynamic pricing display with urgency badges
- [x] Booking flow for Hajj programs
- [x] tRPC procedures for Hajj CRUD

## Umrah Programs Module
- [x] Umrah programs listing page with visual cards
- [x] Dual portal (Internal/External) tab system
- [x] Amenity highlights and pricing tiers
- [x] Booking flow for Umrah programs
- [x] tRPC procedures for Umrah CRUD

## Hotel Booking Engine
- [x] Hotel search bar (destination, dates, guests)
- [x] Hotel listing with cards and filters
- [x] Google Maps integration showing proximity to Haram
- [x] Advanced filters (star rating, price range, amenities)
- [x] tRPC procedures for hotel CRUD

## Flight Booking Engine
- [x] Flight search form (origin, destination, dates, passengers)
- [x] Multi-destination support
- [x] Flight results with airline filters and price comparison
- [x] Flexible date search calendar
- [x] tRPC procedures for flight CRUD

## Visa Issuance Hub
- [x] Visa types gallery (Umrah, Hajj, Tourist, Transit)
- [x] Simplified application steps wizard
- [x] Application status tracking
- [x] tRPC procedures for visa CRUD

## Transportation Engine
- [x] Vehicle search (route, date, passengers)
- [x] Vehicle class selection (VIP car, van, bus)
- [x] Route planning and pricing calculator
- [x] Booking confirmation flow
- [x] tRPC procedures for transport CRUD

## Ziyarat Tours Hub
- [x] Tours search engine (location, date, type)
- [x] Visual tour cards with interactive itineraries
- [x] Guide profiles
- [x] Group booking options
- [x] tRPC procedures for tours CRUD

## E-commerce Store
- [x] Product gallery with categories
- [x] Shopping cart management
- [x] Checkout flow with order placement
- [x] Order management
- [x] tRPC procedures for store CRUD

## Admin Command Center
- [x] Admin dashboard overview with analytics stats
- [x] Hajj programs CRUD management
- [x] Umrah programs CRUD management
- [x] Hotel inventory management
- [x] Visa applications management
- [x] Transportation fleet management
- [x] Tours management
- [x] E-commerce inventory management
- [x] Real-time sync between admin and frontend (tRPC cache invalidation)
- [x] Role-based access control (admin only)

## Tests
- [x] Auth logout test (original template test)
- [x] 22 additional vitest tests covering all core procedures
- [x] Admin access control tests
- [x] Input validation tests
- [x] All 23 tests passing with zero TypeScript errors

## Phase 2 — Advanced Features

### Brand Integration
- [x] Upload Go Umrah logo to CDN and integrate in Navbar and Admin Dashboard
- [x] Refine brand colors to exact logo values: Dark Teal #1B5E52, Gold-Tan #C9A96E, Peach-Beige #F5EFE6
- [x] Add Islamic geometric pattern as subtle border/background element across UI

### Multi-Language Engine
- [x] Create LanguageContext with 6 languages: Arabic, English, Urdu, Turkish, Indonesian, French
- [x] Build comprehensive translation strings for all UI labels across 8 modules
- [x] Support RTL layout for Arabic and Urdu
- [x] Language switcher in Navbar (desktop + mobile)

### Multi-Currency Engine
- [x] Create CurrencyContext with 6 currencies: SAR, USD, EUR, GBP, PKR, INR
- [x] Integrate real-time exchange rate API (fetched server-side via tRPC)
- [x] Currency switcher in Navbar (desktop + mobile)
- [x] All prices across 8 modules update automatically with selected currency

### Admin Dashboard Enhancements
- [x] Add Localization & Pricing section to Admin Dashboard
- [x] CRUD for manual exchange rate offsets per currency
- [x] Translation management UI for key content strings
- [x] Currency-specific pricing fields on program/product creation forms

### UX Upgrades
- [x] Cards display localized content based on selected language
- [x] Cards display prices in selected currency with correct symbol
- [x] Mobile-optimized language and currency selectors

## Phase 3 — EGP & Arabic Typography

- [x] Add Egyptian Pound (EGP) to CurrencyContext (symbol, rate, label)
- [x] Add EGP to server localization router exchange rates
- [x] Add EGP to Navbar currency switcher dropdown
- [x] Add EGP to Admin Localization & Pricing section
- [x] Upgrade Arabic fonts: add Amiri, Amiri Quran, Scheherazade New, and Reem Kufi from Google Fonts
- [x] Apply premium Arabic font to all Arabic text elements (headings, Bismillah, labels)
- [x] Update CSS font-family variables for Arabic content with utility classes

## Phase 4 — Full Localization & Cairo/Tajwal Fonts

- [x] Add Cairo and Tajwal fonts from Google Fonts to index.html
- [x] Apply Cairo/Tajwal font globally when Arabic language is selected (body-level font switch)
- [x] Expand LanguageContext with complete translations for all 8 modules
- [x] Apply t() translations to all text in Navbar and Footer
- [x] Apply t() translations to all text in Home page

## Phase 5 — Elite Production Features

- [x] Advanced Admin Analytics Dashboard (revenue, conversion, seasonal forecast)
- [x] Native Asset Manager with S3 upload
- [x] Excel/CSV/JSON data export
- [x] Local Hajj Nusuk portal (read-only information)
- [x] Voucher/QR page at /voucher
- [x] SEO metadata for all 9 pages with JSON-LD structured data
- [x] Dynamic pricing rules UI in admin
- [x] Reviews moderation in admin

## Phase 6 — Complete Missing Elite Features

- [x] Set Arabic as default language (fix localStorage default to "ar")
- [x] Implement Passport OCR integration using LLM vision API
- [x] Create PassportUpload component for international Hajj/Umrah bookings
- [x] Add passport OCR server endpoint in routers.ts
- [x] Build automated PDF voucher generation on booking creation (server-side)
- [x] Update BookingModal to show voucher download link after booking
- [x] Add domestic Umrah train booking page (/umrah/train)
- [x] Create train search and booking UI with Haramain Railway stations
- [x] Add train booking server endpoints (search, create, list)
- [x] Activate dynamic pricing engine with real-time price calculation in booking flow
- [x] Implement internal/external portal distinction with clear UI on Hajj/Umrah pages
- [x] Add multi-country logic for international bookings (nationality, visa requirements)

## Phase 7 — توحيد لوحة التحكم

- [x] حذف صفحة AdminAdvanced وإزالة مساراتها من App.tsx
- [x] دمج Analytics Dashboard في لوحة التحكم الرئيسية
- [x] دمج Asset Manager في لوحة التحكم الرئيسية
- [x] دمج Export Tools في لوحة التحكم الرئيسية
- [x] دمج Dynamic Pricing Rules في لوحة التحكم الرئيسية
- [x] دمج Reviews Moderation في لوحة التحكم الرئيسية
- [x] دمج Localization & Currency في لوحة التحكم الرئيسية
- [x] إزالة رابط "مركز القيادة المتقدم" من Navbar/Admin

## Phase 8 — تطبيق خط Tajawal

- [x] إضافة Tajawal بجميع الأوزان (200-900) في index.html من Google Fonts
- [x] تطبيق Tajawal كخط افتراضي عالمي في index.css على جميع العناصر
- [x] إزالة الخطوط القديمة المتعارضة وتوحيد font-family

## Phase 9 — إعادة هيكلة قسم الحج

- [x] إضافة جدول hajj_companies (شركات حجاج الداخل)
- [x] إضافة جدول hajj_company_reviews (تقييمات الشركات)
- [x] إضافة جدول hajj_notifications (إشعارات وأخبار الداخل)
- [x] إضافة حقل country/city لجدول hajj_international_packages (باقات الخارج)
- [x] إضافة روترات hajjDomestic وhajjInternational في الخادم
- [x] بناء صفحة Hajj.tsx بقسمين فرعيين (تبويبات الداخل/الخارج)
- [x] قسم الداخل: باقات نسك + شركات + تقييم موثوق + أخبار وإشعارات
- [x] قسم الخارج: باقات دولية مع فلتر الدولة والمدينة
- [x] حذف قسم hajj-vertical من لوحة التحكم
- [x] إضافة إدارة شركات الداخل وباقات الخارج في لوحة التحكم

## Phase 10 — دمج قسم Hajj Programs في لوحة التحكم

- [x] دمج HajjDomesticAdmin وHajjInternationalAdmin تحت قسم "hajj" بتبويبات داخلية
- [x] حذف "hajj-domestic" و"hajj-international" من AdminSection type والـ SIDEBAR
- [x] تحديث renderSection لعرض القسم الموحد

## Phase 11 — استكمال النواقص حسب الوصف النهائي

### قسم العمرة
- [ ] إضافة تبويبي "معتمرو الداخل" و"معتمرو الخارج" في صفحة Umrah.tsx
- [ ] معتمرو الداخل: عرض برامج حسب مدينة الانطلاق + نموذج حجز بسيط
- [ ] معتمرو الخارج: عرض برامج دولية + فلتر الدولة/القارة + نموذج طلب حجز
- [ ] تحديث UmrahAdmin في لوحة التحكم: تبويبات داخل/خارج + عرض الحجوزات

### قسم الحج
- [x] إعادة كتابة صفحة Hajj.tsx بتصميم محسّن وبسيط
- [x] قسم حجاج الداخل: باقات نسك + شركات مرخصة + أخبار وإشعارات
- [x] بطاقات شركات الحج مع تقييمات موثوقة (التحقق برقم الحجز)
- [x] نموذج تقييم الشركات مع حماية من التقييمات المزيفة
- [x] نموذج اشتراك في أخبار الحج (إيميل/واتساب)
- [x] قسم حجاج الخارج: باقات دولية مع فلتر الدولة والمدينة
- [x] نموذج طلب حجز للباقات الدولية
- [x] تبويب سريع للدول المتاحة

### الذكاء الاصطناعي
- [ ] إضافة مساعد ذكي (Chatbot) في صفحات الحج والعمرة
- [ ] إضافة قسم "توصيات ذكية" في الداشبورد (تحليل الحجوزات)

## Phase 12 — تطوير الداشبورد بأسلوب زد

- [x] بطاقات إحصاء مع مخططات خطية صغيرة (sparklines): الزيارات، الطلبات، معدل التحويل، الطلبات المعلقة
- [x] قسم "أحدث الحجوزات" كجدول مع حالة الطلب ومؤشرات اللون
- [x] قسم "تتبع الأهداف" مع شريط تقدم ومقارنة شهري/سنوي
- [x] قسم "تقييمات العملاء" مع إجمالي التقييمات والمنشورة وقيد المراجعة
- [x] قسم "الباقات المتاحة" بتفصيل عدد باقات كل خدمة
- [x] تحديث الشريط الجانبي: قابل للطي مع توسيع المحتوى تلقائياً + tooltips عند الطي
- [x] ترجمة تسميات الشريط الجانبي إلى العربية بالكامل
- [x] تحسين ترويسة الداشبورد: تاريخ اليوم + رسالة ترحيب + فلتر الفترة الزمنية
- [x] إجراءات سريعة (Quick Actions) للوصول السريع للمهام الشائعة

## Phase 13 — تطوير شامل للمنصة

### محرك البحث الشامل
- [x] بناء مكون UniversalSearch شامل في الصفحة الرئيسية (تبويبات: حج، عمرة، فنادق، رحلات، تأشيرة، مواصلات، جولات)
- [x] كل تبويب يعرض حقول بحث مخصصة لنوع الخدمة
- [x] نتائج البحث تنتقل للصفحة المناسبة مع المعاملات في URL
- [ ] دعم البحث الصوتي والاقتراحات الذكية (مستقبلي)

### تطوير بطاقات الأقسام
- [ ] إعادة تصميم بطاقات الحج بأسلوب احترافي (صورة + تفاصيل + سعر + زر حجز)
- [ ] إعادة تصميم بطاقات العمرة بنفس الأسلوب
- [ ] إعادة تصميم بطاقات الفنادق مع تقييم النجوم والمسافة من الحرم
- [ ] إعادة تصميم بطاقات الرحلات الجوية مع تفاصيل الرحلة
- [ ] إعادة تصميم بطاقات التأشيرات مع خطوات التقديم
- [ ] إعادة تصميم بطاقات المواصلات مع نوع المركبة والسعة
- [ ] إعادة تصميم بطاقات الجولات مع الخريطة والمدة
- [ ] إعادة تصميم بطاقات المتجر مع صور المنتجات والتقييمات

### قسم الطلبات المرنة
- [x] إنشاء صفحة /flexible-request للعملاء بتصميم احترافي
- [x] نموذج طلب مرن: نوع الخدمة، الميزانية، التواريخ، عدد الأشخاص، ملاحظات خاصة
- [x] إضافة جدول flexibleRequests في قاعدة البيانات
- [x] إضافة روتر flexibleRequest في الخادم (create, list, updateStatus, stats)
- [x] إضافة إدارة الطلبات المرنة في لوحة التحكم (FlexibleRequestsAdmin)
- [x] إضافة رابط "طلب مرن" في شريط التنقل الرئيسي
- [x] ترجمة الرابط لجميع اللغات الست

### تفعيل لوحة التحكم
- [x] إدارة الفنادق (CRUD كامل موجود)
- [x] إدارة الرحلات (CRUD كامل موجود)
- [x] إدارة التأشيرات (CRUD كامل موجود)
- [x] إدارة المواصلات (CRUD كامل موجود)
- [x] إدارة الجولات (CRUD كامل موجود)
- [x] إدارة المتجر (CRUD كامل موجود)
- [x] إدارة الحجوزات (عرض + تحديث الحالة موجود)
- [x] إدارة المستخدمين (موجود)
- [x] إدارة الطلبات المرنة في لوحة التحكم (مضاف جديداً)

## Phase 14 — تحسينات متقدمة

### تحسين بطاقات الأقسام
- [x] إعادة تصميم بطاقات الحج (صورة كاملة، شارات، تفاصيل، سعر، زر حجز) - NusukPackageCard + IntlPackageCard
- [x] إعادة تصميم بطاقات العمرة بنفس الأسلوب الاحترافي - UmrahCard
- [x] إعادة تصميم بطاقات الفنادق مع تقييم النجوم والمسافة من الحرم - HotelCard

### إشعارات الطلبات المرنة
- [x] إضافة notifyOwner في flexibleRequest.create عند وصول طلب جديد
- [x] تضمين تفاصيل الطلب (الاسم، الخدمة، الميزانية، التواريخ) في الإشعار

### صفحة تأكيد الطلب المرن
- [x] بناء صفحة تأكيد احترافية مع رقم مرجعي واضح
- [x] عرض خطوات ما بعد الإرسال (مراجعة الطلب، إعداد العرض، التواصل)
- [x] إضافة قنوات التواصل (4 طرق: هاتف، واتساب، بريد، دعم 24/7)
- [x] التنقل التلقائي لصفحة التأكيد بعد إرسال الطلب بنجاح

## Phase 15 — إصلاح أعطال لوحة التحكم ✔️

- [x] إصلاح الإجراءات السريعة (Quick Actions) - مربوطة بـ onNavigate للتنقل بين الأقسام
- [x] مزامنة الإحصائيات مع admin.stats + analytics.userStats + hajjBooking.list + umrahBooking.list
- [x] إصلاح زر "إضافة فندق" - HotelsAdmin مع نموذج إضافة/تعديل/حذف كامل
- [x] إضافة زر "إضافة تأشيرة" - VisaAdmin مع إدارة أنواع التأشيرات + طلبات التأشيرات
- [x] إصلاح قسم المستخدمين - بيانات حقيقية من قاعدة البيانات
- [x] ربط إدارة المستخدمين بالصلاحيات (admin/user) مع تخصيص الأدوار عبر dialog
- [x] إضافة تصدير بيانات المستخدمين (CSV) + إحصائيات المشرفين/المستخدمين
- [x] تفعيل إضافة تقييمات يدوياً في مركز التقييمات (dialog كامل)
- [x] تفعيل استيراد تقييمات من ملف CSV مع مثال التنسيق

## Phase 16 — إعادة تصميم بطاقات الخدمات الرئيسية ✔️

- [x] إعادة تصميم بطاقات الخدمات الثمانية بتدرجات لونية داكنة وأيقونات بيضاء على خلفية ملونة
- [x] إضافة تأثيرات hover سينمائية (scale + translate + glow)
- [x] تحسين عرض الإحصائيات بشارة زجاجية شفافة فوق الخلفية الملونة
- [x] تحسين خلفية قسم الخدمات بتدرج لوني ونمط هندسي إسلامي + خطوط ذهبية

## Phase 17 — تطوير صفحات الخدمات وإضافة المساعد الذكي ✔️

### تبويبات العمرة
- [x] تبويبات "معتمرو الداخل" و"معتمرو الخارج" موجودة بالفعل في صفحة العمرة
- [x] تصفية الباقات حسب نوع المعتمر (portalType: domestic/international)

### المساعد الذكي
- [x] بناء مكون PilgrimAIAssistant كزر عائم مع سياق خاص بالحج/العمرة
- [x] دمج المساعد الذكي في صفحة الحج
- [x] دمج المساعد الذكي في صفحة العمرة

### إعادة تصميم صفحات الخدمات
- [x] إعادة تصميم بطاقات الرحلات (Flights) - هيدر ملون مع شريط الطيران + تفاصيل الرحلة
- [x] إعادة تصميم بطاقات التأشيرة (Visa) - هيدر ملون حسب نوع التأشيرة + مؤشرات المعالجة
- [x] إعادة تصميم بطاقات المواصلات (Transport) - تدرج لوني حسب نوع المركبة + تفاصيل السعة
- [x] إعادة تصميم بطاقات الجولات (Tours) - صورة كاملة مع تدرج لوني داكن + برنامج الجولة

## Phase 18 — إعادة تصميم بطاقات الخدمات (شفاف + إيموجي + حركة) ✔️

- [x] إعادة تصميم ServiceCard بأسلوب glassmorphism شفاف مع خلفية فاتحة دافئة
- [x] إضافة إيموجي مناسب لكل خدمة (🕌🌙🏨✈️📋🚌🗺️🛍️)
- [x] إضافة حركة hover سلسة: تكبير الإيموجي + دوران خفيف + توهج لوني + تكبير شارة العدد
- [x] كل بطاقة لها لون accent خاص بها وخلفية شفافة متناسقة

## Phase 19 — لوحة مزودي الخدمات + نماذج مرنة + تطوير المتجر

### لوحة مزودي الخدمات
- [ ] إضافة دور `provider` في جدول المستخدمين
- [ ] إنشاء جدول `provider_profiles` لبيانات مزود الخدمة
- [ ] إنشاء جدول `provider_programs` للبرامج المقدمة
- [ ] إضافة روتر `provider` في الخادم (إدارة البرامج + استقبال الطلبات)
- [ ] بناء صفحة `/provider` - لوحة تحكم مزود الخدمة
- [ ] نموذج إضافة/تعديل برنامج مرن (حج/عمرة/فنادق/جولات)
- [ ] قسم "طلباتي" لعرض الحجوزات الواردة ومعالجتها
- [ ] إضافة رابط لوحة مزود الخدمة في شريط التنقل

### نماذج مرنة (Dynamic Forms)
- [ ] بناء مكون `DynamicForm` قابل للتخصيص (إضافة/حذف/ترتيب الحقول)
- [ ] تطبيق DynamicForm على نموذج إضافة برنامج عمرة في لوحة التحكم
- [ ] تطبيق DynamicForm على نموذج إضافة برنامج حج في لوحة التحكم
- [ ] تطبيق DynamicForm على نموذج الطلب المرن للعميل

### تطوير المتجر
- [ ] إضافة تصفية المنتجات حسب الفئة والسعر
- [ ] عرض تقييمات المنتجات على البطاقة
- [ ] إضافة للسلة مباشرة من البطاقة
- [ ] صفحة سلة المشتريات مع إمكانية التعديل
- [ ] نظام إتمام الطلب (checkout)

## Phase 19 — Service Provider Dashboard & Navigation Updates

- [x] Add provider role to users table enum in schema
- [x] Create providerProfiles table (company info, license, contact, status)
- [x] Create providerPrograms table (program details, pricing, availability, custom fields)
- [x] Create providerBookings table (booking ref, customer info, status, payment)
- [x] Run database migration (pnpm db:push)
- [x] Create providerProcedure middleware (provider/admin access guard)
- [x] Build providerRouter with full CRUD: getProfile, upsertProfile, listPrograms, createProgram, updateProgram, deleteProgram, listBookings, updateBookingStatus, getStats, listPublicPrograms, bookProgram, adminListProviders, adminUpdateProviderStatus
- [x] Register provider router in appRouter
- [x] Build ProviderDashboard page (/provider) with 4 sections: Overview, Programs, Bookings, Profile
- [x] Collapsible sidebar with Arabic labels in ProviderDashboard
- [x] Statistics cards (total programs, active programs, total bookings, pending bookings)
- [x] Program creation form with dynamic fields (features/inclusions/exclusions as multiline text)
- [x] Program edit/delete with confirmation dialog
- [x] Toggle program active/inactive status
- [x] Booking management with status filter and status update buttons
- [x] Provider profile form with company info, contact details, license
- [x] Add /provider route to App.tsx
- [x] Add provider link to Navbar (visible for provider and admin roles)
- [x] Add provider link to user dropdown menu
- [x] All 23 tests still passing, 0 TypeScript errors

## Phase 20 — نظام تسجيل المزودين والصلاحيات المرنة

### قاعدة البيانات
- [x] إضافة جدول providerApplications (طلبات الانضمام كمزود)
- [x] إضافة جدول roles (الأدوار المخصصة)
- [x] إضافة جدول permissions (الصلاحيات لكل قسم)
- [x] إضافة جدول userPermissions (صلاحيات المستخدم المخصصة)
- [x] تشغيل pnpm db:push

### الباك إند
- [x] إضافة providerApplicationRouter: submitApplication, getMyApplication, adminList, adminReview (approve/reject + ترقية الدور تلقائياً), adminStats
- [x] إضافة rolesPermissionsRouter: listRoles, createRole, updateRole, deleteRole, listSections, listUsersWithPermissions, getUserPermissions, setUserPermissions, updateUserRole, deleteUser
- [x] تسجيل الروترات الجديدة في appRouter

### الفرونت إند — نموذج الانضمام
- [x] إضافة بانر/بطاقة "انضم إلينا كمزود خدمة" في الصفحة الرئيسية للمستخدمين المسجلين
- [x] بناء نموذج JoinAsProviderModal بجميع بيانات الشركة
- [x] عرض حالة الطلب (قيد المراجعة / مقبول / مرفوض)
- [x] إضافة id="join-provider" للربط من قائمة المستخدم

### لوحة الأدمن — إدارة طلبات المزودين
- [x] قسم "طلبات المزودين" في لوحة التحكم (ProviderApplicationsAdmin)
- [x] جدول الطلبات مع تفاصيل الشركة وزر الموافقة/الرفض
- [x] عند الموافقة: ترقية دور المستخدم تلقائياً إلى provider
- [x] إحصائيات طلبات المزودين (إجمالي / منتظر / موافق / مرفوض)

### لوحة الأدمن — إدارة الأدوار والصلاحيات
- [x] قسم "الأدوار والصلاحيات" في لوحة التحكم (RolesPermissionsAdmin)
- [x] إنشاء/تعديل/حذف الأدوار مع تلوين مخصص
- [x] مصفوفة الصلاحيات: كل قسم × (عرض / إضافة / تعديل / حذف)
- [x] تعيين صلاحيات مخصصة لكل مستخدم

### لوحة الأدمن — إدارة المستخدمين المحسّنة
- [x] تحسين قسم المستخدمين: عرض الدور + الصلاحيات المخصصة
- [x] تغيير دور المستخدم مباشرة من الجدول (Select dropdown)
- [x] تعيين صلاحيات مخصصة لمستخدم بعينه
- [x] حذف المستخدمين من لوحة الصلاحيات
- [x] إضافة "انضم كمزود خدمة" في قائمة المستخدم المنسدلة في Navbar
- [x] 23 اختبار ناجحة، 0 أخطاء TypeScript

## Phase 21 — ربط الصلاحيات + إشعارات المزودين + برامج المزودين العامة

### ربط الصلاحيات بالباك إند
- [x] بناء middleware `permissionGuard(section, action)` يفحص userPermissions في قاعدة البيانات
- [x] تطبيق الـ middleware على إجراءات الأدمن عبر `makeAdminProcedure(section, action)`
- [x] إضافة helper `checkPermission(userId, section, action)` في server/routers.ts

### إشعارات المزودين
- [x] إرسال إشعار للأدمن عند تقديم طلب مزود جديد (notifyOwner)
- [x] إرسال إشعار للمستخدم عند الموافقة على طلبه (ترقية إلى مزود)
- [x] إرسال إشعار للمستخدم عند رفض طلبه مع سبب الرفض

### برامج المزودين العامة
- [x] تحسين procedure `provider.listPublicPrograms` مع join بيانات الشركة
- [x] دمج برامج المزودين في صفحة العمرة (Umrah.tsx) مع مكون ProviderProgramsSection
- [x] دمج برامج المزودين في صفحة الحج (Hajj.tsx)
- [x] دمج برامج المزودين في صفحة الفنادق (Hotels.tsx)
- [x] دمج برامج المزودين في صفحة الجولات (Tours.tsx)
- [x] دمج برامج المزودين في صفحة المواصلات (Transport.tsx)
- [x] دمج برامج المزودين في صفحة الرحلات الجوية (Flights.tsx)
- [x] دمج برامج المزودين في صفحة التأشيرة (Visa.tsx)
- [x] شارة "مزود معتمد" + اسم الشركة على بطاقات برامج المزودين
- [x] 23 اختبار ناجحة، 0 أخطاء TypeScript

## Phase 22 — رفع الصور والملفات الحقيقي (Upload)

- [ ] بناء مكون ImageUpload مشترك مع رفع إلى S3 وعرض معاينة
- [ ] إضافة endpoint `/api/upload` في الباك إند لرفع الصور إلى S3
- [ ] استبدال حقول رابط الصورة بـ ImageUpload في نماذج الأدمن (برامج الحج، العمرة، الفنادق، المواصلات، الجولات، المتجر)
- [ ] استبدال حقول رابط الصورة بـ ImageUpload في لوحة المزود (إضافة برنامج)
- [ ] تحويل رفع ملف التقييمات في مركز التقييمات إلى Upload حقيقي
- [ ] إضافة زر "استيراد مستخدمين" في قسم المستخدمين مع رفع ملف CSV/Excel
- [ ] معالجة ملف CSV/Excel في الباك إند وإنشاء المستخدمين تلقائياً

## Phase 22 ✅ — رفع الصور والملفات الحقيقي

- [x] بناء مكون `ImageUpload` مشترك مع drag-and-drop، معاينة، وحذف، ورفع إلى S3
- [x] استبدال حقول رابط الصورة في برامج الحج، العمرة، الجولات، المتجر، الفنادق، المواصلات
- [x] استبدال حقول رابط الصورة في شركات الحج الداخلي (شعار + غلاف) وباقات الحج الدولي
- [x] استبدال حقل رابط الصورة في لوحة المزود (نموذج البرنامج)
- [x] تحويل استيراد التقييمات من Textarea إلى رفع ملف drag-and-drop (CSV/Excel)
- [x] إضافة زر "استيراد مستخدمين" في قسم إدارة المستخدمين مع معاينة البيانات
- [x] إصلاح timeout في اختبار hajj.list — 23 اختبار ناجح، 0 أخطاء TypeScript

## Phase 23 — المركز الإعلامي

- [ ] إضافة جدول media_posts في قاعدة البيانات (نوع، تصنيف، عنوان، محتوى، صورة، مؤلف، تاريخ، حالة النشر، مثبت)
- [ ] إضافة mediaRouter: list, getById, create, update, delete, togglePublish, togglePin
- [ ] بناء صفحة /media (المركز الإعلامي) مع فلتر النوع (أخبار/تنبيهات/مقالات/إعلانات) والتصنيف (حج/عمرة/فنادق/طيران/تأشيرة/متجر/جولات)
- [ ] إضافة شريط أخبار متحرك (ticker) في الصفحة الرئيسية يعرض آخر التنبيهات والإعلانات
- [ ] إضافة قسم "آخر الأخبار" في الصفحة الرئيسية
- [ ] إضافة قسم MediaCenterAdmin في لوحة التحكم مع CRUD كامل
- [ ] إضافة رابط "المركز الإعلامي" في شريط التنقل

## Phase 23 ✅ — المركز الإعلامي

- [x] جدول `media_posts` في قاعدة البيانات (type, category, isPinned, isBreaking, isPublished, views)
- [x] بيانات تجريبية (5 منشورات)
- [x] `mediaRouter` بـ 6 إجراءات: list, getBreaking, getById, create, update, delete
- [x] صفحة `/media` عامة مع فلترة حسب النوع والقسم وبحث نصي
- [x] مكون `BreakingNewsTicker` شريط أخبار متحرك في الصفحة الرئيسية
- [x] قسم "أحدث الأخبار" في الصفحة الرئيسية
- [x] قسم `MediaCenterAdmin` في لوحة الأدمن مع إنشاء/تعديل/حذف/نشر/تثبيت/عاجل
- [x] رابط "المركز الإعلامي" في شريط التنقل (جميع اللغات)
- [x] 23 اختبار ناجح، 0 أخطاء TypeScript

## Phase 24 — تطوير الذكاء الاصطناعي

### الباك إند — شات متخصص
- [x] بناء `aiChatRouter` مع system prompt شامل لكل أقسام المنصة
- [x] streaming support للردود الفورية
- [x] حفظ سياق المحادثة (conversation history)
- [x] اقتراحات استباقية بناءً على سياق الصفحة الحالية

### الباك إند — مولّد المحتوى للأدمن
- [x] `aiContentRouter.generateContent` — يولّد عنوان + وصف + مميزات + سعر مقترح
- [x] `aiContentRouter.generateImage` — يولّد صورة مناسبة للبرنامج/المنتج
- [x] `aiContentRouter.improveText` — يحسّن نص موجود

### الفرونت إند — شات محسّن
- [x] أزرار سريعة للأسئلة الشائعة (باقات العمرة، تكلفة الحج، التأشيرة...)
- [x] مؤشر الكتابة (typing indicator)
- [x] اقتراحات استباقية في بداية المحادثة
- [x] دعم الردود المتدفقة (streaming)

### الفرونت إند — مساعد الأدمن
- [x] زر "اقتراح بالذكاء الاصطناعي" في نماذج إضافة البرامج والباقات
- [x] توليد صورة تلقائي بضغطة زر
- [x] تحسين النص الموجود بضغطة زر

## Phase 25 — Executive Requirements Implementation

### Hero Ads Carousel
- [x] hero_ads table in DB (title, subtitle, mediaUrl, mediaType, linkUrl, sortOrder, isActive)
- [x] heroAdsRouter: list (public), listAll (admin), create, update, delete
- [x] HeroCarousel component with auto-play, dots, arrows, gradient overlay
- [x] Home.tsx hero section replaced with HeroCarousel
- [x] HeroAdsAdmin panel in admin sidebar with full CRUD

### Dynamic Search Engine
- [x] search_fields_config table in DB (serviceTab, fieldKey, labelAr, labelEn, fieldType, sortOrder, isEnabled)
- [x] searchConfigRouter: list (public), listAll (admin), create, update, delete
- [x] SearchSettingsAdmin panel in admin sidebar with inline editing per service tab
- [x] Default search fields seeded for all 7 service tabs

### Admin Sub-sections (Programs + Bookings tabs)
- [x] UmrahAdmin: Programs tab + Bookings tab (SectionBookingsTab)
- [x] ToursAdmin: Programs tab + Bookings tab
- [x] HotelsAdmin: Hotels tab + Bookings tab
- [x] FlightsAdmin: Flights tab + Bookings tab
- [x] TransportAdmin: Vehicles tab + Bookings tab
- [x] SectionBookingsTab reusable component with search, status filter, status update
- [x] bookings.getByRef procedure for voucher lookup

### Voucher Improvement
- [x] Voucher.tsx fetches real booking data via trpc.bookings.getByRef
- [x] Service-specific inclusions list per type (hajj, umrah, hotel, flight, visa, transport, tour, store)
- [x] Service-specific icon and color per type
- [x] Status badge with correct color (confirmed=green, pending=amber, cancelled=red)
- [x] Loading state while fetching booking
- [x] Falls back to demo data if no booking found

## Phase 26 — Hero Section Full Redesign
- [x] HeroCarousel: full-width, full-height (100vh), image fills entire hero area
- [x] Remove all existing hero text (رحلتك المقدسة, badges, subtitles)
- [x] Add "جو عمرة / Go Umrah" as large centered logo text over carousel
- [x] Add strong professional slogan below logo
- [x] Integrate search engine seamlessly at bottom of hero (overlapping carousel)
- [x] Dark gradient overlay on carousel for text readability

## Phase 27 — Fix Hero Ads Integration
- [ ] Carousel truly fills 100vw x 100vh as absolute background behind all content
- [ ] Brand text + slogan centered and readable over carousel images
- [ ] Search engine panel at bottom, visually connected to hero
- [ ] No white gaps, no layout breaks between carousel and content layers

## Phase 28 — 3-Zone Hero Redesign
- [ ] Top zone: brand name "جو عمرة" + slogan + stats on dark gradient background
- [ ] Middle zone: ads carousel as standalone image cards (separate from background, with rounded corners, shadow)
- [ ] Bottom zone: search engine panel (UniversalSearch) with glass/dark styling
- [ ] All 3 zones stack vertically inside the hero section filling 100svh

## Phase 30 — Search Frame & Scroll CTA
- [x] Improve search engine frame: premium glass/gold border styling
- [x] Add exploratory phrase below search with animated scroll-down arrow

## Phase 31 — Hero Fits Single Viewport
- [x] Compact hero so all content (brand + carousel + search + CTA) fits in 100svh without scroll

## Phase 32 — Fix Breaking News Ticker
- [x] Fix BreakingNewsTicker: diagnose why it's not working and repair data source + animation

## Phase 33 — Fix Ticker (Again)
- [ ] Fix BreakingNewsTicker: عاجل badge on right, scrolling text fills the bar correctly

## Phase 33 — Fix Breaking News Ticker (Final)
- [x] Fix BreakingNewsTicker: moved inside Navbar component (same z-index layer)
- [x] Fixed text color to explicit white (was inheriting dark CSS variable)
- [x] Removed conflicting fixed positioning that caused it to hide behind navbar

## Phase 34 — Hajj Admin Restructure ✅
- [x] Remove "الباقات العامة" tab from Hajj admin (HajjAdmin now shows Domestic/International tabs only)
- [x] حجاج الداخل: add Nusuk package types (مخيمات مطورة، غير مطورة، أبراج كدانة، أبراج منى، اقتصادية) — NUSUK_PACKAGE_TYPES in HajjNusukPackagesAdmin
- [x] حجاج الداخل: add priceSAR / priceFromSAR / priceToSAR fields for SAR pricing in hajj_programs schema
- [x] حجاج الداخل: company cards with full service rating system (averageRating, totalReviews, ratingService, ratingAccommodation, ratingTransport, ratingFood) in hajj_companies + hajj_company_reviews
- [x] حجاج الخارج: international programs management with all details (HajjInternationalAdmin with full CRUD)
- [x] حجاج الخارج: bookings/requests tab for international clients (HajjBookingRequestsAdmin)
- [x] Update DB schema with new fields and push migration (nusukPackageType, priceSAR, priceFromSAR, priceToSAR in hajj_programs; hajj_companies, hajj_company_reviews, hajj_domestic_notifications tables)

## Phase 35 — إصلاح حقول الإدخال + تفعيل الذكاء الاصطناعي في إدارة حجاج الداخل

- [x] إصلاح مشكلة حقول الإدخال في نموذج باقات نسك — تم استخراج NusukPackageForm كمكون منفصل مع key prop لمنع إعادة رسم الأب
- [x] تفعيل زر "اقتراح بالذكاء الاصطناعي" لتوليد عنوان + وصف + مميزات + سعر باقة نسك مع AIContentAssistant
- [x] تفعيل زر "توليد صورة بالذكاء الاصطناعي" لباقات نسك عبر AIContentAssistant
- [x] إصلاح تحليل السعر المقترح لاستخراج priceFromSAR/priceToSAR بشكل صحيح

## Phase 36 — إصلاح حقول الإدخال + تفعيل الذكاء الاصطناعي في إدارة حجاج الخارج

- [x] تشخيص مشكلة حقول الإدخال في نموذج HajjInternationalAdmin — السبب: PField معرَّف داخل الـ function component
- [x] استخراج نموذج حجاج الخارج كمكون منفصل IntlPackageForm مع key prop لمنع فقدان focus
- [x] إضافة AIContentAssistant (contentType="hajj_package") لتوليد النصوص والصور في نموذج برامج الحج الدولية

## Phase 37 — إصلاح خطأ التحقق في hajjInternational.add

- [x] إصلاح validation schema: جعل companyName, countryCode, countryEn, priceSAR, contactEmail, contactPhone, contactWhatsapp اختيارية — تم التحقق بحفظ باقة بالحقول الإلزامية فقط (عنوان + دولة + سعر)

## Phase 38 — نظام إدارة المسوقين والموردين والمبيعات ✅

- [x] تحديث قاعدة البيانات: إضافة جداول marketers, suppliers, sales_customers, sales_orders
- [x] إنشاء salesRouter.ts مع procedures كاملة (CRUD + stats) للمسوقين والموردين والطلبات والتقارير
- [x] بناء صفحة MarketersAdmin.tsx: إدارة المسوقين والموظفين مع رمز MKT-XXX، بيانات شخصية، تفاصيل وظيفة، إحصائيات
- [x] بناء صفحة SuppliersAdmin.tsx: قاعدة بيانات الموردين (أفراد وشركات) مع رمز SUP-XXX، الخدمات المقدمة
- [x] بناء صفحة SalesOrdersAdmin.tsx: إدارة الطلبات مع ربط العميل + المسوق + المورد + التفصيل المالي
- [x] بناء صفحة SalesReportsAdmin.tsx: التقارير المالية مع فلتر التاريخ، أداء المسوقين والموردين، توزيع العمولات
- [x] دمج الأقسام الأربعة في القائمة الجانبية للوحة التحكم (المسوقون، الموردون، طلبات المبيعات، التقارير المالية)
- [x] التحقق من عمل جميع الأقسام بدون أخطاء TypeScript

## Phase 39 — إصلاح خطأ SelectItem value فارغ

- [x] إيجاد وإصلاح <SelectItem value=""> في SalesOrdersAdmin (حقلا المسوق والمورد) — استبدل value="" بـ value="none"

## Phase 40 — دمج الموردين والمزودين في نظام موحد احترافي

- [x] تحديث جدول suppliers: إضافة 13 حقل جديد (companyName, licenseNumber, licenseFileUrl, commercialRegisterUrl, country, city, approvalStatus, referenceCode, وغيرها)
- [x] تحديث salesRouter: procedures للموافقة/الرفض (approve/reject)، رفع الملفات (uploadFile)، قائمة 41 دولة مع مدن ديناميكية
- [x] بناء SuppliersAdmin الجديد: قائمة دول العالم + مدن ديناميكية، رفع ملفات (PDF/صورة)، نظام الموافقة مع رسالة توضيحية
- [x] إزالة صفحة SuppliersAdmin القديمة واستبدالها بالجديدة الاحترافية (4 تبويبات + نظام موافقة كامل)

## Phase 41 — دمج طلبات الانضمام في الموردون + ربط أزرار الصفحة الرئيسية

- [x] إضافة تبويب "طلبات الانضمام" داخل SuppliersAdmin يعرض الموردين بحالة "تحت المراجعة" مع أزرار الاعتماد والرفض
- [x] إنشاء صفحة عامة /join-supplier لنموذج انضمام المزودين (بدون تسجيل دخول)
- [x] إنشاء صفحة عامة /join-marketer لنموذج انضمام المسوقين (بدون تسجيل دخول)
- [x] ربط زر "انضم كمزود خدمة" في الصفحة الرئيسية بصفحة /join-supplier
- [x] إضافة زر "انضم كمسوق" أسفل زر المزود وربطه بصفحة /join-marketer
- [x] إضافة المسارات الجديدة في App.tsx

## Phase 42 — حذف صفحة طلبات المزودين + بوابة المسوق

- [x] حذف صفحة /join-supplier العامة من App.tsx وإزالة الملف JoinSupplier.tsx
- [x] ربط زر "انضم كمزود خدمة" في الصفحة الرئيسية بصفحة الموردون في لوحة التحكم (/admin?section=suppliers)
- [x] إضافة زر "انضم كمسوق" أسفل زر المزود في الصفحة الرئيسية مرتبط بـ /join-marketer
- [x] إضافة دور "marketer" في قاعدة البيانات (جدول users - enum role)
- [x] تحديث سير الموافقة على المسوق: عند الاعتماد يتم منح دور "marketer" للمستخدم
- [x] بناء صفحة /marketer-portal: لوحة تحكم للمسوق المعتمد (طلباته، بياناته، عمولاته)
- [x] إضافة رابط "لوحة المسوق" في Navbar للمستخدمين ذوي دور marketer
- [x] حماية /marketer-portal بالتحقق من دور marketer

## Phase 43 — صفحة الغلق المتحركة وزر التحكم في لوحة الإدارة

- [x] إضافة جدول site_settings في قاعدة البيانات (isOpen, maintenanceMessage, maintenanceTitle)
- [x] إضافة settingsRouter في الخادم (getSiteStatus, updateSiteStatus - admin only)
- [x] إضافة زر غلق/فتح الموقع في لوحة التحكم مع حقل تعديل الرسالة
- [x] بناء صفحة MaintenancePage.tsx بخلفية متحركة للكعبة والطواف
- [x] إضافة شريط أذكار متحرك في أعلى صفحة الغلق
- [x] إضافة اسم "جو عمرة" بحجم كبير وسلوجان وعبارة "انتظروا منصة جو عمرة في حلتها الجديدة"
- [x] إضافة أزرار "انضم كمسوق" و"انضم كمقدم خدمة" تفتح النماذج مباشرة
- [x] إضافة زر تواصل عبر واتساب (0557123435) وإيميل (admin@go-umrah.com)
- [x] ربط صفحة الغلق بالتحقق من حالة الموقع عند تحميل التطبيق
- [x] السماح للمدير بالوصول للوحة التحكم حتى عند الغلق

## Phase 44 — إصلاح صفحة الغلق

- [x] إصلاح زر "انضم كمسوق" ليفتح نموذج التعبئة المضمّن في الصفحة
- [x] إصلاح زر "انضم كمقدم خدمة" ليفتح نموذج التعبئة المضمّن في الصفحة
- [x] إضافة شعار جو عمرة في صفحة الغلق
- [x] استبدال رسم SVG للكعبة بصورة فوتوغرافية عالية الجودة مع تأثير الطواف المتحرك

## Phase 45 — توحيد نماذج صفحة الغلق مع لوحة التحكم

- [x] استخراج نموذج "إضافة مسوق جديد" من MarketersAdmin وتحويله لمكوّن مستقل قابل للإعادة
- [x] استخراج نموذج "إضافة مورد/مزود جديد" من SuppliersAdmin وتحويله لمكوّن مستقل قابل للإعادة
- [x] تحديث MaintenancePage لاستخدام المكوّنين المستقلين بدلاً من النماذج البسيطة
- [x] التأكد من أن الطلبات المُرسلة من صفحة الغلق تظهر في قسم إدارة المسوقين
- [x] التأكد من أن الطلبات المُرسلة من صفحة الغلق تظهر في قسم إدارة الموردين
- [x] تحسين صورة الكعبة لإظهار الحشود الكبيرة حول الكعبة

## Phase 46 — تحسين صفحة الغلق (فيديو + تأثيرات + إصلاحات)

- [x] إيجاد ورفع فيديو عالي الجودة للطواف حول الكعبة
- [x] استبدال صورة الكعبة بفيديو الطواف كخلفية متحركة
- [x] إضافة تأثيرات متحركة على شعار جو عمرة (glow, pulse, fade-in)
- [x] إضافة تأثيرات متحركة على كلمة "جو عمرة" (shimmer, scale)
- [x] إزالة تكرار عبارة "انتظروا منصة جو عمرة في حلتها الجديدة"
- [x] تكبير أزرار "انضم كمسوق" و"انضم كمقدم خدمة" لتكون بنفس حجم أزرار التواصل
- [x] جعل أزرار الانضمام شفافة بألوان مغايرة (مثل أزرار التواصل)

## Phase 47 — تحسين صفحة الغلق (وضوح الشعار + توزيع المحتوى)

- [x] تحسين وضوح الشعار (إزالة الشفافية، تكبير الحجم، تعزيز التوهج)
- [x] إعادة توزيع المحتوى بشكل متوازن على كامل الصفحة
- [x] إزالة الهوامش والمسافات غير المتسقة

## Phase 48 — إصلاح القوائم المنسدلة في نماذج صفحة الغلق

- [x] مراجعة نموذج المسوق (MarketerForm) في صفحة الغلق وإصلاح القوائم المنسدلة
- [x] مراجعة نموذج مقدم الخدمة (SupplierForm) في صفحة الغلق وإصلاح القوائم المنسدلة
- [x] التحقق من z-index وPortal لمكونات Select داخل صفحة الغلق (z-[9999])

## Phase 49 — استبدال فيديو صفحة الغلق بجودة عالية

- [x] البحث عن فيديو عالي الجودة للكعبة أو الحرم المكي من مصادر مجانية
- [x] تحميل الفيديو ورفعه على CDN
- [x] تحديث MaintenancePage.tsx بالرابط الجديد

## Phase 50 — رفع الوثائق وإشعارات المدير

- [x] تحديث schema لإضافة حقول URLs للوثائق في جدول الموردين
- [x] إضافة tRPC endpoint لرفع الملفات إلى S3
- [x] تحديث router الموردين لحفظ روابط الوثائق وإرسال إشعار للمدير
- [x] تحديث router المسوقين لإرسال إشعار للمدير عند التسجيل
- [x] تحديث واجهة نموذج المورد لإضافة حقول رفع الوثائق القانونية
- [x] تشغيل db:push لتطبيق التغييرات على قاعدة البيانات

## Phase 51 — قائمة انتظار البريد الإلكتروني

- [x] إضافة جدول waitlist_emails في schema.ts
- [x] إنشاء tRPC procedures: subscribe (عام) + list/export (مدير)
- [x] إضافة حقل البريد الإلكتروني في صفحة الغلق مع تأكيد الاشتراك
- [x] إضافة صفحة إدارة قائمة الانتظار في لوحة التحكم
- [x] تشغيل db:push لتطبيق التغييرات

## Phase 52 — عداد تنازلي للإطلاق

- [x] إضافة حقل launch_date في جدول siteSettings
- [x] تحديث siteSettingsRouter لدعم قراءة وكتابة launch_date
- [x] إضافة حقل تاريخ الإطلاق في صفحة إعدادات الموقع بلوحة التحكم
- [x] بناء مكوّن CountdownTimer في صفحة الغلق
- [x] تشغيل db:push لتطبيق التغييرات

## Phase 53 — الريال السعودي والعربية كلغة رسمية

- [x] تغيير العملة الافتراضية من USD إلى SAR في CurrencyContext
- [x] تغيير اللغة الافتراضية من en إلى ar في LanguageContext
- [x] تغيير قيم currency الافتراضية في schema.ts من "USD" إلى "SAR"
- [x] تحديث convert() في CurrencyContext ليعمل من SAR بدلاً من USD
- [x] تحديث جميع حقول priceUSD/totalUSD في الفرونت اند لتعرض بالريال السعودي
- [x] تحديث SectionBookingsTab لعرض السعر بالريال السعودي
- [x] تحديث BookingModal لاستخدام SAR
- [x] تطبيق خطوط Cairo/Tajawal عند اختيار اللغة العربية
- [x] تشغيل db:push لتطبيق التغييرات على قاعدة البيانات

## Phase 54 — إعادة تصميم كروت الخدمات

- [x] إعادة تصميم ServiceCard بأسلوب Dark Luxury مع أيقونات Lucide وتدرجات داكنة
- [x] تحديث بيانات الخدمات الثمانية بألوان وأيقونات مميزة لكل خدمة
- [x] تحديث خلفية قسم الخدمات إلى لون داكن عميق يتناسب مع الكروت
- [x] تحديث ألوان عنوان القسم والنص للعمل على الخلفية الداكنة

## Phase 55 — تأثير Shimmer على كروت الخدمات

- [x] إضافة keyframe animation لـ shimmer في index.css
- [x] تطبيق عنصر shimmer على ServiceCard يتحرك عند hover

## Phase 56 — كروت زجاجية شفافة (Glassmorphism)

- [x] تحويل cardBg لكل الكروت إلى خلفية شفافة مع backdrop-blur
- [x] تحديث خلفية القسم لتظهر الشفافية بشكل جميل

## Phase 57 — إشعارات Social Proof في صفحة الغلق

- [x] إنشاء مكوّن SocialProofToast مع بيانات وهمية عشوائية
- [x] دمج المكوّن في صفحة الغلق (Coming Soon)

## Phase 58 — صوت الشيخ وعداد المسجلين في صفحة الغلق

- [x] رفع ملف MP3 لشيخ يتحدث عن فضل الحج والعمرة على CDN
- [x] إضافة مكوّن تشغيل الصوت التلقائي مع زر إيقاف/تشغيل وكتم الصوت
- [x] إضافة عداد متزايد لعدد المسجلين

## Phase 59 — قائمة تشغيل إسلامية كاملة في صفحة الغلق

- [x] جمع روابط جميع حلقات رحلة المشتاق (29 حلقة) للشيخ خالد أبو شادي
- [x] جمع روابط محاضرات الشيخ خالد السبت (9 حلقات حج السلف) وأحمد عبد المنعم
- [x] استخدام روابط media.islamway.net مباشرة بدلاً من CDN لضمان التوفر الدائم
- [x] بناء واجهة قائمة تشغيل كاملة (40 مقطع) مع التنقل بين المقاطع وتجميع حسب الشيخ

## Phase 60 — نظام إحصائيات حقيقي

- [x] إضافة جدول page_views في schema.ts لتتبع الزيارات (IP، دولة، صفحة، جهاز، وقت)
- [x] إضافة tRPC procedures للإحصائيات (trackPageView, visitorOverview, financialOverview, productOverview)
- [x] تسجيل كل زيارة صفحة من الفرونت عبر PageTracker component تلقائياً
- [x] كشف الدولة من IP باستخدام ip-api.com GeoIP مجانية
- [x] تحديث لوحة التحكم: عداد زيارات حقيقي + توزيع الدول + رسم بياني يومي
- [x] عكس إحصائيات المنتجات الحقيقية (عدد الباقات، الفنادق، الرحلات النشطة)
- [x] عكس إحصائيات الماليات الحقيقية (إجمالي الحجوزات، المدفوعات، المعلقة)
- [x] عكس إحصائيات المستخدمين الحقيقية (المسجلون، المسوقون، الموردون)

## Phase 61 — إصلاح قائمة التشغيل الصوتية

- [x] تشخيص سبب عدم عمل قائمة التشغيل: المشكلة في audio element عند تغيير src بدون إعادة إنشاء
- [x] إصلاح مشغّل الصوت: إضافة key prop على audio element لإعادة الإنشاء عند تغيير المقطع
- [x] استبدال دروس عشر ذي الحجة بسلسلة حج السلف للشيخ خالد السبت (9 حلقات عن الحج)

## Phase 62 — إصلاح نهائي لقائمة التشغيل الصوتية

- [x] تشخيص المشكلة: ملفات islamway تمنع CORS من التشغيل من مواقع خارجية
- [x] الحل: تحميل جميع الملفات ورفعها على CDN الخاص بالمشروع
- [x] اختبار التشغيل والانتقال بين المقاطع

## Phase 62b — إصلاح الضغط على مقطع من القائمة لا يشغّله

- [x] تشخيص سبب عدم تشغيل المقطع: مشكلة CORS من islamway
- [x] إعادة كتابة منطق selectTrack بروابط CDN الموثوقة

## Phase 63 — رفع ملفات الصوت على CDN لحل مشكلة CORS

- [x] تحميل 29 حلقة رحلة المشتاق من islamway محلياً
- [x] تحميل 9 حلقات حج السلف للشيخ خالد السبت محلياً
- [x] رفع 38 ملف على CDN (38/38 نجاح)
- [x] تحديث قائمة التشغيل بروابط CDN الجديدة


## Phase 64 — نظام أخبار الحج والعمرة التلقائي

- [x] إضافة جداول قاعدة البيانات: news_sources, news_articles
- [x] بناء tRPC procedures لإدارة المصادر والأخبار
- [x] بناء محرك جلب RSS تلقائي (setInterval كل 10 دقائق)
- [x] بناء قسم إدارة الأخبار في لوحة التحكم
- [x] بناء شريط أخبار متحرك في صفحة الغلق (تحت شريط الأذكار)
- [x] بناء شريط أخبار متحرك في الصفحة الرئيسية (تحت شريط عاجل)
- [x] اختبار النظام الكامل وحفظ checkpoint
- [x] عكس اتجاه شريط عاجل من اليسار لليمين
- [x] عكس اتجاه شريط الأذكار من اليسار لليمين
- [x] عكس اتجاه شريط أخبار الحج من اليسار لليمين

## نظام المصادقة المستقل — Go Umrah Auth
- [ ] إضافة حقول password_hash و email_verified و reset_token لجدول users
- [ ] تثبيت bcrypt و nodemailer
- [ ] بناء tRPC procedures: register, login, logout, me, forgotPassword, resetPassword
- [ ] بناء صفحة تسجيل الدخول بتصميم Go Umrah
- [ ] بناء صفحة إنشاء حساب جديد
- [ ] بناء صفحة نسيت كلمة المرور
- [ ] بناء صفحة إعادة تعيين كلمة المرور
- [ ] تحديث useAuth hook ليستخدم النظام الجديد
- [ ] إزالة زر تسجيل الدخول بـ Manus OAuth من الواجهة
- [ ] كتابة اختبارات vitest للنظام الجديد

## Phase 65 — ملف شخصي + ربط الحجوزات + تحقق البريد + تسجيل دخول Google
- [ ] إضافة حقل userId للحجوزات وربطها بالمستخدم
- [ ] إضافة حقول emailVerified, verificationToken للمستخدمين
- [ ] إضافة tRPC procedures: profile.get, profile.update, profile.changePassword, profile.getBookings
- [x] صفحة الملف الشخصي /profile (بيانات شخصية + حجوزات + تغيير كلمة المرور)
- [ ] تدفق تحقق البريد الإلكتروني (إرسال رمز عند التسجيل + صفحة تأكيد)
- [ ] تسجيل الدخول بـ Google OAuth (زر Google في صفحتي تسجيل الدخول والتسجيل)
- [ ] اختبارات vitest للميزات الجديدة

## Phase 66 — صفحة الأخبار المخصصة + رفع صورة الملف الشخصي + خدمة البريد الإلكتروني
- [x] إنشاء صفحة أخبار مخصصة /news مع فلترة وبحث وترقيم صفحات
- [x] إضافة رابط الأخبار في شريط التنقل مع ترجمة لجميع اللغات الست
- [x] إضافة tRPC procedure للبحث العام في الأخبار (searchArticles)
- [x] إضافة إمكانية رفع صورة الملف الشخصي (Avatar) مع S3 storage
- [x] إضافة uploadAvatar procedure في profileRouter مع التحقق من الحجم
- [x] تحديث ProfilePage لعرض overlay عند hover على الصورة لتغييرها
- [x] تثبيت Resend وإنشاء email.ts مع قوالب HTML احترافية
- [x] ربط خدمة البريد بـ forgotPassword في customAuthRouter
- [x] ربط خدمة البريد بـ sendVerification في profileRouter
- [x] إرسال بريد ترحيب عند التسجيل
- [x] كتابة اختبارات vitest لخدمة البريد (6 اختبارات تمر)

## Phase 67 — إصلاح صفحة تسجيل الدخول على الموقع المغلق
- [x] تشخيص المشكلة: SiteGuard كان يعرض صفحة الصيانة لجميع الصفحات بما فيها /login
- [x] إضافة قائمة ALWAYS_OPEN_ROUTES تشمل: /login, /register, /forgot-password, /reset-password, /verify-email, /admin
- [x] تحديث SiteGuard ليتحقق من القائمة قبل عرض صفحة الصيانة

## Phase 68 — إصلاح أخطاء لوحة التحكم وتسجيل الدخول بـ Google
- [x] إصلاح خطأ قاعدة البيانات: تغيير اسم العمود من totalPrice إلى totalUSD في استعلام financialOverview
- [x] إعداد VITE_GOOGLE_CLIENT_ID لتفعيل تسجيل الدخول بـ Google

## Phase 69 — استيراد أعضاء go-umrah.net
- [x] حذف المستخدمين الحاليين (غير الأدمن) من قاعدة البيانات
- [x] استيراد 5189 عضو من go-umrah.net بالاسم والإيميل والجوال

## Phase 70 — نظام إدارة الأعضاء الكامل
- [x] حذف الأعضاء الوهميين من قاعدة البيانات
- [x] إضافة حقل isBanned وbanReason لجدول المستخدمين
- [x] إضافة listUsersPaginated مع بحث وفلترة وترقيم صفحات
- [x] إضافة editUser - تعديل بيانات المستخدم
- [x] إضافة banUser/unbanUser - حظر ورفع الحظر
- [x] إضافة deleteUserById - حذف المستخدم
- [x] إضافة sendBulkEmail - مراسلة جماعية بالبريد مع 5 قوالب
- [x] إضافة sendWhatsAppBroadcast - رسائل واتساب جماعية
- [x] تحديث واجهة إدارة المستخدمين في لوحة التحكم


## Phase 70 — نظام إدارة الأعضاء الكامل
- [x] حذف الأعضاء الوهميين من قاعدة البيانات
- [x] إضافة حقل isBanned وbanReason لجدول المستخدمين
- [x] إضافة listUsersPaginated مع بحث وفلترة وترقيم صفحات
- [x] إضافة editUser - تعديل بيانات المستخدم
- [x] إضافة banUser/unbanUser - حظر ورفع الحظر
- [x] إضافة deleteUserById - حذف المستخدم
- [x] إضافة sendBulkEmail - مراسلة جماعية بالبريد مع 5 قوالب
- [x] إضافة sendWhatsAppBroadcast - رسائل واتساب جماعية
- [x] تحديث واجهة إدارة المستخدمين في لوحة التحكم

## Phase — تكامل التقييمات الحقيقية من زد

- [x] استبدال ReviewsHub في لوحة التحكم بعرض تقييمات customer_reviews الحقيقية مع pagination (20 تقييم/صفحة)
- [x] إضافة إحصاءات شاملة: إجمالي التقييمات، متوسط التقييم، توزيع النجوم بشريط تقدم
- [x] إضافة فلتر البحث باسم العميل وفلتر الحالة (منشورة/معلقة/مخفية)
- [x] إضافة إجراءات: نشر/إخفاء/حذف التقييمات الحقيقية
- [x] تحديث Overview Dashboard لاستخدام getStats بدلاً من listAll
- [x] تحسين الصفحة الرئيسية: testimonials تعرض productName من بيانات زد الحقيقية
- [x] إضافة شريط تقييمات خفيف في صفحة الصيانة (6 تقييمات 5 نجوم مع متوسط وإجمالي)
- [ ] الصفحة الرئيسية: عرض جميع التقييمات في شريط بطاقات متحرك من اليسار لليمين (marquee لا نهائي)
- [ ] اعتماد النقشة الإسلامية الجديدة (نجمة 8 رؤوس) كنقشة رسمية لكامل المشروع وإزالة النقشة القديمة
- [x] صفحة التسجيل: إضافة قائمة منسدلة لجميع الدول
- [x] صفحة التسجيل: إضافة خانة رقم الجوال مع مفتاح البلد التلقائي بعد اختيار الدولة
- [x] صفحة التسجيل: إضافة شريط تقدم يوضح نسبة اكتمال ملء البيانات
- [ ] اعتماد النقشة الإسلامية الجديدة (نجمة 8 رؤوس) كنقشة رسمية لكامل المشروع وإزالة جميع النقشات القديمة

## Phase — النقشة الإسلامية الرسمية (تحديث)

- [x] إعادة بناء النقشة الإسلامية: معين بأضلاع منحنية للداخل + نجمة 4 رؤوس صغيرة (بدون أي أشكال صليبية)
- [x] تطبيق النقشة عبر pseudo-element ::before بحيث لا تؤثر الشفافية على المحتوى
- [x] تطبيق النقشة على كامل المشروع (Home, FlexibleRequest, HajjLocal, Voucher, LoginPage, RegisterPage)
- [x] الشفافية: 10% للخلفيات الداكنة، 6% للخلفيات الفاتحة
- [ ] إصلاح وضوح النصوص في قسم الإحصائيات والفوتر (ألوان النص غير مقروءة على الخلفية الفاتحة)
- [x] إصلاح وضوح النصوص في قسم "لماذا تختارنا" والفوتر (إضافة خلفية داكنة)
- [x] تحويل قسم التقييمات في الصفحة الرئيسية إلى شريط بطاقات متحرك لا نهائي من اليسار لليمين
- [x] إصلاح شريط التقييمات المتحرك (غير ظاهر) وإضافة زر إيقاف/تشغيل مع توقف عند hover
- [x] إصلاح خطأ React: خلط animation shorthand مع animationPlayState في شريط التقييمات
- [x] إصلاح عدم ظهور بطاقات شريط التقييمات (العنوان يظهر لكن البطاقات مخفية)
- [x] عرض جميع التقييمات في شريط متحرك لا نهائي (رفع الحد الأقصى وضمان التكرار السلس)
- [ ] إعادة بناء قسم التقييمات بطريقة احترافية موثوقة تعرض جميع التقييمات الـ 167
- [x] إصلاح شريط التقييمات نهائياً: استخدام requestAnimationFrame بدلاً من CSS animation لتجاوز تعارضات Tailwind
- [ ] بناء مكوّن ReviewsMarquee مستقل في ملف منفصل بأبعاد صريحة وتمرير JS موثوق

## Phase 20 — نظام الاشتراكات لمزودي الخدمات

- [x] DB: جدول subscription_plans (اسم، سعر شهري/سنوي، حد البرامج، مدة التجربة، الميزات)
- [x] DB: جدول plan_addons (Featured Listings, Hero Ads - سعر، حد الـ slots، قابل للتعديل)
- [x] DB: جدول provider_subscriptions منفصل (plan_id، billing_cycle، start/end date، status، addons)
- [x] Seed: إدخال الباقات الافتراضية (Free Trial, Premium Basic, Premium Plus) وإضافتين (Featured, Hero Ads)
- [x] tRPC: إجراءات إدارة الباقات للأدمن (CRUD كامل للباقات والإضافات)
- [x] tRPC: إجراءات الاشتراك للمزود (listPlans, getMySubscription, requestUpgrade)
- [x] Admin: شاشة إدارة الباقات في لوحة المشرف (تعديل الأسعار والحدود والميزات)
- [x] Admin: شاشة مراجعة وموافقة المزودين مع تفعيل الفترة التجريبية تلقائياً
- [x] Admin: شاشة نظرة عامة على الاشتراكات (من على أي باقة، المنتهية، الطلبات المعلقة)
- [x] Provider Dashboard: بطاقة حالة الاشتراك (الباقة الحالية، تاريخ الانتهاء، عدد البرامج المستخدمة/الحد)
- [x] Provider Dashboard: صفحة الترقية مع جدول مقارنة الباقات وأزرار طلب الترقية
- [x] Provider Dashboard: بانر حالة الاشتراك في النظرة العامة مع تنبيه الانتهاء وزر الترقية
- [x] منطق الظهور: فلترة برامج المزودين حسب حالة الاشتراك (active فقط)
- [x] منطق الترتيب: Featured → Premium Plus → Premium Basic → Free Trial (حسب sortOrder)
- [x] شارة "مميز" على بطاقات برامج مزودي Premium Plus وPremium Basic
- [x] صفحة /become-provider لتسجيل المزودين مع اختيار الباقة ونموذج التقديم

## Bug Fixes
- [x] Fix 404 on /licenses route — create Licenses page and register route
- [ ] Fix 404 on /about route
- [ ] Fix 404 on /faq route
- [ ] Fix 404 on /contact route
- [ ] Fix 404 on /privacy-policy route
- [ ] Fix 404 on /terms-and-conditions route
- [ ] Fix 404 on /cancellation route

## Static Pages (from go-umrah.net)
- [ ] Build /about page with content from go-umrah.net/about-us
- [ ] Build /faq page with content from go-umrah.net/faq
- [ ] Build /complaints page with content from go-umrah.net/complains
- [ ] Build /privacy-policy page with content from go-umrah.net/privacy-policy
- [ ] Build /terms-and-conditions page with content from go-umrah.net/terms-and-conditions
- [ ] Build /cancellation page with content from go-umrah.net/cancellation
- [ ] Register all 6 routes in App.tsx
- [ ] Update Footer links to point to correct routes

## Bug Fixes & Updates (Mar 28 - Round 2)
- [x] Fix complaints page wrong link in footer (/complains → /complaints)
- [x] Add Maroof certificate badge to Footer licenses section
- [x] Unify contact info (00966557123435 / admin@go-umrah.com) across all pages and footer

## Bug Fixes (Mar 28 - Round 3)
- [ ] Fix Footer logo — upload real logo and replace broken URL showing fallback G

## Phase 21 — تحديث نظام الاشتراكات (4 باقات + 2 إضافة)

- [x] DB: تحديث subscription_plans بـ 4 باقات: Free Trial (14 يوم، 1 برنامج)، Basic (149/1499، 3 برامج)، Growth (299/2999، 5 برامج)، Professional (599/5999، 10 برامج)
- [x] DB: تحديث plan_addons: Featured Listings (99/شهر، 3 برامج)، Hero Ads (249/شهر، عدد محدود)
- [x] DB: sortOrder موجود في السكيما ومحدد بالترتيب الصحيح (10→40)
- [x] tRPC: إجراءات admin لإدارة الباقات متوفرة (adminUpdatePlan, adminUpdateAddon, adminActivateSubscription)
- [x] tRPC: منطق الظهور محدث: ترتيب حسب sortOrder (Professional > Growth > Basic > Free Trial)
- [x] tRPC: فلترة البرامج: عرض فقط المزودين ذوي الاشتراك الفعّال وضمن الحد
- [x] Admin: شاشة إدارة الباقات محدثة (4 بطاقات بتصميم محسّن + شارات الأكثر شعبية/الأفضل قيمة)
- [x] Admin: شاشة نظرة عامة على الاشتراكات مع إحصائيات الإضافات المفعّلة
- [x] Provider Dashboard: بطاقة حالة الاشتراك محدثة (الباقة، الإضافات، تاريخ الانتهاء، عداد البرامج)
- [x] Provider Dashboard: جدول مقارنة 4 باقات بأسعار بالريال + شارات التمييز + زر طلب الترقية
- [x] Provider Dashboard: أزرار طلب الترقية لكل باقة
- [x] منطق الظهور: إيقاف إعلانات المزودين المنتهية تلقائياً (فلترة active + endDate في الاستعلام)

## Phase 22 — إصلاحات المنصة (8 إصلاحات) — مكتملة
- [x] Fix 1: صفحة القسيمة — إضافة حالة not-found وتصحيح بيانات التواصل
- [x] Fix 2: الأمان — تثبيت helmet + cors + express-rate-limit في server/_core/index.ts
- [x] Fix 3: إنقاص المقاعد عند الحجز + التحقق من توفر المقاعد قبل الحجز في bookings.create
- [x] Fix 4: التسعير الديناميكي في BookingModal مع عرض الخصومات والسعر النهائي
- [x] Fix 5: حفظ سلة المتجر في localStorage مع استعادة تلقائية عند إعادة التحميل
- [x] Fix 6: حذف ComponentShowcase.tsx من الإنتاج
- [x] Fix 7: جداول قطار الحرمين واقعية — حساب وقت الوصول من وقت المغادرة + مدة الرحلة
- [x] Fix 8: Conditional logging في server/db.ts (فقط في non-production)

## Phase 23 — نظام مزودي الخدمة (Marketplace)

### DB
- [ ] إضافة جدول bookingReviews (إذا لم يكن موجوداً)
- [ ] إضافة جدول providerNotifications (إذا لم يكن موجوداً)
- [ ] إضافة جدول providerListings (إذا لم يكن موجوداً)
- [ ] تعديل users.role enum لإضافة "provider"
- [ ] إضافة عمود providerId لجدول bookings
- [ ] إضافة عمود providerId لجداول الخدمات (hajj_programs, umrah_programs, hotels)
- [ ] تشغيل pnpm db:push

### tRPC Routers
- [ ] providerAuthRouter (register, getProfile, updateProfile, getStats)
- [ ] providerListingsRouter (list, create, pause, getAnalytics)
- [ ] providerBookingsRouter (list, respond, markCompleted, getNotifications, markNotificationsRead)
- [ ] bookingReviewsRouter (submit, getForProvider, replyToReview, getForBooking)
- [ ] adminProvidersRouter (list, approve, reject, suspend, approveListing, rejectListing, stats)
- [ ] plansRouter (list, seed) — إذا لم يكن موجوداً
- [ ] ربط الـ routers الجديدة في appRouter

### Frontend
- [ ] ProviderRegister.tsx — معالج 5 خطوات مع شريط التقدم
- [ ] ProviderDashboard.tsx — sidebar + 5 أقسام (overview, listings, bookings, reviews, subscription)
- [ ] ReviewForm.tsx — نموذج تقييم تفاعلي بنجوم
- [ ] دمج ReviewForm في Voucher.tsx عند status=completed
- [ ] تحديث Navbar بروابط مزود الخدمة
- [ ] إضافة شارة "مزود معتمد" في صفحات Hajj/Umrah/Hotels

### Admin
- [ ] ProvidersAdmin component (جدول + موافقة/رفض/تعليق)
- [ ] ProviderListingsAdmin component (إعلانات بانتظار الموافقة)
- [ ] BookingReviewsAdmin component (تقييمات بانتظار الإشراف)
- [ ] PlansAdmin component (عرض الخطط + تهيئة الخطط الافتراضية)
- [ ] إضافة 4 أقسام جديدة لـ Admin.tsx sidebar

## Phase 23 — نظام التقييمات والإشعارات

- [x] إنشاء جدول booking_reviews في قاعدة البيانات
- [x] إنشاء جدول provider_notifications في قاعدة البيانات
- [x] بناء bookingReviewsRouter بعمليات كاملة (submit, getForProvider, getMyReviews, reply, adminList, adminUpdateStatus, adminDelete)
- [x] بناء providerNotificationsRouter بعمليات كاملة (list, markRead, delete)
- [x] تسجيل الروترين في appRouter
- [x] إضافة قسم التقييمات في لوحة مزود الخدمة مع فلتر الحالة والرد على التقييمات
- [x] إضافة قسم الإشعارات في لوحة مزود الخدمة مع تحديد القراءة والحذف
- [x] إضافة شارة الإشعارات غير المقروءة في الشريط الجانبي
- [x] إضافة نموذج تقديم التقييم في صفحة الملف الشخصي للعميل (للحجوزات المكتملة)
- [x] كتابة 14 اختبار vitest للروترين الجديدين (جميعها ناجحة)

## Phase 24 — Bug Fixes

- [x] Fix /provider page: "Provider profile not found" error for admin users — auto-create provider profile on first visit (upsert pattern)
- [x] Fix React hooks-after-conditional-return violation in ProviderDashboard (notifData query moved before early returns)

## Phase 25 — المحاور الثلاثة الحرجة للإطلاق

- [x] المحور 1: بوابة الدفع Moyasar — env vars, schema migration, server/moyasar.ts, paymentRouter, callback route, BookingModal redirect
- [x] المحور 2: تشفير بيانات الجوازات (PDPL) — server/encryption.ts, تشفير passport_records, mask passportNumber في users
- [x] المحور 3: فاتورة ZATCA — server/zatca.ts, invoiceRouter, Voucher.tsx QR + PDF download
- [x] إدخال مفاتيح Moyasar (MOYASAR_PUBLISHABLE_KEY, MOYASAR_SECRET_KEY, MOYASAR_WEBHOOK_SECRET, ENCRYPTION_KEY, VAT_NUMBER)

## Phase 26 — المرحلة الأولى: ما يمنع الإطلاق

- [x] Schema: packageViews + wishlists جداول جديدة
- [x] Procedures: hajj/umrah/hotels/tours.getById + hajj.trackView + wishlistRouter
- [x] صفحة PackageDetail.tsx موحدة مع hero + gallery + tabs + sticky booking card
- [x] مسارات /hajj/:id /umrah/:id /hotels/:id /tours/:id في App.tsx
- [x] تحويل نقر البطاقات في Hajj/Umrah/Hotels/Tours لصفحة التفاصيل
- [x] SSE endpoint /api/notifications/stream في server/_core/index.ts
- [x] hook useRealtimeNotifications.ts
- [x] badge إشعارات فورية في Navbar
- [x] searchRouter مع full-text search
- [x] صفحة SearchResults.tsx
- [x] إصلاح UniversalSearch لتمرير نتائج حقيقية

## Phase 27 — المرحلة الثانية: تجربة العميل والمزود

- [x] Schema: conversations + messages
- [x] chatRouter في server/routers/chatRouter.ts
- [x] ChatWidget.tsx عائم في PackageDetail + Voucher
- [x] Schema: coupons + couponUsages
- [x] couponRouter مع validate + apply + admin CRUD
- [x] حقل كوبون في BookingModal

## Phase 28 — المرحلة الثالثة: السيطرة على السوق

- [x] PWA: manifest.json + sw.js + offline.html
- [x] تسجيل Service Worker في main.tsx
- [x] PWA meta tags في index.html
- [x] زر "تثبيت التطبيق" في Navbar
- [x] تحسين aiRouter.chat مع سياق حقيقي من DB
- [x] تحديث PilgrimAIAssistant مع context selector + localStorage history
- [x] sitemap.xml ديناميكي + robots.txt
- [x] Structured data (JSON-LD) في PackageDetail

## Phase 29 — المرحلة الرابعة: الذكاء والتوسع
- [x] Schema: userEvents
- [x] recommendationRouter (getForUser + track)
- [x] قسم "مقترح لك" في Home.tsx
- [x] تتبع view_package في PackageDetail
- [x] analyticsRouter: conversionFunnel + topProviders
- [x] Admin.tsx: مخطط funnel + جدول أفضل المزودين
- [x] /api/live-stats endpoint
- [x] شريط الإحصائيات الحية في Home.tsx

## Phase 30 — تكامل LiteAPI لحجز الفنادق

- [x] إضافة liteApiKey + liteApiUrl + liteApiWhitelabel في server/_core/env.ts
- [x] إنشاء server/liteapi.ts مع searchHotels, getHotelRates, preBook, bookHotel, getHotelDetails, cancelBooking, normalizeLiteHotel
- [x] إضافة liteApiRouter في server/routers.ts (searchHotels, getHotelRates, getHotelDetails, preBook, book, getWhitelabelUrl)
- [x] إضافة LITEAPI_KEY في .env (مفتاح sandbox مدمج بالكود للتجربة)
- [x] إعادة كتابة Hotels.tsx بالكامل مع LiteAPI

## Phase 31 — إصلاح محرك بحث الفنادق LiteAPI

- [x] إصلاح searchHotels: استخدام cityName + countryCode بدلاً من coordinates/radius
- [x] تصحيح بنية الاستجابة (stars, main_photo, address ك string)
- [x] التحقق: مكة 5 فنادق | المدينة 3 فنادق | جدة 3 فنادق — جميعها تعمل بنجاح

## Phase 32 — ربط كامل مع LiteAPI + لوحة التحكم

- [ ] إعادة كتابة Hotels.tsx: بطاقات فنادق حقيقية من LiteAPI مع أسعار حية عند اختيار التواريخ
- [ ] بناء HotelDetail.tsx: معلومات الفندق + غرف + أسعار + تدفق الحجز (preBook → book)
- [ ] إضافة قسم "حجوزات الفنادق" في Admin.tsx: قائمة الحجوزات، تأكيد/إلغاء، إحصاءات
- [ ] إضافة procedures في liteApiRouter: listBookings, getBooking, cancelBooking
- [ ] ربط مسار /hotels/:id في App.tsx

## Phase 34 — نظام حجز فنادق متكامل بدون iframe

- [ ] تحديث server/liteapi.ts: إضافة getHotelReviews + confirmBooking
- [ ] تحديث liteApiRouter: إضافة preBook + book procedures
- [ ] إعادة كتابة Hotels.tsx: قائمة فنادق + تفاصيل + اختيار غرفة + نموذج حجز + تأكيد
- [ ] حفظ الحجز في جدول bookings في DB
- [ ] 0 أخطاء TypeScript + 67 اختبار ناجح

## Phase 36 — إصلاح تخطيط Hotels.tsx

- [x] إصلاح Hotels.tsx: إزالة position:fixed واستخدام minHeight نسبي — الـ Footer يبقى في مكانه
- [x] فحص الموقع: 0 أخطاء TypeScript، 0 أخطاء شبكة، 67 اختبار ناجح

## Phase 37 — تقليص الهيرو + استبدال محرك البحث

- [ ] تقليص ارتفاع الهيرو في Hotels.tsx (iframe)
- [ ] استبدال محرك بحث الفنادق في Home.tsx بمحرك White Label مضمّن مع الربط

## Phase 38 — إصلاح قسم الفنادق بالكامل (LiteAPI v3.0)

- [x] إعادة كتابة server/liteapi.ts مع بنية v3.0 الصحيحة (roomTypes بدلاً من rates)
- [x] إصلاح routers.ts: إزالة normalizeHotel، تصحيح searchHotels وgetHotelRates وgetHotelDetails
- [x] إعادة كتابة Hotels.tsx: قائمة فنادق حقيقية مع staleTime وretry وhandleSelectHotel صحيح
- [x] إصلاح HotelDetail.tsx: RateCard وBookingDialog يستخدمان NormalizedRoom fields
- [x] إصلاح phone validation في routers.ts (min 8 → min 5)
- [x] اختبار التدفق الكامل: بحث → فندق → غرف → pre-book ✅ → تأكيد الحجز

## Phase 39 — تطوير محرك بحث الفنادق العالمي

- [x] بناء مكون HotelSearchBar مشترك مع autocomplete عالمي للمدن
- [x] تقويم ذكي: تاريخ افتراضي اليوم/غداً، تحديث الخروج عند اختيار الدخول
- [x] مربع ضيوف متقدم: بالغين + أطفال + غرف متعددة
- [x] عدم عرض فنادق إلا بعد الضغط على زر بحث
- [x] تطبيق HotelSearchBar على UniversalSearch (تبويب الفنادق في الهيرو)
- [x] تطبيق HotelSearchBar على Hotels.tsx بشكل متماثل

## Phase 40 — تنظيف LiteAPI وتجهيز TBO API

- [ ] حذف server/liteapi.ts
- [ ] تنظيف env.ts من liteApiKey و liteApiUrl
- [ ] حذف liteApiRouter من routers.ts
- [ ] إعادة كتابة Hotels.tsx (قادم قريباً + TBO)
- [ ] إعادة كتابة HotelDetail.tsx (رسالة بسيطة)
- [ ] إعادة كتابة Flights.tsx (نموذج بحث + قادم قريباً)
- [ ] حذف HotelSearchBar.tsx
- [ ] تنظيف Admin.tsx من liteApi references
- [ ] الإبقاء على Agoda verification كما هو

## Phase 41 — تفعيل بوابة دفع Moyasar
- [x] إضافة endpoint getPublishableKey في paymentRouter لإرسال المفتاح العام للواجهة
- [x] إنشاء صفحة PaymentPage.tsx مع Moyasar.js SDK (بطاقة ائتمان + Apple Pay + STC Pay)
- [x] إضافة route /payment/:bookingNumber في App.tsx
- [x] تحديث BookingModal: بعد الحجز توجيه لصفحة الدفع بدلاً من زر "ادفع الآن"
- [x] تحديث Voucher.tsx: زر "ادفع الآن" يوجه لصفحة الدفع
- [x] إضافة جدول payments في قاعدة البيانات لتتبع كل محاولة دفع
- [x] تحديث callback URL ليُعيد للـ Voucher مع حالة الدفع
- [x] اختبار التدفق الكامل: حجز → دفع → قسيمة
- [x] إضافة عرض حالة الدفع في لوحة الأدمن (PaymentsAdmin tab)


## Phase 42 — توسيع بوابة الدفع لجميع الأقسام

- [ ] إصلاح خطأ المقاعد غير الكافية في الرحلات (flights)
- [ ] توسيع createInvoice ليدعم جميع أنواع الخدمات (orders, visas, flights, hotels, vehicles, tours)
- [x] إضافة payment procedures لـ orders (المتجر) — توجيه لصفحة /pay/order/:id
- [x] إضافة payment procedures لـ visas (التأشيرات) — توجيه لصفحة /pay/visa/:id
- [x] إضافة payment procedures لـ flights (الرحلات) — يعمل عبر BookingModal → PaymentPage
- [x] إضافة payment procedures لـ hotels (الفنادق) — يعمل عبر BookingModal → PaymentPage
- [x] إضافة payment procedures لـ vehicles (المواصلات) — يعمل عبر BookingModal → PaymentPage
- [x] إضافة payment procedures لـ tours (الجولات) — يعمل عبر BookingModal → PaymentPage
- [ ] اختبار شامل لجميع الأقسام


## Phase 43 — نظام إدارة باقات الحج الديناميكي

- [ ] بناء نظام ديناميكي لتحديد الحقول المطلوبة (packageFieldSchema)
- [ ] إضافة الباقات الأربع الكاملة: اقتصادية، متوسطة، فاخرة، فاخرة جداً
- [ ] بناء واجهة إدارة متقدمة (HajjPackageManager component)
- [ ] إضافة procedures للإدارة المتقدمة (create, update, delete, list)
- [ ] اختبار شامل وحفظ checkpoint


## Phase 44 — إصلاح أخطاء قاعدة البيانات

- [ ] إصلاح استعلامات hajj_programs - الأعمدة الناقصة
- [ ] إصلاح استعلامات hajj_international_packages - الأعمدة الناقصة
- [ ] إصلاح استعلامات hajj_booking_requests - الأعمدة الناقصة
- [ ] اختبار شامل وحفظ checkpoint


## Phase 45 — إصلاح أخطاء قاعدة البيانات وإضافة باقات حجاج الداخل

- [ ] تشخيص الأعمدة الناقصة في hajj_programs و hajj_international_packages و hajj_booking_requests
- [ ] تطبيق ALTER TABLE لإضافة الأعمدة الناقصة
- [ ] إضافة الباقات الأربع لحجاج الداخل في قاعدة البيانات
- [ ] تحديث صفحة الحج لعرض الباقات
- [ ] تحديث النماذج

## Phase 48 — إصلاح أخطاء صفحة الحج + توسيع الدفع

- [x] إصلاح خطأ SQL في hajj_international_packages (الجدول موجود والبيانات تعمل)
- [x] إصلاح خطأ SQL في hajj_programs (الجدول موجود والبيانات تعمل - 4 باقات داخلية)
- [x] التحقق من عمل نموذج حجز حجاج الداخل (DomesticBookingRequestForm)
- [x] إضافة حقول الدفع لجدول visa_applications (feeSAR, paymentIntentId, paymentStatus, paidAt)
- [x] إنشاء endpoint /api/payment/callback-unified في server/_core/index.ts
- [x] إنشاء صفحة UnifiedPaymentPage.tsx لدفع الطلبات والتأشيرات
- [x] إضافة route /pay/:serviceType/:serviceId في App.tsx
- [x] تحديث المتجر: بعد إنشاء الطلب يتم التوجيه لصفحة الدفع
- [x] تحديث التأشيرات: بعد تقديم الطلب يتم التوجيه لصفحة الدفع (إذا كانت هناك رسوم)
- [x] إنشاء تبويب المدفوعات (PaymentsAdmin) في لوحة التحكم الإدارية
- [x] تحديث payment-unified.ts لتحديث حالة الطلبات والتأشيرات بشكل صحيح بعد الدفع
- [x] تحديث store.createOrder ليعيد orderId
- [x] تحديث visa.submitApplication ليعيد applicationId ويقبل feeSAR
- [x] جميع الاختبارات (98 اختبار) تمر بنجاح

## Phase 49 — خاصية تفعيل/تعطيل باقات حجاج الداخل

- [x] فحص schema جدول hajj_programs لحقل isActive
- [x] إضافة حقل isActive إذا لم يكن موجوداً في الجدول (موجود بالفعل)
- [x] تحديث واجهة الأدمن لإضافة زر تفعيل/تعطيل لكل باقة داخلية (toggle switch)
- [x] تحديث صفحة الحج لعرض حالة الباقة (متاحة/غير متاحة) للمستخدم
- [x] تعطيل زر الحجز للباقات غير المتاحة

## Phase 50 — تنظيف واجهة باقات حجاج الداخل

- [x] حذف زر "احجز الآن" من بطاقة الباقة (للعرض فقط)
- [x] حذف عرض المقاعد المتاحة والإجمالية
- [x] حذف اسم المؤسسة "توايا وديافة للخدمات التجارية"
- [x] استبدال hotelMakkah/Madinah بـ arafatSleeping, minyaSleeping, muzdalifaSleeping
- [x] تحديث schema لإضافة muzdalifaSleeping
- [x] تحديث NusukPackageCard لعرض السكن الجديد
- [x] تحديث HajjNusukPackagesAdmin form
- [x] التحقق من أسماء الباقات الأربع وتحديثها

## Phase 51 — تجهيز قسم الفنادق لربط liteAPI

- [x] فحص البنية الحالية لقسم الفنادق (Hotels.tsx)
- [x] دراسة توثيق liteAPI والحصول على المفاتيح
- [x] إنشاء وحدة liteAPI integration (server/liteapi.ts)
- [x] إضافة procedures للبحث عن الفنادق والتفاصيل (searchPlaces, searchLiteAPI, getDetails, getReviews, prebook, book)
- [ ] تحديث Hotels.tsx بـ search form وعرض النتائج
- [ ] إضافة نموذج الحجز والدفع للفنادق
- [ ] اختبار التكامل الكامل
