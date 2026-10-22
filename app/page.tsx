import { Suspense } from "react";

import { ReceiptWorkspace } from "@/components/receipt/ReceiptWorkspace";
import { PageLoading } from "@/components/ui/PageLoading";

export default function HomePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ReceiptWorkspace />
    </Suspense>
  );
}
