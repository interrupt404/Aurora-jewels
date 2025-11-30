// frontend/constants/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:80' : '');

export const API_ENDPOINTS = {
  PRODUCTS: '/api/v1/products',
};
