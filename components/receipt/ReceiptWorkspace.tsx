"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { PageHeader } from "@/components/ui/PageHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useLocale } from "@/lib/i18n/locale-context";
import { EDIT_SESSION_KEY } from "@/lib/constants";
import { smoothTransition } from "@/lib/motion";
import {
  createInitialFormData,
  generateReceiptNumber,
  getLocalDateString,
} from "@/lib/document-utils";
import type { ReceiptFormData } from "@/lib/types";

import { ReceiptForm } from "./ReceiptForm";

function PreviewLoading() {
  const { t } = useLocale();
  return (
    <div className="flex min-h-[380px] items-center justify-center rounded-none border border-zinc-200/90 bg-white">
      <motion.div
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        className="text-sm text-[var(--text-secondary)]"
      >
        {t("common.loading")}
      </motion.div>
    </div>
  );
}

const DocumentPreviewPanel = dynamic(
  () =>
    import("./DocumentPreviewPanel").then((mod) => mod.DocumentPreviewPanel),
  {
    ssr: false,
    loading: () => <PreviewLoading />,
  },
);

type MobileTab = "form" | "preview";

export function ReceiptWorkspace() {
  const { locale, t } = useLocale();
  const [formData, setFormData] = useState<ReceiptFormData>(() =>
    createInitialFormData(locale),
  );
  const [mobileTab, setMobileTab] = useState<MobileTab>("form");

  const tabs = useMemo(
    () => [
      { value: "form" as const, label: t("home.tabForm") },
      { value: "preview" as const, label: t("home.tabPreview") },
    ],
    [t],
  );

  useEffect(() => {
    const raw = sessionStorage.getItem(EDIT_SESSION_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ReceiptFormData;
        setFormData({
          ...parsed,
          customDocumentTitle: parsed.customDocumentTitle ?? "",
        });
        sessionStorage.removeItem(EDIT_SESSION_KEY);
        return;
      } catch (error) {
        console.error("Failed to parse edit document data", error);
      }
    }

    const today = getLocalDateString();
    setFormData((prev) => ({
      ...prev,
      date: today,
      receiptNumber: prev.receiptNumber || generateReceiptNumber(today),
    }));
  }, []);

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={t("brand.tagline")}
        title={t("home.title")}
        description={t("home.description")}
      />

      <div className="mb-3 lg:hidden">
        <SegmentedControl value={mobileTab} options={tabs} onChange={setMobileTab} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-4">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={smoothTransition}
          className={`liquid-glass p-3 sm:p-4 lg:col-span-5 ${
            mobileTab === "form" ? "block" : "hidden lg:block"
          }`}
        >
          <ReceiptForm formData={formData} setFormData={setFormData} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothTransition, delay: 0.06 }}
          className={`liquid-glass p-3 sm:p-4 lg:col-span-7 ${
            mobileTab === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          <DocumentPreviewPanel formData={formData} />
        </motion.section>
      </div>
    </div>
  );
}
