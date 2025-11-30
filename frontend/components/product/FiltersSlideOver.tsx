'use client';
import React, { useEffect, useState } from 'react';
import FiltersSidebar from './FiltersSidebar';
import type { PartialProductQuery } from '@/lib/types/product-query';

type Options = {
  categories: string[];
  metals: string[];
  stones: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onApply: (filters: PartialProductQuery) => void;
  options: Options;
  initial?: PartialProductQuery;
};

export default function FiltersSlideOver({ open, onClose, onApply, options, initial }: Props) {
  const [draft, setDraft] = useState<PartialProductQuery | undefined>(initial);

  useEffect(() => {
    if (open) setDraft(initial ?? {});
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // prevent body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  // apply (push draft up)
  const handleApply = () => {
    onApply({ ...(draft ?? {}), page: 1 });
    onClose();
  };

  const handleReset = () => setDraft({});

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <button aria-hidden className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* panel: right side */}
      <div className="relative ml-auto h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="text-lg font-medium">Filters</h3>
            <p className="text-xs text-neutral-500 mt-0.5">Select filters — updates are live.</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleReset} className="text-sm text-neutral-700 hover:underline">Reset</button>
            <button onClick={onClose} className="inline-flex items-center justify-center rounded border px-2 py-1 text-sm">Close</button>
          </div>
        </div>

        <div className="p-4 overflow-auto flex-1">
          <FiltersSidebar
            onChange={(f) => setDraft(f)}
            options={options}
            initial={draft}
            showActions={false}
            liveUpdate={true} // slide-over uses live updates so selection immediately triggers API
          />
        </div>

        <div className="border-t px-4 py-3 bg-white flex items-center gap-3">
            <div className="flex-1 text-sm text-neutral-700">{(() => {
                const d = draft ?? {};
                const count = Object.keys(d)
                .filter(k => k !== 'page' && d[k as keyof PartialProductQuery] !== undefined && String(d[k as keyof PartialProductQuery]) !== '')
                .length;
                return `${count} selected`;
            })()}</div>

            <button
                onClick={handleApply}
                className="rounded bg-neutral-900 text-white px-4 py-2 text-sm cursor-pointer
                        hover:bg-neutral-800 hover:opacity-90"
            >
                Apply
            </button>

            <button
                onClick={onClose}
                className="rounded border px-4 py-2 text-sm cursor-pointer
                        hover:bg-neutral-100 hover:line-through hover:opacity-70"
            >
                Cancel
            </button>
            </div>

      </div>
    </div>
  );
}
