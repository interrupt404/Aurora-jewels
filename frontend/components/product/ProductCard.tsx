'use client';
import Link from 'next/link';
import Image from 'next/image';
import type { ProductCardDTO } from '@/lib/queries/useProducts';
import placeholderImage from '@/app/placeholder.png'

type Props = {
  product: ProductCardDTO & { stockQuantity?: number; isFeatured?: boolean };
  className?: string;
};

export default function ProductCard({ product, className = '' }: Props) {
  const { name, slug, price, thumbnailUrl } = product;

  return (
    <div className={`group relative ${className}`}>
      <Link
        href="/products"
        className="block overflow-hidden rounded-[6px] bg-white border border-neutral-100 hover:shadow-lg transition-shadow duration-200"
        aria-label={name}
      >
        {/* image */}
        <div className="relative aspect-[1/1] w-full bg-neutral-50 flex items-center justify-center overflow-hidden">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={name}
              fill
              sizes="(max-width:640px) 50vw, 280px"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Image
              src={placeholderImage}
              alt={name}
              fill
              sizes="(max-width:640px) 50vw, 280px"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
          )}

          {/* featured badge */}
          {product.isFeatured ? (
            <span className="absolute left-3 top-3 inline-flex items-center rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
              Featured
            </span>
          ) : null}
        </div>

        {/* content */}
        <div className="px-3 py-3 text-center">
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">{name}</h3>
          <p className="mt-2 text-sm text-neutral-700 font-semibold">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)}
          </p>
        </div>
      </Link>
    </div>
  );
}
