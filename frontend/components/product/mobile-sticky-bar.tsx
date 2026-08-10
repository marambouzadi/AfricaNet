'use client'

import { useCart } from '@/lib/cart-context'
import type { ProductDetail } from '@/lib/products'

export function MobileStickyBar({ product }: { product: ProductDetail }) {
  const { addItem } = useCart()

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-[#E2E2DF] bg-white px-4 py-3 shadow-lg md:hidden">
      <span className="text-xl font-bold text-[#1A3FA0]">{product.price}</span>
      <button
        type="button"
        onClick={() => addItem({ id: product.id, name: product.name, price: product.priceNum, image: product.thumbnails?.[0] })}
        className="rounded-lg bg-[#1A3FA0] px-6 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-[#0D2660]"
      >
        Ajouter au panier
      </button>
    </div>
  )
}
