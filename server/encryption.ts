import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    // في التطوير: استخدم مفتاح افتراضي (يجب تغييره في الإنتاج)
    console.warn("[Encryption] ENCRYPTION_KEY not set, using default (INSECURE for production)");
    return createHash("sha256").update("go-umrah-dev-key-change-in-production").digest();
  }
  return createHash("sha256").update(secret).digest();
}

// تشفير نص
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;
  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // نُدمج: iv(16) + authTag(16) + encrypted → base64
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

// فك التشفير
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return ciphertext;
  try {
    const key = getEncryptionKey();
    const data = Buffer.from(ciphertext, "base64");

    const iv = data.subarray(0, 16);
    const authTag = data.subarray(16, 32);
    const encrypted = data.subarray(32);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // إذا فشل الفك، أعد النص كما هو (للبيانات القديمة غير المشفرة)
    return ciphertext;
  }
}

// تشفير جزئي للعرض (يُظهر أول وآخر حرفين فقط)
export function maskSensitive(value: string, visibleChars = 2): string {
  if (!value || value.length <= visibleChars * 2) return "****";
  return value.substring(0, visibleChars) + "****" + value.substring(value.length - visibleChars);
}
