import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ─── Hajj Programs ────────────────────────────────────────────────────────────
await conn.execute(`
  INSERT IGNORE INTO hajj_programs (title, subtitle, portalType, category, imageUrl, priceUSD, originalPriceUSD, duration, departureCity, departureDate, returnDate, seatsTotal, seatsAvailable, hotelMakkah, hotelMadinah, hotelStarRating, features, inclusions, isUrgent, isFeatured, isActive, badge, sortOrder)
  VALUES
  ('Premium Hajj Package 2025', 'All-inclusive 21-day spiritual journey', 'internal', 'premium', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800', '8500.00', '9500.00', '21 Days / 20 Nights', 'Kuala Lumpur', '2025-05-15', '2025-06-05', 50, 12, 'Hilton Makkah Convention Hotel', 'Anwar Al Madinah Hotel', 5, '["VIP Transportation","5-Star Hotels","Guided Ziyarat","Ihram Kit","24/7 Support"]', '["Round-trip flights","Visa processing","All meals","Ziyarat tours","Insurance"]', 1, 1, 1, 'Limited Seats', 1),
  ('Economy Hajj Package 2025', 'Affordable complete Hajj experience', 'internal', 'economy', 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800', '4200.00', '4800.00', '15 Days / 14 Nights', 'Jakarta', '2025-05-20', '2025-06-04', 80, 35, 'Swissotel Al Maqam Makkah', 'Dar Al Taqwa Hotel', 4, '["Group Transportation","4-Star Hotels","Guided Ziyarat","Ihram Kit"]', '["Round-trip flights","Visa processing","Breakfast & Dinner","Ziyarat tours"]', 0, 1, 1, 'Best Value', 2),
  ('VIP Hajj Package 2025', 'Ultra-luxury pilgrimage experience', 'external', 'vip', 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=800', '15000.00', NULL, '28 Days / 27 Nights', 'Dubai', '2025-05-10', '2025-06-07', 20, 8, 'Fairmont Makkah Clock Royal Tower', 'The Oberoi Madinah', 5, '["Private VIP Transport","Butler Service","5-Star Hotels","Private Ziyarat","Premium Ihram Kit","Concierge 24/7"]', '["Business class flights","Express visa","All meals","Private tours","Luxury gifts","Insurance"]', 1, 1, 1, 'VIP Experience', 3),
  ('Standard Hajj Package 2025', 'Complete Hajj with comfortable accommodations', 'external', 'standard', 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800', '6200.00', '6800.00', '18 Days / 17 Nights', 'Cairo', '2025-05-18', '2025-06-05', 60, 28, 'Makkah Marriott Hotel', 'Crowne Plaza Madinah', 4, '["Group Transportation","4-Star Hotels","Guided Ziyarat","Ihram Kit","Meals"]', '["Round-trip flights","Visa processing","All meals","Ziyarat tours","Insurance"]', 0, 0, 1, NULL, 4)
`);
console.log("✅ Hajj programs seeded");

