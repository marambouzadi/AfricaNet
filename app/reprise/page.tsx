'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { MultiStepForm } from '@/components/trade-in/multi-step-form'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { CheckCircle, Zap, Shield, Leaf } from 'lucide-react'



export default function ReprisePage() {
  const router = useRouter()
  const { user, isLoading } = useUser()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/connexion?redirect=/reprise')
    }
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#1A3FA0] text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-6">
              Donnez une seconde vie à votre ancien PC
            </h1>
            <p className="text-xl text-[#E8EDF8] mb-8 max-w-2xl mx-auto">
              Obtenez une estimation immédiate grâce à notre IA. Renvoyez-le gratuitement et recevez votre paiement ou un bon d'achat sous 48h.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#D1F232]" /> Estimation en 2 min
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#D1F232]" /> Données effacées
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-[#D1F232]" /> Impact écologique positif
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-[#1A1A1A]">Comment ça marche ?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-[#E2E2DF] -z-10" />
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E2E2DF] relative">
              <div className="w-12 h-12 bg-[#D1F232] text-[#1A1A1A] font-bold text-xl rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">1</div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Estimez sa valeur</h3>
              <p className="text-[#6B7280]">Répondez à quelques questions sur l'état de votre appareil et joignez des photos.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E2E2DF] relative">
              <div className="w-12 h-12 bg-[#D1F232] text-[#1A1A1A] font-bold text-xl rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">2</div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Expédiez-le</h3>
              <p className="text-[#6B7280]">Emballez-le soigneusement et déposez-le gratuitement dans un point relais Aramex.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E2E2DF] relative">
              <div className="w-12 h-12 bg-[#D1F232] text-[#1A1A1A] font-bold text-xl rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">3</div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">Recevez votre argent</h3>
              <p className="text-[#6B7280]">Dès réception et vérification par nos experts, nous vous transférons l'argent.</p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 px-4 pb-24" id="form">
          <MultiStepForm />
        </section>

      </main>

      <Footer />
    </div>
  )
}
