'use client'

import { useState } from 'react'
import { Search, Filter, CheckCircle2, XCircle, Eye, Cpu, RefreshCw, X, Sparkles } from 'lucide-react'
import { formatPrice } from '@/lib/products'

interface TradeInItem {
  id: string
  referenceNumber: string
  clientName: string
  clientEmail: string
  deviceType: string
  brand: string
  model: string
  aiEstimate: number
  finalOffer?: number
  status: 'SUBMITTED' | 'EVALUATING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  date: string
  scores: { screen: number; battery: number; keyboard: number; chassis: number }
}

const initialTradeIns: TradeInItem[] = [
  {
    id: '1',
    referenceNumber: 'TRD-2026-0081',
    clientName: 'Karim Ben Ammar',
    clientEmail: 'karim.ba@gmail.com',
    deviceType: 'PC Portable',
    brand: 'Dell',
    model: 'Latitude 5410 Core i5 10th Gen',
    aiEstimate: 850,
    finalOffer: 850,
    status: 'SUBMITTED',
    date: '28 Juil 2026, 11:20',
    scores: { screen: 8, battery: 7, keyboard: 9, chassis: 8 }
  },
  {
    id: '2',
    referenceNumber: 'TRD-2026-0080',
    clientName: 'Sonia Chebbi',
    clientEmail: 'sonia.chebbi@yahoo.fr',
    deviceType: 'PC Portable',
    brand: 'HP',
    model: 'EliteBook 840 G6',
    aiEstimate: 1100,
    finalOffer: 1050,
    status: 'EVALUATING',
    date: '27 Juil 2026, 16:40',
    scores: { screen: 9, battery: 8, keyboard: 8, chassis: 7 }
  },
  {
    id: '3',
    referenceNumber: 'TRD-2026-0079',
    clientName: 'Mehdi Said',
    clientEmail: 'msaid@hotmail.com',
    deviceType: 'PC Portable',
    brand: 'Apple',
    model: 'MacBook Air M1 2020',
    aiEstimate: 1850,
    finalOffer: 1900,
    status: 'APPROVED',
    date: '25 Juil 2026, 14:10',
    scores: { screen: 10, battery: 9, keyboard: 10, chassis: 9 }
  }
]

const statusStyles: Record<string, { label: string; style: string }> = {
  SUBMITTED: { label: 'En attente', style: 'bg-yellow-100 text-yellow-800' },
  EVALUATING: { label: 'Analyse IA', style: 'bg-blue-100 text-blue-800' },
  APPROVED: { label: 'Approuvée', style: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Refusée', style: 'bg-red-100 text-red-800' },
  COMPLETED: { label: 'Complétée', style: 'bg-purple-100 text-purple-800' },
}

export default function AdminTradeInsPage() {
  const [tradeInsList, setTradeInsList] = useState<TradeInItem[]>(initialTradeIns)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('Tous')
  const [selectedTradeIn, setSelectedTradeIn] = useState<TradeInItem | null>(null)
  const [customPrice, setCustomPrice] = useState<string>('')

  const filteredTradeIns = tradeInsList.filter(t => {
    const matchesSearch = t.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
                          t.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          t.model.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'Tous' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApprove = (id: string) => {
    const offer = customPrice ? parseFloat(customPrice) : selectedTradeIn?.aiEstimate
    setTradeInsList(prev => prev.map(t => t.id === id ? { ...t, status: 'APPROVED', finalOffer: offer } : t))
    setSelectedTradeIn(null)
  }

  const handleReject = (id: string) => {
    setTradeInsList(prev => prev.map(t => t.id === id ? { ...t, status: 'REJECTED' } : t))
    setSelectedTradeIn(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Validation des Reprises (Trade-In)</h1>
        <p className="text-[#6B7280]">Évaluez les demandes d'échange de matériel occasion et validez les offres finales.</p>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E2DF] flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Rechercher par N° référence, client ou modèle..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#6B7280]" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#F5F5F3] border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30"
          >
            <option value="Tous">Tous les statuts</option>
            <option value="SUBMITTED">En attente</option>
            <option value="EVALUATING">Analyse IA</option>
            <option value="APPROVED">Approuvée</option>
            <option value="REJECTED">Refusée</option>
            <option value="COMPLETED">Complétée</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#6B7280]">
            <thead className="bg-[#F5F5F3] text-[#1A1A1A] uppercase text-xs font-semibold border-b border-[#E2E2DF]">
              <tr>
                <th className="px-6 py-4">Référence</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Appareil</th>
                <th className="px-6 py-4">Est. IA</th>
                <th className="px-6 py-4">Offre Finale</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Évaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2DF]">
              {filteredTradeIns.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#1A1A1A]">{t.referenceNumber}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#1A1A1A] block">{t.clientName}</span>
                    <span className="text-xs text-[#6B7280]">{t.clientEmail}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#1A1A1A]">{t.brand} {t.model}</td>
                  <td className="px-6 py-4 font-semibold text-purple-700">{formatPrice(t.aiEstimate)}</td>
                  <td className="px-6 py-4 font-bold text-[#1A3FA0]">
                    {t.finalOffer ? formatPrice(t.finalOffer) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[t.status]?.style}`}>
                      {statusStyles[t.status]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => { setSelectedTradeIn(t); setCustomPrice(t.finalOffer?.toString() || t.aiEstimate.toString()); }}
                      className="px-3 py-1.5 bg-[#E8EDF8] text-[#1A3FA0] hover:bg-[#1A3FA0] hover:text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Examiner
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedTradeIn && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center border-b border-[#E2E2DF] pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#1A1A1A]">Examen Reprise {selectedTradeIn.referenceNumber}</h3>
                <p className="text-xs text-[#6B7280]">{selectedTradeIn.brand} {selectedTradeIn.model}</p>
              </div>
              <button onClick={() => setSelectedTradeIn(null)} className="text-[#6B7280] hover:text-[#1A1A1A]"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-[#F5F5F3] p-3 rounded-lg flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                  <Sparkles className="h-4 w-4" /> Estimation IA Automatique
                </span>
                <span className="text-base font-bold text-purple-900">{formatPrice(selectedTradeIn.aiEstimate)}</span>
              </div>

              <div className="border border-[#E2E2DF] rounded-lg p-3 space-y-2">
                <p className="font-bold text-xs uppercase text-[#6B7280]">Notes d'état (sur 10)</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between bg-[#F5F5F3] p-2 rounded"><span>Écran:</span> <strong>{selectedTradeIn.scores.screen}/10</strong></div>
                  <div className="flex justify-between bg-[#F5F5F3] p-2 rounded"><span>Batterie:</span> <strong>{selectedTradeIn.scores.battery}/10</strong></div>
                  <div className="flex justify-between bg-[#F5F5F3] p-2 rounded"><span>Clavier:</span> <strong>{selectedTradeIn.scores.keyboard}/10</strong></div>
                  <div className="flex justify-between bg-[#F5F5F3] p-2 rounded"><span>Châssis:</span> <strong>{selectedTradeIn.scores.chassis}/10</strong></div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Offre Financière Validée (TND)</label>
                <input
                  type="number"
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)}
                  className="w-full border border-[#E2E2DF] rounded-lg px-3 py-2 text-sm font-bold text-[#1A3FA0]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-[#E2E2DF]">
              <button
                onClick={() => handleReject(selectedTradeIn.id)}
                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" />
                Refuser
              </button>
              <button
                onClick={() => handleApprove(selectedTradeIn.id)}
                className="px-5 py-2 bg-[#1A3FA0] text-white hover:bg-[#0D2660] text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approuver & Proposer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
