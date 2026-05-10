import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the ENV module
vi.mock("./_core/env", () => ({
  ENV: {
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    isProduction: false,
  },
}));

describe("Email Service", () => {
  it("should export sendEmail function", async () => {
    const { sendEmail } = await import("./email");
    expect(typeof sendEmail).toBe("function");
  });

  it("should export email template builders", async () => {
    const { buildVerificationEmail, buildPasswordResetEmail, buildWelcomeEmail } = await import("./email");
    expect(typeof buildVerificationEmail).toBe("function");
    expect(typeof buildPasswordResetEmail).toBe("function");
    expect(typeof buildWelcomeEmail).toBe("function");
  });

  it("should build verification email with correct content", async () => {
    const { buildVerificationEmail } = await import("./email");
    const html = buildVerificationEmail("أحمد", "https://go-umrah.com/verify-email?token=abc123");
    expect(html).toContain("أحمد");
    expect(html).toContain("https://go-umrah.com/verify-email?token=abc123");
    expect(html).toContain("Go Umrah");
  });

  it("should build password reset email with correct content", async () => {
    const { buildPasswordResetEmail } = await import("./email");
    const html = buildPasswordResetEmail("محمد", "https://go-umrah.com/reset-password?token=xyz789");
    expect(html).toContain("محمد");
    expect(html).toContain("https://go-umrah.com/reset-password?token=xyz789");
    expect(html).toContain("إعادة تعيين كلمة المرور");
  });

  it("should build welcome email with correct content", async () => {
    const { buildWelcomeEmail } = await import("./email");
    const html = buildWelcomeEmail("فاطمة");
    expect(html).toContain("فاطمة");
    expect(html).toContain("Go Umrah");
  });

  it("should return success in dev mode when no API key is set", async () => {
    // Re-mock with empty key
    vi.resetModules();
    vi.mock("./_core/env", () => ({
      ENV: { resendApiKey: "", isProduction: false },
    }));
    const { sendEmail } = await import("./email");
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });
    expect(result.success).toBe(true);
    expect(result.id).toBe("dev-mode");
  });
});
