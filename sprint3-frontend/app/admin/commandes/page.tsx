'use client';

import { useState, useEffect } from 'react';
import {
  Search, Eye, Loader2, Download, Package, Clock, Truck, RefreshCw
} from 'lucide-react';
import { exportToCSV } from '@/lib/export';

const API_BASE = 'http://localhost:8090/api';

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

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED'],
  SHIPPED:    ['DELIVERED'],
  DELIVERED:  [],
  CANCELLED:  [],
  REFUNDED:   [],
};

const TRANSITION_BTN_CONFIG: Record<string, { label: string; style: string }> = {
  CONFIRMED:  { label: 'Confirmer', style: 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  PROCESSING: { label: 'En cours',  style: 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100' },
  SHIPPED:    { label: 'Expédier',  style: 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100' },
  DELIVERED:  { label: 'Livrer',    style: 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  CANCELLED:  { label: 'Annuler',   style: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' },
};

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous statuts');
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/admin/orders?size=50`, { headers, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.content || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) { await loadOrders(); }
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = (o.orderNumber || '').toLowerCase().includes(search.toLowerCase())
      || (o.shippingAddress?.fullName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tous statuts' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExport = () => {
    const headers = ['N° Commande', 'Client', 'Montant (TND)', 'Statut', 'Date'];
    const rows = filteredOrders.map(o => [
      o.orderNumber || `CMD-${o.id}`,
      o.shippingAddress?.fullName || `Client #${o.userId}`,
      o.totalAmount || 0,
      STATUS_CONFIG[o.status]?.label || o.status,
      o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : 'N/A',
    ]);
    exportToCSV('export_commandes', headers, rows);
  };

  const totalRevenue = orders.filter(o => !['CANCELLED', 'REFUNDED'].includes(o.status))
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const kpis = [
    { label: 'Total commandes',  value: orders.length,                                              icon: Package,  color: '#1A3FA0', bg: '#EFF6FF' },
    { label: 'En attente',       value: orders.filter(o => o.status === 'PENDING').length,          icon: Clock,    color: '#EA580C', bg: '#FFF7ED' },
    { label: 'Expédiées',        value: orders.filter(o => o.status === 'SHIPPED').length,          icon: Truck,    color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Revenu total',     value: `${totalRevenue.toLocaleString('fr-FR')} TND`,              icon: RefreshCw,color: '#9333EA', bg: '#FAF5FF' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white p-6 rounded-xl border border-[#E2E2DF] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#E8EDF8] text-[#1A3FA0] rounded-xl flex items-center justify-center shrink-0">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#6B7280]">{kpi.label}</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{loading ? '...' : kpi.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E2DF] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Rechercher par N° commande ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg pl-10 pr-4 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 cursor-pointer"
          >
            <option>Tous statuts</option>
            {Object.keys(STATUS_CONFIG).map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E2DF] hover:bg-[#F5F5F3] text-[#1A1A1A] rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            <Download className="h-4 w-4" /> Exporter
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 flex justify-center text-[#1A3FA0]">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280] flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-[#F5F5F3] text-[#6B7280] rounded-full flex items-center justify-center mb-3">
                <Package className="h-7 w-7" />
              </div>
              <p className="font-bold text-[#1A1A1A] text-base">Aucune commande trouvée</p>
              <p className="text-xs text-[#6B7280] mt-1">Aucune commande ne correspond à vos filtres.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-[#6B7280]">
              <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase text-xs font-semibold border-b border-[#E2E2DF]">
                <tr>
                  <th className="px-6 py-4">N° Commande</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Montant</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DF]">
                {filteredOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] || { label: order.status, bg: 'bg-gray-100', text: 'text-gray-700' };
                  const transitions = STATUS_TRANSITIONS[order.status] || [];
                  const badgeClass =
                    order.status === 'DELIVERED' ? 'bg-[#DCFCE7] text-[#166534]' :
                    order.status === 'SHIPPED' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                    order.status === 'CONFIRMED' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                    order.status === 'PROCESSING' ? 'bg-[#F3E8FF] text-[#6B21A8]' :
                    order.status === 'PENDING' ? 'bg-[#FEF9C3] text-[#A16207]' :
                    order.status === 'CANCELLED' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                    'bg-[#F5F5F3] text-[#6B7280]';

                  return (
                    <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#1A3FA0]">
                        {order.orderNumber || `CMD-${order.id}`}
                      </td>
                      <td className="px-6 py-4 text-[#1A1A1A] font-medium">
                        {order.shippingAddress?.fullName || `Client #${order.userId}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1A1A1A]">
                        {(order.totalAmount || 0).toLocaleString('fr-FR')} TND
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280]">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Voir détails"
                            onClick={() => setViewOrder(order)}
                            className="p-2 text-[#6B7280] hover:text-[#1A3FA0] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {transitions.map((next) => {
                            const btnConfig = TRANSITION_BTN_CONFIG[next] || {
                              label: STATUS_CONFIG[next]?.label || next,
                              style: 'border-[#E2E2DF] bg-white text-[#1A1A1A] hover:bg-[#F5F5F3]',
                            };
                            return (
                              <button
                                key={next}
                                disabled={updatingId === order.id}
                                onClick={() => updateStatus(order.id, next)}
                                className={`px-2.5 py-1 text-xs font-semibold border rounded-lg transition-colors disabled:opacity-50 ${btnConfig.style}`}
                              >
                                {updatingId === order.id ? <Loader2 className="h-3 w-3 animate-spin inline" /> : btnConfig.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Détail Commande */}
      {viewOrder && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewOrder(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2E2DF] pb-4">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                Commande {viewOrder.orderNumber || `#${viewOrder.id}`}
              </h3>
              <button
                onClick={() => setViewOrder(null)}
                className="p-1 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F5F3] rounded-lg transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#1A1A1A]">
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Statut</span>
                <span className="font-semibold">{STATUS_CONFIG[viewOrder.status]?.label || viewOrder.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Client</span>
                <span className="font-semibold">{viewOrder.shippingAddress?.fullName || `Client #${viewOrder.userId}`}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Adresse</span>
                <span className="font-semibold">{viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.country}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Montant total</span>
                <span className="font-bold text-[#1A3FA0]">{(viewOrder.totalAmount || 0).toLocaleString('fr-FR')} TND</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Date</span>
                <span className="font-semibold">{viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleString('fr-FR') : 'N/A'}</span>
              </div>

              {viewOrder.orderItems?.length > 0 && (
                <div className="pt-2">
                  <span className="text-[#6B7280] font-medium block mb-2">Produits commandés :</span>
                  <div className="space-y-2 bg-[#F5F5F3] p-3 rounded-xl border border-[#E2E2DF]">
                    {viewOrder.orderItems.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-medium">{item.productName || `Produit #${item.productId}`} × {item.quantity}</span>
                        <span className="font-bold">{(item.unitPrice || 0).toLocaleString('fr-FR')} TND</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
