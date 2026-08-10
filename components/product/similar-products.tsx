'use client'

import Link from 'next/link'
import { ConditionBadge } from '@/components/shared/condition-badge'
import { LaptopSilhouette } from '@/components/shared/laptop-silhouette'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import type { SimilarProduct } from '@/lib/products'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function SimilarProductCard({ id, name, spec, price, condition, image, images }: SimilarProduct) {
  const { addItem } = useCart()
  const priceNum = parseInt(price.replace(/\s/g, '').replace('TND', ''), 10)
  const [activeImg, setActiveImg] = useState(0)
  const displayImages = images?.length ? images : (image ? [image] : [])

  return (
    <article className="group flex flex-col rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-[#F5F5F3]">
        <Link href={`/produit/${id}`} className="absolute inset-0 z-0">
          <div className="flex h-full w-full items-center justify-center p-6">
            {displayImages.length > 0 ? (
              <Image src={displayImages[activeImg]} alt={name} fill className="object-cover transition-transform duration-200 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
            ) : (
              <LaptopSilhouette className="h-20 w-auto text-[#1A3FA0]/25 transition-transform duration-200 group-hover:scale-105" />
            )}
          </div>
        </Link>
        <div className="absolute left-3 top-3 z-10 pointer-events-none">
          <ConditionBadge condition={condition} />
        </div>
        
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveImg((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveImg((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {displayImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setActiveImg(i)
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === activeImg ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Aller à l'image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/produit/${id}`}>
          <h3 className="line-clamp-2 font-serif text-sm font-semibold leading-tight text-[#1A1A1A] hover:text-[#1A3FA0] transition-colors">
            {name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-[#6B7280]">{spec}</p>
        <div className="mt-auto pt-2">
          <p className="text-lg font-bold text-[#1A3FA0]">{price}</p>
          <button
            type="button"
            onClick={() => addItem({ id, name, price: priceNum })}
            className="mt-3 w-full rounded-lg bg-[#1A3FA0] py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0D2660]"
          >
            Ajouter au panier
          </button>
        </div>
      </div>
    </article>
  )
}

export function SimilarProducts({ products }: { products: SimilarProduct[] }) {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Produits similaires</h2>
          <Link
            href="/catalogue"
            className="text-sm font-medium text-[#1A3FA0] transition-colors duration-200 hover:text-[#0D2660]"
          >
            Voir tout →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <SimilarProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  )
}
