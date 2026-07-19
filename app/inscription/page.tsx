'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3
  const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort']
  const colors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']

  if (!password) return null

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? colors[strength] : 'bg-[#E2E2DF]'} transition-all duration-300`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-orange-500' : strength === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
        {labels[strength]}
      </p>
    </div>
  )
}

export default function InscriptionPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', acceptTerms: false })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation.')
      return
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    setLoading(true)
    // Simulate register — replace with real API call when backend ready
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col">
      {/* Top bar */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/africanet-logo.jpg" alt="AfricaNet" width={36} height={36} className="rounded-full" />
          <span className="font-serif text-lg font-bold text-[#1A1A1A]">AfricaNet</span>
        </Link>
        <Link href="/connexion" className="text-sm font-medium text-[#1A3FA0] hover:underline text-right shrink-0">
          <span className="hidden sm:inline">Déjà inscrit ? Se connecter</span>
          <span className="sm:hidden">Se connecter</span>
        </Link>
      </header>

      {/* Form Card */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E2E2DF] p-5 sm:p-10">
            <div className="mb-6 text-center">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] mb-2">Créer un compte</h1>
              <p className="text-[#6B7280] text-sm sm:text-base">Rejoignez des milliers de clients AfricaNet</p>
            </div>

            {/* Benefits */}
            <div className="bg-[#E8EDF8] rounded-xl p-3 mb-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
              {['Garantie 3 mois', 'Livraison rapide', 'SAV dédié'].map(b => (
                <div key={b} className="flex items-center gap-1.5 text-[#1A3FA0]">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-medium">{b}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-[#1A1A1A]">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      placeholder="John"
                      className="w-full pl-10 pr-4 py-3 border border-[#E2E2DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-[#1A1A1A]">Nom</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full pl-10 pr-4 py-3 border border-[#E2E2DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">Adresse e-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3 border border-[#E2E2DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-[#1A1A1A]">Téléphone <span className="text-[#6B7280] font-normal">(Optionnel)</span></label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+216 00 000 000"
                    className="w-full pl-11 pr-4 py-3 border border-[#E2E2DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-[#1A1A1A]">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 6 caractères"
                    className="w-full pl-11 pr-12 py-3 border border-[#E2E2DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#1A3FA0] rounded mt-0.5 shrink-0"
                  checked={form.acceptTerms}
                  onChange={e => setForm({ ...form, acceptTerms: e.target.checked })}
                />
                <span className="text-sm text-[#6B7280]">
                  J'accepte les{' '}
                  <a href="#" className="text-[#1A3FA0] hover:underline font-medium">Conditions d'utilisation</a>
                  {' '}et la{' '}
                  <a href="#" className="text-[#1A3FA0] hover:underline font-medium">Politique de confidentialité</a>
                  {' '}d'AfricaNet.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D1F232] hover:bg-[#bce600] text-[#1A1A1A] py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Création du compte...' : (
                  <>Créer mon compte <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#E2E2DF] text-center">
              <p className="text-sm text-[#6B7280]">
                Vous avez déjà un compte ?{' '}
                <Link href="/connexion" className="text-[#1A3FA0] font-bold hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
