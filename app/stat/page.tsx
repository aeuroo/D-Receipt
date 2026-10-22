import { Suspense } from "react";

import { StatsPage } from "@/components/stat/StatsPage";

export default function StatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      }
    >
      <StatsPage />
    </Suspense>
  );
}
