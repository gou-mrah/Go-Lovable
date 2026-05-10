// ============================================
// WISHLIST & COMPARISON SYSTEM
// ============================================

export interface WishlistItem {
  id: string;
  userId: string;
  serviceType: 'hotel' | 'flight' | 'package' | 'tour' | 'visa';
  serviceId: string;
  serviceName: string;
  price: number;
  currency: string;
  addedAt: Date;
  notes?: string;
  reminderSet: boolean;
  reminderDate?: Date;
}

export interface Comparison {
  id: string;
  userId: string;
  name: string;
  serviceType: 'hotel' | 'flight' | 'package' | 'tour';
  items: ComparisonItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComparisonItem {
  serviceId: string;
  serviceName: string;
  price: number;
  rating: number;
  features: Record<string, any>;
}

// ============================================
// WISHLIST MANAGEMENT
// ============================================

const wishlists: Map<string, WishlistItem[]> = new Map();

export function addToWishlist(
  userId: string,
  serviceType: string,
  serviceId: string,
  serviceName: string,
  price: number,
  currency: string,
  notes?: string
): WishlistItem {
  const item: WishlistItem = {
    id: `wish_${Date.now()}`,
    userId,
    serviceType: serviceType as any,
    serviceId,
    serviceName,
    price,
    currency,
    addedAt: new Date(),
    notes,
    reminderSet: false,
  };

  const userWishlist = wishlists.get(userId) || [];
  userWishlist.push(item);
  wishlists.set(userId, userWishlist);

  return item;
}

export function removeFromWishlist(userId: string, wishlistItemId: string): boolean {
  const userWishlist = wishlists.get(userId);
  if (!userWishlist) return false;

  const index = userWishlist.findIndex((item) => item.id === wishlistItemId);
  if (index === -1) return false;

  userWishlist.splice(index, 1);
  wishlists.set(userId, userWishlist);
  return true;
}

export function getWishlist(userId: string): WishlistItem[] {
  return wishlists.get(userId) || [];
}

export function getWishlistByServiceType(userId: string, serviceType: string): WishlistItem[] {
  const userWishlist = wishlists.get(userId) || [];
  return userWishlist.filter((item) => item.serviceType === serviceType);
}

export function setWishlistReminder(
  userId: string,
  wishlistItemId: string,
  reminderDate: Date
): WishlistItem | null {
  const userWishlist = wishlists.get(userId);
  if (!userWishlist) return null;

  const item = userWishlist.find((w) => w.id === wishlistItemId);
  if (!item) return null;

  item.reminderSet = true;
  item.reminderDate = reminderDate;

  return item;
}

export function updateWishlistNotes(userId: string, wishlistItemId: string, notes: string): WishlistItem | null {
  const userWishlist = wishlists.get(userId);
  if (!userWishlist) return null;

  const item = userWishlist.find((w) => w.id === wishlistItemId);
  if (!item) return null;

  item.notes = notes;
  return item;
}

export function getWishlistStats(userId: string) {
  const userWishlist = getWishlist(userId);
  const byServiceType = {} as Record<string, number>;

  userWishlist.forEach((item) => {
    byServiceType[item.serviceType] = (byServiceType[item.serviceType] || 0) + 1;
  });

  const totalValue = userWishlist.reduce((sum, item) => sum + item.price, 0);

  return {
    totalItems: userWishlist.length,
    byServiceType,
    totalValue,
    averagePrice: userWishlist.length > 0 ? totalValue / userWishlist.length : 0,
    itemsWithReminders: userWishlist.filter((w) => w.reminderSet).length,
  };
}

// ============================================
// COMPARISON MANAGEMENT
// ============================================

const comparisons: Map<string, Comparison> = new Map();

export function createComparison(
  userId: string,
  name: string,
  serviceType: string
): Comparison {
  const comparison: Comparison = {
    id: `comp_${Date.now()}`,
    userId,
    name,
    serviceType: serviceType as any,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  comparisons.set(comparison.id, comparison);
  return comparison;
}

export function addToComparison(
  comparisonId: string,
  serviceId: string,
  serviceName: string,
  price: number,
  rating: number,
  features: Record<string, any>
): Comparison | null {
  const comparison = comparisons.get(comparisonId);
  if (!comparison) return null;

  const item: ComparisonItem = {
    serviceId,
    serviceName,
    price,
    rating,
    features,
  };

  comparison.items.push(item);
  comparison.updatedAt = new Date();

  comparisons.set(comparisonId, comparison);
  return comparison;
}

export function removeFromComparison(comparisonId: string, serviceId: string): Comparison | null {
  const comparison = comparisons.get(comparisonId);
  if (!comparison) return null;

  const index = comparison.items.findIndex((item) => item.serviceId === serviceId);
  if (index === -1) return null;

  comparison.items.splice(index, 1);
  comparison.updatedAt = new Date();

  comparisons.set(comparisonId, comparison);
  return comparison;
}

export function getComparison(comparisonId: string): Comparison | null {
  return comparisons.get(comparisonId) || null;
}

export function getUserComparisons(userId: string): Comparison[] {
  return Array.from(comparisons.values()).filter((c) => c.userId === userId);
}

export function deleteComparison(comparisonId: string): boolean {
  return comparisons.delete(comparisonId);
}

// ============================================
// COMPARISON ANALYSIS
// ============================================

export function getComparisonAnalysis(comparisonId: string) {
  const comparison = getComparison(comparisonId);
  if (!comparison || comparison.items.length === 0) return null;

  const prices = comparison.items.map((item) => item.price);
  const ratings = comparison.items.map((item) => item.rating);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  const bestValue = comparison.items.reduce((best, current) => {
    const currentScore = current.rating / current.price;
    const bestScore = best.rating / best.price;
    return currentScore > bestScore ? current : best;
  });

  const bestRated = comparison.items.reduce((best, current) => {
    return current.rating > best.rating ? current : best;
  });

  const cheapest = comparison.items.reduce((best, current) => {
    return current.price < best.price ? current : best;
  });

  return {
    totalItems: comparison.items.length,
    priceRange: {
      min: minPrice,
      max: maxPrice,
      average: avgPrice,
      difference: maxPrice - minPrice,
    },
    ratingRange: {
      min: minRating,
      max: maxRating,
      average: avgRating,
    },
    recommendations: {
      bestValue: bestValue.serviceName,
      bestRated: bestRated.serviceName,
      cheapest: cheapest.serviceName,
    },
    featureComparison: getFeatureComparison(comparison.items),
  };
}

function getFeatureComparison(items: ComparisonItem[]): Record<string, any> {
  const allFeatures = new Set<string>();

  items.forEach((item) => {
    Object.keys(item.features).forEach((feature) => {
      allFeatures.add(feature);
    });
  });

  const comparison: Record<string, any> = {};

  allFeatures.forEach((feature) => {
    comparison[feature] = items.map((item) => ({
      service: item.serviceName,
      value: item.features[feature] || 'N/A',
    }));
  });

  return comparison;
}

// ============================================
// EXPORT & SHARING
// ============================================

export function exportComparison(comparisonId: string, format: 'json' | 'csv' = 'json'): string {
  const comparison = getComparison(comparisonId);
  if (!comparison) return '';

  if (format === 'json') {
    return JSON.stringify(comparison, null, 2);
  }

  // CSV format
  let csv = 'Service Name,Price,Rating\n';
  comparison.items.forEach((item) => {
    csv += `${item.serviceName},${item.price},${item.rating}\n`;
  });

  return csv;
}

export function shareComparison(comparisonId: string, email: string): boolean {
  const comparison = getComparison(comparisonId);
  if (!comparison) return false;

  // TODO: Send email with comparison details
  console.log(`Sharing comparison ${comparisonId} with ${email}`);

  return true;
}

// ============================================
// WISHLIST NOTIFICATIONS
// ============================================

export function getPriceDropNotifications(userId: string): WishlistItem[] {
  const userWishlist = getWishlist(userId);

  // TODO: Compare with current prices and find items with price drops
  return userWishlist.filter((item) => {
    // Placeholder logic
    return Math.random() > 0.5;
  });
}

export function getWishlistReminders(daysUntil: number = 1): WishlistItem[] {
  const allWishlists = Array.from(wishlists.values()).flat();
  const now = new Date();
  const targetDate = new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);

  return allWishlists.filter((item) => {
    if (!item.reminderSet || !item.reminderDate) return false;

    const timeDiff = Math.abs(item.reminderDate.getTime() - targetDate.getTime());
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return daysDiff <= daysUntil;
  });
}
