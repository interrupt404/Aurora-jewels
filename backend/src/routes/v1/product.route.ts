import { FastifyInstance } from 'fastify';
import { getProductsOptions } from '../../schemas/product.schema';

export default async function productRoutes(fastify: FastifyInstance) {
  // ✅ ADD THIS LINE FOR DEBUGGING
  console.log('--- Registering /products route ---');

  fastify.get('/products', getProductsOptions);
}