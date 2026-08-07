'use client'

import { useState, useEffect } from 'react'
import { Box, AlertTriangle, ArrowUpRight, ArrowDownRight, Search, Plus, Minus, X, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'

interface StockItem {
  id: number
  productId: number
  productName: string
  sku: string
  quantity: number
  reserved: number
  minThreshold: number
  warehouse: string
  lastUpdated: string
}

export default function AdminStockPage() {
  const [stockList, setStockList] = useState<StockItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null)
  const [adjustment, setAdjustment] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  const loadStock = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/stock', { params: { size: 1000 } })
      const mapped = (data.content || []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName || 'Produit Inconnu',
        sku: item.sku || 'N/A',
        quantity: item.quantity,
        reserved: item.reservedQuantity,
        minThreshold: item.minThreshold || 5,
        warehouse: item.warehouseLocation || 'Entrepôt Principal',
        lastUpdated: new Date(item.lastUpdated || item.createdAt).toLocaleDateString('fr-FR'),
      }))
      setStockList(mapped)
    } catch (e) {
      console.error('Failed to load stock', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStock()
  }, [])

  const filteredStock = stockList.filter(s =>
    s.productName.toLowerCase().includes(search.toLowerCase()) ||
    s.sku.toLowerCase().includes(search.toLowerCase())
  )

  const lowStockCount = stockList.filter(s => s.quantity <= s.minThreshold && s.quantity > 0).length
  const outOfStockCount = stockList.filter(s => s.quantity <= 0).length

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStock) return
    try {
      await api.put(`/stock/${selectedStock.productId}`, {
        movementType: 'ADJUSTMENT',
        quantity: adjustment,
        notes: notes || 'Ajustement manuel'
      })
      await loadStock()
      setSelectedStock(null)
      setAdjustment(0)
      setNotes('')
    } catch (err) {
      alert("Erreur lors de l'ajustement du stock")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Stock & Inventaire</h1>
        <p className="text-[#6B7280]">Suivez le stock en temps réel, ajustez les quantités et gérez les réapprovisionnements.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E2E2DF] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E8EDF8] text-[#1A3FA0] rounded-xl flex items-center justify-center">
            <Box className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Total Références</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{stockList.length} produits</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E2E2DF] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Stock Critique (&lt; Seuil)</p>
            <p className="text-2xl font-bold text-amber-700">{lowStockCount} alerte{lowStockCount > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E2E2DF] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Ruptures de Stock</p>
            <p className="text-2xl font-bold text-red-600">{outOfStockCount} produit{outOfStockCount > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E2DF]">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Rechercher par nom de produit ou SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          />
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#6B7280]">
            <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase text-xs font-semibold border-b border-[#E2E2DF]">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Stock Disponible</th>
                <th className="px-6 py-4">Stock Réservé</th>
                <th className="px-6 py-4">Emplacement</th>
                <th className="px-6 py-4">Dernière MàJ</th>
                <th className="px-6 py-4 text-right">Ajustement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2DF]">
              {filteredStock.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#1A1A1A]">{s.productName}</td>
                  <td className="px-6 py-4 font-mono text-xs text-[#6B7280]">{s.sku}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold px-2.5 py-1 rounded-full text-xs ${
                      s.quantity === 0 ? 'bg-red-100 text-red-700' :
                      s.quantity <= s.minThreshold ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {s.quantity} unités
                    </span>
                  </td>
                  <td className="px-6 py-4">{s.reserved} unités</td>
                  <td className="px-6 py-4">{s.warehouse}</td>
                  <td className="px-6 py-4 text-xs text-[#6B7280]">{s.lastUpdated}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setSelectedStock(s); setAdjustment(0); }}
                      className="px-3 py-1.5 bg-[#E8EDF8] text-[#1A3FA0] hover:bg-[#1A3FA0] hover:text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ml-auto"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Ajuster
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-[#E2E2DF] pb-3">
              <h3 className="font-bold text-lg text-[#1A1A1A]">Ajuster Stock : {selectedStock.productName}</h3>
              <button onClick={() => setSelectedStock(null)} className="text-[#6B7280] hover:text-[#1A1A1A]"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div className="bg-[#F5F5F3] p-3 rounded-lg flex justify-between text-xs">
                <span>Stock Actuel : <strong className="text-[#1A1A1A]">{selectedStock.quantity}</strong></span>
                <span>Réservé : <strong className="text-[#1A1A1A]">{selectedStock.reserved}</strong></span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Ajustement (+ / -)</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustment(a => a - 1)}
                    className="p-2 border border-[#E2E2DF] rounded-lg hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustment}
                    onChange={e => setAdjustment(parseInt(e.target.value || '0', 10))}
                    className="flex-1 text-center font-bold text-lg border border-[#E2E2DF] rounded-lg py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustment(a => a + 1)}
                    className="p-2 border border-[#E2E2DF] rounded-lg hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-[#6B7280] mt-1 text-center">
                  Nouveau stock prévu : <strong className="text-[#1A3FA0]">{Math.max(0, selectedStock.quantity + adjustment)}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Motif de l'ajustement</label>
                <input
                  type="text"
                  placeholder="ex: Réapprovisionnement fournisseur, Perte..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-[#E2E2DF]">
                <button type="button" onClick={() => setSelectedStock(null)} className="px-4 py-2 border border-[#E2E2DF] text-xs font-medium rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#1A3FA0] text-white text-xs font-bold rounded-lg hover:bg-[#0D2660]">Valider l'ajustement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
