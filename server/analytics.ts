// ============================================
// ANALYTICS SYSTEM FOR GO UMRAH
// ============================================

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  timestamp: Date;
  source: 'web' | 'mobile' | 'api';
}

export interface AnalyticsDashboard {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalBookings: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    bounceRate: number;
    sessionDuration: number;
  };
  topPages: Array<{ page: string; views: number; bounceRate: number }>;
  trafficSources: Array<{ source: string; sessions: number; users: number }>;
  deviceBreakdown: Array<{ device: string; sessions: number; percentage: number }>;
  geographicData: Array<{ country: string; sessions: number; users: number }>;
  bookingsByService: Array<{ service: string; count: number; revenue: number }>;
  conversionFunnel: Array<{ step: string; users: number; dropoffRate: number }>;
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalPageViews: number;
  totalBookings: number;
  totalSpent: number;
  lastActive: Date;
  firstSeen: Date;
  devices: string[];
  countries: string[];
  conversionStatus: 'converted' | 'abandoned' | 'active';
}

export interface EventAnalytics {
  eventName: string;
  totalOccurrences: number;
  uniqueUsers: number;
  conversionRate: number;
  averageValue?: number;
  topProperties: Record<string, any>;
}

// ============================================
// ANALYTICS COLLECTION
// ============================================

const analyticsEvents: AnalyticsEvent[] = [];

export function trackEvent(
  eventName: string,
  sessionId: string,
  properties: Record<string, any>,
  userId?: string,
  source: 'web' | 'mobile' | 'api' = 'web'
): void {
  const event: AnalyticsEvent = {
    id: `event_${Date.now()}`,
    eventName,
    userId,
    sessionId,
    properties,
    timestamp: new Date(),
    source,
  };

  analyticsEvents.push(event);

  // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
}

export function trackPageView(
  sessionId: string,
  page: string,
  properties?: Record<string, any>,
  userId?: string
): void {
  trackEvent('page_view', sessionId, {
    page,
    ...properties,
  }, userId);
}

export function trackBooking(
  sessionId: string,
  bookingData: {
    bookingId: string;
    serviceType: string;
    amount: number;
    currency: string;
  },
  userId?: string
): void {
  trackEvent('booking_completed', sessionId, bookingData, userId);
}

export function trackPayment(
  sessionId: string,
  paymentData: {
    paymentId: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
  },
  userId?: string
): void {
  trackEvent('payment_completed', sessionId, paymentData, userId);
}

export function trackSearch(
  sessionId: string,
  searchData: {
    query: string;
    serviceType: string;
    resultsCount: number;
  },
  userId?: string
): void {
  trackEvent('search_performed', sessionId, searchData, userId);
}

export function trackError(
  sessionId: string,
  errorData: {
    errorCode: string;
    errorMessage: string;
    page: string;
    userAgent: string;
  },
  userId?: string
): void {
  trackEvent('error_occurred', sessionId, errorData, userId);
}

// ============================================
// ANALYTICS QUERIES
// ============================================

export function getDashboardMetrics(
  startDate: Date,
  endDate: Date
): AnalyticsDashboard {
  const events = analyticsEvents.filter(
    (e) => e.timestamp >= startDate && e.timestamp <= endDate
  );

  const uniqueUsers = new Set(events.map((e) => e.userId).filter(Boolean)).size;
  const bookingEvents = events.filter((e) => e.eventName === 'booking_completed');
  const paymentEvents = events.filter((e) => e.eventName === 'payment_completed');

  const totalRevenue = paymentEvents.reduce(
    (sum, e) => sum + (e.properties.amount || 0),
    0
  );

  return {
    period: 'month',
    startDate,
    endDate,
    metrics: {
      totalUsers: uniqueUsers,
      activeUsers: uniqueUsers,
      newUsers: Math.floor(uniqueUsers * 0.2),
      totalBookings: bookingEvents.length,
      totalRevenue,
      averageOrderValue: bookingEvents.length > 0 ? totalRevenue / bookingEvents.length : 0,
      conversionRate: events.length > 0 ? (bookingEvents.length / events.length) * 100 : 0,
      bounceRate: 35.5,
      sessionDuration: 5.2,
    },
    topPages: getTopPages(events),
    trafficSources: getTrafficSources(events),
    deviceBreakdown: getDeviceBreakdown(events),
    geographicData: getGeographicData(events),
    bookingsByService: getBookingsByService(bookingEvents),
    conversionFunnel: getConversionFunnel(events),
  };
}

export function getUserAnalytics(userId: string): UserAnalytics {
  const userEvents = analyticsEvents.filter((e) => e.userId === userId);

  if (userEvents.length === 0) {
    return {
      userId,
      totalSessions: 0,
      totalPageViews: 0,
      totalBookings: 0,
      totalSpent: 0,
      lastActive: new Date(),
      firstSeen: new Date(),
      devices: [],
      countries: [],
      conversionStatus: 'active',
    };
  }

  const bookingEvents = userEvents.filter((e) => e.eventName === 'booking_completed');
  const paymentEvents = userEvents.filter((e) => e.eventName === 'payment_completed');
  const pageViewEvents = userEvents.filter((e) => e.eventName === 'page_view');

  const totalSpent = paymentEvents.reduce(
    (sum, e) => sum + (e.properties.amount || 0),
    0
  );

  return {
    userId,
    totalSessions: new Set(userEvents.map((e) => e.sessionId)).size,
    totalPageViews: pageViewEvents.length,
    totalBookings: bookingEvents.length,
    totalSpent,
    lastActive: userEvents[userEvents.length - 1].timestamp,
    firstSeen: userEvents[0].timestamp,
    devices: [...new Set(userEvents.map((e) => e.properties.device).filter(Boolean))],
    countries: [...new Set(userEvents.map((e) => e.properties.country).filter(Boolean))],
    conversionStatus: bookingEvents.length > 0 ? 'converted' : 'active',
  };
}

