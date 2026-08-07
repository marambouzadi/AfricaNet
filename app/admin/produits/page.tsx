'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Eye, Package, Check, X, ShieldAlert, Loader2, Upload, ImageIcon } from 'lucide-react'
import { formatPrice } from '@/lib/products'
import Image from 'next/image'

const API_BASE = 'http://localhost:8090/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

// Custom Delete Confirmation Modal
function DeleteModal({ product, onConfirm, onCancel, deleting }: {
  product: any;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#1A1A1A]">Confirmer la suppression</h3>
            <p className="text-sm text-[#6B7280]">Cette action est irréversible</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
          <p className="text-sm text-[#1A1A1A]">
            Vous êtes sur le point de supprimer le produit{' '}
            <span className="font-bold">«&nbsp;{product.name}&nbsp;»</span>.
            Il sera retiré du catalogue et ne sera plus visible pour les clients.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="px-5 py-2.5 border border-[#E2E2DF] text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProduitsPage() {
  const [productsList, setProductsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [conditionFilter, setConditionFilter] = useState<string>('Tous')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)
  
  // Available brands to suggest in datalist
  const [availableBrands, setAvailableBrands] = useState<any[]>([])
  
  const [editProductId, setEditProductId] = useState<number | null>(null)

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<{ url: string; isPrimary: boolean; file?: File; preview?: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    categoryId: 1,
    condition: 'Neuf' as 'Neuf' | 'Reconditionné' | 'Occasion',
    basePrice: '',
    salePrice: '',
    stock: ''
  })
  const [specs, setSpecs] = useState<{ specKey: string; specValue: string }[]>([])
  const [ratings, setRatings] = useState({ ecran: '', batterie: '', performances: '', esthetique: '' })

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

  // --- Image Upload Handling ---
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    const newImages: { url: string; isPrimary: boolean; preview?: string }[] = []

    for (const file of files) {
      // Create local preview
      const preview = URL.createObjectURL(file)

      // Upload to server
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const { url } = await res.json()
          newImages.push({ url, isPrimary: uploadedImages.length === 0 && newImages.length === 0, preview })
        }
      } catch (err) {
        console.error('Upload failed for', file.name, err)
      }
    }

    setUploadedImages(prev => [
      ...prev,
      ...newImages.map((img, i) => ({
        ...img,
        isPrimary: prev.length === 0 && i === 0,
      }))
    ])
    setUploading(false)

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (idx: number) => {
    setUploadedImages(prev => {
      const next = prev.filter((_, i) => i !== idx)
      // If we removed the primary, make the first one primary
      if (prev[idx]?.isPrimary && next.length > 0) {
        next[0].isPrimary = true
      }
      return next
    })
  }

  const setPrimaryImage = (idx: number) => {
    setUploadedImages(prev => prev.map((img, i) => ({ ...img, isPrimary: i === idx })))
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
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
      description: 'Description du produit ' + formData.name,
      images: uploadedImages.map((img, idx) => ({
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: idx,
        altText: formData.name,
      })),
      specifications: [
        ...specs.filter(s => s.specKey.trim() !== '' && s.specValue.trim() !== ''),
        ...(ratings.ecran ? [{ specKey: 'Écran', specValue: ratings.ecran }] : []),
        ...(ratings.batterie ? [{ specKey: 'Batterie', specValue: ratings.batterie }] : []),
        ...(ratings.performances ? [{ specKey: 'Performances', specValue: ratings.performances }] : []),
        ...(ratings.esthetique ? [{ specKey: 'Esthétique', specValue: ratings.esthetique }] : [])
      ],
    }

    try {
      const token = getToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const url = editProductId ? `${API_BASE}/products/${editProductId}` : `${API_BASE}/products`;
      const method = editProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedProduct = await res.json();
        if (editProductId) {
          setProductsList(prev => prev.map(p => p.id === editProductId ? savedProduct : p));
        } else {
          setProductsList(prev => [savedProduct, ...prev]);
        }
        closeModal();
        fetchBrands();
      } else {
        alert('Erreur lors de l\'enregistrement du produit');
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau');
    }
  }

  const handleEditClick = (product: any) => {
    setEditProductId(product.id)
    setFormData({
      name: product.name || '',
      brandName: product.brandName || '',
      categoryId: product.categoryId || 1,
      condition: product.condition || 'Neuf',
      basePrice: product.basePrice ? product.basePrice.toString() : '',
      salePrice: product.salePrice ? product.salePrice.toString() : '',
      stock: product.stock ? product.stock.toString() : '0'
    })
    
    setRatings({
      ecran: product.specifications?.find((s:any) => s.specKey.toLowerCase() === 'écran' || s.specKey.toLowerCase() === 'ecran')?.specValue || '',
      batterie: product.specifications?.find((s:any) => s.specKey.toLowerCase() === 'batterie')?.specValue || '',
      performances: product.specifications?.find((s:any) => s.specKey.toLowerCase() === 'performances' || s.specKey.toLowerCase() === 'performance')?.specValue || '',
      esthetique: product.specifications?.find((s:any) => s.specKey.toLowerCase() === 'esthétique' || s.specKey.toLowerCase() === 'esthetique')?.specValue || ''
    })

    setSpecs(product.specifications?.filter((s:any) => !['écran', 'ecran', 'batterie', 'performances', 'performance', 'esthétique', 'esthetique'].includes(s.specKey.toLowerCase())).map((s: any) => ({ specKey: s.specKey, specValue: s.specValue })) || [])
    setUploadedImages(product.images?.map((img: any) => ({ url: img.url || img.imageUrl, isPrimary: img.isPrimary })) || [])
    setIsAddModalOpen(true)
  }

  const closeModal = () => {
    setIsAddModalOpen(false)
    setEditProductId(null)
    setFormData({ name: '', brandName: '', categoryId: 1, condition: 'Neuf', basePrice: '', salePrice: '', stock: '' })
    setSpecs([])
    setRatings({ ecran: '', batterie: '', performances: '', esthetique: '' })
    setUploadedImages([])
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true)
    try {
      const token = getToken();
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        setProductsList(prev => prev.filter(p => p.id !== productToDelete.id));
        setProductToDelete(null)
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false)
    }
  }

  const toggleStatus = async (product: any) => {
    setProductsList(prev => prev.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p))
  }

  return (
    <div className="space-y-6">
      {/* Custom Delete Confirmation */}
      {productToDelete && (
        <DeleteModal
          product={productToDelete}
          onConfirm={handleDeleteProduct}
          onCancel={() => setProductToDelete(null)}
          deleting={deleting}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Gestion des Produits</h1>
          <p className="text-[#6B7280]">Ajoutez, modifiez ou organisez votre catalogue de produits.</p>
        </div>
        <button
          onClick={() => {
            setEditProductId(null);
            setIsAddModalOpen(true);
          }}
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
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                          {p.images && p.images[0] ? (
                            <Image src={p.images.find((i: any) => i.isPrimary)?.url || p.images[0].url} alt={p.name} fill className="object-contain p-1" />
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
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E2E2DF] flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-[#1A1A1A]">
                {editProductId ? 'Modifier le produit' : 'Ajouter un nouveau produit'}
              </h2>
              <button onClick={closeModal} className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors"><X className="h-6 w-6" /></button>
            </div>
            
            <form onSubmit={handleSubmitProduct} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Product Info */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Nom du produit *</label>
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
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Marque *</label>
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
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">État *</label>
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
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Prix de base (TND) *</label>
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
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Prix promo (optionnel)</label>
                    <input
                      type="number"
                      placeholder="2200"
                      value={formData.salePrice}
                      onChange={e => setFormData(f => ({ ...f, salePrice: e.target.value }))}
                      className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Stock initial *</label>
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
              </div>

              {/* Specifications Section */}
              <div className="border-t border-[#E2E2DF] pt-5">
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-3">Spécifications techniques</label>
                <div className="space-y-3">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: RAM, Stockage..."
                        value={spec.specKey}
                        onChange={e => setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, specKey: e.target.value } : s))}
                        className="w-1/3 border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Ex: 16 Go DDR4, 512 Go SSD..."
                        value={spec.specValue}
                        onChange={e => setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, specValue: e.target.value } : s))}
                        className="flex-1 border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setSpecs(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSpecs(prev => [...prev, { specKey: '', specValue: '' }])}
                    className="text-sm text-[#1A3FA0] font-medium hover:underline flex items-center gap-1"
                  >
                    + Ajouter une spécification
                  </button>
                </div>
              </div>

              {/* Ratings Section */}
              <div className="border-t border-[#E2E2DF] pt-5">
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-3">État & Notes (sur 10)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Écran</label>
                    <input type="number" min="0" max="10" placeholder="Ex: 9" value={ratings.ecran} onChange={e => setRatings({...ratings, ecran: e.target.value})} className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Batterie</label>
                    <input type="number" min="0" max="10" placeholder="Ex: 8" value={ratings.batterie} onChange={e => setRatings({...ratings, batterie: e.target.value})} className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Performances</label>
                    <input type="number" min="0" max="10" placeholder="Ex: 10" value={ratings.performances} onChange={e => setRatings({...ratings, performances: e.target.value})} className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B7280] mb-1">Esthétique</label>
                    <input type="number" min="0" max="10" placeholder="Ex: 7" value={ratings.esthetique} onChange={e => setRatings({...ratings, esthetique: e.target.value})} className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="border-t border-[#E2E2DF] pt-5">
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#1A3FA0]" />
                  Photos du produit
                  <span className="text-[#6B7280] font-normal">(max 5 Mo par photo)</span>
                </label>

                {/* Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E2E2DF] rounded-xl p-6 text-center cursor-pointer hover:border-[#1A3FA0]/40 hover:bg-[#F5F5F3] transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-[#1A3FA0] animate-spin" />
                      <p className="text-sm text-[#6B7280]">Upload en cours...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-[#6B7280] group-hover:text-[#1A3FA0] transition-colors" />
                      <p className="text-sm font-medium text-[#1A1A1A]">Cliquez pour ajouter des photos</p>
                      <p className="text-xs text-[#6B7280]">JPG, PNG, WEBP acceptés • Plusieurs fichiers possibles</p>
                    </div>
                  )}
                </div>

                {/* Image Previews */}
                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <div className={`w-full h-full rounded-xl overflow-hidden border-2 bg-white transition-colors ${img.isPrimary ? 'border-[#1A3FA0]' : 'border-[#E2E2DF]'}`}>
                          <img src={img.preview || img.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-contain p-2" />
                        </div>
                        {img.isPrimary && (
                          <span className="absolute top-1 left-1 bg-[#1A3FA0] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            Principale
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(idx)}
                              className="bg-white text-[#1A3FA0] text-[10px] font-bold px-2 py-1 rounded-md hover:bg-[#E8EDF8]"
                            >
                              Principale
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-[#E2E2DF] flex justify-end gap-3 sticky bottom-0 bg-white p-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-[#E2E2DF] text-[#1A1A1A] rounded-xl font-medium hover:bg-[#F5F5F3] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1A3FA0] text-white rounded-xl font-medium hover:bg-[#0D2660] transition-colors flex items-center gap-2"
                >
                  {editProductId ? (
                    <>Enregistrer les modifications</>
                  ) : (
                    <><Check className="h-5 w-5" /> Créer le produit</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
