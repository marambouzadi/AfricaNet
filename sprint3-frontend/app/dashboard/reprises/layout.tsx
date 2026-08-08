import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mes Reprises',
  description: 'Consultez l\'historique et le statut de vos demandes de reprise AfricaNet.',
  robots: { index: false, follow: false },
}

export default function ReprisesLayout({ children }: { children: React.ReactNode }) {
  return children
}
