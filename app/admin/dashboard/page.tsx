import { TrendingUp, Users, ShoppingCart, DollarSign, Package, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/products'

export const metadata = {
  title: 'Dashboard Admin — AfricaNet',
}

const stats = [
  { name: 'Chiffre d\'affaires', value: 45231.50, change: '+12.5%', trend: 'up', icon: DollarSign },
  { name: 'Commandes (Mois)', value: 124, change: '+5.2%', trend: 'up', icon: ShoppingCart },
  { name: 'Nouveaux Clients', value: 48, change: '-2.1%', trend: 'down', icon: Users },
  { name: 'Demandes Reprise', value: 12, change: '+15.0%', trend: 'up', icon: Package },
]

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Tableau de bord</h1>
        <p className="text-[#6B7280]">Vue d'ensemble des performances de votre boutique AfricaNet.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E2DF]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#E8EDF8] text-[#1A3FA0] rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6" />
              </div>
              <span className={`text-sm font-bold flex items-center gap-1 px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'text-[#1A8A4A] bg-[#1A8A4A]/10' : 'text-[#EF4444] bg-[#EF4444]/10'
              }`}>
                {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingUp className="h-3 w-3 rotate-180" />}
                {stat.change}
              </span>
            </div>
            <h3 className="text-[#6B7280] text-sm font-medium">{stat.name}</h3>
            <p className="text-2xl font-bold text-[#1A1A1A] mt-1">
              {stat.name === 'Chiffre d\'affaires' ? formatPrice(stat.value) : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Dernières commandes</h2>
            <a href="/admin/commandes" className="text-sm font-medium text-[#1A3FA0] hover:underline">Voir tout</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#6B7280]">
              <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Commande</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3 rounded-r-lg">Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E2E2DF]">
                  <td className="px-4 py-4 font-medium text-[#1A1A1A]">#AN-492019</td>
                  <td className="px-4 py-4">Sami Trabelsi</td>
                  <td className="px-4 py-4">Aujourd'hui, 10:45</td>
                  <td className="px-4 py-4 font-bold text-[#1A1A1A]">2 450,00 TND</td>
                  <td className="px-4 py-4"><span className="bg-[#FEF9C3] text-[#A16207] px-2 py-1 rounded-full text-xs font-semibold">En attente</span></td>
                </tr>
                <tr className="border-b border-[#E2E2DF]">
                  <td className="px-4 py-4 font-medium text-[#1A1A1A]">#AN-492018</td>
                  <td className="px-4 py-4">Amira Ben Ali</td>
                  <td className="px-4 py-4">Hier, 15:30</td>
                  <td className="px-4 py-4 font-bold text-[#1A1A1A]">1 200,00 TND</td>
                  <td className="px-4 py-4"><span className="bg-[#DCFCE7] text-[#166534] px-2 py-1 rounded-full text-xs font-semibold">Payé</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-4 font-medium text-[#1A1A1A]">#AN-492017</td>
                  <td className="px-4 py-4">Youssef Mansour</td>
                  <td className="px-4 py-4">25 Juil 2025</td>
                  <td className="px-4 py-4 font-bold text-[#1A1A1A]">3 100,00 TND</td>
                  <td className="px-4 py-4"><span className="bg-[#DBEAFE] text-[#1E40AF] px-2 py-1 rounded-full text-xs font-semibold">Expédié</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts / Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Alertes Stock</h2>
            <a href="/admin/stock" className="text-sm font-medium text-[#1A3FA0] hover:underline">Gérer</a>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5]">
              <AlertCircle className="h-5 w-5 text-[#EF4444] shrink-0" />
              <div>
                <h4 className="font-bold text-[#991B1B] text-sm">Rupture de stock imminente</h4>
                <p className="text-xs text-[#B91C1C] mt-1">Dell XPS 13 Plus (Neuf) : Plus que 2 unités disponibles.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
              <AlertCircle className="h-5 w-5 text-[#F59E0B] shrink-0" />
              <div>
                <h4 className="font-bold text-[#92400E] text-sm">Niveau bas</h4>
                <p className="text-xs text-[#B45309] mt-1">Lenovo ThinkPad T14 (Reconditionné) : 4 unités restantes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
