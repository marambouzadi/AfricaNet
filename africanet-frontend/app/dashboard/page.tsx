'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, RefreshCw, Star, ArrowRight, Clock } from 'lucide-react'

const API = 'http://localhost:8090/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserProfile {
  firstName: string
  lastName: string
}

interface Order {
  id: number
  orderNumber: string
  status: string
  createdAt: string
  items?: { productSnapshot?: { name?: string } }[]
}

interface TradeIn {
  id: number
  referenceNumber: string
  brandName: string
  model: string
  status: string
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const orderStatusLabel: Record<string, string> = {
  PENDING:    'En attente',
  CONFIRMED:  'Confirmée',
  PROCESSING: 'En préparation',
  SHIPPED:    'En cours de livraison',
  DELIVERED:  'Livrée',
  CANCELLED:  'Annulée',
  REFUNDED:   'Remboursée',
}

const orderStatusStyle: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-800',
  CONFIRMED:  'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED:    'bg-yellow-100 text-yellow-800',
  DELIVERED:  'bg-green-100 text-green-800',
  CANCELLED:  'bg-red-100 text-red-800',
  REFUNDED:   'bg-gray-100 text-gray-700',
}

const tradeStatusLabel: Record<string, string> = {
  SUBMITTED:  'Soumise',
  EVALUATING: 'Analyse IA en cours',
  APPROVED:   'Approuvée',
  REJECTED:   'Refusée',
  COMPLETED:  'Complétée',
}

const tradeStatusStyle: Record<string, string> = {
  SUBMITTED:  'bg-gray-100 text-gray-700',
  EVALUATING: 'bg-blue-100 text-blue-800',
  APPROVED:   'bg-green-100 text-green-800',
  REJECTED:   'bg-red-100 text-red-800',
  COMPLETED:  'bg-purple-100 text-purple-800',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (days > 0)  return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  if (mins > 0)  return `Il y a ${mins} minute${mins > 1 ? 's' : ''}`
  return 'À l\'instant'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [user,     setUser]     = useState<UserProfile | null>(null)
  const [orders,   setOrders]   = useState<Order[]>([])
  const [tradeIns, setTradeIns] = useState<TradeIn[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    let ignore = false
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }

    const headers = { Authorization: `Bearer ${token}` }

    Promise.allSettled([
      fetch(`${API}/auth/me`,        { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/orders/me`,      { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/trade-in/me`,    { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([userRes, ordersRes, tradeRes]) => {
      if (ignore) return
      if (userRes.status   === 'fulfilled' && userRes.value)   setUser(userRes.value)
      if (ordersRes.status === 'fulfilled' && ordersRes.value) {
        const raw = ordersRes.value
        setOrders(Array.isArray(raw) ? raw : raw.content ?? [])
      }
      if (tradeRes.status  === 'fulfilled' && tradeRes.value)  {
        const raw = tradeRes.value
        setTradeIns(Array.isArray(raw) ? raw : raw.content ?? [])
      }
      setLoading(false)
    })

    return () => { ignore = true }
  }, [])

  // KPIs
  const activeOrders = orders.filter(o =>
    ['PENDING','CONFIRMED','PROCESSING','SHIPPED'].includes(o.status)
  ).length

  const pendingTradeIns = tradeIns.filter(t =>
    ['SUBMITTED','EVALUATING'].includes(t.status)
  ).length

  // Activity feed: last 3 items merged and sorted
  type Activity =
    | { kind: 'order';   data: Order }
    | { kind: 'tradein'; data: TradeIn }

  const activity: Activity[] = [
    ...orders.map(o   => ({ kind: 'order'   as const, data: o })),
    ...tradeIns.map(t => ({ kind: 'tradein' as const, data: t })),
  ]
    .sort((a, b) =>
      new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime()
    )
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      {loading ? (
        <div className="h-8 w-56 bg-gray-100 rounded animate-pulse" />
      ) : (
        <>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">
            Bienvenue{user ? `, ${user.firstName} !` : ' !'}
          </h1>
          <p className="text-[#6B7280]">Voici un aperçu de vos activités récentes sur AfricaNet.</p>
        </>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Commandes */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E2DF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-[#1A3FA0]">
            <Package className="h-6 w-6" />
            <h3 className="font-bold text-[#1A1A1A]">Commandes</h3>
          </div>
          {loading ? (
            <div className="h-9 w-12 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-black text-[#1A1A1A]">{orders.length}</p>
              <p className="text-sm text-[#6B7280] mt-1">
                {activeOrders > 0 ? `${activeOrders} en cours` : 'Aucune en cours'}
              </p>
            </>
          )}
        </div>

        {/* Reprises */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E2DF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-[#F59E0B]">
            <RefreshCw className="h-6 w-6" />
            <h3 className="font-bold text-[#1A1A1A]">Reprises</h3>
          </div>
          {loading ? (
            <div className="h-9 w-12 bg-gray-100 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-black text-[#1A1A1A]">{tradeIns.length}</p>
              <p className="text-sm text-[#6B7280] mt-1">
                {pendingTradeIns > 0 ? `${pendingTradeIns} en attente d'estimation` : 'Aucune en attente'}
              </p>
            </>
          )}
        </div>

        {/* Fidélité — statique pour l'instant */}
        <div className="bg-white rounded-xl p-6 border border-[#E2E2DF] shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-[#10B981]">
            <Star className="h-6 w-6" />
            <h3 className="font-bold text-[#1A1A1A]">Fidélité</h3>
          </div>
          <p className="text-3xl font-black text-[#1A1A1A]">—</p>
          <p className="text-sm text-[#6B7280] mt-1">Bientôt disponible</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden mt-8">
        <div className="p-6 border-b border-[#E2E2DF] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Activité Récente</h2>
          <Link
            href="/dashboard/commandes"
            className="text-sm text-[#1A3FA0] font-medium hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-[#E2E2DF]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : activity.length === 0 ? (
          <p className="p-8 text-center text-[#6B7280]">Aucune activité récente.</p>
        ) : (
          <div className="divide-y divide-[#E2E2DF]">
            {activity.map((item, idx) => {
              if (item.kind === 'order') {
                const o = item.data
                const label = o.items?.map(i => i.productSnapshot?.name).filter(Boolean).join(', ') || '—'
                return (
                  <div key={`order-${o.id ?? idx}`} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1A1A1A]">Commande {o.orderNumber}</p>
                        <p className="text-sm text-[#6B7280] truncate max-w-[220px]">{label}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-1">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${orderStatusStyle[o.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        <Clock className="h-3 w-3" />
                        {orderStatusLabel[o.status] ?? o.status}
                      </span>
                      <p className="text-sm text-[#6B7280]">{timeAgo(o.createdAt)}</p>
                    </div>
                  </div>
                )
              }

              const t = item.data
              return (
                <div key={`trade-${t.id ?? idx}`} className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1A1A1A]">Reprise {t.referenceNumber || `#${t.id}`}</p>
                      <p className="text-sm text-[#6B7280]">{[t.brandName, t.model].filter(Boolean).join(' ') || '—'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${tradeStatusStyle[t.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      <Clock className="h-3 w-3" />
                      {tradeStatusLabel[t.status] ?? t.status}
                    </span>
                    <p className="text-sm text-[#6B7280]">{timeAgo(t.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
