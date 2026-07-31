'use client'

import { useState } from 'react'
import { Cpu, MemoryStick, HardDrive, Monitor, Minus, Plus, ShieldCheck, Truck, Heart } from 'lucide-react'
import { conditionStyles, type ProductDetail } from '@/lib/products'
import { useCart } from '@/lib/cart-context'

const specIcons: Record<string, typeof Cpu> = {
  cpu: Cpu,
  ram: MemoryStick,
  ssd: HardDrive,
  screen: Monitor,
}

export function ProductInfo({ product }: { product: ProductDetail }) {
  const [qty, setQty] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem(
      { id: product.id, name: product.name, price: product.priceNum },
      qty
    )
    setQty(1)
  }

  return (
    <div>
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${conditionStyles[product.condition]}`}
      >
        {product.condition}
      </span>

      <h1 className="mt-2 font-serif text-2xl font-bold leading-snug text-[#1A1A1A] text-balance">
        {product.name}
        <span className="block text-lg font-semibold text-[#6B7280]">
          {product.quickSpecs.map((s) => s.label).join(' / ')}
        </span>
      </h1>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-[#1A3FA0]">{product.price}</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-[#1A8A4A]" aria-hidden="true" />
        <span className="text-sm font-medium text-[#1A8A4A]">
          En stock — {product.stock} unité{product.stock > 1 ? 's' : ''} disponible{product.stock > 1 ? 's' : ''}
        </span>
      </div>

      <div className="my-5 border-t border-[#E2E2DF]" />

      <div className="grid grid-cols-2 gap-3">
        {product.quickSpecs.map((spec) => {
          const Icon = specIcons[spec.icon]
          return (
            <div
              key={spec.label}
              className="flex items-center gap-2 rounded-lg bg-[#F5F5F3] px-3 py-2"
            >
              {Icon && <Icon className="size-4 shrink-0 text-[#1A3FA0]" />}
              <span className="text-xs font-medium text-[#1A1A1A]">{spec.label}</span>
            </div>
          )
        })}
      </div>

      <div className="my-5 border-t border-[#E2E2DF]" />

      <div className="mt-4 flex items-center gap-4">
        <span className="text-sm text-[#1A1A1A]">Quantité</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex size-9 items-center justify-center rounded-lg border border-[#E2E2DF] text-[#1A1A1A] transition-colors duration-200 hover:border-[#1A3FA0] disabled:opacity-40"
            disabled={qty <= 1}
            aria-label="Diminuer la quantité"
          >
            <Minus className="size-4" />
          </button>
          <span className="flex h-9 w-9 items-center justify-center text-sm font-medium text-[#1A1A1A]">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="flex size-9 items-center justify-center rounded-lg border border-[#E2E2DF] text-[#1A1A1A] transition-colors duration-200 hover:border-[#1A3FA0] disabled:opacity-40"
            disabled={qty >= product.stock}
            aria-label="Augmenter la quantité"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 rounded-lg bg-[#1A3FA0] py-3 font-medium text-white transition-colors duration-200 hover:bg-[#0D2660]"
        >
          Ajouter au panier
        </button>
        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`flex h-[48px] w-[48px] items-center justify-center rounded-lg border transition-colors duration-200 ${
            isWishlisted
              ? 'border-[#EF4444] text-[#EF4444] bg-[#FEF2F2]'
              : 'border-[#E2E2DF] text-[#6B7280] hover:border-[#EF4444] hover:text-[#EF4444]'
          }`}
          aria-label="Ajouter aux favoris"
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-xs text-[#6B7280] sm:flex-row sm:gap-5">
        <span className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#1A3FA0]" /> Garantie 3 mois AfricaNet incluse
        </span>
        <span className="flex items-center gap-2">
          <Truck className="size-4 text-[#1A3FA0]" /> Livraison disponible sur Tunis
        </span>
      </div>
    </div>
  )
}
