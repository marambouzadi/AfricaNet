import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LayoutDashboard, ShoppingBag, RefreshCw, User, Settings, LogOut } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6 text-center">
              <div className="w-20 h-20 bg-[#E8EDF8] text-[#1A3FA0] rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-4">
                JD
              </div>
              <h2 className="font-bold text-[#1A1A1A] text-lg">John Doe</h2>
              <p className="text-sm text-[#6B7280]">Membre depuis 2024</p>
            </div>

            <nav className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
              <Link href="/dashboard" className="flex items-center gap-3 px-6 py-4 text-[#1A1A1A] hover:bg-[#F5F5F3] border-b border-[#E2E2DF] transition-colors">
                <LayoutDashboard className="h-5 w-5 text-[#6B7280]" />
                <span className="font-medium">Vue d'ensemble</span>
              </Link>
              <Link href="/dashboard/commandes" className="flex items-center gap-3 px-6 py-4 text-[#1A1A1A] hover:bg-[#F5F5F3] border-b border-[#E2E2DF] transition-colors">
                <ShoppingBag className="h-5 w-5 text-[#6B7280]" />
                <span className="font-medium">Mes Commandes</span>
              </Link>
              <Link href="/dashboard/reprises" className="flex items-center gap-3 px-6 py-4 text-[#1A1A1A] hover:bg-[#F5F5F3] border-b border-[#E2E2DF] transition-colors">
                <RefreshCw className="h-5 w-5 text-[#6B7280]" />
                <span className="font-medium">Mes Reprises</span>
              </Link>
              <Link href="/dashboard/profil" className="flex items-center gap-3 px-6 py-4 text-[#1A1A1A] hover:bg-[#F5F5F3] border-b border-[#E2E2DF] transition-colors">
                <User className="h-5 w-5 text-[#6B7280]" />
                <span className="font-medium">Mon Profil</span>
              </Link>
              <Link href="/dashboard/parametres" className="flex items-center gap-3 px-6 py-4 text-[#1A1A1A] hover:bg-[#F5F5F3] transition-colors">
                <Settings className="h-5 w-5 text-[#6B7280]" />
                <span className="font-medium">Paramètres</span>
              </Link>
            </nav>

            <button className="w-full flex items-center gap-3 px-6 py-4 text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl border border-[#FCA5A5] transition-colors font-medium justify-center">
              <LogOut className="h-5 w-5" />
              Se déconnecter
            </button>
          </aside>

          {/* Main Content */}
          <div className="min-w-0">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
