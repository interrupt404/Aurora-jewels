/**
 * @file cart.service.ts
 * @description Service Layer for Cart Batch Validation & Business Logic.
 */

import { logger } from '../utils/logger';
import { executeQuery } from '../utils/dbHelpers';
import { buildFetchProductsByIdsQuery, fetchCouponDetails } from '../queries/cart.query';
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE, TAX_RATE } from '../constants';

/**
 * Helper function to round monetary numbers to 2 decimal places.
 */
function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

/**
 * Validates a batch of cart items, calculates pricing, applies coupon rules,
 * checks stock limits, and computes overall cart financial totals.
 */
export const validateCart = async (body: any) => {
  const itemsInput = body.items || [];
  const couponCodeInput = body.couponCode?.trim() || null;

  logger.info(`Service: Validating cart batch with ${itemsInput.length} items. Coupon: '${couponCodeInput || 'NONE'}'`);

  // 1. Extract unique product IDs to query database in a single batch
  const uniqueProductIds = Array.from(new Set(itemsInput.map((item: any) => item.productId).filter(Boolean)));

  // Execute single batch query for all products
  const productMap = new Map<string, any>();
  if (uniqueProductIds.length > 0) {
    const query = buildFetchProductsByIdsQuery(uniqueProductIds as string[]);
    const [dbProducts, dbError] = await executeQuery<any[]>(query);

    if (dbError) {
      logger.error('Service: Failed to fetch products for cart validation batch', dbError);
      throw new Error('Database query for cart validation failed.');
    }

    if (dbProducts) {
      for (const product of dbProducts) {
        productMap.set(product.id, product);
      }
    }
  }

  // Prepare response data containers
  const validatedItems: any[] = [];
  const issues: any[] = [];

  let overallSubtotal = 0;
  let totalItemCount = 0;
  let hasPriceChanges = false;
  let hasStockIssues = false;

  // 2. Iterate through submitted items and perform validation checks
  for (const inputItem of itemsInput) {
    const dbProduct = productMap.get(inputItem.productId);

    // Handle case where product is not found in DB
    if (!dbProduct) {
      logger.warn(`Service: Product ID ${inputItem.productId} not found in database.`);
      issues.push({
        type: 'PRODUCT_NOT_FOUND',
        productId: inputItem.productId,
        message: `Product with ID '${inputItem.productId}' was not found in catalog.`,
      });
      hasStockIssues = true;

      validatedItems.push({
        productId: inputItem.productId,
        name: 'Unknown Product',
        slug: '',
        thumbnailUrl: null,
        clientPrice: roundCurrency(inputItem.clientPrice || 0),
        serverPrice: 0,
        isPriceChanged: true,
        priceDifference: roundCurrency(0 - (inputItem.clientPrice || 0)),
        requestedQuantity: inputItem.quantity || 1,
        availableStock: 0,
        validQuantity: 0,
        isAvailable: false,
        hasInsufficientStock: true,
        subtotal: 0,
      });
      continue;
    }

    // Extract server values from DB row
    const serverPrice = roundCurrency(Number(dbProduct.price) || 0);
    const clientPrice = roundCurrency(Number(inputItem.clientPrice) || 0);
    const availableStock = Math.max(0, dbProduct.stock_quantity ?? 0);
    const requestedQuantity = Math.max(1, inputItem.quantity || 1);

    // A. Price Discrepancy Check (detect client tampering or outdated prices)
    const isPriceChanged = Math.abs(serverPrice - clientPrice) > 0.001;
    const priceDifference = roundCurrency(serverPrice - clientPrice);

    if (isPriceChanged) {
      hasPriceChanges = true;
      issues.push({
        type: 'PRICE_MISMATCH',
        productId: dbProduct.id,
        message: `Price for '${dbProduct.name}' changed from $${clientPrice} to $${serverPrice}.`,
      });
    }

    // B. Stock Availability & Depletion Check
    let validQuantity = 0;
    let isAvailable = false;
    let hasInsufficientStock = false;

    if (availableStock <= 0) {
      // Product is completely out of stock
      isAvailable = false;
      hasInsufficientStock = true;
      validQuantity = 0;
      hasStockIssues = true;
      issues.push({
        type: 'OUT_OF_STOCK',
        productId: dbProduct.id,
        message: `'${dbProduct.name}' is currently out of stock.`,
      });
    } else if (requestedQuantity > availableStock) {
      // Requested quantity exceeds available stock; cap to available stock
      isAvailable = true;
      hasInsufficientStock = true;
      validQuantity = availableStock;
      hasStockIssues = true;
      issues.push({
        type: 'INSUFFICIENT_STOCK',
        productId: dbProduct.id,
        message: `Only ${availableStock} units of '${dbProduct.name}' available (requested ${requestedQuantity}).`,
      });
    } else {
      // Stock is sufficient
      isAvailable = true;
      hasInsufficientStock = false;
      validQuantity = requestedQuantity;
    }

    // C. Item Subtotal Calculation (serverPrice * validQuantity)
    const itemSubtotal = roundCurrency(serverPrice * validQuantity);
    overallSubtotal = roundCurrency(overallSubtotal + itemSubtotal);
    totalItemCount += validQuantity;

    // D. Construct Validated Cart Item Object
    validatedItems.push({
      productId: dbProduct.id,
      name: dbProduct.name,
      slug: dbProduct.slug,
      thumbnailUrl: dbProduct.thumbnail_url || (dbProduct.image_urls?.[0] ?? null),
      clientPrice,
      serverPrice,
      isPriceChanged,
      priceDifference,
      requestedQuantity,
      availableStock,
      validQuantity,
      isAvailable,
      hasInsufficientStock,
      subtotal: itemSubtotal,
    });
  }

  // 3. Coupon Validation & Discount Computation
  let couponResult: any = {
    code: couponCodeInput,
    isValid: false,
    discountPercentage: 0,
    discountAmount: 0,
    message: couponCodeInput ? 'No coupon applied.' : 'No coupon code provided.',
  };

  if (couponCodeInput) {
    const couponRecord = await fetchCouponDetails(couponCodeInput);

    if (!couponRecord || !couponRecord.is_active) {
      couponResult = {
        code: couponCodeInput,
        isValid: false,
        discountPercentage: 0,
        discountAmount: 0,
        message: `Coupon code '${couponCodeInput}' is invalid or expired.`,
      };
      issues.push({
        type: 'INVALID_COUPON',
        message: `Coupon code '${couponCodeInput}' is invalid or expired.`,
      });
    } else if (overallSubtotal < couponRecord.min_purchase_amount) {
      couponResult = {
        code: couponCodeInput,
        isValid: false,
        discountPercentage: couponRecord.discount_percentage,
        discountAmount: 0,
        message: `Minimum purchase amount of $${couponRecord.min_purchase_amount} required for '${couponCodeInput}'.`,
      };
      issues.push({
        type: 'INVALID_COUPON',
        message: `Minimum purchase of $${couponRecord.min_purchase_amount} required for '${couponCodeInput}'.`,
      });
    } else {
      // Calculate discount amount based on percentage or fixed amount
      let calculatedDiscount = 0;
      if (couponRecord.discount_percentage > 0) {
        calculatedDiscount = (overallSubtotal * couponRecord.discount_percentage) / 100;
      } else if (couponRecord.discount_amount > 0) {
        calculatedDiscount = couponRecord.discount_amount;
      }

      // Cap discount so it does not exceed subtotal
      const discountAmount = roundCurrency(Math.min(overallSubtotal, calculatedDiscount));

      couponResult = {
        code: couponRecord.code,
        isValid: true,
        discountPercentage: couponRecord.discount_percentage,
        discountAmount,
        message: couponRecord.discount_percentage > 0
          ? `${couponRecord.discount_percentage}% discount applied successfully.`
          : `$${discountAmount} discount applied successfully.`,
      };
    }
  }

  // 4. Financial Totals & Fee Calculations
  const discount = couponResult.discountAmount;
  const subtotalAfterDiscount = roundCurrency(Math.max(0, overallSubtotal - discount));

  // Shipping Fee Rule: Luxury jewelry offers free shipping over threshold; otherwise flat shipping fee
  const shippingFee = (subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD || overallSubtotal === 0)
    ? 0
    : FLAT_SHIPPING_FEE;

  // Sales Tax Calculation: Tax rate applied on subtotal after discount
  const tax = roundCurrency(subtotalAfterDiscount * TAX_RATE);

  // Total Calculation: Subtotal after discount + Shipping Fee + Tax
  const total = roundCurrency(subtotalAfterDiscount + shippingFee + tax);

  // Overall Cart Validity: True if cart has items, no stock issues, and subtotal > 0
  const isValid = validatedItems.length > 0 && !hasStockIssues && overallSubtotal > 0;

  const summary = {
    subtotal: overallSubtotal,
    discount,
    shippingFee,
    tax,
    total,
    itemCount: totalItemCount,
    hasPriceChanges,
    hasStockIssues,
    isValid,
  };

  logger.info(
    `Service: Cart validation complete | Subtotal: $${overallSubtotal} | Total: $${total} | Issues: ${issues.length}`
  );

  return {
    items: validatedItems,
    summary,
    coupon: couponResult,
    issues,
  };
};
