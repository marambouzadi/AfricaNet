'use client'

import Link from 'next/link'
import Image from 'next/image'
import { conditionStyles, formatPrice, type Product } from '@/lib/products'
import { LaptopSilhouette } from '@/components/shared/laptop-silhouette'
import { useCart } from '@/lib/cart-context'
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { addFavorite, removeFavorite } from '@/lib/api'
import { useUser } from '@/lib/user-context'

interface ProductCardProps {
  product: Product
  initialFavorited?: boolean
}

export function CatalogProductCard({ product, initialFavorited = false }: ProductCardProps) {
  const { addItem } = useCart()
  const { user } = useUser()
  const [isWishlisted, setIsWishlisted] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = product.images && product.images.length > 0 ? product.images : [product.image]

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/connexion?redirect=/catalogue'
      return
    }
    if (isLoading) return
    setIsLoading(true)
    try {
      if (isWishlisted) {
        await removeFavorite(product.id as number)
        setIsWishlisted(false)
      } else {
        await addFavorite(product.id as number)
        setIsWishlisted(true)
      }
    } catch (err) {
      console.error('Failed to update favorite:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full group">
      <Link href={`/produit/${product.id}`}>
        <div className="relative aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden">
          <span
            className={`absolute top-3 left-3 z-10 rounded-full px-3 py-1 text-xs font-semibold ${conditionStyles[product.condition]}`}
          >
            {product.condition}
          </span>
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={isLoading}
            className={`absolute top-3 right-3 z-10 rounded-full p-2 bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:scale-105 disabled:opacity-50 ${
              isWishlisted ? 'text-[#EF4444]' : 'text-[#6B7280] hover:text-[#EF4444]'
            }`}
            aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart className={`h-4 w-4 transition-all ${isWishlisted ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`} />
          </button>
          <div className="flex h-full w-full items-center justify-center p-6 relative">
            {images[currentImageIndex] && images[currentImageIndex] !== '/products/laptop-gray.png' ? (
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-contain p-6 mix-blend-multiply transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20"
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
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/produit/${product.id}`}>
          <h3 className="font-serif font-semibold text-sm leading-tight line-clamp-2 text-[#1A1A1A] hover:text-[#1A3FA0] transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-[#6B7280] mt-1">
          {product.cpu} · {product.ram} · {product.storage}
        </p>
        <div className="mt-auto pt-2">
          <p className="text-lg font-bold text-[#1A3FA0]">
            {formatPrice(product.price)}
          </p>
          <button
            type="button"
            onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: images[0] })}
            className="w-full mt-3 bg-[#1A3FA0] hover:bg-[#0D2660] text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  )
}
