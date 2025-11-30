// lib/queries/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import type { ProductQueryParams } from '@/lib/types/product-query';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';

export type ProductCardDTO = {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnailUrl: string | null;
  rating?: number;
  shortDescription?: string;

  category?: string;
  metal_type?: string;
  stone_type?: string;
};

export type ProductsResponse = {
  products: ProductCardDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
};

async function fetchProducts(params: ProductQueryParams): Promise<ProductsResponse> {
  const url = new URL(API_ENDPOINTS.PRODUCTS, API_BASE_URL);

  // Append only filled fields
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === 'string' && value.trim() === '') return;

    url.searchParams.append(key, String(value));
  });

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch products');

  const json = await res.json();
  return json?.data ?? {
    products: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
  };
}

export function useProducts(params: ProductQueryParams) {
  return useQuery<ProductsResponse>({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    retry: 1,
  });
}
