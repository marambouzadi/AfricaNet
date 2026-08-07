import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Home, Search, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-xl mx-auto">
          {/* Big 404 */}
          <div className="relative mb-8 inline-block">
            <span className="text-[160px] sm:text-[200px] font-serif font-black text-[#E8EDF8] select-none leading-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white border-2 border-[#1A3FA0] rounded-2xl px-6 py-3 shadow-lg">
                <p className="text-[#1A3FA0] font-bold text-lg">Page introuvable</p>
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] mb-4">
            Oups ! Cette page n'existe pas.
          </h1>
          <p className="text-[#6B7280] mb-10 text-lg leading-relaxed">
            La page que vous cherchez a peut-être été déplacée, supprimée ou vous avez tapé une adresse incorrecte.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#1A3FA0] hover:bg-[#0D2660] text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              <Home className="h-5 w-5" />
              Retour à l'accueil
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex items-center justify-center gap-2 border border-[#1A3FA0] text-[#1A3FA0] hover:bg-[#E8EDF8] px-8 py-3 rounded-lg font-medium transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Voir le catalogue
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-14 pt-8 border-t border-[#E2E2DF]">
            <p className="text-sm text-[#6B7280] mb-4">Vous cherchez peut-être :</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: 'Catalogue', href: '/catalogue' },
                { label: 'Échange & Reprise', href: '/reprise' },
                { label: 'Contact', href: '/contact' },
                { label: 'À propos', href: '/a-propos' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#1A3FA0] hover:underline bg-white border border-[#E2E2DF] px-4 py-2 rounded-full transition-colors hover:bg-[#E8EDF8]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
