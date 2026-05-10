# Go Umrah API Documentation

## Base URL
```
https://api.goumrah.com/v1
```

## Authentication
All API requests require an Authorization header with a valid JWT token:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Hotels API

### Search Hotels
**Endpoint:** `POST /hotels/search`

**Request Body:**
```json
{
  "destination": "Makkah",
  "checkIn": "2026-05-01",
  "checkOut": "2026-05-10",
  "guests": 2,
  "rooms": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "hotel_123",
      "name": "Al-Noor Hotel",
      "city": "Makkah",
      "rating": 4.5,
      "price": 150,
      "currency": "USD",
      "distance": 0.5,
      "amenities": ["WiFi", "Restaurant", "Parking"]
    }
  ]
}
```

### Get Hotel Details
**Endpoint:** `GET /hotels/:hotelId`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "hotel_123",
    "name": "Al-Noor Hotel",
    "description": "Luxury hotel near Haram",
    "rating": 4.5,
    "reviews": 250,
    "rooms": [
      {
        "id": "room_1",
        "type": "Deluxe",
        "price": 150,
        "capacity": 2,
        "amenities": []
      }
    ]
  }
}
```

### Book Hotel
**Endpoint:** `POST /hotels/bookings`

**Request Body:**
```json
{
  "hotelId": "hotel_123",
  "roomId": "room_1",
  "checkIn": "2026-05-01",
  "checkOut": "2026-05-10",
  "guests": [
    {
      "firstName": "Ahmed",
      "lastName": "Ali",
      "email": "ahmed@example.com",
      "phone": "+966XXXXXXXXX"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "status": "confirmed",
    "totalPrice": 1500,
    "currency": "USD"
  }
}
```

---

## Flights API

### Search Flights
**Endpoint:** `POST /flights/search`

**Request Body:**
```json
{
  "from": "JED",
  "to": "CAI",
  "departDate": "2026-05-01",
  "returnDate": "2026-05-10",
  "passengers": 2,
  "cabinClass": "economy"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "flight_123",
      "airline": "Saudi Airlines",
      "flightNumber": "SV123",
      "departure": "2026-05-01T10:00:00Z",
      "arrival": "2026-05-01T14:00:00Z",
      "price": 300,
      "currency": "USD",
      "stops": 0
    }
  ]
}
```

### Book Flight
**Endpoint:** `POST /flights/bookings`

**Request Body:**
```json
{
  "flightId": "flight_123",
  "passengers": [
    {
      "firstName": "Ahmed",
      "lastName": "Ali",
      "passportNumber": "XXXXX",
      "dateOfBirth": "1990-01-01"
    }
  ]
}
```

---

## Packages API

### Get Packages
**Endpoint:** `GET /packages?type=umrah&duration=7`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "package_123",
      "name": "7-Day Umrah Package",
      "type": "umrah",
      "duration": 7,
      "price": 1500,
      "currency": "USD",
      "includes": ["Hotel", "Flights", "Visa", "Tours"],
      "rating": 4.8
    }
  ]
}
```

### Book Package
**Endpoint:** `POST /packages/bookings`

**Request Body:**
```json
{
  "packageId": "package_123",
  "participants": 2,
  "startDate": "2026-05-01"
}
```

---

## Visas API

### Get Visa Types
**Endpoint:** `GET /visas`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "visa_1",
      "type": "Umrah Visa",
      "duration": "30 days",
      "price": 100,
      "processingTime": "3-5 days",
      "requirements": ["Passport", "Photo", "Application Form"]
    }
  ]
}
```

### Apply for Visa
**Endpoint:** `POST /visas/applications`

**Request Body:**
```json
{
  "visaType": "umrah",
  "applicant": {
    "firstName": "Ahmed",
    "lastName": "Ali",
    "passportNumber": "XXXXX",
    "dateOfBirth": "1990-01-01",
    "nationality": "EG"
  }
}
```

---

## Bookings API

### Get My Bookings
**Endpoint:** `GET /bookings`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_123",
      "type": "hotel",
      "serviceName": "Al-Noor Hotel",
      "status": "confirmed",
      "startDate": "2026-05-01",
      "endDate": "2026-05-10",
      "totalPrice": 1500,
      "currency": "USD"
    }
  ]
}
```

### Cancel Booking
**Endpoint:** `DELETE /bookings/:bookingId`

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_123",
    "status": "cancelled",
    "refundAmount": 1500,
    "refundStatus": "processing"
  }
}
```

---

## Payments API

### Create Payment
**Endpoint:** `POST /payments`

**Request Body:**
```json
{
  "bookingId": "booking_123",
  "amount": 1500,
  "currency": "USD",
  "paymentMethod": "card"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "payment_123",
    "status": "pending",
    "paymentUrl": "https://payment.goumrah.com/pay/payment_123"
  }
}
```

### Get Invoice
**Endpoint:** `GET /payments/:paymentId/invoice`

**Response:**
```json
{
  "success": true,
  "data": {
    "invoiceNumber": "INV-2026-001",
    "date": "2026-04-17",
    "amount": 1500,
    "currency": "USD",
    "items": [
      {
        "description": "Hotel Booking",
        "amount": 1500
      }
    ]
  }
}
```

---

## Support API

### Create Support Ticket
**Endpoint:** `POST /support/tickets`

**Request Body:**
```json
{
  "subject": "Hotel booking issue",
  "category": "booking",
  "priority": "high",
  "message": "I need to modify my hotel booking"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ticketId": "ticket_123",
    "ticketNumber": "TKT-2026-001",
    "status": "open"
  }
}
```

### Get Support Tickets
**Endpoint:** `GET /support/tickets`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ticket_123",
      "ticketNumber": "TKT-2026-001",
      "subject": "Hotel booking issue",
      "status": "open",
      "createdAt": "2026-04-17T10:00:00Z",
      "updatedAt": "2026-04-17T11:00:00Z"
    }
  ]
}
```

---

## User API

### Get Profile
**Endpoint:** `GET /users/profile`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed@example.com",
    "phone": "+966XXXXXXXXX",
    "nationality": "EG",
    "passportNumber": "XXXXX"
  }
}
```

### Update Profile
**Endpoint:** `PUT /users/profile`

**Request Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Ali",
  "phone": "+966XXXXXXXXX"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Internal server error"
  }
}
```

---

## Rate Limiting

- **Limit:** 1000 requests per hour per API key
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Webhooks

### Supported Events
- `booking.created`
- `booking.cancelled`
- `payment.completed`
- `payment.failed`
- `notification.sent`

### Webhook Payload
```json
{
  "event": "booking.created",
  "timestamp": "2026-04-17T10:00:00Z",
  "data": {
    "bookingId": "booking_123",
    "status": "confirmed"
  }
}
```

---

## SDKs

### JavaScript/TypeScript
```bash
npm install @goumrah/sdk
```

### Python
```bash
pip install goumrah-sdk
```

### Java
```xml
<dependency>
  <groupId>com.goumrah</groupId>
  <artifactId>sdk</artifactId>
  <version>1.0.0</version>
</dependency>
```

---

## Support

- **Email:** api-support@goumrah.com
- **Phone:** +966-XX-XXXX-XXXX
- **Documentation:** https://docs.goumrah.com
- **Status Page:** https://status.goumrah.com

---

**Last Updated:** April 17, 2026
**API Version:** 1.0.0
