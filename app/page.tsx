import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/home/hero'
import { ValueProps } from '@/components/home/value-props'
import { ProductSection } from '@/components/home/product-section'
import { WhyChoose } from '@/components/home/why-choose'
import type { SimpleProduct } from '@/components/home/product-section'

const FEATURED: SimpleProduct[] = [
  { id: 1, name: 'HP EliteBook 840 G8', spec: 'i5-1135G7 / 8 Go / 256 Go SSD', price: '1 250 TND', priceNum: 1250, condition: 'Reconditionné' },
  { id: 2, name: 'Dell Latitude 5420', spec: 'i7-1165G7 / 16 Go / 512 Go SSD', price: '1 890 TND', priceNum: 1890, condition: 'Reconditionné' },
  { id: 3, name: 'Lenovo ThinkPad T14', spec: 'i5-10210U / 8 Go / 256 Go SSD', price: '980 TND', priceNum: 980, condition: 'Occasion' },
  { id: 4, name: 'HP 15s-fq2', spec: 'i3-1115G4 / 8 Go / 256 Go SSD', price: '799 TND', priceNum: 799, condition: 'Neuf' },
]

const NEW_ARRIVALS: SimpleProduct[] = [
  { id: 5, name: 'Asus VivoBook 15', spec: 'Ryzen 5 5500U / 8 Go / 512 Go', price: '920 TND', priceNum: 920, condition: 'Neuf' },
  { id: 6, name: 'Dell Inspiron 15 3520', spec: 'i5-1235U / 12 Go / 512 Go SSD', price: '1 050 TND', priceNum: 1050, condition: 'Neuf' },
  { id: 7, name: 'Lenovo IdeaPad 5', spec: 'i7-1165G7 / 16 Go / 512 Go SSD', price: '1 450 TND', priceNum: 1450, condition: 'Reconditionné' },
  { id: 8, name: 'HP ProBook 450 G8', spec: 'i5-1135G7 / 8 Go / 256 Go SSD', price: '1 100 TND', priceNum: 1100, condition: 'Reconditionné' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      <Navbar />
      <main>
        <Hero />
        <ValueProps />
        <ProductSection
          id="catalogue"
          title="Produits Vedettes"
          products={FEATURED}
          background="page"
        />
        <ProductSection
          title="Nouveautés"
          products={NEW_ARRIVALS}
          background="white"
          scrollOnMobile
        />
        <WhyChoose />
      </main>
      <Footer />
    </div>
  )
}
