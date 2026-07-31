import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ProductBreadcrumb } from '@/components/product/breadcrumb'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductInfo } from '@/components/product/product-info'
import { ProductTabs } from '@/components/product/product-tabs'
import { SimilarProducts } from '@/components/product/similar-products'
import { MobileStickyBar } from '@/components/product/mobile-sticky-bar'
import { fetchProductById } from '@/lib/api'
import { getSimilarProducts, products } from '@/lib/products'
import { notFound } from 'next/navigation'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const product = await fetchProductById(id)
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
    res = await fetchProductById(productId)
  } catch (e) {
    // Fallback to local mock product
    const localProduct = products.find(p => p.id === productId)
    if (!localProduct) {
      notFound()
    }
    // Simulate backend response structure based on local mock
    res = {
      id: localProduct.id,
      name: localProduct.name,
      condition: localProduct.condition,
      salePrice: localProduct.price,
      basePrice: localProduct.price,
      description: 'Ce produit est issu du catalogue de démonstration.',
      images: [{ imageUrl: localProduct.image, isPrimary: true }],
      specifications: [
        { specKey: 'Processeur', specValue: localProduct.cpu },
        { specKey: 'RAM', specValue: localProduct.ram },
        { specKey: 'Stockage', specValue: localProduct.storage },
      ]
    }
  }
  
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
