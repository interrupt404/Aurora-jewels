import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    name: "Rings",
    image:
      "https://vfobmlxlvipmdvgcwoqd.supabase.co/storage/v1/object/public/product-images/category-rings-1.png",
    href: "/products?category=rings",
  },
  {
    name: "Earrings",
    image:
      "https://vfobmlxlvipmdvgcwoqd.supabase.co/storage/v1/object/public/product-images/category-earrings-1.png",
    href: "/products?category=earrings",
  },
  {
    name: "Bracelets",
    image:
      "https://vfobmlxlvipmdvgcwoqd.supabase.co/storage/v1/object/public/product-images/category-bracelets-1.png",
    href: "/products?category=bracelets",
  },
  {
    name: "Necklaces",
    image:
      "https://vfobmlxlvipmdvgcwoqd.supabase.co/storage/v1/object/public/product-images/category-necklaces-1.png",
    href: "/products?category=necklaces",
  },
];

export function CategoryGrid() {
  return (
    <section className="w-full bg-white py-10 mt-6">
      <div className="mx-auto max-w-4xl px-6">
        {/* 👇 Section title */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-neutral-800 uppercase tracking-wide">
            Browse by Category
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Find the perfect piece for every occasion.
          </p>
        </div>

        {/* 🧩 Category grid */}
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(170px,1fr))] gap-6 place-items-center justify-center">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="group block w-full overflow-hidden rounded-md border border-neutral-200 bg-neutral-100 shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width:768px) 50vw, 200px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="bg-neutral-100 py-1">
                <h3 className="text-center text-sm font-semibold tracking-wide leading-none text-neutral-800 group-hover:text-amber-600 uppercase">
                  {c.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}