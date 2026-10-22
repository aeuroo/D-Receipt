"use client";

import { useLocale } from "@/lib/i18n/locale-context";

export function PageLoading() {
  const { t } = useLocale();
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-zinc-500">
      {t("common.loading")}
    </div>
  );
}
