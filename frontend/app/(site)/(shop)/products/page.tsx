// app/(shop)/products/page.tsx
import React, { Suspense } from "react";
import ProductsClient from '@/components/product/ProductsClient';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading products…</div>}>
      <ProductsClient />
    </Suspense>
  );
}
