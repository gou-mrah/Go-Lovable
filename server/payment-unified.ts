import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { bookings, orders, visaApplications } from "../drizzle/schema";
import { createInvoice } from "./moyasar";
import { ENV } from "./_core/env";

/**
 * Unified payment system that works with all service types
 * Supports: bookings (hajj/umrah/flights/hotels/vehicles/tours), orders, visas
 */

export type PaymentServiceType = 
  | "booking" // hajj, umrah, flight, hotel, vehicle, tour
  | "order"   // e-commerce
  | "visa";   // visa application

export interface CreateUnifiedPaymentInput {
  serviceType: PaymentServiceType;
  serviceId: number;            // booking ID, order ID, or visa ID
  amount: number;               // in SAR
  description: string;
  callbackUrl: string;
  backUrl: string;
  metadata?: Record<string, any>;
}

export interface UnifiedPaymentResult {
  invoiceId: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
}

/**
 * Create a unified invoice for any service type
 */
export async function createUnifiedPayment(input: CreateUnifiedPaymentInput): Promise<UnifiedPaymentResult> {
  const amountHalala = Math.round(input.amount * 100); // SAR to Halala (1 SAR = 100 Halala)

  const invoice = await createInvoice({
    amount: amountHalala,
    currency: "SAR",
    description: input.description,
    callback_url: input.callbackUrl,
    back_url: input.backUrl,
    metadata: {
      serviceType: input.serviceType,
      serviceId: String(input.serviceId),
      ...input.metadata,
    },
  });

  return {
    invoiceId: invoice.id,
    checkoutUrl: invoice.url,
    amount: input.amount,
    currency: "SAR",
  };
}

/**
 * Verify and update payment status for any service type
 * Called after user returns from Moyasar checkout
 */
export async function verifyUnifiedPayment(
  invoiceId: string,
  serviceType: PaymentServiceType,
  serviceId: number
): Promise<{ success: boolean; status: string }> {
  // Get payment status from Moyasar first (no DB required)
  const { getInvoice } = await import("./moyasar");
  const invoice = await getInvoice(invoiceId);

  // SECURITY: prevent IDOR — invoice metadata must match the supplied service.
  // Without this check, a user could pass another user's bookingId together
  // with their own paid invoiceId and mark anyone's record as paid.
  const meta = (invoice as any).metadata ?? {};
  if (meta.serviceType !== serviceType || String(meta.serviceId) !== String(serviceId)) {
    return { success: false, status: "metadata_mismatch" };
  }

  if (invoice.status !== "paid") {
    return { success: false, status: invoice.status };
  }

  // Only update DB if payment is confirmed
  const db = await getDb();
  if (!db) return { success: true, status: "paid" };

  const now = new Date();

  try {
    if (serviceType === "booking") {
      await db.update(bookings)
        .set({
          paymentStatus: "paid",
          status: "confirmed",
          paidAt: now,
          paymentIntentId: invoiceId,
        })
        .where(eq(bookings.id, serviceId));
    } else if (serviceType === "order") {
      await db.update(orders)
        .set({
          status: "confirmed",
          paymentIntentId: invoiceId,
          paidAt: now,
        })
        .where(eq(orders.id, serviceId));
    } else if (serviceType === "visa") {
      await db.update(visaApplications)
        .set({
          paymentStatus: "paid",
          paymentIntentId: invoiceId,
          paidAt: now,
        } as any)
        .where(eq(visaApplications.id, serviceId));
    }

    return { success: true, status: "paid" };
  } catch (error) {
    console.error("Payment verification error:", error);
    return { success: false, status: "update_failed" };
  }
}

/**
 * Get payment status for any service type
 */
export async function getUnifiedPaymentStatus(serviceType: PaymentServiceType, serviceId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    if (serviceType === "booking") {
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, serviceId)).limit(1);
      return booking ? { paymentStatus: booking.paymentStatus, paidAt: booking.paidAt } : null;
    } else if (serviceType === "order") {
      const [order] = await db.select().from(orders).where(eq(orders.id, serviceId)).limit(1);
      return order ? { paymentStatus: order.status, paidAt: order.paidAt } : null;
    } else if (serviceType === "visa") {
      const [visa] = await db.select().from(visaApplications).where(eq(visaApplications.id, serviceId)).limit(1);
      return visa ? { paymentStatus: visa.status, paidAt: visa.updatedAt } : null;
    }
  } catch (error) {
    console.error("Get payment status error:", error);
  }

  return null;
}
