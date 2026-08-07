'use client';

import { useState, useEffect } from 'react'
import { TrendingUp, Users, ShoppingCart, DollarSign, Package, AlertCircle, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/products'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:    { label: 'En attente',   bg: '#FFF7ED', color: '#EA580C' },
  CONFIRMED:  { label: 'Confirmée',    bg: '#EFF6FF', color: '#1A3FA0' },
  PROCESSING: { label: 'En cours',     bg: '#FAF5FF', color: '#9333EA' },
  SHIPPED:    { label: 'Expédiée',     bg: '#F0FDF4', color: '#16A34A' },
  DELIVERED:  { label: 'Livrée',       bg: '#F0FDF4', color: '#15803D' },
  CANCELLED:  { label: 'Annulée',      bg: '#FEF2F2', color: '#DC2626' },
  REFUNDED:   { label: 'Remboursée',   bg: '#F3F4F6', color: '#6B7280' },
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState(0);
  const [tradeInCount, setTradeInCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = getToken();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch Orders
        const resOrders = await fetch(`${API_BASE}/admin/orders?size=100`, { headers, cache: 'no-store' });
        let fetchedOrders = [];
        if (resOrders.ok) {
          const data = await resOrders.json();
          fetchedOrders = data.content || [];
          setOrders(fetchedOrders);
          
          const totalRevenue = fetchedOrders
            .filter((o: any) => !['CANCELLED', 'REFUNDED'].includes(o.status))
            .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
          setRevenue(totalRevenue);
        }

        // Fetch Users
        const resUsers = await fetch(`${API_BASE}/admin/users?size=1`, { headers, cache: 'no-store' });
        if (resUsers.ok) {
          const data = await resUsers.json();
          setUsersCount(data.totalElements || data.content?.length || 0);
        }

        // Fetch Trade-ins
        const resTradeIn = await fetch(`${API_BASE}/admin/trade-in?size=1`, { headers, cache: 'no-store' });
        if (resTradeIn.ok) {
          const data = await resTradeIn.json();
          setTradeInCount(data.totalElements || data.content?.length || 0);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { name: 'Chiffre d\'affaires', value: revenue, change: null, trend: 'up', icon: DollarSign },
    { name: 'Commandes', value: orders.length, change: null, trend: 'up', icon: ShoppingCart },
    { name: 'Clients', value: usersCount, change: null, trend: 'up', icon: Users },
    { name: 'Demandes Reprise', value: tradeInCount, change: null, trend: 'up', icon: Package },
  ]

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Tableau de bord</h1>
        <p className="text-[#6B7280]">Vue d'ensemble des performances de votre boutique AfricaNet.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#1A3FA0]" />
        </div>
      ) : (
        <>
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
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[#6B7280]">Aucune commande récente</td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => {
                        const status = STATUS_CONFIG[order.status] || { label: order.status, bg: '#F3F4F6', color: '#6B7280' };
                        return (
                          <tr key={order.id} className="border-b border-[#E2E2DF]">
                            <td className="px-4 py-4 font-medium text-[#1A1A1A]">#{order.orderNumber || `AN-${order.id}`}</td>
                            <td className="px-4 py-4">{order.shippingAddress?.fullName || `Client #${order.userId}`}</td>
                            <td className="px-4 py-4">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="px-4 py-4 font-bold text-[#1A1A1A]">{formatPrice(order.totalAmount || 0)}</td>
                            <td className="px-4 py-4">
                              <span style={{ backgroundColor: status.bg, color: status.color }} className="px-2 py-1 rounded-full text-xs font-semibold">
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
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
                    <h4 className="text-sm font-bold text-[#1A1A1A]">Rupture imminente</h4>
                    <p className="text-sm text-[#6B7280] mt-1">Dell XPS 13 9310 (Plus que 2 en stock)</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-lg bg-[#FFFBEB] border border-[#FCD34D]">
                  <AlertCircle className="h-5 w-5 text-[#D97706] shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A1A]">Stock faible</h4>
                    <p className="text-sm text-[#6B7280] mt-1">MacBook Pro 14 M1 (Plus que 5 en stock)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
