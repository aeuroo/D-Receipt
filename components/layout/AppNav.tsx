"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import {
  LocaleSwitcherDesktop,
  LocaleSwitcherMobile,
} from "@/components/ui/LocaleSwitcher";
import { APP_NAME } from "@/lib/brand";
import { useLocale } from "@/lib/i18n/locale-context";
import { springGentle } from "@/lib/motion";

function ReceiptIcon() {
  return (
    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export function AppNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/order", label: t("nav.orders") },
    { href: "/stat", label: t("nav.stats") },
  ];

  return (
    <div className="px-2 pt-1.5 sm:px-3 sm:pt-2">
      <header
        className="liquid-glass relative z-40 mx-auto flex max-w-[88rem] flex-col gap-2 overflow-visible rounded-[1.125rem] px-2.5 py-2 sm:flex-row sm:items-center sm:gap-3 sm:rounded-[1.25rem] sm:px-4 sm:py-2"
      >
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
          <Link href="/" className="group flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#4da3ff] to-[#007aff] shadow-[0_4px_12px_rgba(0,122,255,0.3)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-active:scale-95 sm:h-9 sm:w-9 sm:rounded-2xl">
              <ReceiptIcon />
            </span>
            <span className="truncate text-[0.875rem] font-semibold tracking-tight text-[var(--text-primary)] sm:text-[0.9375rem]">
              {APP_NAME}
            </span>
          </Link>
          <div className="shrink-0 sm:hidden">
            <LocaleSwitcherMobile />
          </div>
        </div>

        <nav
          className="flex w-full items-center gap-1 sm:ml-auto sm:w-auto sm:gap-0.5"
          aria-label="Main"
        >
          <div className="flex w-full gap-0.5 rounded-[1rem] border border-white/50 bg-white/45 p-0.5 sm:hidden">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex flex-1 items-center justify-center rounded-[0.875rem] py-2 text-center text-xs font-semibold transition duration-300 ${
                    active ? "text-white" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-mobile-pill"
                      className="absolute inset-0 rounded-[0.875rem] bg-gradient-to-b from-[#4da3ff] to-[#007aff] shadow-[0_4px_12px_rgba(0,122,255,0.28)]"
                      transition={springGentle}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center overflow-visible sm:flex">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative rounded-full px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-300 hover:text-[#007aff]"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-[rgba(0,122,255,0.12)] ring-1 ring-[rgba(0,122,255,0.15)]"
                      transition={springGentle}
                    />
                  )}
                  <span className={`relative ${active ? "font-semibold text-[#007aff]" : ""}`}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
            <LocaleSwitcherDesktop />
          </div>
        </nav>
      </header>
    </div>
  );
}