// ─── Umrah Programs ───────────────────────────────────────────────────────────
await conn.execute(`
  INSERT IGNORE INTO umrah_programs (title, subtitle, portalType, category, imageUrl, priceUSD, originalPriceUSD, duration, departureCity, departureDate, returnDate, seatsTotal, seatsAvailable, hotelMakkah, hotelMadinah, hotelStarRating, features, inclusions, isUrgent, isFeatured, isActive, badge, sortOrder)
  VALUES
  ('Ramadan Umrah Special', 'Spiritual journey during the blessed month', 'internal', 'premium', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800', '3200.00', '3800.00', '14 Days / 13 Nights', 'London', '2025-03-01', '2025-03-15', 40, 8, 'Hilton Suites Makkah', 'Anwar Al Madinah Hotel', 5, '["VIP Transport","5-Star Hotels","Guided Ziyarat","Iftar & Suhoor","24/7 Support"]', '["Round-trip flights","Visa","All meals","Ziyarat","Insurance"]', 1, 1, 1, 'Ramadan Special', 1),
  ('Economy Umrah Package', 'Budget-friendly complete Umrah', 'internal', 'economy', 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800', '1500.00', '1800.00', '10 Days / 9 Nights', 'Karachi', '2025-04-01', '2025-04-11', 100, 45, 'Al Safwah Royale Orchid Hotel', 'Madinah Hilton Hotel', 4, '["Group Transport","4-Star Hotels","Guided Ziyarat","Ihram Kit"]', '["Round-trip flights","Visa","Breakfast","Ziyarat"]', 0, 1, 1, 'Best Value', 2),
  ('Premium Umrah Experience', 'Luxury Umrah with 5-star amenities', 'external', 'premium', 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=800', '4500.00', NULL, '12 Days / 11 Nights', 'New York', '2025-05-01', '2025-05-13', 30, 15, 'Fairmont Makkah Clock Royal Tower', 'The Oberoi Madinah', 5, '["Private Transport","5-Star Hotels","Private Ziyarat","Premium Ihram","Concierge"]', '["Business class flights","Express visa","All meals","Private tours","Gifts"]', 0, 1, 1, 'Premium', 3),
  ('Family Umrah Package', 'Perfect spiritual journey for families', 'internal', 'standard', 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800', '2800.00', '3200.00', '12 Days / 11 Nights', 'Toronto', '2025-06-01', '2025-06-13', 50, 22, 'Makkah Marriott Hotel', 'Crowne Plaza Madinah', 4, '["Family Rooms","4-Star Hotels","Guided Ziyarat","Ihram Kit","Kids Activities"]', '["Round-trip flights","Visa","All meals","Ziyarat","Insurance"]', 0, 1, 1, 'Family Friendly', 4),
  ('Weekend Umrah Express', 'Quick spiritual getaway for busy professionals', 'external', 'economy', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800', '1200.00', '1400.00', '5 Days / 4 Nights', 'Riyadh', '2025-04-15', '2025-04-20', 60, 30, 'Swissotel Al Maqam Makkah', 'Dar Al Taqwa Hotel', 4, '["Express Transport","4-Star Hotel","Guided Umrah","Ihram Kit"]', '["Round-trip flights","Visa","Breakfast","Ziyarat"]', 1, 0, 1, 'Express', 5)
`);
console.log("✅ Umrah programs seeded");

// ─── Check tours columns ───────────────────────────────────────────────────────
const [tourCols] = await conn.execute("DESCRIBE tours");
const tourColNames = tourCols.map(r => r.Field);
console.log("Tours columns:", tourColNames.join(", "));

// ─── Tours ────────────────────────────────────────────────────────────────────
await conn.execute(`
  INSERT IGNORE INTO tours (title, subtitle, location, category, imageUrl, priceUSD, duration, maxGroupSize, guideName, sites, isFeatured, isActive, sortOrder)
  VALUES
  ('Makkah Holy Sites Tour', 'Visit all sacred sites in Makkah', 'makkah', 'religious', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800', '85.00', 6, 20, 'Sheikh Abdullah Al-Rashid', '["Masjid Al-Haram","Cave of Hira","Cave of Thawr","Mina","Muzdalifah","Arafat"]', 1, 1, 1),
  ('Madinah Ziyarat Tour', 'Explore the holy city of the Prophet', 'madinah', 'religious', 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800', '75.00', 5, 25, 'Sheikh Muhammad Al-Ansari', '["Masjid Al-Nabawi","Quba Mosque","Masjid Al-Qiblatayn","Al-Baqi Cemetery","Uhud Mountain"]', 1, 1, 2),
  ('Historical Makkah Tour', 'Discover the rich Islamic history', 'makkah', 'historical', 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=800', '95.00', 7, 15, 'Dr. Fatima Al-Zahra', '["Makkah Museum","Birthplace of Prophet","Old Makkah","Ajyad Fortress","Al-Zaher Palace"]', 1, 1, 3),
  ('Jeddah Cultural Tour', 'Explore the vibrant city of Jeddah', 'jeddah', 'cultural', 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800', '65.00', 4, 30, 'Ahmed Al-Jeddawi', '["Al-Balad Historic District","King Fahd Fountain","Corniche","Floating Mosque","Jeddah Waterfront"]', 0, 1, 4)
`);
console.log("✅ Tours seeded");

