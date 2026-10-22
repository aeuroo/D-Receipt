"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useLocale } from "@/lib/i18n/locale-context";
import type { Locale } from "@/lib/i18n/messages";
import { smoothTransition, springGentle } from "@/lib/motion";

const LOCALES: Locale[] = ["th", "en"];

function LanguageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function localeFullLabel(t: (key: string) => string, code: Locale) {
  return code === "th" ? t("locale.thFull") : t("locale.enFull");
}

/** Desktop: globe + label + dropdown */
export function LocaleSwitcherDesktop() {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Defer so the same click that opened the menu does not count as outside.
    const id = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointer);
      document.addEventListener("touchstart", onPointer);
    }, 0);
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (code: Locale) => {
    setLocale(code);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative z-50 ml-1">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.98 }}
        transition={springGentle}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-sm font-medium transition duration-300 ${
          open
            ? "border-[rgba(0,122,255,0.35)] bg-white/90 text-[#007aff] shadow-[0_4px_14px_rgba(0,122,255,0.12)]"
            : "border-[rgba(120,140,180,0.2)] bg-white/55 text-[var(--text-secondary)] hover:border-[rgba(0,122,255,0.25)] hover:text-[#007aff]"
        }`}
      >
        <LanguageIcon className="h-4 w-4 shrink-0" />
        <span className="max-w-[7rem] truncate">{localeFullLabel(t, locale)}</span>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={smoothTransition}
          className="h-3.5 w-3.5 shrink-0 opacity-70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label={t("locale.choose")}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={smoothTransition}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[200] min-w-[11.5rem] overflow-hidden rounded-2xl border border-[rgba(120,140,180,0.22)] bg-[rgba(255,255,255,0.96)] p-1 shadow-[0_12px_40px_rgba(15,35,70,0.18)] backdrop-blur-xl"
          >
            <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {t("locale.choose")}
            </p>
            {LOCALES.map((code) => {
              const active = locale === code;
              return (
                <button
                  key={code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => pick(code)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition duration-200 ${
                    active
                      ? "bg-[rgba(0,122,255,0.1)] font-semibold text-[#007aff]"
                      : "text-[var(--text-primary)] hover:bg-[rgba(0,122,255,0.06)]"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      active
                        ? "bg-[#007aff] text-white"
                        : "bg-[rgba(0,122,255,0.08)] text-[#007aff]"
                    }`}
                  >
                    {t(`locale.${code}`)}
                  </span>
                  <span className="flex-1">{localeFullLabel(t, code)}</span>
                  {active && <CheckIcon className="h-4 w-4 shrink-0 text-[#007aff]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Mobile: compact segmented pill */
export function LocaleSwitcherMobile() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className="flex rounded-full border border-[rgba(120,140,180,0.18)] bg-white/50 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
      role="group"
      aria-label={t("locale.choose")}
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`relative min-w-[2.75rem] rounded-full px-3 py-1.5 text-xs font-bold transition duration-300 ${
              active
                ? "text-white shadow-[0_3px_10px_rgba(0,122,255,0.35)]"
                : "text-[var(--text-secondary)]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="locale-mobile-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-b from-[#4da3ff] to-[#007aff]"
                transition={springGentle}
              />
            )}
            <span className="relative">{t(`locale.${code}`)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function LocaleSwitcher() {
  return (
    <>
      <div className="hidden sm:block">
        <LocaleSwitcherDesktop />
      </div>
      <div className="sm:hidden">
        <LocaleSwitcherMobile />
      </div>
    </>
  );
}
