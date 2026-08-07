'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Search, ChevronDown, Eye, CheckCircle, XCircle,
  Loader2, Download, Package, Clock, Truck, RefreshCw
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
    const token = getToken();
    if (!token) {
      alert('Session expirée. Veuillez vous reconnecter.');
      return;
    }
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, notes: '' }),
      });
      if (res.ok) {
        await loadOrders();
      } else {
        const err = await res.json().catch(() => ({ message: 'Erreur inconnue' }));
        alert(`Erreur: ${err.message || res.statusText}`);
      }
    } catch (e) {
      console.error(e);
      alert('Erreur réseau lors de la mise à jour du statut.');
    } finally {
      setUpdatingId(null);
    }
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
    <div className="admin-page">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Gestion des Commandes</h1>
        <p className="text-[#6B7280]">Suivez et gérez toutes les commandes de la boutique.</p>
      </div>
      <div className="admin-content">

        {/* KPI Cards */}
        <div className="admin-kpi-grid">
          {kpis.map(kpi => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="admin-kpi-card">
                <div className="admin-kpi-top">
                  <div className="admin-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}><Icon size={20} /></div>
                </div>
                <div className="admin-kpi-value">{kpi.value}</div>
                <div className="admin-kpi-label">{kpi.label}</div>
              </div>
            );
          })}
        </div>

        <div className="admin-card">
          {/* Filters */}
          <div className="admin-filters-bar">
            <div className="admin-search-field">
              <Search size={16} className="admin-search-icon-sm" />
              <input type="text" placeholder="Rechercher une commande..." value={search}
                onChange={e => setSearch(e.target.value)} className="admin-input" />
            </div>
            <div className="admin-filters-right">
              <div className="admin-select-wrapper">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-select">
                  <option>Tous statuts</option>
                  {Object.keys(STATUS_CONFIG).map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="admin-select-icon" />
              </div>
              <button className="admin-btn-outline" onClick={handleExport}><Download size={16} /> Exporter</button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="admin-empty-state"><Loader2 size={24} className="spin" style={{ color: '#1A3FA0' }} /></div>
          ) : (
            <table className="admin-table admin-table-full">
              <thead>
                <tr>
                  <th>N° COMMANDE</th>
                  <th>CLIENT</th>
                  <th>MONTANT</th>
                  <th>STATUT</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const cfg = STATUS_CONFIG[order.status] || { label: order.status, bg: '#F3F4F6', color: '#374151' };
                  const transitions = STATUS_TRANSITIONS[order.status] || [];
                  return (
                    <tr key={order.id}>
                      <td className="admin-product-ref">{order.orderNumber || `CMD-${order.id}`}</td>
                      <td>{order.shippingAddress?.fullName || `Client #${order.userId}`}</td>
                      <td className="admin-table-price">{(order.totalAmount || 0).toLocaleString('fr-FR')} TND</td>
                      <td>
                        <span className="admin-status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="admin-table-date">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td>
                        <div className="admin-actions" style={{ gap: 6 }}>
                          <button className="admin-action-btn" title="Voir détails" onClick={() => setViewOrder(order)}>
                            <Eye size={15} />
                          </button>
                          {transitions.map(next => (
                            <button
                              key={next}
                              disabled={updatingId === order.id}
                              onClick={() => updateStatus(order.id, next)}
                              className="admin-btn-outline"
                              style={{ fontSize: 11, padding: '3px 8px' }}
                            >
                              {updatingId === order.id ? <Loader2 size={12} className="spin" /> : STATUS_CONFIG[next]?.label || next}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && filteredOrders.length === 0 && (
            <div className="admin-empty-state" style={{ padding: '60px 20px', flexDirection: 'column', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: '#64748B', fontSize: 24 }}>📦</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Aucune commande</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Aucune commande ne correspond à vos filtres.</p>
            </div>
          )}
        </div>

        {/* Modal Détail Commande */}
        {viewOrder && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setViewOrder(null)}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 520, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Commande {viewOrder.orderNumber}</h3>
                <button onClick={() => setViewOrder(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <div><strong>Statut :</strong> <span style={{ color: STATUS_CONFIG[viewOrder.status]?.color }}>{STATUS_CONFIG[viewOrder.status]?.label}</span></div>
                <div><strong>Client :</strong> {viewOrder.shippingAddress?.fullName || `Client #${viewOrder.userId}`}</div>
                <div><strong>Adresse :</strong> {viewOrder.shippingAddress?.city}, {viewOrder.shippingAddress?.country}</div>
                <div><strong>Montant total :</strong> {(viewOrder.totalAmount || 0).toLocaleString('fr-FR')} TND</div>
                <div><strong>Date :</strong> {viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleString('fr-FR') : 'N/A'}</div>
                {viewOrder.orderItems?.length > 0 && (
                  <div>
                    <strong>Produits :</strong>
                    <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                      {viewOrder.orderItems.map((item: any, idx: number) => (
                        <li key={idx}>{item.productName || `Produit #${item.productId}`} × {item.quantity} — {(item.unitPrice || 0).toLocaleString('fr-FR')} TND</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
