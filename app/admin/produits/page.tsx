'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Eye, Package, Check, X, ShieldAlert, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/products'

const API_BASE = 'http://localhost:8090/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

export default function AdminProduitsPage() {
  const [productsList, setProductsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [conditionFilter, setConditionFilter] = useState<string>('Tous')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  // Available brands to suggest in datalist
  const [availableBrands, setAvailableBrands] = useState<any[]>([])

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brandName: '', // Switched from strict brandId/brand select
    categoryId: 1, // Default to a valid category (e.g. 1 = Laptops)
    condition: 'Neuf' as 'Neuf' | 'Reconditionné' | 'Occasion',
    basePrice: '',
    salePrice: '',
    stock: ''
  })

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, [])

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products?size=100`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProductsList(data.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API_BASE}/brands`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAvailableBrands(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredProducts = productsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.brandName && p.brandName.toLowerCase().includes(search.toLowerCase()));
    const matchesCondition = conditionFilter === 'Tous' || p.condition === conditionFilter;
    return matchesSearch && matchesCondition;
  })

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.basePrice) return

    const payload = {
      name: formData.name,
      brandName: formData.brandName,
      categoryId: formData.categoryId,
      condition: formData.condition,
      basePrice: parseFloat(formData.basePrice),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      stock: parseInt(formData.stock || '1', 10),
      isFeatured: false,
      weightKg: 1.0,
      description: "Description du produit " + formData.name
    }

    try {
      const token = getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newProduct = await res.json();
        setProductsList(prev => [newProduct, ...prev]);
        setIsAddModalOpen(false);
        setFormData({ name: '', brandName: '', categoryId: 1, condition: 'Neuf', basePrice: '', salePrice: '', stock: '' });
        fetchBrands(); // Refresh brands in case a new one was added
      } else {
        alert("Erreur lors de la création du produit");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Voulez-vous vraiment désactiver ce produit ?")) return;
    try {
      const token = getToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setProductsList(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const toggleStatus = async (product: any) => {
    // In this basic version, we can just flip isActive if we had a toggle endpoint.
    // For now, we simulate UI change. To do it correctly, we'd PUT /api/products/{id}
    setProductsList(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p))
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
            className="w-full pl-10 pr-4 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 transition-shadow"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={conditionFilter}
            onChange={e => setConditionFilter(e.target.value)}
            className="px-4 py-2 border border-[#E2E2DF] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          >
            <option value="Tous">Tous les états</option>
            <option value="Neuf">Neuf</option>
            <option value="Reconditionné">Reconditionné</option>
            <option value="Occasion">Occasion</option>
          </select>
          <button className="px-4 py-2 border border-[#E2E2DF] rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#6B7280]" />
            Filtres
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F5F3] text-[#1A1A1A] font-semibold border-b border-[#E2E2DF]">
              <tr>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2DF]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6B7280]">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#1A3FA0]" />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6B7280]">
                    <Package className="h-12 w-12 mx-auto text-[#E2E2DF] mb-3" />
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-[#F5F5F3]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {p.images && p.images[0] ? (
                            <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover mix-blend-multiply" />
                          ) : (
                            <Package className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#1A1A1A]">{p.name}</p>
                          <p className="text-xs text-[#6B7280]">{p.brandName} • {p.condition}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8EDF8] text-[#1A3FA0]">
                        {p.categoryName || 'Non classé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#1A1A1A]">
                      {formatPrice(p.basePrice)}
                      {p.salePrice && <span className="block text-xs text-red-600 font-normal">Promo: {formatPrice(p.salePrice)}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(p)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          p.isActive !== false ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {p.isActive !== false ? 'Actif' : 'Inactif'}
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
                ))
              )}
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
                  <input
                    type="text"
                    list="brand-list"
                    required
                    placeholder="Saisissez ou choisissez"
                    value={formData.brandName}
                    onChange={e => setFormData(f => ({ ...f, brandName: e.target.value }))}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
                  />
                  <datalist id="brand-list">
                    {availableBrands.map((b: any) => (
                      <option key={b.id} value={b.name} />
                    ))}
                  </datalist>
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
