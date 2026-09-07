// constants/cartMessages.ts
// ──────────────────────────────────────────────────────────────────
// Centralized copy and messages for Cart Issue Badges & Notifications.
// ──────────────────────────────────────────────────────────────────

export const CART_ISSUE_MESSAGES = {
  /** Out of Stock / Item Unavailable badge message */
  OUT_OF_STOCK: 'Item unavailable — please remove',

  /** Insufficient stock badge message template */
  INSUFFICIENT_STOCK: (availableStock: number) =>
    `Stock limited — only ${availableStock} remaining`,

  /** Price change micro-pill message template */
  PRICE_CHANGED: (formattedPrice: string) =>
    `Updated to current live rate (${formattedPrice})`,
} as const;
