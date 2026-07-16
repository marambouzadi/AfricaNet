import { Bell, Lock, Shield, CreditCard, ChevronRight } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Paramètres</h1>
        <p className="text-[#6B7280]">Gérez vos préférences de compte, la sécurité et les notifications.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="divide-y divide-[#E2E2DF]">
          
          {/* Notifications */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Mises à jour des commandes</p>
                  <p className="text-sm text-[#6B7280]">Recevez des emails sur le statut de vos commandes.</p>
                </div>
                <div className="relative inline-flex items-center h-6 rounded-full w-11 bg-[#1A3FA0]">
                  <span className="inline-block w-4 h-4 transform translate-x-6 bg-white rounded-full transition-transform" />
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-[#1A1A1A]">Promotions et offres</p>
                  <p className="text-sm text-[#6B7280]">Soyez informé de nos meilleures offres (1 à 2 fois par mois).</p>
                </div>
                <div className="relative inline-flex items-center h-6 rounded-full w-11 bg-[#E2E2DF]">
                  <span className="inline-block w-4 h-4 transform translate-x-1 bg-white rounded-full transition-transform" />
                </div>
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">Mot de passe et sécurité</h2>
                <p className="text-sm text-[#6B7280]">Modifiez votre mot de passe et sécurisez votre compte.</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B7280] group-hover:text-[#1A3FA0] transition-colors" />
          </div>

          {/* Payment Methods */}
          <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">Moyens de paiement</h2>
                <p className="text-sm text-[#6B7280]">Gérez vos cartes bancaires enregistrées.</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B7280] group-hover:text-[#1A3FA0] transition-colors" />
          </div>

          {/* Privacy */}
          <div className="p-6 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A]">Confidentialité</h2>
                <p className="text-sm text-[#6B7280]">Gérez vos données personnelles et les cookies.</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B7280] group-hover:text-[#1A3FA0] transition-colors" />
          </div>

        </div>
      </div>
      
      <div className="pt-4 flex justify-end">
        <button className="text-[#EF4444] font-medium hover:underline text-sm">
          Supprimer mon compte
        </button>
      </div>
    </div>
  )
}
