import Link from 'next/link'
import Image from 'next/image'
import { Clock, MapPin, Phone } from 'lucide-react'
import { NAV_LINKS, COMPANY } from '@/lib/constants'

function FacebookIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="bg-[#0D2660] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/africanet-logo.jpg"
              alt="AfricaNet"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-serif text-lg font-bold">{COMPANY.name}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-white/70">{COMPANY.tagline}</p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="font-serif text-sm font-bold uppercase tracking-wide">Navigation</h3>
          <ul className="mt-4 flex flex-col gap-2">
            <li>
              <Link
                href="/"
                className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
              >
                Accueil
              </Link>
            </li>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-serif text-sm font-bold uppercase tracking-wide">Contact</h3>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-white/70">
            <li>
              <a
                href="tel:+21693625611"
                className="flex items-center gap-2 transition-colors duration-200 hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {COMPANY.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              {COMPANY.address}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              {COMPANY.hours}
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="font-serif text-sm font-bold uppercase tracking-wide">Réseaux sociaux</h3>
          <div className="mt-4 flex gap-3">
            <a
              href="https://www.facebook.com/AfricaNetTN"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook AfricaNet"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors duration-200 hover:bg-white/20"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/africanet.tun/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram AfricaNet"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors duration-200 hover:bg-white/20"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-center text-xs text-white/60">
            © {new Date().getFullYear()} {COMPANY.name}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
