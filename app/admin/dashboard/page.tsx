'use client'

import { useState, useEffect } from 'react'
import { Users, ShoppingCart, DollarSign, Package, AlertCircle, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/products'
import SalesCharts from '@/components/admin/SalesCharts'

const API_BASE = 'http://localhost:8090/api'

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [stockItems, setStockItems] = useState<any[]>([])
  const [tradeIns, setTradeIns] = useState<any[]>([])
  const [usersCount, setUsersCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      const token = getToken()
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

      try {
        const [ordersRes, productsRes, stockRes, tradeInRes, usersRes] = await Promise.allSettled([
          fetch(`${API_BASE}/admin/orders?size=100`, { headers, cache: 'no-store' }),
          fetch(`${API_BASE}/products?size=100`, { headers, cache: 'no-store' }),
          fetch(`${API_BASE}/stock?size=100`, { headers, cache: 'no-store' }),
          fetch(`${API_BASE}/trade-in`, { headers, cache: 'no-store' }),
          fetch(`${API_BASE}/admin/users?size=100`, { headers, cache: 'no-store' }),
        ])

        if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
          const data = await ordersRes.value.json()
          setOrders(data.content || (Array.isArray(data) ? data : []))
        }

        if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
          const data = await productsRes.value.json()
          setProducts(data.content || (Array.isArray(data) ? data : []))
        }

        if (stockRes.status === 'fulfilled' && stockRes.value.ok) {
          const data = await stockRes.value.json()
          setStockItems(data.content || (Array.isArray(data) ? data : []))
        }

        if (tradeInRes.status === 'fulfilled' && tradeInRes.value.ok) {
          const data = await tradeInRes.value.json()
          setTradeIns(data.content || (Array.isArray(data) ? data : []))
        }

        if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
          const data = await usersRes.value.json()
          const userList = data.content || (Array.isArray(data) ? data : [])
          setUsersCount(userList.length)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // ── Period helpers ─────────────────────────────────────────────────────────
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const inCurrentMonth = (dateStr: string | null | undefined) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    return d >= startOfThisMonth && d <= now
  }
  const inLastMonth = (dateStr: string | null | undefined) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    return d >= startOfLastMonth && d <= endOfLastMonth
  }

  // ── Current-month data ─────────────────────────────────────────────────────
  const ordersThisMonth  = orders.filter((o) => inCurrentMonth(o.createdAt))
  const ordersLastMonth  = orders.filter((o) => inLastMonth(o.createdAt))

  const revenueThisMonth = ordersThisMonth
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
    .reduce((s, o) => s + (Number(o.totalAmount) || 0), 0)
  const revenueLastMonth = ordersLastMonth
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
    .reduce((s, o) => s + (Number(o.totalAmount) || 0), 0)

  const tradeInsThisMonth = tradeIns.filter((t) => inCurrentMonth(t.createdAt))
  const tradeInsLastMonth = tradeIns.filter((t) => inLastMonth(t.createdAt))

  // Calculate REAL revenue from non-cancelled orders (all-time for KPI display)
  const realRevenue = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)

  // Calculate unique client count
  const uniqueClients = usersCount > 0 ? usersCount : new Set(orders.map((o) => o.userId).filter(Boolean)).size

  // ── Percentage change helper ───────────────────────────────────────────────
  function computeChange(current: number, previous: number): { label: string; trend: 'up' | 'down' | 'flat' } {
    if (previous === 0 && current === 0) return { label: '0%', trend: 'flat' }
    if (previous === 0) return { label: `+${current > 0 ? '∞' : '0'}%`, trend: 'up' }
    const pct = ((current - previous) / previous) * 100
    const rounded = Math.abs(pct).toFixed(1)
    if (pct > 0)  return { label: `+${rounded}%`, trend: 'up' }
    if (pct < 0)  return { label: `-${rounded}%`, trend: 'down' }
    return { label: '0%', trend: 'flat' }
  }

  const revenueChange   = computeChange(revenueThisMonth, revenueLastMonth)
  const ordersChange    = computeChange(ordersThisMonth.length, ordersLastMonth.length)
  const tradeInChange   = computeChange(tradeInsThisMonth.length, tradeInsLastMonth.length)
  // For clients we compare total vs a "previous total" proxy (total - this month additions)
  // We use the unique client IDs from orders as a signal
  const clientsThisMonth = new Set(ordersThisMonth.map((o) => o.userId).filter(Boolean)).size
  const clientsLastMonth = new Set(ordersLastMonth.map((o) => o.userId).filter(Boolean)).size
  const clientsChange   = computeChange(clientsThisMonth, clientsLastMonth)

  const stats = [
    {
      name: "Chiffre d'affaires",
      value: revenueThisMonth,
      isPrice: true,
      icon: DollarSign,
      change: revenueChange,
      subtitle: 'Ce mois-ci',
    },
    {
      name: 'Commandes',
      value: ordersThisMonth.length,
      isPrice: false,
      icon: ShoppingCart,
      change: ordersChange,
      subtitle: 'Ce mois-ci',
    },
    {
      name: 'Nouveaux Clients',
      value: uniqueClients,
      isPrice: false,
      icon: Users,
      change: clientsChange,
      subtitle: 'Total inscrits',
    },
    {
      name: 'Demandes Reprise',
      value: tradeInsThisMonth.length,
      isPrice: false,
      icon: Package,
      change: tradeInChange,
      subtitle: 'Ce mois-ci',
    },
  ]

  // Map product stock by matching products with stockItems from /api/stock
  const stockByProductId = new Map<number, any>()
  stockItems.forEach((st) => {
    const pid = st.productId ?? st.product?.id
    if (pid) stockByProductId.set(pid, st)
  })

  // Dynamic low stock alerts — same formula as /admin/stock page
  // available = quantity (raw total) - reservedQuantity
  const alertProducts = products
    .map((p) => {
      const st = stockByProductId.get(p.id)
      const rawQty   = st ? (st.quantity ?? st.totalQuantity ?? 0) : (p.stockQuantity ?? p.stock ?? 0)
      const reserved = st ? (st.reservedQuantity ?? st.reserved_quantity ?? 0) : 0
      const qty      = Math.max(0, rawQty - reserved)
      const threshold = st ? (st.minThreshold ?? st.min_threshold ?? 5) : 5
      return {
        ...p,
        realStock: qty,
        threshold,
      }
    })
    .filter((p) => p.realStock <= p.threshold)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">Vue d'ensemble des performances réelles en direct de votre boutique AfricaNet.</p>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-[#1A3FA0]">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Mise à jour des données en direct...</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const trend = stat.change?.trend ?? 'flat'
          const changeLabel = stat.change?.label ?? '—'
          const badgeBg =
            trend === 'up'   ? 'bg-[#DCFCE7] text-[#166534]' :
            trend === 'down' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                               'bg-[#F3F4F6] text-[#6B7280]'
          const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

          return (
            <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E2DF] hover:shadow-md transition-shadow duration-200">
              {/* Top row: icon + percentage badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#E8EDF8] text-[#1A3FA0] rounded-lg flex items-center justify-center shrink-0">
                  <stat.icon className="h-6 w-6" />
                </div>
                {!loading && (
                  <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeBg}`}>
                    <span className="text-sm leading-none">{arrow}</span>
                    {changeLabel}
                  </span>
                )}
                {loading && (
                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
                    — %
                  </span>
                )}
              </div>

              {/* Label */}
              <h3 className="text-[#6B7280] text-sm font-medium">{stat.name}</h3>

              {/* Value */}
              <p className="text-2xl font-bold text-[#1A1A1A] mt-1">
                {loading ? '...' : stat.isPrice ? formatPrice(stat.value) : stat.value}
              </p>

              {/* Subtitle (period context) */}
              <p className="text-xs text-[#9CA3AF] mt-1">{stat.subtitle} vs mois dernier</p>
            </div>
          )
        })}
      </div>

      {/* Middle Analytics Charts (100% Real API Data) */}
      <SalesCharts orders={orders} products={products} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#1A1A1A]">Dernières commandes</h2>
            <a href="/admin/commandes" className="text-sm font-medium text-[#1A3FA0] hover:underline">Voir tout</a>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-12 flex justify-center text-[#1A3FA0]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-[#6B7280]">Aucune commande enregistrée pour le moment.</div>
            ) : (
              <table className="w-full text-left text-sm text-[#6B7280]">
                <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Commande</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Montant</th>
                    <th className="px-4 py-3 rounded-r-lg">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((o) => {
                    const statusMap: Record<string, { label: string; bg: string; text: string }> = {
                      PENDING: { label: 'En attente', bg: 'bg-[#FEF9C3]', text: 'text-[#A16207]' },
                      CONFIRMED: { label: 'Confirmé', bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' },
                      PROCESSING: { label: 'En cours', bg: 'bg-[#F3E8FF]', text: 'text-[#6B21A8]' },
                      SHIPPED: { label: 'Expédié', bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' },
                      DELIVERED: { label: 'Livré', bg: 'bg-[#DCFCE7]', text: 'text-[#166534]' },
                      CANCELLED: { label: 'Annulé', bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]' },
                    }
                    const cfg = statusMap[o.status] || { label: o.status || 'En attente', bg: 'bg-gray-100', text: 'text-gray-700' }
                    const clientName = o.shippingAddress?.fullName || (o.userId ? `Client #${o.userId}` : 'Client Inconnu')
                    const dateStr = o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'

                    return (
                      <tr key={o.id} className="border-b border-[#E2E2DF] last:border-b-0 hover:bg-[#F9FAFB]">
                        <td className="px-4 py-4 font-medium text-[#1A1A1A]">{o.orderNumber || `#AN-${o.id}`}</td>
                        <td className="px-4 py-4">{clientName}</td>
                        <td className="px-4 py-4">{dateStr}</td>
                        <td className="px-4 py-4 font-bold text-[#1A1A1A]">{formatPrice(o.totalAmount || 0)}</td>
                        <td className="px-4 py-4">
                          <span className={`${cfg.bg} ${cfg.text} px-2.5 py-1 rounded-full text-xs font-semibold`}>
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Dynamic Alerts / Stock */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Alertes Stock</h2>
              <a href="/admin/stock" className="text-sm font-medium text-[#1A3FA0] hover:underline">Gérer</a>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-8 flex justify-center text-[#1A3FA0]">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : alertProducts.length > 0 ? (
                alertProducts.slice(0, 3).map((p) => {
                  const qty = p.realStock
                  const isCritical = qty <= 2

                  return (
                    <div
                      key={p.id}
                      className={`flex gap-4 p-4 rounded-lg border ${
                        isCritical
                          ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                          : 'bg-[#FFFBEB] border-[#FDE68A]'
                      }`}
                    >
                      <AlertCircle
                        className={`h-5 w-5 shrink-0 ${
                          isCritical ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                        }`}
                      />
                      <div>
                        <h4
                          className={`font-bold text-sm ${
                            isCritical ? 'text-[#991B1B]' : 'text-[#92400E]'
                          }`}
                        >
                          {isCritical ? 'Rupture de stock imminente' : 'Niveau bas'}
                        </h4>
                        <p
                          className={`text-xs mt-1 ${
                            isCritical ? 'text-[#B91C1C]' : 'text-[#B45309]'
                          }`}
                        >
                          {p.name} {p.condition ? `(${p.condition})` : ''} : Plus que {qty} unité{qty > 1 ? 's' : ''} disponible{qty > 1 ? 's' : ''}.
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-4 rounded-lg bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] font-medium">
                  Aucune alerte de stock. Tous les produits ont un niveau suffisant.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
