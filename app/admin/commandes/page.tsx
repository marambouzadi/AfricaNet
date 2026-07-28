'use client'

import { useState } from 'react'
import { Search, Filter, Eye, Truck, CheckCircle2, Clock, XCircle, ShoppingBag, X } from 'lucide-react'
import { formatPrice } from '@/lib/products'

interface OrderItem {
  id: string
  orderNumber: string
  clientName: string
  clientEmail: string
  clientPhone: string
  date: string
  total: number
  paymentMethod: 'Flouci / Carte' | 'Paiement à la livraison'
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  items: { name: string; qty: number; price: number }[]
}

const initialOrders: OrderItem[] = [
  {
    id: '1',
    orderNumber: 'AN-492019',
    clientName: 'Sami Trabelsi',
    clientEmail: 'sami.trabelsi@gmail.com',
    clientPhone: '+216 98 123 456',
    date: '28 Juil 2026, 10:45',
    total: 2450,
    paymentMethod: 'Flouci / Carte',
    status: 'PENDING',
    items: [{ name: 'Dell XPS 13 9310', qty: 1, price: 2450 }]
  },
  {
    id: '2',
    orderNumber: 'AN-492018',
    clientName: 'Amira Ben Ali',
    clientEmail: 'amira.ba@yahoo.fr',
    clientPhone: '+216 55 987 654',
    date: '27 Juil 2026, 15:30',
    total: 1200,
    paymentMethod: 'Paiement à la livraison',
    status: 'CONFIRMED',
    items: [{ name: 'Lenovo ThinkPad T14', qty: 1, price: 1200 }]
  },
  {
    id: '3',
    orderNumber: 'AN-492017',
    clientName: 'Youssef Mansour',
    clientEmail: 'ymansour@outlook.com',
    clientPhone: '+216 22 333 444',
    date: '25 Juil 2026, 09:12',
    total: 3100,
    paymentMethod: 'Flouci / Carte',
    status: 'SHIPPED',
    items: [{ name: 'MacBook Pro 14 M1', qty: 1, price: 3100 }]
  },
  {
    id: '4',
    orderNumber: 'AN-492016',
    clientName: 'Nadia Gharbi',
    clientEmail: 'nadia.g@gmail.com',
    clientPhone: '+216 99 888 777',
    date: '24 Juil 2026, 18:20',
    total: 3490,
    paymentMethod: 'Paiement à la livraison',
    status: 'DELIVERED',
    items: [{ name: 'HP Spectre x360', qty: 1, price: 3490 }]
  }
]

const statusBadges: Record<string, { label: string; style: string }> = {
  PENDING: { label: 'En attente', style: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmée', style: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'En préparation', style: 'bg-indigo-100 text-indigo-800' },
  SHIPPED: { label: 'Expédiée', style: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Livrée', style: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Annulée', style: 'bg-red-100 text-red-800' },
}

export default function AdminCommandesPage() {
  const [ordersList, setOrdersList] = useState<OrderItem[]>(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Tous')
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)

  const filteredOrders = ordersList.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                          o.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          o.clientEmail.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'Tous' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateOrderStatus = (id: string, newStatus: any) => {
    setOrdersList(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Gestion des Commandes</h1>
        <p className="text-[#6B7280]">Suivez les commandes clients et mettez à jour leur statut d'expédition.</p>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E2DF] flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Rechercher par N° commande, client ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#6B7280]" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmée</option>
            <option value="PROCESSING">En préparation</option>
            <option value="SHIPPED">Expédiée</option>
            <option value="DELIVERED">Livrée</option>
            <option value="CANCELLED">Annulée</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#6B7280]">
            <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase text-xs font-semibold border-b border-[#E2E2DF]">
              <tr>
                <th className="px-6 py-4">Commande</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Paiement</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2DF]">
              {filteredOrders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#1A1A1A]">{o.orderNumber}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#1A1A1A] block">{o.clientName}</span>
                    <span className="text-xs text-[#6B7280]">{o.clientEmail}</span>
                  </td>
                  <td className="px-6 py-4">{o.date}</td>
                  <td className="px-6 py-4 text-xs font-medium text-[#1A1A1A]">{o.paymentMethod}</td>
                  <td className="px-6 py-4 font-bold text-[#1A3FA0]">{formatPrice(o.total)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={o.status}
                      onChange={e => updateOrderStatus(o.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${statusBadges[o.status]?.style}`}
                    >
                      <option value="PENDING">En attente</option>
                      <option value="CONFIRMED">Confirmée</option>
                      <option value="PROCESSING">En préparation</option>
                      <option value="SHIPPED">Expédiée</option>
                      <option value="DELIVERED">Livrée</option>
                      <option value="CANCELLED">Annulée</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="p-1.5 text-[#1A3FA0] hover:bg-[#E8EDF8] rounded-lg transition-colors"
                      title="Détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-[#E2E2DF] pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#1A1A1A]">Détails Commande {selectedOrder.orderNumber}</h3>
                <p className="text-xs text-[#6B7280]">{selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#6B7280] hover:text-[#1A1A1A]"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-[#F5F5F3] p-3 rounded-lg border border-[#E2E2DF]">
                <p className="font-bold text-[#1A1A1A]">Informations Client</p>
                <p className="text-xs text-[#6B7280]">{selectedOrder.clientName} · {selectedOrder.clientPhone}</p>
                <p className="text-xs text-[#6B7280]">{selectedOrder.clientEmail}</p>
              </div>

              <div className="border border-[#E2E2DF] rounded-lg p-3 space-y-2">
                <p className="font-bold text-xs uppercase text-[#6B7280]">Articles commandés</p>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-medium">
                    <span>{item.qty}x {item.name}</span>
                    <span className="font-bold text-[#1A1A1A]">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 font-bold text-base border-t border-[#E2E2DF]">
                <span>Total de la commande</span>
                <span className="text-[#1A3FA0]">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button onClick={() => setSelectedOrder(null)} className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-bold rounded-lg hover:bg-black">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
