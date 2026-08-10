import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mes Commandes',
  description: 'Suivez l\'état de vos commandes AfricaNet en temps réel.',
  robots: { index: false, follow: false },
}

export default function CommandesLayout({ children }: { children: React.ReactNode }) {
  return children
}
