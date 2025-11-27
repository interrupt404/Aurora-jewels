"use client";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, Heart, ShoppingBag } from "lucide-react";

export function Header() {
  const links = ["Rings", "Necklaces", "Earrings", "Bracelets", "Sale"];

  return (
    <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* ✅ Full logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="https://vfobmlxlvipmdvgcwoqd.supabase.co/storage/v1/object/public/product-images/logo-2.png"
            alt="Aurora Jewels logo"
            width={180}
            height={48}
            priority
          />
        </Link>

        {/* Desktop product category links */}
        <nav className="hidden md:flex gap-6 text-base font-medium text-neutral-700">
          {links.map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="hover:text-amber-600 transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Right‑side icons */}
        <div className="flex items-center gap-4 text-neutral-700">
          <Search className="h-6 w-6 cursor-pointer hover:text-amber-600" />
          <Heart className="h-6 w-6 cursor-pointer hover:text-amber-600" />
          <ShoppingBag className="h-6 w-6 cursor-pointer hover:text-amber-600" />

          {/* Mobile menu hamburger */}
          <button className="md:hidden p-1">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
}