import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnailUrl: string;
}

async function safeFetchJson(url: string, init?: RequestInit) {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      console.warn('fetch failed', url, res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn('fetch error', url, err);
    return null;
  }
}

function extractProducts(json: any): Product[] {
  if (!json) return [];
  // The API response envelope wraps payload inside `json.response.data[0]`
  const rawData = json?.response?.data ?? json?.data;
  const target = Array.isArray(rawData) ? rawData[0] : rawData;
  return target?.products ?? (Array.isArray(target) ? target : []);
}

/** Fetch first 4 best-selling products from backend. */
export async function fetchBestSellers(): Promise<Product[]> {
  const url = new URL(API_ENDPOINTS.PRODUCTS, API_BASE_URL);
  const q = `${url.href}?page=1&limit=4&sort=best_sellers`;

  const json = await safeFetchJson(q, { next: { revalidate: 60 } });
  return extractProducts(json);
}

export async function fetchNewArrivals(): Promise<Product[]> {
  const url = new URL(API_ENDPOINTS.PRODUCTS, API_BASE_URL);
  const q = `${url.href}?page=1&limit=4&sort=newest`;

  const json = await safeFetchJson(q, { next: { revalidate: 60 } });
  return extractProducts(json);
}
