import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Catalog } from '@/components/catalogue/catalog'

export const metadata: Metadata = {
  title: 'Catalogue — AfricaNet',
  description:
    'Parcourez notre catalogue complet de PC portables neufs, reconditionnés et d\'occasion. Filtres par marque, prix, RAM et taille d\'écran.',
}

export default function CataloguePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E2E2DF] py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 text-sm text-[#6B7280]">
          <Link href="/" className="hover:text-[#1A3FA0] transition-colors">
            Accueil
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[#1A1A1A] font-medium">Catalogue</span>
        </div>
      </div>

      <main className="flex-1">
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 text-center text-[#6B7280]">Chargement...</div>}>
          <Catalog />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
