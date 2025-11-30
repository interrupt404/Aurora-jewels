export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    thumbnailUrl: string;
  }
  
  /**
   * Fetch first 4 best‑selling products from backend.
   */
  export async function fetchBestSellers(): Promise<Product[]> {
    const res = await fetch("http://localhost:80/api/v1/products?page=1&limit=4&sort=best_sellers", {
      next: { revalidate: 60 }, // ISR: cache for 60 seconds (optional in Next 14)
    });
  
    if (!res.ok) {
      throw new Error("Failed to fetch best sellers");
    }
  
    const json = await res.json();
    return json?.data?.products ?? [];
  }

  export async function fetchNewArrivals(): Promise<Product[]> {
    const res = await fetch("http://localhost:80/api/v1/products?page=1&limit=4&sort=newest", {
      next: { revalidate: 60 }, // ISR: cache for 60 seconds (optional in Next 14)
    });
  
    if (!res.ok) {
      throw new Error("Failed to fetch new arrivals");
    }
  
    const json = await res.json();
    return json?.data?.products ?? [];
  }