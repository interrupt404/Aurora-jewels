/**
 * @file cart.schema.ts
 * @description Fastify route definition with inline JSON schema for cart validation.
 */

import { authenticateRequest } from '../utils/auth';
import { validateCartHandler } from '../controllers/cart.controller';

export const validateCartOptions = {
  schema: {
    body: {
      type: 'object',
      required: ['items'],
      properties: {
        items: {
          type: 'array',
          minItems: 0,
          items: {
            type: 'object',
            required: ['productId', 'quantity', 'clientPrice'],
            properties: {
              productId: { type: 'string', format: 'uuid' },
              quantity: { type: 'integer', minimum: 1 },
              clientPrice: { type: 'number', minimum: 0 },
            },
            additionalProperties: false,
          },
        },
        couponCode: { type: 'string', maxLength: 50 },
      },
      additionalProperties: false,
    },

    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success'] },
          api_version: { type: 'string' },
          api_code: { type: 'number' },
          response: { type: 'object', additionalProperties: true },
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    productId: { type: 'string' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    thumbnailUrl: { type: ['string', 'null'] },
                    clientPrice: { type: 'number' },
                    serverPrice: { type: 'number' },
                    isPriceChanged: { type: 'boolean' },
                    priceDifference: { type: 'number' },
                    requestedQuantity: { type: 'number' },
                    availableStock: { type: 'number' },
                    validQuantity: { type: 'number' },
                    isAvailable: { type: 'boolean' },
                    hasInsufficientStock: { type: 'boolean' },
                    subtotal: { type: 'number' },
                  },
                  required: [
                    'productId',
                    'name',
                    'slug',
                    'clientPrice',
                    'serverPrice',
                    'isPriceChanged',
                    'priceDifference',
                    'requestedQuantity',
                    'availableStock',
                    'validQuantity',
                    'isAvailable',
                    'hasInsufficientStock',
                    'subtotal',
                  ],
                  additionalProperties: true,
                },
              },
              summary: {
                type: 'object',
                properties: {
                  subtotal: { type: 'number' },
                  discount: { type: 'number' },
                  shippingFee: { type: 'number' },
                  tax: { type: 'number' },
                  total: { type: 'number' },
                  itemCount: { type: 'number' },
                  hasPriceChanges: { type: 'boolean' },
                  hasStockIssues: { type: 'boolean' },
                  isValid: { type: 'boolean' },
                },
                required: [
                  'subtotal',
                  'discount',
                  'shippingFee',
                  'tax',
                  'total',
                  'itemCount',
                  'hasPriceChanges',
                  'hasStockIssues',
                  'isValid',
                ],
                additionalProperties: false,
              },
              coupon: {
                type: 'object',
                properties: {
                  code: { type: ['string', 'null'] },
                  isValid: { type: 'boolean' },
                  discountPercentage: { type: 'number' },
                  discountAmount: { type: 'number' },
                  message: { type: 'string' },
                },
                required: ['isValid', 'discountPercentage', 'discountAmount', 'message'],
                additionalProperties: false,
              },
              issues: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    productId: { type: 'string' },
                    message: { type: 'string' },
                  },
                  required: ['type', 'message'],
                  additionalProperties: true,
                },
              },
            },
            required: ['items', 'summary', 'coupon', 'issues'],
            additionalProperties: false,
          },
        },
        required: ['status', 'api_version', 'data'],
        additionalProperties: true,
      },

      400: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['fail'] },
          api_version: { type: 'string' },
          api_code: { type: 'number' },
          error: { type: ['object', 'array'] },
        },
        required: ['status', 'api_version', 'error'],
        additionalProperties: true,
      },

      500: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['fail'] },
          api_version: { type: 'string' },
          api_code: { type: 'number' },
          error: { type: ['object', 'array'] },
        },
        required: ['status', 'api_version', 'error'],
        additionalProperties: true,
      },
    },
  },

  preHandler: authenticateRequest,
  handler: validateCartHandler,
};
