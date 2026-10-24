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

function ReceiptIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`${className} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function isLinkActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLink({
  href,
  label,
  active,
  layoutId,
  className,
  variant,
}: {
  href: string;
  label: string;
  active: boolean;
  layoutId: string;
  className: string;
  variant: "mobile" | "desktop";
}) {
  const pillClass =
    variant === "mobile"
      ? "absolute inset-0 rounded-[0.625rem] bg-gradient-to-b from-[#4da3ff] to-[#007aff] shadow-[0_2px_8px_rgba(0,122,255,0.32)]"
      : "absolute inset-0 rounded-full bg-[rgba(0,122,255,0.12)] ring-1 ring-[rgba(0,122,255,0.15)]";

  const labelClass =
    variant === "mobile"
      ? active
        ? "font-semibold text-white"
        : "font-semibold text-[var(--text-secondary)]"
      : active
        ? "font-semibold text-[#007aff]"
        : "font-medium text-[var(--text-secondary)]";

  return (
    <Link href={href} className={className}>
      {active && (
        <motion.span layoutId={layoutId} className={pillClass} transition={springGentle} />
      )}
      <span className={`relative ${labelClass}`}>{label}</span>
    </Link>
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
    <>
      {/* Desktop: top bar */}
      <div className="hidden px-3 pt-2 sm:block">
        <header
          className="liquid-glass relative z-40 mx-auto flex max-w-[88rem] items-center justify-between gap-2 overflow-visible rounded-[1.25rem] px-4 py-2"
        >
          <Link href="/" className="group flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#4da3ff] to-[#007aff] shadow-[0_4px_12px_rgba(0,122,255,0.3)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-active:scale-95">
              <ReceiptIcon />
            </span>
            <span className="truncate text-[0.9375rem] font-semibold tracking-tight text-[var(--text-primary)]">
              {APP_NAME}
            </span>
          </Link>

          <nav className="ml-auto flex items-center overflow-visible" aria-label="Main">
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={isLinkActive(pathname, link.href)}
                layoutId="nav-pill"
                variant="desktop"
                className="relative rounded-full px-3.5 py-2 text-sm transition-colors duration-300 hover:text-[#007aff]"
              />
            ))}
            <LocaleSwitcherDesktop />
          </nav>
        </header>
      </div>

      {/* Mobile: floating dock */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 px-3.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2 sm:hidden"
        aria-label="Main"
      >
        <div
          className="mx-auto flex max-w-[88rem] items-center gap-2 rounded-[1.125rem] border border-[rgba(120,140,180,0.2)] bg-[rgba(255,255,255,0.96)] p-1.5 shadow-[0_10px_40px_rgba(15,35,70,0.16),0_2px_8px_rgba(15,35,70,0.08)] backdrop-blur-xl"
        >
          <div className="flex min-w-0 flex-1 gap-0.5 rounded-[0.75rem] bg-[#eef2f8] p-0.5">
            {links.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={isLinkActive(pathname, link.href)}
                layoutId="nav-mobile-pill"
                variant="mobile"
                className="relative flex min-w-0 flex-1 items-center justify-center rounded-[0.625rem] px-1 py-2 text-center text-[0.6875rem] leading-tight"
              />
            ))}
          </div>

          <LocaleSwitcherMobile />
        </div>
      </nav>
    </>
  );
}