// ─── Check vehicles columns ───────────────────────────────────────────────────
const [vehicleCols] = await conn.execute("DESCRIBE vehicles");
const vehicleColNames = vehicleCols.map(r => r.Field);
console.log("Vehicles columns:", vehicleColNames.join(", "));

// ─── Vehicles ─────────────────────────────────────────────────────────────────
await conn.execute(`
  INSERT IGNORE INTO vehicles (name, type, capacity, pricePerTripUSD, pricePerDayUSD, features, imageUrl, description, isFeatured, isAvailable)
  VALUES
  ('Toyota Land Cruiser VIP', 'vip_car', 4, '150.00', '600.00', '["Leather Seats","WiFi","Refreshments","Professional Driver","AC"]', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', 'Luxury VIP sedan for private transfers', 1, 1),
  ('Mercedes Sprinter Van', 'van', 12, '200.00', '800.00', '["Comfortable Seats","AC","Luggage Space","Professional Driver","WiFi"]', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'Premium van for group transfers', 1, 1),
  ('Modern Coach Bus', 'bus', 45, '500.00', '2000.00', '["Reclining Seats","AC","Luggage Space","Professional Driver","Entertainment"]', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800', 'Modern coach for large group transportation', 0, 1),
  ('GMC Yukon SUV', 'suv', 6, '180.00', '720.00', '["Spacious Interior","Leather Seats","AC","WiFi","Professional Driver"]', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800', 'Premium SUV for family groups', 1, 1),
  ('Minibus 20-Seater', 'minibus', 20, '280.00', '1100.00', '["Comfortable Seats","AC","Luggage Space","Professional Driver"]', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800', 'Ideal for medium-sized groups', 0, 1)
`);
console.log("✅ Vehicles seeded");

// ─── Products ─────────────────────────────────────────────────────────────────
const [productCols] = await conn.execute("DESCRIBE products");
const productColNames = productCols.map(r => r.Field);
console.log("Products columns:", productColNames.join(", "));

await conn.execute(`
  INSERT IGNORE INTO products (name, slug, description, priceUSD, originalPriceUSD, imageUrl, sku, stock, isFeatured, isActive)
  VALUES
  ('Premium Ihram Set', 'premium-ihram-set', 'High-quality seamless white Ihram cloth for Hajj and Umrah. Made from premium Egyptian cotton.', '45.00', '60.00', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800', 'IHR-001', 200, 1, 1),
  ('Prayer Rug - Madinah Design', 'prayer-rug-madinah', 'Authentic Madinah-inspired prayer rug with intricate geometric patterns. Soft and durable.', '35.00', '45.00', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800', 'PRY-001', 150, 1, 1),
  ('Zamzam Water 5L', 'zamzam-water-5l', 'Authentic Zamzam water directly from Makkah. Sealed and certified.', '25.00', NULL, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800', 'ZZM-001', 500, 1, 1),
  ('Islamic Calligraphy Art', 'islamic-calligraphy-art', 'Beautiful hand-crafted Islamic calligraphy wall art. Perfect as a gift or home decoration.', '85.00', '100.00', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'ART-001', 50, 1, 1),
  ('Hajj Guidebook Arabic/English', 'hajj-guidebook', 'Comprehensive Hajj guide with step-by-step instructions, duas, and maps. Bilingual edition.', '18.00', '22.00', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', 'BK-001', 300, 0, 1),
  ('Misbaha Prayer Beads Gold', 'misbaha-gold', 'Elegant 99-bead Misbaha made from genuine amber with gold accents. Comes in a luxury box.', '55.00', '70.00', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800', 'MSB-001', 100, 1, 1),
  ('Attar Perfume Set', 'attar-perfume-set', 'Collection of 6 authentic Arabian Attar perfumes in decorative bottles. Alcohol-free.', '75.00', '90.00', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'ATR-001', 80, 1, 1),
  ('Ihram Waist Bag', 'ihram-waist-bag', 'Secure waist bag designed for Ihram. Keeps your passport, money, and phone safe during Tawaf.', '22.00', '28.00', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800', 'BAG-001', 250, 0, 1)
`);
console.log("✅ Products seeded");

