'use client';
import React from 'react';
import type { ProductSort } from '@/lib/types/product-query';

interface SortSelectProps {
  value: ProductSort;
  onChange: (v: ProductSort) => void;
  className?: string;
}

export default function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <label className={`inline-flex items-center gap-2 text-sm ${className ?? ''}`}>
      <span className="hidden sm:inline text-neutral-500">Sort:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ProductSort)}
        className="rounded border px-3 py-1 text-sm"
      >
        <option value="newest">Newest</option>
        <option value="best_sellers">Best sellers</option>
        <option value="popular">Popular</option>
        <option value="price_asc">Price: Low → High</option>
        <option value="price_desc">Price: High → Low</option>
      </select>
    </label>
  );
}
