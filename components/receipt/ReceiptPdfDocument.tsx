"use client";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Font,
} from "@react-pdf/renderer";

import {
  calculateTotal,
  formatCurrency,
  formatDateForDisplay,
  splitLongText,
} from "@/lib/document-utils";
import type { Locale } from "@/lib/i18n/messages";
import {
  formatMessage,
  getDocumentTitleLocalized,
  getPdfStrings,
  getStoreAddressForLocale,
  getStoreNameForLocale,
  localizeNotePresetText,
  localizeServiceDescription,
} from "@/lib/i18n/translate";
import type { ReceiptFormData } from "@/lib/types";

Font.register({
  family: "Sarabun",
  fonts: [
    { src: "/fonts/Sarabun-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Sarabun-Bold.ttf", fontWeight: "bold" },
  ],
});

const accent = "#2563eb";
const border = "#e5e7eb";
const blueSoft = "#f8fafc";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    color: "#27272a",
    fontFamily: "Sarabun",
    backgroundColor: "#fff",
  },
  companyNameHeader: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 6,
    color: accent,
    fontWeight: "bold",
  },
  companyAddress: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    color: "#71717a",
  },
  titleBox: {
    backgroundColor: blueSoft,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    border: `1 solid ${border}`,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: accent,
    textAlign: "center",
  },
  box: {
    border: `1 solid ${border}`,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 11,
    color: "#71717a",
    width: 150,
    flexShrink: 0,
  },
  value: {
    flex: 1,
    color: "#09090b",
    minWidth: 200,
  },
  table: {
    marginTop: 8,
    marginBottom: 8,
    border: `1 solid ${border}`,
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: blueSoft,
    borderBottom: `1 solid ${border}`,
    padding: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: `1 solid ${border}`,
    padding: 10,
    minHeight: 28,
    alignItems: "flex-start",
  },
  col0: { width: "8%", textAlign: "center", color: "#71717a" },
  col1: { width: "42%", color: "#27272a", paddingRight: 6 },
  col2: { width: "12%", textAlign: "center", color: "#71717a" },
  col3: { width: "18%", textAlign: "center", color: "#71717a" },
  col4: { width: "20%", textAlign: "right", color: "#27272a" },
  headerText: { fontSize: 10, color: "#52525b", fontWeight: "bold" },
  totalBox: {
    backgroundColor: blueSoft,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    alignItems: "flex-end",
    border: `1 solid ${border}`,
  },
  total: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1e40af",
  },
  noteBox: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  noteLabel: {
    fontSize: 10,
    color: "#71717a",
    fontWeight: "bold",
    marginRight: 4,
  },
  noteText: {
    fontSize: 10,
    color: "#52525b",
    flex: 1,
  },
  checklistContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
  },
  checklistItem: {
    fontSize: 10,
    color: "#52525b",
    marginRight: 8,
  },
});

type Props = {
  formData: ReceiptFormData;
  locale: Locale;
};

export function ReceiptPdfDocument({ formData, locale }: Props) {
  const total = calculateTotal(formData.items);
  const pdf = getPdfStrings(locale);
  const dash = formatMessage(locale, "common.dash");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.companyNameHeader}>
            {getStoreNameForLocale(locale)}
          </Text>
          <Text style={styles.companyAddress}>
            {getStoreAddressForLocale(locale)}
          </Text>
        </View>

        <View style={styles.titleBox}>
          <Text style={styles.title}>
            {getDocumentTitleLocalized(formData, locale)}
          </Text>
        </View>

        <View style={styles.box}>
          <View style={styles.row}>
            <Text style={styles.label}>{pdf.docNumber}</Text>
            <Text style={styles.value}>{formData.receiptNumber} </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{pdf.date}</Text>
            <Text style={styles.value}>
              {formatDateForDisplay(formData.date, locale)}{" "}
            </Text>
          </View>

          {formData.infoType === "company" ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>{pdf.companyName}</Text>
                <Text style={styles.value}>{formData.companyName} </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{pdf.address}</Text>
                <Text style={styles.value}>{formData.address} </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{pdf.phone}</Text>
                <Text style={styles.value}>{formData.companyPhone} </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{pdf.taxId}</Text>
                <Text style={styles.value}>{formData.taxId} </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{pdf.operator}</Text>
                <Text style={styles.value}>{formData.operator} </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>{pdf.customerName}</Text>
                <Text style={styles.value}>{formData.customerName} </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{pdf.customerAddress}</Text>
                <Text style={styles.value}>{formData.customerAddress} </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{pdf.phone}</Text>
                <Text style={styles.value}>{formData.customerPhone} </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col0, styles.headerText]}>{pdf.colNo}</Text>
            <Text style={[styles.col1, styles.headerText]}>{pdf.colItem}</Text>
            <Text style={[styles.col2, styles.headerText]}>{pdf.colQty}</Text>
            <Text style={[styles.col3, styles.headerText]}>{pdf.colUnit}</Text>
            <Text style={[styles.col4, styles.headerText]}>{pdf.colSum}</Text>
          </View>
          {formData.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col0}>{index + 1}</Text>
              <Text style={styles.col1}>
                {splitLongText(
                  localizeServiceDescription(item.description || dash, locale),
                )}
              </Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>
                {formatCurrency(item.price, locale)}
              </Text>
              <Text style={styles.col4}>
                {formatCurrency(item.quantity * item.price, locale)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.total}>
            {formatMessage(locale, "pdf.total", {
              amount: formatCurrency(total, locale),
            })}
          </Text>
        </View>

        {(formData.noteChecklist?.length || formData.note) && (
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>{pdf.notes}</Text>
            <View style={styles.checklistContainer}>
              {formData.noteChecklist?.map((item) => (
                <Text key={item} style={styles.checklistItem}>
                  • {localizeNotePresetText(item, locale).trim()}
                </Text>
              ))}
              {formData.note?.trim() && (
                <Text style={styles.checklistItem}>• {formData.note.trim()}</Text>
              )}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
