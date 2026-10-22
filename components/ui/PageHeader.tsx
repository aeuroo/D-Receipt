"use client";

import { motion } from "framer-motion";

import { smoothTransition } from "@/lib/motion";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothTransition}
      className="mb-4 sm:mb-5"
    >
      {eyebrow && (
        <p className="text-xs font-semibold tracking-wide text-[#007aff]">{eyebrow}</p>
      )}
      <h1 className="page-title mt-1">{title}</h1>
      {description && <p className="page-subtitle">{description}</p>}
    </motion.header>
  );
}
