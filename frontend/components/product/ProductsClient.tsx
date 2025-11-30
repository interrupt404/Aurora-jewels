'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FiltersSidebar from './FiltersSidebar';
import ProductGrid from './ProductGrid';
import SearchInput from './SearchInput';
import { useProducts } from '@/lib/queries/useProducts';
import type { ProductQueryParams, ProductSort } from '@/lib/types/product-query';
import type { ProductCardDTO } from '@/lib/queries/useProducts';
import FiltersSlideOver from './FiltersSlideOver';
import SortDropdownMobile from './SortDropdownMobile';
import { useSearchParams } from "next/navigation";

const DEFAULT_FILTER_OPTIONS = {
  categories: ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants'],
  metals: ['Gold', 'Silver', 'Rose Gold', 'Platinum'],
  stones: ['Diamond', 'Ruby', 'Sapphire', 'Pearl', 'None'],
};

export default function ProductsClient() {
  const [params, setParams] = useState<ProductQueryParams>({
    page: 1,
    limit: 12,
    sort: 'newest',
  });

  const searchParams = useSearchParams();

// Sync URL filters into params (runs on load + whenever URL changes)
  useEffect(() => {
    if (!searchParams) return;

    const fromUrl: Partial<ProductQueryParams> = {};

    const q = searchParams.get("q");
    const sort = searchParams.get("sort");
    const category = searchParams.get("category");
    const metal = searchParams.get("metal_type");
    const stone = searchParams.get("stone_type");
    const min = searchParams.get("min_price");
    const max = searchParams.get("max_price");
    const feat = searchParams.get("is_featured");

    if (q) fromUrl.q = q;
    if (sort) fromUrl.sort = sort as ProductSort;
    if (category) fromUrl.category = category;
    if (metal) fromUrl.metal_type = metal;
    if (stone) fromUrl.stone_type = stone;
    if (min) fromUrl.min_price = min;
    if (max) fromUrl.max_price = max;
    if (feat === "true" || feat === "false") fromUrl.is_featured = feat;

    // 🔥 Detect if URL has *no* filters at all → CLEAR all filters
    const hasAnyFilter =
      q || sort || category || metal || stone || min || max || feat;

    if (!hasAnyFilter) {
      setParams({
        page: 1,
        limit: 12,
        sort: "newest",
      });
      return;
    }

    // Otherwise apply filters normally
    setParams(prev => ({
      ...prev,
      ...fromUrl,
      page: 1,
    }));
  }, [searchParams]);


  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  const [accumulated, setAccumulated] = useState<ProductCardDTO[]>([]);
  const lastFilterKeyRef = useRef<string | null>(null);

  const { data, isLoading } = useProducts(params);

  const products = useMemo(() => data?.products ?? [], [data?.products]);
  const pagination = useMemo(() => data?.pagination ?? { currentPage: 1, totalPages: 1 }, [data?.pagination]);

  const filterOptions = DEFAULT_FILTER_OPTIONS;

  useEffect(() => {
    const filterKey = JSON.stringify({
      q: params.q ?? '',
      sort: params.sort ?? '',
      limit: params.limit ?? '',
      category: params.category ?? '',
      metal_type: params.metal_type ?? '',
      stone_type: params.stone_type ?? '',
      min_price: params.min_price ?? '',
      max_price: params.max_price ?? '',
      is_featured: params.is_featured ?? '',
    });

    if (lastFilterKeyRef.current !== filterKey) {
      setAccumulated(products);
      lastFilterKeyRef.current = filterKey;
    } else if ((params.page ?? 1) > 1) {
      setAccumulated((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const appended = products.filter((p) => !ids.has(p.id));
        return [...prev, ...appended];
      });
    } else {
      setAccumulated(products);
    }
  }, [products, params]);

  const onFiltersChange = useCallback((filters: Partial<ProductQueryParams>) => {
    setParams((prev) => ({ ...prev, ...filters, page: 1 }));
    setMobileFilterOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const onSearch = useCallback((q: string) => {
    setParams((prev) => ({ ...prev, q, page: 1 }));
  }, []);

  const onSort = useCallback((sort: ProductSort) => {
    setParams((prev) => ({ ...prev, sort, page: 1 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // infinite sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (pagination.currentPage >= pagination.totalPages) return;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setParams((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }));
          }
        }),
      { rootMargin: '300px' }
    );

    const el = sentinelRef.current;
    if (el) io.observe(el);
    return () => io.disconnect();
  }, [pagination]);

  return (
    <section className="w-full bg-neutral-100 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">  

        {/* layout: sidebar (white) | gutter (off-white) | main card (white) */}
        <div className="flex flex-col lg:flex-row gap-0">
          {/* Sidebar column */}
          <div className="hidden lg:block">
            <div className="w-72">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
                <div className="p-5">
                  <FiltersSidebar
                    onChange={onFiltersChange}
                    options={filterOptions}
                    initial={params}
                    showActions={false}
                    liveUpdate={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* gutter (off-white) — visually separates columns like Flipkart */}
          <div className="hidden lg:block w-6" aria-hidden />

          {/* MAIN CARD: search + sort + products */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-5xl rounded-2xl bg-white shadow-md ring-1 ring-neutral-100 overflow-hidden">
              {/* Top: centered Search */}
              <div className="px-6 py-6 flex justify-center">
                <div className="w-full max-w-3xl">
                  <SearchInput onSearch={onSearch} />
                </div>
              </div>

            {/* Sort buttons row (desktop only) */}
            <div className="px-6 py-4 hidden lg:block">
            <div className="flex justify-center">
                <div className="flex flex-wrap gap-3 justify-center">
                {[
                    ['newest', 'Newest'],
                    ['best_sellers', 'Best sellers'],
                    ['popular', 'Popular'],
                    ['price_asc', 'Price ↑'],
                    ['price_desc', 'Price ↓'],
                ].map(([key, label]) => (
                    <button
                    key={key}
                    onClick={() => onSort(key as ProductSort)}
                    className={`
                        min-w-[96px] px-4 py-2 rounded-full text-sm border whitespace-nowrap transition
                        ${params.sort === key
                        ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-sm'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100'}
                    `}
                    >
                    {label}
                    </button>
                ))}
                </div>
            </div>
            </div>


              {/* Products area */}
              <div className="p-6">
                <ProductGrid products={accumulated} isLoading={isLoading && accumulated.length === 0} />

                {pagination.currentPage < pagination.totalPages && (
                  <div className="mt-6 flex items-center justify-center">
                    <button
                      onClick={() => setParams((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                      className="rounded border px-4 py-2"
                    >
                      Load more
                    </button>
                  </div>
                )}

                <div ref={sentinelRef} className="h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE bottom bar */}
      <div className="lg:hidden fixed bottom-4 left-0 right-0 z-50 px-4 flex justify-center">
        <div className="w-full max-w-3xl bg-white border rounded-xl shadow-lg flex items-center gap-3 p-2">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex-1 bg-neutral-900 text-white py-2 rounded-lg text-sm"
          >
            Filters
          </button>

          <button
            onClick={() => setMobileSortOpen(true)}
            className="flex-1 bg-neutral-100 text-neutral-900 py-2 rounded-lg text-sm border"
          >
            Sort
          </button>
        </div>
      </div>

      {/* Mobile filter and sort */}
      <FiltersSlideOver
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        onApply={onFiltersChange}
        options={filterOptions}
        initial={params}
      />

      <SortDropdownMobile
        open={mobileSortOpen}
        onClose={() => setMobileSortOpen(false)}
        onSort={onSort}
        current={(params.sort ?? 'newest') as ProductSort}
      />
    </section>
  );
}
