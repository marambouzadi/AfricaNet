'use client';

import { useState, useEffect } from 'react';
import {
  Search, Eye, Loader2, Download, RefreshCw, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { exportToCSV } from '@/lib/export';

const API_BASE = 'http://localhost:8090/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  SUBMITTED:  { label: 'Soumise',     bg: 'bg-[#EFF6FF] text-[#1A3FA0]', color: '#1A3FA0' },
  EVALUATING: { label: 'En évaluation',bg: 'bg-[#FFFBEB] text-[#D97706]', color: '#D97706' },
  APPROVED:   { label: 'Approuvée',   bg: 'bg-[#DCFCE7] text-[#166534]', color: '#16A34A' },
  REJECTED:   { label: 'Refusée',     bg: 'bg-[#FEF2F2] text-[#991B1B]', color: '#DC2626' },
  COMPLETED:  { label: 'Complétée',   bg: 'bg-[#F5F5F3] text-[#6B7280]', color: '#6B7280' },
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
      || (t.model || '').toLowerCase().includes(search.toLowerCase())
      || (t.brandName || t.brand?.name || '').toLowerCase().includes(search.toLowerCase());
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
    { label: 'Total demandes',    value: tradeIns.length,                                                icon: RefreshCw,    color: 'text-[#1A3FA0]', bg: 'bg-[#E8EDF8]' },
    { label: 'En attente',        value: tradeIns.filter(t => t.status === 'SUBMITTED').length,          icon: Clock,        color: 'text-amber-700', bg: 'bg-amber-100' },
    { label: 'Approuvées',        value: tradeIns.filter(t => t.status === 'APPROVED').length,           icon: CheckCircle,  color: 'text-emerald-700', bg: 'bg-emerald-100' },
    { label: 'Refusées',          value: tradeIns.filter(t => t.status === 'REJECTED').length,           icon: XCircle,      color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white p-6 rounded-xl border border-[#E2E2DF] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-xl flex items-center justify-center shrink-0`}>
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
            placeholder="Rechercher par référence ou modèle..."
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
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
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

      {/* Trade-Ins Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 flex justify-center text-[#1A3FA0]">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280] flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-[#F5F5F3] text-[#6B7280] rounded-full flex items-center justify-center mb-3">
                <RefreshCw className="h-7 w-7" />
              </div>
              <p className="font-bold text-[#1A1A1A] text-base">Aucune demande de reprise</p>
              <p className="text-xs text-[#6B7280] mt-1">Aucune demande de Trade-In ne correspond à vos filtres.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-[#6B7280]">
              <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase text-xs font-semibold border-b border-[#E2E2DF]">
                <tr>
                  <th className="px-6 py-4">Référence</th>
                  <th className="px-6 py-4">Appareil</th>
                  <th className="px-6 py-4">Modèle</th>
                  <th className="px-6 py-4">Valeur Estimée</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DF]">
                {filtered.map((item) => {
                  const cfg = STATUS_CONFIG[item.status] || { label: item.status, bg: 'bg-gray-100 text-gray-700' };

                  return (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#1A3FA0]">
                        {item.referenceNumber || `TRD-${item.id}`}
                      </td>
                      <td className="px-6 py-4 text-[#1A1A1A] font-medium">
                        {DEVICE_LABELS[item.deviceType] || item.deviceType}
                      </td>
                      <td className="px-6 py-4 text-[#1A1A1A]">
                        {item.model || '—'}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1A1A1A]">
                        {item.finalValue
                          ? `${Number(item.finalValue).toLocaleString('fr-FR')} TND`
                          : item.estimatedValueAi
                            ? `~${Number(item.estimatedValueAi).toLocaleString('fr-FR')} TND`
                            : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280]">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Voir détails"
                            onClick={() => setViewItem(item)}
                            className="p-2 text-[#6B7280] hover:text-[#1A3FA0] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {item.status === 'SUBMITTED' && (
                            <>
                              <button
                                disabled={updatingId === item.id}
                                onClick={() => updateStatus(item.id, 'APPROVED', item.estimatedValueAi, 'Demande approuvée')}
                                className="px-2.5 py-1 text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {updatingId === item.id ? <Loader2 className="h-3 w-3 animate-spin inline" /> : 'Approuver'}
                              </button>
                              <button
                                disabled={updatingId === item.id}
                                onClick={() => updateStatus(item.id, 'REJECTED', undefined, 'Ne répond pas aux critères')}
                                className="px-2.5 py-1 text-xs font-semibold border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Refuser
                              </button>
                            </>
                          )}
                          {item.status === 'EVALUATING' && (
                            <button
                              disabled={updatingId === item.id}
                              onClick={() => updateStatus(item.id, 'APPROVED', item.estimatedValueAi)}
                              className="px-2.5 py-1 text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                              Valider
                            </button>
                          )}
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

      {/* Modal Détail Demande */}
      {viewItem && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewItem(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2E2DF] pb-4">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                Demande {viewItem.referenceNumber || `#${viewItem.id}`}
              </h3>
              <button
                onClick={() => setViewItem(null)}
                className="p-1 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F5F3] rounded-lg transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#1A1A1A]">
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Statut</span>
                <span className="font-semibold">{STATUS_CONFIG[viewItem.status]?.label || viewItem.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Appareil</span>
                <span className="font-semibold">{DEVICE_LABELS[viewItem.deviceType] || viewItem.deviceType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Modèle</span>
                <span className="font-semibold">{viewItem.model || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Marque</span>
                <span className="font-semibold">{viewItem.brandName || viewItem.brand?.name || '—'}</span>
              </div>
              {viewItem.conditionDetails?.cpu && (
                <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                  <span className="text-[#6B7280]">Processeur (CPU)</span>
                  <span className="font-semibold">{String(viewItem.conditionDetails.cpu)}</span>
                </div>
              )}
              {viewItem.conditionDetails?.ram && (
                <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                  <span className="text-[#6B7280]">RAM</span>
                  <span className="font-semibold">{String(viewItem.conditionDetails.ram)}</span>
                </div>
              )}
              {viewItem.conditionDetails?.storage && (
                <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                  <span className="text-[#6B7280]">Stockage</span>
                  <span className="font-semibold">{String(viewItem.conditionDetails.storage)}</span>
                </div>
              )}
              {viewItem.conditionDetails?.screenSize && (
                <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                  <span className="text-[#6B7280]">Taille d'écran</span>
                  <span className="font-semibold">{String(viewItem.conditionDetails.screenSize)}"</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Année de fabrication</span>
                <span className="font-semibold">{viewItem.manufactureYear || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">État général</span>
                <span className="font-semibold">{viewItem.conditionOverall || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Valeur estimée (IA)</span>
                <span className="font-bold text-[#1A3FA0]">{viewItem.estimatedValueAi ? `${Number(viewItem.estimatedValueAi).toLocaleString('fr-FR')} TND` : '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Valeur finale retenue</span>
                <span className="font-bold text-emerald-700">{viewItem.finalValue ? `${Number(viewItem.finalValue).toLocaleString('fr-FR')} TND` : '—'}</span>
              </div>
              {(viewItem.reviewNotes || viewItem.conditionDetails?.notes) && (
                <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                  <span className="text-[#6B7280]">Notes</span>
                  <span className="font-semibold">{viewItem.reviewNotes || String(viewItem.conditionDetails.notes)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Date de soumission</span>
                <span className="font-semibold">{viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString('fr-FR') : 'N/A'}</span>
              </div>

              {viewItem.images?.length > 0 && (
                <div className="pt-2">
                  <span className="text-[#6B7280] font-medium block mb-2">Photos de l'appareil :</span>
                  <div className="flex flex-wrap gap-2">
                    {viewItem.images.map((img: any, i: number) => (
                      <img
                        key={i}
                        src={img.imageUrl || img.url}
                        alt="Trade-in preview"
                        className="w-20 h-16 object-cover rounded-lg border border-[#E2E2DF]"
                      />
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
