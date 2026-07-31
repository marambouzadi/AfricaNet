'use client'

import { useState } from 'react'
import { Star, User } from 'lucide-react'
import type { ProductDetail } from '@/lib/products'

const tabs = ['Spécifications', 'État & Notes', 'Avis clients (2)']

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
              État général : Très bon
            </span>
            <p className="mt-4 text-sm leading-relaxed text-[#1A1A1A]">{product.conditionNote}</p>

            <div className="mt-6 flex flex-col gap-4">
              {product.ratings.map((r) => (
                <div key={r.label} className="flex flex-wrap items-center gap-3">
                  <span className="w-28 text-sm text-[#6B7280]">{r.label}</span>
                  <DotMeter score={r.score} />
                  <span className="text-sm font-medium text-[#1A1A1A]">{r.score}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {active === 2 && (
          <div className="rounded-xl bg-white p-6 shadow-sm flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <h3 className="font-bold text-[#1A1A1A] text-lg">Avis Récents</h3>
              
              <div className="flex gap-4 border-b border-[#E2E2DF] pb-6">
                <div className="shrink-0 size-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center font-bold">
                  JS
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#1A1A1A]">Jean S.</span>
                    <span className="text-xs text-[#1A8A4A] bg-[#1A8A4A]/10 px-2 py-0.5 rounded-full flex items-center gap-1">Achat vérifié</span>
                  </div>
                  <div className="flex text-[#F59E0B] mb-2">
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                  </div>
                  <p className="text-sm text-[#6B7280]">Produit conforme à la description, arrivé en parfait état et très bien emballé. Je recommande vivement AfricaNet !</p>
                </div>
              </div>

              <div className="flex gap-4 border-b border-[#E2E2DF] pb-6">
                <div className="shrink-0 size-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center font-bold">
                  MA
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#1A1A1A]">Marie A.</span>
                    <span className="text-xs text-[#1A8A4A] bg-[#1A8A4A]/10 px-2 py-0.5 rounded-full flex items-center gap-1">Achat vérifié</span>
                  </div>
                  <div className="flex text-[#F59E0B] mb-2">
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 fill-current" />
                    <Star className="size-4 text-[#E2E2DF] fill-current" />
                  </div>
                  <p className="text-sm text-[#6B7280]">Très bon PC, la batterie tient environ 4 heures ce qui est correct pour de l'occasion. Le service client est très réactif.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F5F3] p-6 rounded-xl border border-[#E2E2DF]">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Laissez votre avis</h3>
              <form className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Votre note</label>
                  <div className="flex gap-1 text-[#E2E2DF] hover:text-[#F59E0B] transition-colors cursor-pointer">
                    <Star className="size-6 fill-current hover:text-[#F59E0B]" />
                    <Star className="size-6 fill-current hover:text-[#F59E0B]" />
                    <Star className="size-6 fill-current hover:text-[#F59E0B]" />
                    <Star className="size-6 fill-current hover:text-[#F59E0B]" />
                    <Star className="size-6 fill-current hover:text-[#F59E0B]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Votre commentaire</label>
                  <textarea 
                    rows={4} 
                    className="w-full bg-white border border-[#E2E2DF] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                    placeholder="Qu'avez-vous pensé de ce produit ?"
                  ></textarea>
                </div>
                <button type="button" className="self-start bg-[#1A3FA0] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0D2660] transition-colors">
                  Soumettre l'avis
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
