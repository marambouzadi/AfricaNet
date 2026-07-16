import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ProductBreadcrumb } from '@/components/product/breadcrumb'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { ProductTabs } from '@/components/product/product-tabs'
import { SimilarProducts } from '@/components/product/similar-products'
import { MobileStickyBar } from '@/components/product/mobile-sticky-bar'
import { fetchProductById } from '@/lib/api'
import { getSimilarProducts } from '@/lib/products'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const product = await fetchProductById(id)
    return {
      title: `${product.name} — AfricaNet`,
      description: `${product.name} ${product.condition} — ${product.salePrice || product.basePrice} TND. Garantie 3 mois AfricaNet.`,
    }
  } catch (e) {
    return { title: 'Produit — AfricaNet' }
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)
  
  // Fetch from API (will fallback to mock if backend offline)
  const res = await fetchProductById(productId)
  
  // Map backend response to local ProductDetail interface
  const product = {
    id: res.id,
    name: res.name,
    condition: res.condition as any,
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
    specs: res.specifications?.map((s: any) => [s.specKey, s.specValue]) || [],
    conditionNote: res.description,
    ratings: [
      { label: 'Écran', score: 9 },
      { label: 'Clavier', score: 8 },
      { label: 'Batterie', score: 8 },
      { label: 'Châssis', score: 7 },
      { label: 'Performances', score: 9 },
    ],
  }

  const similar = getSimilarProducts(productId)

  return (
    <div className="min-h-screen bg-[#F5F5F3]">
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
