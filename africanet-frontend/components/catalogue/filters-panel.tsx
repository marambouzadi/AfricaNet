'use client'

import { type Condition, conditionStyles, BRANDS, RAM_OPTIONS, SCREEN_OPTIONS, CONDITION_OPTIONS } from '@/lib/products'

export type FilterState = {
  brands: string[]
  conditions: Condition[]
  priceMin: number
  priceMax: number
  ramValues: number[]
  screenSizes: number[]
}

export const defaultFilters: FilterState = {
  brands: [],
  conditions: [],
  priceMin: 0,
  priceMax: 5000,
  ramValues: [],
  screenSizes: [],
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-wider text-[#6B7280] mb-3">
      {children}
    </p>
  )
}

// brand counts from productlist
type BrandCount = { brand: string; count: number }
type ConditionCount = { condition: Condition; count: number }

export function FiltersPanel({
  filters,
  onChange,
  brandCounts,
  conditionCounts,
}: {
  filters: FilterState
  onChange: (filters: FilterState) => void
  brandCounts: BrandCount[]
  conditionCounts: ConditionCount[]
}) {
  const toggleBrand = (brand: string) => {
    const brands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand]
    onChange({ ...filters, brands })
  }

  const toggleCondition = (condition: Condition) => {
    const conditions = filters.conditions.includes(condition)
      ? filters.conditions.filter((c) => c !== condition)
      : [...filters.conditions, condition]
    onChange({ ...filters, conditions })
  }

  const toggleRam = (ram: number) => {
    const ramValues = filters.ramValues.includes(ram)
      ? filters.ramValues.filter((r) => r !== ram)
      : [...filters.ramValues, ram]
    onChange({ ...filters, ramValues })
  }

  const toggleScreen = (screen: number) => {
    const screenSizes = filters.screenSizes.includes(screen)
      ? filters.screenSizes.filter((s) => s !== screen)
      : [...filters.screenSizes, screen]
    onChange({ ...filters, screenSizes })
  }

  return (
    <div>
      {/* Brand */}
      <div className="border-b border-[#E2E2DF] pb-4 mb-4">
        <GroupLabel>Marque</GroupLabel>
        <div className="grid grid-cols-1">
          {BRANDS.map((brand) => {
            const count = brandCounts.find((b) => b.brand === brand)?.count ?? 0
            return (
              <label key={brand} className="flex items-center gap-2 py-1 cursor-pointer text-sm text-[#1A1A1A]">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="accent-[#1A3FA0] h-4 w-4 rounded"
                />
                <span>{brand}</span>
                <span className="text-[#6B7280]">({count})</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Condition */}
      <div className="border-b border-[#E2E2DF] pb-4 mb-4">
        <GroupLabel>État</GroupLabel>
        <div className="flex flex-col gap-2">
          {CONDITION_OPTIONS.map((condition) => {
            const count = conditionCounts.find((c) => c.condition === condition)?.count ?? 0
            return (
              <label key={condition} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.conditions.includes(condition)}
                  onChange={() => toggleCondition(condition)}
                  className="accent-[#1A3FA0] h-4 w-4 rounded"
                />
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${conditionStyles[condition]}`}>
                  {condition}
                </span>
                <span className="text-sm text-[#6B7280]">({count})</span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Price */}
      <div className="border-b border-[#E2E2DF] pb-4 mb-4">
        <GroupLabel>Prix (TND)</GroupLabel>
        <p className="text-sm font-medium text-[#1A3FA0] mb-3">
          {filters.priceMin} TND — {filters.priceMax} TND
        </p>
        <div className="relative h-1.5 rounded-full bg-[#E8EDF8] mb-4">
          <div
            className="absolute h-1.5 rounded-full bg-[#1A3FA0]"
            style={{
              left: `${(filters.priceMin / 5000) * 100}%`,
              right: `${100 - (filters.priceMax / 5000) * 100}%`,
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.priceMin}
            onChange={(e) => onChange({ ...filters, priceMin: Math.max(0, Number(e.target.value)) })}
            aria-label="Prix minimum"
            min={0}
            max={filters.priceMax}
            className="w-full border border-[#E2E2DF] rounded-lg px-2 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          />
          <span className="text-[#6B7280]">—</span>
          <input
            type="number"
            value={filters.priceMax}
            onChange={(e) => onChange({ ...filters, priceMax: Math.max(filters.priceMin, Number(e.target.value)) })}
            aria-label="Prix maximum"
            min={filters.priceMin}
            className="w-full border border-[#E2E2DF] rounded-lg px-2 py-1.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          />
        </div>
      </div>

      {/* RAM */}
      <div className="border-b border-[#E2E2DF] pb-4 mb-4">
        <GroupLabel>Mémoire RAM</GroupLabel>
        <div className="grid grid-cols-2">
          {RAM_OPTIONS.map((ram) => (
            <label key={ram} className="flex items-center gap-2 py-1 cursor-pointer text-sm text-[#1A1A1A]">
              <input
                type="checkbox"
                checked={filters.ramValues.includes(ram)}
                onChange={() => toggleRam(ram)}
                className="accent-[#1A3FA0] h-4 w-4 rounded"
              />
              <span>{ram} Go</span>
            </label>
          ))}
        </div>
      </div>

      {/* Screen size */}
      <div className="pb-4 mb-4">
        <GroupLabel>Taille écran</GroupLabel>
        <div className="grid grid-cols-2">
          {SCREEN_OPTIONS.map((size) => (
            <label key={size} className="flex items-center gap-2 py-1 cursor-pointer text-sm text-[#1A1A1A]">
              <input
                type="checkbox"
                checked={filters.screenSizes.includes(size)}
                onChange={() => toggleScreen(size)}
                className="accent-[#1A3FA0] h-4 w-4 rounded"
              />
              <span>{size}&quot;</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
