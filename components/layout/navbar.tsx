'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Search, ShoppingCart, User, X } from 'lucide-react'
import { NAV_LINKS } from '@/lib/constants'
import { useCart } from '@/lib/cart-context'
import { useUser } from '@/lib/user-context'
import { searchProducts } from '@/lib/api'
import type { ProductResponse } from '@/lib/api'

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="AfricaNet accueil">
      <Image
        src="/africanet-logo.jpg"
        alt="AfricaNet"
        width={40}
        height={40}
        className="rounded-full"
        priority
      />
      <span className="font-serif text-lg font-bold text-[#1A1A1A]">AfricaNet</span>
    </Link>
  )
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input and setup ESC key
  useEffect(() => {
    inputRef.current?.focus()
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Debounced live search (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await searchProducts(query.trim(), 0, 6)
        setResults(res.content)
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-auto mt-20 w-[90%] max-w-2xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center gap-3 border-b border-[#E2E2DF] px-5 py-4">
            <Search className="h-5 w-5 shrink-0 text-[#6B7280]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit, une marque, une spec..."
              className="w-full text-base text-[#1A1A1A] placeholder:text-[#6B7280] outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  onClose()
                  router.push(`/catalogue?q=${encodeURIComponent(query.trim())}`)
                }
              }}
            />
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-[#F5F5F3] hover:text-[#1A1A1A]"
              aria-label="Fermer la recherche"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {query.trim().length >= 2 && (
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="px-5 py-8 text-center text-sm text-[#6B7280]">
                  Recherche en cours...
                </div>
              ) : results.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-[#6B7280]">
                  Aucun résultat pour &quot;{query}&quot;
                </p>
              ) : (
                <ul>
                  {results.map((product) => {
                    const brandName = product.brandName || (typeof product.brand === 'string' ? product.brand : (product.brand as {name?: string})?.name) || ''
                    const price = product.salePrice ?? product.basePrice ?? 0
                    return (
                      <li key={product.id}>
                        <Link
                          href={`/produit/${product.id}`}
                          onClick={onClose}
                          className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[#F5F5F3]"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E8EDF8]">
                            <span className="text-xs font-bold text-[#1A3FA0]">{brandName.substring(0, 2).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#1A1A1A]">{product.name}</p>
                            <p className="text-xs text-[#6B7280]">{brandName}</p>
                          </div>
                          <span className="shrink-0 text-sm font-bold text-[#1A3FA0]">
                            {Number(price).toFixed(3)} TND
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
              {results.length > 0 && (
                <div className="border-t border-[#E2E2DF] px-5 py-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      router.push(`/catalogue?q=${encodeURIComponent(query.trim())}`)
                    }}
                    className="w-full text-center text-sm font-medium text-[#1A3FA0] transition-colors hover:text-[#0D2660]"
                  >
                    Voir tous les résultats →
                  </button>
                </div>
              )}
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="px-5 py-6 text-center text-sm text-[#6B7280]">
              Tapez au moins 2 caractères pour rechercher
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const { totalItems } = useCart()
  const { user } = useUser()

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#E2E2DF] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-[#1A1A1A] md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Logo />
          </div>

          <nav className="hidden gap-8 md:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => {
              const isActive = link.href.startsWith('/') && pathname === link.href
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition-colors duration-200 hover:text-[#1A3FA0] ${
                    isActive ? 'text-[#1A3FA0]' : 'text-[#1A1A1A]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1 md:gap-3">
            <button
              type="button"
              className="relative rounded-full p-2 text-[#1A1A1A] transition-colors hover:bg-[#F5F5F3]"
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              href="/panier"
              aria-label={`Panier (${totalItems} articles)`}
              className="relative p-2 text-[#1A1A1A] transition-colors duration-200 hover:text-[#1A3FA0]"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1A3FA0] text-[10px] font-bold text-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E8EDF8] text-[#1A3FA0] font-bold text-sm hover:ring-2 hover:ring-[#1A3FA0]/30 transition-all"
                  title="Mon Profil"
                >
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="hidden items-center gap-1.5 text-sm font-medium text-[#1A1A1A] transition-colors duration-200 hover:text-[#1A3FA0] sm:flex"
                >
                  <User className="h-5 w-5" />
                  Connexion
                </Link>
                <Link href="/connexion" className="text-[#1A1A1A] sm:hidden" aria-label="Connexion">
                  <User className="h-5 w-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile navigation — full-screen overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          menuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Menu panel */}
        <div
          className={`absolute left-0 right-0 top-16 bg-white border-b border-[#E2E2DF] shadow-lg transition-all duration-300 ${
            menuOpen
              ? 'translate-y-0 opacity-100'
              : '-translate-y-4 opacity-0'
          }`}
        >
          <nav className="px-6 py-5" aria-label="Navigation mobile">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = link.href.startsWith('/') && pathname === link.href
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`block rounded-lg px-3 py-3 text-base font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-[#E8EDF8] text-[#1A3FA0]'
                          : 'text-[#1A1A1A] hover:bg-[#F5F5F3]'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <div className="mt-4 border-t border-[#E2E2DF] pt-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-[#1A1A1A] transition-colors hover:bg-[#F5F5F3]"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Profil
                </Link>
              ) : (
                <Link
                  href="/connexion"
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-medium text-[#1A1A1A] transition-colors hover:bg-[#F5F5F3]"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  Connexion
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}

