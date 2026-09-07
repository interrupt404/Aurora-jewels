'use client';
// components/cart/CartDrawer.tsx
// ──────────────────────────────────────────────────────────────────
// Slide-over cart drawer with Framer Motion animation.
//
// Responsive design:
//  • Mobile (<640px): Full viewport width (w-full)
//  • Desktop (≥640px): Fixed max-width (sm:max-w-md ≈ 28rem)
//
// Refined loading system:
//  • Hairline gold shimmer bar below header when validating
//  • Initial mount skeleton rectangles before hydration
//  • Active spinner on checkout CTA when validating
// ──────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X, Lock, ShieldCheck, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '@/lib/store/useCartStore';
import { useCartValidation } from '@/lib/queries/useCartValidation';
import CartItemCard from './CartItemCard';

// ─── Helpers ─────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);

// ─── Component ───────────────────────────────────────────────────

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const validation = useCartStore((s) => s.validation);
  const isValidating = useCartStore((s) => s.isValidating);
  const getTotalCount = useCartStore((s) => s.getTotalCount);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getShippingProgress = useCartStore((s) => s.getShippingProgress);

  const { validateCart } = useCartValidation();
  const problemItemRef = useRef<HTMLDivElement>(null);

  // ── Validate on open (scenario 1) ─────────────────────────────
  useEffect(() => {
    if (isOpen && items.length > 0) {
      validateCart();
    }
  }, [isOpen, validateCart, items.length]);

  // ── Lock body scroll when drawer is open ───────────────────────
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── ESC key to close ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeDrawer();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeDrawer]);

  // ── Computed values ────────────────────────────────────────────
  const totalCount = hasHydrated ? getTotalCount() : 0;
  const subtotal = hasHydrated ? getSubtotal() : 0;
  const shipping = hasHydrated ? getShippingProgress() : { isFree: false, remaining: 500, percentage: 0 };

  // Effective validation object (uses real validation from API store)
  const effectiveValidation = validation;

  const hasStockIssues = effectiveValidation?.summary?.hasStockIssues ?? false;
  const hasPriceChanges = effectiveValidation?.summary?.hasPriceChanges ?? false;

  const priceAcknowledgedRef = useRef(false);

  useEffect(() => {
    priceAcknowledgedRef.current = false;
  }, [validation]);

  const handleCheckout = useCallback(async () => {
    const ok = await validateCart();
    if (!ok) return;

    const currentValidation = useCartStore.getState().validation;
    const currentHasStockIssues = currentValidation?.summary?.hasStockIssues ?? false;
    const currentHasPriceChanges = currentValidation?.summary?.hasPriceChanges ?? false;

    if (currentHasStockIssues) {
      if (problemItemRef.current) {
        problemItemRef.current.scrollIntoView({ behavior: 'smooth' });
        problemItemRef.current.classList.add('animate-shake');
        setTimeout(() => {
          problemItemRef.current?.classList.remove('animate-shake');
        }, 500);
      }
      return;
    }

    if (currentHasPriceChanges && !priceAcknowledgedRef.current) {
      priceAcknowledgedRef.current = true;
      return;
    }

    closeDrawer();
  }, [validateCart, closeDrawer]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop overlay ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* ── Drawer panel ──────────────────────────────────── */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-md"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            {/* ── Header ──────────────────────────────────────── */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h2
                className="text-sm font-semibold tracking-widest text-neutral-800 uppercase"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
              >
                Your Shopping Bag ({totalCount})
              </h2>
              <button
                onClick={closeDrawer}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                aria-label="Close shopping bag"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Active Revalidation Hairline Bar ────────────── */}
            {isValidating && (
              <div className="h-[1.5px] w-full bg-neutral-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-transparent via-amber-600 to-transparent w-full animate-pulse" />
              </div>
            )}

            {/* ── Shipping progress bar ───────────────────────── */}
            {hasHydrated && items.length > 0 && (
              <div className="border-b border-neutral-100 px-5 py-3">
                {shipping.isFree ? (
                  <p className="text-xs text-neutral-600 text-center">
                    ✨ You&apos;ve unlocked{' '}
                    <span className="font-semibold">
                      Complimentary Insured Delivery!
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-neutral-600 text-center">
                    🚚{' '}
                    <span className="font-semibold">
                      {formatCurrency(shipping.remaining)}
                    </span>{' '}
                    away from Complimentary Insured Delivery
                  </p>
                )}

                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        'linear-gradient(90deg, #d4a574, #c9956c, #b8860b)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${shipping.percentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>

                <p className="mt-1 text-right text-[10px] text-neutral-400">
                  {Math.round(shipping.percentage)}%
                </p>
              </div>
            )}

            {/* ── Scrollable item list / Initial Skeleton ────── */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {!hasHydrated ? (
                /* Initial Mount Skeleton (Only when hasHydrated === false) */
                <div className="flex flex-col gap-3">
                  <div className="h-20 bg-neutral-100 rounded animate-pulse" />
                  <div className="h-20 bg-neutral-100 rounded animate-pulse" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-50 mb-6">
                    <ShoppingBag className="h-10 w-10 text-neutral-300 stroke-[1.5]" />
                  </div>
                  <h3
                    className="text-base font-semibold tracking-widest text-neutral-900 uppercase"
                    style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                  >
                    YOUR BAG IS EMPTY
                  </h3>
                  <p className="mt-2 text-xs text-neutral-500 max-w-xs leading-relaxed">
                    Discover our timeless collections of rings, necklaces, and fine jewelry.
                  </p>
                  <Link
                    href="/products"
                    onClick={closeDrawer}
                    className="mt-6 inline-flex items-center justify-center bg-neutral-900 px-8 py-3 text-xs font-semibold tracking-widest text-white uppercase hover:bg-neutral-800 active:scale-[0.98] transition-all"
                  >
                    EXPLORE JEWELRY
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item, idx) => {
                    const validatedItem = effectiveValidation?.items?.find(
                      (v) => v.productId === item.productId
                    );

                    const isFirstProblemItem =
                      validatedItem?.hasInsufficientStock &&
                      idx ===
                        items.findIndex((i) => {
                          const v = effectiveValidation?.items?.find(
                            (vi) => vi.productId === i.productId
                          );
                          return v?.hasInsufficientStock;
                        });

                    return (
                      <div
                        key={item.productId}
                        ref={isFirstProblemItem ? problemItemRef : undefined}
                      >
                        <CartItemCard
                          item={item}
                          validatedItem={validatedItem}
                          variant="drawer"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Sticky footer ──────────────────────────────── */}
            {hasHydrated && items.length > 0 && (
              <div
                className="border-t border-neutral-200 bg-white px-4 py-3 sm:px-5 sm:py-4"
                style={{
                  paddingBottom:
                    'max(1rem, env(safe-area-inset-bottom, 1rem))',
                }}
              >
                {/* Row 1: Subtotal & price */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-600">
                    Subtotal
                  </span>
                  <span
                    className="text-sm sm:text-base font-semibold text-neutral-900"
                    style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                  >
                    {formatCurrency(
                      effectiveValidation?.summary?.subtotal ?? subtotal
                    )}
                  </span>
                </div>

                {/* Primary CTA button */}
                <button
                  onClick={handleCheckout}
                  disabled={hasStockIssues || isValidating}
                  className={`w-full py-2.5 sm:py-3 text-xs font-semibold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 ${
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

                {/* Secondary GO TO CART button */}
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="mt-2 flex w-full items-center justify-center border border-neutral-300 py-2.5 rounded text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:bg-neutral-50 transition-colors"
                >
                  GO TO CART
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
