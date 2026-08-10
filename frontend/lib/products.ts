export type Condition = 'Neuf' | 'Reconditionné' | 'Occasion' | 'Épuisé'

export type Product = {
  id: number
  name: string
  brand: string
  cpu: string
  ram: string
  ramValue: number
  storage: string
  screenSize: number
  price: number
  condition: Condition
  image: string
  images?: string[]
}

export const CONDITION_API_TO_FR: Record<string, Condition> = {
  NEW:         'Neuf',
  REFURBISHED: 'Reconditionné',
  USED:        'Occasion',
}

export const CONDITION_FR_TO_API: Record<string, string> = {
  Neuf:          'NEW',
  Reconditionné: 'REFURBISHED',
  Occasion:      'USED',
}

export function conditionFromApi(apiValue: string | undefined | null): Condition {
  if (!apiValue) return 'Neuf'
  return CONDITION_API_TO_FR[apiValue.toUpperCase()] ?? (apiValue as Condition)
}

export function conditionToApi(frValue: string | undefined | null): string | undefined {
  if (!frValue) return undefined
  return CONDITION_FR_TO_API[frValue] ?? frValue.toUpperCase()
}

export const conditionStyles: Record<string, string> = {
  Neuf: 'bg-[#1A8A4A] text-white',
  Reconditionné: 'bg-[#1A3FA0] text-white',
  Occasion: 'bg-[#B45309] text-white',
  Épuisé: 'bg-[#6B7280] text-white',
}

export function formatPrice(price: number): string {
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} TND`
}

// ── All products are fetched from the API (http://localhost:8090/api/products) ──
export const products: Product[] = []
export const featuredProducts: Product[] = []
export const newArrivals: Product[] = []

export const BRANDS = ['HP', 'Dell', 'Lenovo', 'Asus', 'Apple', 'Acer', 'Microsoft', 'Samsung', 'LG', 'Huawei'] as const
export const RAM_OPTIONS = [4, 8, 16, 32, 64] as const
export const SCREEN_OPTIONS = [13, 14, 15.6, 17] as const
export const CONDITION_OPTIONS: Condition[] = ['Neuf', 'Reconditionné', 'Occasion']
export const SORT_OPTIONS = [
  { value: 'pertinence', label: 'Pertinence' },
  { value: 'prix-asc', label: 'Prix croissant' },
  { value: 'prix-desc', label: 'Prix décroissant' },
  { value: 'nouveautes', label: 'Nouveautés' },
] as const

export type SortOption = typeof SORT_OPTIONS[number]['value']

export type ProductDetail = {
  id: number
  name: string
  condition: Condition
  price: string
  priceNum: number
  stock: number
  warranty: string
  thumbnails: string[]
  quickSpecs: { icon: string; label: string }[]
  specs: [string, string][]
  conditionNote: string
  ratings: { label: string; score: number }[]
}

// No mock product details — all fetched from API
export const productDetails: Record<number, ProductDetail> = {}

// Returns null if not found (page should fetch from API)
export function getProductDetail(id: number): ProductDetail | null {
  return productDetails[id] ?? null
}

export type SimilarProduct = {
  id: number
  name: string
  spec: string
  price: string
  condition: Condition
  image: string
  images?: string[]
}

// No mock similar products — caller should fetch from API
export function getSimilarProducts(currentId: number): SimilarProduct[] {
  return []
}
