'use client';
// lib/queries/useCartValidation.ts
// ──────────────────────────────────────────────────────────────────
// Custom hook that fires POST /api/v1/cart/validate.
//
// Validation is triggered in exactly 4 scenarios:
//  1. Cart Drawer opens
//  2. /cart page mounts
//  3. Quantity update or item removal (debounced 300ms)
//  4. "Proceed to Checkout" click (final gate)
//
// This hook returns an imperative `validateCart()` function that
// the consuming components call in those scenarios. It does NOT
// auto-fire on every render — that would be wasteful and could
// cause rate-limiting issues.
// ──────────────────────────────────────────────────────────────────

import { useCallback, useRef } from 'react';
import { useCartStore } from '@/lib/store/useCartStore';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import type {
  CartValidationRequest,
  CartValidationResponse,
} from '@/lib/types/cart.types';

/** Debounce timer reference used for scenario 3 (qty / remove). */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Fires the validation API and updates the Zustand store.
 *
 * @returns The parsed validation data on success, or `null` on error.
 *
 * State transitions:
 *  1. Set `isValidating = true`  → UI shows spinner / disables CTA
 *  2. POST to backend            → network round-trip
 *  3. On success: store validated data (items, summary, coupon)
 *  4. On error:  log + return null (UI falls back to optimistic data)
 *  5. Set `isValidating = false` → UI re-enables CTA
 */
async function runValidation(): Promise<boolean> {
  const { items, couponCode, setValidation, setIsValidating } =
    useCartStore.getState();

  // Nothing to validate if cart is empty
  if (items.length === 0) return true;

  setIsValidating(true);

  try {
    const payload: CartValidationRequest = {
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        clientPrice: i.price,
      })),
      // Only include coupon if the user has entered one
      ...(couponCode ? { couponCode } : {}),
    };

    const res = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.CART_VALIDATE}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      console.warn('[cart-validation] API returned', res.status);
      return false;
    }

    const json: CartValidationResponse = await res.json();

    // The response wraps data in an array — we use the first entry
    const data = json?.response?.data?.[0];
    if (data) {
      setValidation(data);
    }

    return true;
  } catch (err) {
    console.warn('[cart-validation] Network error', err);
    return false;
  } finally {
    setIsValidating(false);
  }
}

/**
 * React hook providing cart validation controls.
 *
 * Usage:
 * ```tsx
 * const { validateCart, validateCartDebounced, isValidating } = useCartValidation();
 * ```
 */
export function useCartValidation() {
  const isValidating = useCartStore((s) => s.isValidating);
  const abortRef = useRef(false);

  /**
   * Immediate validation — use for scenarios 1, 2, and 4:
   *  • Drawer open
   *  • Page mount
   *  • Checkout click
   */
  const validateCart = useCallback(async () => {
    abortRef.current = false;
    return runValidation();
  }, []);

  /**
   * Debounced validation — use for scenario 3:
   *  • Quantity change or item removal
   *
   * 300ms debounce prevents firing on every rapid +/- tap.
   * If another call arrives within 300ms, the previous is cancelled.
   */
  const validateCartDebounced = useCallback(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runValidation();
    }, 500);
  }, []);

  return { validateCart, validateCartDebounced, isValidating };
}
