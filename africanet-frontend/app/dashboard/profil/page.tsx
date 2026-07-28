'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Phone, Edit3, Plus, X, Trash2, Home } from 'lucide-react'

interface UserProfile {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  role: string
}

interface Address {
  id: number
  label?: string // e.g. "Maison", "Bureau"
  fullname: string
  street: string
  city: string
  state?: string
  postalCode?: string
  country: string
  isDefault: boolean
  createdAt: string
}

export default function ProfilPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [error, setError] = useState('')

  // Inline forms toggles
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatarUrl: ''
  })

  // Address Form state (Matches user_adresses DB table schema)
  const [addressForm, setAddressForm] = useState({
    label: '',
    fullname: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Tunisie',
    isDefault: false
  })

  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Charger le profil & les adresses
  useEffect(() => {
    let ignore = false
    const token = localStorage.getItem('accessToken')

    if (!token) {
      setError('Vous devez être connecté pour voir votre profil.')
      setLoadingProfile(false)
      setLoadingAddresses(false)
      return
    }

    const headers = { Authorization: `Bearer ${token}` }

    // 1. Profil
    fetch('http://localhost:8090/api/auth/me', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Impossible de récupérer le profil')
        return res.json()
      })
      .then(data => {
        if (!ignore) {
          setUser(data)
          setProfileForm({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            avatarUrl: data.avatarUrl || ''
          })
        }
      })
      .catch(() => {
        if (!ignore) setError('Impossible de récupérer le profil.')
      })
      .finally(() => {
        if (!ignore) setLoadingProfile(false)
      })

    // 2. Adresses
    fetch('http://localhost:8090/api/addresses', { headers })
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => {
        if (!ignore) {
          setAddresses(Array.isArray(data) ? data : data.content || [])
        }
      })
      .catch(() => {
        console.warn('Backend Addresses API not implemented yet. Using empty list.')
        if (!ignore) setAddresses([])
      })
      .finally(() => {
        if (!ignore) setLoadingAddresses(false)
      })

    return () => { ignore = true }
  }, [])

  // Soumettre la modification de profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')

    const token = localStorage.getItem('accessToken')
    if (!token) return

    const emailChanged = profileForm.email && profileForm.email !== user?.email

    try {
      const res = await fetch('http://localhost:8090/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du profil')
      }

      const updatedUser = await res.json()
      setUser(updatedUser)
      // Sync the form with the updated email returned by backend
      setProfileForm(prev => ({ ...prev, email: updatedUser.email || prev.email }))
      setIsEditingProfile(false)

      if (emailChanged) {
        setActionSuccess('Email mis à jour ! Veuillez vous reconnecter avec votre nouvel email.')
      } else {
        setActionSuccess('Profil mis à jour avec succès !')
      }
    } catch (err: any) {
      setActionError(err.message || 'Impossible de modifier le profil.')
    }
  }

  // Soumettre l'ajout d'adresse
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')

    const token = localStorage.getItem('accessToken')
    if (!token) return

    try {
      const res = await fetch('http://localhost:8090/api/addresses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addressForm)
      })

      if (!res.ok) {
        throw new Error()
      }

      const newAddress = await res.json()
      setAddresses(prev => [...prev, newAddress])
      setActionSuccess('Adresse ajoutée avec succès !')
      setIsAddingAddress(false)
      // Reset form
      setAddressForm({
        label: '',
        fullname: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Tunisie',
        isDefault: false
      })
    } catch {
      setActionError('Impossible d\'ajouter l\'adresse. L\'API backend POST /api/addresses doit être implémentée.')
    }
  }

  // Supprimer une adresse
  const handleDeleteAddress = async (id: number) => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    try {
      const res = await fetch(`http://localhost:8090/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) throw new Error()
      
      setAddresses(prev => prev.filter(addr => addr.id !== id))
      setActionSuccess('Adresse supprimée.')
    } catch {
      setActionError('Impossible de supprimer l\'adresse. L\'API backend DELETE /api/addresses/{id} doit être implémentée.')
    }
  }

  if (loadingProfile) {
    return <p className="text-[#6B7280]">Chargement du profil...</p>
  }

  if (error || !user) {
    return <p className="text-red-600">{error || 'Utilisateur introuvable.'}</p>
  }

  return (
    <div className="space-y-6">
      {/* Toast Alertes */}
      {(actionError || actionSuccess) && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md space-y-2">
          {actionError && (
            <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg shadow-md flex items-center justify-between">
              <span className="text-sm font-medium">{actionError}</span>
              <button onClick={() => setActionError('')} className="text-red-500 hover:text-red-700 ml-4"><X className="h-4 w-4" /></button>
            </div>
          )}
          {actionSuccess && (
            <div className="bg-green-50 text-green-800 border border-green-200 p-4 rounded-lg shadow-md flex items-center justify-between">
              <span className="text-sm font-medium">{actionSuccess}</span>
              <button onClick={() => setActionSuccess('')} className="text-green-500 hover:text-green-700 ml-4"><X className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Mon Profil</h1>
        <p className="text-[#6B7280]">Gérez vos informations personnelles et vos adresses de livraison.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Informations personnelles</h2>
              {!isEditingProfile && (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1A3FA0] hover:underline"
                >
                  <Edit3 className="h-4 w-4" /> Modifier
                </button>
              )}
            </div>

            {isEditingProfile ? (
              // Inline edit form
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Prénom</label>
                    <input
                      type="text"
                      required
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Nom</label>
                    <input
                      type="text"
                      required
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Adresse e-mail</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Téléphone</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">URL Avatar</label>
                  <input
                    type="text"
                    value={profileForm.avatarUrl}
                    onChange={(e) => setProfileForm(p => ({ ...p, avatarUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false)
                      // Reset to current profile values
                      setProfileForm({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        avatarUrl: user.avatarUrl || ''
                      })
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1A3FA0] hover:bg-[#0D2660] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : (
              // Display state
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B7280]">Nom complet</p>
                    <p className="font-medium text-[#1A1A1A]">{user.firstName} {user.lastName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B7280]">Adresse e-mail</p>
                    <p className="font-medium text-[#1A1A1A]">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B7280]">Numéro de téléphone</p>
                    <p className="font-medium text-[#1A1A1A]">{user.phone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Addresses Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6 flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Carnet d&apos;adresses</h2>
              {!isAddingAddress && (
                <button 
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#1A3FA0] hover:underline"
                >
                  <Plus className="h-4 w-4" /> Ajouter
                </button>
              )}
            </div>

            {isAddingAddress ? (
              // Inline add address form
              <form onSubmit={handleAddAddress} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Label (Ex: Maison, Bureau)</label>
                    <input
                      type="text"
                      placeholder="Maison"
                      value={addressForm.label}
                      onChange={(e) => setAddressForm(a => ({ ...a, label: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Destinataire</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={addressForm.fullname}
                      onChange={(e) => setAddressForm(a => ({ ...a, fullname: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Adresse de rue</label>
                  <input
                    type="text"
                    required
                    placeholder="12 Rue de la Liberté"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm(a => ({ ...a, street: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Ville</label>
                    <input
                      type="text"
                      required
                      placeholder="Tunis"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm(a => ({ ...a, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Gouvernorat</label>
                    <input
                      type="text"
                      placeholder="Tunis"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm(a => ({ ...a, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Code Postal</label>
                    <input
                      type="text"
                      placeholder="1000"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm(a => ({ ...a, postalCode: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600">Pays</label>
                    <input
                      type="text"
                      required
                      value={addressForm.country}
                      onChange={(e) => setAddressForm(a => ({ ...a, country: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#E2E2DF] rounded-lg text-sm focus:ring-2 focus:ring-[#1A3FA0]/30 outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm(a => ({ ...a, isDefault: e.target.checked }))}
                    className="rounded border-[#E2E2DF] text-[#1A3FA0] focus:ring-[#1A3FA0]/30 h-4 w-4"
                  />
                  <label htmlFor="isDefault" className="text-xs font-semibold text-gray-600 select-none cursor-pointer">
                    Adresse par défaut
                  </label>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1A3FA0] hover:bg-[#0D2660] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            ) : (
              // Display state: list of addresses
              <>
                {loadingAddresses ? (
                  <p className="text-sm text-[#6B7280]">Chargement des adresses...</p>
                ) : addresses.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">Aucune adresse enregistrée pour le moment.</p>
                ) : (
                  <div className="space-y-4 max-h-[260px] overflow-y-auto pr-1">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="p-4 rounded-lg bg-gray-50 border border-[#E2E2DF] flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {addr.label && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8EDF8] text-[#1A3FA0] uppercase">
                                {addr.label}
                              </span>
                            )}
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase flex items-center gap-0.5">
                                <Home className="h-2.5 w-2.5" /> Par défaut
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-[#1A1A1A] text-sm mt-1">{addr.fullname}</p>
                          <p className="text-xs text-[#6B7280]">{addr.street}</p>
                          <p className="text-xs text-[#6B7280]">{addr.postalCode} {addr.city}, {addr.state || ''}</p>
                          <p className="text-xs text-[#6B7280] font-semibold uppercase">{addr.country}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}