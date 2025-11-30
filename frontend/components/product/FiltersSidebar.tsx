// components/product/FiltersSidebar.tsx
'use client';
import React, { useMemo } from 'react';
import type { PartialProductQuery } from '@/lib/types/product-query';
import DualSlider from './DualSlider';

type Options = {
  categories: string[];
  metals: string[];
  stones: string[];
};

type Props = {
  onChange: (filters: PartialProductQuery) => void;
  options?: Options;            // FULL lists provided by parent (Option A)
  initial?: PartialProductQuery;
  showActions?: boolean;        // desktop only (we hide actions when using liveUpdate)
  liveUpdate?: boolean;         // if true -> every toggle triggers onChange immediately
};

export default function FiltersSidebar({
  onChange,
  options,
  initial,
  liveUpdate = false,
}: Props) {
  // parse CSV initial values -> arrays
  const parseCsv = (v?: unknown) => {
    if (!v) return [] as string[];
    return String(v).split(',').map(s => s.trim()).filter(Boolean);
  };

  // internal state initialized from initial prop
  const [categories, setCategories] = React.useState<string[]>(parseCsv(initial?.category));
  const [metals, setMetals] = React.useState<string[]>(parseCsv(initial?.metal_type));
  const [stones, setStones] = React.useState<string[]>(parseCsv(initial?.stone_type));
  const [minPrice, setMinPrice] = React.useState<string>(String(initial?.min_price ?? '0'));
  const [maxPrice, setMaxPrice] = React.useState<string>(String(initial?.max_price ?? '10000'));
  const [featured, setFeatured] = React.useState<boolean>(initial?.is_featured === 'true');

  // --- NEW: sync internal state when `initial` prop changes (URL / parent updates) ---
  React.useEffect(() => {
    setCategories(parseCsv(initial?.category));
    setMetals(parseCsv(initial?.metal_type));
    setStones(parseCsv(initial?.stone_type));

    // update slider inputs only if parent provided values (avoid stomping local edits)
    if (initial?.min_price !== undefined) setMinPrice(String(initial.min_price));
    if (initial?.max_price !== undefined) setMaxPrice(String(initial.max_price));

    setFeatured(initial?.is_featured === 'true');
  }, [
    initial?.category,
    initial?.metal_type,
    initial?.stone_type,
    initial?.min_price,
    initial?.max_price,
    initial?.is_featured,
  ]);
  // --- END NEW ---

  // toggle helper
  const toggle = (arr: string[], val: string, setter: (a: string[]) => void) => {
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
    setter(next);
    if (liveUpdate) applyWith({ categories: (setter === setCategories ? next : categories), metals: (setter === setMetals ? next : metals), stones: (setter === setStones ? next : stones) });
  };

  const applyWith = (opts?: {
    categories?: string[]; metals?: string[]; stones?: string[]; minPrice?: string; maxPrice?: string; featured?: boolean;
  }) => {
    const c = opts?.categories ?? categories;
    const m = opts?.metals ?? metals;
    const s = opts?.stones ?? stones;
    const min = opts?.minPrice ?? minPrice;
    const max = opts?.maxPrice ?? maxPrice;
    const feat = opts?.featured ?? featured;

    onChange({
      category: c.length ? c.join(',') : undefined,
      metal_type: m.length ? m.join(',') : undefined,
      stone_type: s.length ? s.join(',') : undefined,
      min_price: min || undefined,
      max_price: max || undefined,
      is_featured: feat ? 'true' : undefined,
      page: 1,
    });
  };

  const active = useMemo(() => {
    const chips: { id: string; label: string }[] = [];
    categories.forEach(c => chips.push({ id: `category:${c}`, label: c }));
    metals.forEach(m => chips.push({ id: `metal:${m}`, label: m }));
    stones.forEach(s => chips.push({ id: `stone:${s}`, label: s }));
    if (minPrice && Number(minPrice) > 0) chips.push({ id: `min_price:${minPrice}`, label: `Min ${minPrice}` });
    if (maxPrice && Number(maxPrice) < 10000) chips.push({ id: `max_price:${maxPrice}`, label: `Max ${maxPrice}` });
    if (featured) chips.push({ id: `is_featured:true`, label: 'Featured' });
    return chips;
  }, [categories, metals, stones, minPrice, maxPrice, featured]);

  function clearAll() {
    setCategories([]);
    setMetals([]);
    setStones([]);
    setMinPrice('');
    setMaxPrice('');
    setFeatured(false);
    onChange({ page: 1 });
  }

  function removeChip(id: string) {
    const [type, ...rest] = id.split(':');
    const value = rest.join(':');

    if (type === 'category') {
      const next = categories.filter(x => x !== value);
      setCategories(next); applyWith({ categories: next }); return;
    }
    if (type === 'metal') {
      const next = metals.filter(x => x !== value);
      setMetals(next); applyWith({ metals: next }); return;
    }
    if (type === 'stone') {
      const next = stones.filter(x => x !== value);
      setStones(next); applyWith({ stones: next }); return;
    }
    if (type === 'min_price') { setMinPrice(''); applyWith({ minPrice: '' }); return; }
    if (type === 'max_price') { setMaxPrice(''); applyWith({ maxPrice: '' }); return; }
    if (type === 'is_featured') { setFeatured(false); applyWith({ featured: false }); return; }
  }

  // Always show full lists (Option A) — parent should pass real lists later
  const cats = options?.categories?.length ? options.categories : ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants'];
  const metalsList = options?.metals?.length ? options.metals : ['Gold', 'Silver', 'Rose Gold', 'Platinum'];
  const stonesList = options?.stones?.length ? options.stones : ['Diamond', 'Ruby', 'Sapphire', 'Pearl', 'None'];

  return (
    <aside className="w-full space-y-6">
      {/* top: clear & selected count */}
      <div className="flex items-center justify-between">
        <button onClick={clearAll} className="text-sm text-neutral-700 hover:underline cursor-pointer">Clear all</button>
        <div className="text-sm text-neutral-500">{active.length} selected</div>
      </div>

      {/* active chips */}
      {active.length > 0 && (
        <div>
          <div className="mb-2 text-xs text-neutral-500 uppercase tracking-wide">Active</div>
          <div className="flex flex-wrap gap-2">
            {active.map(c => (
              <button
                key={c.id}
                onClick={() => removeChip(c.id)}
                className="flex items-center gap-2 text-sm px-2 py-1 rounded-full border bg-white/60 select-none cursor-pointer transition hover:opacity-70 hover:line-through"
                aria-label={`Remove ${c.label}`}
              >
                <span>{c.label}</span><span className="text-xs opacity-60">×</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* categories (multi-checkbox grid) */}
      <div>
        <div className="mb-2 text-xs text-neutral-500 uppercase tracking-wide">Category</div>
        <div className="grid gap-2 grid-cols-2">
          {cats.map(cat => (
            <label key={cat} className="flex items-center gap-3 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={categories.includes(cat)}
                onChange={() => toggle(categories, cat, setCategories)}
                className="h-4 w-4 cursor-pointer"
              />
              <span className="text-neutral-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* metals */}
      <div>
        <div className="mb-2 text-xs text-neutral-500 uppercase tracking-wide">Metal</div>
        <div className="grid gap-2 grid-cols-2">
          {metalsList.map(m => (
            <label key={m} className="flex items-center gap-3 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={metals.includes(m)}
                onChange={() => toggle(metals, m, setMetals)}
                className="h-4 w-4 cursor-pointer"
              />
              <span className="text-neutral-700">{m}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* stones */}
      <div>
        <div className="mb-2 text-xs text-neutral-500 uppercase tracking-wide">Stone</div>
        <div className="grid gap-2 grid-cols-2">
          {stonesList.map(s => (
            <label key={s} className="flex items-center gap-3 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={stones.includes(s)}
                onChange={() => toggle(stones, s, setStones)}
                className="h-4 w-4 cursor-pointer"
              />
              <span className="text-neutral-700">{s}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* price */}
      <div>
        <div className="mb-2 text-xs text-neutral-500 uppercase tracking-wide">Price range</div>

        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={minPrice}
            min={0}
            max={10000}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), Number(maxPrice || 10000));
              setMinPrice(String(v));
            }}
            onBlur={() => liveUpdate && applyWith({ minPrice })}
            placeholder="Min"
            className="w-1/2 rounded border px-2 py-1 text-sm"
          />

          <input
            type="number"
            value={maxPrice}
            min={0}
            max={10000}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), Number(minPrice || 0));
              setMaxPrice(String(v));
            }}
            onBlur={() => liveUpdate && applyWith({ maxPrice })}
            placeholder="Max"
            className="w-1/2 rounded border px-2 py-1 text-sm"
          />
        </div>

        {/* Dual Slider (premium centered, correct drag, no API until release) */}
        <DualSlider
          min={0}
          max={10000}
          valueMin={Number(minPrice) || 0}
          valueMax={Number(maxPrice) || 10000}
          onChangeMin={(v) => setMinPrice(String(v))}
          onChangeMax={(v) => setMaxPrice(String(v))}
          onRelease={() => {
            if (liveUpdate) {
              applyWith({
                minPrice,
                maxPrice,
              });
            }
          }}
        />
      </div>

      <hr className="border-neutral-200" />

      <div className="flex items-center gap-2">
        <input
          id="feat"
          type="checkbox"
          checked={featured}
          onChange={(e) => { setFeatured(e.target.checked); if (liveUpdate) applyWith({ featured: e.target.checked }); }}
          className="h-4 w-4 cursor-pointer"
        />
        <label htmlFor="feat" className="text-sm cursor-pointer select-none">Featured</label>
      </div>

      {/* showActions removed for liveUpdate workflows; parent controls Apply when needed */}
    </aside>
  );
}
