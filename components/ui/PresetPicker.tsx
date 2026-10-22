"use client";

import { ChevronDown } from "./ChevronDown";

type Option = { value: string; label: string };

type Props = {
  options: Option[];
  onSelect: (value: string) => void;
  ariaLabel: string;
  title?: string;
};

export function PresetPicker({ options, onSelect, ariaLabel, title }: Props) {
  return (
    <div className="relative shrink-0" title={title}>
      <select
        value=""
        onChange={(e) => {
          const value = e.target.value;
          if (value) onSelect(value);
        }}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        aria-label={ariaLabel}
      >
        <option value="">เลือก</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(130,150,180,0.35)] bg-white/95 text-[var(--text-secondary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-[rgba(0,122,255,0.4)] hover:text-[#007aff] active:scale-95"
        aria-hidden
      >
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  );
}
