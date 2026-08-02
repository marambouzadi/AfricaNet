import { Heart, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { CatalogProductCard } from '@/components/catalogue/product-card'
import { products } from '@/lib/products'

export const metadata = {
  title: 'Mes Favoris — AfricaNet',
}

export default function FavorisPage() {
  // Simulate having a few favorited products
  const favoriteProducts = products.slice(0, 3)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Mes Favoris</h1>
        <p className="text-[#6B7280]">Retrouvez ici les produits que vous avez sauvegardés.</p>
      </div>

      {favoriteProducts.length > 0 ? (
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
