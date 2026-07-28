import type { Metadata } from 'next';
import AdminGuard from '@/components/admin/AdminGuard';
import '../globals.css';
import './admin.css';

export const metadata: Metadata = {
  title: 'AfricaNet — Back-office Admin',
  description: 'Panneau d\'administration AfricaNet',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
