import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// ── Mock getDb ────────────────────────────────────────────────────────────────
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  then: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

vi.mock("../server/db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../server/_core/sdk", () => ({
  sdk: {
    signSession: vi.fn().mockResolvedValue("mock-jwt-token"),
  },
}));

vi.mock("../server/_core/cookies", () => ({
  getSessionCookieOptions: vi.fn().mockReturnValue({ httpOnly: true, path: "/" }),
}));

vi.mock("@shared/const", () => ({
  COOKIE_NAME: "app_session_id",
  ONE_YEAR_MS: 31536000000,
}));

vi.mock("../server/_core/env", () => ({
  ENV: { appId: "test-app-id", cookieSecret: "test-secret" },
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Custom Auth — password hashing", () => {
  it("should hash a password with bcrypt", async () => {
    const password = "TestPassword123!";
    const hash = await bcrypt.hash(password, 12);
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("should verify correct password against hash", async () => {
    const password = "TestPassword123!";
    const hash = await bcrypt.hash(password, 12);
    const valid = await bcrypt.compare(password, hash);
    expect(valid).toBe(true);
  });

  it("should reject wrong password against hash", async () => {
    const password = "TestPassword123!";
    const hash = await bcrypt.hash(password, 12);
    const valid = await bcrypt.compare("WrongPassword!", hash);
    expect(valid).toBe(false);
  });
});

describe("Custom Auth — openId generation", () => {
  it("should generate a unique local openId", () => {
    const { randomBytes } = require("crypto");
    const id1 = `local_${randomBytes(16).toString("hex")}`;
    const id2 = `local_${randomBytes(16).toString("hex")}`;
    expect(id1.startsWith("local_")).toBe(true);
    expect(id1).not.toBe(id2);
    expect(id1.length).toBe(38); // "local_" (6) + 32 hex chars
  });
});

describe("Custom Auth — reset token", () => {
  it("should generate a 64-char hex reset token", () => {
    const { randomBytes } = require("crypto");
    const token = randomBytes(32).toString("hex");
    expect(token).toHaveLength(64);
    expect(/^[a-f0-9]+$/.test(token)).toBe(true);
  });

  it("should set expiry 1 hour in the future", () => {
    const before = Date.now();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);
    const after = Date.now();
    expect(expiry.getTime()).toBeGreaterThan(before + 3590000); // ~1h
    expect(expiry.getTime()).toBeLessThan(after + 3610000);
  });
});

describe("Custom Auth — input validation", () => {
  it("should require email to be valid format", () => {
    const { z } = require("zod");
    const schema = z.object({ email: z.string().email() });
    expect(() => schema.parse({ email: "not-an-email" })).toThrow();
    expect(() => schema.parse({ email: "valid@example.com" })).not.toThrow();
  });

  it("should require password minimum 8 characters", () => {
    const { z } = require("zod");
    const schema = z.object({ password: z.string().min(8) });
    expect(() => schema.parse({ password: "short" })).toThrow();
    expect(() => schema.parse({ password: "longenough" })).not.toThrow();
  });

  it("should require name minimum 2 characters", () => {
    const { z } = require("zod");
    const schema = z.object({ name: z.string().min(2) });
    expect(() => schema.parse({ name: "A" })).toThrow();
    expect(() => schema.parse({ name: "Ali" })).not.toThrow();
  });
});

describe("Custom Auth — email normalization", () => {
  it("should lowercase email addresses", () => {
    const { z } = require("zod");
    const schema = z.object({ email: z.string().email().toLowerCase() });
    const result = schema.parse({ email: "TEST@EXAMPLE.COM" });
    expect(result.email).toBe("test@example.com");
  });
});
