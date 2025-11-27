// src/types/product.types.ts

// DB row coming from Supabase (matches columns in your SELECT)
export interface ProductRow {
  id: string;
  created_at?: string;
  name: string;
  slug: string;
  description?: string | null;
  price: string | number;
  category?: string | null;
  metal_type?: string | null;
  stone_type?: string | null;
  image_urls?: string[] | null;
  thumbnail_url?: string | null;
  stock_quantity?: number | null;
  is_featured?: boolean | null;
  items_sold?: number | null;
  views?: number | null;
  rating?: number | string | null;
  reviews_count?: number | null;
  // allow other unknown columns to avoid future TS pain
  [key: string]: any;
}

// DTO returned by your service / controller
export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnailUrl: string | null;
  imageUrls: string[];
  category?: string | null;
  rating: number;
  reviewsCount: number;
  itemsSold: number;
  stockQuantity: number;
  isFeatured: boolean;
  shortDescription: string;
}