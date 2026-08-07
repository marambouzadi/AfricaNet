import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/checkout/',
          '/panier/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://africanet.tn/sitemap.xml',
  }
}
