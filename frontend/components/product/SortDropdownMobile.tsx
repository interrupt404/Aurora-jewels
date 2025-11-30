// components/product/SortDropdownMobile.tsx
'use client';
import React from 'react';
import type { ProductSort } from '@/lib/types/product-query';

type Props = {
  open: boolean;
  onClose: () => void;
  onSort: (value: ProductSort) => void;
  current: ProductSort;
};

const SORTS: { key: ProductSort; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'best_sellers', label: 'Best sellers' },
  { key: 'popular', label: 'Popular' },
  { key: 'price_asc', label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
];

export default function SortDropdownMobile({ open, onClose, onSort, current }: Props) {
  // ✔ Hooks must ALWAYS run first
  React.useEffect(() => {
    if (!open) return; // inside effect is allowed

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // ❗ Now it's safe to conditionally render UI
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* backdrop */}
      <button
        aria-label="Close sort"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* main box */}
      <div className="relative mb-20 w-full max-w-md px-4">
        <div className="bg-white rounded-2xl shadow-xl border p-2 animate-mobileSlideUp">
          <div className="p-3 text-sm font-medium border-b">Sort by</div>

          <div className="py-2">
            {SORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => { onSort(s.key); onClose(); }}
                className={`w-full text-left px-4 py-3 text-sm flex justify-between items-center rounded-lg transition
                  hover:bg-neutral-100
                  ${current === s.key ? 'font-semibold text-black' : 'text-neutral-700'}`}
              >
                <span>{s.label}</span>
                {current === s.key && <span className="text-lg">•</span>}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 text-sm text-center text-neutral-600 hover:bg-neutral-100 rounded-lg mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
