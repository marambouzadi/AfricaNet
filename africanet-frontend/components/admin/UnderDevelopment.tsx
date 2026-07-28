'use client';

import AdminHeader from './AdminHeader';
import { Wrench, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  title: string;
  breadcrumb: string;
  description?: string;
}

export default function UnderDevelopment({ title, breadcrumb, description }: Props) {
  return (
    <div className="admin-page">
      <AdminHeader title={title} breadcrumb={breadcrumb} />
      <div className="admin-content">
        <div className="admin-card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF] text-[#1A3FA0]">
            <Wrench size={36} />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-[#0F172A]">Page en cours de développement</h2>
          <p className="mb-6 max-w-md text-sm text-[#64748B]">
            {description || `La section "${title}" est actuellement en cours de finalisation par l'équipe.`}
          </p>
          <div className="flex items-center gap-2 rounded-full bg-[#F1F5F9] px-4 py-2 text-xs font-semibold text-[#475569]">
            <Clock size={14} className="text-[#1A3FA0]" /> Arrivée prévue très prochainement
          </div>
          <Link
            href="/admin"
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#1A3FA0] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0D2660]"
          >
            <ArrowLeft size={16} /> Retour au Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
