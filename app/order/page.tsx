import { Suspense } from "react";

import { OrdersPage } from "@/components/order/OrdersPage";

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      }
    >
      <OrdersPage />
    </Suspense>
  );
}
