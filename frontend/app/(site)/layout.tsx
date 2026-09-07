// app/(site)/layout.tsx
// ──────────────────────────────────────────────────────────────────
// Site layout wrapper — renders Header, Footer, CartDrawer, and
// CartToastProvider on all pages within the (site) route group.
//
// CartDrawer is mounted here (not in individual pages) so the
// slide-over drawer is accessible from any page without remounting.
// CartToastProvider wraps children so any product card can trigger
// the floating "added to bag" notification.
// ──────────────────────────────────────────────────────────────────

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { CartToastProvider } from "@/components/cart/CartToast";
import "@/app/globals.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // "children" = whatever each page will render inside
  return (
    <div className="flex min-h-screen flex-col">
      <CartToastProvider>
        <Header />
        <CartDrawer />
        <main className="flex-grow">{children}</main>
        <Footer />
      </CartToastProvider>
    </div>
  );
}