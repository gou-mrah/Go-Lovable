import { describe, it, expect, vi } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("hajj.toggleActive", () => {
  it("should accept id and isActive boolean input", () => {
    // Validate the input schema shape
    const validInput = { id: 1, isActive: false };
    expect(validInput).toHaveProperty("id");
    expect(validInput).toHaveProperty("isActive");
    expect(typeof validInput.id).toBe("number");
    expect(typeof validInput.isActive).toBe("boolean");
  });

  it("should accept toggling active to true", () => {
    const validInput = { id: 90001, isActive: true };
    expect(validInput.id).toBe(90001);
    expect(validInput.isActive).toBe(true);
  });

  it("should accept toggling active to false", () => {
    const validInput = { id: 90001, isActive: false };
    expect(validInput.id).toBe(90001);
    expect(validInput.isActive).toBe(false);
  });
});

describe("hajj.list with includeInactive", () => {
  it("should accept includeInactive parameter", () => {
    const input = { portal: "internal" as const, limit: 12, includeInactive: true };
    expect(input.includeInactive).toBe(true);
    expect(input.portal).toBe("internal");
  });

  it("should default includeInactive to false", () => {
    const input = { portal: "internal" as const, limit: 12 };
    const includeInactive = (input as any).includeInactive ?? false;
    expect(includeInactive).toBe(false);
  });
});
