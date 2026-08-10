'use client';

import { useState, useEffect } from 'react';
import {
  Search, Eye, Loader2, Download,
  Users, ShoppingBag, Star, Ban
} from 'lucide-react';
import { exportToCSV } from '@/lib/export';

const API_BASE = 'http://localhost:8090/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

function getIsActive(client: any): boolean {
  if (client.isActive !== undefined) return Boolean(client.isActive);
  if (client.active !== undefined) return Boolean(client.active);
  if (client.enabled !== undefined) return Boolean(client.enabled);
  return true;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tous les rôles');
  const [viewClient, setViewClient] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = getToken();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/admin/users?size=100`, { headers, cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setClients(data.content || (Array.isArray(data) ? data : []));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

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
      getIsActive(c) ? 'Oui' : 'Non',
      c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : 'N/A',
    ]);
    exportToCSV('export_clients', headers, rows);
  };

  const kpis = [
    { label: 'Total clients',   value: clients.length,                                       icon: Users,      color: 'text-[#1A3FA0]', bg: 'bg-[#E8EDF8]' },
    { label: 'Clients actifs',  value: clients.filter(c => getIsActive(c)).length,           icon: ShoppingBag,color: 'text-emerald-700', bg: 'bg-emerald-100' },
    { label: 'Administrateurs', value: clients.filter(c => c.role === 'ADMIN').length,        icon: Star,       color: 'text-amber-700', bg: 'bg-amber-100' },
    { label: 'Désactivés',      value: clients.filter(c => !getIsActive(c)).length,          icon: Ban,        color: 'text-red-600', bg: 'bg-red-100' },
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
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg pl-10 pr-4 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 cursor-pointer"
          >
            <option>Tous les rôles</option>
            <option value="CUSTOMER">Client</option>
            <option value="ADMIN">Administrateur</option>
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E2DF] hover:bg-[#F5F5F3] text-[#1A1A1A] rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            <Download className="h-4 w-4" /> Exporter
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 flex justify-center text-[#1A3FA0]">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[#6B7280] flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-[#F5F5F3] text-[#6B7280] rounded-full flex items-center justify-center mb-3">
                <Users className="h-7 w-7" />
              </div>
              <p className="font-bold text-[#1A1A1A] text-base">Aucun client trouvé</p>
              <p className="text-xs text-[#6B7280] mt-1">Aucun client ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-[#6B7280]">
              <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase text-xs font-semibold border-b border-[#E2E2DF]">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Statut</th>
                  <th className="px-6 py-4">Date Inscription</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DF]">
                {filtered.map((client) => {
                  const active = getIsActive(client);
                  const initials = `${client.firstName?.[0] ?? '?'}${client.lastName?.[0] ?? ''}`.toUpperCase();

                  return (
                    <tr key={client.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1A3FA0] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1A1A1A] text-sm">
                              {client.firstName} {client.lastName}
                            </p>
                            <p className="text-xs text-[#6B7280]">#{client.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#1A1A1A]">
                        {client.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          client.role === 'ADMIN' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]' : 'bg-[#EFF6FF] text-[#1A3FA0] border border-[#BFDBFE]'
                        }`}>
                          {client.role === 'ADMIN' ? '★ Administrateur' : 'Client'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          active ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'
                        }`}>
                          {active ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#6B7280]">
                        {client.createdAt ? new Date(client.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          title="Voir profil"
                          onClick={() => setViewClient(client)}
                          className="p-2 text-[#6B7280] hover:text-[#1A3FA0] hover:bg-[#EFF6FF] rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Détail Client */}
      {viewClient && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setViewClient(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2E2DF] pb-4">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Profil Client</h3>
              <button
                onClick={() => setViewClient(null)}
                className="p-1 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F5F3] rounded-lg transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 bg-[#F5F5F3] p-4 rounded-xl border border-[#E2E2DF]">
              <div className="w-12 h-12 rounded-full bg-[#1A3FA0] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
                {`${viewClient.firstName?.[0] ?? '?'}${viewClient.lastName?.[0] ?? ''}`.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#1A1A1A] text-base truncate">{viewClient.firstName} {viewClient.lastName}</p>
                <p className="text-xs text-[#6B7280] truncate">{viewClient.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#1A1A1A]">
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">ID</span>
                <span className="font-semibold">#{viewClient.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Rôle</span>
                <span className="font-semibold">{viewClient.role === 'ADMIN' ? 'Administrateur' : 'Client'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Statut</span>
                <span className={`font-semibold ${getIsActive(viewClient) ? 'text-emerald-600' : 'text-red-600'}`}>
                  {getIsActive(viewClient) ? 'Actif' : 'Désactivé'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Téléphone</span>
                <span className="font-semibold">{viewClient.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F5F3]">
                <span className="text-[#6B7280]">Date d'inscription</span>
                <span className="font-semibold">{viewClient.createdAt ? new Date(viewClient.createdAt).toLocaleString('fr-FR') : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
