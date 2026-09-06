/**
 * @file cart.controller.ts
 * @description Controller Layer for Cart Batch Validation Endpoint.
 */

import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';
import { validateCart } from '../services/cart.service';

export const validateCartHandler = async (request: any, reply: any) => {
  logger.info('Controller: Handling POST /api/v1/cart/validate request.');
  const apiResponse = new ApiResponse();

  try {
    const body = request.body || { items: [] };

    // Validate basic input presence
    if (!body.items || !Array.isArray(body.items)) {
      logger.warn('Controller: Request body missing required "items" array.');
      apiResponse.failResponse.error = {
        message: 'Request body must include an "items" array.',
      };
      return reply.status(400).send(apiResponse.failResponse);
    }

    // Call service layer to perform cart batch validation
    const result = await validateCart(body);

    logger.info(`Controller: Successfully validated cart batch containing ${result.items?.length || 0} items.`);

    apiResponse.successResponse.data = result;
    apiResponse.successResponse.response = { data: result };

    return reply.status(200).send(apiResponse.successResponse);
  } catch (err: any) {
    logger.error('Controller Error: Failed to validate cart batch.', err);
    apiResponse.failResponse.error = {
      message: 'An unexpected error occurred while validating cart items.',
      details: err.message || String(err),
    };
    return reply.status(500).send(apiResponse.failResponse);
  }
};
