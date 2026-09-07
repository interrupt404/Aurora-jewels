'use client';
// components/product/ProductCard.tsx
// ──────────────────────────────────────────────────────────────────
// Product card with cart-aware morphing button.
//
// State transitions:
//  • Not in cart → "ADD TO BAG" solid black button
//  • In cart     → inline stepper: [ 🗑️/− ] {qty} [ + ]
//
// The morph animation uses Framer Motion's `AnimatePresence` and
// `layout` for a smooth transition between the two states.
//
// The image/title area remains a navigation <Link>, while the
// button area uses stopPropagation() to prevent accidental nav.
// ──────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductCardDTO } from '@/lib/queries/useProducts';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCartToast } from '@/components/cart/CartToast';
import { triggerHaptic } from '@/lib/utils/haptics';
import placeholderImage from '@/app/placeholder.png';

type Props = {
  product: ProductCardDTO & { stockQuantity?: number; isFeatured?: boolean };
  className?: string;
};

export default function ProductCard({ product, className = '' }: Props) {
  const { id, name, slug, price, thumbnailUrl, category, metal_type } = product;

  // ── Cart state ─────────────────────────────────────────────────
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const { showToast } = useCartToast();

  // Find this product in the cart (if present)
  const cartItem = items.find((i) => i.productId === id);
  const isInCart = hasHydrated && !!cartItem;
  const quantity = cartItem?.quantity ?? 0;

  // Local state for editable numeric input
  const [inputValue, setInputValue] = useState(String(quantity));

  useEffect(() => {
    setInputValue(String(quantity));
  }, [quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputCommit = () => {
    const parsed = parseInt(inputValue, 10);
    const maxStock = product.stockQuantity ?? 99;
    if (isNaN(parsed) || parsed < 1) {
      setInputValue('1');
      updateQuantity(id, 1);
    } else if (parsed > maxStock) {
      setInputValue(String(maxStock));
      updateQuantity(id, maxStock);
    } else {
      setInputValue(String(parsed));
      updateQuantity(id, parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // ── Handlers ───────────────────────────────────────────────────

  const handleAddToBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: id,
      name,
      slug: slug ?? name.toLowerCase().replace(/\s+/g, '-'),
      price,
      thumbnailUrl: thumbnailUrl ?? '',
      metalType: metal_type,
      stockQuantity: product.stockQuantity,
      category,
    });

    // Show floating toast notification
    showToast(name);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic();
    updateQuantity(id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    triggerHaptic();

    if (quantity <= 1) {
      removeItem(id);
    } else {
      updateQuantity(id, quantity - 1);
    }
  };

  return (
    <div className={`group flex flex-col justify-between h-full bg-white rounded-[6px] border border-neutral-100 p-2.5 sm:p-3 hover:shadow-lg transition-all duration-200 ${className}`}>
      <Link
        href="/products"
        className="flex-1 flex flex-col justify-between"
        aria-label={name}
      >
        {/* image */}
        <div className="relative aspect-square w-full bg-neutral-50 rounded flex items-center justify-center overflow-hidden">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={name}
              fill
              sizes="(max-width:640px) 50vw, 280px"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Image
              src={placeholderImage}
              alt={name}
              fill
              sizes="(max-width:640px) 50vw, 280px"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* featured badge */}
          {product.isFeatured ? (
            <span className="absolute left-3 top-3 inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
              Featured
            </span>
          ) : null}
        </div>

        {/* content */}
        <div className="pt-3 pb-1 text-center flex-1 flex flex-col justify-between">
          <div className="h-10 flex items-center justify-center">
            <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 leading-snug">
              {name}
            </h3>
          </div>
          <p className="mt-1 text-sm font-semibold text-neutral-800">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)}
          </p>
        </div>
      </Link>

      {/* ── Morphing Cart Button ────────────────────────────────── */}
      {/* Renders below the card. Uses AnimatePresence for smooth
          transitions between "ADD TO BAG" and the inline stepper. */}
      <div className="w-full mt-2.5">
        <AnimatePresence mode="wait" initial={false}>
          {isInCart ? (
            // ── IN CART: Inline Stepper ──────────────────────────
            <motion.div
              key="stepper"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center border border-neutral-200 rounded overflow-hidden"
            >
              {/* Minus button — always clean Minus icon */}
              <button
                onClick={handleDecrement}
                className="flex h-10 w-12 items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label={
                  quantity <= 1
                    ? `Remove ${name} from bag`
                    : `Decrease quantity of ${name}`
                }
              >
                <Minus className="h-4 w-4" />
              </button>

              {/* Editable Numeric Input */}
              <input
                type="number"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputCommit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="h-10 w-10 text-center text-sm font-semibold text-neutral-900 border-x border-neutral-200 bg-transparent focus:outline-none focus:ring-1 focus:ring-neutral-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label={`Quantity for ${name}`}
              />

              {/* Plus */}
              <button
                onClick={handleIncrement}
                className="flex h-10 w-12 items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label={`Increase quantity of ${name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            // ── NOT IN CART: "ADD TO BAG" Button ─────────────────
            <motion.button
              key="add"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={handleAddToBag}
              className="w-full bg-neutral-900 py-2.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-neutral-800 active:scale-[0.97] transition-all"
            >
              ADD TO BAG
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
