import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock the database ────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// ─── Context Factories ────────────────────────────────────────────────────────
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createProviderContext(): TrpcContext {
  return {
    user: {
      id: 10,
      openId: "provider-openid",
      email: "provider@example.com",
      name: "Test Provider",
      loginMethod: "custom",
      role: "provider",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-openid",
      email: "admin@goumrah.com",
      name: "Admin User",
      loginMethod: "custom",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ─── bookingReviews Router Tests ──────────────────────────────────────────────
describe("bookingReviews router", () => {
  it("submit: requires valid input - rejects empty bookingRef", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.bookingReviews.submit({
        bookingRef: "",
        providerId: 1,
        customerName: "Test User",
        rating: 5,
      })
    ).rejects.toThrow();
  });

  it("submit: requires valid rating 1-5 - rejects rating 0", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.bookingReviews.submit({
        bookingRef: "REF-001",
        providerId: 1,
        customerName: "Test User",
        rating: 0,
      })
    ).rejects.toThrow();
  });

  it("submit: requires valid rating 1-5 - rejects rating 6", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.bookingReviews.submit({
        bookingRef: "REF-001",
        providerId: 1,
        customerName: "Test User",
        rating: 6,
      })
    ).rejects.toThrow();
  });

  it("getForProvider: requires valid providerId", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.bookingReviews.getForProvider({ providerId: 0, limit: 10, offset: 0 })
    ).rejects.toThrow();
  });

  it("getMyReviews: requires provider role", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.bookingReviews.getMyReviews({ limit: 10, offset: 0 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("reply: requires provider role", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.bookingReviews.reply({ reviewId: 1, reply: "Thank you!" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("adminList: requires admin role - rejects provider", async () => {
    const caller = appRouter.createCaller(createProviderContext());
    await expect(
      caller.bookingReviews.adminList({ limit: 10, offset: 0 })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("adminUpdateStatus: requires admin role - rejects unauthenticated", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.bookingReviews.adminUpdateStatus({ reviewId: 1, status: "approved" })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("adminDelete: requires admin role - allows admin", async () => {
    // DB is mocked to return null, so it will throw INTERNAL_SERVER_ERROR
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.bookingReviews.adminDelete({ reviewId: 1 })
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});

// ─── providerNotifications Router Tests ──────────────────────────────────────
describe("providerNotifications router", () => {
  it("list: requires provider role - rejects unauthenticated", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.providerNotifications.list({ unreadOnly: false, limit: 10, offset: 0 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("list: allows provider role - fails at DB level (mocked)", async () => {
    const caller = appRouter.createCaller(createProviderContext());
    await expect(
      caller.providerNotifications.list({ unreadOnly: false, limit: 10, offset: 0 })
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });

  it("markRead: requires provider role - rejects unauthenticated", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.providerNotifications.markRead({})
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("delete: requires provider role - rejects unauthenticated", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.providerNotifications.delete({ notificationId: 1 })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("delete: requires valid notificationId - rejects 0", async () => {
    const caller = appRouter.createCaller(createProviderContext());
    await expect(
      caller.providerNotifications.delete({ notificationId: 0 })
    ).rejects.toThrow();
  });
});
