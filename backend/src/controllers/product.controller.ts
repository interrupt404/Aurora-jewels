// src/controllers/product.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { sendSuccess, sendError } from '../utils/response'; // CORRECTED: Import path
import { productService } from '../services/product.service';

interface GetProductsQuery {
  page?: string;
  limit?: string;
}

export async function getProductsHandler(
  request: FastifyRequest<{ Querystring: GetProductsQuery }>,
  reply: FastifyReply
) {
  logger.info('Controller: Handling request to get products.');
  try {
    const { page = '1', limit = '9' } = request.query;
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    // 1. Call the service to get the fully prepared data
    const { products, count } = await productService.getProducts(parsedPage, parsedLimit);

    // 2. The controller's only job is to assemble the final payload.
    //    No re-formatting is needed because the service has already done it.
    const totalItems = count;
    const totalPages = Math.ceil(totalItems / parsedLimit);

    const responsePayload = {
      products: products, // CORRECTED: Use the 'products' from the service directly
      pagination: {
        currentPage: parsedPage,
        totalPages: totalPages,
        totalItems: totalItems,
      },
    };

    logger.info(`Controller: Successfully processed request for ${products?.length || 0} products.`);
    return sendSuccess(reply, responsePayload);

  } catch (err: any) {
    logger.error('Controller Error: Failed to get products.', err);
    return sendError(reply, 'An unexpected error occurred while fetching products.');
  }
}