'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LayoutDashboard, ShoppingBag, RefreshCw, User, Settings, LogOut, Menu, X, Heart, ShieldCheck, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
    { href: '/dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
    { href: '/dashboard/commandes', label: 'Mes Commandes', icon: ShoppingBag },
    { href: '/dashboard/favoris', label: 'Mes Favoris', icon: Heart },
    { href: '/dashboard/reprises', label: 'Mes Reprises', icon: RefreshCw },
    { href: '/dashboard/profil', label: 'Mon Profil', icon: User },
    { href: '/dashboard/parametres', label: 'Paramètres', icon: Settings },
]

interface UserProfile {
    id: number
    email: string
    firstName: string
    lastName: string
    role: string
}

function SidebarContent({ pathname, onClose, user, logout }: { pathname: string, onClose?: () => void, user: UserProfile | null, logout: () => void }) {
    const fullName = user ? `${user.firstName} ${user.lastName}` : 'Invité'
    const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : '?'

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] p-6 text-center mb-4">
                <div className="w-20 h-20 bg-[#E8EDF8] text-[#1A3FA0] rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-4">
                    {initials}
                </div>
                <h2 className="font-bold text-[#1A1A1A] text-lg">{fullName}</h2>
                <p className="text-sm text-[#6B7280]">Membre AfricaNet</p>
            </div>

            <nav className="bg-white rounded-xl shadow-sm border border-[#E2E2DF] overflow-hidden mb-4">
                {navItems.map((item, i) => {
                    const isActive = item.href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-6 py-4 transition-colors ${i < navItems.length - 1 ? 'border-b border-[#E2E2DF]' : ''} ${isActive ? 'bg-[#E8EDF8] text-[#1A3FA0]' : 'text-[#1A1A1A] hover:bg-[#F5F5F3]'}`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive ? 'text-[#1A3FA0]' : 'text-[#6B7280]'}`} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && <span className="ml-auto w-1.5 h-4 bg-[#1A3FA0] rounded-full" />}
                        </Link>
                    )
                })}
            </nav>

            {user?.role === 'ADMIN' && (
                <Link
                    href="/admin/dashboard"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-6 py-3 mb-3 bg-[#EFF6FF] text-[#1A3FA0] hover:bg-[#DBEAFE] rounded-xl border border-[#BFDBFE] transition-colors font-semibold text-sm"
                >
                    <ShieldCheck className="h-5 w-5" />
                    <span className="flex-1">Espace Admin</span>
                    <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
            )}
            <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-6 py-4 text-[#EF4444] hover:bg-[#EF4444] hover:text-white hover:border-[#EF4444] rounded-xl border border-[#FCA5A5] transition-colors font-medium justify-center group"
            >
                <LogOut className="h-5 w-5 transition-colors group-hover:text-white" />
                Se déconnecter
            </button>
        </>
    )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { user, loading, logout } = useUser()

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    useEffect(() => {
        if (!loading && !user) {
            router.push('/connexion')
        }
    }, [user, loading, router])

    if (loading || !user) {
        return (
            <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    Chargement...
                </div>
            </div>
        )
    }

    const currentPage = navItems.find(item =>
        item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
    )

    const fullName = `${user.firstName} ${user.lastName}`
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

    return (
        <div className="min-h-screen flex flex-col bg-[#F5F5F3]">
            <Navbar />

            <main className="flex-1 py-6 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* Mobile top bar */}
                    <div className="md:hidden flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-[#E2E2DF]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E8EDF8] text-[#1A3FA0] rounded-full flex items-center justify-center font-bold text-sm">{initials}</div>
                            <div>
                                <p className="font-bold text-[#1A1A1A] text-sm">{fullName}</p>
                                <p className="text-xs text-[#6B7280]">{currentPage?.label || 'Mon Espace'}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 text-[#1A1A1A] hover:bg-[#F5F5F3] rounded-lg transition-colors"
                            aria-label="Ouvrir le menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Mobile drawer overlay */}
                    {mobileMenuOpen && (
                        <div className="fixed inset-0 z-50 md:hidden">
                            <div
                                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                onClick={() => setMobileMenuOpen(false)}
                            />
                            <div className="absolute left-0 top-0 bottom-0 w-80 bg-[#F5F5F3] p-4 overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="font-serif font-bold text-lg text-[#1A1A1A]">Mon Espace</h2>
                                    <button
                                        type="button"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2 text-[#6B7280] hover:bg-white rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <SidebarContent pathname={pathname} onClose={() => setMobileMenuOpen(false)} user={user} logout={handleLogout} />
                            </div>
                        </div>
                    )}

                    {/* Desktop layout */}
                    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
                        {/* Desktop Sidebar */}
                        <aside className="hidden md:block flex-shrink-0 sticky top-24 self-start">
                        <SidebarContent pathname={pathname} user={user} logout={handleLogout} />
                    </aside>

                        {/* Main Content */}
                        <div className="min-w-0 overflow-hidden">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}