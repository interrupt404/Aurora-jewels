import Image from "next/image";
import Link from "next/link";

export function AboutSection() {
  return (
    <section className="w-full bg-[#f5f4f2] py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-14 px-6 md:flex-row md:gap-20 lg:gap-24">
        {/* IMAGE */}
        <div className="relative w-full overflow-hidden rounded-lg shadow-md md:w-[45%]">
          <Image
            src="https://vfobmlxlvipmdvgcwoqd.supabase.co/storage/v1/object/public/product-images/public/images/about-us.jpeg"
            alt="Aurora Jewels artisan at work"
            width={800}
            height={600}
            className="h-full w-full object-cover object-center"
            priority
          />
        </div>

        {/* TEXT */}
        <div className="md:w-[55%] text-center md:text-left flex flex-col items-center md:items-start justify-center">
          <h2 className="text-3xl font-light uppercase tracking-wide text-neutral-900 md:text-4xl">
            Built on Trust, <br/> Crafted with Passion
          </h2>

          <p className="mt-5 text-base leading-relaxed text-neutral-800 max-w-md">
            For over a decade, Aurora Jewels has honoured traditional artistry
            while embracing innovation. Every piece is made with ethically sourced
            materials, inspected by experts, and accompanied by authenticity
            certifications—so you can invest with complete confidence.
          </p>

          <p className="mt-3 text-base leading-relaxed text-neutral-800 max-w-md">
            We don’t just sell jewellery—we create heirlooms that reflect
            integrity, elegance, and lasting value.
          </p>

          {/* Highlights */}
          <div className="mt-6 space-y-2 text-sm text-neutral-700">
            <p>✓ Certified Hall‑Mark Gold & Conflict‑Free Diamonds</p>
            <p>✓ Transparent Pricing & Lifetime Service</p>
            <p>✓ Eco‑conscious packaging & recycling program</p>
            <p>✓ Trusted by thousands world‑wide</p>
            </div>

          <Link
            href="/products"
            className="mt-10 inline-block rounded-md border border-neutral-800 px-8 py-2 text-sm font-semibold uppercase text-neutral-900 transition-colors hover:bg-neutral-800 hover:text-white"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}