/**
 * @file constants.ts
 * @description Centralized constants for table names, financial rules, pagination defaults, and API values.
 */

// Database Table & Collection Names
export const TABLE_PRODUCTS = 'products';
export const TABLE_COUPONS = 'coupons';

// Financial & Cart Calculation Rules
export const FREE_SHIPPING_THRESHOLD = 500;
export const FLAT_SHIPPING_FEE = 50;
export const TAX_RATE = 0.08;

// API & Server Defaults
export const API_VERSION = '1.0.0';
export const DEFAULT_PORT = 3001;
export const DEFAULT_HOST = '0.0.0.0';

// Product Search & Pagination Defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 12;
export const DEFAULT_SORT = 'newest';
export const SORT_OPTIONS = ['newest', 'best_sellers', 'price_asc', 'price_desc', 'popular'] as const;

// Interface for Coupon Records
export interface CouponRecord {
  code: string;
  discount_percentage: number;
  discount_amount: number;
  min_purchase_amount: number;
  is_active: boolean;
}

// Static Fallback Coupons
export const STATIC_COUPONS_FALLBACK: Record<string, CouponRecord> = {
  WELCOME20: {
    code: 'WELCOME20',
    discount_percentage: 20,
    discount_amount: 0,
    min_purchase_amount: 0,
    is_active: true,
  },
  AURORA15: {
    code: 'AURORA15',
    discount_percentage: 15,
    discount_amount: 0,
    min_purchase_amount: 0,
    is_active: true,
  },
  SAVE100: {
    code: 'SAVE100',
    discount_percentage: 0,
    discount_amount: 100,
    min_purchase_amount: 500,
    is_active: true,
  },
};
