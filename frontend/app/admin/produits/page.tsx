'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Trash2, Package, X, Upload, Image as ImageIcon, Loader2, AlertCircle, Pencil } from 'lucide-react'
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
  imageUrls?: string[]
  specs: { processeur: string, ram: string, stockage: string, affichage: string }
  notes: { ecran: string, batterie: string, performances: string, esthetique: string }
}

export default function AdminProduitsPage() {
  const [productsList, setProductsList] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [conditionFilter, setConditionFilter] = useState<string>('Tous')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    brand: 'Dell',
    category: 'PC Portable',
    condition: 'Neuf' as Condition,
    basePrice: '',
    salePrice: '',
    stock: '5',
    imageUrl: '',
    specs: { processeur: '', ram: '', stockage: '', affichage: '' },
    notes: { ecran: '0', batterie: '0', performances: '0', esthetique: '0' },
  })

  const calculateAiNotes = (condition: string, cpu?: string, ram?: string) => {
    let ecran = 8
    let batterie = 8
    let performances = 8
    let esthetique = 8

    if (condition === 'Neuf') {
      ecran = 10; batterie = 10; performances = 9; esthetique = 10
    } else if (condition === 'Reconditionné') {
      ecran = 9; batterie = 8; performances = 8; esthetique = 8
    } else if (condition === 'Occasion') {
      ecran = 7; batterie = 7; performances = 7; esthetique = 7
    }

    const cpuLower = (cpu || '').toLowerCase()
    const ramLower = (ram || '').toLowerCase()
    if (cpuLower.includes('i7') || cpuLower.includes('i9') || cpuLower.includes('ryzen 7') || cpuLower.includes('ryzen 9') || cpuLower.includes('m1') || cpuLower.includes('m2') || cpuLower.includes('m3')) {
      performances = Math.min(10, performances + 1)
    }
    if (ramLower.includes('16') || ramLower.includes('32') || ramLower.includes('64')) {
      performances = Math.min(10, performances + 1)
    }

    return {
      ecran: String(ecran),
      batterie: String(batterie),
      performances: String(performances),
      esthetique: String(esthetique),
    }
  }

  // File Upload State - multiple images
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Edit modal image state
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([])
  const editFileInputRef = useRef<HTMLInputElement>(null)

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

      const getSpec = (specsList: any[] | undefined, keys: string[]) => {
        if (!specsList || !Array.isArray(specsList)) return ''
        const found = specsList.find((s: any) =>
          s.specKey && keys.some(k => s.specKey.toLowerCase().trim() === k.toLowerCase().trim())
        )
        return found ? (found.specValue || '') : ''
      }

      const mapped: ProductItem[] = rawProducts.map((p) => {
        const primaryImg = p.images?.find((i: any) => i.isPrimary)?.url || p.images?.find((i: any) => i.isPrimary)?.imageUrl || p.images?.[0]?.url || p.images?.[0]?.imageUrl || ''
        const realStock = stockByProductId.has(p.id) ? stockByProductId.get(p.id)! : (p.stockQuantity ?? 0)

        const proc = getSpec(p.specifications, ['Processeur', 'cpu', 'processor'])
        const ram = getSpec(p.specifications, ['RAM', 'ram', 'mémoire', 'memoire', 'memory'])
        const storage = getSpec(p.specifications, ['Stockage', 'stockage', 'ssd', 'hdd', 'disque', 'storage'])
        const display = getSpec(p.specifications, ['Affichage', 'affichage', 'Écran', 'ecran', 'display', 'screen'])

        const nEcran = getSpec(p.specifications, ['Écran', 'ecran', 'note_ecran'])
        const nBatterie = getSpec(p.specifications, ['Batterie', 'batterie', 'note_batterie'])
        const nPerf = getSpec(p.specifications, ['Performances', 'performance', 'note_perf'])
        const nEsth = getSpec(p.specifications, ['Esthétique', 'esthetique', 'châssis', 'chassis', 'note_esth'])

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
          imageUrls: p.images?.map((i: any) => i.url || i.imageUrl).filter(Boolean) ?? [],
          specs: {
            processeur: proc,
            ram: ram,
            stockage: storage,
            affichage: display,
          },
          notes: {
            ecran: nEcran || '0',
            batterie: nBatterie || '0',
            performances: nPerf || '0',
            esthetique: nEsth || '0',
          },
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

  // Upload a single file and return its server URL (or base64 fallback)
  const uploadFileToServer = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP).')
      return null
    }
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
      const url = data.url as string
      return url.startsWith('/') ? `http://localhost:8090${url}` : url
    } catch (e) {
      console.warn('Upload server unavailable, using local preview.')
      return null
    }
  }

  // Handle multiple files for the ADD modal
  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    setUploadingImage(true)
    setErrorMsg('')
    // show local previews immediately
    const readers = arr.map(file => new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    }))
    const localPreviews = await Promise.all(readers)
    setImagePreviews(prev => [...prev, ...localPreviews])
    // upload to server and replace local previews with server URLs
    const serverUrls = await Promise.all(arr.map(uploadFileToServer))
    const resolved = serverUrls.map((url, i) => url || localPreviews[i])
    setImagePreviews(prev => {
      // replace the last arr.length entries (the local ones we just added)
      const base = prev.slice(0, prev.length - arr.length)
      return [...base, ...resolved]
    })
    setUploadingImage(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
  }

  // Handle file add for the EDIT modal
  const handleEditFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    setUploadingImage(true)
    const readers = arr.map(file => new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    }))
    const localPreviews = await Promise.all(readers)
    setEditImagePreviews(prev => [...prev, ...localPreviews])
    const serverUrls = await Promise.all(arr.map(uploadFileToServer))
    const resolved = serverUrls.map((url, i) => url || localPreviews[i])
    setEditImagePreviews(prev => {
      const base = prev.slice(0, prev.length - arr.length)
      return [...base, ...resolved]
    })
    setUploadingImage(false)
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

      // Build images array from previews (support relative URLs, http URLs, and base64 data URLs)
      const validImageUrls: string[] = []
      for (const img of imagePreviews) {
        if (img.startsWith('data:')) {
          try {
            const res = await fetch(img)
            const blob = await res.blob()
            const file = new File([blob], `product_${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' })
            const serverUrl = await uploadFileToServer(file)
            if (serverUrl) validImageUrls.push(serverUrl)
          } catch (err) {
            console.error('Failed to upload preview image:', err)
          }
        } else if (img.startsWith('http')) {
          validImageUrls.push(img)
        } else if (img.startsWith('/')) {
          validImageUrls.push(`http://localhost:8090${img}`)
        }
      }
      const images = validImageUrls.map((url, i) => ({ url, isPrimary: i === 0, sortOrder: i }))

      const specifications = [
        { specKey: 'Processeur', specValue: formData.specs.processeur, sortOrder: 1 },
        { specKey: 'RAM', specValue: formData.specs.ram, sortOrder: 2 },
        { specKey: 'Stockage', specValue: formData.specs.stockage, sortOrder: 3 },
        { specKey: 'Affichage', specValue: formData.specs.affichage, sortOrder: 4 },
        { specKey: 'Écran', specValue: formData.notes.ecran, sortOrder: 5 },
        { specKey: 'Batterie', specValue: formData.notes.batterie, sortOrder: 6 },
        { specKey: 'Performances', specValue: formData.notes.performances, sortOrder: 7 },
        { specKey: 'Esthétique', specValue: formData.notes.esthetique, sortOrder: 8 },
      ].filter(s => s.specValue)

      const payload = {
        name: formData.name,
        description: '',
        shortDesc: `${formData.brand} · ${formData.condition}`,
        categoryId: 1,
        condition: conditionToApi(formData.condition) || 'NEW',
        basePrice: parseFloat(formData.basePrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        sku: `PRD-${Date.now().toString().slice(-6)}`,
        images,
        specifications,
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
      setImagePreviews([])
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

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return
    setSubmitting(true)
    setErrorMsg('')
    try {
      const token = getToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
      const validImageUrls: string[] = []
      for (const img of editImagePreviews) {
        if (img.startsWith('data:')) {
          try {
            const res = await fetch(img)
            const blob = await res.blob()
            const file = new File([blob], `product_${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' })
            const serverUrl = await uploadFileToServer(file)
            if (serverUrl) validImageUrls.push(serverUrl)
          } catch (err) {
            console.error('Failed to upload edit image:', err)
          }
        } else if (img.startsWith('http')) {
          validImageUrls.push(img)
        } else if (img.startsWith('/')) {
          validImageUrls.push(`http://localhost:8090${img}`)
        }
      }
      const images = validImageUrls.map((url, i) => ({ url, isPrimary: i === 0, sortOrder: i }))

      const specifications = [
        { specKey: 'Processeur', specValue: editingProduct.specs?.processeur || '', sortOrder: 1 },
        { specKey: 'RAM', specValue: editingProduct.specs?.ram || '', sortOrder: 2 },
        { specKey: 'Stockage', specValue: editingProduct.specs?.stockage || '', sortOrder: 3 },
        { specKey: 'Affichage', specValue: editingProduct.specs?.affichage || '', sortOrder: 4 },
        { specKey: 'Écran', specValue: editingProduct.notes?.ecran || '0', sortOrder: 5 },
        { specKey: 'Batterie', specValue: editingProduct.notes?.batterie || '0', sortOrder: 6 },
        { specKey: 'Performances', specValue: editingProduct.notes?.performances || '0', sortOrder: 7 },
        { specKey: 'Esthétique', specValue: editingProduct.notes?.esthetique || '0', sortOrder: 8 },
      ].filter(s => s.specValue)

      const payload = {
        name: editingProduct.name,
        description: '',
        shortDesc: `${editingProduct.brand} · ${editingProduct.condition}`,
        categoryId: 1,
        condition: conditionToApi(editingProduct.condition) || 'NEW',
        basePrice: editingProduct.basePrice,
        salePrice: editingProduct.salePrice || null,
        images,
        specifications,
      }
      const res = await fetch(`${API_BASE}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Erreur lors de la modification.')
      }

      // Adjust stock if changed
      const originalProduct = productsList.find(p => p.id === editingProduct.id)
      const oldStock = originalProduct?.stock ?? 0
      const newStock = editingProduct.stock
      if (oldStock !== newStock) {
        const diff = newStock - oldStock
        await fetch(`${API_BASE}/stock/${editingProduct.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            movementType: diff > 0 ? 'IN' : 'OUT',
            quantity: Math.abs(diff),
            referenceType: 'MANUAL',
            notes: 'Ajustement manuel depuis modification',
          }),
        }).catch(err => console.warn('Failed to update stock:', err))
      }

      setEditingProduct(null)
      await loadProducts()
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de modifier le produit.')
    } finally {
      setSubmitting(false)
    }
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
            setImagePreviews([])
            setEditImagePreviews([])
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
                          onClick={() => {
                            setErrorMsg('')
                            setEditingProduct({ ...p })
                            setEditImagePreviews(p.imageUrls ?? (p.imageUrl ? [p.imageUrl] : []))
                          }}
                          className="p-1.5 hover:bg-blue-50 text-[#6B7280] hover:text-[#1A3FA0] rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
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
              {/* Multi-Image Upload Zone */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-2">
                  Images du produit <span className="text-[#6B7280] font-normal">(plusieurs images acceptées)</span>
                </label>

                {/* Existing previews grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#E2E2DF] bg-[#F5F5F3] group">
                        <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 bg-[#1A3FA0] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Principale</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setImagePreviews(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone - always visible */}
                <div
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
                    isDragOver ? 'border-[#1A3FA0] bg-[#E8EDF8]' : 'border-[#E2E2DF] hover:border-[#1A3FA0] bg-[#FAFBFD]'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-7 w-7 text-[#1A3FA0] mx-auto mb-1 animate-spin" />
                      <p className="text-xs font-semibold text-[#1A3FA0]">Envoi en cours...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-7 w-7 text-[#1A3FA0] mx-auto mb-1" />
                      <p className="text-xs font-semibold text-[#1A1A1A] mb-1">Glissez vos images ici ou cliquez</p>
                      <p className="text-[11px] text-[#6B7280]">PNG, JPG, WEBP — plusieurs fichiers acceptés</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* URL quick add */}
                <input
                  type="url"
                  placeholder="Ou collez un lien d'image web (https://...)"
                  className="w-full mt-2 border border-[#E2E2DF] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
                  onBlur={(e) => {
                    const url = e.target.value.trim()
                    if (url.startsWith('http')) {
                      setImagePreviews(prev => [...prev, url])
                      e.target.value = ''
                    }
                  }}
                />
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

              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#1A1A1A] mb-2">Spécifications Techniques</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Processeur</label>
                    <input
                      type="text"
                      placeholder="ex: Intel Core i5-1135G7"
                      value={formData.specs.processeur}
                      onChange={(e) => setFormData(f => ({ ...f, specs: { ...f.specs, processeur: e.target.value } }))}
                      className="w-full border border-[#E2E2DF] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">RAM</label>
                    <input
                      type="text"
                      placeholder="ex: 8 Go DDR4"
                      value={formData.specs.ram}
                      onChange={(e) => setFormData(f => ({ ...f, specs: { ...f.specs, ram: e.target.value } }))}
                      className="w-full border border-[#E2E2DF] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Stockage</label>
                    <input
                      type="text"
                      placeholder="ex: 256 Go SSD"
                      value={formData.specs.stockage}
                      onChange={(e) => setFormData(f => ({ ...f, specs: { ...f.specs, stockage: e.target.value } }))}
                      className="w-full border border-[#E2E2DF] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Affichage (Écran)</label>
                    <input
                      type="text"
                      placeholder="ex: 14'' Full HD"
                      value={formData.specs.affichage}
                      onChange={(e) => setFormData(f => ({ ...f, specs: { ...f.specs, affichage: e.target.value } }))}
                      className="w-full border border-[#E2E2DF] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A]">Notes Techniques (sur 10)</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = calculateAiNotes(formData.condition, formData.specs.processeur, formData.specs.ram)
                      setFormData(f => ({ ...f, notes: generated }))
                    }}
                    className="text-[11px] bg-[#E8EDF8] text-[#1A3FA0] font-semibold px-2.5 py-0.5 rounded hover:bg-[#1A3FA0] hover:text-white transition-colors flex items-center gap-1"
                  >
                    ⚡ Auto-évaluer par IA
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1 text-center">Écran</label>
                    <input
                      type="number"
                      min="0" max="10"
                      value={formData.notes.ecran}
                      onChange={(e) => setFormData(f => ({ ...f, notes: { ...f.notes, ecran: e.target.value } }))}
                      className="w-full border border-[#E2E2DF] rounded-lg px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1 text-center">Batterie</label>
                    <input
                      type="number"
                      min="0" max="10"
                      value={formData.notes.batterie}
                      onChange={(e) => setFormData(f => ({ ...f, notes: { ...f.notes, batterie: e.target.value } }))}
                      className="w-full border border-[#E2E2DF] rounded-lg px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1 text-center">Performances</label>
                    <input
                      type="number"
                      min="0" max="10"
                      value={formData.notes.performances}
                      onChange={(e) => setFormData(f => ({ ...f, notes: { ...f.notes, performances: e.target.value } }))}
                      className="w-full border border-[#E2E2DF] rounded-lg px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1 text-center">Esthétique</label>
                    <input
                      type="number"
                      min="0" max="10"
                      value={formData.notes.esthetique}
                      onChange={(e) => setFormData(f => ({ ...f, notes: { ...f.notes, esthetique: e.target.value } }))}
                      className="w-full border border-[#E2E2DF] rounded-lg px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                </div>
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E2E2DF] pb-3">
              <h3 className="font-bold text-lg text-[#1A1A1A]">Modifier : {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-[#6B7280] hover:text-[#1A1A1A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditProduct} className="space-y-4">
              {/* Images section */}
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-2">
                  Images du produit <span className="text-[#6B7280] font-normal">(la 1ère est principale)</span>
                </label>
                {editImagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {editImagePreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#E2E2DF] bg-[#F5F5F3] group">
                        <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 bg-[#1A3FA0] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Principale</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditImagePreviews(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className="border-2 border-dashed rounded-xl p-4 text-center transition-colors cursor-pointer border-[#E2E2DF] hover:border-[#1A3FA0] bg-[#FAFBFD]"
                  onClick={() => editFileInputRef.current?.click()}
                >
                  {uploadingImage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 text-[#1A3FA0] animate-spin" />
                      <p className="text-xs text-[#1A3FA0] font-semibold">Envoi en cours...</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="h-5 w-5 text-[#1A3FA0]" />
                      <p className="text-xs font-semibold text-[#1A1A1A]">Ajouter des images</p>
                    </div>
                  )}
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => { if (e.target.files?.length) handleEditFiles(e.target.files) }}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Nom du produit</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Marque</label>
                  <select
                    value={editingProduct.brand}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
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
                    value={editingProduct.condition}
                    onChange={(e) => setEditingProduct({ ...editingProduct, condition: e.target.value as any })}
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
                    step="0.001"
                    required
                    value={editingProduct.basePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: parseFloat(e.target.value) })}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Prix promo (option)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={editingProduct.salePrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-[#1A1A1A] mb-2">Spécifications Techniques</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Processeur</label>
                    <input
                      type="text"
                      placeholder="ex: Intel Core i5-1135G7"
                      value={editingProduct.specs?.processeur || ''}
                      onChange={(e) => setEditingProduct(f => f ? ({ ...f, specs: { ...(f.specs || {}), processeur: e.target.value } as any }) : f)}
                      className="w-full border border-[#E2E2DF] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">RAM</label>
                    <input
                      type="text"
                      placeholder="ex: 8 Go DDR4"
                      value={editingProduct.specs?.ram || ''}
                      onChange={(e) => setEditingProduct(f => f ? ({ ...f, specs: { ...(f.specs || {}), ram: e.target.value } as any }) : f)}
                      className="w-full border border-[#E2E2DF] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Stockage</label>
                    <input
                      type="text"
                      placeholder="ex: 256 Go SSD"
                      value={editingProduct.specs?.stockage || ''}
                      onChange={(e) => setEditingProduct(f => f ? ({ ...f, specs: { ...(f.specs || {}), stockage: e.target.value } as any }) : f)}
                      className="w-full border border-[#E2E2DF] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">Affichage (Écran)</label>
                    <input
                      type="text"
                      placeholder="ex: 14'' Full HD"
                      value={editingProduct.specs?.affichage || ''}
                      onChange={(e) => setEditingProduct(f => f ? ({ ...f, specs: { ...(f.specs || {}), affichage: e.target.value } as any }) : f)}
                      className="w-full border border-[#E2E2DF] rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#1A1A1A]">Notes Techniques (sur 10)</h4>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingProduct) return
                      const generated = calculateAiNotes(editingProduct.condition, editingProduct.specs?.processeur, editingProduct.specs?.ram)
                      setEditingProduct(f => f ? ({ ...f, notes: generated }) : f)
                    }}
                    className="text-[11px] bg-[#E8EDF8] text-[#1A3FA0] font-semibold px-2.5 py-0.5 rounded hover:bg-[#1A3FA0] hover:text-white transition-colors flex items-center gap-1"
                  >
                    ⚡ Auto-évaluer par IA
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1 text-center">Écran</label>
                    <input
                      type="number"
                      min="0" max="10"
                      value={editingProduct.notes?.ecran || ''}
                      onChange={(e) => setEditingProduct(f => f ? ({ ...f, notes: { ...(f.notes || {}), ecran: e.target.value } as any }) : f)}
                      className="w-full border border-[#E2E2DF] rounded-lg px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1 text-center">Batterie</label>
                    <input
                      type="number"
                      min="0" max="10"
                      value={editingProduct.notes?.batterie || ''}
                      onChange={(e) => setEditingProduct(f => f ? ({ ...f, notes: { ...(f.notes || {}), batterie: e.target.value } as any }) : f)}
                      className="w-full border border-[#E2E2DF] rounded-lg px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1 text-center">Performances</label>
                    <input
                      type="number"
                      min="0" max="10"
                      value={editingProduct.notes?.performances || ''}
                      onChange={(e) => setEditingProduct(f => f ? ({ ...f, notes: { ...(f.notes || {}), performances: e.target.value } as any }) : f)}
                      className="w-full border border-[#E2E2DF] rounded-lg px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#6B7280] mb-1 text-center">Esthétique</label>
                    <input
                      type="number"
                      min="0" max="10"
                      value={editingProduct.notes?.esthetique || ''}
                      onChange={(e) => setEditingProduct(f => f ? ({ ...f, notes: { ...(f.notes || {}), esthetique: e.target.value } as any }) : f)}
                      className="w-full border border-[#E2E2DF] rounded-lg px-2 py-1.5 text-sm text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#E2E2DF]">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setEditingProduct(null)}
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
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
