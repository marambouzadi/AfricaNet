'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      setAuthorized(false);
      return;
    }

    fetch('http://localhost:8090/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.role === 'ADMIN') {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      })
      .catch(() => {
        setAuthorized(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1A3FA0] border-t-transparent" />
          <p className="text-sm font-medium text-[#64748B]">Vérification des droits administrateur...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8FAFC] p-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert size={32} />
          </div>
          <h2 className="mb-2 font-serif text-2xl font-bold text-[#0F172A]">Accès Refusé</h2>
          <p className="mb-6 text-sm text-[#64748B]">
            Vous devez être connecté avec un compte <strong>Administrateur</strong> (Rôle: ADMIN) pour accéder au Back-office AfricaNet.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/connexion"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1A3FA0] py-3 text-sm font-bold text-white transition-colors hover:bg-[#0D2660]"
            >
              Se connecter comme Admin
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] py-3 text-sm font-medium text-[#475569] transition-colors hover:bg-[#F8FAFC]"
            >
              <ArrowLeft size={16} /> Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
