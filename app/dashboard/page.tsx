import Link from 'next/link'
import { Package, RefreshCw, Star, ArrowRight, Clock } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Bienvenue, John !</h1>
      <p className="text-[#6B7280]">Voici un aperçu de vos activités récentes sur AfricaNet.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-[#E2E2DF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-[#1A3FA0]">
            <Package className="h-6 w-6" />
            <h3 className="font-bold text-[#1A1A1A]">Commandes</h3>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A]">2</p>
          <p className="text-sm text-[#6B7280] mt-1">1 en cours de livraison</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E2DF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-[#F59E0B]">
            <RefreshCw className="h-6 w-6" />
            <h3 className="font-bold text-[#1A1A1A]">Reprises</h3>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A]">1</p>
          <p className="text-sm text-[#6B7280] mt-1">Estimation en attente</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E2DF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-[#10B981]">
            <Star className="h-6 w-6" />
            <h3 className="font-bold text-[#1A1A1A]">Fidélité</h3>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A]">450</p>
          <p className="text-sm text-[#6B7280] mt-1">Points accumulés</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden mt-8">
        <div className="p-6 border-b border-[#E2E2DF] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Activité Récente</h2>
          <Link href="/dashboard/commandes" className="text-sm text-[#1A3FA0] font-medium hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="divide-y divide-[#E2E2DF]">
          {/* Order Item */}
          <div className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-[#1A1A1A]">Commande #AN-49201</p>
                <p className="text-sm text-[#6B7280]">Dell XPS 13 (Reconditionné)</p>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3" /> En cours de livraison
              </span>
              <p className="text-sm text-[#6B7280]">Il y a 2 jours</p>
            </div>
          </div>

          {/* Trade-in Item */}
          <div className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-[#1A1A1A]">Reprise #TR-8472</p>
                <p className="text-sm text-[#6B7280]">MacBook Pro 2019</p>
              </div>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Clock className="h-3 w-3" /> Estimation IA en cours
              </span>
              <p className="text-sm text-[#6B7280]">Hier</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
