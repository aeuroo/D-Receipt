export type DocumentType = "receipt" | "quotation" | "invoice" | "custom";

export type InfoType = "company" | "customer";

export type LineItem = {
  description: string;
  quantity: number;
  price: number;
};

export type ReceiptFormData = {
  type: DocumentType;
  customDocumentTitle: string;
  companyName: string;
  address: string;
  taxId: string;
  customerName: string;
  customerAddress: string;
  companyPhone: string;
  customerPhone: string;
  items: LineItem[];
  date: string;
  receiptNumber: string;
  infoType: InfoType;
  operator: string;
  note: string;
  noteChecklist: string[];
};

export type StoredDocument = ReceiptFormData & {
  id?: string;
  createdAt?: string;
};
