'use client'

import { useState } from 'react'
import { Search, Users, Mail, Phone, ShoppingBag, ShieldCheck, UserX, UserCheck } from 'lucide-react'
import { formatPrice } from '@/lib/products'

interface CustomerItem {
  id: number
  name: string
  email: string
  phone: string
  createdAt: string
  ordersCount: number
  totalSpent: number
  status: 'Actif' | 'Suspendu'
  role: 'CUSTOMER' | 'ADMIN'
}

const initialCustomers: CustomerItem[] = [
  { id: 1, name: 'Sami Trabelsi', email: 'sami.trabelsi@gmail.com', phone: '+216 98 123 456', createdAt: '12 Jan 2026', ordersCount: 4, totalSpent: 6450, status: 'Actif', role: 'CUSTOMER' },
  { id: 2, name: 'Amira Ben Ali', email: 'amira.ba@yahoo.fr', phone: '+216 55 987 654', createdAt: '04 Fév 2026', ordersCount: 2, totalSpent: 2400, status: 'Actif', role: 'CUSTOMER' },
  { id: 3, name: 'Youssef Mansour', email: 'ymansour@outlook.com', phone: '+216 22 333 444', createdAt: '19 Mar 2026', ordersCount: 1, totalSpent: 3100, status: 'Actif', role: 'CUSTOMER' },
  { id: 4, name: 'Nadia Gharbi', email: 'nadia.g@gmail.com', phone: '+216 99 888 777', createdAt: '22 Avr 2026', ordersCount: 3, totalSpent: 7800, status: 'Actif', role: 'CUSTOMER' },
  { id: 5, name: 'Admin AfricaNet', email: 'admin@africanet.tn', phone: '+216 71 000 000', createdAt: '01 Jan 2026', ordersCount: 0, totalSpent: 0, status: 'Actif', role: 'ADMIN' },
]

export default function AdminClientsPage() {
  const [customersList, setCustomersList] = useState<CustomerItem[]>(initialCustomers)
  const [search, setSearch] = useState('')

  const filteredCustomers = customersList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.toLowerCase().includes(search.toLowerCase())
  )

  const toggleCustomerStatus = (id: number) => {
    setCustomersList(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Actif' ? 'Suspendu' : 'Actif' } : c))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Gestion des Clients</h1>
        <p className="text-[#6B7280]">Consultez la liste des utilisateurs inscrits et leur historique d'achats.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E2DF]">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Rechercher par nom, e-mail ou téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#6B7280]">
            <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase text-xs font-semibold border-b border-[#E2E2DF]">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Téléphone</th>
                <th className="px-6 py-4">Inscrit le</th>
                <th className="px-6 py-4">Commandes</th>
                <th className="px-6 py-4">Total Dépensé</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2DF]">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#E8EDF8] text-[#1A3FA0] font-bold flex items-center justify-center text-xs">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="font-bold text-[#1A1A1A] block">{c.name}</span>
                        <span className="text-xs text-[#6B7280]">{c.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-[#1A1A1A]">{c.phone}</td>
                  <td className="px-6 py-4 text-xs">{c.createdAt}</td>
                  <td className="px-6 py-4 font-semibold text-[#1A1A1A]">{c.ordersCount} commande{c.ordersCount > 1 ? 's' : ''}</td>
                  <td className="px-6 py-4 font-bold text-[#1A3FA0]">{formatPrice(c.totalSpent)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      c.status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {c.role !== 'ADMIN' && (
                      <button
                        onClick={() => toggleCustomerStatus(c.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          c.status === 'Actif' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {c.status === 'Actif' ? 'Suspendre' : 'Activer'}
                      </button>
                    )}
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
