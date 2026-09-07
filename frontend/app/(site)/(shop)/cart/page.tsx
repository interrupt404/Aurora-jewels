'use client';
// app/(site)/(shop)/cart/page.tsx
// ──────────────────────────────────────────────────────────────────
// Dedicated Shopping Bag Page — luxury editorial 2-column layout.
//
// Left column (65%):  Item table with steppers, wishlist, remove
// Right column (35%): Sticky Order Summary with promo code, breakdown
//
// Triggers cart validation on mount (scenario 2) and uses the
// validation hook for checkout gating (scenario 4).
//
// Responsive design:
//  • Desktop: 2-column side-by-side layout
//  • Mobile:  Single column with summary below items
// ──────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Shield, Truck, Award } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCartValidation } from '@/lib/queries/useCartValidation';
import CartItemCard from '@/components/cart/CartItemCard';

// ─── Helpers ─────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);

// ─── Page Component ──────────────────────────────────────────────

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const validation = useCartStore((s) => s.validation);
  const isValidating = useCartStore((s) => s.isValidating);
  const couponCode = useCartStore((s) => s.couponCode);
  const setCouponCode = useCartStore((s) => s.setCouponCode);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getShippingProgress = useCartStore((s) => s.getShippingProgress);

  const { validateCart } = useCartValidation();

  // ── Local state ────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState(couponCode);
  const [giftWrapping, setGiftWrapping] = useState(false);
  const priceAcknowledgedRef = useRef(false);

  // ── Validate on mount (scenario 2) ────────────────────────────
  useEffect(() => {
    if (hasHydrated && items.length > 0) {
      validateCart();
    }
  }, [hasHydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset price acknowledgement when validation changes
  useEffect(() => {
    priceAcknowledgedRef.current = false;
  }, [validation]);

  // Sync coupon input with store
  useEffect(() => {
    setCouponInput(couponCode);
  }, [couponCode]);

  // ── Computed values ────────────────────────────────────────────
  const optimisticSubtotal = hasHydrated ? getSubtotal() : 0;
  const shipping = hasHydrated
    ? getShippingProgress()
    : { isFree: false, remaining: 500, percentage: 0 };

  // Effective validation object (uses real validation from API store)
  const effectiveValidation = validation;

  // Use validated summary if available, otherwise fall back to optimistic
  const summary = effectiveValidation?.summary;
  const couponResult = (effectiveValidation?.coupon ?? validation?.coupon) as { isValid?: boolean; code?: string; discountAmount?: number; message?: string } | null;

  const hasStockIssues = summary?.hasStockIssues ?? false;
  const hasPriceChanges = summary?.hasPriceChanges ?? false;

  // ── Handlers ───────────────────────────────────────────────────

  const handleApplyCoupon = useCallback(() => {
    setCouponCode(couponInput.trim());
    // Re-validate with the new coupon code
    setTimeout(() => validateCart(), 100);
  }, [couponInput, setCouponCode, validateCart]);

  const handleCheckout = useCallback(async () => {
    const ok = await validateCart();
    if (!ok) return;

    const currentValidation = useCartStore.getState().validation;
    if (currentValidation?.summary?.hasStockIssues) return;

    if (currentValidation?.summary?.hasPriceChanges && !priceAcknowledgedRef.current) {
      priceAcknowledgedRef.current = true;
      return;
    }

    // TODO: Navigate to checkout
  }, [validateCart]);

  // ── Hydration guard (2 subtle skeleton rectangles) ─────────────
  if (!hasHydrated) {
    return (
      <main className="mx-auto max-w-7xl px-3.5 sm:px-6 py-12">
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="h-20 w-full bg-neutral-100 rounded animate-pulse" />
          <div className="h-20 w-full bg-neutral-100 rounded animate-pulse" />
        </div>
      </main>
    );
  }

  // ── Empty cart state ───────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-3.5 sm:px-6 py-24 text-center">
        <h1
          className="text-xl sm:text-2xl font-normal text-neutral-800 tracking-wide uppercase mb-4"
          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
        >
          Your Shopping Bag
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mb-8">
          Your bag is empty. Discover our exquisite collection.
        </p>
        <Link
          href="/products"
          className="inline-block bg-neutral-900 px-8 py-3.5 text-xs font-semibold tracking-wider text-white uppercase hover:bg-neutral-800 transition-colors"
        >
          EXPLORE COLLECTION
        </Link>
      </main>
    );
  }

  // ─── MAIN LAYOUT ──────────────────────────────────────────────

  return (
    <main className="mx-auto max-w-7xl px-3.5 sm:px-6 py-6 sm:py-12 w-full max-w-full overflow-x-hidden relative">
      {/* Discreet hairline gold shimmer during background revalidation */}
      {isValidating && (
        <div className="fixed top-0 left-0 right-0 z-50 h-[1.5px] w-full bg-neutral-100 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-amber-600 to-transparent w-full animate-pulse" />
        </div>
      )}

      {/* Page heading */}
      <h1
        className="text-center text-xl sm:text-2xl font-normal text-neutral-800 tracking-wide uppercase mb-6 sm:mb-10"
        style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
      >
        Your Shopping Bag
      </h1>

      {/* 2-column layout: Items (left) | Order Summary (right) */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* ── LEFT COLUMN: Item Table (65%) ────────────────────── */}
        <div className="flex-1 lg:w-[65%]">
          {/* Table header — desktop only */}
          <div className="hidden md:grid grid-cols-[1fr_140px_120px_100px] gap-4 border-b border-neutral-200 pb-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">
            <span>Item</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
          </div>

          {/* Item list */}
          <div className="divide-y divide-neutral-100">
            {items.map((item) => {
              const validatedItem = effectiveValidation?.items?.find(
                (v) => v.productId === item.productId
              );
              return (
                <CartItemCard
                  key={item.productId}
                  item={item}
                  validatedItem={validatedItem}
                  variant="page"
                />
              );
            })}
          </div>

          {/* Gift wrapping checkbox */}
          <label className="mt-6 sm:mt-8 flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={giftWrapping}
                onChange={(e) => setGiftWrapping(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                  giftWrapping
                    ? 'bg-neutral-900 border-neutral-900'
                    : 'border-neutral-300 group-hover:border-neutral-400'
                }`}
              >
                {giftWrapping && <Check className="h-3.5 w-3.5 text-white" />}
              </div>
            </div>
            <span className="text-xs sm:text-sm text-neutral-700">
              Add Complimentary Signature Velvet Gift Packaging & Handwritten Gift Card
            </span>
          </label>

          {/* Continue Shopping link */}
          <Link
            href="/products"
            className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-600 hover:text-neutral-900 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Continue Shopping
          </Link>
        </div>

        {/* ── RIGHT COLUMN: Order Summary (35% — sticky) ──────── */}
        <div className="lg:w-[35%]">
          <div className="sticky top-28 rounded-sm border border-[#e5e5e5] bg-white p-4 sm:p-5">
            <h2
              className="text-xs sm:text-sm font-semibold tracking-widest text-neutral-800 uppercase mb-4 sm:mb-6"
              style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
            >
              Order Summary
            </h2>

            {/* Promo code input */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Promo code"
                className="flex-1 min-w-0 border border-neutral-300 px-3 py-2 text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-500 transition-colors"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!couponInput.trim() || isValidating}
                className="shrink-0 border border-neutral-900 bg-white px-4 py-2 text-xs font-semibold tracking-wider text-neutral-900 uppercase hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                APPLY
              </button>
            </div>

            {/* Coupon result message */}
            {couponResult && couponResult.isValid && (
              <p className="text-xs text-green-700 mb-4">
                Promotion ({couponResult.code}):{' '}
                <span className="font-semibold">
                  -{formatCurrency(couponResult.discountAmount ?? 0)}
                </span>
              </p>
            )}
            {couponResult && !couponResult.isValid && (
              <p className="text-xs text-red-600 mb-4">
                {couponResult.message}
              </p>
            )}

            {/* Breakdown */}
            <div className="space-y-3 border-t border-neutral-100 pt-4">
              <div className="flex justify-between text-xs sm:text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{formatCurrency(summary?.subtotal ?? optimisticSubtotal)}</span>
              </div>

              {summary && summary.discount > 0 && (
                <div className="flex justify-between text-xs sm:text-sm text-neutral-600">
                  <span>Promotion</span>
                  <span className="text-green-700">
                    -{formatCurrency(summary.discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-xs sm:text-sm text-neutral-600">
                <span>Insured Shipping</span>
                <span>
                  {shipping.isFree
                    ? 'Complimentary (FREE)'
                    : summary?.shippingFee != null
                    ? formatCurrency(summary.shippingFee)
                    : '—'}
                </span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm text-neutral-600">
                <span>Estimated Tax</span>
                <span>
                  {summary?.tax != null
                    ? formatCurrency(summary.tax)
                    : '—'}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between border-t border-neutral-200 pt-4">
                <span
                  className="text-xs sm:text-sm font-semibold tracking-wider text-neutral-800 uppercase"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  Estimated Total
                </span>
                <span
                  className="text-base sm:text-lg font-semibold text-neutral-900"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  {summary
                    ? formatCurrency(summary.total)
                    : formatCurrency(optimisticSubtotal)}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleCheckout}
              disabled={hasStockIssues || isValidating}
              className={`mt-6 w-full py-3 sm:py-3.5 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
                hasStockIssues
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98]'
              }`}
            >
              {isValidating ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>VERIFYING…</span>
                </>
              ) : hasStockIssues ? (
                'ADJUST QUANTITY TO CONTINUE'
              ) : hasPriceChanges && !priceAcknowledgedRef.current ? (
                'REVIEW & PROCEED TO CHECKOUT'
              ) : (
                'PROCEED TO CHECKOUT'
              )}
            </button>

            {/* Trust icons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] sm:text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5" />
                Certificate of Authenticity
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />
                Insured Delivery
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                30-Day Returns
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
