'use client'

import { useState } from 'react'
import { Star, User } from 'lucide-react'
import type { ProductDetail } from '@/lib/products'

const tabs = ['Spécifications', 'État & Notes']

function DotMeter({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={`size-3 rounded-full ${i < score ? 'bg-[#1A3FA0]' : 'bg-[#E2E2DF]'}`}
        />
      ))}
    </div>
  )
}

export function ProductTabs({ product }: { product: ProductDetail }) {
  const [active, setActive] = useState(0)

  return (
    <section className="bg-[#F5F5F3]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8 flex gap-6 overflow-x-auto border-b border-[#E2E2DF]">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(i)}
              className={`whitespace-nowrap pb-3 text-sm transition-colors duration-200 ${
                active === i
                  ? 'border-b-2 border-[#1A3FA0] font-medium text-[#1A3FA0]'
                  : 'text-[#6B7280] hover:text-[#1A1A1A]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {active === 0 && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {product.specs.map(([name, value], i) => (
              <div
                key={name}
                className={`grid grid-cols-1 gap-1 px-5 py-3 sm:grid-cols-3 ${
                  i % 2 === 1 ? 'bg-[#F5F5F3]' : 'bg-white'
                }`}
              >
                <span className="text-sm text-[#6B7280]">{name}</span>
                <span className="text-sm font-medium text-[#1A1A1A] sm:col-span-2">{value}</span>
              </div>
            ))}
          </div>
        )}

        {active === 1 && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <span className="inline-block rounded-full bg-[#E8EDF8] px-3 py-1 text-sm font-semibold text-[#1A3FA0]">
              État général : {product.condition}
            </span>

            {product.ratings.length > 0 ? (
              <div className="mt-6 flex flex-col gap-4">
              {product.ratings.map((r) => (
                <div key={r.label} className="flex flex-wrap items-center gap-3">
                  <span className="w-28 text-sm text-[#6B7280]">{r.label}</span>
                  <DotMeter score={r.score} />
                  <span className="text-sm font-medium text-[#1A1A1A]">{r.score}/10</span>
                </div>
              ))}
            </div>
            ) : (
              <p className="mt-6 text-sm text-[#6B7280]">Les notes techniques ne sont pas encore disponibles pour ce produit.</p>
            )}
          </div>
        )}


      </div>
    </section>
  )
}
