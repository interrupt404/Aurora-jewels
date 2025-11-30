'use client';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Search, Heart, ShoppingBag } from 'lucide-react';

const LINKS = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Sale'];

const productHref = (label: string) =>
  label.toLowerCase() === 'sale' ? '/products' : `/products?category=${encodeURIComponent(label)}`;

export function Header() {
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <Image
            src="https://vfobmlxlvipmdvgcwoqd.supabase.co/storage/v1/object/public/product-images/logo-2.png"
            alt="Aurora Jewels logo"
            width={180}
            height={48}
            priority
          />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex gap-6 text-sm font-medium text-neutral-800">
          {LINKS.map((item) => (
            <Link
              key={item}
              href={productHref(item)}
              className="hover:text-amber-600 transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* ICONS + HAMBURGER */}
        <div className="flex items-center gap-4 text-neutral-700">

          <Search className="h-5 w-5 cursor-pointer hover:text-amber-600 hidden sm:block" />
          <Heart className="h-5 w-5 cursor-pointer hover:text-amber-600 hidden sm:block" />
          <ShoppingBag className="h-5 w-5 cursor-pointer hover:text-amber-600 hidden sm:block" />

          <button
            className="md:hidden p-2 rounded-md border bg-white shadow-sm"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* BACKDROP (opaque premium dark layer) */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur transition-opacity duration-300 z-40 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* ───────────────────────────────────────────── */}
      {/* RIGHT SLIDE-IN MENU */}
      <aside
        className={`fixed right-0 top-0 h-full w-full max-w-xs bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="text-lg font-semibold text-neutral-800">Menu</span>

          <button className="p-2" onClick={() => setOpen(false)} aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* NAV CONTENT */}
        <div className="flex flex-col gap-1 px-5 py-4">

          {/* SEARCH FIELD */}
          <form action="/products" method="get" className="mb-4">
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-neutral-50">
              <Search className="h-4 w-4 text-neutral-500" />
              <input
                type="text"
                name="q"
                placeholder="Search products..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
          </form>

          {/* Vertical Nav Items */}
          {LINKS.map((item, i) => (
            <Link
              key={item}
              href={productHref(item)}
              ref={i === 0 ? firstLinkRef : undefined}
              onClick={() => setOpen(false)}
              className="flex justify-between items-center px-3 py-3 rounded-lg text-neutral-800 hover:bg-neutral-100 transition"
            >
              <span className="font-medium">{item}</span>
              {item !== "Sale" && (
                <span className="text-xs text-neutral-500">Category</span>
              )}
            </Link>
          ))}

          <div className="mt-6 border-t pt-4 flex flex-col gap-2 text-neutral-700 text-sm">
            <Link href="/account" onClick={() => setOpen(false)} className="py-2">
              Account
            </Link>
            <Link href="/help" onClick={() => setOpen(false)} className="py-2">
              Help & Support
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="py-2">
              Contact Us
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
