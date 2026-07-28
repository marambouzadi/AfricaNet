import type { Condition } from './products'

const API_BASE_URL = 'http://localhost:8090/api'

export interface PagedResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
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
  const url = new URL(`${API_BASE_URL}/products`)
  
  if (params) {
    if (params.categoryId !== undefined) url.searchParams.append('categoryId', params.categoryId.toString())
    if (params.brandId !== undefined) url.searchParams.append('brandId', params.brandId.toString())
    if (params.condition) url.searchParams.append('condition', params.condition)
    if (params.minPrice !== undefined) url.searchParams.append('minPrice', params.minPrice.toString())
    if (params.maxPrice !== undefined) url.searchParams.append('maxPrice', params.maxPrice.toString())
    if (params.page !== undefined) url.searchParams.append('page', params.page.toString())
    if (params.size !== undefined) url.searchParams.append('size', params.size.toString())
    if (params.sort) url.searchParams.append('sort', params.sort)
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 } // Cache for 60 seconds
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`)
    }

    return await res.json()
  } catch (error) {
    console.warn('Backend unavailable, falling back to mock data:', error)
    // Dynamic import to avoid circular dependency
    const { products } = await import('./products')
    
    // Simple mock filtering
    let filtered = [...products]
    if (params?.condition) {
      filtered = filtered.filter(p => p.condition === params.condition)
    }
    
    return {
      content: filtered as any,
      pageNumber: 0,
      pageSize: 20,
      totalElements: filtered.length,
      totalPages: 1,
      last: true
    }
  }
}

export async function fetchProductById(id: number | string): Promise<ProductResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch product ${id}: ${res.statusText}`)
    }

    return await res.json()
  } catch (error) {
    console.warn(`Backend unavailable, falling back to mock data for product ${id}:`, error)
    const { getProductDetail } = await import('./products')
    // We map the local ProductDetail to ProductResponse shape
    const mock = getProductDetail(Number(id))
    return {
      id: mock.id,
      name: mock.name,
      slug: mock.name.toLowerCase().replace(/ /g, '-'),
      description: mock.conditionNote,
      shortDesc: mock.quickSpecs.map(s => s.label).join(' - '),
      brandName: mock.specs.find(s => s[0] === 'Marque')?.[1] || 'Unknown',
      categoryName: 'Laptops',
      condition: mock.condition,
      basePrice: mock.priceNum,
      salePrice: mock.priceNum,
      sku: `SKU-${mock.id}`,
      weightKg: 1.5,
      isActive: true,
      isFeatured: false,
      metaTitle: mock.name,
      metaDesc: mock.conditionNote,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      images: mock.thumbnails.map((t, i) => ({ id: i, imageUrl: '/products/laptop-gray.png', isPrimary: i === 0 })),
      specifications: mock.specs.map((s, i) => ({ id: i, specKey: s[0], specValue: s[1], sortOrder: i })),
      tags: []
    } as any
  }
}

export async function searchProducts(
  query: string, 
  page: number = 0, 
  size: number = 20
): Promise<PagedResponse<ProductResponse>> {
  const url = new URL(`${API_BASE_URL}/products/search`)
  url.searchParams.append('query', query)
  url.searchParams.append('page', page.toString())
  url.searchParams.append('size', size.toString())

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }
    })

    if (!res.ok) {
      throw new Error(`Failed to search products: ${res.statusText}`)
    }

    return await res.json()
  } catch (error) {
    console.warn('Backend unavailable, falling back to mock search:', error)
    const { products } = await import('./products')
    
    const q = query.toLowerCase()
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.brand.toLowerCase().includes(q) || 
      p.cpu.toLowerCase().includes(q)
    )
    
    return {
      content: filtered as any,
      pageNumber: page,
      pageSize: size,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size) || 1,
      last: true
    }
  }
}

export async function fetchStock(page: number = 0, size: number = 20): Promise<PagedResponse<any>> {
  const url = new URL(`${API_BASE_URL}/stock`)
  url.searchParams.append('page', page.toString())
  url.searchParams.append('size', size.toString())

  let headers: HeadersInit = {}
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) {
      headers = { 'Authorization': `Bearer ${token}` }
    }
  }

  try {
    const res = await fetch(url.toString(), {
      headers,
      cache: 'no-store'
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch stock: ${res.statusText}`)
    }

    return await res.json()
  } catch (error) {
    console.warn('Backend unavailable, falling back to empty stock data:', error)
    return {
      content: [],
      pageNumber: page,
      pageSize: size,
      totalElements: 0,
      totalPages: 1,
      last: true
    }
  }
}
