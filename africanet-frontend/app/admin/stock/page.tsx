'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Search, Download, SlidersHorizontal, ChevronDown, Package, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { fetchStock } from '@/lib/api';
import { exportToCSV } from '@/lib/export';

const conditionColors: Record<string, { bg: string; color: string }> = {
  'Reconditionné': { bg: '#EFF6FF', color: '#1A3FA0' },
  'Occasion': { bg: '#FFF7ED', color: '#EA580C' },
  'Neuf': { bg: '#F0FDF4', color: '#16A34A' },
  'N/A': { bg: '#F3F4F6', color: '#374151' },
};

const statutConfig: Record<string, { bg: string; color: string; label: string }> = {
  Normal: { bg: '#F0FDF4', color: '#16A34A', label: 'Normal' },
  Faible: { bg: '#FFF7ED', color: '#EA580C', label: 'Faible' },
  Rupture: { bg: '#FEF2F2', color: '#DC2626', label: 'Rupture' },
};

export default function AdminStockPage() {
  const [search, setSearch] = useState('');
  const [etat, setEtat] = useState('Tous les états');
  const [marque, setMarque] = useState('Toutes marques');

  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchStock();
        const mapped = res.content.map((item: any) => {
          const disponible = item.quantityAvailable ?? (item.quantity - item.reservedQuantity);
          let statut = 'Normal';
          if (disponible === 0) statut = 'Rupture';
          else if (disponible <= item.minThreshold) statut = 'Faible';

          return {
            id: item.productId,
            image: '💻',
            name: item.productName || 'Produit sans nom',
            sku: item.productSku || `SKU-${item.productId}`,
            condition: 'N/A',
            stockActuel: item.quantity,
            reserve: item.reservedQuantity,
            disponible,
            seuil: item.minThreshold,
            statut
          };
        });
        setStockData(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = stockData.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchEtat = etat === 'Tous les états' || p.statut === etat;
    const matchMarque = marque === 'Toutes marques' || p.name.toLowerCase().includes(marque.toLowerCase());
    
    return matchSearch && matchEtat && matchMarque;
  });

  const handleExport = () => {
    const headers = ['ID Produit', 'Nom du produit', 'SKU', 'Stock Total', 'Réservé', 'Disponible', 'Seuil d\'Alerte', 'Statut'];
    const rows = filtered.map(item => [
      item.id,
      item.name,
      item.sku,
      item.stockActuel,
      item.reserve,
      item.disponible,
      item.seuil,
      item.statut
    ]);
    exportToCSV('export_inventaire_stock', headers, rows);
  };

  const total = stockData.length;
  const enStock = stockData.filter(p => p.statut === 'Normal').length;
  const faible = stockData.filter(p => p.statut === 'Faible').length;
  const epuise = stockData.filter(p => p.statut === 'Rupture').length;

  return (
    <div className="admin-page">
      <AdminHeader title="Gestion du stock" breadcrumb="Catalogue / Stock" />
      <div className="admin-content">

        {/* KPI Cards */}
        <div className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="admin-kpi-top">
              <div className="admin-kpi-icon" style={{ background: '#EFF6FF', color: '#1A3FA0' }}><Package size={20} /></div>
            </div>
            <div className="admin-kpi-value">{total}</div>
            <div className="admin-kpi-label">Produits en catalogue</div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-top">
              <div className="admin-kpi-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}><CheckCircle2 size={20} /></div>
            </div>
            <div className="admin-kpi-value">{enStock}</div>
            <div className="admin-kpi-label">En stock</div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-top">
              <div className="admin-kpi-icon" style={{ background: '#FFFBEB', color: '#D97706' }}><AlertTriangle size={20} /></div>
            </div>
            <div className="admin-kpi-value" style={{ color: '#D97706' }}>{faible}</div>
            <div className="admin-kpi-label">Stock faible (&lt; seuil)</div>
          </div>
          <div className="admin-kpi-card">
            <div className="admin-kpi-top">
              <div className="admin-kpi-icon" style={{ background: '#FEF2F2', color: '#DC2626' }}><XCircle size={20} /></div>
            </div>
            <div className="admin-kpi-value" style={{ color: '#DC2626' }}>{epuise}</div>
            <div className="admin-kpi-label">Épuisés</div>
          </div>
        </div>

        <div className="admin-card">
          {/* Filters */}
          <div className="admin-filters-bar">
            <div className="admin-search-field">
              <Search size={16} className="admin-search-icon-sm" />
              <input
                type="text"
                placeholder="Rechercher un produit ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-input"
              />
            </div>
            <div className="admin-filters-right">
              {[
                { value: etat, setter: setEtat, options: ['Tous les états', 'Normal', 'Faible', 'Rupture'] },
                { value: marque, setter: setMarque, options: ['Toutes marques', 'HP', 'Dell', 'Lenovo', 'Asus'] },
              ].map((filter) => (
                <div key={filter.value} className="admin-select-wrapper">
                  <select value={filter.value} onChange={(e) => filter.setter(e.target.value)} className="admin-select">
                    {filter.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={14} className="admin-select-icon" />
                </div>
              ))}
              <button className="admin-btn-outline" onClick={handleExport}>
                <Download size={16} /> Exporter l'inventaire
              </button>
              <button className="admin-btn-primary">
                <SlidersHorizontal size={16} /> Ajuster le stock
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="admin-empty-state"><Loader2 size={24} className="spin" style={{ color: '#1A3FA0' }} /></div>
          ) : (
            <table className="admin-table admin-table-full">
              <thead>
                <tr>
                  <th>PRODUIT</th>
                  <th>SKU</th>
                  <th>STOCK ACTUEL</th>
                  <th>RÉSERVÉ</th>
                  <th>DISPONIBLE</th>
                  <th>SEUIL</th>
                  <th>STATUT</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const stat = statutConfig[item.statut] || { bg: '#F3F4F6', color: '#374151', label: item.statut };
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="admin-product-row">
                          <div className="admin-product-image-sm">{item.image}</div>
                          <span className="admin-product-name">{item.name}</span>
                        </div>
                      </td>
                      <td className="admin-product-ref">{item.sku}</td>
                      <td className="admin-table-center">{item.stockActuel}</td>
                      <td className="admin-table-center">{item.reserve}</td>
                      <td className="admin-table-center" style={{ color: item.disponible === 0 ? '#EF4444' : item.disponible <= item.seuil ? '#F97316' : '#22C55E', fontWeight: 600 }}>
                        {item.disponible}
                      </td>
                      <td className="admin-table-center">{item.seuil}</td>
                      <td>
                        <span className="admin-status-badge" style={{ background: stat.bg, color: stat.color }}>
                          {stat.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {!loading && filtered.length === 0 && (
            <div className="admin-empty-state" style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color: '#64748B' }}>
                📦
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1E293B' }}>Inventaire vide</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#64748B' }}>Aucun élément de stock ne correspond à vos filtres.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
