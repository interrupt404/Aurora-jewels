'use client';
// components/cart/CartToast.tsx
// ──────────────────────────────────────────────────────────────────
// Floating confirmation pill that appears at the bottom of the
// viewport when an item is first added to the bag.
//
// Design choices:
//  • Dark charcoal background (bg-neutral-800) for contrast against
//    the predominantly white Aurora Jewels interface.
//  • "VIEW BAG" link in champagne gold opens the cart drawer.
//  • Auto-dismisses after 4 seconds with smooth exit animation.
//  • Uses React Portal to render at <body> level so it doesn't
//    disrupt mobile scroll or get clipped by overflow parents.
//  • Fixed bottom positioning stays in the thumb-zone on mobile.
// ──────────────────────────────────────────────────────────────────

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '@/lib/store/useCartStore';

// ─── Context ─────────────────────────────────────────────────────

interface CartToastContextValue {
  showToast: (itemName: string) => void;
}

const CartToastContext = createContext<CartToastContextValue>({
  showToast: () => {},
});

export const useCartToast = () => useContext(CartToastContext);

// ─── Provider ────────────────────────────────────────────────────

export function CartToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toastItem, setToastItem] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openDrawer = useCartStore((s) => s.openDrawer);

  // Ensure portal target is available (client only)
  useEffect(() => setMounted(true), []);

  const showToast = useCallback((itemName: string) => {
    // Clear any existing timer so rapid adds don't stack
    if (timerRef.current) clearTimeout(timerRef.current);
    setToastItem(itemName);

    // Auto-dismiss after 2.5 seconds
    timerRef.current = setTimeout(() => {
      setToastItem(null);
    }, 2500);
  }, []);

  const handleViewBag = () => {
    setToastItem(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    openDrawer();
  };

  return (
    <CartToastContext.Provider value={{ showToast }}>
      {children}

      {/* Portal: renders outside the component tree at <body> level */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {toastItem && (
              <div className="fixed bottom-[96px] lg:bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none max-w-[calc(100vw-32px)]">
                <motion.div
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="pointer-events-auto"
                >
                  <div className="flex items-center gap-2.5 rounded-full bg-neutral-900/95 backdrop-blur-md px-4 py-2 shadow-2xl border border-neutral-800 text-center whitespace-nowrap">
                    <span className="text-[11px] font-medium text-white tracking-wide">
                      Added to bag
                    </span>
                    <span className="text-neutral-500 text-[10px]">•</span>
                    <button
                      onClick={handleViewBag}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-2"
                    >
                      View Bag
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </CartToastContext.Provider>
  );
}
