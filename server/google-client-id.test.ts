import { describe, it, expect } from "vitest";

describe("Google OAuth Configuration", () => {
  it("VITE_GOOGLE_CLIENT_ID should be set in environment", () => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    expect(clientId).toBeTruthy();
    expect(typeof clientId).toBe("string");
    expect(clientId!.length).toBeGreaterThan(10);
    console.log("VITE_GOOGLE_CLIENT_ID is set:", clientId ? `YES (length: ${clientId.length})` : "NO");
  });
});
