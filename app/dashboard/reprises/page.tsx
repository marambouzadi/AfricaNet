'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RefreshCw, Plus, ArrowRight } from 'lucide-react'
import { getUserTradeIns } from '@/lib/api'

interface TradeIn {
  id: number
  referenceNumber: string
  deviceType: string
  brandName: string
  model: string
  manufactureYear: number | null
  estimatedValueAi: number | null
  finalValue: number | null
  status: string
  createdAt: string
}

const statusStyles: Record<string, string> = {
  SUBMITTED:  'bg-gray-100 text-gray-700',
  EVALUATING: 'bg-blue-100 text-blue-800',
  APPROVED:   'bg-green-100 text-green-800',
  REJECTED:   'bg-red-100 text-red-800',
  COMPLETED:  'bg-purple-100 text-purple-800',
}

const statusLabels: Record<string, string> = {
  SUBMITTED:  'Soumise',
  EVALUATING: 'Analyse IA',
  APPROVED:   'Approuvée',
  REJECTED:   'Refusée',
  COMPLETED:  'Complétée',
}

function formatValue(val: number | null): string {
  if (val == null) return 'En cours d\'estimation'
  return `${val.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND`
}

export default function TradeInsPage() {
  const [tradeIns, setTradeIns] = useState<TradeIn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    getUserTradeIns()
      .then((data: any) => {
        if (!ignore) setTradeIns(Array.isArray(data) ? data : data.content || [])
      })
      .catch(() => {
        if (!ignore) setError('Impossible de récupérer vos reprises. Vérifiez votre connexion.')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => { ignore = true }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Mes Reprises</h1>
          <p className="text-[#6B7280]">Suivez l&apos;estimation et le statut de vos anciens appareils.</p>
        </div>
        <Link
          href="/reprise"
          className="inline-flex items-center gap-2 bg-[#1A3FA0] hover:bg-[#0D2660] text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap w-fit"
        >
          <Plus className="h-4 w-4" />
          Nouvelle estimation
        </Link>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        {loading ? (
          <p className="p-6 text-[#6B7280]">Chargement de vos reprises...</p>

        ) : error ? (
          <p className="p-6 text-red-600">{error}</p>

        ) : tradeIns.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-[#F5F5F3] rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-[#6B7280]" />
            </div>
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">Aucune reprise en cours</h3>
            <p className="text-[#6B7280] mb-6 max-w-sm mx-auto">
              Vous avez un ancien PC portable qui prend la poussière ? Estimez sa valeur en ligne grâce à notre IA.
            </p>
            <Link
              href="/reprise"
              className="inline-flex items-center gap-2 text-[#1A3FA0] font-medium hover:underline"
            >
              Faire une estimation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E2E2DF] text-sm text-[#6B7280]">
                  <th className="px-6 py-4 font-medium">Dossier ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Appareil</th>
                  <th className="px-6 py-4 font-medium">Valeur Estimée</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DF]">
                {tradeIns.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#1A1A1A]">
                      {trade.referenceNumber || `#${trade.id}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">
                      {new Date(trade.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[#1A1A1A]">
                      {[trade.brandName, trade.model, trade.manufactureYear].filter(Boolean).join(' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7280] italic">
                      {formatValue(trade.finalValue ?? trade.estimatedValueAi)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusStyles[trade.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[trade.status] || trade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
