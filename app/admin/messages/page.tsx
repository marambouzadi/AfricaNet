'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Search, Mail, MailOpen, Check, X } from 'lucide-react';

const API_BASE = 'http://localhost:8090/api';

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const token = getToken();
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/admin/contact-messages?size=100`, { headers, cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.content || data || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      const token = getToken();
      await fetch(`${API_BASE}/admin/contact-messages/${id}/read`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m));
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = messages.filter(m => {
    const text = `${m.firstName} ${m.lastName} ${m.email} ${m.subject}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="admin-page">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Messages de Contact</h1>
        <p className="text-[#6B7280]">Consultez et répondez aux messages des clients.</p>
      </div>
      <div className="admin-content">

        <div className="admin-card">
          <div className="admin-filters-bar">
            <div className="admin-search-field">
              <Search size={16} className="admin-search-icon-sm" />
              <input type="text" placeholder="Rechercher un message..." value={search}
                onChange={e => setSearch(e.target.value)} className="admin-input" />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Expéditeur</th>
                  <th>Sujet</th>
                  <th>Message</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Aucun message trouvé.</td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id} style={{ opacity: m.isRead ? 0.6 : 1, fontWeight: m.isRead ? 'normal' : '500' }}>
                    <td>
                      {m.isRead ? <MailOpen size={18} className="text-gray-400" /> : <Mail size={18} className="text-[#1A3FA0]" />}
                    </td>
                    <td>{new Date(m.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <div>{m.firstName} {m.lastName}</div>
                      <div className="text-sm text-gray-500">{m.email}</div>
                    </td>
                    <td>{m.subject}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.message}
                    </td>
                    <td>
                      {!m.isRead && (
                        <button onClick={() => handleMarkAsRead(m.id)} className="admin-btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          Marquer lu
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
