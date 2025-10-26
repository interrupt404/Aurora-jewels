// src/types/product.types.ts

/**
 * Represents the raw data shape directly from the 'products' database table.
 */
export interface ProductRow {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_urls: string[];
  }
  
  /**
   * Represents the final, formatted product shape for the API response.
   * This is a Data Transfer Object (DTO).
   */
  export interface ProductDTO {
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbnailUrl: string | null;
  }