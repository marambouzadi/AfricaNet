'use client'

import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { Bell } from 'lucide-react'

interface AdminHeaderProps {
  title?: string
  breadcrumb?: string
}

const ADMIN_ROUTE_CONFIG: Record<string, { title: string; breadcrumb: string }> = {
  '/admin/dashboard': { title: 'Tableau de bord', breadcrumb: 'Gestion · Tableau de bord' },
  '/admin/commandes': { title: 'Gestion des Commandes', breadcrumb: 'Gestion · Commandes' },
  '/admin/produits': { title: 'Gestion des Produits', breadcrumb: 'Gestion · Produits' },
  '/admin/stock': { title: 'Stock & Inventaire', breadcrumb: 'Gestion · Stock & Inventaire' },
  '/admin/trade-ins': { title: 'Reprises (Trade-in)', breadcrumb: 'Gestion · Échanges' },
  '/admin/clients': { title: 'Gestion des Clients', breadcrumb: 'Gestion · Clients' },
}

export default function AdminHeader({ title: customTitle, breadcrumb: customBreadcrumb }: AdminHeaderProps) {
  const pathname = usePathname()
  const { user } = useUser()

  const matchedKey = Object.keys(ADMIN_ROUTE_CONFIG).find((route) => pathname.startsWith(route))
  const routeConfig = matchedKey ? ADMIN_ROUTE_CONFIG[matchedKey] : null

  const title = customTitle || routeConfig?.title || 'Administration'
  const breadcrumb = customBreadcrumb || routeConfig?.breadcrumb || 'Gestion · Back-Office'

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : 'AD'

  return (
    <header className="bg-white border-b border-[#E2E2DF] px-6 py-4 flex items-center justify-between sticky top-0 z-30 flex-shrink-0 shadow-sm">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-[#1A1A1A] leading-snug">{title}</h1>
        <p className="text-xs text-[#6B7280] font-medium">{breadcrumb}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative p-2 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F5F5F3] rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
            3
          </span>
        </button>
        <div className="w-9 h-9 rounded-full bg-[#1A3FA0] text-white flex items-center justify-center font-bold text-sm shadow-sm">
          {initials || 'AD'}
        </div>
      </div>
    </header>
  )
}
