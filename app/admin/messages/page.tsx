'use client'

import { useState, useEffect } from 'react'
import { Mail, Search, MailOpen, Loader2, Calendar, Phone, RefreshCw, CheckCheck, Send, X } from 'lucide-react'

const API_BASE = 'http://localhost:8090/api'

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
}

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  'Question sur un produit':          { bg: '#EFF6FF', text: '#1A3FA0' },
  'Suivi de commande':                { bg: '#FFF7ED', text: '#EA580C' },
  'Demande de devis (Entreprises)':   { bg: '#FAF5FF', text: '#9333EA' },
  'Service Après Vente (Garantie)':   { bg: '#F0FDF4', text: '#16A34A' },
  'Autre demande':                    { bg: '#F3F4F6', text: '#6B7280' },
}

function SubjectBadge({ subject }: { subject: string }) {
  const colors = SUBJECT_COLORS[subject] || { bg: '#F3F4F6', text: '#6B7280' }
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: colors.bg, color: colors.text }}
    >
      {subject}
    </span>
  )
}

function MessageModal({ msg, onClose, onMarkRead, markingId }: { msg: any; onClose: () => void; onMarkRead: () => void; markingId: number | null }) {
  const isMarking = markingId === msg.id
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSendReply = async () => {
    if (!replyText.trim()) return
    setSending(true)
    try {
      // Simulate sending - in production, call your email service endpoint
      await new Promise(r => setTimeout(r, 900))
      setSent(true)
      setReplyText('')
      setShowReply(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#E2E2DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A3FA0] text-white flex items-center justify-center font-bold text-sm">
              {msg.firstName?.charAt(0)}{msg.lastName?.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-[#1A1A1A]">{msg.firstName} {msg.lastName}</p>
              <p className="text-sm text-[#6B7280]">{msg.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center">&times;</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <SubjectBadge subject={msg.subject} />
            {msg.phone && (
              <span className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                <Phone className="h-3.5 w-3.5" /> {msg.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-sm text-[#6B7280] ml-auto">
              <Calendar className="h-3.5 w-3.5" />
              {msg.createdAt
                ? new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })
                : '—'}
            </span>
          </div>

          <div className="bg-[#F5F5F3] rounded-xl p-5">
            <p className="text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          </div>

          {/* In-app Reply Panel */}
          {showReply ? (
            <div className="border border-[#E2E2DF] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#1A1A1A]">Réponse à {msg.firstName} {msg.lastName}</p>
                <button onClick={() => setShowReply(false)} className="text-[#6B7280] hover:text-[#1A1A1A]"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-xs text-[#6B7280]">À : {msg.email}</p>
              <textarea
                rows={5}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={`Bonjour ${msg.firstName},\n\nMerci de votre message...`}
                className="w-full text-sm border border-[#E2E2DF] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowReply(false)}
                  className="px-4 py-2 border border-[#E2E2DF] text-sm rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={sending || !replyText.trim()}
                  className="px-5 py-2.5 bg-[#1A3FA0] text-white rounded-lg font-medium hover:bg-[#0D2660] transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Envoyer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center pt-2 flex-wrap gap-3">
              <a
                href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                className="px-5 py-2.5 bg-[#1A3FA0] text-white rounded-lg font-medium hover:bg-[#0D2660] transition-colors text-sm flex items-center gap-2"
              >
                <Mail className="h-4 w-4" /> Répondre par email
              </a>
              <button
                onClick={!msg.isRead ? onMarkRead : undefined}
                disabled={isMarking}
                className={`px-5 py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 disabled:opacity-60 ${
                  msg.isRead
                    ? 'bg-[#D1F232]/40 text-[#1A1A1A]/40 cursor-default'
                    : 'bg-[#D1F232] text-[#1A1A1A] hover:bg-[#bce600] cursor-pointer'
                }`}
              >
                {isMarking
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <CheckCheck className="h-4 w-4" />
                }
                {msg.isRead ? 'Déjà lu' : 'Marquer comme lu'}
              </button>
            </div>
          )}
          {sent && !showReply && (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <CheckCheck className="h-3.5 w-3.5" /> Réponse envoyée
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [selected, setSelected] = useState<any | null>(null)
  const [markingId, setMarkingId] = useState<number | null>(null)

  const loadMessages = async () => {
    setLoading(true)
    try {
      const token = getToken()
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`${API_BASE}/admin/contact-messages?size=100&sort=createdAt,desc`, { headers, cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.content || data || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadMessages() }, [])

  const markAsRead = async (id: number) => {
    setMarkingId(id)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/admin/contact-messages/${id}/read`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
        if (selected?.id === id) setSelected((prev: any) => ({ ...prev, isRead: true }))
      }
    } catch (e) { console.error(e) }
    finally { setMarkingId(null) }
  }

  const filtered = messages.filter(m => {
    const matchesSearch = !search ||
      `${m.firstName} ${m.lastName} ${m.email} ${m.subject} ${m.message}`
        .toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'unread' ? !m.isRead :
      m.isRead
    return matchesSearch && matchesFilter
  })

  const unreadCount = messages.filter(m => !m.isRead).length

  return (
    <div className="space-y-6">
      {/* Header — matches dashboard style */}
      <div className="mb-2">
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Messages clients</h1>
        <p className="text-[#6B7280]">
          {unreadCount} non lu{unreadCount !== 1 ? 's' : ''} · {messages.length} message{messages.length !== 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Stats Row — matches dashboard KPI card style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total messages', value: messages.length, iconBg: 'bg-[#E8EDF8]', iconColor: 'text-[#1A3FA0]', icon: Mail },
          { label: 'Non lus', value: unreadCount, iconBg: 'bg-[#FFF7ED]', iconColor: 'text-[#EA580C]', icon: MailOpen },
          { label: 'Traités', value: messages.length - unreadCount, iconBg: 'bg-[#F0FDF4]', iconColor: 'text-[#16A34A]', icon: CheckCheck },
        ].map(({ label, value, iconBg, iconColor, icon: Icon }) => (
          <div key={label} className="bg-white p-6 rounded-xl shadow-sm border border-[#E2E2DF]">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${iconBg} ${iconColor} rounded-lg flex items-center justify-center`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-[#6B7280] text-sm font-medium">{label}</h3>
            <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, sujet..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E2E2DF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3FA0]/30 bg-white"
          />
        </div>
        <div className="flex gap-2 bg-white border border-[#E2E2DF] rounded-xl p-1 shadow-sm shrink-0">
          {(['all', 'unread', 'read'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-[#1A3FA0] text-white' : 'text-[#6B7280] hover:text-[#1A1A1A]'}`}
            >
              {f === 'all' ? 'Tous' : f === 'unread' ? 'Non lus' : 'Lus'}
            </button>
          ))}
        </div>
        <button
          onClick={loadMessages}
          disabled={loading}
          className="px-4 py-2.5 border border-[#E2E2DF] rounded-xl text-sm font-medium text-[#6B7280] hover:bg-[#F5F5F3] transition-colors flex items-center gap-2 bg-white shadow-sm shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#1A3FA0] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Mail className="h-12 w-12 text-[#E2E2DF] mx-auto mb-4" />
            <p className="text-[#6B7280] font-medium">Aucun message trouvé</p>
            <p className="text-sm text-[#6B7280] mt-1">Les messages du formulaire de contact apparaîtront ici.</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-[24px_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-[#F5F5F3] text-xs font-semibold uppercase tracking-wider text-[#6B7280] border-b border-[#E2E2DF]">
              <span />
              <span>Expéditeur</span>
              <span>Sujet & Aperçu</span>
              <span className="hidden lg:block">Date</span>
              <span>Action</span>
            </div>

            <div className="divide-y divide-[#F5F5F3]">
              {filtered.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => setSelected(msg)}
                  className={`grid grid-cols-[24px_1fr_auto] sm:grid-cols-[24px_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center cursor-pointer hover:bg-[#F5F5F3] transition-colors ${!msg.isRead ? 'bg-[#FFFBEB]' : ''}`}
                >
                  {/* Status indicator */}
                  <div className="flex items-center justify-center">
                    {msg.isRead
                      ? <MailOpen className="h-4 w-4 text-[#9CA3AF]" />
                      : <div className="w-2.5 h-2.5 rounded-full bg-[#EA580C] animate-pulse" />
                    }
                  </div>

                  {/* Sender */}
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${!msg.isRead ? 'font-bold text-[#1A1A1A]' : 'font-medium text-[#374151]'}`}>
                      {msg.firstName} {msg.lastName}
                    </p>
                    <p className="text-xs text-[#6B7280] truncate">{msg.email}</p>
                  </div>

                  {/* Subject & preview (hidden on mobile) */}
                  <div className="min-w-0 hidden sm:block">
                    <SubjectBadge subject={msg.subject} />
                    <p className="text-xs text-[#6B7280] mt-1 truncate">
                      {msg.message?.substring(0, 70)}{msg.message?.length > 70 ? '...' : ''}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </div>

                  {/* Action */}
                  <div onClick={e => e.stopPropagation()}>
                    {!msg.isRead ? (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        disabled={markingId === msg.id}
                        className="px-3 py-1.5 bg-[#1A3FA0] text-white rounded-lg text-xs font-medium hover:bg-[#0D2660] transition-colors flex items-center gap-1.5 disabled:opacity-60"
                      >
                        {markingId === msg.id
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <CheckCheck className="h-3 w-3" />
                        }
                        Lu
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-[#F0FDF4] text-[#16A34A] rounded-lg text-xs font-semibold flex items-center gap-1.5">
                        <CheckCheck className="h-3 w-3" /> Traité
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Full message modal */}
      {selected && (
        <MessageModal
          msg={selected}
          onClose={() => setSelected(null)}
          onMarkRead={() => markAsRead(selected.id)}
          markingId={markingId}
        />
      )}
    </div>
  )
}
