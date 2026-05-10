import { describe, it, expect } from "vitest";

describe("liteAPI New Keys Validation", () => {
  it("should validate that new liteAPI key works with Standard Authentication", async () => {
    const apiKey = process.env.LITEAPI_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey?.length).toBeGreaterThan(0);

    // Test with a simple endpoint to validate the key
    const response = await globalThis.fetch("https://api.liteapi.travel/v3.0/hotels/rates", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hotelIds: ["123"],
        checkInDate: "2026-04-15",
        checkOutDate: "2026-04-16",
        guests: [{ age: 30 }],
      }),
    });

    // Should not be 401 Unauthorized
    expect(response.status).not.toBe(401);
    console.log(`✅ liteAPI key validation successful (Status: ${response.status})`);
  });

  it("should validate that new liteAPI public key is defined", () => {
    const publicKey = process.env.LITEAPI_PUBLIC_KEY;
    expect(publicKey).toBeDefined();
    expect(publicKey?.startsWith("prod_public_")).toBe(true);
    console.log(`✅ liteAPI public key is valid`);
  });
});
