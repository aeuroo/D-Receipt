"use client";

import { motion } from "framer-motion";

import { springGentle } from "@/lib/motion";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: Props<T>) {
  return (
    <div className={`segmented ${className}`} role="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            data-active={active}
            onClick={() => onChange(opt.value)}
            className="segmented-item relative"
          >
            {active && (
              <motion.span
                layoutId="segment-pill"
                className="absolute inset-0 rounded-[1.125rem] bg-gradient-to-b from-[#3d9dff] via-[#007aff] to-[#0066d6] shadow-[0_4px_14px_rgba(0,122,255,0.35)]"
                transition={springGentle}
                style={{ zIndex: 0 }}
              />
            )}
            <span
              className={`relative z-10 ${active ? "text-white" : "text-[var(--text-secondary)]"}`}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
