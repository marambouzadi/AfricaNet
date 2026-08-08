'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ConditionBadge } from '@/components/shared/condition-badge'
import { LaptopSilhouette } from '@/components/shared/laptop-silhouette'
import type { SimpleProduct } from '@/components/home/product-section'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroProps {
  featuredProduct?: SimpleProduct
}

export function Hero({ featuredProduct }: HeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const images = featuredProduct?.imageUrls && featuredProduct.imageUrls.length > 0 
    ? featuredProduct.imageUrls 
    : (featuredProduct?.imageUrl ? [featuredProduct.imageUrl] : [])

  return (
    <section className="bg-white">
      <div className="mx-auto flex min-h-[400px] lg:min-h-[520px] max-w-7xl flex-col items-center gap-8 px-4 py-10 lg:flex-row lg:gap-16 lg:py-20">
        <div className="w-full lg:w-1/2">
          <h1 className="mt-5 text-balance font-serif text-4xl font-bold leading-tight text-[#1A1A1A] sm:text-5xl">
            Trouvez votre PC idéal — neuf, reconditionné ou d&apos;occasion.
          </h1>

          <p className="mt-4 max-w-md text-pretty text-lg text-[#6B7280]">
            AfricaNet vous propose une sélection rigoureuse d&apos;ordinateurs
            portables avec garantie, service de reprise, et assistance technique.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/catalogue"
              className="rounded-lg bg-[#1A3FA0] px-6 py-3 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0D2660]"
            >
              Voir le catalogue
            </Link>
            <Link
              href="/reprise"
              className="rounded-lg border border-[#1A3FA0] px-6 py-3 text-center text-sm font-medium text-[#1A3FA0] transition-colors duration-200 hover:bg-[#E8EDF8]"
            >
              Vendre mon PC
            </Link>
          </div>

          <p className="mt-4 text-xs text-[#6B7280]">
            ✓ Garantie 3 mois&nbsp;&nbsp;·&nbsp;&nbsp;✓ Testé par nos techniciens&nbsp;&nbsp;·&nbsp;&nbsp;✓ Reprise possible
          </p>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="relative flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-[#E8EDF8] overflow-hidden group">
            {images.length > 0 ? (
              <Image
                src={images[currentImageIndex]}
                alt={featuredProduct!.name}
                fill
                className="object-contain p-8 mix-blend-multiply"
                priority
              />
            ) : (
              <LaptopSilhouette className="h-40 w-auto text-[#1A3FA0]/40" />
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                
                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {images.map((_, idx) => (
                    <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-[#1A3FA0]' : 'bg-gray-300'}`} />
                  ))}
                </div>
              </>
            )}

            <Link
              href={featuredProduct ? `/produit/${featuredProduct.id}` : '/catalogue'}
              className="absolute bottom-5 left-5 rounded-xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur transition-shadow hover:shadow-md"
            >
              <div className="mb-1.5">
                <ConditionBadge condition={featuredProduct?.condition ?? 'Neuf'} />
              </div>
              <p className="font-serif text-sm font-semibold text-[#1A1A1A]">
                {featuredProduct ? featuredProduct.name : 'Voir tous nos PC'}
              </p>
              <p className="text-base font-bold text-[#1A3FA0]">
                {featuredProduct ? featuredProduct.price : 'Dès 1 180 TND'}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
