import { describe, it, expect } from "vitest";
import crypto from "crypto";

describe("liteAPI HMAC Authentication", () => {
  it("should have both LITEAPI keys in environment", () => {
    expect(process.env.LITEAPI_PRIVATE_KEY).toBeDefined();
    expect(process.env.LITEAPI_PUBLIC_KEY).toBeDefined();
    expect(process.env.LITEAPI_PRIVATE_KEY).toMatch(/^prod_/);
    expect(process.env.LITEAPI_PUBLIC_KEY).toMatch(/^prod_public_/);
  });

  it("should be able to generate HMAC signature", () => {
    const privateKey = process.env.LITEAPI_PRIVATE_KEY;
    if (!privateKey) throw new Error("LITEAPI_PRIVATE_KEY not set");

    const message = "test-message";
    const signature = crypto
      .createHmac("sha256", privateKey)
      .update(message)
      .digest("hex");

    expect(signature).toBeDefined();
    expect(signature.length).toBeGreaterThan(0);
  });

  it("should be able to reach liteAPI with HMAC authentication", async () => {
    const privateKey = process.env.LITEAPI_PRIVATE_KEY;
    const publicKey = process.env.LITEAPI_PUBLIC_KEY;
    if (!privateKey || !publicKey) {
      throw new Error("liteAPI keys not set");
    }

    // Create a simple request
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const message = `GET/v1/search/places${timestamp}`;
    const signature = crypto
      .createHmac("sha256", privateKey)
      .update(message)
      .digest("hex");

    const response = await fetch("https://api.liteapi.travel/v1/search/places?query=makkah", {
      method: "GET",
      headers: {
        "X-Signature": signature,
        "X-Public-Key": publicKey,
        "X-Timestamp": timestamp,
        "Content-Type": "application/json",
      },
    });

    // We expect 200, 400, or 404 but NOT 401 (unauthorized)
    expect([200, 400, 404, 422]).toContain(response.status);
    expect(response.status).not.toBe(401);
  });
});
