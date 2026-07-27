'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  RefreshCw, 
  LogOut, 
  Menu, 
  X,
  Users,
  Settings,
  ShieldCheck,
  TrendingUp,
  Box
} from 'lucide-react'
import { useState } from 'react'

const adminNavItems = [
    { href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/commandes', label: 'Commandes', icon: ShoppingCart },
    { href: '/admin/produits', label: 'Produits', icon: Package },
    { href: '/admin/stock', label: 'Stock & Inventaire', icon: Box },
    { href: '/admin/trade-ins', label: 'Reprises (Trade-in)', icon: RefreshCw },
    { href: '/admin/clients', label: 'Clients', icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Check admin role here (Mocked for now)
    // useEffect(() => { ... }, [])

    const handleLogout = () => {
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-[#F5F5F3] flex flex-col md:flex-row font-sans">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-[#E2E2DF] p-4 flex items-center justify-between sticky top-0 z-50">
                <Link href="/admin/dashboard" className="text-xl font-serif font-bold text-[#1A3FA0] flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6" />
                    Admin
                </Link>
                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-[#1A1A1A] p-2"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E2E2DF] transform transition-transform duration-300 ease-in-out flex flex-col
                md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-[#E2E2DF] hidden md:flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-[#1A3FA0]" />
                    <div>
                        <h1 className="text-xl font-serif font-bold text-[#1A3FA0] leading-none">AfricaNet</h1>
                        <span className="text-xs font-bold tracking-wider text-[#6B7280] uppercase">Back-Office</span>
                    </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-1 mb-8">
                        {adminNavItems.map((item) => {
                            const isActive = pathname.startsWith(item.href)
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        isActive 
                                            ? 'bg-[#1A3FA0] text-white shadow-sm' 
                                            : 'text-[#6B7280] hover:bg-[#F5F5F3] hover:text-[#1A1A1A]'
                                    }`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                <div className="p-4 border-t border-[#E2E2DF]">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-[#E8EDF8] text-[#1A3FA0] flex items-center justify-center font-bold">
                            AD
                        </div>
                        <div>
                            <p className="text-sm font-bold text-[#1A1A1A]">Admin System</p>
                            <p className="text-xs text-[#6B7280]">admin@africanet.tn</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="h-5 w-5" />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    )
}
