'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ConditionBadge } from '@/components/shared/condition-badge'
import { LaptopSilhouette } from '@/components/shared/laptop-silhouette'
import { useCart } from '@/lib/cart-context'
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { Condition } from '@/lib/products'

export type SimpleProduct = {
  id?: number
  name: string
  slug?: string
  spec: string
  price: string
  priceNum?: number
  condition: Condition
  imageUrl?: string | null
  imageUrls?: string[]
}

function HomeProductCard({ product }: { product: SimpleProduct }) {
  const { addItem } = useCart()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const soldOut = product.condition === 'Épuisé'
  const hasLink = product.id !== undefined

  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : [])

  const cardContent = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
        <div className="absolute left-3 top-3 z-10">
          <ConditionBadge condition={product.condition} />
        </div>
        <div className="flex h-full w-full items-center justify-center p-6 relative">
          {images.length > 0 ? (
            <Image
              src={images[currentImageIndex]}
              alt={product.name}
              fill
              className="object-contain p-6 mix-blend-multiply transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <LaptopSilhouette className="h-20 w-auto text-[#1A3FA0]/25 transition-transform duration-200 group-hover:scale-105" />
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
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                {images.map((_, idx) => (
                  <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-[#1A3FA0]' : 'bg-gray-300'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-serif text-sm font-semibold leading-tight text-[#1A1A1A] group-hover:text-[#1A3FA0] transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-[#6B7280]">{product.spec}</p>
        <p className="mt-2 text-lg font-bold text-[#1A3FA0]">{product.price}</p>

        <button
          type="button"
          disabled={soldOut}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (product.id && product.priceNum) {
              addItem({ id: product.id, name: product.name, price: product.priceNum })
            }
          }}
          className="mt-3 w-full rounded-lg bg-[#1A3FA0] py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#0D2660] disabled:cursor-not-allowed disabled:bg-[#6B7280] flex items-center justify-center gap-2"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {soldOut ? 'Indisponible' : 'Ajouter au panier'}
        </button>
      </div>
    </>
  )

  if (hasLink) {
    return (
      <article className="group flex flex-col rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md">
        <Link href={`/produit/${product.id}`} className="flex flex-col flex-1">
          {cardContent}
        </Link>
      </article>
    )
  }

  return (
    <article className="group flex flex-col rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      {cardContent}
    </article>
  )
}

export function ProductSection({
  id,
  title,
  products,
  background,
  scrollOnMobile = false,
}: {
  id?: string
  title: string
  products: SimpleProduct[]
  background: 'page' | 'white'
  scrollOnMobile?: boolean
}) {
  const bg = background === 'white' ? 'bg-white' : 'bg-[#F5F5F3]'

  return (
    <section id={id} className={`${bg} py-16`}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
            {title}
          </h2>
          <Link
            href="/catalogue"
            className="text-sm font-medium text-[#1A3FA0] transition-colors duration-200 hover:text-[#0D2660]"
          >
            Voir tout →
          </Link>
        </div>

        {scrollOnMobile ? (
          <>
            <div className="mt-8 flex gap-4 overflow-x-auto pb-4 sm:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {products.map((product) => (
                <div key={product.name} className="w-56 shrink-0">
                  <HomeProductCard product={product} />
                </div>
              ))}
            </div>
            <div className="mt-8 hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <HomeProductCard key={product.name} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <HomeProductCard key={product.name} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
