import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Paramètres',
  description: 'Configurez les paramètres de votre compte AfricaNet.',
  robots: { index: false, follow: false },
}

export default function ParametresLayout({ children }: { children: React.ReactNode }) {
  return children
}
