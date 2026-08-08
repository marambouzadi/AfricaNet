import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l\'équipe AfricaNet pour toute question sur nos produits, services de reprise ou assistance technique en Tunisie.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
