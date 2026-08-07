'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Search, ChevronDown, Eye, Loader2, Download,
  Users, ShoppingBag, Star, Ban, Check
} from 'lucide-react';
import { exportToCSV } from '@/lib/export';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tous les rôles');
  const [viewClient, setViewClient] = useState<any>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadClients = async () => {
    try {
      const token = getToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/admin/users?size=100`, { headers, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setClients(data.content || data || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadClients(); }, []);

  const handleToggleActive = async (clientId: number) => {
    setTogglingId(clientId);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/users/${clientId}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await loadClients();
        // Refresh modal data
        if (viewClient?.id === clientId) {
          const updated = await res.json().catch(() => null);
          if (updated) setViewClient(updated);
        }
      }
    } catch (e) { console.error(e); }
    finally { setTogglingId(null); }
  };

  const filtered = clients.filter(c => {
    const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'Tous les rôles' || c.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleExport = () => {
    const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Rôle', 'Actif', 'Date inscription'];
    const rows = filtered.map(c => [
      c.id,
      c.firstName || '',
      c.lastName || '',
      c.email || '',
      c.role || '',
      c.active ? 'Oui' : 'Non',
      c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : 'N/A',
    ]);
    exportToCSV('export_clients', headers, rows);
  };

  const kpis = [
    { label: 'Total clients',   value: clients.length,                                       icon: Users,      color: '#1A3FA0', bg: '#EFF6FF' },
    { label: 'Clients actifs',  value: clients.filter(c => c.active).length,               icon: ShoppingBag,color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Administrateurs', value: clients.filter(c => c.role === 'ADMIN').length,        icon: Star,       color: '#F59E0B', bg: '#FFFBEB' },
    { label: 'Désactivés',      value: clients.filter(c => !c.active).length,              icon: Ban,        color: '#EF4444', bg: '#FEF2F2' },
  ];

  return (
    <div className="admin-page">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Gestion des Clients</h1>
        <p className="text-[#6B7280]">Gérez les comptes clients et administrateurs de la boutique.</p>
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
          <div className="admin-filters-bar">
            <div className="admin-search-field">
              <Search size={16} className="admin-search-icon-sm" />
              <input type="text" placeholder="Rechercher un client..." value={search}
                onChange={e => setSearch(e.target.value)} className="admin-input" />
            </div>
            <div className="admin-filters-right">
              <div className="admin-select-wrapper">
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="admin-select">
                  <option>Tous les rôles</option>
                  <option value="CUSTOMER">Client</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
                <ChevronDown size={14} className="admin-select-icon" />
              </div>
              <button className="admin-btn-outline" onClick={handleExport}><Download size={16} /> Exporter</button>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty-state"><Loader2 size={24} className="spin" style={{ color: '#1A3FA0' }} /></div>
          ) : (
            <table className="admin-table admin-table-full">
              <thead>
                <tr>
                  <th>CLIENT</th>
                  <th>EMAIL</th>
                  <th>RÔLE</th>
                  <th>STATUT</th>
                  <th>INSCRIPTION</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(client => (
                  <tr key={client.id}>
                    <td>
                      <div className="admin-product-row">
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1A3FA0, #3B82F6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0
                        }}>
                          {(client.firstName?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div className="admin-product-name">{client.firstName} {client.lastName}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>#{client.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: '#475569' }}>{client.email}</td>
                    <td>
                      <span className="admin-status-badge" style={{
                        background: client.role === 'ADMIN' ? '#FFFBEB' : '#EFF6FF',
                        color: client.role === 'ADMIN' ? '#D97706' : '#1A3FA0',
                      }}>
                        {client.role === 'ADMIN' ? '★ Admin' : 'Client'}
                      </span>
                    </td>
                    <td>
                      <span className="admin-status-badge" style={{
                        background: client.active ? '#F0FDF4' : '#FEF2F2',
                        color: client.active ? '#16A34A' : '#DC2626',
                      }}>
                        {client.active ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="admin-table-date">
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td>
                      <div className="admin-actions" style={{ gap: 6 }}>
                        <button className="admin-action-btn" title="Voir profil" onClick={() => setViewClient(client)}>
                          <Eye size={15} />
                        </button>
                        {client.role !== 'ADMIN' && (
                          <button
                            className="admin-btn-outline"
                            style={{ fontSize: 11, padding: '3px 8px', color: client.active ? '#DC2626' : '#16A34A', borderColor: client.active ? '#DC2626' : '#16A34A' }}
                            disabled={togglingId === client.id}
                            title={client.active ? 'Bloquer' : 'Débloquer'}
                            onClick={() => handleToggleActive(client.id)}
                          >
                            {togglingId === client.id ? <Loader2 size={12} className="spin" /> : (client.active ? <Ban size={12} /> : <Check size={12} />)}
                            {' '}{client.active ? 'Bloquer' : 'Débloquer'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <div className="admin-empty-state" style={{ padding: '60px 20px', flexDirection: 'column', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 24 }}>👤</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Aucun client trouvé</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Aucun client ne correspond à vos critères.</p>
            </div>
          )}
        </div>

        {/* Modal détail client */}
        {viewClient && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setViewClient(null)}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 420, width: '100%' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Profil Client</h3>
                <button onClick={() => setViewClient(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #1A3FA0, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>
                    {(viewClient.firstName?.[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{viewClient.firstName} {viewClient.lastName}</div>
                    <div style={{ color: '#64748B', fontSize: 13 }}>{viewClient.email}</div>
                  </div>
                </div>
                <div><strong>Rôle :</strong> {viewClient.role === 'ADMIN' ? 'Administrateur' : 'Client'}</div>
                <div><strong>Statut :</strong> <span style={{ color: viewClient.active ? '#16A34A' : '#DC2626' }}>{viewClient.active ? 'Actif' : 'Désactivé'}</span></div>
                <div><strong>Téléphone :</strong> {viewClient.phone || '—'}</div>
                <div><strong>Inscription :</strong> {viewClient.createdAt ? new Date(viewClient.createdAt).toLocaleString('fr-FR') : 'N/A'}</div>
              </div>
              {viewClient.role !== 'ADMIN' && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E2DF' }}>
                  <button
                    onClick={() => handleToggleActive(viewClient.id)}
                    disabled={togglingId === viewClient.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                      borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                      background: viewClient.active ? '#FEF2F2' : '#F0FDF4',
                      color: viewClient.active ? '#DC2626' : '#16A34A',
                    }}
                  >
                    {togglingId === viewClient.id ? <Loader2 size={14} className="spin" /> : (viewClient.active ? <Ban size={14} /> : <Check size={14} />)}
                    {viewClient.active ? 'Bloquer cet utilisateur' : 'Débloquer cet utilisateur'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
