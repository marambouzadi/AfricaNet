'use client'

import { useEffect, useState } from 'react'
import { Heart, ShoppingBag, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { getFavorites, removeFavorite } from '@/lib/api'
import { formatPrice } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { LaptopSilhouette } from '@/components/shared/laptop-silhouette'

export default function FavorisPage() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    async function load() {
      try {
        const data = await getFavorites()
        setFavorites(data.content || [])
      } catch (err) {
        console.error('Failed to load favorites:', err)
        setFavorites([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleRemove = async (productId: number) => {
    setRemovingId(productId)
    try {
      await removeFavorite(productId)
      setFavorites(prev => prev.filter(p => p.id !== productId))
    } catch (err) {
      console.error('Failed to remove favorite:', err)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Mes Favoris</h1>
        <p className="text-[#6B7280]">Retrouvez ici les produits que vous avez sauvegardés.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#1A3FA0]" />
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product) => {
            const price = product.salePrice || product.basePrice
            const imageUrl = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url
            const isRemoving = removingId === product.id

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group relative"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(product.id)}
                  disabled={isRemoving}
                  className="absolute top-3 right-3 z-10 rounded-full p-2 bg-white/90 backdrop-blur-sm shadow-sm text-[#EF4444] hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Retirer des favoris"
                >
                  {isRemoving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart className="h-4 w-4 fill-current" />
                  )}
                </button>

                <Link href={`/produit/${product.id}`}>
                  <div className="relative aspect-[4/3] bg-gray-100 rounded-t-xl overflow-hidden">
                    {product.condition && (
                      <span className={`absolute top-3 left-3 z-10 rounded-full px-3 py-1 text-xs font-semibold ${
                        product.condition === 'Neuf' ? 'bg-[#DCFCE7] text-[#166534]' :
                        product.condition === 'Reconditionné' ? 'bg-[#EDE9FE] text-[#6D28D9]' :
                        'bg-[#FEF9C3] text-[#92400E]'
                      }`}>
                        {product.condition}
                      </span>
                    )}
                    <div className="flex h-full w-full items-center justify-center p-6">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" />
                      ) : (
                        <LaptopSilhouette className="h-20 w-auto text-[#1A3FA0]/25 group-hover:scale-105 transition-transform duration-200" />
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
                  <p className="text-xs text-[#6B7280] mt-1">{product.brandName}</p>
                  <div className="mt-auto pt-2">
                    {product.salePrice && (
                      <p className="text-xs text-[#6B7280] line-through">{formatPrice(product.basePrice)}</p>
                    )}
                    <p className="text-lg font-bold text-[#1A3FA0]">{formatPrice(price)}</p>
                    <button
                      type="button"
                      onClick={() => addItem({ id: product.id, name: product.name, price })}
                      className="w-full mt-3 bg-[#1A3FA0] hover:bg-[#0D2660] text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-[#F5F5F3] rounded-full flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-[#6B7280]" />
          </div>
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-2">Aucun favori pour le moment</h2>
          <p className="text-[#6B7280] mb-6 max-w-md mx-auto">
            Explorez notre catalogue et cliquez sur le cœur pour sauvegarder les articles qui vous intéressent.
          </p>
          <Link
            href="/catalogue"
            className="inline-flex items-center gap-2 bg-[#1A3FA0] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0D2660] transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            Parcourir le catalogue
          </Link>
        </div>
      )}
    </div>
  )
}
