'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Search, ChevronDown, Eye, CheckCircle, XCircle,
  Loader2, Download, RefreshCw, Clock, Star, AlertCircle
} from 'lucide-react';
import { exportToCSV } from '@/lib/export';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  SUBMITTED:  { label: 'Soumise',     bg: '#EFF6FF', color: '#1A3FA0' },
  EVALUATING: { label: 'En évaluation',bg: '#FFFBEB', color: '#D97706' },
  APPROVED:   { label: 'Approuvée',   bg: '#F0FDF4', color: '#16A34A' },
  REJECTED:   { label: 'Refusée',     bg: '#FEF2F2', color: '#DC2626' },
  COMPLETED:  { label: 'Complétée',   bg: '#F3F4F6', color: '#6B7280' },
};

const DEVICE_LABELS: Record<string, string> = {
  LAPTOP:  '💻 PC Portable',
  DESKTOP: '🖥️ Ordinateur Bureau',
  PHONE:   '📱 Téléphone',
  TABLET:  '📲 Tablette',
};

export default function AdminEchangesPage() {
  const [tradeIns, setTradeIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous statuts');
  const [viewItem, setViewItem] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/admin/trade-in?size=50`, { headers, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTradeIns(data.content || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, newStatus: string, finalValue?: number | string | null, notes?: string) => {
    setUpdatingId(id);
    try {
      const token = getToken();
      const parsedFinalValue = finalValue != null ? Number(finalValue) : undefined;
      const res = await fetch(`${API_BASE}/admin/trade-in/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          status: newStatus, 
          finalValue: parsedFinalValue && !isNaN(parsedFinalValue) ? parsedFinalValue : undefined, 
          reviewNotes: notes 
        }),
      });
      if (res.ok) { await load(); }
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  const filtered = tradeIns.filter(t => {
    const matchSearch = (t.referenceNumber || '').toLowerCase().includes(search.toLowerCase())
      || (t.model || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tous statuts' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleExport = () => {
    const headers = ['Référence', 'Appareil', 'Modèle', 'Valeur estimée (TND)', 'Statut', 'Date'];
    const rows = filtered.map(t => [
      t.referenceNumber || `TRD-${t.id}`,
      DEVICE_LABELS[t.deviceType] || t.deviceType,
      t.model || '',
      t.estimatedValueAi || '',
      STATUS_CONFIG[t.status]?.label || t.status,
      t.createdAt ? new Date(t.createdAt).toLocaleDateString('fr-FR') : 'N/A',
    ]);
    exportToCSV('export_echanges_trade_in', headers, rows);
  };

  const kpis = [
    { label: 'Total demandes',    value: tradeIns.length,                                                icon: RefreshCw,    color: '#1A3FA0', bg: '#EFF6FF' },
    { label: 'En attente',        value: tradeIns.filter(t => t.status === 'SUBMITTED').length,          icon: Clock,        color: '#D97706', bg: '#FFFBEB' },
    { label: 'Approuvées',        value: tradeIns.filter(t => t.status === 'APPROVED').length,           icon: CheckCircle,  color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Refusées',          value: tradeIns.filter(t => t.status === 'REJECTED').length,           icon: XCircle,      color: '#DC2626', bg: '#FEF2F2' },
  ];

  return (
    <div className="admin-page">
      <div><div className="mb-8"><h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Demandes de Reprise</h1><p className="text-[#6B7280]">Évaluez et gérez les demandes de reprise de matériel.</p></div></div>
      <div className="admin-content">

        {/* KPIs */}
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
              <input type="text" placeholder="Rechercher une demande..." value={search}
                onChange={e => setSearch(e.target.value)} className="admin-input" />
            </div>
            <div className="admin-filters-right">
              <div className="admin-select-wrapper">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="admin-select">
                  <option>Tous statuts</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <ChevronDown size={14} className="admin-select-icon" />
              </div>
              <button className="admin-btn-outline" onClick={handleExport}><Download size={16} /> Exporter</button>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty-state"><Loader2 size={24} className="spin" style={{ color: '#1A3FA0' }} /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table admin-table-full">
                <thead>
                  <tr>
                    <th>RÉFÉRENCE</th>
                    <th>APPAREIL</th>
                    <th>MODÈLE</th>
                    <th>VALEUR ESTIMÉE</th>
                    <th>STATUT</th>
                    <th>DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(item => {
                    const cfg = STATUS_CONFIG[item.status] || { label: item.status, bg: '#F3F4F6', color: '#374151' };
                    return (
                      <tr key={item.id}>
                        <td className="admin-product-ref">{item.referenceNumber || `TRD-${item.id}`}</td>
                        <td style={{ fontSize: 13 }}>{DEVICE_LABELS[item.deviceType] || item.deviceType}</td>
                        <td style={{ fontSize: 13 }}>{item.model || '—'}</td>
                        <td style={{ fontWeight: 600, color: '#1A3FA0' }}>
                          {item.finalValue
                            ? `${Number(item.finalValue).toLocaleString('fr-FR')} TND`
                            : item.estimatedValueAi
                              ? `~${Number(item.estimatedValueAi).toLocaleString('fr-FR')} TND`
                              : '—'}
                        </td>
                        <td>
                          <span className="admin-status-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </td>
                        <td className="admin-table-date">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td>
                          <div className="admin-actions" style={{ gap: 6 }}>
                            <button className="admin-action-btn" onClick={() => setViewItem(item)} title="Voir détails"><Eye size={15} /></button>
                            {item.status === 'SUBMITTED' && (
                              <>
                                <button
                                  className="admin-btn-outline"
                                  style={{ fontSize: 11, padding: '3px 8px', color: '#16A34A', borderColor: '#16A34A' }}
                                  disabled={updatingId === item.id}
                                  onClick={() => updateStatus(item.id, 'APPROVED', item.estimatedValueAi, 'Demande approuvée')}
                                >
                                  {updatingId === item.id ? <Loader2 size={12} className="spin" /> : '✓ Approuver'}
                                </button>
                                <button
                                  className="admin-btn-outline"
                                  style={{ fontSize: 11, padding: '3px 8px', color: '#DC2626', borderColor: '#DC2626' }}
                                  disabled={updatingId === item.id}
                                  onClick={() => updateStatus(item.id, 'REJECTED', undefined, 'Ne répond pas aux critères')}
                                >
                                  ✗ Refuser
                                </button>
                              </>
                            )}
                            {item.status === 'EVALUATING' && (
                              <button
                                className="admin-btn-outline"
                                style={{ fontSize: 11, padding: '3px 8px', color: '#16A34A', borderColor: '#16A34A' }}
                                disabled={updatingId === item.id}
                                onClick={() => updateStatus(item.id, 'APPROVED', item.estimatedValueAi)}
                              >
                                ✓ Valider
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="admin-empty-state" style={{ padding: '60px 20px', flexDirection: 'column', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 24 }}>♻️</div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700 }}>Aucune demande de reprise</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Aucune demande de Trade-In ne correspond à vos filtres.</p>
            </div>
          )}
        </div>

        {/* Modal détail demande */}
        {viewItem && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={() => setViewItem(null)}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 500, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Demande {viewItem.referenceNumber}</h3>
                <button onClick={() => setViewItem(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <div><strong>Statut :</strong> <span style={{ color: STATUS_CONFIG[viewItem.status]?.color }}>{STATUS_CONFIG[viewItem.status]?.label}</span></div>
                <div><strong>Appareil :</strong> {DEVICE_LABELS[viewItem.deviceType] || viewItem.deviceType}</div>
                <div><strong>Modèle :</strong> {viewItem.model || '—'}</div>
                <div><strong>Marque :</strong> {viewItem.brand?.name || '—'}</div>
                <div><strong>Année de fabrication :</strong> {viewItem.manufactureYear || '—'}</div>
                <div><strong>État général :</strong> {viewItem.conditionOverall || '—'}</div>
                <div><strong>Valeur estimée :</strong> {viewItem.estimatedValueAi ? `${Number(viewItem.estimatedValueAi).toLocaleString('fr-FR')} TND` : '—'}</div>
                <div><strong>Valeur finale :</strong> {viewItem.finalValue ? `${Number(viewItem.finalValue).toLocaleString('fr-FR')} TND` : '—'}</div>
                {viewItem.reviewNotes && <div><strong>Notes :</strong> {viewItem.reviewNotes}</div>}
                <div><strong>Date soumission :</strong> {viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString('fr-FR') : 'N/A'}</div>
                {viewItem.images?.length > 0 && (
                  <div>
                    <strong>Photos :</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {viewItem.images.map((img: any, i: number) => (
                        <img key={i} src={img.imageUrl || img.url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #E2E8F0' }} />
                      ))}
                    </div>
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
