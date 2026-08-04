export type Condition = 'Neuf' | 'Reconditionné' | 'Occasion' | 'Épuisé'

// ── Condition mapping : Backend (Java enum) ↔ Frontend (French UI) ─────────
// Backend sends: 'NEW', 'REFURBISHED', 'USED'
// Frontend shows: 'Neuf', 'Reconditionné', 'Occasion'

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

/** Converts an API condition string (e.g. 'NEW') to French label (e.g. 'Neuf'). */
export function conditionFromApi(apiValue: string | undefined | null): Condition {
  if (!apiValue) return 'Neuf'
  return CONDITION_API_TO_FR[apiValue.toUpperCase()] ?? (apiValue as Condition)
}

/** Converts a French label (e.g. 'Reconditionné') to the API enum string (e.g. 'REFURBISHED'). */
export function conditionToApi(frValue: string | undefined | null): string | undefined {
  if (!frValue) return undefined
  return CONDITION_FR_TO_API[frValue] ?? frValue.toUpperCase()
}

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
}

export const conditionStyles: Record<string, string> = {
  // French labels
  Neuf:          'bg-[#1A8A4A] text-white',
  Reconditionné: 'bg-[#1A3FA0] text-white',
  Occasion:      'bg-[#B45309] text-white',
  Épuisé:        'bg-[#6B7280] text-white',
  // English API values (fallback)
  NEW:           'bg-[#1A8A4A] text-white',
  REFURBISHED:   'bg-[#1A3FA0] text-white',
  USED:          'bg-[#B45309] text-white',
}

