'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Trash2, Package, X, Upload, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { formatPrice, conditionFromApi, conditionToApi, type Condition } from '@/lib/products'

const API_BASE = 'http://localhost:8090/api'

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
}

interface ProductItem {
  id: number
  name: string
  brand: string
  category: string
  condition: Condition
  basePrice: number
  salePrice?: number
  stock: number
  status: 'Actif' | 'Inactif'
  imageUrl?: string
}

export default function AdminProduitsPage() {
  const [productsList, setProductsList] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [conditionFilter, setConditionFilter] = useState<string>('Tous')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Dell',
    category: 'PC Portable',
    condition: 'Neuf' as Condition,
    basePrice: '',
    salePrice: '',
    stock: '5',
    description: '',
    imageUrl: '',
  })

  // File Upload State
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProducts = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

      const [productsRes, stockRes] = await Promise.allSettled([
        fetch(`${API_BASE}/products?size=100`, { headers, cache: 'no-store' }),
        fetch(`${API_BASE}/stock?size=100`, { headers, cache: 'no-store' }),
      ])

      let rawProducts: any[] = []
      let stockItems: any[] = []

      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const data = await productsRes.value.json()
        rawProducts = data.content || (Array.isArray(data) ? data : [])
      }

      if (stockRes.status === 'fulfilled' && stockRes.value.ok) {
        const data = await stockRes.value.json()
        stockItems = data.content || (Array.isArray(data) ? data : [])
      }

      const stockByProductId = new Map<number, number>()
      stockItems.forEach((st) => {
        const pid = st.productId ?? st.product?.id
        if (pid) {
          const qty = (st.quantity ?? 0) - (st.reservedQuantity ?? 0)
          stockByProductId.set(pid, Math.max(0, qty))
        }
      })

      const mapped: ProductItem[] = rawProducts.map((p) => {
        const primaryImg = p.images?.find((i: any) => i.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || ''
        const realStock = stockByProductId.has(p.id) ? stockByProductId.get(p.id)! : (p.stockQuantity ?? 0)

        return {
          id: p.id,
          name: p.name,
          brand: p.brandName || p.brand || 'AfricaNet',
          category: p.categoryName || 'PC Portable',
          condition: conditionFromApi(p.condition),
          basePrice: p.basePrice || p.price || 0,
          salePrice: p.salePrice || undefined,
          stock: realStock,
          status: p.isActive !== false ? 'Actif' : 'Inactif',
          imageUrl: primaryImg,
        }
      })

      setProductsList(mapped)
    } catch (e) {
      console.error('Failed to load products:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  // Upload file to backend and get permanent URL
  const uploadFileToServer = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP).')
      return null
    }
    setUploadingImage(true)
    setErrorMsg('')
    try {
      const token = getToken()
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      if (!res.ok) throw new Error('Upload échoué')
      const data = await res.json()
      return data.url as string
    } catch (e) {
      // Fallback: use local base64 preview only
      console.warn('Upload server unavailable, using local preview.')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle local file selection or drop
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP).')
      return
    }
    // Show local preview immediately
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload to server for permanent URL
    const serverUrl = await uploadFileToServer(file)
    if (serverUrl) {
      setImagePreview(serverUrl)
      setFormData((f) => ({ ...f, imageUrl: serverUrl }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.basePrice) return

    setSubmitting(true)
    setErrorMsg('')

    try {
      const token = getToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }

      // Only send permanent URLs — never base64 (too large for DB column)
      const serverUrl = formData.imageUrl?.startsWith('http') ? formData.imageUrl : null
      const finalImageUrl = serverUrl || 'http://localhost:8090/uploads/default-laptop.png'

      const payload = {
        name: formData.name,
        description: formData.description || `${formData.name} - ${formData.condition}`,
        shortDesc: `${formData.brand} · ${formData.condition}`,
        categoryId: 1, // Default PC Portables category ID
        condition: conditionToApi(formData.condition) || 'NEW',
        basePrice: parseFloat(formData.basePrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        sku: `PRD-${Date.now().toString().slice(-6)}`,
        images: [
          {
            url: finalImageUrl,
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      }

      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Erreur lors de la création du produit.')
      }

      const createdProduct = await res.json()

      // Adjust stock for the created product
      if (createdProduct?.id && formData.stock) {
        const qty = parseInt(formData.stock, 10)
        if (qty > 0) {
          await fetch(`${API_BASE}/stock/${createdProduct.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              movementType: 'IN',
              quantity: qty,
              referenceType: 'MANUAL',
              notes: 'Stock initial de création produit',
            }),
          }).catch((err) => console.warn('Stock init failed:', err))
        }
      }

      setIsAddModalOpen(false)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFormData({
        name: '',
        brand: 'Dell',
        category: 'PC Portable',
        condition: 'Neuf',
        basePrice: '',
        salePrice: '',
        stock: '5',
        description: '',
        imageUrl: '',
      })

      await loadProducts()
    } catch (err: any) {
      console.error('Error creating product:', err)
      setErrorMsg(err.message || 'Impossible de créer le produit.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return
    try {
      const token = getToken()
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers })
      setProductsList((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Failed to delete product:', err)
    }
  }

  const toggleStatus = (id: number) => {
    setProductsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: p.status === 'Actif' ? 'Inactif' : 'Actif' } : p))
    )
  }

  const filteredProducts = productsList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    const matchesCondition = conditionFilter === 'Tous' || p.condition === conditionFilter
    return matchesSearch && matchesCondition
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-[#6B7280]">Ajoutez, modifiez et gérez les images de votre catalogue en direct.</p>
        </div>
        <button
          onClick={() => {
            setErrorMsg('')
            setImagePreview(null)
            setIsAddModalOpen(true)
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
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F5F5F3] rounded-lg text-sm border-none focus:ring-2 focus:ring-[#1A3FA0] outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="bg-[#F5F5F3] border-none text-sm rounded-lg px-3 py-2 text-[#1A1A1A] font-medium focus:ring-2 focus:ring-[#1A3FA0] outline-none"
          >
            <option value="Tous">Tous les états</option>
            <option value="Neuf">Neuf</option>
            <option value="Reconditionné">Reconditionné</option>
            <option value="Occasion">Occasion</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex justify-center text-[#1A3FA0]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left text-sm text-[#6B7280]">
              <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-bold">Produit</th>
                  <th className="px-6 py-4 font-bold">Marque / Catégorie</th>
                  <th className="px-6 py-4 font-bold">État</th>
                  <th className="px-6 py-4 font-bold">Prix</th>
                  <th className="px-6 py-4 font-bold">Stock</th>
                  <th className="px-6 py-4 font-bold">Statut</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DF]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#1A1A1A]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F5F5F3] border border-[#E2E2DF] flex items-center justify-center overflow-hidden shrink-0">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5 text-[#6B7280]" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-[#1A1A1A]">{p.name}</span>
                          <span className="block text-xs text-[#6B7280]">ID: #{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#1A1A1A]">{p.brand}</span>
                      <span className="block text-xs text-[#6B7280]">{p.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.condition === 'Neuf'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.condition === 'Reconditionné'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-[#1A1A1A]">
                          {formatPrice(p.salePrice || p.basePrice)}
                        </span>
                        {p.salePrice && (
                          <span className="block text-xs text-[#6B7280] line-through">
                            {formatPrice(p.basePrice)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-semibold ${
                          p.stock <= 2
                            ? 'text-red-600 font-bold'
                            : p.stock <= 5
                            ? 'text-amber-600'
                            : 'text-[#1A1A1A]'
                        }`}
                      >
                        {p.stock} unité{p.stock > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(p.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          p.status === 'Actif'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            p.status === 'Actif' ? 'bg-green-600' : 'bg-gray-400'
                          }`}
                        />
                        {p.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 hover:bg-red-50 text-[#6B7280] hover:text-red-600 rounded-lg transition-colors"
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
          )}
        </div>
      </div>

      {/* Add Product Modal with Complete Image Upload Support */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E2E2DF] pb-3">
              <h3 className="font-bold text-lg text-[#1A1A1A]">Nouveau produit</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#6B7280] hover:text-[#1A1A1A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Image Upload Zone */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Image du produit (Téléversement ou URL)
                </label>

                {imagePreview || formData.imageUrl ? (
                  <div className="relative w-full h-40 bg-[#F5F5F3] rounded-xl border border-[#E2E2DF] overflow-hidden flex items-center justify-center group">
                    <img
                      src={imagePreview || formData.imageUrl}
                      alt="Aperçu du produit"
                      className="w-full h-full object-contain p-2"
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#1A3FA0]" />
                        <span className="ml-2 text-xs text-[#1A3FA0] font-medium">Envoi en cours...</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null)
                        setFormData((f) => ({ ...f, imageUrl: '' }))
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 transition-colors"
                      title="Supprimer l'image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                      isDragOver
                        ? 'border-[#1A3FA0] bg-[#E8EDF8]'
                        : 'border-[#E2E2DF] hover:border-[#1A3FA0] bg-[#FAFBFD]'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-8 w-8 text-[#1A3FA0] mx-auto mb-2 animate-spin" />
                        <p className="text-xs font-semibold text-[#1A3FA0]">Envoi de l&apos;image...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-[#1A3FA0] mx-auto mb-2" />
                        <p className="text-xs font-semibold text-[#1A1A1A] mb-1">
                          Glissez une image ici ou cliquez pour la choisir
                        </p>
                        <p className="text-[11px] text-[#6B7280] mb-3">Formats acceptés : PNG, JPG, WEBP</p>
                        <span className="inline-flex items-center gap-2 bg-[#1A3FA0] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0D2660] transition-colors pointer-events-none">
                          <ImageIcon className="h-4 w-4" />
                          Choisir un fichier
                        </span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Optional Web URL Input */}
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="Ou collez un lien d'image web (https://...)"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData((f) => ({ ...f, imageUrl: e.target.value }))
                      if (e.target.value.startsWith('http')) {
                        setImagePreview(e.target.value)
                      }
                    }}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Nom du produit
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Lenovo ThinkPad X1 Carbon"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Marque</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData((f) => ({ ...f, brand: e.target.value }))}
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
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, condition: e.target.value as Condition }))
                    }
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
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Prix de base (TND)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="2500"
                    value={formData.basePrice}
                    onChange={(e) => setFormData((f) => ({ ...f, basePrice: e.target.value }))}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Prix promo (option)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="2200"
                    value={formData.salePrice}
                    onChange={(e) => setFormData((f) => ({ ...f, salePrice: e.target.value }))}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                    Stock initial
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="5"
                    value={formData.stock}
                    onChange={(e) => setFormData((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                  Description courte
                </label>
                <textarea
                  rows={2}
                  placeholder="Caractéristiques principales (processeur, RAM, SSD)..."
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#E2E2DF]">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E2DF] text-xs font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#1A3FA0] text-white text-xs font-bold rounded-lg hover:bg-[#0D2660] flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
