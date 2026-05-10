import { describe, it, expect } from "vitest";
import crypto from "crypto";

const LITEAPI_URL = "https://api.liteapi.travel";
const PRIVATE_KEY = process.env.LITEAPI_PRIVATE_KEY || "";
const PUBLIC_KEY = process.env.LITEAPI_PUBLIC_KEY || "";

function generateHMACSignature(
  method: string,
  path: string,
  nonce: string,
  timestamp: string
): string {
  const signatureString = `${method}\n${path}\n${PUBLIC_KEY}\n${nonce}\n${timestamp}`;
  console.log("Signature String:", signatureString);
  return crypto
    .createHmac("sha256", PRIVATE_KEY)
    .update(signatureString)
    .digest("hex");
}

describe("liteAPI Debug", () => {
  it("should test liteAPI places endpoint with HMAC", async () => {
    const nonce = crypto.randomBytes(16).toString("hex");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path = "/v3.0/places?query=mecca&language=en";
    const signature = generateHMACSignature("GET", path, nonce, timestamp);

    console.log("Public Key:", PUBLIC_KEY);
    console.log("Nonce:", nonce);
    console.log("Timestamp:", timestamp);
    console.log("Signature:", signature);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Signature": signature,
      "X-Nonce": nonce,
      "X-Timestamp": timestamp,
      "X-API-Key": PUBLIC_KEY,
    };

    const url = `${LITEAPI_URL}${path}`;
    console.log("URL:", url);
    console.log("Headers:", headers);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      console.log("Response Status:", response.status);
      console.log("Response Headers:", Object.fromEntries(response.headers));

      const text = await response.text();
      console.log("Response Text:", text);

      if (text) {
        const data = JSON.parse(text);
        console.log("Response Data:", data);
        expect(data).toBeDefined();
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  });
});
