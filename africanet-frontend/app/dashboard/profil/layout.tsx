import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mon Profil',
  description: 'Gérez vos informations personnelles sur votre compte AfricaNet.',
  robots: { index: false, follow: false },
}

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return children
}
