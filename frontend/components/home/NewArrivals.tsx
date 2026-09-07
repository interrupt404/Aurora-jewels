// components/home/NewArrivals.tsx
// ──────────────────────────────────────────────────────────────────
// New Arrivals section — Server Component.
//
// Same architecture rationale as BestSellers: server fetch with
// Next.js caching, passing serializable product data as props to
// the cart-aware ProductCard (the client boundary).
// ──────────────────────────────────────────────────────────────────

import { fetchNewArrivals } from "@/lib/queries/useHome";
import ProductCard from "@/components/product/ProductCard";

export async function NewArrivals() {
  const products = await fetchNewArrivals();

  return (
    <section className="w-full bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">
        {/* 🧩 Matching heading style to CategoryGrid */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-neutral-800 uppercase tracking-wide">
            New Arrivals
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Newly added pieces to our latest collection.
          </p>
        </div>

        {/* Product cards grid */}
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