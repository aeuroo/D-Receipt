"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useLocale } from "@/lib/i18n/locale-context";
import type { NotePresetId } from "@/lib/i18n/messages";
import {
  getNotePresetOptions,
  isNotePresetSelected,
} from "@/lib/i18n/translate";
import { smoothTransition } from "@/lib/motion";
import type { ReceiptFormData } from "@/lib/types";

type Props = {
  formData: ReceiptFormData;
  onToggle: (id: NotePresetId) => void;
  onNoteChange: React.ChangeEventHandler<HTMLTextAreaElement>;
};

function NotesFields({
  formData,
  onToggle,
  onNoteChange,
  compact,
}: Props & { compact?: boolean }) {
  const { locale, t } = useLocale();
  const options = getNotePresetOptions(locale);

  return (
    <div className="space-y-3">
      <div
        className={`grid grid-cols-1 gap-1.5 ${compact ? "" : "sm:grid-cols-2 sm:gap-2"}`}
      >
        {options.map(({ id, label }) => (
          <label
            key={id}
            className={`flex cursor-pointer items-start gap-2 rounded-2xl px-2 py-1.5 text-slate-700 transition hover:bg-white/80 ${
              compact ? "text-xs leading-snug" : "text-sm"
            }`}
          >
            <input
              type="checkbox"
              checked={isNotePresetSelected(id, formData.noteChecklist)}
              onChange={() => onToggle(id)}
              className={`mt-0.5 shrink-0 rounded border-slate-400 text-blue-600 focus:ring-blue-400 ${
                compact ? "h-3.5 w-3.5" : "h-4 w-4"
              }`}
            />
            <span>{label.trim()}</span>
          </label>
        ))}
      </div>
      <textarea
        name="note"
        value={formData.note}
        onChange={onNoteChange}
        rows={compact ? 2 : 3}
        placeholder={
          compact ? t("form.noteExtraShort") : t("form.noteExtra")
        }
        className={`field-input resize-none ${compact ? "min-h-[64px]" : "min-h-[80px]"}`}
      />
    </div>
  );
}

export function NotesSection({ formData, onToggle, onNoteChange }: Props) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const selectedCount = formData.noteChecklist?.length ?? 0;
  const hasExtra = Boolean(formData.note?.trim());
  const summaryParts: string[] = [];
  if (selectedCount > 0) {
    summaryParts.push(t("form.notesSummary", { n: selectedCount }));
  }
  if (hasExtra) summaryParts.push(t("form.notesHasExtra"));
  const summary = summaryParts.length
    ? summaryParts.join(" · ")
    : t("form.notesTap");

  return (
    <>
      <div className="liquid-inset sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
          aria-expanded={open}
        >
          <div>
            <p className="text-sm font-semibold text-slate-800">{t("form.notes")}</p>
            <p className="mt-0.5 text-xs text-slate-500">{summary}</p>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={smoothTransition}
            className="text-blue-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={smoothTransition}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-200/80 px-3 pb-3 pt-2.5">
                <NotesFields
                  formData={formData}
                  onToggle={onToggle}
                  onNoteChange={onNoteChange}
                  compact
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="liquid-inset hidden p-3 sm:block sm:p-4">
        <p className="mb-2.5 text-sm font-semibold text-slate-800">{t("form.notes")}</p>
        <NotesFields
          formData={formData}
          onToggle={onToggle}
          onNoteChange={onNoteChange}
        />
      </div>
    </>
  );
}
