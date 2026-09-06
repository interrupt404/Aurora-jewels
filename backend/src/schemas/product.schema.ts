/**
 * @file product.schema.ts
 * @description Fastify route definition with inline JSON schema for product listing.
 */

import { authenticateRequest } from '../utils/auth';
import { getProductsHandler } from '../controllers/product.controller';

export const getProductsOptions = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'string', pattern: '^[1-9][0-9]*$', default: '1' },
        limit: { type: 'string', pattern: '^[1-9][0-9]*$', default: '12' },
        sort: { type: 'string', enum: ['newest', 'best_sellers', 'price_asc', 'price_desc', 'popular'], default: 'newest' },
        q: { type: 'string' },
        category: { type: 'string' },
        min_price: { type: 'string', pattern: '^[0-9]+(\\.[0-9]{1,2})?$' },
        max_price: { type: 'string', pattern: '^[0-9]+(\\.[0-9]{1,2})?$' },
        metal_type: { type: 'string' },
        stone_type: { type: 'string' },
        is_featured: { type: 'string', enum: ['true', 'false'] },
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
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    price: { type: 'number' },
                    thumbnailUrl: { type: ['string', 'null'], format: 'uri' },
                  },
                  additionalProperties: true,
                },
              },
              pagination: {
                type: 'object',
                properties: {
                  currentPage: { type: 'number' },
                  totalPages: { type: 'number' },
                  totalItems: { type: 'number' },
                },
                required: ['currentPage', 'totalPages', 'totalItems'],
                additionalProperties: false,
              },
            },
            required: ['products', 'pagination'],
            additionalProperties: false,
          },
        },
        required: ['status', 'api_version', 'data'],
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
  handler: getProductsHandler,
};