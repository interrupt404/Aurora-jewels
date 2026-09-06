// src/queries/product.query.ts
import { supabaseManager } from '../db/supabase';
import { TABLE_PRODUCTS } from '../constants';

/**
 * Builds a Supabase query to find a paginated list of products.
 * This function DOES NOT execute the query; it only prepares it.
 * @param page - The current page number.
 * @param limit - The number of items per page.
 * @returns A Supabase query builder object.
 */
export function buildFindProductsPaginatedQuery({
  page,
  limit,
  sort,
  q,
  category,
  min_price,
  max_price,
  metal_type,
  stone_type,
  is_featured,
}: {
  page: number;
  limit: number;
  sort?: string;
  q?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  metal_type?: string;
  stone_type?: string;
  is_featured?: boolean;
}) {
  const client = supabaseManager.getClient();
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  let query = client
    .from(TABLE_PRODUCTS)
    .select('id, name, slug, price, image_urls, category, rating, reviews_count, items_sold, stock_quantity, is_featured, description', { count: 'exact' });

  // filters
  if (category) query = query.eq('category', category);
  if (metal_type) query = query.eq('metal_type', metal_type);
  if (stone_type) query = query.eq('stone_type', stone_type);
  if (typeof is_featured !== 'undefined') query = query.eq('is_featured', is_featured);

  if (min_price) query = query.gte('price', min_price);
  if (max_price) query = query.lte('price', max_price);

  // simple text search (Supabase full text or ilike fallback)
  if (q) {
    // prefer FTS column if present, else use ilike on name/description
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // sorting
  switch (sort) {
    case 'best_sellers':
      query = query.order('items_sold', { ascending: false });
      break;
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'popular':
      query = query.order('views', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
  }

  query = query.range(start, end);
  return query;
}