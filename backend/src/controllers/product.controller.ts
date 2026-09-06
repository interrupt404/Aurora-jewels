// src/controllers/product.controller.ts
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';
import { getProducts } from '../services/product.service';

export const getProductsHandler = async (request: any, reply: any) => {
  logger.info('Controller: Handling request to get products.');
  const apiResponse = new ApiResponse();

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
    } = request.query || {};

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
    const { products, count } = await getProducts(opts);

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

    apiResponse.successResponse.data = responsePayload;
    apiResponse.successResponse.response = { data: responsePayload };

    return reply.status(200).send(apiResponse.successResponse);
  } catch (err: any) {
    logger.error('Controller Error: Failed to get products.', err);
    apiResponse.failResponse.error = {
      message: 'An unexpected error occurred while fetching products.',
    };
    return reply.status(500).send(apiResponse.failResponse);
  }
};