// ─── Hotels ───────────────────────────────────────────────────────────────────
const [hotelCols] = await conn.execute("DESCRIBE hotels");
const hotelColNames = hotelCols.map(r => r.Field);
console.log("Hotels columns:", hotelColNames.join(", "));

await conn.execute(`
  INSERT IGNORE INTO hotels (name, description, city, address, distanceToHaram, starRating, pricePerNightUSD, amenities, imageUrl, rating, reviewCount, isFeatured, isActive)
  VALUES
  ('Fairmont Makkah Clock Royal Tower', 'Iconic luxury hotel adjacent to Masjid Al-Haram with stunning views of the Kaaba.', 'Makkah', 'Abraj Al-Bait, Makkah 24231', 50, 5, '850.00', '["Pool","Spa","Multiple Restaurants","Concierge","Gym","Business Center"]', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', '4.9', 2847, 1, 1),
  ('Hilton Suites Makkah', 'Premium suites with direct views of the Grand Mosque and excellent amenities.', 'Makkah', 'Ibrahim Al Khalil St, Makkah', 200, 5, '650.00', '["Pool","Spa","Restaurant","Concierge","Gym"]', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', '4.7', 1923, 1, 1),
  ('The Oberoi Madinah', 'Luxury hotel offering breathtaking views of Masjid Al-Nabawi.', 'Madinah', 'King Fahd Road, Madinah', 100, 5, '720.00', '["Pool","Spa","Multiple Restaurants","Concierge","Gym","Library"]', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800', '4.8', 1456, 1, 1),
  ('Swissotel Al Maqam Makkah', 'Contemporary hotel with stunning views and world-class facilities near Haram.', 'Makkah', 'Ajyad Street, Makkah', 300, 5, '480.00', '["Pool","Spa","Restaurant","Gym","Business Center"]', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', '4.6', 2103, 0, 1),
  ('Crowne Plaza Madinah', 'Elegant hotel with convenient access to Masjid Al-Nabawi and city attractions.', 'Madinah', 'King Faisal Road, Madinah', 400, 4, '320.00', '["Restaurant","Gym","Business Center","Concierge"]', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800', '4.4', 987, 0, 1)
`);
console.log("✅ Hotels seeded");

// ─── Visa Types ───────────────────────────────────────────────────────────────
const [visaCols] = await conn.execute("DESCRIBE visa_types");
const visaColNames = visaCols.map(r => r.Field);
console.log("Visa types columns:", visaColNames.join(", "));

await conn.execute(`
  INSERT IGNORE INTO visa_types (name, description, type, priceUSD, processingDays, validityDays, requirements, steps, imageUrl, isActive, isFeatured)
  VALUES
  ('Umrah Visa', 'Official Umrah visa for performing the lesser pilgrimage to Makkah and Madinah.', 'umrah', '150.00', 5, 30, '["Valid passport (6+ months)","2 passport photos","Vaccination certificate","Bank statement","Sponsor letter"]', '["Submit application","Upload documents","Pay fee","Await approval","Receive visa"]', 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800', 1, 1),
  ('Hajj Visa', 'Official Hajj visa for performing the annual pilgrimage. Requires Hajj package booking.', 'hajj', '250.00', 10, 45, '["Valid passport (6+ months)","2 passport photos","Vaccination certificate","Hajj package confirmation","Medical certificate"]', '["Book Hajj package","Submit application","Upload documents","Pay fee","Receive visa"]', 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800', 1, 1),
  ('Saudi Tourist Visa', 'Visit Saudi Arabia for tourism, including religious sites and cultural attractions.', 'tourist', '120.00', 3, 365, '["Valid passport (6+ months)","Online application","Travel insurance","Return ticket"]', '["Apply online","Upload documents","Pay fee","Receive e-visa"]', 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=800', 1, 1),
  ('Transit Visa', 'Short-stay visa for travelers transiting through Saudi Arabia.', 'transit', '50.00', 2, 3, '["Valid passport","Onward ticket","Destination visa"]', '["Apply online","Pay fee","Receive transit visa"]', 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=800', 1, 0)
`);
console.log("✅ Visa types seeded");

console.log("\n🎉 All seed data inserted successfully!");
await conn.end();
