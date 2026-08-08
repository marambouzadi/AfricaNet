import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ProductBreadcrumb } from '@/components/product/breadcrumb'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { ProductTabs } from '@/components/product/product-tabs'
import { SimilarProducts } from '@/components/product/similar-products'
import { MobileStickyBar } from '@/components/product/mobile-sticky-bar'
import { fetchProductById } from '@/lib/api'
import { getSimilarProducts, conditionFromApi } from '@/lib/products'
import { notFound } from 'next/navigation'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const product = await fetchProductById(id)
    const title = `${product.name} — AfricaNet`
    const description = `${product.name} ${conditionFromApi(product.condition)} — ${product.salePrice || product.basePrice} TND. Garantie 3 mois AfricaNet.`
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://africanet.tn/produit/${id}`,
        images: product.images?.length > 0 ? [product.images[0].imageUrl] : ['/africanet-logo.jpg'],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      }
    }
  } catch (e) {
    return { title: 'Produit — AfricaNet' }
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)
  
  let res: any
  try {
    if (productId >= 10000) {
      // Fetch approved trade-in item
      const tradeInId = productId - 10000
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const tRes = await fetch(`http://localhost:8090/api/admin/trade-in?size=100`, { headers, cache: 'no-store' })
      if (!tRes.ok) notFound()
      const data = await tRes.json()
      const list = data.content || (Array.isArray(data) ? data : [])
      const item = list.find((t: any) => t.id === tradeInId)
      if (!item) notFound()

      const brandStr = item.brandName || 'Dell'
      const nameStr = item.model ? (item.model.toLowerCase().startsWith(brandStr.toLowerCase()) ? item.model : `${brandStr} ${item.model}`) : `Appareil Repris #${item.id}`
      const priceVal = Number(item.finalValue || item.estimatedValueAi || 950)

      res = {
        id: productId,
        name: nameStr,
        condition: 'REFURBISHED',
        salePrice: priceVal,
        basePrice: priceVal,
        description: `Appareil reconditionné issu du programme de reprise AfricaNet. Référence: ${item.referenceNumber}. Année: ${item.manufactureYear || 'N/A'}.`,
        images: [{ imageUrl: item.images?.[0]?.url || '/products/laptop-gray.png', isPrimary: true }],
        specifications: [
          { specKey: 'Processeur', specValue: 'Intel Core i7' },
          { specKey: 'RAM', specValue: '16 GB DDR4' },
          { specKey: 'Stockage', specValue: '512 GB SSD NVMe' },
          { specKey: 'Écran', specValue: '14 pouces Full HD' },
        ]
      }
    } else {
      res = await fetchProductById(productId)
    }
  } catch (e) {
    notFound()
  }
  
  // Map backend response to local ProductDetail interface
  const product = {
    id: res.id,
    name: res.name,
    condition: conditionFromApi(res.condition),
    price: `${res.salePrice || res.basePrice} TND`,
    priceNum: res.salePrice || res.basePrice,
    stock: 5, // Mocked for now since stock is in another API
    warranty: 'Garantie 3 mois AfricaNet',
    thumbnails: res.images?.length > 0 
      ? res.images.map((img: any) => img.imageUrl) 
      : ['/products/laptop-gray.png'],
    quickSpecs: res.specifications?.slice(0, 4).map((s: any) => ({
      icon: s.specKey.toLowerCase().includes('ram') ? 'ram' : 
            s.specKey.toLowerCase().includes('processeur') ? 'cpu' : 
            s.specKey.toLowerCase().includes('stockage') ? 'ssd' : 'screen',
      label: s.specValue
    })) || [],
    specs: res.specifications?.map((s: any) => [s.specKey, s.specValue] as [string, string]) || [],
    conditionNote: res.description || 'Appareil testé et vérifié par nos experts.',
    ratings: [
      { label: 'Écran', score: 9 },
      { label: 'Batterie', score: 8 },
      { label: 'Performances', score: 9 },
      { label: 'Esthétique', score: 7 },
    ],
  }

  const similar = getSimilarProducts(productId)

  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      <ProductJsonLd 
        name={product.name}
        description={product.conditionNote}
        image={product.thumbnails[0]}
        price={product.priceNum}
        condition={product.condition}
        url={`https://africanet.tn/produit/${productId}`}
      />
      <BreadcrumbJsonLd 
        items={[
          { name: 'Accueil', url: 'https://africanet.tn/' },
          { name: 'Catalogue', url: 'https://africanet.tn/catalogue' },
          { name: product.name, url: `https://africanet.tn/produit/${productId}` },
        ]}
      />
      <Navbar />
      <ProductBreadcrumb productName={product.name} />

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 lg:grid-cols-[55%_45%]">
          <ProductGallery product={product} />
          <ProductInfo product={product} />
        </div>
      </section>

      <ProductTabs product={product} />
      <SimilarProducts products={similar} />

      {/* Spacer so the mobile sticky bar doesn't cover the footer content */}
      <div className="h-20 md:hidden" aria-hidden="true" />
      <Footer />

      <MobileStickyBar product={product} />
    </div>
  )
}
