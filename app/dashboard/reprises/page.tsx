'use client'

import Link from 'next/link'
import { RefreshCw, Search, Plus, ArrowRight, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getUserTradeIns } from '@/lib/api'

export default function TradeInsPage() {
  const [tradeIns, setTradeIns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTradeIns() {
      try {
        const data = await getUserTradeIns()
        setTradeIns(data || [])
      } catch (err) {
        console.error('Erreur lors du chargement des reprises:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTradeIns()
  }, [])

  if (loading) {
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
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Mes Reprises</h1>
          <p className="text-[#6B7280]">Suivez l'estimation et le statut de vos anciens appareils.</p>
        </div>
        
        <Link 
          href="/reprise" 
          className="inline-flex items-center gap-2 bg-[#1A3FA0] hover:bg-[#0D2660] text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap w-fit"
        >
          <Plus className="h-4 w-4" />
          Nouvelle estimation
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        {tradeIns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E2E2DF] text-sm text-[#6B7280]">
                  <th className="px-6 py-4 font-medium">Dossier ID</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Appareil</th>
                  <th className="px-6 py-4 font-medium">Valeur Estimée</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2DF]">
                {tradeIns.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#1A1A1A]">{trade.id}</td>
                    <td className="px-6 py-4 text-sm text-[#6B7280]">{new Date(trade.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-[#1A1A1A]">{trade.brand} {trade.model}</td>
                    <td className="px-6 py-4 text-sm text-[#6B7280] italic">
                      {trade.estimatedValue ? `${trade.estimatedValue} TND` : "En cours d'estimation"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-sm font-medium text-[#1A3FA0] hover:underline">
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
