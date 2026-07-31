'use client'

import { useState } from 'react'
import { LaptopSilhouette } from '@/components/shared/laptop-silhouette'
import type { ProductDetail } from '@/lib/products'

export function ProductGallery({ product }: { product: ProductDetail }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl bg-[#F5F5F3]">
        <LaptopSilhouette className="w-1/2 max-w-[220px] text-[#1A3FA0]" />
        <p className="mt-4 font-serif text-sm font-semibold text-[#1A1A1A]">{product.name}</p>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        {product.thumbnails.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setActive(i)}
            aria-label={label}
            aria-pressed={active === i}
            className={`flex aspect-square items-center justify-center rounded-lg border-2 bg-[#F5F5F3] transition-all duration-200 ${
              active === i ? 'border-[#1A3FA0]' : 'border-transparent hover:border-[#E2E2DF]'
            }`}
          >
            <LaptopSilhouette className="w-1/2 text-[#1A3FA0]/70" />
          </button>
        ))}
      </div>
    </div>
  )
}
