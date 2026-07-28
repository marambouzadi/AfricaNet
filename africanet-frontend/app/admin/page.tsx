'use client';

import { useEffect, useState } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  ShoppingCart,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { fetchProducts, fetchStock } from '@/lib/api';

const API_BASE = 'http://localhost:8090/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

const statusColors: Record<string, string> = {
  CONFIRMED: '#22C55E',
  PENDING: '#F97316',
  SHIPPED: '#3B82F6',
  DELIVERED: '#64748B',
  CANCELLED: '#EF4444',
  REFUNDED: '#A855F7',
};

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Confirmée',
  PENDING: 'En attente',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'jour' | 'semaine' | 'mois'>('jour');

  // Raw & Dynamic Data States
  const [rawOrders, setRawOrders] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any[]>([]);
  const [salesChartData, setSalesChartData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const token = getToken();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Fetch Products
        const productsRes = await fetchProducts().catch(() => ({ content: [], totalElements: 0 }));
        const productsList = productsRes.content || [];

        // Condition distribution
        let countRefurbished = 0;
        let countNew = 0;
        let countUsed = 0;

        productsList.forEach((p: any) => {
          if (p.condition === 'REFURBISHED') countRefurbished++;
          else if (p.condition === 'NEW') countNew++;
          else if (p.condition === 'USED') countUsed++;
        });

        const totalCond = countRefurbished + countNew + countUsed || 1;
        const pieData = [
          { name: 'Reconditionné', value: Math.round((countRefurbished / totalCond) * 100) || 0, count: countRefurbished, color: '#1A3FA0' },
          { name: 'Neuf', value: Math.round((countNew / totalCond) * 100) || 0, count: countNew, color: '#22C55E' },
          { name: 'Occasion', value: Math.round((countUsed / totalCond) * 100) || 0, count: countUsed, color: '#F97316' },
        ];
        setPieChartData(pieData);

        // 2. Fetch Orders
        let ordersList: any[] = [];
        try {
          const res = await fetch(`${API_BASE}/admin/orders?size=50`, { headers, cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            ordersList = data.content || data || [];
          }
        } catch (e) {
          console.warn('Orders unavailable:', e);
        }
        setRawOrders(ordersList);

        // Calculate Revenue and Orders Count
        let rev = 0;
        ordersList.forEach((o: any) => {
          if (o.status !== 'CANCELLED') {
            rev += (o.totalAmount || 0);
          }
        });
        setTotalRevenue(rev);

        // Map recent orders
        const mappedOrders = ordersList.slice(0, 5).map((o: any) => ({
          id: o.orderNumber || `CMD-${o.id}`,
          client: o.shippingAddress?.fullName || o.shippingAddress?.firstName || `Client #${o.userId || o.id}`,
          montant: `${(o.totalAmount || 0).toLocaleString('fr-FR')} TND`,
          statut: o.status || 'PENDING',
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'N/A',
        }));
        setRecentOrders(mappedOrders);

        // 3. Fetch Stock
        const stockRes = await fetchStock().catch(() => ({ content: [], totalElements: 0 }));
        const stockList = stockRes.content || [];

        const alerts: any[] = [];
        stockList.forEach((s: any) => {
          const disp = s.quantityAvailable ?? (s.quantity - s.reservedQuantity);
          if (disp <= s.minThreshold || disp === 0) {
            alerts.push({
              name: s.productName || 'Produit',
              sku: s.productSku || `SKU-${s.productId}`,
              stock: disp,
              seuil: s.minThreshold,
              statut: disp === 0 ? 'Rupture' : 'Faible',
            });
          }
        });
        setStockAlerts(alerts);

        // 4. Fetch Trade-Ins / Reprises
        let tradeInCount = 0;
        try {
          const tiRes = await fetch(`${API_BASE}/admin/trade-in?size=50`, { headers, cache: 'no-store' });
          if (tiRes.ok) {
            const tiData = await tiRes.json();
            tradeInCount = tiData.totalElements || tiData.content?.length || 0;
          }
        } catch (e) {
          console.warn('TradeIn unavailable:', e);
        }

        // Build dynamic KPIs
        setKpis([
          {
            icon: ShoppingCart,
            label: 'Chiffre d\'affaires total',
            value: `${rev.toLocaleString('fr-FR')} TND`,
            change: '+100%',
            color: '#3B82F6',
            bg: '#EFF6FF',
          },
          {
            icon: TrendingUp,
            label: 'Commandes totales',
            value: `${ordersList.length}`,
            change: `${ordersList.length} au total`,
            color: '#22C55E',
            bg: '#F0FDF4',
          },
          {
            icon: Users,
            label: 'Demandes de reprise',
            value: `${tradeInCount}`,
            change: 'Actives',
            color: '#A855F7',
            bg: '#FAF5FF',
          },
          {
            icon: AlertTriangle,
            label: 'Alertes stock',
            value: `${alerts.length}`,
            change: `${alerts.length} critique(s)`,
            color: '#EF4444',
            bg: '#FEF2F2',
            danger: alerts.length > 0,
          },
        ]);
      } catch (err) {
        console.error('Erreur lors du chargement du tableau de bord:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Filter Sales Chart according to selected period (Jour / Semaine / Mois)
  useEffect(() => {
    if (period === 'jour') {
      const daysMap: Record<string, number> = { 'Lun': 0, 'Mar': 0, 'Mer': 0, 'Jeu': 0, 'Ven': 0, 'Sam': 0, 'Dim': 0 };
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      rawOrders.forEach((o: any) => {
        if (o.createdAt) {
          const d = new Date(o.createdAt);
          const dayName = dayNames[d.getDay()];
          if (daysMap[dayName] !== undefined) {
            daysMap[dayName] += (o.totalAmount || 0);
          }
        }
      });
      setSalesChartData([
        { day: 'Lun', amount: daysMap['Lun'] },
        { day: 'Mar', amount: daysMap['Mar'] },
        { day: 'Mer', amount: daysMap['Mer'] },
        { day: 'Jeu', amount: daysMap['Jeu'] },
        { day: 'Ven', amount: daysMap['Ven'] },
        { day: 'Sam', amount: daysMap['Sam'] },
        { day: 'Dim', amount: daysMap['Dim'] },
      ]);
    } else if (period === 'semaine') {
      const weeksMap: Record<string, number> = { 'Sem 1': 0, 'Sem 2': 0, 'Sem 3': 0, 'Sem 4': 0 };
      rawOrders.forEach((o: any) => {
        if (o.createdAt) {
          const d = new Date(o.createdAt);
          const dateNum = d.getDate();
          let weekKey = 'Sem 1';
          if (dateNum > 21) weekKey = 'Sem 4';
          else if (dateNum > 14) weekKey = 'Sem 3';
          else if (dateNum > 7) weekKey = 'Sem 2';
          weeksMap[weekKey] += (o.totalAmount || 0);
        }
      });
      setSalesChartData([
        { day: 'Sem 1', amount: weeksMap['Sem 1'] },
        { day: 'Sem 2', amount: weeksMap['Sem 2'] },
        { day: 'Sem 3', amount: weeksMap['Sem 3'] },
        { day: 'Sem 4', amount: weeksMap['Sem 4'] },
      ]);
    } else if (period === 'mois') {
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
      const monthsMap: Record<string, number> = {};
      monthNames.forEach(m => monthsMap[m] = 0);

      rawOrders.forEach((o: any) => {
        if (o.createdAt) {
          const d = new Date(o.createdAt);
          const monthName = monthNames[d.getMonth()];
          if (monthsMap[monthName] !== undefined) {
            monthsMap[monthName] += (o.totalAmount || 0);
          }
        }
      });
      setSalesChartData(monthNames.map(m => ({ day: m, amount: monthsMap[m] })));
    }
  }, [period, rawOrders]);

  return (
    <div className="admin-page">
      <AdminHeader title="Tableau de bord" breadcrumb="Accueil / Tableau de bord" />

      <div className="admin-content">
        {loading ? (
          <div className="admin-empty-state" style={{ padding: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Loader2 size={32} className="spin" style={{ color: '#1A3FA0', marginBottom: 16 }} />
            <p>Chargement des données en direct depuis le serveur...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="admin-kpi-grid">
              {kpis.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} className="admin-kpi-card">
                    <div className="admin-kpi-top">
                      <div className="admin-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>
                        <Icon size={20} />
                      </div>
                      <span className={`admin-kpi-change ${kpi.danger ? 'admin-kpi-change-danger' : 'admin-kpi-change-success'}`}>
                        <ArrowUpRight size={12} /> {kpi.change}
                      </span>
                    </div>
                    <div className="admin-kpi-value">{kpi.value}</div>
                    <div className="admin-kpi-label">{kpi.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Charts Row */}
            <div className="admin-charts-row">
              {/* Bar Chart */}
              <div className="admin-card admin-chart-main">
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 className="admin-card-title" style={{ margin: 0 }}>
                    Évolution des ventes {period === 'jour' ? 'par jour' : period === 'semaine' ? 'par semaine' : 'par mois'}
                  </h3>
                  <div className="admin-select-wrapper" style={{ width: 'auto' }}>
                    <select
                      value={period}
                      onChange={(e: any) => setPeriod(e.target.value)}
                      className="admin-select"
                      style={{ padding: '6px 28px 6px 12px', fontSize: 13, fontWeight: 600 }}
                    >
                      <option value="jour">Par Jour</option>
                      <option value="semaine">Par Semaine</option>
                      <option value="mois">Par Mois</option>
                    </select>
                    <ChevronDown size={14} className="admin-select-icon" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={salesChartData} barSize={28}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString('fr-FR')} TND`, 'Ventes']} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                      {salesChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.amount > 0 ? '#1A3FA0' : '#E2E8F0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="admin-chart-footer">
                  <span className="admin-chart-total">Total : <strong>{totalRevenue.toLocaleString('fr-FR')} TND</strong></span>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="admin-card admin-chart-side">
                <h3 className="admin-card-title">Répartition par état du produit</h3>
                <div className="admin-donut-wrapper">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="admin-pie-legend">
                  {pieChartData.map((item) => (
                    <div key={item.name} className="admin-pie-legend-item">
                      <span className="admin-pie-dot" style={{ background: item.color }} />
                      <span className="admin-pie-name">{item.name}</span>
                      <span className="admin-pie-pct">{item.value}%</span>
                      <span className="admin-pie-amount">{item.count} produit(s)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="admin-bottom-row">
              {/* Recent Orders */}
              <div className="admin-card admin-recent-orders">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Dernières commandes</h3>
                  <a href="/admin/commandes" className="admin-view-all">Voir tout →</a>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="admin-empty-state">Aucune commande enregistrée.</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Référence</th>
                        <th>Client</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="admin-table-ref">{order.id}</td>
                          <td>{order.client}</td>
                          <td className="admin-table-amount">{order.montant}</td>
                          <td>
                            <span className="admin-status-badge" style={{ background: `${statusColors[order.statut] || '#64748B'}20`, color: statusColors[order.statut] || '#64748B' }}>
                              {statusLabels[order.statut] || order.statut}
                            </span>
                          </td>
                          <td className="admin-table-date">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Stock Alerts */}
              <div className="admin-card admin-stock-alerts">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">Alertes de stock</h3>
                  <span className="admin-alert-count">{stockAlerts.length} produits</span>
                </div>
                <div className="admin-alert-list">
                  {stockAlerts.length === 0 ? (
                    <div className="admin-empty-state">Aucune alerte de stock.</div>
                  ) : (
                    stockAlerts.map((item) => (
                      <div key={item.sku} className="admin-alert-item">
                        <div>
                          <div className="admin-alert-name">{item.name}</div>
                          <div className="admin-alert-sku">{item.sku}</div>
                        </div>
                        <div className="admin-alert-right">
                          <span className="admin-stock-num" style={{ color: item.stock === 0 ? '#EF4444' : '#F97316' }}>
                            {item.stock}/{item.seuil}
                          </span>
                          <span className={`admin-status-badge ${item.statut === 'Rupture' ? 'admin-badge-rupture' : 'admin-badge-faible'}`}>
                            {item.statut}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
