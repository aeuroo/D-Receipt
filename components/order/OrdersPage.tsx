"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import { PageHeader } from "@/components/ui/PageHeader";
import { useLocale } from "@/lib/i18n/locale-context";
import { EDIT_SESSION_KEY } from "@/lib/constants";
import { smoothTransition } from "@/lib/motion";
import {
  calculateTotal,
  formatCurrency,
  getDocumentTypeLabel,
  getDisplayName,
} from "@/lib/document-utils";
import { fetchDocumentsPage, removeDocument } from "@/lib/documents";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { StoredDocument } from "@/lib/types";

function typeBadgeClass(type: StoredDocument["type"]) {
  switch (type) {
    case "receipt":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "invoice":
      return "bg-amber-50 text-amber-800 ring-amber-600/20";
    case "custom":
      return "bg-zinc-100 text-zinc-700 ring-zinc-500/20";
    default:
      return "bg-violet-50 text-violet-700 ring-violet-600/20";
  }
}

export function OrdersPage() {
  const { locale, t } = useLocale();
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selected, setSelected] = useState<StoredDocument | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setError(t("common.firebaseMissing"));
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await fetchDocumentsPage();
      setDocuments(result.documents);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error(err);
      setError(t("common.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    try {
      setLoadingMore(true);
      const result = await fetchDocumentsPage(lastDoc);
      setDocuments((prev) => [...prev, ...result.documents]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error(err);
      setError(t("common.fetchError"));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleEdit = (doc: StoredDocument) => {
    sessionStorage.setItem(EDIT_SESSION_KEY, JSON.stringify(doc));
    window.location.href = "/";
  };

  const handleDelete = async (doc: StoredDocument) => {
    if (!doc.id) return;
    if (!confirm(t("common.deleteConfirm"))) return;
    try {
      setDeletingId(doc.id);
      await removeDocument(doc.id);
      setDocuments((prev) => prev.filter((item) => item.id !== doc.id));
      if (selected?.id === doc.id) setSelected(null);
    } catch (err) {
      console.error(err);
      alert(t("common.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        title={t("orders.title")}
        description={t("orders.description")}
      />

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      ) : documents.length === 0 ? (
        <div className="liquid-glass p-10 text-center text-[var(--text-secondary)]">
          {t("common.noData")}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {documents.map((doc, index) => (
              <motion.article
                key={doc.id ?? `${doc.receiptNumber}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smoothTransition, delay: index * 0.03 }}
                className="liquid-inset p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {getDisplayName(doc)}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      {doc.date || "—"} · {doc.receiptNumber}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${typeBadgeClass(doc.type)}`}
                  >
                    {getDocumentTypeLabel(doc.type, doc.customDocumentTitle, locale)}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[#007aff]">
                  {formatCurrency(calculateTotal(doc.items || []))} {t("common.baht")}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(doc)}
                    className="btn-soft bg-[rgba(255,149,0,0.12)] py-2.5 text-xs text-[#c93400]"
                  >
                    {t("orders.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(doc)}
                    className="btn-soft bg-[rgba(0,122,255,0.1)] py-2.5 text-xs text-[#007aff]"
                  >
                    {t("orders.detail")}
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === doc.id}
                    onClick={() => handleDelete(doc)}
                    className="btn-soft bg-[rgba(255,59,48,0.1)] py-2.5 text-xs text-[#d70015] disabled:opacity-50"
                  >
                    {t("orders.delete")}
                  </button>
                </div>
              </motion.article>
            ))}
            {hasMore && (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-secondary"
              >
                {loadingMore ? t("common.loading") : t("common.loadMore")}
              </button>
            )}
          </div>

        <div className="liquid-glass hidden overflow-hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-200/80 bg-zinc-50/80 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">{t("orders.colDate")}</th>
                  <th className="px-4 py-3 font-medium">{t("orders.colNumber")}</th>
                  <th className="px-4 py-3 font-medium">{t("orders.colType")}</th>
                  <th className="px-4 py-3 font-medium">{t("orders.colName")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("orders.colTotal")}</th>
                  <th className="px-4 py-3 font-medium text-center">{t("orders.colActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {documents.map((doc, index) => (
                  <motion.tr
                    key={doc.id ?? `${doc.receiptNumber}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-zinc-50/60"
                  >
                    <td className="px-4 py-3 text-zinc-700">{doc.date || "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                      {doc.receiptNumber}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${typeBadgeClass(doc.type)}`}
                      >
                        {getDocumentTypeLabel(doc.type, doc.customDocumentTitle, locale)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-900">{getDisplayName(doc)}</td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">
                      {formatCurrency(calculateTotal(doc.items || []))} {t("common.baht")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(doc)}
                          className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
                        >
                          {t("orders.edit")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelected(doc)}
                          className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-200"
                        >
                          {t("orders.detail")}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === doc.id}
                          onClick={() => handleDelete(doc)}
                          className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {t("orders.delete")}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="border-t border-zinc-100 p-4 text-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="text-sm font-medium text-blue-600 transition hover:text-blue-800 disabled:opacity-50"
              >
                {loadingMore ? t("common.loading") : t("common.loadMore")}
              </button>
            </div>
          )}
        </div>
        </>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(15,25,45,0.35)] p-3 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smoothTransition}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={smoothTransition}
              onClick={(e) => e.stopPropagation()}
              className="liquid-glass max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] p-6"
            >
              <h2 className="text-lg font-semibold text-zinc-900">{t("orders.detailTitle")}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label={t("orders.colNumber")} value={selected.receiptNumber} />
                <Row label={t("orders.colDate")} value={selected.date} />
                <Row
                  label={t("orders.colType")}
                  value={getDocumentTypeLabel(
                    selected.type,
                    selected.customDocumentTitle,
                    locale,
                  )}
                />
                <Row label={t("orders.colName")} value={getDisplayName(selected)} />
                <Row
                  label={t("orders.address")}
                  value={
                    selected.infoType === "customer"
                      ? selected.customerAddress
                      : selected.address
                  }
                />
                <Row
                  label={t("form.phone")}
                  value={
                    selected.infoType === "customer"
                      ? selected.customerPhone
                      : selected.companyPhone
                  }
                />
                <Row
                  label={t("orders.colTotal")}
                  value={`${formatCurrency(calculateTotal(selected.items || []))} ${t("common.baht")}`}
                />
              </dl>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="btn-primary mt-6"
              >
                {t("common.close")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-3 border-b border-zinc-100 pb-2">
      <dt className="w-24 shrink-0 text-zinc-500">{label}</dt>
      <dd className="text-zinc-900">{value || "—"}</dd>
    </div>
  );
}
