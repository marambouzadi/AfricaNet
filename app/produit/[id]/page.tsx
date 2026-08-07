import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ProductBreadcrumb } from '@/components/product/breadcrumb'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { ProductTabs } from '@/components/product/product-tabs'
import { SimilarProducts } from '@/components/product/similar-products'
import { MobileStickyBar } from '@/components/product/mobile-sticky-bar'
import { fetchProductById, fetchProducts } from '@/lib/api'
import { notFound } from 'next/navigation'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const fetchRes = await fetch(`http://localhost:8090/api/products/${id}`, { cache: 'no-store' })
    if (!fetchRes.ok) throw new Error('Not found')
    const product = await fetchRes.json()
    const title = `${product.name} — AfricaNet`
    const description = `${product.name} ${product.condition} — ${product.salePrice || product.basePrice} TND. Garantie 3 mois AfricaNet.`
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://africanet.tn/produit/${id}`,
        images: product.images?.length > 0 ? [product.images[0].url] : ['/africanet-logo.jpg'],
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
    const fetchRes = await fetch(`http://localhost:8090/api/products/${productId}`, {
      cache: 'no-store'
    })
    if (!fetchRes.ok) throw new Error('Product not found')
    res = await fetchRes.json()
  } catch (e) {
    notFound()
  }
  
  // Map backend response to local ProductDetail interface
  const condMap: Record<string, string> = {
    NEW: 'Neuf',
    REFURBISHED: 'Reconditionné',
    USED: 'Occasion',
  }

  const product = {
    id: res.id,
    name: res.name,
    condition: (condMap[res.condition] ?? res.condition) as any,
    price: `${res.salePrice || res.basePrice} TND`,
    priceNum: res.salePrice || res.basePrice,
    stock: 5, // Mocked for now since stock is in another API
    warranty: 'Garantie 3 mois AfricaNet',
    thumbnails: res.images?.length > 0 
      ? res.images.map((img: any) => img.url || img.imageUrl) 
      : ['/products/laptop-gray.png'],
    quickSpecs: res.specifications?.slice(0, 4).map((s: any) => ({
      icon: s.specKey.toLowerCase().includes('ram') ? 'ram' : 
            s.specKey.toLowerCase().includes('processeur') ? 'cpu' : 
            s.specKey.toLowerCase().includes('stockage') ? 'ssd' : 'screen',
      label: s.specValue
    })) || [],
    specs: res.specifications?.map((s: any) => [s.specKey, s.specValue] as [string, string]) || [],
    conditionNote: '',
    ratings: [
      { label: 'Écran', score: parseInt(res.specifications?.find((s:any) => s.specKey.toLowerCase() === 'écran' || s.specKey.toLowerCase() === 'ecran')?.specValue) || 0 },
      { label: 'Batterie', score: parseInt(res.specifications?.find((s:any) => s.specKey.toLowerCase() === 'batterie')?.specValue) || 0 },
      { label: 'Performances', score: parseInt(res.specifications?.find((s:any) => s.specKey.toLowerCase() === 'performances' || s.specKey.toLowerCase() === 'performance')?.specValue) || 0 },
      { label: 'Esthétique', score: parseInt(res.specifications?.find((s:any) => s.specKey.toLowerCase() === 'esthétique' || s.specKey.toLowerCase() === 'esthetique')?.specValue) || 0 },
    ].filter(r => r.score > 0),
  }

  // Fetch similar products from API
  let similar: any[] = []
  try {
    const simData = await fetchProducts({ size: 4, sort: 'viewCount,desc' })
    similar = (simData.content ?? [])
      .filter((p: any) => p.id !== productId)
      .slice(0, 4)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        spec: p.shortDesc ?? '',
        price: `${p.salePrice || p.basePrice} TND`,
        condition: (condMap[p.condition] ?? 'Neuf') as any,
      }))
  } catch { similar = [] }

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
