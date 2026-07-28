'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function ConnexionPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('http://localhost:8090/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                })
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}))
                throw new Error(errorData.message || 'Email ou mot de passe incorrect.')
            }

            const data = await res.json()

            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user))
            }

            if (data.user?.role === 'ADMIN') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Email ou mot de passe incorrect. Veuillez réessayer.'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col">
      {/* Top bar */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/africanet-logo.jpg" alt="AfricaNet" width={36} height={36} className="rounded-full" />
          <span className="font-serif text-lg font-bold text-[#1A1A1A]">AfricaNet</span>
        </Link>
        <Link href="/inscription" className="text-sm font-medium text-[#1A3FA0] hover:underline text-right shrink-0">
          <span className="hidden sm:inline">Créer un compte →</span>
          <span className="sm:hidden">S'inscrire</span>
        </Link>
      </header>

      {/* Form Card */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-[#E2E2DF] p-5 sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-serif font-bold text-[#1A1A1A] mb-2">Bon retour !</h1>
              <p className="text-[#6B7280]">Connectez-vous à votre espace AfricaNet</p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">Adresse e-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3 border border-[#E2E2DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-[#1A1A1A]">Mot de passe</label>
                  <a href="#" className="text-xs text-[#1A3FA0] hover:underline">Mot de passe oublié ?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 border border-[#E2E2DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-[#1A3FA0] rounded" />
                <span className="text-sm text-[#6B7280]">Se souvenir de moi</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A3FA0] hover:bg-[#0D2660] text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion...' : (
                  <>Se connecter <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#E2E2DF] text-center">
              <p className="text-sm text-[#6B7280]">
                Pas encore de compte ?{' '}
                <Link href="/inscription" className="text-[#1A3FA0] font-bold hover:underline">
                  S'inscrire gratuitement
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
