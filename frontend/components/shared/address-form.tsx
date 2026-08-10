'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export interface AddressFormData {
  label: string
  fullname: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

interface AddressFormProps {
  initialData?: Partial<AddressFormData>
  onSubmit: (data: AddressFormData) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function AddressForm({ initialData, onSubmit, onCancel, submitLabel = 'Enregistrer l\'adresse' }: AddressFormProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    label: initialData?.label || '',
    fullname: initialData?.fullname || '',
    street: initialData?.street || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'Tunisie',
    phone: initialData?.phone || '',
    isDefault: initialData?.isDefault || false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1A1A1A]">Titre (ex: Domicile, Bureau)</label>
          <input 
            type="text" 
            required 
            value={formData.label} 
            onChange={e => setFormData({ ...formData, label: e.target.value })} 
            className="w-full border border-[#E2E2DF] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" 
            placeholder="Domicile" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1A1A1A]">Nom et Prénom</label>
          <input 
            type="text" 
            required 
            value={formData.fullname} 
            onChange={e => setFormData({ ...formData, fullname: e.target.value })} 
            className="w-full border border-[#E2E2DF] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#1A1A1A]">Adresse complète</label>
        <input 
          type="text" 
          required 
          value={formData.street} 
          onChange={e => setFormData({ ...formData, street: e.target.value })} 
          className="w-full border border-[#E2E2DF] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" 
          placeholder="Numéro, rue, appartement..." 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1A1A1A]">Ville</label>
          <input 
            type="text" 
            required 
            value={formData.city} 
            onChange={e => setFormData({ ...formData, city: e.target.value })} 
            className="w-full border border-[#E2E2DF] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1A1A1A]">Gouvernorat / Région</label>
          <input 
            type="text" 
            value={formData.state} 
            onChange={e => setFormData({ ...formData, state: e.target.value })} 
            className="w-full border border-[#E2E2DF] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1A1A1A]">Code Postal</label>
          <input 
            type="text" 
            value={formData.postalCode} 
            onChange={e => setFormData({ ...formData, postalCode: e.target.value })} 
            className="w-full border border-[#E2E2DF] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1A1A1A]">Téléphone</label>
          <input 
            type="tel" 
            required
            value={formData.phone} 
            onChange={e => setFormData({ ...formData, phone: e.target.value })} 
            className="w-full border border-[#E2E2DF] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30" 
            placeholder="+216 20 000 000"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 mt-4 cursor-pointer">
        <input 
          type="checkbox" 
          checked={formData.isDefault} 
          onChange={e => setFormData({ ...formData, isDefault: e.target.checked })} 
          className="w-4 h-4 text-[#1A3FA0] rounded border-[#E2E2DF] focus:ring-[#1A3FA0]" 
        />
        <span className="text-sm text-[#1A1A1A]">Définir comme adresse par défaut</span>
      </label>

      <div className="flex gap-3 justify-end pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={loading}
          className="px-4 py-2 rounded-lg text-[#6B7280] font-medium hover:bg-[#F5F5F3] transition-colors"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-[#1A3FA0] text-white rounded-lg font-medium hover:bg-[#0D2660] transition-colors flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
