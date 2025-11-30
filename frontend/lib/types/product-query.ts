export type ProductSort = 'newest' | 'best_sellers' | 'price_asc' | 'price_desc' | 'popular';

export type ProductQueryParams = {
  page?: number;
  limit?: number;
  sort?: ProductSort;
  q?: string;
  category?: string;
  metal_type?: string;
  stone_type?: string;
  min_price?: string | number;
  max_price?: string | number;
  is_featured?: 'true' | 'false';
  [key: string]: string | number | undefined;
};

// helper partial alias used across components
export type PartialProductQuery = Partial<ProductQueryParams>;
