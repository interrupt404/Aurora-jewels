// src/queries/product.query.ts
import { supabaseManager } from '../db/supabase';

/**
 * Builds a Supabase query to find a paginated list of products.
 * This function DOES NOT execute the query; it only prepares it.
 * @param page - The current page number.
 * @param limit - The number of items per page.
 * @returns A Supabase query builder object.
 */
export function buildFindProductsPaginatedQuery(page: number, limit: number) {
  const client = supabaseManager.getClient();
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit - 1;

  // Build the query and return the builder instance.
  // We've removed the manual type annotation to let TypeScript infer it correctly.
  const queryBuilder = client
    .from('products')
    .select('id, name, slug, price, image_urls', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(startIndex, endIndex);

  return queryBuilder;
}