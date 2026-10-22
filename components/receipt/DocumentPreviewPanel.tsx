"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink, PDFViewer, pdf } from "@react-pdf/renderer";
import { motion, AnimatePresence } from "framer-motion";

import { useLocale } from "@/lib/i18n/locale-context";
import { smoothTransition, springGentle } from "@/lib/motion";

import { saveDocument } from "@/lib/documents";
import { buildFirestorePayload, getLocalDateString } from "@/lib/document-utils";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { ReceiptFormData } from "@/lib/types";

import { ReceiptPdfDocument } from "./ReceiptPdfDocument";

type SaveState = "idle" | "loading" | "success" | "error";

type Props = {
  formData: ReceiptFormData;
};

function IconDownload() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
    </svg>
  );
}

function IconCloudSave() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-8" />
    </svg>
  );
}

export function DocumentPreviewPanel({ formData }: Props) {
  const { locale, t } = useLocale();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [viewerHeight, setViewerHeight] = useState(720);

  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight;
      setViewerHeight(Math.max(380, Math.min(vh * 0.68, 880)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const downloadName = () => {
    const name =
      formData.infoType === "customer"
        ? formData.customerName
        : formData.companyName;
    const date = formData.date || getLocalDateString();
    return `${name || "document"}_${date}.pdf`;
  };

  const pdfDoc = <ReceiptPdfDocument formData={formData} locale={locale} />;

  const handleSaveAndDownload = async () => {
    if (!isFirebaseConfigured()) {
      alert(t("preview.firebaseAlert"));
      return;
    }

    let anchor: HTMLAnchorElement | null = null;
    try {
      setSaveState("loading");
      const payload = buildFirestorePayload(formData);
      await saveDocument(payload);

      const blob = await pdf(pdfDoc).toBlob();
      const url = URL.createObjectURL(blob);
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadName();
      document.body.appendChild(anchor);
      anchor.click();
      URL.revokeObjectURL(url);
      setSaveState("success");
    } catch (error) {
      console.error(error);
      setSaveState("error");
    } finally {
      if (anchor) {
        document.body.removeChild(anchor);
      }
      setTimeout(() => setSaveState("idle"), 3200);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2.5 space-y-2">
        <div>
          <p className="text-[0.9375rem] font-semibold tracking-tight text-[var(--text-primary)]">
            {t("preview.title")}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">{t("preview.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <PDFDownloadLink
            document={pdfDoc}
            fileName={downloadName()}
            className="btn-secondary w-full text-center"
          >
            {({ loading }) => (
              <>
                <IconDownload />
                <span>{loading ? t("preview.preparing") : t("preview.downloadOnly")}</span>
              </>
            )}
          </PDFDownloadLink>

          <motion.button
            type="button"
            onClick={handleSaveAndDownload}
            disabled={saveState === "loading"}
            whileTap={{ scale: 0.985 }}
            transition={springGentle}
            className="btn-primary w-full disabled:cursor-not-allowed"
          >
            <IconCloudSave />
            <span>
              {saveState === "loading"
                ? t("preview.saving")
                : t("preview.saveAndDownload")}
            </span>
          </motion.button>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400 sm:text-[11px]">
          {t("preview.hint")}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {saveState === "success" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-2 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-800"
          >
            {t("common.saveSuccess")}
          </motion.div>
        )}
        {saveState === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-2 rounded-xl border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-700"
          >
            {t("common.saveError")}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative overflow-hidden rounded-none border border-zinc-200/90 bg-white shadow-[0_1px_3px_rgba(15,35,70,0.06)]"
        style={{ height: viewerHeight }}
      >
        <PDFViewer
          width="100%"
          height={viewerHeight}
          showToolbar={false}
          className="w-full border-0"
        >
          {pdfDoc}
        </PDFViewer>
      </div>
    </div>
  );
}
