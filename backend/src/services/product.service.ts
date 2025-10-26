// src/services/product.service.ts
import { logger } from '../utils/logger';
import { buildFindProductsPaginatedQuery } from '../queries/product.query';
import { executeQueryWithCount } from '../utils/dbHelpers';
import { ProductRow, ProductDTO } from '../types/product.types'; // Still import types

class ProductService {
  async getProducts(page: number, limit: number): Promise<{ products: ProductDTO[]; count: number }> {
    logger.info(`Service: Fetching products for page ${page}`);

    // 1. Build the query instructions
    const productQuery = buildFindProductsPaginatedQuery(page, limit);

    // 2. Execute the query to get raw data
    // The type argument <ProductRow[]> ensures 'productRows' is correctly typed.
    const [productRows, count, error] = await executeQueryWithCount<ProductRow[]>(productQuery);

    if (error) {
      // Error is logged by the executor. Propagate failure to the controller.
      throw new Error('Database query for products failed.');
    }

    // 3. Perform the transformation directly within the service
    // This provides the flexibility you need for complex scenarios.
    const formattedProducts: ProductDTO[] = (productRows || []).map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: row.price,
      thumbnailUrl: row.image_urls?.[0] || null, // Safely access the first image
    }));

    logger.info(`Service: Successfully fetched and formatted ${formattedProducts.length} products.`);
    return { products: formattedProducts, count };
  }
}

export const productService = new ProductService();