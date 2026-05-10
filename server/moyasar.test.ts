import { describe, it, expect } from "vitest";

// Test that Moyasar API keys are configured and the API is reachable
describe("Moyasar API Keys Validation", () => {
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

  it("should be able to reach Moyasar API with the secret key", async () => {
    const secretKey = process.env.MOYASAR_SECRET_KEY ?? "";
    if (!secretKey || secretKey.length < 10) {
      console.warn("Skipping Moyasar API test: no secret key configured");
      return;
    }
    const authHeader = "Basic " + Buffer.from(secretKey + ":").toString("base64");
    // List payments (returns empty array for new accounts) - lightweight check
    const res = await fetch("https://api.moyasar.com/v1/payments?per_page=1", {
      headers: { Authorization: authHeader },
    });
    // 200 = valid key, 401 = invalid key
    expect(res.status).not.toBe(401);
    expect([200, 404]).toContain(res.status);
  }, 15000);
});