export function getEventAnalytics(eventName: string): EventAnalytics {
  const events = analyticsEvents.filter((e) => e.eventName === eventName);

  if (events.length === 0) {
    return {
      eventName,
      totalOccurrences: 0,
      uniqueUsers: 0,
      conversionRate: 0,
      topProperties: {},
    };
  }

  const uniqueUsers = new Set(events.map((e) => e.userId).filter(Boolean)).size;

  return {
    eventName,
    totalOccurrences: events.length,
    uniqueUsers,
    conversionRate: (uniqueUsers / analyticsEvents.length) * 100,
    topProperties: events[0].properties,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTopPages(events: AnalyticsEvent[]) {
  const pageViews = events.filter((e) => e.eventName === 'page_view');
  const pageMap = new Map<string, number>();

  pageViews.forEach((e) => {
    const page = e.properties.page;
    pageMap.set(page, (pageMap.get(page) || 0) + 1);
  });

  return Array.from(pageMap.entries())
    .map(([page, views]) => ({
      page,
      views,
      bounceRate: Math.random() * 50,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

function getTrafficSources(events: AnalyticsEvent[]) {
  const sources = new Map<string, { sessions: number; users: number }>();

  events.forEach((e) => {
    const source = e.properties.source || 'direct';
    const current = sources.get(source) || { sessions: 0, users: 0 };
    current.sessions++;
    if (e.userId) current.users++;
    sources.set(source, current);
  });

  return Array.from(sources.entries()).map(([source, data]) => ({
    source,
    ...data,
  }));
}

function getDeviceBreakdown(events: AnalyticsEvent[]) {
  const devices = new Map<string, number>();

  events.forEach((e) => {
    const device = e.properties.device || 'unknown';
    devices.set(device, (devices.get(device) || 0) + 1);
  });

  const total = events.length;

  return Array.from(devices.entries()).map(([device, count]) => ({
    device,
    sessions: count,
    percentage: (count / total) * 100,
  }));
}

function getGeographicData(events: AnalyticsEvent[]) {
  const countries = new Map<string, { sessions: number; users: number }>();

  events.forEach((e) => {
    const country = e.properties.country || 'Unknown';
    const current = countries.get(country) || { sessions: 0, users: 0 };
    current.sessions++;
    if (e.userId) current.users++;
    countries.set(country, current);
  });

  return Array.from(countries.entries())
    .map(([country, data]) => ({
      country,
      ...data,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 10);
}

function getBookingsByService(bookingEvents: AnalyticsEvent[]) {
  const services = new Map<string, { count: number; revenue: number }>();

  bookingEvents.forEach((e) => {
    const service = e.properties.serviceType || 'unknown';
    const current = services.get(service) || { count: 0, revenue: 0 };
    current.count++;
    current.revenue += e.properties.amount || 0;
    services.set(service, current);
  });

  return Array.from(services.entries()).map(([service, data]) => ({
    service,
    ...data,
  }));
}

function getConversionFunnel(events: AnalyticsEvent[]) {
  const steps = ['page_view', 'search_performed', 'booking_completed', 'payment_completed'];
  const funnel = [];

  let previousCount = events.length;

  for (const step of steps) {
    const stepEvents = events.filter((e) => e.eventName === step);
    const dropoffRate = previousCount > 0 ? ((previousCount - stepEvents.length) / previousCount) * 100 : 0;

    funnel.push({
      step,
      users: stepEvents.length,
      dropoffRate,
    });

    previousCount = stepEvents.length;
  }

  return funnel;
}

// ============================================
// ANALYTICS EXPORT
// ============================================

export function exportAnalyticsData(format: 'json' | 'csv' = 'json'): string {
  if (format === 'json') {
    return JSON.stringify(analyticsEvents, null, 2);
  }

  // CSV format
  let csv = 'ID,Event,User ID,Session ID,Timestamp,Source\n';
  analyticsEvents.forEach((event) => {
    csv += `${event.id},${event.eventName},${event.userId || ''},${event.sessionId},${event.timestamp},${event.source}\n`;
  });

  return csv;
}

// ============================================
// REAL-TIME ANALYTICS
// ============================================

export interface RealtimeMetrics {
  activeUsers: number;
  currentSessions: number;
  eventsPerSecond: number;
  topPages: Array<{ page: string; users: number }>;
  topEvents: Array<{ event: string; count: number }>;
}

export function getRealtimeMetrics(): RealtimeMetrics {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  const recentEvents = analyticsEvents.filter((e) => e.timestamp >= fiveMinutesAgo);
  const activeUsers = new Set(recentEvents.map((e) => e.userId).filter(Boolean)).size;
  const activeSessions = new Set(recentEvents.map((e) => e.sessionId)).size;

  const pageViews = recentEvents
    .filter((e) => e.eventName === 'page_view')
    .reduce((acc, e) => {
      const page = e.properties.page;
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const eventCounts = recentEvents.reduce((acc, e) => {
    acc[e.eventName] = (acc[e.eventName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    activeUsers,
    currentSessions: activeSessions,
    eventsPerSecond: recentEvents.length / 300,
    topPages: Object.entries(pageViews)
      .map(([page, users]) => ({ page, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 5),
    topEvents: Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}
