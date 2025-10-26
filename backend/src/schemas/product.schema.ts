// src/schemas/product.schema.ts
import { FastifySchema } from 'fastify';
import { authenticateRequest } from '../utils/auth';
import { getProductsHandler } from '../controllers/product.controller';

// Schema for the query parameters of GET /api/v1/products
const getProductsQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'string', pattern: '^[1-9][0-9]*$', default: '1' },
    limit: { type: 'string', pattern: '^[1-9][0-9]*$', default: '9' },
  },
  additionalProperties: false,
};

const permissiveProductItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    slug: { type: 'string' },
    price: { type: 'number' },
    thumbnailUrl: { type: ['string', 'null'], format: 'uri' },
  },
  additionalProperties: true,
};

const getProductsResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['success'] },
    api_version: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: permissiveProductItemSchema, 
        },
        pagination: {
          type: 'object',
          properties: {
            currentPage: { type: 'number' },
            totalPages: { type: 'number' },
            totalItems: { type: 'number' },
          },
          required: ['currentPage', 'totalPages', 'totalItems'],
          additionalProperties: false, // Keep pagination strict
        },
      },
      required: ['products', 'pagination'],
      additionalProperties: false,
    },
  },
  required: ['status', 'api_version', 'data'],
  additionalProperties: false,
};

// Schema for the entire 500 Error response (remains unchanged, it's already generic)
const errorResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['fail'] },
    api_version: { type: 'string' },
    error: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        details: { type: 'string' },
      },
      required: ['message'],
      additionalProperties: false, // Keep error details strict
    },
  },
  required: ['status', 'api_version', 'error'],
  additionalProperties: false,
};

export const getProductsOptions = {
  // 3. Assemble the full schema object
  schema: {
    querystring: getProductsQuerySchema,
    response: {
      200: getProductsResponseSchema,
      500: errorResponseSchema,
    },
  } as FastifySchema, // Cast to FastifySchema for type safety

  // 4. Attach the pre-handler and handler
  preHandler: authenticateRequest,
  handler: getProductsHandler,
};