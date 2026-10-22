import type { DocumentType, ReceiptFormData } from "@/lib/types";

import {
  STORE_ADDRESS,
  STORE_ADDRESS_EN,
  STORE_NAME,
  STORE_NAME_EN,
} from "@/lib/constants";

import {
  messages,
  NOTE_PRESET_IDS,
  SERVICE_PRESET_IDS,
  type Locale,
  type MessageTree,
  type NotePresetId,
  type ServicePresetId,
} from "./messages";

export function getMessage(locale: Locale, path: string): string {
  const parts = path.split(".");
  let node: unknown = messages[locale];
  for (const part of parts) {
    if (node && typeof node === "object" && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof node === "string" ? node : path;
}

export function formatMessage(
  locale: Locale,
  path: string,
  vars?: Record<string, string | number>,
): string {
  let text = getMessage(locale, path);
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${key}}`, String(value));
    }
  }
  return text;
}

export function getNotePresetLabel(locale: Locale, id: NotePresetId): string {
  return messages[locale].notes[id];
}

export function getServicePresetLabel(
  locale: Locale,
  id: ServicePresetId,
): string {
  return messages[locale].services[id];
}

export function getNotePresetOptions(locale: Locale) {
  return NOTE_PRESET_IDS.map((id) => ({
    id,
    label: getNotePresetLabel(locale, id),
  }));
}

export function getServicePresetOptions(locale: Locale) {
  return SERVICE_PRESET_IDS.map((id) => ({
    id,
    label: getServicePresetLabel(locale, id),
  }));
}

export function getDefaultNoteChecklist(locale: Locale): string[] {
  return [messages[locale].notes.installIncluded];
}

export function getDocumentTitleLocalized(
  data: {
    type: ReceiptFormData["type"];
    customDocumentTitle?: string;
  },
  locale: Locale,
): string {
  const m = messages[locale].docType;
  switch (data.type) {
    case "receipt":
      return m.receipt;
    case "quotation":
      return m.quotation;
    case "invoice":
      return m.invoice;
    case "custom":
      return data.customDocumentTitle?.trim() || m.customFallback;
    default:
      return m.quotation;
  }
}

export function getPdfStrings(locale: Locale): MessageTree["pdf"] {
  return messages[locale].pdf;
}

export function getStoreNameForLocale(locale: Locale): string {
  return locale === "en" ? STORE_NAME_EN : STORE_NAME;
}

export function getStoreAddressForLocale(locale: Locale): string {
  return locale === "en" ? STORE_ADDRESS_EN : STORE_ADDRESS;
}

/** แปลรายการสำเร็จรูปที่บันทึกเป็นข้อความไทย/อังกฤษให้ตรงภาษา PDF */
export function localizeServiceDescription(
  text: string,
  locale: Locale,
): string {
  const trimmed = text.trim();
  if (!trimmed) return text;
  for (const id of SERVICE_PRESET_IDS) {
    const th = getServicePresetLabel("th", id).trim();
    const en = getServicePresetLabel("en", id).trim();
    if (trimmed === th || trimmed === en) {
      return getServicePresetLabel(locale, id);
    }
  }
  return text;
}

/** แปลหมายเหตุสำเร็จรูปในบิลตามภาษา */
export function localizeNotePresetText(text: string, locale: Locale): string {
  const trimmed = text.trim();
  if (!trimmed) return text;
  for (const id of NOTE_PRESET_IDS) {
    const labels = notePresetLabels(id).map((l) => l.trim());
    if (labels.some((l) => l === trimmed)) {
      return getNotePresetLabel(locale, id);
    }
  }
  return text;
}

function notePresetLabels(id: NotePresetId): string[] {
  return [
    getNotePresetLabel("th", id),
    getNotePresetLabel("en", id),
  ];
}

export function isNotePresetSelected(
  id: NotePresetId,
  checklist: string[] | undefined,
): boolean {
  const list = checklist ?? [];
  const labels = notePresetLabels(id);
  return list.some((item) => labels.includes(item));
}

export function toggleNotePresetInList(
  locale: Locale,
  id: NotePresetId,
  checklist: string[] | undefined,
): string[] {
  const list = checklist ?? [];
  const labels = notePresetLabels(id);
  if (list.some((item) => labels.includes(item))) {
    return list.filter((item) => !labels.includes(item));
  }
  return [...list, getNotePresetLabel(locale, id)];
}

export function getDocumentTypeLabelLocalized(
  type: DocumentType,
  customTitle?: string,
  locale: Locale = "th",
): string {
  return getDocumentTitleLocalized(
    { type, customDocumentTitle: customTitle },
    locale,
  );
}
