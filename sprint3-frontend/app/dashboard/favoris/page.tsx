'use client'

import { useState, useEffect } from 'react'
import { Heart, ShoppingBag, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { CatalogProductCard } from '@/components/catalogue/product-card'
import { conditionFromApi, type Product } from '@/lib/products'

const API_BASE = 'http://localhost:8090/api'

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
}

export default function FavorisPage() {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFavorites() {
      setLoading(true)
      const token = getToken()
      if (!token) {
        setFavoriteProducts([])
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })

        if (!res.ok) {
          setFavoriteProducts([])
          return
        }

        const data = await res.json()
        const rawList = data.content || (Array.isArray(data) ? data : [])

        const mapped: Product[] = rawList.map((item: any) => {
          const p = item.product || item
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
            condition: conditionFromApi(p.condition),
            image: p.images?.find((img: any) => img.isPrimary)?.imageUrl || '/products/laptop-gray.png',
          }
        })

        setFavoriteProducts(mapped)
      } catch (err) {
        console.error('Error fetching user favorites:', err)
        setFavoriteProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Mes Favoris</h1>
        <p className="text-[#6B7280]">Retrouvez ici les produits que vous avez sauvegardés.</p>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center text-[#1A3FA0]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map((product) => (
            <CatalogProductCard key={product.id} product={product} />
          ))}
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
