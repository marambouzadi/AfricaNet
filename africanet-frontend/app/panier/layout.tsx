import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mon Panier',
  description: 'Consultez et gérez les articles de votre panier AfricaNet avant de passer commande.',
  robots: { index: false, follow: false },
}

export default function PanierLayout({ children }: { children: React.ReactNode }) {
  return children
}
