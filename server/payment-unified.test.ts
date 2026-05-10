import { describe, it, expect, vi, beforeEach } from "vitest";
import { createUnifiedPayment, verifyUnifiedPayment, getUnifiedPaymentStatus } from "./payment-unified";
import * as moyasarModule from "./moyasar";

// Mock Moyasar module
vi.mock("./moyasar", () => ({
  createInvoice: vi.fn(),
  getInvoice: vi.fn(),
}));

// Mock database
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve(null)),
}));

describe("Unified Payment System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createUnifiedPayment", () => {
    it("should create invoice with correct parameters for booking", async () => {
      const mockInvoice = {
        id: "inv_test_123",
        url: "https://checkout.moyasar.com/invoices/inv_test_123",
        status: "pending",
      };

      vi.mocked(moyasarModule.createInvoice).mockResolvedValue(mockInvoice);

      const result = await createUnifiedPayment({
        serviceType: "booking",
        serviceId: 1,
        amount: 1500,
        description: "حجز عمرة",
        callbackUrl: "https://go-umrah.com/callback",
        backUrl: "https://go-umrah.com/voucher",
      });

      expect(result).toEqual({
        invoiceId: "inv_test_123",
        checkoutUrl: "https://checkout.moyasar.com/invoices/inv_test_123",
        amount: 1500,
        currency: "SAR",
      });

      expect(moyasarModule.createInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 150000, // 1500 SAR = 150000 Halala
          currency: "SAR",
          description: "حجز عمرة",
          callback_url: "https://go-umrah.com/callback",
          back_url: "https://go-umrah.com/voucher",
        })
      );
    });

    it("should create invoice with correct parameters for order", async () => {
      const mockInvoice = {
        id: "inv_order_456",
        url: "https://checkout.moyasar.com/invoices/inv_order_456",
        status: "pending",
      };

      vi.mocked(moyasarModule.createInvoice).mockResolvedValue(mockInvoice);

      const result = await createUnifiedPayment({
        serviceType: "order",
        serviceId: 2,
        amount: 500,
        description: "طلب منتجات",
        callbackUrl: "https://go-umrah.com/callback",
        backUrl: "https://go-umrah.com/orders",
      });

      expect(result.invoiceId).toBe("inv_order_456");
      expect(result.amount).toBe(500);
    });

    it("should create invoice with correct parameters for visa", async () => {
      const mockInvoice = {
        id: "inv_visa_789",
        url: "https://checkout.moyasar.com/invoices/inv_visa_789",
        status: "pending",
      };

      vi.mocked(moyasarModule.createInvoice).mockResolvedValue(mockInvoice);

      const result = await createUnifiedPayment({
        serviceType: "visa",
        serviceId: 3,
        amount: 250,
        description: "تأشيرة عمرة",
        callbackUrl: "https://go-umrah.com/callback",
        backUrl: "https://go-umrah.com/visas",
      });

      expect(result.invoiceId).toBe("inv_visa_789");
      expect(result.currency).toBe("SAR");
    });

    it("should include metadata with userId", async () => {
      const mockInvoice = {
        id: "inv_meta_001",
        url: "https://checkout.moyasar.com/invoices/inv_meta_001",
        status: "pending",
      };

      vi.mocked(moyasarModule.createInvoice).mockResolvedValue(mockInvoice);

      await createUnifiedPayment({
        serviceType: "booking",
        serviceId: 1,
        amount: 1000,
        description: "حجز",
        callbackUrl: "https://go-umrah.com/callback",
        backUrl: "https://go-umrah.com/voucher",
        metadata: { userId: "123" },
      });

      expect(moyasarModule.createInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            serviceType: "booking",
            serviceId: "1",
            userId: "123",
          }),
        })
      );
    });
  });

  describe("verifyUnifiedPayment", () => {
    it("should return success for paid invoice", async () => {
      const mockInvoice = {
        id: "inv_paid_001",
        status: "paid",
        amount: 150000,
        metadata: { serviceType: "booking", serviceId: "1" },
      };

      vi.mocked(moyasarModule.getInvoice).mockResolvedValue(mockInvoice);

      const result = await verifyUnifiedPayment("inv_paid_001", "booking", 1);

      expect(result.success).toBe(true);
      expect(result.status).toBe("paid");
    });

    it("should return failure for unpaid invoice", async () => {
      const mockInvoice = {
        id: "inv_pending_001",
        status: "pending",
        amount: 150000,
        metadata: { serviceType: "booking", serviceId: "1" },
      };

      vi.mocked(moyasarModule.getInvoice).mockResolvedValue(mockInvoice);

      const result = await verifyUnifiedPayment("inv_pending_001", "booking", 1);

      expect(result.success).toBe(false);
      expect(result.status).toBe("pending");
    });

    it("should handle failed payments", async () => {
      const mockInvoice = {
        id: "inv_failed_001",
        status: "failed",
        amount: 150000,
        metadata: { serviceType: "booking", serviceId: "1" },
      };

      vi.mocked(moyasarModule.getInvoice).mockResolvedValue(mockInvoice);

      const result = await verifyUnifiedPayment("inv_failed_001", "booking", 1);

      expect(result.success).toBe(false);
      expect(result.status).toBe("failed");
    });
  });

  describe("getUnifiedPaymentStatus", () => {
    it("should return null when database is unavailable", async () => {
      const result = await getUnifiedPaymentStatus("booking", 1);
      expect(result).toBeNull();
    });
  });

  describe("Amount conversion", () => {
    it("should correctly convert SAR to Halala", async () => {
      const mockInvoice = {
        id: "inv_convert_001",
        url: "https://checkout.moyasar.com/invoices/inv_convert_001",
        status: "pending",
      };

      vi.mocked(moyasarModule.createInvoice).mockResolvedValue(mockInvoice);

      await createUnifiedPayment({
        serviceType: "booking",
        serviceId: 1,
        amount: 100, // 100 SAR
        description: "حجز",
        callbackUrl: "https://go-umrah.com/callback",
        backUrl: "https://go-umrah.com/voucher",
      });

      expect(moyasarModule.createInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000, // 100 SAR = 10000 Halala
        })
      );
    });

    it("should handle decimal amounts correctly", async () => {
      const mockInvoice = {
        id: "inv_decimal_001",
        url: "https://checkout.moyasar.com/invoices/inv_decimal_001",
        status: "pending",
      };

      vi.mocked(moyasarModule.createInvoice).mockResolvedValue(mockInvoice);

      await createUnifiedPayment({
        serviceType: "order",
        serviceId: 1,
        amount: 99.99, // 99.99 SAR
        description: "طلب",
        callbackUrl: "https://go-umrah.com/callback",
        backUrl: "https://go-umrah.com/orders",
      });

      expect(moyasarModule.createInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 9999, // 99.99 SAR = 9999 Halala (rounded)
        })
      );
    });
  });
});
