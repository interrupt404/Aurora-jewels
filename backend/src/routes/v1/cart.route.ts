/**
 * @file cart.route.ts
 * @description Architectural Role: Fastify v1 Route Plugin for Cart Endpoints.
 * 
 * Business Rationale:
 * Encapsulates all cart-related HTTP endpoints within the Fastify plugin system.
 * Binds the `POST /cart/validate` route to `validateCartOptions` (schema validation,
 * pre-handler authentication, and controller execution).
 */

import { FastifyInstance } from 'fastify';
import { validateCartOptions } from '../../schemas/cart.schema';

export default async function cartRoutes(fastify: FastifyInstance) {
  // Cart Batch Validation endpoint
  fastify.post('/cart/validate', validateCartOptions);
}
