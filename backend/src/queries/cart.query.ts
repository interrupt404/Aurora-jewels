/**
 * @file cart.query.ts
 * @description Architectural Role: Query Builder & Data Access Layer for Cart Batch Operations.
 */

import { supabaseManager } from '../db/supabase';
import { executeQuery } from '../utils/dbHelpers';
import { logger } from '../utils/logger';
import { TABLE_PRODUCTS, TABLE_COUPONS, STATIC_COUPONS_FALLBACK, CouponRecord } from '../constants';

export { CouponRecord };

/**
 * Builds a Supabase query to fetch multiple products by their unique IDs in a single batch.
 * 
 * @param productIds - Array of unique product UUID strings
 * @returns Supabase query builder object
 */
export function buildFetchProductsByIdsQuery(productIds: string[]) {
  const client = supabaseManager.getClient();

  return client
    .from(TABLE_PRODUCTS)
    .select('id, name, slug, price, stock_quantity, image_urls, category, is_featured')
    .in('id', productIds);
}

/**
 * Fetches coupon details by code from Supabase DB with safe fallback handling.
 * 
 * @param couponCode - Normalized coupon code string (uppercase)
 * @returns Promise<CouponRecord | null>
 */
export async function fetchCouponDetails(couponCode: string): Promise<CouponRecord | null> {
  const normalizedCode = couponCode.trim().toUpperCase();
  if (!normalizedCode) return null;

  try {
    const client = supabaseManager.getClient();
    const query = client
      .from(TABLE_COUPONS)
      .select('code, discount_percentage, discount_amount, min_purchase_amount, is_active')
      .eq('code', normalizedCode)
      .single();

    const [data, error] = await executeQuery<CouponRecord>(query);

    if (!error && data) {
      logger.info(`Query: Found active coupon '${normalizedCode}' in Supabase DB.`);
      return data;
    }

    // If DB query failed (e.g. table does not exist or code not found in table), check fallback map
    if (STATIC_COUPONS_FALLBACK[normalizedCode]) {
      logger.info(`Query: Utilizing fallback coupon for '${normalizedCode}'.`);
      return STATIC_COUPONS_FALLBACK[normalizedCode];
    }

    // Default fallback: table/coupon not found, return 0 discount record
    logger.warn(`Query: Coupon '${normalizedCode}' not found in DB or fallback map. Setting fallback discount to 0.`);
    return {
      code: normalizedCode,
      discount_percentage: 0,
      discount_amount: 0,
      min_purchase_amount: 0,
      is_active: false,
    };
  } catch (err) {
    logger.error(`Query Error: Exception while querying coupon table for '${normalizedCode}'. Using 0-discount fallback.`, err);
    // Safe fallback on error: set discount value to 0
    return {
      code: normalizedCode,
      discount_percentage: 0,
      discount_amount: 0,
      min_purchase_amount: 0,
      is_active: false,
    };
  }
}
