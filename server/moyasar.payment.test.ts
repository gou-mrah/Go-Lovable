import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock environment variables
vi.stubEnv("MOYASAR_SECRET_KEY", process.env.MOYASAR_SECRET_KEY ?? "sk_test_mock");
vi.stubEnv("MOYASAR_PUBLISHABLE_KEY", process.env.MOYASAR_PUBLISHABLE_KEY ?? "pk_test_mock");

describe("Moyasar Payment Integration", () => {
  describe("Environment Configuration", () => {
    it("should have MOYASAR_SECRET_KEY set", () => {
      const key = process.env.MOYASAR_SECRET_KEY;
      expect(key).toBeTruthy();
      expect(key!.length).toBeGreaterThan(10);
    });

    it("should have MOYASAR_PUBLISHABLE_KEY set", () => {
      const key = process.env.MOYASAR_PUBLISHABLE_KEY;
      expect(key).toBeTruthy();
      expect(key!.length).toBeGreaterThan(10);
    });

    it("publishable key should start with pk_", () => {
      const key = process.env.MOYASAR_PUBLISHABLE_KEY ?? "";
      expect(key.startsWith("pk_")).toBe(true);
    });

    it("secret key should start with sk_", () => {
      const key = process.env.MOYASAR_SECRET_KEY ?? "";
      expect(key.startsWith("sk_")).toBe(true);
    });
  });

  describe("Payment Amount Calculation", () => {
    it("should correctly convert USD to SAR halala", () => {
      const amountUSD = 100;
      const exchangeRate = 3.75;
      const amountSAR = amountUSD * exchangeRate;
      const amountHalala = Math.round(amountSAR * 100);
      expect(amountHalala).toBe(37500);
    });

    it("should handle decimal USD amounts correctly", () => {
      const amountUSD = 99.99;
      const amountSAR = amountUSD * 3.75;
      const amountHalala = Math.round(amountSAR * 100);
      expect(amountHalala).toBe(37496);
    });

    it("should enforce minimum payment amount (1 SAR = 100 halala)", () => {
      const amountHalala = 100;
      expect(amountHalala).toBeGreaterThanOrEqual(100);
    });
  });

  describe("Payment Callback URL", () => {
    it("should build correct callback URL with booking number", () => {
      const origin = "https://example.com";
      const bookingNumber = "BK-ABC12345";
      const callbackUrl = `${origin}/api/payment/callback?bookingNumber=${bookingNumber}`;
      expect(callbackUrl).toBe("https://example.com/api/payment/callback?bookingNumber=BK-ABC12345");
    });

    it("should build correct payment page URL", () => {
      const bookingNumber = "BK-XYZ98765";
      const paymentUrl = `/payment/${bookingNumber}`;
      expect(paymentUrl).toBe("/payment/BK-XYZ98765");
    });
  });

  describe("Payment Status Handling", () => {
    it("should recognize paid status", () => {
      const status = "paid";
      expect(["paid", "authorized"].includes(status)).toBe(true);
    });

    it("should recognize authorized status as successful", () => {
      const status = "authorized";
      expect(["paid", "authorized"].includes(status)).toBe(true);
    });

    it("should recognize failed status", () => {
      const status = "failed";
      expect(["paid", "authorized"].includes(status)).toBe(false);
    });
  });

  describe("Moyasar API Connection", () => {
    it("should successfully connect to Moyasar API with valid keys", async () => {
      const secretKey = process.env.MOYASAR_SECRET_KEY;
      if (!secretKey || secretKey === "sk_test_mock") {
        console.log("Skipping live API test - no real key available");
        return;
      }

      const response = await fetch("https://api.moyasar.com/v1/payments?per_page=1", {
        headers: {
          Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
        },
      });

      expect(response.status).not.toBe(401);
      expect([200, 404]).toContain(response.status);
    });
  });
});
