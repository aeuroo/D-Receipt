import {
  getDefaultNoteChecklist,
  getDocumentTitleLocalized,
} from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/messages";

import type { DocumentType, LineItem, ReceiptFormData, StoredDocument } from "./types";

/** วันที่ในโซนเวลาของเครื่อง (สำหรับ input type="date") */
export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** แปลง YYYY-MM-DD โดยไม่ใช้ UTC (หลีกเลี่ยงวันเพี้ยน) */
export function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map((part) => parseInt(part, 10));
  return new Date(year, month - 1, day);
}

export function createInitialFormData(locale: Locale = "th"): ReceiptFormData {
  return {
    type: "quotation",
    customDocumentTitle: "",
    companyName: "",
    address: "",
    taxId: "",
    customerName: "",
    customerAddress: "",
    companyPhone: "",
    customerPhone: "",
    items: [{ description: "", quantity: 1, price: 0 }],
    date: "",
    receiptNumber: "",
    infoType: "company",
    operator: "",
    note: "",
    noteChecklist: getDefaultNoteChecklist(locale),
  };
}

export function generateReceiptNumber(dateStr: string): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const base = dateStr ? parseLocalDateString(dateStr) : now;
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `TH${year}${month}${day}${hours}${minutes}${seconds}`;
}

export function getDocumentTitle(data: {
  type: DocumentType;
  customDocumentTitle?: string;
}): string {
  switch (data.type) {
    case "receipt":
      return "ใบเสร็จ";
    case "quotation":
      return "ใบเสนอราคา";
    case "invoice":
      return "ใบแจ้งหนี้";
    case "custom":
      return data.customDocumentTitle?.trim() || "เอกสาร";
    default:
      return "ใบเสนอราคา";
  }
}

export function getDocumentTypeLabel(
  type: DocumentType,
  customTitle?: string,
  locale?: Locale,
): string {
  if (locale) {
    return getDocumentTitleLocalized(
      { type, customDocumentTitle: customTitle },
      locale,
    );
  }
  return getDocumentTitle({ type, customDocumentTitle: customTitle });
}

export function calculateTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

export function getDisplayName(doc: StoredDocument): string {
  if (doc.infoType === "customer") {
    return doc.customerName || "—";
  }
  return doc.companyName || "—";
}

export function buildFirestorePayload(formData: ReceiptFormData) {
  const base = {
    type: formData.type,
    customDocumentTitle: formData.customDocumentTitle,
    receiptNumber: formData.receiptNumber,
    date: formData.date,
    items: formData.items,
    note: formData.note,
    noteChecklist: formData.noteChecklist,
    createdAt: new Date().toISOString(),
  };

  if (formData.infoType === "company") {
    return {
      ...base,
      infoType: "company" as const,
      companyName: formData.companyName,
      address: formData.address,
      companyPhone: formData.companyPhone,
      taxId: formData.taxId,
      operator: formData.operator,
    };
  }

  return {
    ...base,
    infoType: "customer" as const,
    customerName: formData.customerName,
    customerAddress: formData.customerAddress,
    customerPhone: formData.customerPhone,
  };
}

export function formatCurrency(amount: number, locale: Locale = "th"): string {
  return amount.toLocaleString(locale === "th" ? "th-TH" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** แสดงวันที่ใน PDF ตามภาษา (input เป็น YYYY-MM-DD) */
export function formatDateForDisplay(
  dateStr: string,
  locale: Locale = "th",
): string {
  if (!dateStr?.trim()) return "";
  const date = parseLocalDateString(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function splitLongText(text: string, maxLength = 40): string {
  if (text.length <= maxLength) return text;
  const midpoint = Math.floor(text.length / 2);
  let splitAt = midpoint;
  for (let i = 0; i < midpoint; i++) {
    if (text[midpoint + i] === " ") {
      splitAt = midpoint + i;
      break;
    }
    if (text[midpoint - i] === " ") {
      splitAt = midpoint - i;
      break;
    }
  }
  return `${text.slice(0, splitAt)}\n${text.slice(splitAt + 1)}`;
}
