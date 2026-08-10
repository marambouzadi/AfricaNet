'use client'

import { useState, useEffect, Suspense } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPassword } from '@/lib/api'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Token invalide ou manquant.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await resetPassword(token, form.password)
      setSuccess(true)
      setTimeout(() => {
        router.push('/connexion')
      }, 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Le lien a expiré ou est invalide.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E2E2DF]">
          <div className="p-8">
            <div className="w-12 h-12 bg-[#E8EDF8] rounded-xl flex items-center justify-center mb-6">
              <Lock className="h-6 w-6 text-[#1A3FA0]" />
            </div>

            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Nouveau mot de passe</h1>
            
            {success ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Mot de passe modifié !</h2>
                <p className="text-sm text-[#6B7280] mb-6">
                  Votre mot de passe a été mis à jour avec succès. Vous allez être redirigé vers la page de connexion.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#6B7280] mb-8">
                  Créez un nouveau mot de passe sécurisé pour votre compte AfricaNet.
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">Nouveau mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3 border border-[#E2E2DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">Confirmer le mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.confirmPassword}
                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-12 py-3 border border-[#E2E2DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full bg-[#1A3FA0] hover:bg-[#0D2660] text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Réinitialiser"}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/connexion" className="text-sm font-medium text-[#6B7280] hover:text-[#1A3FA0]">
                    Annuler
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F3]">
        <Loader2 className="h-8 w-8 text-[#1A3FA0] animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
