import axios from 'axios'
import type { Condition } from './products'

const API_BASE_URL = 'http://localhost:8081/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // Check if running on client-side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add a response interceptor for token refresh (optional for later)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can handle 401 Unauthorized globally here
    return Promise.reject(error)
  }
)

// --- Types ---

export interface PagedResponse<T> {
  content: T[]
  pageable: any
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: any
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface ProductImageResponse {
  id: number
  imageUrl: string
  isPrimary: boolean
}

export interface ProductSpecResponse {
  id: number
  specKey: string
  specValue: string
  sortOrder: number
}

export interface ProductResponse {
  id: number
  name: string
  slug: string
  description: string
  shortDesc: string
  brandName: string
  categoryName: string
  condition: Condition
  basePrice: number
  salePrice: number
  sku: string
  weightKg: number
  isActive: boolean
  isFeatured: boolean
  metaTitle: string
  metaDesc: string
  viewCount: number
  createdAt: string
  updatedAt: string
  images: ProductImageResponse[]
  specifications: ProductSpecResponse[]
  tags: string[]
}

// --- Product API ---

export async function fetchProducts(params?: {
  categoryId?: number
  brandId?: number
  condition?: Condition
  minPrice?: number
  maxPrice?: number
  page?: number
  size?: number
  sort?: string
}): Promise<PagedResponse<ProductResponse>> {
  const { data } = await api.get('/products', { params })
  return data
}

export async function fetchProductById(id: number | string): Promise<ProductResponse> {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export async function searchProducts(
  query: string, 
  page: number = 0, 
  size: number = 20
): Promise<PagedResponse<ProductResponse>> {
  const { data } = await api.get('/products/search', {
    params: { query, page, size }
  })
  return data
}

// --- Auth API ---
export async function login(credentials: any) {
  const { data } = await api.post('/auth/login', credentials)
  return data
}

export async function register(userData: any) {
  const { data } = await api.post('/auth/register', userData)
  return data
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me')
  return data
}

export async function updateCurrentUser(profileData: any) {
  const { data } = await api.patch('/auth/me', profileData)
  return data
}

// --- Address API ---
export async function getUserAddresses() {
  const { data } = await api.get('/addresses')
  return data
}

export async function createAddress(addressData: any) {
  const { data } = await api.post('/addresses', addressData)
  return data
}

export async function deleteAddress(id: number) {
  await api.delete(`/addresses/${id}`)
}

// --- Order API ---
export async function createOrder(orderData: any) {
  const { data } = await api.post('/orders', orderData)
  return data
}

export async function getUserOrders() {
  const { data } = await api.get('/orders/me')
  return data
}

export async function getOrderById(orderId: number) {
  const { data } = await api.get(`/orders/${orderId}`)
  return data
}

export async function downloadInvoice(orderId: number): Promise<Blob> {
  const response = await api.get(`/orders/${orderId}/invoice`, {
    responseType: 'blob',
  })
  return response.data
}

// --- TradeIn API ---
export async function evaluateTradeIn(tradeInData: any) {
  const { data } = await api.post('/trade-in/evaluate', tradeInData)
  return data
}

export async function submitTradeIn(tradeInData: any) {
  const { data } = await api.post('/trade-in', tradeInData)
  return data
}

export async function getUserTradeIns(): Promise<any> {
  const { data } = await api.get('/trade-in/my')
  return data
}

export async function getTradeInsByUserId(userId: number) {
  const { data } = await api.get(`/trade-in/user/${userId}`)
  return data
}

// --- Payments API ---
export async function initiateFlouciPayment(orderId: number) {
  const { data } = await api.post(`/payments/flouci/initiate?orderId=${orderId}`)
  return data
}

export async function verifyFlouciPayment(tx: string) {
  const { data } = await api.get(`/payments/flouci/verify?tx=${tx}`)
  return data
}

// --- AI Recommendations API ---
export async function getRecommendations(userId: number, limit: number = 5) {
  const { data } = await api.get(`/recommendations/user/${userId}`, { params: { limit } })
  return data
}

export async function trackRecommendationClick(id: number) {
  await api.put(`/recommendations/${id}/click`)
}
