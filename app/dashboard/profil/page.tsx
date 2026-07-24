'use client'

import { User, Mail, Phone, MapPin, Edit3, Loader2 } from 'lucide-react'
import { useUser } from '@/lib/user-context'

export default function ProfilPage() {
  const { user, loading } = useUser()

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A3FA0]" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Mon Profil</h1>
          <p className="text-[#6B7280]">Gérez vos informations personnelles et vos adresses.</p>
        </div>
        
        <button className="inline-flex items-center gap-2 bg-[#1A3FA0] hover:bg-[#0D2660] text-white px-4 py-2 rounded-lg font-medium transition-colors w-fit">
          <Edit3 className="h-4 w-4" />
          Modifier le profil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Informations personnelles</h2>
          
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
                <p className="font-medium text-[#1A1A1A]">+216 55 123 456</p>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1A]">Carnet d'adresses</h2>
            <button className="text-sm font-medium text-[#1A3FA0] hover:underline">
              Ajouter
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-[#1A3FA0] rounded-xl bg-[#E8EDF8]/50 relative">
              <span className="absolute top-4 right-4 text-xs font-bold bg-[#1A3FA0] text-white px-2 py-1 rounded">Par défaut</span>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#1A3FA0] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1A1A1A]">Domicile</p>
                  <p className="text-sm text-[#6B7280] mt-1">
                    {user.firstName} {user.lastName}<br/>
                    Avenue Habib Bourguiba<br/>
                    Résidence Les Jasmins, Appt 12<br/>
                    Tunis, 1001, Tunisie
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
