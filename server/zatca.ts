// ZATCA Phase 1 E-Invoice QR Code Generator
// مرحلة أولى: QR code فقط (Phase 2 يحتاج توقيع رقمي)

// TLV Encoding حسب معايير ZATCA
function encodeTLV(tag: number, value: string): Buffer {
  const valueBuffer = Buffer.from(value, "utf8");
  const tagBuffer = Buffer.from([tag]);
  const lengthBuffer = Buffer.from([valueBuffer.length]);
  return Buffer.concat([tagBuffer, lengthBuffer, valueBuffer]);
}

export interface ZatcaInvoiceData {
  sellerName: string;    // اسم المنصة
  vatNumber: string;     // الرقم الضريبي
  invoiceDate: string;   // ISO 8601: "2025-03-30T12:00:00Z"
  totalWithVat: number;  // المبلغ الإجمالي شامل الضريبة
  vatAmount: number;     // قيمة ضريبة القيمة المضافة
}

// توليد QR Code بصيغة TLV ثم Base64
export function generateZatcaQR(data: ZatcaInvoiceData): string {
  const tlv = Buffer.concat([
    encodeTLV(1, data.sellerName),
    encodeTLV(2, data.vatNumber),
    encodeTLV(3, data.invoiceDate),
    encodeTLV(4, data.totalWithVat.toFixed(2)),
    encodeTLV(5, data.vatAmount.toFixed(2)),
  ]);
  return tlv.toString("base64");
}

// حساب ضريبة القيمة المضافة (15% في السعودية)
export function calculateVat(amountBeforeVat: number, vatRate = 0.15) {
  const vatAmount = amountBeforeVat * vatRate;
  const totalWithVat = amountBeforeVat + vatAmount;
  return { vatAmount, totalWithVat, amountBeforeVat };
}

// توليد رقم الفاتورة بالتنسيق السعودي
export function generateInvoiceNumber(bookingNumber: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const seq = bookingNumber.replace("BK-", "");
  return `INV-${year}-${seq}`;
}
