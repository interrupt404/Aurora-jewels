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
          response: {
            type: 'object',
            properties: {
              data: { type: 'array' },
            },
            required: ['data'],
            additionalProperties: true,
          },
        },
        required: ['status', 'api_version', 'api_code', 'response'],
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
        required: ['status', 'api_version', 'api_code', 'error'],
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
        required: ['status', 'api_version', 'api_code', 'error'],
        additionalProperties: true,
      },
    },
  },

  preHandler: authenticateRequest,
  handler: validateCartHandler,
};
