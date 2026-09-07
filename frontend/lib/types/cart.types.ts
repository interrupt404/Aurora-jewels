// lib/types/cart.types.ts
// ──────────────────────────────────────────────────────────────────
// All cart-related type definitions used across the Shopping Bag
// system — covers client-side state, API request payloads, and
// the authoritative validation response from the backend.
// ──────────────────────────────────────────────────────────────────

/** Client-side cart item stored in Zustand / localStorage. */
export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;           // client-side price at time of add
  thumbnailUrl: string;
  quantity: number;
  metalType?: string;      // e.g. "Platinum", "18K Yellow Gold"
  stockQuantity?: number;  // cached stock qty (authoritative value comes from validation)
  category?: string;       // e.g. "Rings", "Necklaces"
}

// ─── Validation Request ──────────────────────────────────────────

/** Single item in the validation request payload. */
export interface CartValidationRequestItem {
  productId: string;
  quantity: number;
  clientPrice: number;
}

/** Full request body sent to POST /api/v1/cart/validate. */
export interface CartValidationRequest {
  items: CartValidationRequestItem[];
  couponCode?: string;
}

// ─── Validation Response ─────────────────────────────────────────

/** Server-validated item with price / stock reconciliation flags. */
export interface ValidatedItem {
  productId: string;
  name: string;
  slug: string;
  thumbnailUrl: string;

  // Price reconciliation: allows UI to show strikethrough on drift
  clientPrice: number;       // price the client originally sent
  serverPrice: number;       // current authoritative price
  isPriceChanged: boolean;   // true when clientPrice ≠ serverPrice
  priceDifference: number;   // serverPrice - clientPrice (positive = price went up)

  // Stock reconciliation: allows UI to warn / disable [+] button
  requestedQuantity: number;
  availableStock: number;
  validQuantity: number;     // min(requestedQuantity, availableStock)
  isAvailable: boolean;      // false = product removed / hidden
  hasInsufficientStock: boolean;

  subtotal: number;          // serverPrice × validQuantity
}

/** Order summary computed server-side. */
export interface CartSummary {
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  itemCount: number;

  // Quick flags so UI can gate checkout without scanning each item
  hasPriceChanges: boolean;
  hasStockIssues: boolean;
  isValid: boolean;
}

/** Coupon validation result. */
export interface CouponResult {
  code: string;
  isValid: boolean;
  discountPercentage: number;
  discountAmount: number;
  message: string;
}

/** Describes a specific issue the server flagged. */
export interface CartIssue {
  type: string;
  productId?: string;
  message: string;
}

/** The `response.data[0]` payload from a successful validation call. */
export interface CartValidationData {
  items: ValidatedItem[];
  summary: CartSummary;
  coupon: CouponResult | null;
  issues: CartIssue[];
}

/** Top-level API response envelope. */
export interface CartValidationResponse {
  status: string;
  api_version: string;
  response: {
    data: CartValidationData[];
  };
}
