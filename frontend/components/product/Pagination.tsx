'use client';
import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({ page, totalPages, onPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  // small pager: show up to 5 pages with center focus
  const pagesToShow = 5;
  let start = Math.max(1, page - Math.floor(pagesToShow / 2));
  const end = Math.min(totalPages, start + pagesToShow - 1);
  if (end - start < pagesToShow - 1) start = Math.max(1, end - pagesToShow + 1);

  return (
    <div className="mt-8 flex justify-center items-center gap-3">
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Prev
      </button>

      <div className="flex items-center gap-2">
        {range(start, end).map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`px-3 py-1 rounded text-sm ${p === page ? 'bg-neutral-900 text-white' : 'border'}`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-40"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
