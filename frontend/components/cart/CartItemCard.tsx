'use client';
// components/cart/CartItemCard.tsx
// ──────────────────────────────────────────────────────────────────
// Shared cart item card used by both the CartDrawer and Cart Page.
//
// Handles three visual states with semantic luxury styling:
//  A) Out of Stock        — Rose wash + "Sold Out" pill + quick remove
//  B) Insufficient Stock  — Amber wash + "Only X left" pill + disabled [+]
//  C) Price Change        — Neutral wash + strikethrough + "Updated to current live rate" pill
// ──────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCartValidation } from '@/lib/queries/useCartValidation';
import { triggerHaptic } from '@/lib/utils/haptics';
import { CART_ISSUE_MESSAGES } from '@/constants/cartMessages';
import type { CartItem, ValidatedItem } from '@/lib/types/cart.types';

// ─── Helpers ─────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);

// ─── Props ───────────────────────────────────────────────────────

interface CartItemCardProps {
  item: CartItem;
  /** Server-validated data for this item (may be undefined if not yet validated). */
  validatedItem?: ValidatedItem;
  /** Layout variant: compact for drawer, expanded for page table. */
  variant?: 'drawer' | 'page';
}

// ─── Component ───────────────────────────────────────────────────

export default function CartItemCard({
  item,
  validatedItem,
  variant = 'drawer',
}: CartItemCardProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { validateCartDebounced } = useCartValidation();

  // ── Derived state from validation ──────────────────────────────
  const isPriceChanged = validatedItem?.isPriceChanged ?? false;
  const availableStock = validatedItem?.availableStock ?? Infinity;
  const serverPrice = validatedItem?.serverPrice ?? item.price;
  const effectivePrice = isPriceChanged ? serverPrice : item.price;

  // Issue calculations (evaluated dynamically against both validation and local item quantity)
  const isOutOfStock = validatedItem
    ? (!validatedItem.isAvailable || validatedItem.availableStock === 0)
    : (item.stockQuantity !== undefined && item.stockQuantity === 0);

  const isInsufficientStock =
    !isOutOfStock &&
    ((validatedItem?.hasInsufficientStock ?? false) ||
      (availableStock !== Infinity && availableStock > 0 && item.quantity > availableStock));

  // Card style selection based on issue hierarchy
  let cardStyleClass = 'border-neutral-100 bg-white';
  if (isOutOfStock) {
    cardStyleClass = 'border-rose-200 bg-rose-50/30';
  } else if (isInsufficientStock) {
    cardStyleClass = 'border-amber-200/80 bg-amber-50/30';
  } else if (isPriceChanged) {
    cardStyleClass = 'border-amber-200/50 bg-amber-50/15';
  }

  // ── Local state for editable numeric input ──────────────────────
  const [inputValue, setInputValue] = useState(String(item.quantity));

  useEffect(() => {
    setInputValue(String(item.quantity));
  }, [item.quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputCommit = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputValue('1');
      updateQuantity(item.productId, 1);
      validateCartDebounced();
    } else {
      setInputValue(String(parsed));
      updateQuantity(item.productId, parsed);
      validateCartDebounced();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // ── Handlers ───────────────────────────────────────────────────

  const handleIncrement = () => {
    if (isOutOfStock || isInsufficientStock || item.quantity >= availableStock) return;
    triggerHaptic();
    updateQuantity(item.productId, item.quantity + 1);
    validateCartDebounced();
  };

  const handleDecrement = () => {
    triggerHaptic();
    if (item.quantity <= 1) {
      removeItem(item.productId);
    } else {
      updateQuantity(item.productId, item.quantity - 1);
    }
    validateCartDebounced();
  };

  const handleRemove = () => {
    removeItem(item.productId);
    validateCartDebounced();
  };

  const isPlusDisabled = isOutOfStock || isInsufficientStock || item.quantity >= availableStock;

  // ─── DRAWER VARIANT (compact luxury) ───────────────────────────
  if (variant === 'drawer') {
    return (
      <motion.div
        layout
        className={`flex gap-3 rounded-lg border p-2 sm:p-2.5 transition-colors ${cardStyleClass}`}
      >
        {/* Thumbnail — 14x14 mobile / 16x16 desktop */}
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded bg-neutral-50 border border-neutral-100">
          <Image
            src={item.thumbnailUrl}
            alt={item.name}
            fill
            sizes="64px"
            className="object-contain"
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h4 className="text-xs font-medium text-neutral-900 line-clamp-1">
                {item.name}
              </h4>
              <button
                onClick={handleRemove}
                className="text-neutral-400 hover:text-red-500 transition-colors p-0.5"
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {item.metalType && (
              <p className="text-[11px] text-neutral-400 leading-tight">
                {item.metalType}
              </p>
            )}

            {/* Price display */}
            <div className="mt-0.5 flex items-baseline">
              {isPriceChanged ? (
                <div>
                  <span className="text-xs text-neutral-400 line-through mr-2">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {formatCurrency(serverPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-neutral-800">
                  {formatCurrency(item.price)}
                </span>
              )}
            </div>

            {/* Micro-pill for Price Change */}
            {isPriceChanged && (
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 px-2.5 py-0.5 text-[10px] font-medium text-amber-900">
                <span className="text-amber-600 font-semibold text-[10px]">↑</span>
                <span>{CART_ISSUE_MESSAGES.PRICE_CHANGED(formatCurrency(serverPrice))}</span>
              </div>
            )}

            {/* Issue Pill A: Out of Stock */}
            {isOutOfStock && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 text-[11px] font-medium text-rose-800">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500/80 shrink-0" />
                <span>{CART_ISSUE_MESSAGES.OUT_OF_STOCK}</span>
              </div>
            )}

            {/* Issue Pill B: Insufficient Stock */}
            {isInsufficientStock && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-[11px] font-medium text-amber-900">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80 shrink-0" />
                <span>{CART_ISSUE_MESSAGES.INSUFFICIENT_STOCK(availableStock)}</span>
              </div>
            )}
          </div>

          {/* Compact Stepper */}
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center border border-neutral-200 rounded h-7 sm:h-8">
              <button
                onClick={handleDecrement}
                className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label={
                  item.quantity <= 1
                    ? `Remove ${item.name}`
                    : `Decrease quantity of ${item.name}`
                }
              >
                <Minus className="h-3 w-3" />
              </button>

              <input
                type="number"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputCommit}
                onKeyDown={handleKeyDown}
                className="h-7 w-7 sm:h-8 sm:w-8 text-center text-xs font-semibold text-neutral-900 border-x border-neutral-200 bg-transparent focus:outline-none focus:ring-1 focus:ring-neutral-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label={`Quantity for ${item.name}`}
              />

              <button
                onClick={handleIncrement}
                disabled={isPlusDisabled}
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center transition-colors ${isPlusDisabled
                  ? 'text-neutral-300 cursor-not-allowed'
                  : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                aria-label={`Increase quantity of ${item.name}`}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <span className="text-xs font-semibold text-neutral-900">
              {formatCurrency(effectivePrice * item.quantity)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── PAGE VARIANT (responsive: stacked on mobile, row on desktop) ───
  return (
    <motion.div
      layout
      className={`border border-neutral-200 bg-white rounded-lg p-3.5 sm:p-4 mb-3 transition-colors ${cardStyleClass}`}
    >
      {/* MOBILE LAYOUT (< md) */}
      <div className="block md:hidden space-y-3">
        <div className="flex gap-3">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-neutral-50 border border-neutral-100">
            <Image
              src={item.thumbnailUrl}
              alt={item.name}
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-medium text-neutral-900 line-clamp-2 leading-snug">
              {item.name}
            </h4>
            {item.metalType && (
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {item.metalType}
              </p>
            )}
            <div className="mt-1 flex items-baseline">
              {isPriceChanged ? (
                <div>
                  <span className="text-xs text-neutral-400 line-through mr-2">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    {formatCurrency(serverPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-neutral-800">
                  {formatCurrency(item.price)}
                </span>
              )}
            </div>

            {isPriceChanged && (
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 px-2.5 py-0.5 text-[10px] font-medium text-amber-900">
                <span className="text-amber-600 font-semibold text-[10px]">↑</span>
                <span>{CART_ISSUE_MESSAGES.PRICE_CHANGED(formatCurrency(serverPrice))}</span>
              </div>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-xs font-bold text-neutral-900">
              {formatCurrency(effectivePrice * item.quantity)}
            </span>
          </div>
        </div>

        {/* Issue Pill A: Out of Stock */}
        {isOutOfStock && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 text-[11px] font-medium text-rose-800">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500/80 shrink-0" />
            <span>{CART_ISSUE_MESSAGES.OUT_OF_STOCK}</span>
          </div>
        )}

        {/* Issue Pill B: Insufficient Stock */}
        {isInsufficientStock && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-[11px] font-medium text-amber-900">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80 shrink-0" />
            <span>{CART_ISSUE_MESSAGES.INSUFFICIENT_STOCK(availableStock)}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-neutral-50">
          {/* Stepper */}
          <div className="flex items-center border border-neutral-200 rounded h-7">
            <button
              onClick={handleDecrement}
              className="flex h-7 w-7 items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus className="h-3 w-3" />
            </button>

            <input
              type="number"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputCommit}
              onKeyDown={handleKeyDown}
              className="h-7 w-7 text-center text-xs font-semibold text-neutral-900 border-x border-neutral-200 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label={`Quantity for ${item.name}`}
            />

            <button
              onClick={handleIncrement}
              disabled={isPlusDisabled}
              className={`flex h-7 w-7 items-center justify-center transition-colors ${isPlusDisabled
                ? 'text-neutral-300 cursor-not-allowed'
                : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Text links */}
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <button className="hover:text-neutral-900 transition-colors">
              Wishlist
            </button>
            <span>·</span>
            <button
              onClick={handleRemove}
              className="hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP LAYOUT (>= md) */}
      <div className="hidden md:grid grid-cols-[1fr_140px_120px_100px] items-center gap-4">
        {/* Item details */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-neutral-50 border border-neutral-100">
            <Image
              src={item.thumbnailUrl}
              alt={item.name}
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <h4 className="text-sm font-medium text-neutral-900 line-clamp-1">
              {item.name}
            </h4>
            {item.metalType && (
              <p className="text-xs text-neutral-500 mt-0.5">
                {item.metalType}
              </p>
            )}

            {/* Issue Pill A: Out of Stock */}
            {isOutOfStock && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 text-[11px] font-medium text-rose-800 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500/80 shrink-0" />
                <span>{CART_ISSUE_MESSAGES.OUT_OF_STOCK}</span>
              </div>
            )}

            {/* Issue Pill B: Insufficient Stock */}
            {isInsufficientStock && (
              <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-[11px] font-medium text-amber-900 w-fit">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/80 shrink-0" />
                <span>{CART_ISSUE_MESSAGES.INSUFFICIENT_STOCK(availableStock)}</span>
              </div>
            )}

            {/* Issue Pill C: Price Change */}
            {isPriceChanged && (
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50/80 border border-amber-200/60 px-2.5 py-0.5 text-[10px] font-medium text-amber-900 w-fit">
                <span className="text-amber-600 font-semibold text-[10px]">↑</span>
                <span>{CART_ISSUE_MESSAGES.PRICE_CHANGED(formatCurrency(serverPrice))}</span>
              </div>
            )}

            <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500">
              <button className="hover:text-neutral-800 transition-colors">
                Move to Wishlist
              </button>
              <span>·</span>
              <button
                onClick={handleRemove}
                className="hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* Unit Price */}
        <div className="text-center">
          {isPriceChanged ? (
            <div className="flex flex-col items-center">
              <span className="text-xs text-neutral-400 line-through mr-2">
                {formatCurrency(item.price)}
              </span>
              <span className="text-sm font-semibold text-neutral-900">
                {formatCurrency(serverPrice)}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-neutral-800">
              {formatCurrency(item.price)}
            </span>
          )}
        </div>

        {/* Quantity Stepper */}
        <div className="flex justify-center">
          <div className="flex items-center border border-neutral-200 rounded h-9 bg-white">
            <button
              onClick={handleDecrement}
              className="flex h-9 w-8 items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label={`Decrease quantity of ${item.name}`}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <input
              type="number"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputCommit}
              onKeyDown={handleKeyDown}
              className="h-9 w-9 text-center text-sm font-semibold text-neutral-900 border-x border-neutral-200 bg-transparent focus:outline-none focus:ring-1 focus:ring-neutral-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              aria-label={`Quantity for ${item.name}`}
            />

            <button
              onClick={handleIncrement}
              disabled={isPlusDisabled}
              className={`flex h-9 w-8 items-center justify-center transition-colors ${isPlusDisabled
                ? 'text-neutral-300 cursor-not-allowed'
                : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              aria-label={`Increase quantity of ${item.name}`}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Total Price */}
        <div className="text-right">
          <span className="text-sm font-semibold text-neutral-900">
            {formatCurrency(effectivePrice * item.quantity)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
