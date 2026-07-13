import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ProductBreadcrumb } from '@/components/product/breadcrumb'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { ProductTabs } from '@/components/product/product-tabs'
import { SimilarProducts } from '@/components/product/similar-products'
import { MobileStickyBar } from '@/components/product/mobile-sticky-bar'
import { getProductDetail, getSimilarProducts, products } from '@/lib/products'

// Generate static params for all known product IDs
export function generateStaticParams() {
  return products.map((p) => ({ id: String(p.id) }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = getProductDetail(Number(id))
  return {
    title: `${product.name} — AfricaNet`,
    description: `${product.name} ${product.condition} — ${product.price}. ${product.quickSpecs.map((s) => s.label).join(', ')}. Garantie 3 mois AfricaNet.`,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const productId = Number(id)
  const product = getProductDetail(productId)
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
