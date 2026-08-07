'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProductDetail } from '@/lib/products'
import { LaptopSilhouette } from '@/components/shared/laptop-silhouette'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ProductGallery({ product }: { product: ProductDetail }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl bg-[#F5F5F3] relative overflow-hidden group">
        {product.thumbnails && product.thumbnails[active] && product.thumbnails[active] !== '/products/laptop-gray.png' ? (
          <Image
            src={product.thumbnails[active]}
            alt={`${product.name} - Image ${active + 1}`}
            fill
            className="object-contain p-8 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <>
            <LaptopSilhouette className="w-1/2 max-w-[220px] text-[#1A3FA0]/30 transition-transform duration-300 group-hover:scale-105" />
            <p className="mt-4 font-serif text-sm font-semibold text-[#1A1A1A] z-10">{product.name}</p>
          </>
        )}

        {product.thumbnails && product.thumbnails.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setActive((prev) => (prev === 0 ? product.thumbnails.length - 1 : prev - 1))
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setActive((prev) => (prev === product.thumbnails.length - 1 ? 0 : prev + 1))
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {product.thumbnails && product.thumbnails.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {product.thumbnails.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Voir l'image ${i + 1}`}
              aria-pressed={active === i}
              className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-2 bg-[#F5F5F3] transition-all duration-200 ${
                active === i ? 'border-[#1A3FA0]' : 'border-transparent hover:border-[#E2E2DF]'
              }`}
            >
              {url !== '/products/laptop-gray.png' ? (
                <Image
                  src={url}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-contain p-2 mix-blend-multiply"
                  sizes="(max-width: 768px) 25vw, 12vw"
                />
              ) : (
                <LaptopSilhouette className="w-1/2 text-[#1A3FA0]/30" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
