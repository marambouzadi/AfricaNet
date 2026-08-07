'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/home/hero'
import { ValueProps } from '@/components/home/value-props'
import { ProductSection } from '@/components/home/product-section'
import { WhyChoose } from '@/components/home/why-choose'
import { OrganizationJsonLd } from '@/components/seo/json-ld'
import { fetchProducts } from '@/lib/api'
import type { SimpleProduct } from '@/components/home/product-section'

function mapApiProduct(p: any): SimpleProduct {
  const image = p.images?.find((i: any) => i.isPrimary) ?? p.images?.[0]
  const condMap: Record<string, string> = {
    NEW: 'Neuf',
    REFURBISHED: 'Reconditionné',
    USED: 'Occasion',
  }
  const price = p.salePrice ?? p.basePrice ?? 0
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    spec: p.shortDesc ?? p.description?.slice(0, 80) ?? '',
    price: `${Number(price).toLocaleString('fr-TN')} TND`,
    priceNum: Number(price),
    condition: (condMap[p.condition] ?? 'Neuf') as any,
    imageUrl: image?.url ?? image?.imageUrl ?? null,
    imageUrls: p.images?.map((i: any) => i.url ?? i.imageUrl) ?? []
  }
}

export default function HomePage() {
  const [featured, setFeatured] = useState<SimpleProduct[]>([])
  const [newest, setNewest] = useState<SimpleProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [featuredData, newestData] = await Promise.all([
          fetchProducts({ size: 4, sort: 'viewCount,desc' }),
          fetchProducts({ size: 4, sort: 'createdAt,desc' }),
        ])
        setFeatured((featuredData.content ?? []).map(mapApiProduct))
        setNewest((newestData.content ?? []).map(mapApiProduct))
      } catch (e) {
        console.error('Failed to load homepage products', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      <Navbar />
      <main>
        <OrganizationJsonLd />
        <Hero featuredProduct={featured[0]} />
        <ValueProps />
        {!loading && featured.length > 0 && (
          <ProductSection
            id="catalogue"
            title="Produits Vedettes"
            products={featured}
            background="page"
          />
        )}
        {!loading && newest.length > 0 && (
          <ProductSection
            title="Nouveautés"
            products={newest}
            background="white"
            scrollOnMobile
          />
        )}
        <WhyChoose />
      </main>
      <Footer />
    </div>
  )
}
