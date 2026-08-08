'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/home/hero'
import { ValueProps } from '@/components/home/value-props'
import { ProductSection, type SimpleProduct } from '@/components/home/product-section'
import { WhyChoose } from '@/components/home/why-choose'
import { OrganizationJsonLd } from '@/components/seo/json-ld'
import { conditionFromApi } from '@/lib/products'

const API_BASE = 'http://localhost:8090/api'

export default function HomePage() {
  const [featured, setFeatured] = useState<SimpleProduct[]>([])
  const [newArrivals, setNewArrivals] = useState<SimpleProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHomeProducts() {
      try {
        const [prodRes, tradeInRes] = await Promise.allSettled([
          fetch(`${API_BASE}/products?size=50`, { cache: 'no-store' }),
          fetch(`${API_BASE}/admin/trade-in?size=50`, { cache: 'no-store' }),
        ])

        let products: any[] = []
        let tradeIns: any[] = []

        if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
          const data = await prodRes.value.json()
          products = data.content || (Array.isArray(data) ? data : [])
        }

        if (tradeInRes.status === 'fulfilled' && tradeInRes.value.ok) {
          const data = await tradeInRes.value.json()
          tradeIns = data.content || (Array.isArray(data) ? data : [])
        }

        // Map DB products
        const mappedProducts: SimpleProduct[] = products.map((p) => {
          const ram = p.specifications?.find((s: any) => s.specKey.toLowerCase().includes('ram'))?.specValue || '8 Go'
          const cpu = p.specifications?.find((s: any) => s.specKey.toLowerCase().includes('processeur'))?.specValue || ''
          const ssd = p.specifications?.find((s: any) => s.specKey.toLowerCase().includes('stockage'))?.specValue || '256 Go SSD'
          const priceVal = Number(p.salePrice || p.basePrice || 0)

          return {
            id: p.id,
            name: p.name,
            spec: cpu ? `${cpu} / ${ram} / ${ssd}` : `${p.brandName || 'PC'} · ${ram} · ${ssd}`,
            price: `${priceVal.toLocaleString('fr-FR')} TND`,
            priceNum: priceVal,
            condition: conditionFromApi(p.condition),
          }
        })

        // Map approved trade-in items
        const approvedTradeIns: SimpleProduct[] = tradeIns
          .filter((t: any) => t.status === 'APPROVED' || t.status === 'COMPLETED')
          .map((t: any) => {
            const priceVal = Number(t.finalValue || t.estimatedValueAi || 950)
            const brandStr = t.brandName || 'Dell'
            const fullName = t.model ? (t.model.toLowerCase().startsWith(brandStr.toLowerCase()) ? t.model : `${brandStr} ${t.model}`) : `Appareil Repris #${t.id}`

            return {
              id: 10000 + t.id,
              name: fullName,
              spec: `Intel Core i7 / 16 Go / 512 Go SSD`,
              price: `${priceVal.toLocaleString('fr-FR')} TND`,
              priceNum: priceVal,
              condition: 'Reconditionné' as const,
            }
          })

        // Combine DB products with approved trade-ins avoiding name duplicates
        const existingNames = new Set(mappedProducts.map((p) => p.name.toLowerCase()))
        const combined = [...mappedProducts]
        approvedTradeIns.forEach((tp) => {
          if (!existingNames.has(tp.name.toLowerCase())) {
            combined.push(tp)
          }
        })

        setFeatured(combined.slice(0, 4))
        setNewArrivals(combined.slice(4, 12).length > 0 ? combined.slice(4, 12) : combined.slice(0, 4))
      } catch (err) {
        console.error('Failed to load homepage products:', err)
      } finally {
        setLoading(false)
      }
    }

    loadHomeProducts()
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      <Navbar />
      <main>
        <OrganizationJsonLd />
        <Hero />
        <ValueProps />
        <ProductSection
          id="catalogue"
          title="Produits Vedettes"
          products={featured}
          background="page"
        />
        <ProductSection
          title="Nouveautés"
          products={newArrivals}
          background="white"
          scrollOnMobile
        />
        <WhyChoose />
      </main>
      <Footer />
    </div>
  )
}
