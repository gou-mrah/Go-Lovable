/**
 * liteAPI Integration Module
 * Handles hotel search, details, and booking operations via liteAPI with Standard Authentication
 * Using v3.0 API endpoints
 */

const LITEAPI_URL = "https://api.liteapi.travel";
const API_KEY = process.env.LITEAPI_KEY;

if (!API_KEY) {
  console.warn("⚠️ LITEAPI_KEY not set in environment variables");
}

/**
 * Make a request to liteAPI with Standard Authentication (X-API-Key header)
 */
async function makeRequest<T>(
  method: string,
  endpoint: string,
  body?: any
): Promise<T> {
  if (!API_KEY) {
    throw new Error("liteAPI key not set");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };

  const url = `${LITEAPI_URL}${endpoint}`;

  console.log(`[liteAPI] ${method} ${endpoint}`);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[liteAPI Error ${response.status}]:`, error);
      throw new Error(`liteAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("[liteAPI request error]:", error);
    throw error;
  }
}

/**
 * Search for places (cities)
 */
export async function searchPlaces(query: string, language: string = "en") {
  return makeRequest<any>("GET", `/v3.0/places?query=${encodeURIComponent(query)}&language=${language}`);
}

/**
 * Search for hotel rates and availability
 * This is the main endpoint for finding bookable hotel rooms with real-time pricing
 */
export async function searchHotels(params: {
  checkIn: string;
  checkOut: string;
  occupancies: Array<{
    paxes: Array<{ age: number }>;
  }>;
  currency: string;
  guestNationality: string;
  cityName?: string;
  countryCode?: string;
  hotelIds?: string[];
  includeHotelData?: boolean;
  limit?: number;
}) {
  // Transform occupancies to match liteAPI v3.0 format
  const transformedOccupancies = params.occupancies.map(occ => {
    const adults = occ.paxes.filter(p => p.age >= 18).length;
    const children = occ.paxes.filter(p => p.age < 18).map(p => p.age);
    return {
      adults,
      children
    };
  });

  // Ensure countryCode is set (default to SA for Saudi Arabia)
  const payload = {
    ...params,
    occupancies: transformedOccupancies,
    countryCode: params.countryCode || 'SA'
  };

  return makeRequest<any>("POST", "/v3.0/hotels/rates", payload);
}

/**
 * Get hotel details
 */
export async function getHotelDetails(hotelId: string) {
  return makeRequest<any>("GET", `/v3.0/hotels/${hotelId}`);
}

/**
 * Get hotel reviews
 */
export async function getHotelReviews(hotelId: string, limit: number = 10) {
  return makeRequest<any>("GET", `/v3.0/hotels/${hotelId}/reviews?limit=${limit}`);
}

/**
 * Create a prebook (check availability and price) - Step 1 of booking
 */
export async function createPrebook(params: {
  checkIn: string;
  checkOut: string;
  occupancies: Array<{
    paxes: Array<{ age: number }>;
  }>;
  hotelId: string;
  rateId: string;
  roomId: string;
  currency: string;
  guestNationality: string;
}) {
  return makeRequest<any>("POST", "/v3.0/prebook", params);
}

/**
 * Confirm a booking - Step 2 of booking
 */
export async function confirmBooking(params: {
  prebookId: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry?: string;
  paymentMethod?: string;
}) {
  return makeRequest<any>("POST", "/v3.0/booking", params);
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  return makeRequest<any>("PUT", `/v3.0/booking/${bookingId}`, {
    reason,
  });
}

/**
 * Get booking details
 */
export async function getBookingDetails(bookingId: string) {
  return makeRequest<any>("GET", `/v3.0/booking/${bookingId}`);
}

/**
 * Get prebook details
 */
export async function getPrebookDetails(prebookId: string) {
  return makeRequest<any>("GET", `/v3.0/prebook/${prebookId}`);
}
