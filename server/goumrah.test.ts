import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ─── Context Factories ────────────────────────────────────────────────────────

function createPublicContext(): TrpcContext {
  return {
    user: null,
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
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-openid",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user",
        email: "test@example.com",
        name: "Test User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      httpOnly: true,
      path: "/",
    });
  });

  it("returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("returns user data for authenticated user", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const user = await caller.auth.me();
    expect(user).not.toBeNull();
    expect(user?.role).toBe("admin");
    expect(user?.email).toBe("admin@goumrah.com");
  });
});

// ─── Admin Access Control Tests ───────────────────────────────────────────────

describe("admin access control", () => {
  it("blocks non-admin from creating hajj programs", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.hajj.create({
        title: "Test Hajj",
        priceUSD: "5000",
        duration: 21,
      })
    ).rejects.toThrow();
  });

  it("blocks non-admin from creating umrah programs", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.umrah.create({
        title: "Test Umrah",
        priceUSD: "2000",
        duration: 10,
      })
    ).rejects.toThrow();
  });

  it("blocks unauthenticated from creating hotels", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.hotels.create({
        name: "Test Hotel",
        city: "makkah",
        pricePerNightUSD: "200",
      })
    ).rejects.toThrow();
  });

  it("blocks unauthenticated from creating products", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.store.createProduct({
        name: "Test Product",
        priceUSD: "50",
        slug: "test-product",
      })
    ).rejects.toThrow();
  });
});

// ─── Public Procedure Tests ───────────────────────────────────────────────────

describe("public procedures", () => {
  it("hajj.list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.hajj.list({});
    expect(Array.isArray(result)).toBe(true);
  }, 15000);

  it("umrah.list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.umrah.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("hotels.list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.hotels.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("tours.list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.tours.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("transport.list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.transport.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("visa.listTypes returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.visa.listTypes();
    expect(Array.isArray(result)).toBe(true);
  });

  it("store.listProducts returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.store.listProducts({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("flights.list returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.flights.list({
      origin: "LHR",
      destination: "JED",
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Input Validation Tests ───────────────────────────────────────────────────

describe("input validation", () => {
  it("hajj.list rejects invalid portal type", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.hajj.list({ portal: "invalid" as any })
    ).rejects.toThrow();
  });

  it("visa.listTypes rejects invalid type", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.visa.listTypes({ type: "invalid" as any })
    ).rejects.toThrow();
  });

  it("hajj.list accepts valid portal types", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    for (const portal of ["internal", "external", "both", "all"] as const) {
      const result = await caller.hajj.list({ portal });
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it("visa.listTypes accepts valid type filters", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    for (const type of ["umrah", "hajj", "tourist", "transit", "all"] as const) {
      const result = await caller.visa.listTypes({ type });
      expect(Array.isArray(result)).toBe(true);
    }
  });
});

// ─── Admin Stats Tests ────────────────────────────────────────────────────────

describe("admin.getStats", () => {
  it("returns stats object with expected keys for admin", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const stats = await caller.admin.stats();
    expect(stats).toHaveProperty("hajj");
    expect(stats).toHaveProperty("umrah");
    expect(stats).toHaveProperty("hotels");
    expect(stats).toHaveProperty("bookings");
    expect(stats).toHaveProperty("orders");
    expect(stats).toHaveProperty("visaTypes");
    expect(stats).toHaveProperty("vehicles");
    expect(stats).toHaveProperty("tours");
    expect(stats).toHaveProperty("products");
  });

  it("blocks non-admin from accessing stats", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.admin.stats()).rejects.toThrow();
  });

  it("blocks unauthenticated from accessing stats", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.stats()).rejects.toThrow();
  });
});
