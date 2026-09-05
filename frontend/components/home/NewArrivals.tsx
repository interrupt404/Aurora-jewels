import Image from "next/image";
import Link from "next/link";
import { fetchNewArrivals } from "@/lib/queries/useHome";

export async function NewArrivals() {
  const products = await fetchNewArrivals();

  return (
    <section className="w-full bg-white py-14">
      <div className="mx-auto max-w-7xl px-6">
        {/* 🧩 Matching heading style to CategoryGrid */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-light text-neutral-800 uppercase tracking-wide">
            New Arrivals
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Newly added pieces to our latest collection.
          </p>
        </div>

        {/* Product cards grid */}
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-4 place-items-center">
          {products.map((p) => (
            <Link
              key={p.id}
              href="/products"
              className="group block w-[220px] overflow-hidden rounded-sm bg-white transition-transform duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Image area */}
              <div className="relative aspect-[4/4] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={p.thumbnailUrl}
                  alt={p.name}
                  fill
                  sizes="(max-width:768px) 50vw, 220px"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Text area */}
              <div className="mt-3 px-2 text-center">
                <h3 className="text-sm font-medium text-neutral-900">{p.name}</h3>
              </div>

              <div className="mt-3 mb-4 text-center">
                <p className="text-base font-semibold text-neutral-800">
                  ${p.price.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}