import { Package, Search, Filter, Eye, Download } from 'lucide-react'

export default function OrdersPage() {
  const orders = [
    {
      id: 'AN-49201',
      date: '14 Juillet 2026',
      total: '1257 TND',
      status: 'En cours de livraison',
      statusColor: 'bg-yellow-100 text-yellow-800',
      items: 'Dell XPS 13 (Reconditionné)'
    },
    {
      id: 'AN-38192',
      date: '02 Juin 2026',
      total: '450 TND',
      status: 'Livrée',
      statusColor: 'bg-green-100 text-green-800',
      items: 'Écran Samsung 27"'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Mes Commandes</h1>
          <p className="text-[#6B7280]">Suivez et gérez l'historique de vos achats.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="pl-9 pr-4 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 w-full sm:w-64"
            />
          </div>
          <button className="p-2 border border-[#E2E2DF] rounded-lg text-[#6B7280] hover:text-[#1A1A1A] hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-[#E2E2DF] text-sm text-[#6B7280]">
                <th className="px-6 py-4 font-medium">Commande ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Articles</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2DF]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#1A1A1A]">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">{order.date}</td>
                  <td className="px-6 py-4 text-sm text-[#1A1A1A] truncate max-w-[200px]">{order.items}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#1A1A1A]">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-[#6B7280] hover:text-[#1A3FA0] transition-colors" title="Voir les détails">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-[#6B7280] hover:text-[#1A3FA0] transition-colors" title="Télécharger la facture">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
