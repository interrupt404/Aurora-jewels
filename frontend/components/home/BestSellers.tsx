// components/home/BestSellers.tsx
// ──────────────────────────────────────────────────────────────────
// Best Sellers section — Server Component.
//
// Architecture: Server Component → server fetch → Client ProductCard
//
// This component remains a Server Component because:
//  • Data fetching happens on the server (no browser API round-trip)
//  • Next.js `{ next: { revalidate: 60 } }` caching is preserved
//  • Section markup (headings, grid) stays out of the client bundle
//  • ProductCard is already a 'use client' component — it receives
//    serializable product props from the server and independently
//    uses Zustand hooks for cart interactivity on the client side.
//
// The client boundary is at ProductCard, not at this section level.
// ──────────────────────────────────────────────────────────────────

import { fetchBestSellers } from "@/lib/queries/useHome";
import ProductCard from "@/components/product/ProductCard";

export async function BestSellers() {
  const products = await fetchBestSellers();

  return (
    <section className="w-full bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">
        {/* 🧩 Matching heading style to CategoryGrid */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-neutral-800 uppercase tracking-wide">
            Best Sellers
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Most loved pieces from our latest collection.
          </p>
        </div>

        {/* Product cards grid — ProductCard is a Client Component that
            receives server-fetched product data as serializable props. */}
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-4 place-items-center">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              className="w-[220px]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}