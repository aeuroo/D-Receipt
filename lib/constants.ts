export const STORE_NAME = "ร้านช่างแดงกระจกอลูมิเนียมรามอินทรา";
export const STORE_ADDRESS =
  "396 หมู่บ้านเนียมกล่ำ ประเสริฐมนูกิจ 29 แยก 8 เขตลาดพร้าว แขวงจระเข้บัว กรุงเทพฯ 10230 ";

export const STORE_NAME_EN = "Chang Daeng Glass & Aluminum (Ramintra)";
export const STORE_ADDRESS_EN =
  "396 Niarmklam Village, Prasert Manukit 29 Soi 8, Lat Phrao, Chatuchak, Bangkok 10230";

export const SERVICE_PRESETS = [
  "เปลี่ยนโช๊คบานสวิง",
  "เปลี่ยนโช๊คบานสวิงไดมอนด์",
  "เปลี่ยนโช๊คฝังพื้น VVP",
  "ซ่อมประตูบานสวิง",
  "ซ่อมประตูบานเปลือย",
  "เปลี่ยนล้อบานเลื่อน",
  "เปลี่ยนล้อบานเลื่อนรางแขวน",
  "เปลี่ยนกระจกบานสวิง",
  "เปลี่ยนกระจกบานเลื่อน",
  "เปลี่ยนกระจกบานตาย",
] as const;

export const PRICE_PRESETS = Array.from({ length: 20 }, (_, i) => (i + 1) * 500);

export const NOTE_CHECKLIST_OPTIONS = [
  "รับประกันงาน 3 เดือน ",
  "รับประกันงาน 6 เดือน ",
  "รับประกันงาน 1 ปี ",
  "ชำระเงินมัดจำ (30%)  ",
  "ชำระเงินมัดจำ (40%)  ",
  "ชำระเงินมัดจำ (50%)  ",
  "ราคารวมค่าติดตั้งแล้ว ",
] as const;

export const DOCUMENTS_COLLECTION = "Doc";
export const EDIT_SESSION_KEY = "editDocData";
