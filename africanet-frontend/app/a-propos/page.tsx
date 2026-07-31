import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import Image from 'next/image'
import { ShieldCheck, Target, Heart } from 'lucide-react'

export const metadata = {
  title: 'À propos — AfricaNet',
  description: 'Découvrez l\'histoire et les valeurs d\'AfricaNet, votre partenaire informatique de confiance en Tunisie.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#1A3FA0] text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6">
              Notre Mission : Démocratiser l'Accès à la Technologie
            </h1>
            <p className="text-xl text-[#E8EDF8] max-w-2xl mx-auto">
              Depuis 2015, AfricaNet s'engage à fournir du matériel informatique de haute qualité, neuf ou reconditionné, à des prix accessibles pour tous les Tunisiens.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-4 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">L'histoire d'AfricaNet</h2>
              <p className="text-[#6B7280] leading-relaxed">
                Tout a commencé par une observation simple : le matériel informatique neuf devenait de plus en plus inabordable, tandis que des milliers d'appareils parfaitement fonctionnels étaient jetés prématurément.
              </p>
              <p className="text-[#6B7280] leading-relaxed">
                Nous avons fondé AfricaNet avec une vision claire : créer une économie circulaire pour la technologie en Tunisie. En rachetant, réparant et revendant du matériel, nous allongeons la durée de vie des produits tout en préservant le pouvoir d'achat de nos clients.
              </p>
              <p className="text-[#6B7280] leading-relaxed font-medium text-[#1A1A1A]">
                Aujourd'hui, AfricaNet c'est plus de 10 000 clients satisfaits et des tonnes de déchets électroniques évités.
              </p>
            </div>
            <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-[#E2E2DF]">
              <div className="absolute inset-0 bg-[#E8EDF8] flex items-center justify-center">
                <span className="text-[#1A3FA0] font-medium">Image de l'équipe (Placeholder)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-white py-20 px-4 border-y border-[#E2E2DF]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">Nos Valeurs</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[#E8EDF8] text-[#1A3FA0] rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">Qualité & Transparence</h3>
                <p className="text-[#6B7280]">
                  Chaque appareil d'occasion passe par plus de 30 points de contrôle. Nous sommes 100% transparents sur l'état esthétique et fonctionnel de nos produits.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[#E8EDF8] text-[#1A3FA0] rounded-full flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">Responsabilité Écologique</h3>
                <p className="text-[#6B7280]">
                  En favorisant le reconditionnement, nous participons activement à la réduction de l'empreinte carbone et des déchets électroniques.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[#E8EDF8] text-[#1A3FA0] rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">Service Client Dévoué</h3>
                <p className="text-[#6B7280]">
                  Votre satisfaction est notre priorité absolue. De l'achat jusqu'au service après-vente, notre équipe est là pour vous accompagner.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
