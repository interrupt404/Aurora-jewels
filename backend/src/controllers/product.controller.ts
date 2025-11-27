// src/controllers/product.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { sendSuccess, sendError } from '../utils/response';
import { productService } from '../services/product.service';

interface GetProductsQuery {
  page?: string;
  limit?: string;
  sort?: string;
  q?: string;
  category?: string;
  min_price?: string;
  max_price?: string;
  metal_type?: string;
  stone_type?: string;
  is_featured?: string; // "true" | "false"
}

export async function getProductsHandler(
  request: FastifyRequest<{ Querystring: GetProductsQuery }>,
  reply: FastifyReply
) {
  logger.info('Controller: Handling request to get products.');

  try {
    const {
      page = '1',
      limit = '12',
      sort,
      q,
      category,
      min_price,
      max_price,
      metal_type,
      stone_type,
      is_featured,
    } = request.query;

    const parsedPage = Number.parseInt(page, 10) || 1;
    const parsedLimit = Number.parseInt(limit, 10) || 12;

    const opts = {
      page: parsedPage,
      limit: parsedLimit,
      sort,
      q,
      category,
      min_price: min_price ? Number(min_price) : undefined,
      max_price: max_price ? Number(max_price) : undefined,
      metal_type,
      stone_type,
      is_featured:
        is_featured === 'true' ? true : is_featured === 'false' ? false : undefined,
    };

    // Call service with the options object
    const { products, count } = await productService.getProducts(opts);

    const totalItems = count ?? 0;
    const perPage = parsedLimit;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    const responsePayload = {
      products,
      pagination: {
        currentPage: parsedPage,
        perPage,
        totalPages,
        totalItems,
      },
    };

    logger.info(
      `Controller: Successfully processed request for ${products?.length || 0} products.`
    );
    return sendSuccess(reply, responsePayload);
  } catch (err: any) {
    logger.error('Controller Error: Failed to get products.', err);
    return sendError(reply, 'An unexpected error occurred while fetching products.');
  }
}
