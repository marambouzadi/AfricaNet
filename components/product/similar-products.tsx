'use client'

import Link from 'next/link'
import { ConditionBadge } from '@/components/shared/condition-badge'
import { LaptopSilhouette } from '@/components/shared/laptop-silhouette'
import { useCart } from '@/lib/cart-context'
import type { SimilarProduct } from '@/lib/products'

function SimilarProductCard({ id, name, spec, price, condition }: SimilarProduct) {
  const { addItem } = useCart()
  const priceNum = parseInt(price.replace(/\s/g, '').replace('TND', ''), 10)

  return (
    <article className="group flex flex-col rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <Link href={`/produit/${id}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
          <div className="absolute left-3 top-3 z-10">
            <ConditionBadge condition={condition} />
          </div>
          <div className="flex h-full w-full items-center justify-center p-6">
            <LaptopSilhouette className="h-20 w-auto text-[#1A3FA0]/25 transition-transform duration-200 group-hover:scale-105" />
          </div>
        </div>
      </Link>
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
