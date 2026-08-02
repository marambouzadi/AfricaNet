import type { MetadataRoute } from 'next'

const SITE_URL = 'https://africanet.tn'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/catalogue`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/a-propos`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/reprise`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/connexion`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/inscription`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic product pages — fetch IDs from backend
  let productPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch('http://localhost:8090/api/products?size=1000', {
      next: { revalidate: 3600 }, // re-fetch every hour at most
    })
    if (res.ok) {
      const data = await res.json()
      const products = data.content || data || []
      productPages = products.map((product: { id: number; updatedAt?: string }) => ({
        url: `${SITE_URL}/produit/${product.id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch {
    // Backend not available during build — skip dynamic pages
  }

  return [...staticPages, ...productPages]
}
