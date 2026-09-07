'use client';
// lib/store/useCartStore.ts
// ──────────────────────────────────────────────────────────────────
// Zustand cart store with localStorage persistence.
//
// Key design decisions:
//  • `persist` middleware serialises cart to localStorage so items
//    survive page refreshes and browser restarts.
//  • `hasHydrated` flag prevents SSR/client hydration mismatch —
//    all UI that reads cart data must gate on this being `true`.
//  • Validation data is stored separately from items — items are
//    the optimistic client state; validation is the authoritative
//    server response that reconciles prices / stock.
//  • `lastValidatedPriceMap` tracks which prices the user has
//    already acknowledged so we can implement the "double-click to
//    confirm" checkout flow for price-changed items.
// ──────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartValidationData } from '@/lib/types/cart.types';
import { triggerHaptic } from '@/lib/utils/haptics';

// ─── Store Shape ─────────────────────────────────────────────────

interface CartState {
  // Core cart data
  items: CartItem[];
  isOpen: boolean;          // Slide-Over Cart Drawer visibility

  // Hydration guard — prevents Next.js SSR hydration mismatch.
  // Render skeleton/empty until this flips to `true` after mount.
  hasHydrated: boolean;

  // Validation state from POST /api/v1/cart/validate
  validation: CartValidationData | null;
  isValidating: boolean;

  // Promo code
  couponCode: string;

  // Tracks acknowledged prices so "price changed" warnings can be
  // dismissed on first checkout click, then proceed on second click.
  lastValidatedPriceMap: Record<string, number>;

  // ─── Actions ───────────────────────────────────────────────────

  /** Optimistically add a product to the cart (or increment qty). */
  addItem: (product: Omit<CartItem, 'quantity'>) => void;

  /** Remove an item entirely by productId. */
  removeItem: (productId: string) => void;

  /** Update quantity (clamped to minimum 1). */
  updateQuantity: (productId: string, quantity: number) => void;

  /** Clear all cart state and localStorage. */
  clearCart: () => void;

  // Drawer controls
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Validation / coupon setters
  setValidation: (data: CartValidationData) => void;
  setIsValidating: (v: boolean) => void;
  setCouponCode: (code: string) => void;
  setHasHydrated: (v: boolean) => void;

  // ─── Computed Getters ──────────────────────────────────────────

  /** Sum of all item quantities. */
  getTotalCount: () => number;

  /** Optimistic subtotal: Σ(item.price × item.quantity). */
  getSubtotal: () => number;

  /**
   * Shipping progress toward free insured delivery.
   *
   * @param threshold  Dollar amount for free shipping (default $500).
   * @returns { isFree, remaining, percentage }
   *
   * Math:
   *  percentage = min(subtotal / threshold, 1) × 100
   *  remaining  = max(threshold - subtotal, 0)
   */
  getShippingProgress: (threshold?: number) => {
    isFree: boolean;
    remaining: number;
    percentage: number;
  };
}

// ─── Store Implementation ────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isOpen: false,
      hasHydrated: false,
      validation: null,
      isValidating: false,
      couponCode: '',
      lastValidatedPriceMap: {},

      // ─── Actions ─────────────────────────────────────────────

      addItem: (product) => {
        // Haptic feedback for native-feeling mobile tap
        triggerHaptic();

        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.productId
          );

          if (existing) {
            // Optimistic increment — validation will reconcile stock
            return {
              items: state.items.map((i) =>
                i.productId === product.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          // New item — start with quantity 1
          return {
            items: [...state.items, { ...product, quantity: 1 }],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        // Clamp to minimum 1 — removal is a separate action
        const clampedQty = Math.max(1, quantity);

        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: clampedQty }
              : i
          ),
        }));
      },

      clearCart: () => {
        set({
          items: [],
          validation: null,
          couponCode: '',
          lastValidatedPriceMap: {},
        });
      },

      // Drawer
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      toggleDrawer: () => set((s) => ({ isOpen: !s.isOpen })),

      // Validation
      setValidation: (data) =>
        set({
          validation: data,
          // Snapshot current server prices so we know what the user
          // has "seen" — used for double-click checkout confirmation.
          lastValidatedPriceMap: Object.fromEntries(
            data.items.map((i) => [i.productId, i.serverPrice])
          ),
        }),
      setIsValidating: (v) => set({ isValidating: v }),
      setCouponCode: (code) => set({ couponCode: code }),
      setHasHydrated: (v) => set({ hasHydrated: v }),

      // ─── Computed Getters ────────────────────────────────────

      getTotalCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

      getShippingProgress: (threshold = 500) => {
        const subtotal = get().getSubtotal();
        // percentage capped at 100 so the progress bar doesn't overflow
        const percentage = Math.min((subtotal / threshold) * 100, 100);
        // remaining capped at 0 so we never show negative amounts
        const remaining = Math.max(threshold - subtotal, 0);
        return { isFree: subtotal >= threshold, remaining, percentage };
      },
    }),
    {
      name: 'aurora-cart-storage',
      // Only persist the data that needs to survive page reloads.
      // Transient UI state (isOpen, validation, isValidating) is excluded.
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        lastValidatedPriceMap: state.lastValidatedPriceMap,
      }),
      // Flip hydration flag once the persisted state has been loaded.
      // Until this fires, the UI should render empty/skeleton to avoid
      // SSR hydration mismatches (server renders 0 items, client may
      // have items from localStorage).
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
