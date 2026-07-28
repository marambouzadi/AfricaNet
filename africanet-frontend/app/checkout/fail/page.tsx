'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, Loader2, RefreshCw, ShoppingBag } from 'lucide-react'

function FailContent() {
    const searchParams = useSearchParams()
    const tx = searchParams.get('tx')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!tx) {
            setLoading(false)
            return
        }

        const verifyFail = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                await fetch(`http://localhost:8090/api/payments/flouci/verify?tx=${tx}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                })
            } catch {
                // Erreur ignorée sur le statut d'échec
            } finally {
                setLoading(false)
            }
        }

        verifyFail()
    }, [tx])

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-lg border border-[#E2E2DF] p-8 text-center max-w-lg w-full">
                <Loader2 className="h-10 w-10 text-[#1A3FA0] animate-spin mx-auto mb-3" />
                <p className="text-[#6B7280] text-sm">Traitement en cours...</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-[#E2E2DF] p-8 sm:p-12 text-center max-w-lg w-full space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10" />
            </div>

            <div>
                <h1 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-2">Paiement annulé ou échoué</h1>
                <p className="text-[#6B7280] text-sm">
                    Le paiement n&apos;a pas pu être finalisé. Le stock réservé a été libéré.
                </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    href="/checkout"
                    className="inline-flex items-center justify-center gap-2 bg-[#1A3FA0] hover:bg-[#0D2660] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
                >
                    <RefreshCw className="h-4 w-4" /> Réessayer le paiement
                </Link>
                <Link
                    href="/panier"
                    className="inline-flex items-center justify-center gap-2 border border-[#E2E2DF] hover:bg-gray-50 text-[#1A1A1A] px-6 py-3 rounded-xl font-bold text-sm transition-colors"
                >
                    <ShoppingBag className="h-4 w-4" /> Revenir au panier
                </Link>
            </div>
        </div>
    )
}

export default function CheckoutFailPage() {
    return (
        <main className="min-h-screen bg-[#F5F5F3] flex items-center justify-center px-4 py-12">
            <Suspense fallback={
                <div className="bg-white rounded-2xl shadow-lg border border-[#E2E2DF] p-8 text-center">
                    <Loader2 className="h-8 w-8 text-[#1A3FA0] animate-spin mx-auto" />
                </div>
            }>
                <FailContent />
            </Suspense>
        </main>
    )
}
