import { FastifyInstance } from 'fastify';
import { getProductsOptions } from '../../schemas/product.schema';

export default async function productRoutes(fastify: FastifyInstance) {
  fastify.get('/products', getProductsOptions);
}