/**
 * Email service for Go Umrah
 * Uses Resend when API key is available, falls back to console logging in development
 */
import { ENV } from "./_core/env";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const FROM_EMAIL = "Go Umrah <noreply@go-umrah.com>";
const BRAND_COLOR = "#1B5E52";
const GOLD_COLOR = "#C9A96E";

// ── Email templates ─────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Go Umrah</title>
  <style>
    body { margin: 0; padding: 0; background: #f5f5f0; font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #0d3d30 100%); padding: 32px 24px; text-align: center; }
    .header img { height: 50px; }
    .header h1 { color: ${GOLD_COLOR}; font-size: 22px; margin: 12px 0 0; font-weight: 700; }
    .body { padding: 32px 24px; }
    .body p { color: #333; font-size: 16px; line-height: 1.7; margin: 0 0 16px; }
    .btn { display: inline-block; background: ${BRAND_COLOR}; color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; margin: 16px 0; }
    .divider { border: none; border-top: 1px solid #e5e5e5; margin: 24px 0; }
    .footer { background: #f5f5f0; padding: 20px 24px; text-align: center; }
    .footer p { color: #888; font-size: 13px; margin: 0; }
    .gold-text { color: ${GOLD_COLOR}; font-weight: 700; }
    .code-box { background: #f0f7f5; border: 2px solid ${BRAND_COLOR}; border-radius: 8px; padding: 16px; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: ${BRAND_COLOR}; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663407927531/Dm5hkgyRivJ7LYDt9Su4eU/go-umrah-logo-hd_4609a4fe.png" alt="Go Umrah" />
      <h1>بوابتك للرحلة المقدسة</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <hr class="divider" />
    <div class="footer">
      <p>© ${new Date().getFullYear()} Go Umrah — جميع الحقوق محفوظة</p>
      <p style="margin-top:6px;">هذا البريد أُرسل تلقائياً، يرجى عدم الرد عليه.</p>
    </div>
  </div>
</body>
</html>`;
}

export function buildVerificationEmail(name: string, verifyUrl: string): string {
  return baseTemplate(`
    <p>السلام عليكم <span class="gold-text">${name}</span>،</p>
    <p>شكراً لتسجيلك في <strong>Go Umrah</strong>. لإتمام تفعيل حسابك، يرجى النقر على الزر أدناه:</p>
    <div style="text-align:center; margin: 24px 0;">
      <a href="${verifyUrl}" class="btn">تفعيل البريد الإلكتروني</a>
    </div>
    <p style="color:#666; font-size:14px;">أو انسخ الرابط التالي في متصفحك:</p>
    <p style="word-break:break-all; color:#1B5E52; font-size:13px;">${verifyUrl}</p>
    <hr class="divider" />
    <p style="color:#888; font-size:13px;">هذا الرابط صالح لمدة <strong>24 ساعة</strong>. إذا لم تطلب هذا التفعيل، يمكنك تجاهل هذه الرسالة.</p>
  `);
}

export function buildPasswordResetEmail(name: string, resetUrl: string): string {
  return baseTemplate(`
    <p>السلام عليكم <span class="gold-text">${name}</span>،</p>
    <p>تلقينا طلباً لإعادة تعيين كلمة مرور حسابك في <strong>Go Umrah</strong>.</p>
    <div style="text-align:center; margin: 24px 0;">
      <a href="${resetUrl}" class="btn">إعادة تعيين كلمة المرور</a>
    </div>
    <p style="color:#666; font-size:14px;">أو انسخ الرابط التالي في متصفحك:</p>
    <p style="word-break:break-all; color:#1B5E52; font-size:13px;">${resetUrl}</p>
    <hr class="divider" />
    <p style="color:#888; font-size:13px;">هذا الرابط صالح لمدة <strong>ساعة واحدة</strong>. إذا لم تطلب إعادة التعيين، يرجى تجاهل هذه الرسالة وحسابك آمن.</p>
  `);
}

export function buildWelcomeEmail(name: string): string {
  return baseTemplate(`
    <p>السلام عليكم <span class="gold-text">${name}</span>،</p>
    <p>أهلاً وسهلاً بك في عائلة <strong>Go Umrah</strong>! 🕌</p>
    <p>يسعدنا أن نكون شريكك الموثوق في رحلتك المقدسة. يمكنك الآن:</p>
    <ul style="color:#333; font-size:15px; line-height:2;">
      <li>حجز برامج الحج والعمرة</li>
      <li>البحث عن أفضل الفنادق القريبة من الحرمين</li>
      <li>حجز رحلات طيران مباشرة</li>
      <li>الاستفادة من خدمات النقل والجولات الدينية</li>
    </ul>
    <div style="text-align:center; margin: 24px 0;">
      <a href="https://go-umrah.com" class="btn">استكشف الخدمات</a>
    </div>
    <p style="color:#888; font-size:13px;">بارك الله في رحلتك وتقبّل منك.</p>
  `);
}

// ── Send function ────────────────────────────────────────────────────────────

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const { to, subject, html, from = FROM_EMAIL } = options;

  // Development fallback: log to console
  if (!ENV.resendApiKey) {
    console.log(`[Email] DEV MODE — Would send to: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] (Set RESEND_API_KEY to enable real email sending)`);
    return { success: true, id: "dev-mode" };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(ENV.resendApiKey);
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error(`[Email] Resend error:`, error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Email] Send failed:`, msg);
    return { success: false, error: msg };
  }
}

// ── Campaign Templates ───────────────────────────────────────────────────────

export type CampaignTemplateType = "announcement" | "offer" | "newsletter" | "reminder" | "custom";

function buildCampaignEmail(
  templateType: CampaignTemplateType,
  recipientName: string | null,
  title: string,
  body: string,
  ctaText?: string,
  ctaUrl?: string
): string {
  const name = recipientName ?? "عزيزنا العميل";

  const templateStyles: Record<CampaignTemplateType, { accent: string; icon: string; badge: string }> = {
    announcement: { accent: BRAND_COLOR, icon: "📢", badge: "إعلان هام" },
    offer:        { accent: "#C9A96E", icon: "🌟", badge: "عرض خاص" },
    newsletter:   { accent: "#1B5E52", icon: "📰", badge: "نشرة إخبارية" },
    reminder:     { accent: "#7B5EA7", icon: "🔔", badge: "تذكير" },
    custom:       { accent: BRAND_COLOR, icon: "✉️", badge: "رسالة" },
  };

  const style = templateStyles[templateType];

  const ctaBlock = ctaText && ctaUrl
    ? `<div style="text-align:center; margin: 28px 0;">
        <a href="${ctaUrl}" style="display:inline-block; background:${style.accent}; color:#fff; text-decoration:none; padding:14px 36px; border-radius:8px; font-size:16px; font-weight:700;">${ctaText}</a>
       </div>`
    : "";

  return baseTemplate(`
    <div style="background:${style.accent}15; border-right:4px solid ${style.accent}; padding:12px 16px; border-radius:6px; margin-bottom:20px;">
      <span style="font-size:13px; font-weight:700; color:${style.accent};">${style.icon} ${style.badge}</span>
    </div>
    <p>السلام عليكم <span class="gold-text">${name}</span>،</p>
    <h2 style="color:${style.accent}; font-size:20px; margin:0 0 16px;">${title}</h2>
    <div style="color:#333; font-size:15px; line-height:1.8; white-space:pre-line;">${body}</div>
    ${ctaBlock}
    <hr class="divider" />
    <p style="color:#888; font-size:13px;">لإلغاء الاشتراك في رسائلنا، يرجى التواصل معنا عبر البريد الإلكتروني.</p>
  `);
}

// ── Bulk Campaign Sender ─────────────────────────────────────────────────────

interface BulkCampaignOptions {
  recipients: { email: string; name: string | null }[];
  subject: string;
  templateType: CampaignTemplateType;
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}

export async function sendBulkCampaign(
  options: BulkCampaignOptions
): Promise<{ sent: number; failed: number }> {
  const { recipients, subject, templateType, title, body, ctaText, ctaUrl } = options;
  let sent = 0;
  let failed = 0;

  // Process in batches of 10 to avoid rate limits
  const BATCH_SIZE = 10;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (recipient) => {
        const html = buildCampaignEmail(templateType, recipient.name, title, body, ctaText, ctaUrl);
        const result = await sendEmail({ to: recipient.email, subject, html });
        if (result.success) sent++;
        else failed++;
      })
    );
    // Small delay between batches
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return { sent, failed };
}
