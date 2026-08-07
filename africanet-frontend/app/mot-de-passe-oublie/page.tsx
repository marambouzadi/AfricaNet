'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ArrowRight, Mail, KeyRound, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { forgotPassword } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError('')
    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Une erreur est survenue.')
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
              <KeyRound className="h-6 w-6 text-[#1A3FA0]" />
            </div>

            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Mot de passe oublié ?</h1>
            
            {success ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Email Envoyé !</h2>
                <p className="text-sm text-[#6B7280] mb-6">
                  Si un compte est associé à <strong>{email}</strong>, un lien de réinitialisation vient de vous être envoyé.
                </p>
                <Link
                  href="/connexion"
                  className="w-full inline-flex items-center justify-center bg-[#1A3FA0] hover:bg-[#0D2660] text-white py-3 rounded-xl font-bold transition-colors"
                >
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#6B7280] mb-8">
                  Saisissez votre adresse e-mail. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1A1A1A]">Adresse E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="exemple@email.com"
                        className="w-full pl-11 pr-4 py-3 border border-[#E2E2DF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 focus:border-[#1A3FA0] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1A3FA0] hover:bg-[#0D2660] text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>Envoyer le lien <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center">
                  <Link href="/connexion" className="text-sm font-medium text-[#6B7280] hover:text-[#1A3FA0]">
                    &larr; Retour à la connexion
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
