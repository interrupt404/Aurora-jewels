// src/services/product.service.ts
import { logger } from '../utils/logger';
import { buildFindProductsPaginatedQuery } from '../queries/product.query';
import { executeQueryWithCount } from '../utils/dbHelpers';
import { ProductRow, ProductDTO } from '../types/product.types';

class ProductService {
  async getProducts({
    page,
    limit,
    sort,
    q,
    category,
    min_price,
    max_price,
    metal_type,
    stone_type,
    is_featured
  }: {
    page: number;
    limit: number;
    sort?: string;
    q?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
    metal_type?: string;
    stone_type?: string;
    is_featured?: boolean;
  }): Promise<{ products: ProductDTO[]; count: number }> {

    logger.info(`Service: Fetching products | page=${page} | sort=${sort}`);

    // Build query
    const productQuery = buildFindProductsPaginatedQuery({
      page,
      limit,
      sort,
      q,
      category,
      min_price,
      max_price,
      metal_type,
      stone_type,
      is_featured
    });

    // Execute
    const [rows, count, error] = await executeQueryWithCount<ProductRow[]>(productQuery);

    if (error) {
      logger.error("Service: Product query failed", error);
      throw new Error("Database query for products failed.");
    }

    // Transform DB rows → API DTO
    const products: ProductDTO[] = (rows || []).map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      price: Number(row.price),
      thumbnailUrl: row.image_urls?.[0] ?? null,

      // New fields for the product grid
      imageUrls: row.image_urls ?? [],
      category: row.category,
      rating: Number(row.rating ?? 0),
      reviewsCount: row.reviews_count ?? 0,
      itemsSold: row.items_sold ?? 0,
      stockQuantity: row.stock_quantity ?? 0,
      isFeatured: !!row.is_featured,
      shortDescription: row.description ? row.description.slice(0, 120) : "",
    }));

    logger.info(`Service: ${products.length} products formatted successfully`);

    return { products, count };
  }
}

export const productService = new ProductService();
