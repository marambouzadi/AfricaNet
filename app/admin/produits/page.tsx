'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Eye, Package, Check, X, ShieldAlert } from 'lucide-react'
import { formatPrice } from '@/lib/products'

interface ProductItem {
  id: number
  name: string
  brand: string
  category: string
  condition: 'Neuf' | 'Reconditionné' | 'Occasion'
  basePrice: number
  salePrice?: number
  stock: number
  status: 'Actif' | 'Inactif'
}

const initialProducts: ProductItem[] = [
  { id: 1, name: 'Dell XPS 13 9310', brand: 'Dell', category: 'PC Portable', condition: 'Neuf', basePrice: 3200, salePrice: 2990, stock: 8, status: 'Actif' },
  { id: 2, name: 'MacBook Pro 14 M1 Pro', brand: 'Apple', category: 'PC Portable', condition: 'Reconditionné', basePrice: 4500, stock: 3, status: 'Actif' },
  { id: 3, name: 'Lenovo ThinkPad T14 Gen 2', brand: 'Lenovo', category: 'PC Portable', condition: 'Occasion', basePrice: 1650, stock: 12, status: 'Actif' },
  { id: 4, name: 'HP Spectre x360', brand: 'HP', category: 'PC Convertible', condition: 'Neuf', basePrice: 3800, salePrice: 3490, stock: 0, status: 'Inactif' },
  { id: 5, name: 'Asus ROG Strix G15', brand: 'Asus', category: 'Gamer', condition: 'Reconditionné', basePrice: 2850, stock: 5, status: 'Actif' },
]

export default function AdminProduitsPage() {
  const [productsList, setProductsList] = useState<ProductItem[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [conditionFilter, setConditionFilter] = useState<string>('Tous')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Dell',
    category: 'PC Portable',
    condition: 'Neuf' as 'Neuf' | 'Reconditionné' | 'Occasion',
    basePrice: '',
    salePrice: '',
    stock: ''
  })

  const filteredProducts = productsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    const matchesCondition = conditionFilter === 'Tous' || p.condition === conditionFilter
    return matchesSearch && matchesCondition
  })

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.basePrice) return
    const newProduct: ProductItem = {
      id: Date.now(),
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      condition: formData.condition,
      basePrice: parseFloat(formData.basePrice),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
      stock: parseInt(formData.stock || '1', 10),
      status: 'Actif'
    }
    setProductsList(prev => [newProduct, ...prev])
    setIsAddModalOpen(false)
    setFormData({ name: '', brand: 'Dell', category: 'PC Portable', condition: 'Neuf', basePrice: '', salePrice: '', stock: '' })
  }

  const handleDeleteProduct = (id: number) => {
    setProductsList(prev => prev.filter(p => p.id !== id))
  }

  const toggleStatus = (id: number) => {
    setProductsList(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'Actif' ? 'Inactif' : 'Actif' } : p))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Gestion des Produits</h1>
          <p className="text-[#6B7280]">Ajoutez, modifiez ou organisez votre catalogue de produits.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#1A3FA0] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-[#0D2660] transition-colors flex items-center gap-2 shadow-sm shrink-0"
        >
          <Plus className="h-5 w-5" />
          Ajouter un produit
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E2DF] flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Rechercher par nom ou marque..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#6B7280]" />
          <select
            value={conditionFilter}
            onChange={e => setConditionFilter(e.target.value)}
            className="bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          >
            <option value="Tous">Tous les états</option>
            <option value="Neuf">Neuf</option>
            <option value="Reconditionné">Reconditionné</option>
            <option value="Occasion">Occasion</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#6B7280]">
            <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase text-xs font-semibold border-b border-[#E2E2DF]">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">État</th>
                <th className="px-6 py-4">Prix de base</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2DF]">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#1A1A1A]">
                    {p.name}
                    <span className="block text-xs font-normal text-[#6B7280]">{p.brand}</span>
                  </td>
                  <td className="px-6 py-4">{p.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.condition === 'Neuf' ? 'bg-emerald-100 text-emerald-800' :
                      p.condition === 'Reconditionné' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.condition}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#1A1A1A]">
                    {formatPrice(p.basePrice)}
                    {p.salePrice && <span className="block text-xs text-red-600 font-normal">Promo: {formatPrice(p.salePrice)}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${p.stock === 0 ? 'text-red-600' : p.stock < 5 ? 'text-amber-600' : 'text-[#1A1A1A]'}`}>
                      {p.stock} unités
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(p.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        p.status === 'Actif' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-[#E2E2DF] pb-3">
              <h3 className="font-bold text-lg text-[#1A1A1A]">Nouveau produit</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#6B7280] hover:text-[#1A1A1A]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Nom du produit</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Lenovo ThinkPad X1 Carbon"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Marque</label>
                  <select
                    value={formData.brand}
                    onChange={e => setFormData(f => ({ ...f, brand: e.target.value }))}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Dell">Dell</option>
                    <option value="Apple">Apple</option>
                    <option value="Lenovo">Lenovo</option>
                    <option value="HP">HP</option>
                    <option value="Asus">Asus</option>
                    <option value="Acer">Acer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">État</label>
                  <select
                    value={formData.condition}
                    onChange={e => setFormData(f => ({ ...f, condition: e.target.value as any }))}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Neuf">Neuf</option>
                    <option value="Reconditionné">Reconditionné</option>
                    <option value="Occasion">Occasion</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Prix de base (TND)</label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={formData.basePrice}
                    onChange={e => setFormData(f => ({ ...f, basePrice: e.target.value }))}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Prix promo (option)</label>
                  <input
                    type="number"
                    placeholder="2200"
                    value={formData.salePrice}
                    onChange={e => setFormData(f => ({ ...f, salePrice: e.target.value }))}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Stock initial</label>
                  <input
                    type="number"
                    required
                    placeholder="5"
                    value={formData.stock}
                    onChange={e => setFormData(f => ({ ...f, stock: e.target.value }))}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-3 border-t border-[#E2E2DF]">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-[#E2E2DF] text-xs font-medium rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-[#1A3FA0] text-white text-xs font-bold rounded-lg hover:bg-[#0D2660]">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
