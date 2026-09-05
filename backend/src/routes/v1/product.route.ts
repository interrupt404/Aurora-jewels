import { FastifyInstance } from 'fastify';
import { getProductsOptions } from '../../schemas/product.schema';

export default async function productRoutes(fastify: FastifyInstance) {
  // products list page
  fastify.get('/products', getProductsOptions);
}