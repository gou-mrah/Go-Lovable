import { describe, it, expect } from "vitest";
import crypto from "crypto";

describe("liteAPI Keys Validation", () => {
  it("should validate liteAPI private and public keys", async () => {
    const privateKey = process.env.LITEAPI_PRIVATE_KEY;
    const publicKey = process.env.LITEAPI_PUBLIC_KEY;

    expect(privateKey).toBeDefined();
    expect(publicKey).toBeDefined();
    expect(privateKey).toBeTruthy();
    expect(publicKey).toBeTruthy();

    // Test with HMAC signature
    const method = "GET";
    const path = "/v3.0/places";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString("hex");

    const signatureString = `${method}\n${path}\n${publicKey}\n${nonce}\n${timestamp}`;
    const signature = crypto
      .createHmac("sha256", privateKey!)
      .update(signatureString)
      .digest("hex");

    console.log("✓ HMAC signature generated successfully");
    expect(signature).toBeTruthy();
    expect(signature.length).toBe(64); // SHA256 hex is 64 chars
  });
});