export function formatPrice(price: number): string {
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} TND`
}

export const products: Product[] = [
  {
    id: 1,
    name: 'HP EliteBook 840 G8',
    brand: 'HP',
    cpu: 'i5-1135G7',
    ram: '8 Go',
    ramValue: 8,
    storage: '256 Go SSD',
    screenSize: 14,
    price: 1250,
    condition: 'Reconditionné',
    image: '/products/laptop-business-silver.png',
  },
  {
    id: 2,
    name: 'Dell Latitude 5420',
    brand: 'Dell',
    cpu: 'i7-1165G7',
    ram: '16 Go',
    ramValue: 16,
    storage: '512 Go SSD',
    screenSize: 14,
    price: 1890,
    condition: 'Reconditionné',
    image: '/products/laptop-black.png',
  },
  {
    id: 3,
    name: 'Lenovo ThinkPad T14',
    brand: 'Lenovo',
    cpu: 'i5-10210U',
    ram: '8 Go',
    ramValue: 8,
    storage: '256 Go SSD',
    screenSize: 14,
    price: 980,
    condition: 'Occasion',
    image: '/products/laptop-black.png',
  },
  {
    id: 4,
    name: 'HP 15s-fq2',
    brand: 'HP',
    cpu: 'i3-1115G4',
    ram: '8 Go',
    ramValue: 8,
    storage: '256 Go SSD',
    screenSize: 15.6,
    price: 799,
    condition: 'Neuf',
    image: '/products/laptop-business-silver.png',
  },
  {
    id: 5,
    name: 'Asus VivoBook 15',
    brand: 'Asus',
    cpu: 'Ryzen 5 5500U',
    ram: '8 Go',
    ramValue: 8,
    storage: '512 Go SSD',
    screenSize: 15.6,
    price: 920,
    condition: 'Neuf',
    image: '/products/laptop-gray.png',
  },
  {
    id: 6,
    name: 'Dell Inspiron 15 3520',
    brand: 'Dell',
    cpu: 'i5-1235U',
    ram: '12 Go',
    ramValue: 12,
    storage: '512 Go SSD',
    screenSize: 15.6,
    price: 1050,
    condition: 'Neuf',
    image: '/products/laptop-business-silver.png',
  },
  {
    id: 7,
    name: 'Lenovo IdeaPad 5',
    brand: 'Lenovo',
    cpu: 'i7-1165G7',
    ram: '16 Go',
    ramValue: 16,
    storage: '512 Go SSD',
    screenSize: 15.6,
    price: 1450,
    condition: 'Reconditionné',
    image: '/products/laptop-gray.png',
  },
  {
    id: 8,
    name: 'HP ProBook 450 G8',
    brand: 'HP',
    cpu: 'i5-1135G7',
    ram: '8 Go',
    ramValue: 8,
    storage: '256 Go SSD',
    screenSize: 15.6,
    price: 1100,
    condition: 'Reconditionné',
    image: '/products/laptop-business-silver.png',
  },
  {
    id: 9,
    name: 'Acer Aspire 5',
    brand: 'Acer',
    cpu: 'Ryzen 7 5700U',
    ram: '16 Go',
    ramValue: 16,
    storage: '512 Go SSD',
    screenSize: 15.6,
    price: 1200,
    condition: 'Neuf',
    image: '/products/laptop-gray.png',
  },
  {
    id: 10,
    name: 'Apple MacBook Air M1',
    brand: 'Apple',
    cpu: 'Apple M1',
    ram: '8 Go',
    ramValue: 8,
    storage: '256 Go SSD',
    screenSize: 13,
    price: 2890,
    condition: 'Reconditionné',
    image: '/products/laptop-gray.png',
  },
  {
    id: 11,
    name: 'HP Pavilion 14',
    brand: 'HP',
    cpu: 'i5-1235U',
    ram: '8 Go',
    ramValue: 8,
    storage: '512 Go SSD',
    screenSize: 14,
    price: 1350,
    condition: 'Neuf',
    image: '/products/laptop-business-silver.png',
  },
  {
    id: 12,
    name: 'Dell Vostro 15 3510',
    brand: 'Dell',
    cpu: 'i3-1115G4',
    ram: '4 Go',
    ramValue: 4,
    storage: '256 Go SSD',
    screenSize: 15.6,
    price: 650,
    condition: 'Occasion',
    image: '/products/laptop-black.png',
  },
  {
    id: 13,
    name: 'Lenovo ThinkPad X1 Carbon',
    brand: 'Lenovo',
    cpu: 'i7-1165G7',
    ram: '16 Go',
    ramValue: 16,
    storage: '512 Go SSD',
    screenSize: 14,
    price: 2200,
    condition: 'Reconditionné',
    image: '/products/laptop-black.png',
  },
  {
    id: 14,
    name: 'Acer Nitro 5',
    brand: 'Acer',
    cpu: 'i5-12500H',
    ram: '16 Go',
    ramValue: 16,
    storage: '512 Go SSD',
    screenSize: 15.6,
    price: 1750,
    condition: 'Neuf',
    image: '/products/laptop-gray.png',
  },
  {
    id: 15,
    name: 'Asus ZenBook 14',
    brand: 'Asus',
    cpu: 'i7-1260P',
    ram: '16 Go',
    ramValue: 16,
    storage: '512 Go SSD',
    screenSize: 14,
    price: 1950,
    condition: 'Neuf',
    image: '/products/laptop-gray.png',
  },
  {
    id: 16,
    name: 'HP EliteBook 850 G7',
    brand: 'HP',
    cpu: 'i7-10710U',
    ram: '16 Go',
    ramValue: 16,
    storage: '512 Go SSD',
    screenSize: 15.6,
    price: 1550,
    condition: 'Reconditionné',
    image: '/products/laptop-business-silver.png',
  },
  {
    id: 17,
    name: 'Dell Latitude 7420',
    brand: 'Dell',
    cpu: 'i5-1145G7',
    ram: '16 Go',
    ramValue: 16,
    storage: '512 Go SSD',
    screenSize: 14,
    price: 1450,
    condition: 'Reconditionné',
    image: '/products/laptop-black.png',
  },
  {
    id: 18,
    name: 'Lenovo IdeaPad Slim 3',
    brand: 'Lenovo',
    cpu: 'Ryzen 3 7320U',
    ram: '4 Go',
    ramValue: 4,
    storage: '256 Go SSD',
    screenSize: 15.6,
    price: 580,
    condition: 'Neuf',
    image: '/products/laptop-gray.png',
  },
  {
    id: 19,
    name: 'Apple MacBook Pro 13 M2',
    brand: 'Apple',
    cpu: 'Apple M2',
    ram: '8 Go',
    ramValue: 8,
    storage: '256 Go SSD',
    screenSize: 13,
    price: 3450,
    condition: 'Neuf',
    image: '/products/laptop-gray.png',
  },
  {
    id: 20,
    name: 'HP ProBook 640 G5',
    brand: 'HP',
    cpu: 'i5-8365U',
    ram: '8 Go',
    ramValue: 8,
    storage: '256 Go SSD',
    screenSize: 14,
    price: 750,
    condition: 'Occasion',
    image: '/products/laptop-business-silver.png',
  },
  {
    id: 21,
    name: 'Acer Swift 3',
    brand: 'Acer',
    cpu: 'i5-1135G7',
    ram: '8 Go',
    ramValue: 8,
    storage: '512 Go SSD',
    screenSize: 14,
    price: 1080,
    condition: 'Reconditionné',
    image: '/products/laptop-gray.png',
  },
  {
    id: 22,
    name: 'Asus TUF Gaming F17',
    brand: 'Asus',
    cpu: 'i5-11400H',
    ram: '16 Go',
    ramValue: 16,
    storage: '512 Go SSD',
    screenSize: 17,
    price: 1680,
    condition: 'Occasion',
    image: '/products/laptop-gray.png',
  },
  {
    id: 23,
    name: 'Dell Latitude 5410',
    brand: 'Dell',
    cpu: 'i5-10310U',
    ram: '8 Go',
    ramValue: 8,
    storage: '256 Go SSD',
    screenSize: 14,
    price: 850,
    condition: 'Occasion',
    image: '/products/laptop-black.png',
  },
  {
    id: 24,
    name: 'Lenovo V15 G3',
    brand: 'Lenovo',
    cpu: 'Ryzen 5 5625U',
    ram: '8 Go',
    ramValue: 8,
    storage: '256 Go SSD',
    screenSize: 15.6,
    price: 890,
    condition: 'Neuf',
    image: '/products/laptop-gray.png',
  },
]

export const BRANDS = ['HP', 'Dell', 'Lenovo', 'Asus', 'Apple', 'Acer'] as const
export const RAM_OPTIONS = [4, 8, 16, 32] as const
export const SCREEN_OPTIONS = [13, 14, 15.6, 17] as const
export const CONDITION_OPTIONS: Condition[] = ['Neuf', 'Reconditionné', 'Occasion']
export const SORT_OPTIONS = [
  { value: 'pertinence', label: 'Pertinence' },
  { value: 'prix-asc', label: 'Prix croissant' },
  { value: 'prix-desc', label: 'Prix décroissant' },
  { value: 'nouveautes', label: 'Nouveautés' },
] as const

export type SortOption = typeof SORT_OPTIONS[number]['value']

export const featuredProducts = products.slice(0, 4)
export const newArrivals = products.slice(4, 8)

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

export const productDetails: Record<number, ProductDetail> = {
  1: {
    id: 1,
    name: 'HP EliteBook 840 G8',
    condition: 'Reconditionné',
    price: '1 250 TND',
    priceNum: 1250,
    stock: 3,
    warranty: 'Garantie 3 mois AfricaNet',
    thumbnails: ['Vue de face', 'Clavier', 'Ports latéraux', 'Profil fermé'],
    quickSpecs: [
      { icon: 'cpu', label: 'Intel Core i5-1135G7' },
      { icon: 'ram', label: '8 Go DDR4' },
      { icon: 'ssd', label: '256 Go NVMe SSD' },
      { icon: 'screen', label: '14" Full HD IPS' },
    ],
    specs: [
      ['Processeur', 'Intel Core i5-1135G7 (4 cœurs, jusqu\'à 4.2 GHz)'],
      ['Mémoire RAM', '8 Go DDR4 3200 MHz'],
      ['Stockage', '256 Go NVMe SSD'],
      ['Carte graphique', 'Intel Iris Xe Graphics'],
      ['Écran', '14" Full HD IPS — 1920 × 1080 px — antireflet'],
      ['Système', 'Windows 11 Pro (licence originale)'],
      ['Connectique', 'USB-C / USB-A × 2 / HDMI / RJ45 / jack 3.5mm'],
      ['Autonomie', '~6 heures (batterie remplacée)'],
      ['Poids', '1.44 kg'],
    ],
    conditionNote:
      'Appareil inspecté et reconditionné par nos techniciens. État général : très bon. Légères traces d\'usage sur le repose-poignets. Écran sans rayures. Batterie remplacée — autonomie restaurée.',
    ratings: [
      { label: 'Écran', score: 9 },
      { label: 'Clavier', score: 9 },
      { label: 'Batterie', score: 8 },
      { label: 'Châssis', score: 7 },
      { label: 'Performances', score: 9 },
    ],
  },
  2: {
    id: 2,
    name: 'Dell Latitude 5420',
    condition: 'Reconditionné',
    price: '1 890 TND',
    priceNum: 1890,
    stock: 2,
    warranty: 'Garantie 3 mois AfricaNet',
    thumbnails: ['Vue de face', 'Clavier', 'Ports latéraux', 'Profil fermé'],
    quickSpecs: [
      { icon: 'cpu', label: 'Intel Core i7-1165G7' },
      { icon: 'ram', label: '16 Go DDR4' },
      { icon: 'ssd', label: '512 Go NVMe SSD' },
      { icon: 'screen', label: '14" Full HD IPS' },
    ],
    specs: [
      ['Processeur', 'Intel Core i7-1165G7 (4 cœurs, jusqu\'à 4.7 GHz)'],
      ['Mémoire RAM', '16 Go DDR4 3200 MHz'],
      ['Stockage', '512 Go NVMe SSD'],
      ['Carte graphique', 'Intel Iris Xe Graphics'],
      ['Écran', '14" Full HD IPS — 1920 × 1080 px — antireflet'],
      ['Système', 'Windows 11 Pro (licence originale)'],
      ['Connectique', 'USB-C / USB-A × 2 / HDMI / RJ45 / jack 3.5mm'],
      ['Autonomie', '~7 heures'],
      ['Poids', '1.4 kg'],
    ],
    conditionNote:
      'Reconditionné grade A. Très bon état général, micro-rayures sur le châssis. Écran impeccable. Batterie en très bon état.',
    ratings: [
      { label: 'Écran', score: 9 },
      { label: 'Clavier', score: 8 },
      { label: 'Batterie', score: 9 },
      { label: 'Châssis', score: 8 },
      { label: 'Performances', score: 9 },
    ],
  },
}

// Generate detail from catalog product for unknown IDs
export function getProductDetail(id: number): ProductDetail {
  if (productDetails[id]) return productDetails[id]
  
  const product = products.find((p) => p.id === id)
  if (!product) return productDetails[1]
  
  return {
    id: product.id,
    name: product.name,
    condition: product.condition,
    price: formatPrice(product.price),
    priceNum: product.price,
    stock: Math.floor(Math.random() * 5) + 1,
    warranty: 'Garantie 3 mois AfricaNet',
    thumbnails: ['Vue de face', 'Clavier', 'Ports latéraux', 'Profil fermé'],
    quickSpecs: [
      { icon: 'cpu', label: product.cpu },
      { icon: 'ram', label: `${product.ram} DDR4` },
      { icon: 'ssd', label: product.storage },
      { icon: 'screen', label: `${product.screenSize}" Full HD` },
    ],
    specs: [
      ['Processeur', product.cpu],
      ['Mémoire RAM', product.ram],
      ['Stockage', product.storage],
      ['Écran', `${product.screenSize}" Full HD`],
      ['Marque', product.brand],
      ['État', product.condition],
    ],
    conditionNote:
      product.condition === 'Neuf'
        ? 'Produit neuf sous emballage d\'origine. Garantie constructeur.'
        : product.condition === 'Reconditionné'
        ? 'Appareil inspecté et reconditionné par nos techniciens. État général : très bon.'
        : 'Appareil d\'occasion vérifié par nos techniciens. État fonctionnel garanti.',
    ratings: [
      { label: 'Écran', score: 8 },
      { label: 'Clavier', score: 8 },
      { label: 'Batterie', score: 7 },
      { label: 'Châssis', score: 7 },
      { label: 'Performances', score: 8 },
    ],
  }
}

export type SimilarProduct = {
  id: number
  name: string
  spec: string
  price: string
  condition: Condition
}

export function getSimilarProducts(currentId: number): SimilarProduct[] {
  return products
    .filter((p) => p.id !== currentId)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.name,
      spec: `${p.cpu} · ${p.ram} · ${p.storage} · ${p.screenSize}"`,
      price: formatPrice(p.price),
      condition: p.condition,
    }))
}
