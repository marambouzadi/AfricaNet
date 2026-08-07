'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Phone, Edit3, Plus, X, Trash2, Home, Lock } from 'lucide-react'
import { useUser } from '@/lib/user-context'
import { updateCurrentUser, getUserAddresses, createAddress, deleteAddress } from '@/lib/api'
import { AddressForm, AddressFormData } from '@/components/shared/address-form'

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
  const { user, refreshUser } = useUser()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingProfile] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [error, setError] = useState('')

  // Inline forms toggles
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isAddingAddress, setIsAddingAddress] = useState(false)

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    avatarUrl: ''
  })

  // Removed local addressForm state as it's now managed by the component

  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Removed password state (handled in Paramètres page)

  // Charger les adresses
  useEffect(() => {
    let ignore = false
    getUserAddresses()
      .then((data: any) => {
        if (!ignore) setAddresses(Array.isArray(data) ? data : data.content || [])
      })
      .catch(() => {
        console.warn('Backend Addresses API not implemented yet. Using empty list.')
        if (!ignore) setAddresses([])
      })
      .finally(() => { if (!ignore) setLoadingAddresses(false) })
    return () => { ignore = true }
  }, [])

  // Sync form when user context loads
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      }))
    }
  }, [user])

  // Soumettre la modification de profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')
    const emailChanged = profileForm.email && profileForm.email !== user?.email
    try {
      await updateCurrentUser(profileForm)
      await refreshUser()
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
  const handleAddAddress = async (data: AddressFormData) => {
    setActionError('')
    setActionSuccess('')
    try {
      const newAddress = await createAddress(data)
      setAddresses(prev => [...prev, newAddress])
      setActionSuccess('Adresse ajoutée avec succès !')
      setIsAddingAddress(false)
    } catch {
      throw new Error('Impossible d\'ajouter l\'adresse. Vérifiez vos informations.')
    }
  }

  // Supprimer une adresse
  const handleDeleteAddress = async (id: number) => {
    try {
      await deleteAddress(id)
      setAddresses(prev => prev.filter(addr => addr.id !== id))
      setActionSuccess('Adresse supprimée.')
    } catch {
      setActionError('Impossible de supprimer l\'adresse. L\'API backend DELETE /api/addresses/{id} doit être implémentée.')
    }
  }

  // Changer le mot de passe
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setActionError('Les mots de passe ne correspondent pas.')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setActionError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setPwLoading(true)
    try {
      await updateCurrentUser({
        firstName: user!.firstName,
        lastName: user!.lastName,
        email: user!.email,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setActionSuccess('Mot de passe mis à jour avec succès !')
      setIsChangingPassword(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Mot de passe actuel incorrect.'
      setActionError(msg)
    } finally {
      setPwLoading(false)
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
              <AddressForm 
                onSubmit={handleAddAddress} 
                onCancel={() => setIsAddingAddress(false)} 
              />
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

      {/* Security Card — links to Paramètres */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Sécurité du compte</h2>
              <p className="text-sm text-[#6B7280]">Gérez votre mot de passe et vos préférences de sécurité</p>
            </div>
          </div>
          <a
            href="/dashboard/parametres"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1A3FA0] hover:underline"
          >
            <Edit3 className="h-4 w-4" /> Accéder aux Paramètres
          </a>
        </div>
      </div>
    </div>
  )
}
