'use client'

import { useState } from 'react'
import { Bell, Lock, Shield, CreditCard, ChevronRight, ChevronDown, Check, Eye, EyeOff, Save, Plus, Trash2, KeyRound } from 'lucide-react'

export default function SettingsPage() {
  // Notification states
  const [orderEmails, setOrderEmails] = useState(true)
  const [promoEmails, setPromoEmails] = useState(false)
  const [smsAlerts, setSmsAlerts] = useState(true)

  // Accordion active sections
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  // Payment methods mock state
  const [cards, setCards] = useState([
    { id: 1, type: 'Visa', last4: '4242', exp: '12/26', default: true },
    { id: 2, type: 'Mastercard', last4: '8888', exp: '08/27', default: false }
  ])
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCard, setNewCard] = useState({ number: '', name: '', exp: '', cvc: '' })

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const toggleSection = (section: string) => {
    setActiveSection(prev => prev === section ? null : section)
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('❌ Les mots de passe ne correspondent pas.')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('❌ Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setActiveSection(null)
    showToast('✅ Mot de passe mis à jour avec succès !')
  }

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCard.number || !newCard.name) return
    const last4 = newCard.number.slice(-4) || '1234'
    setCards(prev => [...prev, {
      id: Date.now(),
      type: 'Visa',
      last4,
      exp: newCard.exp || '01/28',
      default: false
    }])
    setNewCard({ number: '', name: '', exp: '', cvc: '' })
    setIsAddingCard(false)
    showToast('✅ Carte de paiement ajoutée !')
  }

  const handleDeleteCard = (id: number) => {
    setCards(prev => prev.filter(c => c.id !== id))
    showToast('✅ Carte supprimée.')
  }

  return (
    <div className="space-[#1A1A1A] space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Paramètres</h1>
        <p className="text-[#6B7280]">Gérez vos préférences de compte, la sécurité et les notifications.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden divide-y divide-[#E2E2DF]">
        
        {/* Notifications Section */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Notifications</h2>
              <p className="text-xs text-[#6B7280]">Choisissez comment et quand vous souhaitez être contacté.</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div 
              onClick={() => { setOrderEmails(!orderEmails); showToast('✅ Préférences mises à jour.'); }}
              className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-[#1A1A1A]">Mises à jour des commandes</p>
                <p className="text-sm text-[#6B7280]">Recevez des e-mails sur le statut et la livraison de vos commandes.</p>
              </div>
              <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${orderEmails ? 'bg-[#1A3FA0]' : 'bg-[#E2E2DF]'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${orderEmails ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </div>

            <div 
              onClick={() => { setPromoEmails(!promoEmails); showToast('✅ Préférences mises à jour.'); }}
              className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-[#1A1A1A]">Promotions et offres spéciales</p>
                <p className="text-sm text-[#6B7280]">Soyez informé de nos remises et nouveautés (1 à 2 fois par mois).</p>
              </div>
              <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${promoEmails ? 'bg-[#1A3FA0]' : 'bg-[#E2E2DF]'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${promoEmails ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </div>

            <div 
              onClick={() => { setSmsAlerts(!smsAlerts); showToast('✅ Préférences mises à jour.'); }}
              className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-[#1A1A1A]">Alertes SMS de livraison</p>
                <p className="text-sm text-[#6B7280]">Recevez un SMS lorsque le livreur est en route.</p>
              </div>
              <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${smsAlerts ? 'bg-[#1A3FA0]' : 'bg-[#E2E2DF]'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${smsAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section (Accordion) */}
        <div>
          <div 
            onClick={() => toggleSection('security')}
            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">Mot de passe et sécurité</h2>
                <p className="text-sm text-[#6B7280]">Modifiez votre mot de passe et sécurisez votre compte.</p>
              </div>
            </div>
            {activeSection === 'security' ? (
              <ChevronDown className="h-5 w-5 text-[#1A3FA0]" />
            ) : (
              <ChevronRight className="h-5 w-5 text-[#6B7280] group-hover:text-[#1A3FA0] transition-colors" />
            )}
          </div>

          {activeSection === 'security' && (
            <div className="px-6 pb-6 pt-2 bg-[#F5F5F3] border-t border-[#E2E2DF] animate-in fade-in duration-200">
              <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Mot de passe actuel</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                    className="w-full bg-white border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Nouveau mot de passe</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="w-full bg-white border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
                    placeholder="Au moins 6 caractères"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Confirmer le mot de passe</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full bg-white border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
                    placeholder="Répétez le nouveau mot de passe"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-[#6B7280] hover:text-[#1A3FA0] flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showPassword ? 'Masquer' : 'Afficher le mot de passe'}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1A3FA0] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0D2660] transition-colors flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Payment Methods Section (Accordion) */}
        <div>
          <div 
            onClick={() => toggleSection('payment')}
            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">Moyens de paiement</h2>
                <p className="text-sm text-[#6B7280]">Gérez vos cartes bancaires enregistrées pour des achats rapides.</p>
              </div>
            </div>
            {activeSection === 'payment' ? (
              <ChevronDown className="h-5 w-5 text-[#1A3FA0]" />
            ) : (
              <ChevronRight className="h-5 w-5 text-[#6B7280] group-hover:text-[#1A3FA0] transition-colors" />
            )}
          </div>

          {activeSection === 'payment' && (
            <div className="px-6 pb-6 pt-2 bg-[#F5F5F3] border-t border-[#E2E2DF] animate-in fade-in duration-200">
              <div className="space-y-3 pt-3">
                {cards.map(card => (
                  <div key={card.id} className="bg-white p-4 rounded-xl border border-[#E2E2DF] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-[#1A1A1A] text-white text-xs font-bold rounded flex items-center justify-center">
                        {card.type}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#1A1A1A]">•••• •••• •••• {card.last4}</p>
                        <p className="text-xs text-[#6B7280]">Expire le {card.exp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {card.default ? (
                        <span className="text-xs font-semibold text-[#1A8A4A] bg-[#1A8A4A]/10 px-2.5 py-1 rounded-full">Par défaut</span>
                      ) : (
                        <button
                          onClick={() => {
                            setCards(cards.map(c => ({ ...c, default: c.id === card.id })))
                            showToast('✅ Carte par défaut mise à jour.')
                          }}
                          className="text-xs text-[#6B7280] hover:text-[#1A3FA0]"
                        >
                          Définir par défaut
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-[#EF4444] p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {!isAddingCard ? (
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="w-full border-2 border-dashed border-[#E2E2DF] hover:border-[#1A3FA0] text-[#1A3FA0] py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 bg-white"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter une nouvelle carte
                  </button>
                ) : (
                  <form onSubmit={handleAddCard} className="bg-white p-4 rounded-xl border border-[#E2E2DF] space-y-3">
                    <h4 className="font-bold text-sm text-[#1A1A1A]">Nouvelle carte bancaire</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Titulaire de la carte"
                        required
                        value={newCard.name}
                        onChange={e => setNewCard(c => ({ ...c, name: e.target.value }))}
                        className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Numéro de carte"
                        required
                        value={newCard.number}
                        onChange={e => setNewCard(c => ({ ...c, number: e.target.value }))}
                        className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="MM/AA"
                          required
                          value={newCard.exp}
                          onChange={e => setNewCard(c => ({ ...c, exp: e.target.value }))}
                          className="border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          required
                          value={newCard.cvc}
                          onChange={e => setNewCard(c => ({ ...c, cvc: e.target.value }))}
                          className="border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsAddingCard(false)}
                        className="px-3 py-1.5 border border-[#E2E2DF] text-xs font-medium rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#1A3FA0] text-white text-xs font-bold rounded-lg hover:bg-[#0D2660]"
                      >
                        Enregistrer la carte
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Privacy Section (Accordion) */}
        <div>
          <div 
            onClick={() => toggleSection('privacy')}
            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">Confidentialité et Données</h2>
                <p className="text-sm text-[#6B7280]">Gérez l'utilisation de vos données personnelles et les cookies.</p>
              </div>
            </div>
            {activeSection === 'privacy' ? (
              <ChevronDown className="h-5 w-5 text-[#1A3FA0]" />
            ) : (
              <ChevronRight className="h-5 w-5 text-[#6B7280] group-hover:text-[#1A3FA0] transition-colors" />
            )}
          </div>

          {activeSection === 'privacy' && (
            <div className="px-6 pb-6 pt-2 bg-[#F5F5F3] border-t border-[#E2E2DF] animate-in fade-in duration-200">
              <div className="space-y-4 pt-3 text-sm text-[#6B7280]">
                <p>
                  Conformément à la réglementation sur la protection des données personnelles, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => showToast('✅ Copie de vos données exportée.')}
                    className="bg-white border border-[#E2E2DF] px-4 py-2 rounded-lg font-medium text-xs text-[#1A1A1A] hover:bg-gray-50"
                  >
                    Exporter mes données (JSON)
                  </button>
                  <button
                    onClick={() => showToast('⚠️ Votre demande de suppression a été enregistrée.')}
                    className="bg-red-50 text-[#EF4444] border border-red-200 px-4 py-2 rounded-lg font-medium text-xs hover:bg-red-100"
                  >
                    Demander la suppression de mon compte
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
