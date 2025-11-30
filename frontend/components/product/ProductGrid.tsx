'use client';
import React from 'react';
import ProductCard from './ProductCard';
import type { ProductCardDTO } from '@/lib/queries/useProducts';

type Props = {
  products: ProductCardDTO[];
  isLoading?: boolean;
};

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="h-64 w-full rounded bg-neutral-200" />
      <div className="mt-3 space-y-2 px-2">
        <div className="h-4 w-3/4 rounded bg-neutral-200" />
        <div className="h-4 w-1/3 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export default function ProductGrid({ products, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium text-neutral-700">No products found.</p>
        <p className="mt-2 text-sm text-neutral-500">Try removing filters or searching for something else.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
