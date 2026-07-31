type JsonLdProps = {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/** Organization + WebSite schema for the homepage */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://africanet.tn/#organization',
        name: 'AfricaNet',
        url: 'https://africanet.tn',
        logo: {
          '@type': 'ImageObject',
          url: 'https://africanet.tn/africanet-logo.jpg',
        },
        description:
          "Vente de PC portables neufs, reconditionnés et d'occasion en Tunisie avec garantie, reprise et assistance technique.",
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Tunis',
          addressCountry: 'TN',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+216-71-000-000',
          contactType: 'customer service',
          availableLanguage: ['French', 'Arabic'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://africanet.tn/#website',
        url: 'https://africanet.tn',
        name: 'AfricaNet',
        publisher: { '@id': 'https://africanet.tn/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://africanet.tn/catalogue?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return <JsonLd data={data} />
}

/** Product schema for individual product pages */
export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = 'TND',
  condition,
  availability = 'InStock',
  url,
}: {
  name: string
  description: string
  image: string
  price: number
  currency?: string
  condition: string
  availability?: string
  url: string
}) {
  const conditionMap: Record<string, string> = {
    'Neuf': 'https://schema.org/NewCondition',
    'Reconditionné': 'https://schema.org/RefurbishedCondition',
    'Occasion': 'https://schema.org/UsedCondition',
  }

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    url,
    brand: {
      '@type': 'Organization',
      name: 'AfricaNet',
    },
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      itemCondition: conditionMap[condition] || 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'AfricaNet',
      },
    },
  }

  return <JsonLd data={data} />
}

/** BreadcrumbList schema */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[]
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <JsonLd data={data} />
}
