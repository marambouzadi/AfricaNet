'use client'

import Link from 'next/link'
import { Package, RefreshCw, Star, ArrowRight, Clock, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getUserOrders, getUserTradeIns } from '@/lib/api'
import { useUser } from '@/lib/user-context'

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser()
  const [orders, setOrders] = useState<any[]>([])
  const [tradeIns, setTradeIns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!user) return
      try {
        const [ordersRes, tradeInsRes] = await Promise.all([
          getUserOrders(),
          getUserTradeIns()
        ])
        setOrders(ordersRes?.content || [])
        setTradeIns(tradeInsRes?.content || [])
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (userLoading || loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A3FA0]" />
      </div>
    )
  }

  const inProgressOrders = orders.filter(o => o.status !== 'DELIVERED').length
  const pendingTradeIns = tradeIns.filter(t => t.status === 'PENDING').length

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Bienvenue, {user.firstName} !</h1>
      <p className="text-[#6B7280]">Voici un aperçu de vos activités récentes sur AfricaNet.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-[#E2E2DF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-[#1A3FA0]">
            <Package className="h-6 w-6" />
            <h3 className="font-bold text-[#1A1A1A]">Commandes</h3>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A]">{orders.length}</p>
          <p className="text-sm text-[#6B7280] mt-1">{inProgressOrders} en cours de livraison</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E2E2DF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-[#F59E0B]">
            <RefreshCw className="h-6 w-6" />
            <h3 className="font-bold text-[#1A1A1A]">Reprises</h3>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A]">{tradeIns.length}</p>
          <p className="text-sm text-[#6B7280] mt-1">{pendingTradeIns} en attente</p>
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
          {orders.slice(0, 3).map(order => (
            <div key={order.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A]">Commande #{order.orderNumber}</p>
                  <p className="text-sm text-[#6B7280]">{order.totalAmount} TND</p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  <Clock className="h-3 w-3" /> {order.status}
                </span>
                <p className="text-sm text-[#6B7280]">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}

          {/* Trade-in Item */}
          {tradeIns.slice(0, 3).map(trade => (
            <div key={trade.id} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1A1A]">Reprise #{trade.id}</p>
                  <p className="text-sm text-[#6B7280]">{trade.brand} {trade.model}</p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Clock className="h-3 w-3" /> {trade.status}
                </span>
                <p className="text-sm text-[#6B7280]">{new Date(trade.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}

          {orders.length === 0 && tradeIns.length === 0 && (
             <div className="p-6 text-center text-[#6B7280]">Aucune activité récente.</div>
          )}
        </div>
      </div>
    </div>
  )
}
