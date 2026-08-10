'use client'

import { usePathname } from 'next/navigation'

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
  '/admin/messages': { title: 'Messages clients', breadcrumb: 'Gestion · Messages' },
}

export default function AdminHeader({ title: customTitle, breadcrumb: customBreadcrumb }: AdminHeaderProps) {
  const pathname = usePathname()

  const matchedKey = Object.keys(ADMIN_ROUTE_CONFIG).find((route) => pathname.startsWith(route))
  const routeConfig = matchedKey ? ADMIN_ROUTE_CONFIG[matchedKey] : null

  const title = customTitle || routeConfig?.title || 'Administration'
  const breadcrumb = customBreadcrumb || routeConfig?.breadcrumb || 'Gestion · Back-Office'

  return (
    <header className="bg-white border-b border-[#E2E2DF] px-6 py-4 flex items-center sticky top-0 z-30 flex-shrink-0 shadow-sm">
      <div className="flex flex-col">
        <h1 className="text-xl font-bold text-[#1A1A1A] leading-snug">{title}</h1>
        <p className="text-xs text-[#6B7280] font-medium">{breadcrumb}</p>
      </div>
    </header>
  )
}
