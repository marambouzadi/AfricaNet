'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { products, type Product, type SortOption, type Condition, SORT_OPTIONS } from '@/lib/products'
import { CatalogProductCard } from '@/components/catalogue/product-card'
import { FiltersPanel, defaultFilters, type FilterState } from '@/components/catalogue/filters-panel'

const ITEMS_PER_PAGE = 9

export function Catalog() {
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [sort, setSort] = useState<SortOption>('pertinence')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileSort, setMobileSort] = useState(false)

  // API State
  const [loading, setLoading] = useState(false)
  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  // Filter counts state
  const [brandCounts, setBrandCounts] = useState<{ brand: string; count: number }[]>([])
  const [conditionCounts, setConditionCounts] = useState<{ condition: Condition; count: number }[]>([])

  // Fetch filter counts on mount
  useEffect(() => {
    async function fetchCounts() {
      const condMap: Record<string, Condition> = {
        NEW: 'Neuf',
        REFURBISHED: 'Reconditionné',
        USED: 'Occasion',
        // Also accept already-mapped values
        'Neuf': 'Neuf',
        'Reconditionné': 'Reconditionné',
        'Occasion': 'Occasion',
      }
      try {
        const { fetchProducts } = await import('@/lib/api')
        const res = await fetchProducts({ size: 1000 })
        const products = res.content
        
        const bCounts: Record<string, number> = {}
        const cCounts: Record<string, number> = {}
        
        products.forEach((p: any) => {
          const brand = p.brandName || 'Unknown'
          bCounts[brand] = (bCounts[brand] || 0) + 1
          
          const rawCondition = p.condition as string
          const condition = condMap[rawCondition] as Condition
          if (condition) {
            cCounts[condition] = (cCounts[condition] || 0) + 1
          }
        })
        
        setBrandCounts(Object.entries(bCounts).map(([brand, count]) => ({ brand, count })))
        setConditionCounts(Object.entries(cCounts).map(([condition, count]) => ({
          condition: condition as Condition,
          count,
        })))
      } catch (e) {
        console.warn('Failed to load counts from API, falling back to local data', e)
        const bCounts: Record<string, number> = {}
        const cCounts: Record<string, number> = {}
        
        products.forEach((p) => {
          const brand = p.brand || 'Unknown'
          bCounts[brand] = (bCounts[brand] || 0) + 1
          const condition = p.condition as Condition
          if (condition) cCounts[condition] = (cCounts[condition] || 0) + 1
        })
        
        setBrandCounts(Object.entries(bCounts).map(([brand, count]) => ({ brand, count })))
        setConditionCounts(Object.entries(cCounts).map(([condition, count]) => ({
          condition: condition as Condition,
          count,
        })))
      }
    }
    fetchCounts()
  }, [])

  // Fetch products from API
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const { fetchProducts, searchProducts } = await import('@/lib/api')
        
        let backendSort: string | undefined = undefined
        if (sort === 'prix-asc') backendSort = 'basePrice,asc'
        else if (sort === 'prix-desc') backendSort = 'basePrice,desc'
        else if (sort === 'nouveautes') backendSort = 'createdAt,desc'

        let res
        if (searchQuery) {
          res = await searchProducts(searchQuery, 0, 1000)
        } else {
          res = await fetchProducts({
            page: 0,
            size: 1000,
            // Fetch everything and filter locally to support multi-filters properly
          })
        }

        // Map ProductResponse to local Product interface
        const condMap: Record<string, Condition> = {
          NEW: 'Neuf',
          REFURBISHED: 'Reconditionné',
          USED: 'Occasion',
          'Neuf': 'Neuf',
          'Reconditionné': 'Reconditionné',
          'Occasion': 'Occasion',
        }

        let mapped: Product[] = res.content.map((p: any) => {
          if (p.price !== undefined && !p.basePrice) return p
          
          const ramSpec = p.specifications?.find((s: any) => s.specKey.toLowerCase().includes('ram'))?.specValue || '8 Go'
          const screenSpec = p.specifications?.find((s: any) => s.specKey.toLowerCase().includes('écran') || s.specKey.toLowerCase().includes('ecran'))?.specValue || '15.6'
          
          return {
            id: p.id,
            name: p.name,
            brand: p.brandName || 'Unknown',
            cpu: p.specifications?.find((s: any) => s.specKey.toLowerCase().includes('processeur'))?.specValue || 'N/A',
            ram: ramSpec,
            ramValue: parseInt(ramSpec, 10) || 8,
            storage: p.specifications?.find((s: any) => s.specKey.toLowerCase().includes('stockage'))?.specValue || '256 Go SSD',
            screenSize: parseFloat(screenSpec.replace(',', '.')) || 15.6,
            price: p.salePrice || p.basePrice || 0,
            condition: (condMap[p.condition as string] || p.condition) as Condition,
            image: p.images?.find((img: any) => img.isPrimary)?.url || p.images?.[0]?.url || '/products/laptop-gray.png',
            images: p.images?.length > 0 ? p.images.map((img: any) => img.url) : ['/products/laptop-gray.png']
          }
        })

        // Apply frontend-only filters (Price, RAM, Screen, multiple brands, conditions)
        mapped = mapped.filter((p) => p.price >= filters.priceMin && p.price <= filters.priceMax)
        if (filters.brands.length > 0) {
          mapped = mapped.filter((p) => filters.brands.includes(p.brand))
        }
        if (filters.conditions.length > 0) {
          mapped = mapped.filter((p) => filters.conditions.includes(p.condition))
        }
        if (filters.ramValues.length > 0) {
          mapped = mapped.filter((p) => filters.ramValues.includes(p.ramValue))
        }
        if (filters.screenSizes.length > 0) {
          mapped = mapped.filter((p) => filters.screenSizes.includes(p.screenSize) || filters.screenSizes.some(s => Math.abs(p.screenSize - s) < 0.5))
        }

        // Apply local sorting
        if (sort === 'prix-asc') mapped = mapped.sort((a, b) => a.price - b.price)
        else if (sort === 'prix-desc') mapped = mapped.sort((a, b) => b.price - a.price)
        else if (sort === 'nouveautes') mapped = mapped.sort((a, b) => b.id - a.id)

        setTotalElements(mapped.length)
        setTotalPages(Math.ceil(mapped.length / ITEMS_PER_PAGE))
        
        // Apply pagination locally
        mapped = mapped.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

        setPaginatedProducts(mapped)
      } catch (err: any) {
        console.warn('Failed to load products from API, falling back to local data. Reason:', err.message)
        // Fallback to local mock data
        let mapped = products
        
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          mapped = mapped.filter((p) => 
            p.name.toLowerCase().includes(q) || 
            p.brand.toLowerCase().includes(q) || 
            p.cpu.toLowerCase().includes(q)
          )
        }
        
        mapped = mapped.filter((p) => p.price >= filters.priceMin && p.price <= filters.priceMax)
        if (filters.brands.length > 0) {
          mapped = mapped.filter((p) => filters.brands.includes(p.brand))
        }
        if (filters.conditions.length > 0) {
          mapped = mapped.filter((p) => filters.conditions.includes(p.condition))
        }
        if (filters.ramValues.length > 0) {
          mapped = mapped.filter((p) => filters.ramValues.includes(p.ramValue))
        }
        if (filters.screenSizes.length > 0) {
          mapped = mapped.filter((p) => filters.screenSizes.includes(p.screenSize) || filters.screenSizes.some(s => Math.abs(p.screenSize - s) < 0.5))
        }

        // Apply sorting to local mock data
        if (sort === 'prix-asc') mapped = mapped.sort((a, b) => a.price - b.price)
        else if (sort === 'prix-desc') mapped = mapped.sort((a, b) => b.price - a.price)
        else if (sort === 'nouveautes') mapped = mapped.sort((a, b) => b.id - a.id)

        
        setPaginatedProducts(mapped.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE))
        setTotalPages(Math.ceil(mapped.length / ITEMS_PER_PAGE))
        setTotalElements(mapped.length)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [filters, sort, searchQuery, page])

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips: { label: string; key: string }[] = []
    filters.brands.forEach((b) => chips.push({ label: b, key: `brand-${b}` }))
    filters.conditions.forEach((c) => chips.push({ label: c, key: `cond-${c}` }))
    filters.ramValues.forEach((r) => chips.push({ label: `${r} Go`, key: `ram-${r}` }))
    filters.screenSizes.forEach((s) => chips.push({ label: `${s}"`, key: `screen-${s}` }))
    if (filters.priceMin > 0 || filters.priceMax < 5000) {
      chips.push({ label: `${filters.priceMin}–${filters.priceMax} TND`, key: 'price' })
    }
    if (searchQuery) {
      chips.push({ label: `"${searchQuery}"`, key: 'search' })
    }
    return chips
  }, [filters, searchQuery])

  const removeChip = useCallback(
    (key: string) => {
      if (key.startsWith('brand-')) {
        const brand = key.replace('brand-', '')
        setFilters((f) => ({ ...f, brands: f.brands.filter((b) => b !== brand) }))
      } else if (key.startsWith('cond-')) {
        const cond = key.replace('cond-', '') as Condition
        setFilters((f) => ({ ...f, conditions: f.conditions.filter((c) => c !== cond) }))
      } else if (key.startsWith('ram-')) {
        const ram = Number(key.replace('ram-', ''))
        setFilters((f) => ({ ...f, ramValues: f.ramValues.filter((r) => r !== ram) }))
      } else if (key.startsWith('screen-')) {
        const screen = Number(key.replace('screen-', ''))
        setFilters((f) => ({ ...f, screenSizes: f.screenSizes.filter((s) => s !== screen) }))
      } else if (key === 'price') {
        setFilters((f) => ({ ...f, priceMin: 0, priceMax: 5000 }))
      }
    },
    []
  )

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    setPage(1)
  }, [])

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1) // Reset to page 1 when filters change
  }, [])

  const activeFilterCount =
    filters.brands.length +
    filters.conditions.length +
    filters.ramValues.length +
    filters.screenSizes.length +
    (filters.priceMin > 0 || filters.priceMax < 5000 ? 1 : 0)

  // Page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i)
      }
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }, [page, totalPages])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block bg-white rounded-xl p-5 shadow-sm self-start sticky top-20">
          <div className="flex items-center mb-4">
            <span className="font-semibold text-[#1A1A1A]">Filtres</span>
            <button
              type="button"
              onClick={resetFilters}
              className={`text-xs cursor-pointer ml-auto transition-colors ${
                activeFilterCount > 0
                  ? 'text-[#1A3FA0] hover:underline'
                  : 'text-[#6B7280] cursor-default'
              }`}
              disabled={activeFilterCount === 0}
            >
              Réinitialiser
            </button>
          </div>
          <FiltersPanel
            filters={filters}
            onChange={handleFilterChange}
            brandCounts={brandCounts}
            conditionCounts={conditionCounts}
          />
        </aside>

        {/* Main area */}
        <div>
          {/* Mobile action bar */}
          <div className="flex md:hidden gap-3 mb-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex-1 bg-white border border-[#E2E2DF] rounded-lg py-2 text-sm flex items-center justify-center gap-2 text-[#1A1A1A]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>
            <button
              type="button"
              onClick={() => setMobileSort(true)}
              className="flex-1 bg-white border border-[#E2E2DF] rounded-lg py-2 text-sm flex items-center justify-center gap-2 text-[#1A1A1A]"
            >
              <ArrowUpDown className="h-4 w-4" />
              {SORT_OPTIONS.find((s) => s.value === sort)?.label || 'Trier par'}
            </button>
          </div>

          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
              <p className="text-sm text-[#6B7280]">
                {loading ? 'Recherche en cours...' : `${totalElements} produit${totalElements !== 1 ? 's' : ''} trouvé${totalElements !== 1 ? 's' : ''}`}
              </p>
              {activeChips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {activeChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="inline-flex items-center gap-1 bg-[#E8EDF8] text-[#1A3FA0] text-xs rounded-full px-3 py-1"
                    >
                      {chip.label}
                      <button
                        type="button"
                        onClick={() => removeChip(chip.key)}
                        aria-label={`Retirer ${chip.label}`}
                        className="hover:text-[#0D2660]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {activeChips.length > 1 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs text-[#1A3FA0] hover:underline px-1"
                    >
                      Tout effacer
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-[#6B7280]">Trier par</span>
              <select
                aria-label="Trier par"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortOption)
                  setPage(1)
                }}
                className="border border-[#E2E2DF] rounded-lg bg-white px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center border border-[#E2E2DF] rounded-lg overflow-hidden">
                <button
                  type="button"
                  aria-label="Vue grille"
                  onClick={() => setView('grid')}
                  className={`p-2 transition-colors ${view === 'grid' ? 'bg-[#1A3FA0] text-white' : 'bg-white text-[#6B7280] hover:text-[#1A1A1A]'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Vue liste"
                  onClick={() => setView('list')}
                  className={`p-2 transition-colors ${view === 'list' ? 'bg-[#1A3FA0] text-white' : 'bg-white text-[#6B7280] hover:text-[#1A1A1A]'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product grid or empty state */}
          {paginatedProducts.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-medium text-[#1A1A1A]">Aucun produit trouvé</p>
              <p className="mt-2 text-sm text-[#6B7280]">
                Essayez de modifier vos filtres ou votre recherche.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 rounded-lg bg-[#1A3FA0] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0D2660]"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {paginatedProducts.map((product) => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2">
              <button
                type="button"
                aria-label="Page précédente"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] disabled:opacity-40 hover:bg-[#F5F5F3] transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="text-[#6B7280] px-1">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm transition-colors ${
                      p === page
                        ? 'bg-[#1A3FA0] text-white'
                        : 'bg-white border border-[#E2E2DF] text-[#1A1A1A] hover:border-[#1A3FA0]'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                aria-label="Page suivante"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-[#E2E2DF] text-[#1A1A1A] disabled:opacity-40 hover:border-[#1A3FA0] transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl shadow-2xl p-6">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#E2E2DF]" />
            <div className="flex items-center mb-4">
              <span className="font-serif font-bold text-lg text-[#1A1A1A]">Filtres</span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#1A3FA0] hover:underline ml-3"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setDrawerOpen(false)}
                className="ml-auto text-[#1A1A1A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FiltersPanel
              filters={filters}
              onChange={handleFilterChange}
              brandCounts={brandCounts}
              conditionCounts={conditionCounts}
            />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="w-full mt-4 bg-[#1A3FA0] hover:bg-[#0D2660] text-white rounded-lg py-3 text-sm font-medium transition-colors"
            >
              Voir {totalElements} résultat{totalElements !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {/* Mobile sort drawer */}
      {mobileSort && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSort(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-6">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#E2E2DF]" />
            <div className="flex items-center mb-4">
              <span className="font-serif font-bold text-lg text-[#1A1A1A]">Trier par</span>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setMobileSort(false)}
                className="ml-auto text-[#1A1A1A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSort(opt.value)
                    setPage(1)
                    setMobileSort(false)
                  }}
                  className={`w-full text-left rounded-lg px-4 py-3 text-sm transition-colors ${
                    sort === opt.value
                      ? 'bg-[#E8EDF8] text-[#1A3FA0] font-medium'
                      : 'text-[#1A1A1A] hover:bg-[#F5F5F3]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
